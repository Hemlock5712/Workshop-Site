// Every Way Out Stops. DriveToTagInline as the /drive-to-tag-inline page writes it (the
// page is ground truth; 7-InlineCommands is behind): one coroutine loop that reads the
// robot's pose in the tag's frame, drives three profiled controllers, and yields.
//
// What is simulated, and how:
//   the camera    a frame every loop while it can see the tag. Covered, the getters keep
//                 returning the last frame, and hasTarget() goes false a quarter second
//                 after the newest one, so readRobotInTag returns null from then on.
//   the command   the page's loop, step by step on 20 ms loops: null -> stop, tracking =
//                 false, waitUntil(..., 1 s) -> timed out: return. First sighting resets
//                 each profile at the measured value. Each speed = calculate(...) +
//                 getSetpoint().velocity, every gain 0.0, so the profile does the whole
//                 job. break when all three atGoal(). Canceled: whenCanceled sends the stop.
//   the drive     ApplyRobotVelocity(-forward, -sideways, turn), followed with a short lag.
// The tag faces down the field from the blue wall, so its frame is the field's frame moved
// to the tag: X out of its face, Y to its left. Facing the tag is yaw = pi, on the seam.

import {
  C,
  MONO,
  SERIF,
  W,
  H,
  alpha,
  applyCamera,
  background,
  camera,
  clamp,
  cues,
  easeInOut,
  easeOut,
  lerp,
  micro,
  ramp,
  rrect,
  text,
  vignette,
  window_,
} from "../../engine/core.js";
import {
  codeLine,
  drawField,
  drawPlot,
  drawSwerveRobot,
  panel,
  swerveModules,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const FIELD = { x: 40, y: 40, w: 900, h: 470 };
const VIEW = { x0: -0.6, y0: 1.9, x1: 5.0, y1: 6.9 };
const PLOTS = { x: 40, y: 530, w: 900, h: 190 };
const CARD = { x: 40, y: 740, w: 560, h: 140 };
const CAM = { x: 620, y: 740, w: 320, h: 140 };
const CODE = { x: 980, y: 40, w: 900, h: 840 };
const CODE_SIZE = 17;
const LH = 21.5;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const D2R = Math.PI / 180;
const LOOP = 0.02;
const DT = 1 / 480;
const SR = 240;
const TAG = { x: 0, y: 4.0 }; // tag 1, on the blue wall, facing down the field
const TAG4 = { x: 0, y: 6.1 };
const STANDOFF = 1.0;
const START = { x: 3.4, y: 4.9, theta: 166 * D2R };
const TOL = { d: 0.03, l: 0.03, h: 2 * D2R };
const LIN = { v: 2.5, a: 3.0 };
const ROT = { v: Math.PI, a: 2 * Math.PI };
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// one 20 ms step of a trapezoid setpoint toward a goal at rest
function stepProfile(sp, goal, c, dt) {
  const d = goal - sp.p;
  if (Math.abs(d) < 1e-4 && Math.abs(sp.v) < 1e-3) {
    sp.p = goal;
    sp.v = 0;
    return;
  }
  const dir = Math.sign(d);
  const stop = (sp.v * sp.v) / (2 * c.a);
  let a;
  if (Math.sign(sp.v) === dir && Math.abs(d) <= stop + Math.abs(sp.v) * dt)
    a = -Math.sign(sp.v) * c.a;
  else if (Math.abs(sp.v) < c.v - 1e-9 || Math.sign(sp.v) !== dir)
    a = dir * c.a;
  else a = 0;
  const v0 = sp.v;
  sp.v = clamp(sp.v + a * dt, -c.v, c.v);
  if (
    a !== 0 &&
    Math.sign(v0) !== 0 &&
    Math.sign(sp.v) !== Math.sign(v0) &&
    Math.sign(v0) !== dir
  )
    sp.v = 0;
  sp.p += ((v0 + sp.v) / 2) * dt;
  if (Math.sign(goal - sp.p) !== dir && Math.abs(sp.v) < c.a * dt * 1.5) {
    sp.p = goal;
    sp.v = 0;
  }
}

const fresh = () => ({
  u: 0,
  ...START,
  vx: 0,
  vy: 0,
  w: 0,
  held: false,
  covered: false,
  lastFrame: -9,
  frame: null, // the newest frame's robot-in-tag pose
  active: false,
  tracking: false,
  waiting: false,
  waitStart: 0,
  ended: null, // "arrived" | "gave up" | "canceled"
  endedAt: -1,
  startedAt: -1,
  pc: null, // "read" | "drive" | "yield" | "wait" | "reset"
  req: null,
  kind: "none",
  sp: { d: { p: 0, v: 0 }, l: { p: 0, v: 0 }, h: { p: 0, v: 0 } },
  resets: [],
  acc: 0,
});

const inTag = (s) => ({ x: s.x - TAG.x, y: s.y - TAG.y, yaw: s.theta });
const hasTarget = (s) => s.u - s.lastFrame < 0.25;
const read = (s) => (hasTarget(s) ? s.frame : null);

function stop(s) {
  s.req = { vx: 0, vy: 0, w: 0 };
  s.kind = "zero";
}

function robotLoop(s) {
  // the camera: a frame a loop while it can see the tag
  if (!s.covered) {
    s.lastFrame = s.u;
    s.frame = inTag(s);
  }
  if (s.held && !s.active && !s.ended) {
    s.active = true;
    s.tracking = false;
    s.waiting = false;
    s.startedAt = s.u;
  }
  if (!s.held && s.active) {
    // canceled: the body is dropped where it stands; whenCanceled sends the stop
    s.active = false;
    s.ended = "canceled";
    s.endedAt = s.u;
    s.pc = "canceled";
    stop(s);
    return;
  }
  if (!s.held && s.ended) s.ended = null;
  if (!s.active) return;
  if (s.waiting) {
    if (read(s))
      s.waiting = false; // waitUntil returns; continue
    else if (s.u - s.waitStart >= 1.0 - 1e-9) {
      s.waiting = false;
      s.active = false;
      s.ended = "gave up";
      s.endedAt = s.u;
      s.pc = "return";
      return;
    } else {
      s.pc = "wait";
      return;
    }
  }
  const m = read(s);
  if (!m) {
    stop(s);
    s.tracking = false;
    s.waiting = true;
    s.waitStart = s.u;
    s.pc = "wait";
    return;
  }
  s.pc = "drive";
  if (!s.tracking) {
    s.sp.d = { p: m.x, v: 0 };
    s.sp.l = { p: m.y, v: 0 };
    s.sp.h = { p: m.yaw, v: 0 };
    s.tracking = true;
    s.resets.push(s.u);
    s.pc = "reset";
  }
  // heading wraps: keep the setpoint and the goal on the measurement's side
  s.sp.h.p += TAU * Math.round((m.yaw - s.sp.h.p) / TAU);
  const hGoal = m.yaw + wrap(Math.PI - m.yaw);
  stepProfile(s.sp.d, STANDOFF, LIN, LOOP);
  stepProfile(s.sp.l, 0, LIN, LOOP);
  stepProfile(s.sp.h, hGoal, ROT, LOOP);
  // every gain ships at 0.0: calculate() adds nothing, the profile's velocity is the speed
  const forward = 0 * (STANDOFF - m.x) + s.sp.d.v;
  const sideways = 0 * (0 - m.y) + s.sp.l.v;
  const turn = 0 * wrap(Math.PI - m.yaw) + s.sp.h.v;
  s.req = { vx: -forward, vy: -sideways, w: turn };
  s.kind = "drive";
  const at =
    Math.abs(m.x - s.sp.d.p) < TOL.d &&
    s.sp.d.p === STANDOFF &&
    Math.abs(m.y - s.sp.l.p) < TOL.l &&
    s.sp.l.p === 0 &&
    Math.abs(wrap(m.yaw - s.sp.h.p)) < TOL.h &&
    Math.abs(wrap(s.sp.h.p - Math.PI)) < 1e-6;
  if (at) {
    s.active = false;
    s.ended = "arrived";
    s.endedAt = s.u;
    s.pc = "break";
    stop(s);
  }
}

function stepDrive(s, dt) {
  let tx = 0;
  let ty = 0;
  let tw = 0;
  if (s.req) {
    const c = Math.cos(s.theta);
    const sn = Math.sin(s.theta);
    tx = s.req.vx * c - s.req.vy * sn;
    ty = s.req.vx * sn + s.req.vy * c;
    tw = s.req.w;
  }
  const k = 1 - Math.exp(-dt / 0.05);
  s.vx += (tx - s.vx) * k;
  s.vy += (ty - s.vy) * k;
  s.w += (tw - s.w) * k;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  s.theta = wrap(s.theta + s.w * dt);
}

function step(s, dt) {
  const n = Math.max(1, Math.round(dt / DT));
  for (let i = 0; i < n; i++) {
    s.acc += DT;
    if (s.acc >= LOOP - 1e-9) {
      s.acc -= LOOP;
      robotLoop(s);
    }
    stepDrive(s, DT);
    s.u += DT;
  }
}

const snap = (s) => ({
  ...s,
  sp: { d: { ...s.sp.d }, l: { ...s.sp.l }, h: { ...s.sp.h } },
  req: s.req && { ...s.req },
  frame: s.frame && { ...s.frame },
  resets: [...s.resets],
});

function simulate(events, dur) {
  const s = fresh();
  const out = [];
  let e = 0;
  for (let i = 0; i <= dur * SR; i++) {
    while (s.u < i / SR - 1e-9) {
      while (e < events.length && events[e].u <= s.u) events[e++].do(s);
      step(s, DT);
    }
    out.push(snap(s));
  }
  return out;
}
const sampleAt = (run, u) => run[clamp(Math.floor(u * SR), 0, run.length - 1)];

function mapKeys(keys, t) {
  if (t <= keys[0][0]) return { u: keys[0][1], rate: 0 };
  for (let i = 1; i < keys.length; i++) {
    const [ta, ua] = keys[i - 1];
    const [tb, ub] = keys[i];
    if (t <= tb)
      return {
        u: ua + ((ub - ua) * (t - ta)) / (tb - ta),
        rate: (ub - ua) / (tb - ta),
      };
  }
  return { u: keys.at(-1)[1], rate: 0 };
}

// ---- the code on screen (the page's, trimmed) ---------------------------------------

const HELPER = [
  "private static Pose3d readRobotInTag(Limelight camera, int targetTagId) {",
  "  if (!camera.hasTarget()) {",
  "    return null;",
  "  }",
  "  for (FiducialTarget tag : camera.getLatestResults().fiducialTargets) {",
  "    if (tag.fiducialId == targetTagId) {",
  "      return tag.getRobotPose_TargetSpace();",
  "    }",
  "  }",
  "  return null;",
  "}",
];
const SETUP = [
  "ProfiledPIDController distance =",
  "    new ProfiledPIDController(",
  "        0.0, 0.0, 0.0, new TrapezoidProfile.Constraints(2.5, 3.0));",
  "ProfiledPIDController lateral =",
  "    new ProfiledPIDController(",
  "        0.0, 0.0, 0.0, new TrapezoidProfile.Constraints(2.5, 3.0));",
  "ProfiledPIDController heading =",
  "    new ProfiledPIDController(",
  "        0.0, 0.0, 0.0, new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));",
  "",
  "SwerveRequest.ApplyRobotVelocity driveRequest =",
  "    new SwerveRequest.ApplyRobotVelocity()",
  "        .withDriveRequestType(DriveRequestType.OpenLoopVoltage);",
  "",
  "heading.enableContinuousInput(-Math.PI, Math.PI);",
  "distance.setTolerance(0.03); // meters",
  "lateral.setTolerance(0.03); // meters",
  "heading.setTolerance(Math.toRadians(2.0)); // radians",
];
// the loop: [text, role]. Roles light up as the coroutine walks it.
const LOOPC = [
  ["return drivetrain", ""],
  ["    .run(", ""],
  ["        coroutine -> {", ""],
  ["          boolean tracking = false;", ""],
  ["          while (true) {", "top"],
  [
    "            Pose3d robotInTag = readRobotInTag(camera, targetTagId);",
    "read",
  ],
  ["            if (robotInTag == null) {", "null"],
  ["              stop(drivetrain, driveRequest);", "nullstop"],
  ["              tracking = false;", "null"],
  ["              if (coroutine", "wait"],
  ["                  .waitUntil(", "wait"],
  [
    "                      () -> readRobotInTag(camera, targetTagId) != null,",
    "wait",
  ],
  ["                      Seconds.of(1.0))", "wait"],
  ["                  .timedOut()) {", "wait"],
  ["                return;", "return"],
  ["              }", ""],
  ["              continue;", "cont"],
  ["            }", ""],
  ["            if (!tracking) {", "reset"],
  ["              distance.reset(robotInTag.getX());", "reset"],
  ["              lateral.reset(robotInTag.getY());", "reset"],
  ["              heading.reset(robotInTag.getRotation().getZ());", "reset"],
  ["              tracking = true;", "reset"],
  ["            }", ""],
  ["            double forward =", "drive"],
  [
    "                distance.calculate(robotInTag.getX(), standoffMeters)",
    "drive",
  ],
  ["                    + distance.getSetpoint().velocity;", "drive"],
  [
    "            // sideways: lateral toward 0.0; turn: heading toward Math.PI",
    "drive",
  ],
  ["            drivetrain.setControl(", "drive"],
  ["                driveRequest.withVelocity(", "drive"],
  [
    "                    new ChassisVelocities(-forward, -sideways, turn)));",
    "drive",
  ],
  [
    "            if (distance.atGoal() && lateral.atGoal() && heading.atGoal()) {",
    "check",
  ],
  ["              break;", "break"],
  ["            }", ""],
  ["            coroutine.yield();", "yield"],
  ["          }", ""],
  ["          stop(drivetrain, driveRequest);", "endstop"],
  ["        })", ""],
  ["    .whenCanceled(() -> stop(drivetrain, driveRequest))", "cancel"],
  ['    .named("DriveToTagInline");', ""],
];

// ---- helpers ------------------------------------------------------------------------

function arrow(
  ctx,
  x0,
  y0,
  x1,
  y1,
  { color = C.accent, width = 3, head = 12 } = {}
) {
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(ang) * head * 0.6, y1 - Math.sin(ang) * head * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(
    x1 - Math.cos(ang - 0.42) * head,
    y1 - Math.sin(ang - 0.42) * head
  );
  ctx.lineTo(
    x1 - Math.cos(ang + 0.42) * head,
    y1 - Math.sin(ang + 0.42) * head
  );
  ctx.closePath();
  ctx.fill();
}

function drawTagMark(ctx, F, p, id, { lit = true, note = "" } = {}) {
  const [x, y] = F.P(p.x, p.y);
  const h = 0.165 * F.s;
  ctx.fillStyle = lit ? C.tx : C.tx3;
  ctx.fillRect(x - 6, y - h, 12, 2 * h);
  ctx.fillStyle = C.bg;
  ctx.fillRect(x - 2, y - h + 5, 4, h * 0.6);
  ctx.fillRect(x - 2, y + 3, 4, h * 0.5);
  text(ctx, `ID ${id}`, x + 14, y - h - 4, {
    font: MONO,
    size: 17,
    weight: 600,
    color: lit ? C.tx : C.tx3,
  });
  if (note)
    text(ctx, note, x + 14, y + h + 22, { font: MONO, size: 17, color: C.tx3 });
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const PRESS = 0.3;
  const COVER = 1.0;
  const MAIN = simulate([{ u: PRESS, do: (s) => (s.held = true) }], 4.5);
  const LOST = simulate(
    [
      { u: PRESS, do: (s) => (s.held = true) },
      { u: COVER, do: (s) => (s.covered = true) },
    ],
    4.5
  );
  const RE = simulate(
    [
      { u: PRESS, do: (s) => (s.held = true) },
      { u: COVER, do: (s) => (s.covered = true) },
      { u: COVER + 0.75, do: (s) => (s.covered = false) },
    ],
    5.5
  );
  const arrived = (run) =>
    (run.find((s) => s.ended === "arrived") ?? run.at(-1)).u;
  const gaveUp = (LOST.find((s) => s.ended === "gave up") ?? LOST.at(-1)).u;
  const nulled = (
    LOST.find((s, i) => i > COVER * SR && s.waiting) ?? LOST.at(-1)
  ).u;
  const reAt = (RE.find((s) => s.resets.length > 1) ?? RE.at(-1)).u;

  const g0 = gate?.t0 ?? 1e9;
  const g1 = gate?.t1 ?? 1e9;
  const segs = [
    {
      t0: 0,
      t1: L("connect").t0 - 0.2,
      run: MAIN,
      keys: [
        [L("intro").t0 + 0.4, PRESS],
        [L("intro").t1 + 0.3, arrived(MAIN) + 0.3],
      ],
    },
    {
      t0: L("connect").t0 - 0.2,
      t1: L("loop").t0 - 0.2,
      run: MAIN,
      keys: [[0, 0.2]],
    },
    {
      t0: L("loop").t0 - 0.2,
      t1: L("lost").t0 - 0.2,
      run: MAIN,
      keys: [
        [L("loop").t0, PRESS + 0.02],
        [L("loop").t1, PRESS + 0.16],
      ],
    },
    {
      t0: L("lost").t0 - 0.2,
      t1: L("tryit").t0,
      run: LOST,
      keys: [
        [L("lost").t0, COVER - 0.25],
        [Wd("lost", "stops,"), nulled + 0.02],
        [Wd("lost", "gives"), nulled + 0.9],
        [L("lost").t1, gaveUp + 0.1],
      ],
    },
    { t0: L("tryit").t0, t1: g0, run: RE, keys: [[0, 0.2]] },
    {
      t0: g0,
      t1: g1,
      run: RE,
      keys: [
        [g0 + 0.3, PRESS],
        [g0 + 1.4, COVER + 0.2],
        [g0 + 3.6, reAt + 0.3],
        [g1 - 0.2, arrived(RE) + 0.2],
      ],
    },
    {
      t0: g1,
      t1: L("exits").t0 - 0.2,
      run: RE,
      keys: [
        [L("reacquire").t0, reAt - 0.12],
        [L("reacquire").t1, reAt + 0.5],
      ],
    },
    {
      t0: L("exits").t0 - 0.2,
      t1: VOICE.duration + 1,
      run: MAIN,
      keys: [
        [L("exits").t0, arrived(MAIN) - 0.6],
        [Wd("exits", "arrives,"), arrived(MAIN) + 0.1],
      ],
    },
  ];
  function viewAt(t) {
    const seg = segs.find((g) => t >= g.t0 && t < g.t1) ?? segs[0];
    const { u, rate } = mapKeys(seg.keys, t);
    return { s: sampleAt(seg.run, u), seg, rate, run: seg.run };
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 470, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("frame").t0 - 0.2, x: 900, y: 330, z: 1.15, d: 1.2 },
    { t: L("three").t0 - 0.2, x: 1430, y: 260, z: 1.45, d: 1.2 },
    { t: L("face").t0 - 0.2, x: 480, y: 300, z: 1.4, d: 1.2 },
    { t: L("loop").t0 - 0.2, x: 1300, y: 470, z: 1.05, d: 1.2 },
    { t: L("tryit").t0 - 0.2, ...FULL, d: 1.0 },
    { t: L("reacquire").t0 - 0.2, x: 700, y: 480, z: 1.12, d: 1.0 },
    { t: L("exits").t0 - 0.2, x: 960, y: 505, z: 1.0, d: 1.0 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawFieldPanel(ctx, t, V, live) {
    const s = live ?? V.s;
    const F = drawField(ctx, FIELD, { view: VIEW, labels: false, axes: false });
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    // the wall and the tags
    ctx.fillStyle = C.bg3;
    const [wx0, wy0] = F.P(-0.25, 7);
    const [wx1, wy1] = F.P(0, 1.5);
    ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    const idCheck =
      !live && t >= Wd("frame", "pick") - 0.2 && t < L("three").t0;
    drawTagMark(ctx, F, TAG, 1, { note: "ours" });
    drawTagMark(ctx, F, TAG4, 4, {
      lit: false,
      note: idCheck ? "ignored" : "",
    });
    // the tag's own frame on the floor
    const fa = live ? 0.6 : t >= L("frame").t0 - 0.2 ? 1 : 0.6;
    const [tx, ty] = F.P(TAG.x, TAG.y);
    ctx.save();
    ctx.globalAlpha = fa;
    arrow(ctx, tx, ty, tx + 1.3 * F.s, ty, { color: C.accent, width: 3 });
    arrow(ctx, tx, ty, tx, ty - 1.3 * F.s, { color: C.accent, width: 3 });
    text(ctx, "X · out of the face", tx + 1.3 * F.s - 60, ty + 26, {
      font: MONO,
      size: 16,
      weight: 600,
      color: C.accent,
    });
    text(ctx, "Y · tag's left", tx + 10, ty - 1.3 * F.s - 8, {
      font: MONO,
      size: 16,
      weight: 600,
      color: C.accent,
    });
    ctx.restore();
    // standoff and centerline
    ctx.strokeStyle = alpha(C.tx3, 0.8);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(...F.P(STANDOFF, 2.6));
    ctx.lineTo(...F.P(STANDOFF, 5.4));
    ctx.moveTo(...F.P(0, TAG.y));
    ctx.lineTo(...F.P(4.8, TAG.y));
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "standoff 1.0 m", ...F.P(STANDOFF + 0.08, 2.75), {
      font: MONO,
      size: 16,
      color: C.tx3,
    });
    drawSwerveRobot(
      ctx,
      F,
      { x: STANDOFF, y: TAG.y, theta: Math.PI },
      { ghost: true, color: alpha(C.tx2, 0.7) }
    );
    // camera cone off the robot's front
    const [rx, ry] = F.P(s.x, s.y);
    const fx = rx + Math.cos(s.theta) * 0.42 * F.s;
    const fy = ry - Math.sin(s.theta) * 0.42 * F.s;
    const sees = !s.covered;
    ctx.fillStyle = sees ? alpha(C.accent, 0.08) : alpha(C.err, 0.06);
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.arc(fx, fy, 3.5 * F.s, -s.theta - 0.5, -s.theta + 0.5);
    ctx.closePath();
    ctx.fill();
    if (sees && !live && t < L("exits").t0) {
      ctx.strokeStyle = alpha(C.accent, 0.35);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // trail
    if (!live && V.run && s.startedAt >= 0) {
      ctx.fillStyle = alpha(C.accent, 0.45);
      for (let u = s.startedAt; u < s.u; u += 0.04) {
        const p = sampleAt(V.run, u);
        const [px, py] = F.P(p.x, p.y);
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
    const c = Math.cos(-s.theta);
    const sn = Math.sin(-s.theta);
    drawSwerveRobot(ctx, F, s, {
      modules: swerveModules(s.vx * c - s.vy * sn, s.vx * sn + s.vy * c, s.w),
      maxSpeed: 2.6,
    });
    if (s.covered) {
      ctx.fillStyle = C.err;
      rrect(ctx, fx - 16, fy - 16, 32, 32, 8);
      ctx.fill();
      text(ctx, "covered", fx + 22, fy - 20, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.err,
      });
    }
    // where the robot is, in the tag's frame
    const m = inTag(s);
    const faceOn = !live && t >= L("face").t0 - 0.4 && t < L("loop").t0;
    if (!faceOn) rrect(ctx, rx + 54, ry + 30, 300, 40, 4);
    ctx.fillStyle = alpha(C.bg, 0.86);
    if (!faceOn) ctx.fill();
    if (!faceOn)
      text(
        ctx,
        `x ${m.x.toFixed(2)}  y ${m.y.toFixed(2)}  yaw ${(wrap(m.yaw) / D2R) | 0}°`,
        rx + 66,
        ry + 57,
        { font: MONO, size: 18, weight: 600, color: C.tx }
      );
    ctx.restore();
    if (!live && V.rate > 0 && V.rate < 0.95)
      text(
        ctx,
        `robot clock · slow motion ×${V.rate.toFixed(2)}`,
        FIELD.x + FIELD.w - 16,
        FIELD.y + 30,
        { font: MONO, size: 18, weight: 600, align: "right", color: C.accent }
      );
    if (!live) drawFace(ctx, t, s);
    if (!live) drawConnect(ctx, t);
  }

  // facing the tag is yaw = pi, right on the seam
  function drawFace(ctx, t, s) {
    const a = window_(t, L("face").t0 - 0.2, L("loop").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 610, y: 60, w: 310, h: 300 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = alpha(C.bg2, 0.97);
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    micro(ctx, "yaw in the tag's frame", R.x + 18, R.y + 32, { size: 16 });
    const cx = R.x + R.w / 2;
    const cy = R.y + 160;
    const r = 90;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = C.tx3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx - r - 18, cy);
    ctx.lineTo(cx - r + 18, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "0", cx + r + 10, cy + 6, { font: MONO, size: 16, color: C.tx3 });
    // goal on the seam
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - r + 6, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "goal π", cx - r + 4, cy - 14, {
      font: MONO,
      size: 17,
      weight: 600,
      color: C.accent,
    });
    // the robot's yaw swings onto it
    const k = easeInOut(ramp(t, Wd("face", "half") - 0.2, 1.2));
    const yaw = lerp(s.theta, Math.PI, k);
    ctx.strokeStyle = C.tx;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(yaw) * (r - 10), cy - Math.sin(yaw) * (r - 10));
    ctx.stroke();
    text(ctx, "forward = −X, left = −Y", cx, R.y + R.h - 18, {
      font: MONO,
      size: 16,
      align: "center",
      color: C.tx2,
      a: clamp((t - Wd("face", "faces") + 0.2) / 0.4),
    });
    ctx.restore();
  }

  // drive to point needed a field pose; this needs only the tag
  function drawConnect(ctx, t) {
    const a = window_(t, L("connect").t0 - 0.2, L("frame").t0, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 470, y: 330, w: 450, h: 160 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = alpha(C.bg2, 0.97);
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    micro(ctx, "drive to point", R.x + 20, R.y + 36, { size: 16 });
    text(ctx, "getPose() · field, blue origin", R.x + 20, R.y + 66, {
      font: MONO,
      size: 18,
      color: C.tx3,
    });
    micro(ctx, "drive to tag", R.x + 20, R.y + 106, {
      size: 16,
      color: C.accent,
    });
    text(ctx, "the camera · tag 1's frame", R.x + 20, R.y + 136, {
      font: MONO,
      size: 18,
      weight: 600,
      color: C.accent,
      a: clamp((t - Wd("connect", "tag.")) / 0.4 + 0.3),
    });
    ctx.restore();
  }

  // which code is up and which lines are lit
  function codeView(t, s, live) {
    if (!live && t < L("three").t0 - 0.2)
      return {
        lines: HELPER.map((l) => [l, ""]),
        file: "readRobotInTag(...) · the page",
        hot:
          t >= Wd("frame", "pick") - 0.2
            ? [5, 6]
            : t >= L("frame").t0
              ? [0, 1]
              : [],
      };
    if (!live && t < L("loop").t0 - 0.2)
      return {
        lines: SETUP.map((l) => [l, ""]),
        file: "create(...) · the setup",
        hot: t >= L("face").t0 - 0.2 ? [14] : [0, 1, 2, 3, 4, 5, 6, 7, 8],
      };
    const roles = new Set();
    const pc = s.pc;
    if (s.active || pc) {
      if (pc === "drive")
        ["read", "drive", "check", "yield"].forEach((r) => roles.add(r));
      if (pc === "reset")
        ["read", "reset", "drive", "yield"].forEach((r) => roles.add(r));
      if (pc === "wait")
        ["null", "nullstop", "wait"].forEach((r) => roles.add(r));
      if (pc === "return" && s.ended === "gave up")
        ["return"].forEach((r) => roles.add(r));
      if (pc === "break" && s.ended === "arrived")
        ["break", "endstop"].forEach((r) => roles.add(r));
      if (pc === "canceled") roles.add("cancel");
    }
    // on the loop line, walk read / drive / yield one at a time
    if (!live && t >= L("loop").t0 && t < L("lost").t0 - 0.2) {
      roles.clear();
      const words = [
        [Wd("loop", "read"), "read"],
        [Wd("loop", "drive,"), "drive"],
        [Wd("loop", "yield,"), "yield"],
        [Wd("loop", "repeat."), "top"],
      ];
      let cur = null;
      for (const [at, r] of words) if (t >= at) cur = r;
      if (t >= Wd("loop", "shape"))
        cur = ["read", "drive", "yield"][Math.floor((t * 2.5) % 3)];
      if (cur) roles.add(cur);
    }
    if (
      !live &&
      t >= Wd("exits", "arrives,") - 0.2 &&
      t < L("close").t0 + 0.5
    ) {
      roles.clear();
      roles.add("break").add("endstop");
      if (t >= Wd("exits", "gives") - 0.2) roles.add("return").add("nullstop");
      if (t >= Wd("exits", "canceled.") - 0.2) roles.add("cancel");
    }
    return { lines: LOOPC, file: "create(...) · the loop", roles, hot: [] };
  }

  function drawCode(ctx, t, s, live) {
    panel(ctx, CODE);
    const cv = codeView(t, s, live);
    micro(ctx, cv.file, CODE.x + 24, CODE.y + 38, { size: 16 });
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 56, CODE.w, 1);
    const size = cv.lines === LOOPC ? 16 : CODE_SIZE;
    const lh = cv.lines === LOOPC ? 18.5 : 26;
    let waitY = 0;
    let y = CODE.y + (cv.lines === LOOPC ? 82 : 88);
    const anyHot = cv.hot.length || (cv.roles && cv.roles.size);
    cv.lines.forEach(([ln, role], i) => {
      if (!ln) {
        y += lh / 2;
        return;
      }
      const hot =
        cv.hot.includes(i) || (cv.roles && role && cv.roles.has(role));
      const bad = hot && (role === "return" || role === "cancel");
      if (hot) {
        ctx.fillStyle = bad ? alpha(C.err, 0.14) : alpha(C.accent, 0.13);
        ctx.fillRect(CODE.x + 1, y - lh + 5, CODE.w - 2, lh);
        ctx.fillStyle = bad ? C.err : C.accent;
        ctx.fillRect(CODE.x + 1, y - lh + 5, 4, lh);
      }
      // the bounded wait: dashed while it waits
      if (
        role === "wait" &&
        cv.roles?.has("wait") &&
        ln.includes(".waitUntil(")
      ) {
        ctx.strokeStyle = C.accent;
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(CODE.x + 12, y - lh + 5, CODE.w - 24, lh * 4);
        ctx.setLineDash([]);
      }
      if (ln.includes("Seconds.of(1.0))")) waitY = y;
      codeLine(ctx, ln, CODE.x + 20, y, { size, a: anyHot && !hot ? 0.55 : 1 });
      // stops: every way out sends one
      if (role === "nullstop" || role === "endstop" || role === "cancel") {
        const on = !!(cv.roles && cv.roles.has(role));
        text(ctx, "→ stop", CODE.x + CODE.w - 20, y, {
          font: MONO,
          size: 16,
          weight: 600,
          align: "right",
          color: on ? C.accent : C.tx3,
        });
      }
      y += lh;
    });
    // the one-second budget under the wait
    if (
      cv.lines === LOOPC &&
      (s.waiting || s.pc === "wait" || s.ended === "gave up")
    ) {
      const used = s.ended === "gave up" ? 1 : clamp(s.u - s.waitStart, 0, 1);
      const bx = CODE.x + 400;
      const by = waitY - 10;
      ctx.fillStyle = alpha(C.tx3, 0.3);
      ctx.fillRect(bx, by, 260, 6);
      ctx.fillStyle = s.ended === "gave up" ? C.err : C.accent;
      ctx.fillRect(bx, by, 260 * used, 6);
      text(
        ctx,
        s.ended === "gave up" ? "timed out" : `${used.toFixed(2)} of 1.0 s`,
        bx + 276,
        by + 8,
        {
          font: MONO,
          size: 16,
          weight: 600,
          color: s.ended === "gave up" ? C.err : C.tx2,
        }
      );
    }
  }

  // three profiles: the setpoint each one plans, reset on every fresh sighting
  function drawProfiles(ctx, t, V, live) {
    const s = live ?? V.s;
    const axes = [
      {
        k: "d",
        name: "distance · X",
        goal: STANDOFF,
        v0: 0.6,
        v1: 3.6,
        fmt: (v) => v.toFixed(2),
      },
      {
        k: "l",
        name: "sideways · Y",
        goal: 0,
        v0: -0.2,
        v1: 1.1,
        fmt: (v) => v.toFixed(2),
      },
      {
        k: "h",
        name: "square · yaw",
        goal: Math.PI,
        v0: 150 * D2R,
        v1: 195 * D2R,
        fmt: (v) => `${(wrap(v) / D2R) | 0}°`,
      },
    ];
    const w = (PLOTS.w - 20) / 3;
    axes.forEach((ax, i) => {
      const R = { x: PLOTS.x + i * (w + 10), y: PLOTS.y, w, h: PLOTS.h };
      const pts = [];
      const meas = [];
      let start = s.startedAt;
      if (!live && V.run && start >= 0) {
        for (let u = start; u <= s.u; u += 0.02) {
          const q = sampleAt(V.run, u);
          if (!q.tracking) {
            pts.push(null);
            continue;
          }
          let v = q.sp[ax.k].p;
          if (ax.k === "h") v = Math.PI + wrap(v - Math.PI);
          pts.push([u - start, v]);
          const m = inTag(q);
          meas.push([
            u - start,
            ax.k === "d"
              ? m.x
              : ax.k === "l"
                ? m.y
                : Math.PI + wrap(m.yaw - Math.PI),
          ]);
        }
      }
      if (live) {
        for (const h of live.hist) {
          if (!h) {
            pts.push(null);
            continue;
          }
          let v = h[ax.k];
          if (ax.k === "h") v = Math.PI + wrap(v - Math.PI);
          pts.push([h.u, v]);
        }
      }
      // split at resets so a fresh profile starts a new segment
      const series = [];
      let cur = [];
      for (const p of pts) {
        if (!p) {
          if (cur.length) series.push({ pts: cur, color: C.accent, width: 3 });
          cur = [];
        } else cur.push(p);
      }
      if (cur.length) series.push({ pts: cur, color: C.accent, width: 3 });
      const P = drawPlot(ctx, R, {
        title: ax.name,
        t0: 0,
        t1: 4.5,
        v0: ax.v0,
        v1: ax.v1,
        series,
      });
      ctx.strokeStyle = alpha(C.tx3, 0.8);
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(P.X(0), P.Y(ax.goal));
      ctx.lineTo(P.X(4.5), P.Y(ax.goal));
      ctx.stroke();
      ctx.setLineDash([]);
      text(
        ctx,
        `goal ${ax.k === "h" ? "π" : ax.fmt(ax.goal)}`,
        R.x + R.w - 16,
        P.Y(ax.goal) - 6,
        { font: MONO, size: 16, align: "right", color: C.tx3 }
      );
    });
    if (
      !live &&
      s.resets &&
      s.resets.length > 1 &&
      t >= L("reacquire").t0 - 0.2 &&
      t < L("exits").t0
    )
      text(
        ctx,
        "fresh profile, from rest",
        PLOTS.x + PLOTS.w / 2,
        PLOTS.y + PLOTS.h + 4,
        { font: MONO, size: 18, weight: 600, align: "center", color: C.accent }
      );
  }

  function drawCard(ctx, t, s) {
    panel(ctx, CARD, C.bg2);
    micro(ctx, "DriveToTagInline", CARD.x + 22, CARD.y + 34);
    const st = s.active
      ? s.waiting || s.pc === "wait"
        ? "waiting for the tag"
        : "running"
      : s.ended
        ? `ended · ${s.ended}`
        : "not scheduled";
    text(ctx, st, CARD.x + CARD.w - 22, CARD.y + 35, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "right",
      color: s.active
        ? C.accent
        : s.ended === "arrived"
          ? C.accent
          : s.ended
            ? C.err
            : C.tx3,
    });
    const r = s.req;
    const name =
      s.kind === "drive"
        ? "ApplyRobotVelocity"
        : s.kind === "zero"
          ? "ApplyRobotVelocity · zero"
          : "none";
    text(ctx, name, CARD.x + 22, CARD.y + 82, {
      font: MONO,
      size: 24,
      weight: 600,
      color: s.kind === "none" ? C.tx3 : C.accent,
    });
    if (r)
      text(
        ctx,
        `vx ${r.vx.toFixed(2)}  vy ${r.vy.toFixed(2)}  ω ${r.w.toFixed(2)}`,
        CARD.x + 22,
        CARD.y + 118,
        { font: MONO, size: 19, color: C.tx2 }
      );
  }

  function drawCam(ctx, s) {
    panel(ctx, CAM, C.bg2);
    micro(ctx, 'camera · "limelight"', CAM.x + 20, CAM.y + 34, { size: 16 });
    const ht = s.u - s.lastFrame < 0.25;
    text(ctx, `hasTarget() ${ht}`, CAM.x + 20, CAM.y + 76, {
      font: MONO,
      size: 21,
      weight: 600,
      color: ht ? C.accent : C.err,
    });
    const age = Math.max(0, s.u - s.lastFrame);
    text(
      ctx,
      `newest frame ${(age * 1000).toFixed(0)} ms old`,
      CAM.x + 20,
      CAM.y + 112,
      { font: MONO, size: 17, color: age >= 0.25 ? C.err : C.tx2 }
    );
  }

  // three ways out, each sending a stop
  function exitsCard(ctx, t) {
    const a = window_(t, Wd("exits", "Three") - 0.1, L("close").t0 + 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const doors = [
      {
        at: Wd("exits", "arrives,"),
        title: "arrives",
        code: "break;",
        stop: "then stop(...)",
      },
      {
        at: Wd("exits", "gives"),
        title: "gives up",
        code: "return;",
        stop: "stop(...) came first",
      },
      {
        at: Wd("exits", "canceled."),
        title: "canceled",
        code: ".whenCanceled(...)",
        stop: "() -> stop(...)",
      },
    ];
    doors.forEach((d, i) => {
      const R = { x: 70 + i * 300, y: 70, w: 280, h: 230 };
      const k = easeOut(ramp(t, d.at - 0.2, 0.4));
      ctx.save();
      ctx.globalAlpha *= 0.35 + 0.65 * k;
      rrect(ctx, R.x, R.y, R.w, R.h, 5);
      ctx.fillStyle = alpha(C.bg2, 0.97);
      ctx.fill();
      ctx.strokeStyle = k > 0.5 ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      micro(ctx, `way out ${i + 1}`, R.x + 18, R.y + 32, { size: 16 });
      text(ctx, d.title, R.x + 18, R.y + 74, { size: 30, weight: 600 });
      text(ctx, d.code, R.x + 18, R.y + 118, {
        font: MONO,
        size: 18,
        color: C.tx,
      });
      text(ctx, "→ stop", R.x + 18, R.y + 168, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.accent,
      });
      text(ctx, d.stop, R.x + 18, R.y + 200, {
        font: MONO,
        size: 16,
        color: C.tx2,
      });
      ctx.restore();
    });
    ctx.restore();
  }

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("intro").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(
      ctx,
      "Workshop 6 · Example: Drive to Tag",
      W / 2,
      440 - 20 * (1 - k),
      { align: "center", a: k, color: C.accent }
    );
    text(ctx, "Every Way Out Stops", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  function closeCard(ctx, t) {
    const a = easeInOut(ramp(t, L("close").t0 + 0.1, 0.8));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    text(ctx, "One loop,", W / 2, 470, {
      font: SERIF,
      size: 92,
      align: "center",
    });
    text(ctx, "and a stop on every way out.", W / 2, 586, {
      font: SERIF,
      size: 92,
      align: "center",
      color: C.accent,
    });
    ctx.restore();
  }

  function drawPad(ctx, held) {
    // a small controller in the card row's corner is not worth the space; the state
    // card says whether X is held
    void ctx;
    void held;
  }

  function draw(ctx, t, live = null) {
    const V = live ? { s: live, seg: {}, rate: 0 } : viewAt(t);
    const s = live ?? V.s;
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawFieldPanel(ctx, t, V, live);
    drawProfiles(ctx, t, V, live);
    drawCard(ctx, t, s);
    drawCam(ctx, s);
    drawCode(ctx, t, s, live);
    drawPad(ctx, s.held);
    text(ctx, s.held ? "X held" : "X up", FIELD.x + 72, FIELD.y + 30, {
      font: MONO,
      size: 20,
      weight: 600,
      color: s.held ? C.accent : C.tx3,
    });
    if (!live) exitsCard(ctx, t);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate ---------------------------------------------------------------------

  function liveGate() {
    const s = { ...fresh(), time: gate.t0, hist: [] };
    s.held = true;
    let covers = 0;
    let doneAt = null;
    return {
      state: s,
      prompt: () => {
        if (doneAt != null)
          return s.ended === "gave up"
            ? "It gave up, stopped."
            : "There: square, one meter out.";
        if (s.covered)
          return s.waiting
            ? "Stopped. Waiting up to a second..."
            : "Covered. The last frame goes stale...";
        if (s.ended === "gave up") return "It gave up, stopped.";
        if (covers > 0 && s.resets.length > 1)
          return "Back: fresh profiles, no lurch.";
        return "Cover the camera (hold C).";
      },
      input(k, v) {
        if (k === "cover") {
          s.covered = v;
          if (v) covers++;
        }
      },
      step(dt) {
        const d = dt * 0.5;
        step(s, d);
        s.time += dt;
        if (s.active || s.ended)
          s.hist.push(
            s.tracking
              ? { u: s.u - s.startedAt, d: s.sp.d.p, l: s.sp.l.p, h: s.sp.h.p }
              : null
          );
        if (s.ended && doneAt == null && covers > 0) doneAt = s.time;
        // arrived before they covered it: go again from the start
        if (s.ended === "arrived" && covers === 0) {
          Object.assign(s, fresh(), { time: s.time, hist: [], held: false });
          s.held = true;
        }
        return doneAt !== null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (!gate || t < gate.t0 || t >= gate.t1) return null;
    if (t < g0 + 1.2) return "Cover the camera.";
    if (t < g0 + 3.0) return "Stopped. Waiting up to a second...";
    if (t < g0 + 6.0) return "Back inside the second: fresh profiles.";
    return "There: square, one meter out.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      { k: "cover", label: "Cover camera", key: "KeyC", kind: "hold" },
    ],
  };
}
