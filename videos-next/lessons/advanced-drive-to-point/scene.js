// Plan the Trip. DriveToPoint on 6-ProfiledToPoint: CTRE's LinearPath plans a straight
// trip (a trapezoid on distance, 2.5 m/s and 3.0 m/s², and one on heading), the plan's
// velocity drives, and three P controllers trim the gap to where the plan says the
// robot should be. It ends when the plan's clock runs out.
//
// What is simulated, and how:
//   the plan      closed-form trapezoid from the snapshot (pose + speed along the line)
//                 to the goal; under about 2.1 m it never reaches cruise (a triangle).
//   the command   every 20 ms: sent = plan velocity + kP * (plan pose - measured pose).
//                 isFinished() is the plan's clock. end() sends a zero ChassisVelocities.
//   the drive     clipped at 4.54 m/s, wheels follow with a 0.12 s lag, and the pose the
//                 command reads is 60 ms old with a centimeter of jitter. That latency is
//                 why a large gain weaves around the plan and a small one rides it.
// Each run is simulated once in robot time and mapped onto the narration with keys.

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
  drawController,
  drawField,
  drawPlot,
  drawSwerveRobot,
  panel,
  runBar,
  swerveModules,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const FIELD = { x: 40, y: 40, w: 900, h: 470 };
const VIEW = { x0: -0.3, y0: -0.3, x1: 8.0, y1: 4.0 };
const CODE = { x: 980, y: 40, w: 900, h: 470 };
const PLOT = { x: 40, y: 540, w: 900, h: 340 };
const CARD = { x: 980, y: 540, w: 560, h: 340 };
const PAD = { x: 1570, y: 600, s: 0.7 };
const CODE_SIZE = 19;
const LH = 27;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const D2R = Math.PI / 180;
const MAX_V = 4.54;
const CRUISE = 2.5;
const ACCEL = 3.0;
const TURN = { v: Math.PI, a: 2 * Math.PI };
const LOOP = 0.02;
const DT = 1 / 480;
const SR = 240;
const LAG = 0.15;
const DELAY = 1; // the newest pose, read once a loop
const START = { x: 6.6, y: 1.5, theta: 170 * D2R };
const GOAL = { x: 2.5, y: 2.4, theta: Math.PI };
const NEAR = { x: 5.1, y: 1.8, theta: Math.PI }; // a 1.5 m trip, for the triangle
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// A trapezoid from (0, v0) to (d, 0). Returns { T, at(t) -> { p, v, a } }.
function trapezoid(d, v0, vmax, a) {
  v0 = clamp(v0, 0, vmax);
  const full = (vmax * vmax - v0 * v0) / (2 * a) + (vmax * vmax) / (2 * a);
  let vp = vmax;
  let tc = 0;
  if (d >= full) tc = (d - full) / vmax;
  else vp = Math.sqrt((2 * a * d + v0 * v0) / 2);
  if (vp < v0) vp = v0; // already too fast: just slow down
  const ta = (vp - v0) / a;
  const td = vp / a;
  const pa = (v0 + vp) * 0.5 * ta;
  const pc = vp * tc;
  const T = ta + tc + td;
  const at = (t) => {
    if (t <= 0) return { p: 0, v: v0, a: a };
    if (t < ta) return { p: v0 * t + 0.5 * a * t * t, v: v0 + a * t, a };
    if (t < ta + tc) return { p: pa + vp * (t - ta), v: vp, a: 0 };
    if (t < T) {
      const u = t - ta - tc;
      return { p: pa + pc + vp * u - 0.5 * a * u * u, v: vp - a * u, a: -a };
    }
    return { p: d, v: 0, a: 0 };
  };
  return { T, at, ta, tc, td, vp };
}

// LinearPath: a straight line from the snapshot to the goal, distance and heading
// each on their own trapezoid. calculate(t) -> { pose, vel }.
function linearPath(start, startVel, goal) {
  const dx = goal.x - start.x;
  const dy = goal.y - start.y;
  const d = Math.hypot(dx, dy);
  const ux = d > 1e-9 ? dx / d : 1;
  const uy = d > 1e-9 ? dy / d : 0;
  const along = startVel.vx * ux + startVel.vy * uy;
  const lin = trapezoid(d, along, CRUISE, ACCEL);
  const dth = wrap(goal.theta - start.theta);
  const rot = trapezoid(Math.abs(dth), 0, TURN.v, TURN.a);
  const sg = Math.sign(dth) || 1;
  return {
    d,
    lin,
    T: Math.max(lin.T, rot.T),
    calc(t) {
      const l = lin.at(t);
      const r = rot.at(t);
      return {
        x: start.x + ux * l.p,
        y: start.y + uy * l.p,
        theta: wrap(start.theta + sg * r.p),
        vx: ux * l.v,
        vy: uy * l.v,
        w: sg * r.v,
        v: l.v,
      };
    },
    finished: (t) => t >= Math.max(lin.T, rot.T),
  };
}

const jitter = (u) =>
  0.008 * Math.sin(u * 37.1) + 0.005 * Math.sin(u * 91.7 + 1.3);

const fresh = (pose = START, vel = { vx: 0, vy: 0 }) => ({
  u: 0,
  ...pose,
  vx: vel.vx,
  vy: vel.vy,
  w: 0,
  held: false,
  cmd: null, // the DriveToPoint command while scheduled: { path, t0, goal }
  req: { vx: vel.vx, vy: vel.vy, w: 0 },
  kind: "driver",
  kp: 3,
  sp: null,
  ff: null,
  corr: null,
  meas: [],
  pipe: [],
  applied: { vx: vel.vx, vy: vel.vy, w: 0 },
  loopAcc: 0,
  ended: null, // why the last command ended
  endedAt: -1,
  drag: 0, // a hand holding it back, 0..1
  goal: { ...GOAL },
});

function robotLoop(s) {
  s.meas.push({
    x: s.x + jitter(s.u),
    y: s.y + jitter(s.u + 7),
    theta: s.theta,
  });
  if (s.meas.length > 8) s.meas.shift();
  const m = s.meas[Math.max(0, s.meas.length - DELAY)];
  if (s.held && !s.cmd && s.ended !== "clock") {
    // initialize(): the snapshot and the clock
    s.cmd = {
      path: linearPath(
        { x: s.x, y: s.y, theta: s.theta },
        { vx: s.vx, vy: s.vy },
        s.goal
      ),
      t0: s.u,
      start: { x: s.x, y: s.y, theta: s.theta, vx: s.vx, vy: s.vy },
    };
    s.ended = null;
  }
  if (s.cmd) {
    const t = s.u - s.cmd.t0;
    const sp = s.cmd.path.calc(t);
    s.sp = sp;
    s.ff = { vx: sp.vx, vy: sp.vy, w: sp.w };
    s.corr = {
      vx: s.kp * (sp.x - m.x),
      vy: s.kp * (sp.y - m.y),
      w: 4 * wrap(sp.theta - m.theta),
    };
    s.req = {
      vx: s.ff.vx + s.corr.vx,
      vy: s.ff.vy + s.corr.vy,
      w: s.ff.w + s.corr.w,
    };
    s.kind = "field";
    if (s.cmd.path.finished(t)) {
      s.req = { vx: 0, vy: 0, w: 0 };
      s.kind = "zero";
      s.ended = "clock";
      s.endedAt = s.u;
      s.cmd = null;
    } else if (!s.held) {
      s.req = { vx: 0, vy: 0, w: 0 };
      s.kind = "zero";
      s.ended = "cancel";
      s.endedAt = s.u;
      s.cmd = null;
    }
  }
  if (!s.held && s.ended === "clock") s.ended = null;
  // three loops of actuation latency (CAN, module steering) before a request takes effect
  s.pipe.push({ ...s.req });
  s.applied = s.pipe.length > 3 ? s.pipe.shift() : s.pipe[0];
}

function stepDrive(s, dt) {
  const r = s.applied;
  const m = Math.hypot(r.vx, r.vy);
  const k = m > MAX_V ? MAX_V / m : 1;
  const kk = 1 - Math.exp(-dt / LAG);
  const hold = 1 - s.drag;
  s.vx += (r.vx * k * hold - s.vx) * kk;
  s.vy += (r.vy * k * hold - s.vy) * kk;
  s.w += (clamp(r.w, -11, 11) - s.w) * (1 - Math.exp(-dt / 0.08));
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  s.theta = wrap(s.theta + s.w * dt);
}

function step(s, dt) {
  const n = Math.max(1, Math.round(dt / DT));
  for (let i = 0; i < n; i++) {
    s.loopAcc += DT;
    if (s.loopAcc >= LOOP - 1e-9) {
      s.loopAcc -= LOOP;
      robotLoop(s);
    }
    stepDrive(s, DT);
    s.u += DT;
  }
}

const snap = (s) => ({
  ...s,
  meas: [],
  pipe: [],
  sp: s.sp && { ...s.sp },
  ff: s.ff && { ...s.ff },
  corr: s.corr && { ...s.corr },
  req: { ...s.req },
  goal: { ...s.goal },
  cmd: s.cmd && { t0: s.cmd.t0, path: s.cmd.path, start: s.cmd.start },
});

function simulate({ events = [], dur = 4, pose = START, vel, setup } = {}) {
  const s = fresh(pose, vel);
  setup?.(s);
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

// last video's P-only bolt, for the callback: same drivetrain, no plan
function simulateBolt(dur = 2.2) {
  const s = { x: START.x, y: START.y, theta: START.theta, vx: 0, vy: 0 };
  const out = [];
  let acc = 0;
  let req = { vx: 0, vy: 0 };
  for (let i = 0; i <= dur * SR; i++) {
    const u = i / SR;
    for (let j = 0; j < 2; j++) {
      acc += DT;
      if (acc >= LOOP) {
        acc -= LOOP;
        if (u > 0.2) req = { vx: 10 * (GOAL.x - s.x), vy: 10 * (GOAL.y - s.y) };
      }
      const m = Math.hypot(req.vx, req.vy);
      const k = m > MAX_V ? MAX_V / m : 1;
      const eff = Math.max(0, Math.min(m, MAX_V) - 0.3) / Math.max(m * k, 1e-9);
      const kk = 1 - Math.exp(-DT / 0.08);
      s.vx += (req.vx * k * eff - s.vx) * kk;
      s.vy += (req.vy * k * eff - s.vy) * kk;
      s.x += s.vx * DT;
      s.y += s.vy * DT;
    }
    s.theta = lerp(START.theta, GOAL.theta, clamp((u - 0.2) / 0.6));
    out.push({ ...s, u, ask: Math.hypot(req.vx, req.vy) });
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

// ---- the code on screen ---------------------------------------------------------------

const PAGES = {
  plan: {
    file: "commands/DriveToPoint.java · 6-ProfiledToPoint",
    lines: [
      "private final LinearPath path =",
      "    new LinearPath(",
      "        new TrapezoidProfile.Constraints(2.5, 3.0),",
      "        new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));",
      "",
      "private final PIDController xController =",
      "    new PIDController(3.0, 0.0, 0.0);",
      "private final PIDController yController =",
      "    new PIDController(3.0, 0.0, 0.0);",
      "private final PIDController headingController =",
      "    new PIDController(4.0, 0.0, 0.0);",
    ],
  },
  init: {
    file: "commands/DriveToPoint.java",
    lines: [
      "@Override",
      "protected void initialize() {",
      "  startState =",
      "      new LinearPath.State(",
      "          drivetrain.getPose(), drivetrain.getFieldVelocity());",
      "  startTime = Utils.getCurrentTimeSeconds();",
      "  xController.reset();",
      "  yController.reset();",
      "  headingController.reset();",
      "}",
    ],
  },
  exec: {
    file: "commands/DriveToPoint.java · execute()",
    lines: [
      "double t = Utils.getCurrentTimeSeconds() - startTime;",
      "LinearPath.State setpoint = path.calculate(t, startState, goal);",
      "Pose2d measuredPose = drivetrain.getPose();",
      "",
      "ChassisVelocities feedforward = setpoint.velocity;",
      "double vx = feedforward.vx",
      "    + xController.calculate(measuredPose.getX(), setpoint.pose.getX());",
      "double vy = feedforward.vy",
      "    + yController.calculate(measuredPose.getY(), setpoint.pose.getY());",
      "// omega: same shape on heading",
      "drivetrain.setControl(driveRequest.withVelocity(",
      "    new ChassisVelocities(vx, vy, omega)));",
    ],
  },
  fin: {
    file: "commands/DriveToPoint.java",
    lines: [
      "@Override",
      "protected boolean isFinished() {",
      "  return path.isFinished(Utils.getCurrentTimeSeconds() - startTime);",
      "}",
      "",
      "@Override",
      "protected void end(boolean interrupted) {",
      "  // Zero speed, not SwerveRequest.Idle: Idle leaves every",
      "  // module on its last request.",
      "  drivetrain.setControl(driveRequest.withVelocity(",
      "      new ChassisVelocities()));",
      "}",
    ],
  },
};

// ---- small drawing helpers ------------------------------------------------------------

function arrow(
  ctx,
  x0,
  y0,
  x1,
  y1,
  { color = C.accent, width = 4, head = 14, dash = null, a = 1 } = {}
) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  if (len < 3) return;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  const h = Math.min(head, len * 0.6);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(ang) * h * 0.6, y1 - Math.sin(ang) * h * 0.6);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(ang - 0.42) * h, y1 - Math.sin(ang - 0.42) * h);
  ctx.lineTo(x1 - Math.cos(ang + 0.42) * h, y1 - Math.sin(ang + 0.42) * h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPad(ctx, b) {
  ctx.save();
  ctx.translate(PAD.x, PAD.y);
  ctx.scale(PAD.s, PAD.s);
  drawController(ctx, { x: 0, y: 0, w: 440, h: 270 }, { label: false });
  if (b) {
    const bx = 440 - 110 + 28;
    ctx.beginPath();
    ctx.arc(bx, 120, 15, 0, TAU);
    ctx.fillStyle = C.accent;
    ctx.fill();
    text(ctx, "B", bx, 126, {
      font: MONO,
      size: 15,
      weight: 600,
      align: "center",
      color: C.accentInk,
    });
  }
  ctx.restore();
  text(ctx, b ? "B held" : "B up", PAD.x + 154, PAD.y + 240, {
    font: MONO,
    size: 20,
    weight: 600,
    align: "center",
    color: b ? C.accent : C.tx3,
  });
}

function drawHand(ctx, x, y, label, on = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = on ? C.accent : C.tx;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 30);
  ctx.lineTo(8, 23);
  ctx.lineTo(14, 36);
  ctx.lineTo(20, 33);
  ctx.lineTo(14, 21);
  ctx.lineTo(24, 21);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  if (label)
    text(ctx, label, x + 30, y + 20, {
      font: MONO,
      size: 18,
      weight: 600,
      color: on ? C.accent : C.tx2,
    });
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  // already rolling toward the goal at 1 m/s when B goes down: the snapshot keeps that
  const ROLL = { vx: -0.9, vy: 0.2 };
  const MAIN = simulate({
    events: [{ u: 0.4, do: (s) => (s.held = true) }],
    dur: 4.2,
    vel: ROLL,
  });
  const PATH = linearPath(START, ROLL, GOAL);
  const BOLT = simulateBolt();
  // the gate, played for you: shove at kP 10, then at kP 3
  const shove = (s) => (s.vy += 2.4);
  const WEAVE = simulate({
    events: [
      { u: 0.3, do: (s) => (s.held = true) },
      { u: 1.3, do: shove },
    ],
    dur: 4.4,
    setup: (s) => (s.kp = 10),
  });
  const CALM = simulate({
    events: [
      { u: 0.3, do: (s) => (s.held = true) },
      { u: 1.3, do: shove },
    ],
    dur: 4.4,
    setup: (s) => (s.kp = 3),
  });
  // the clock finish: something holds it back, the plan runs out anyway
  const HELD = simulate({
    events: [
      { u: 0.3, do: (s) => (s.held = true) },
      { u: 1.0, do: (s) => (s.drag = 0.35) },
    ],
    dur: 4.6,
  });
  const T0 = 0.4; // MAIN's press
  const planEnd = T0 + 0.02 + PATH.T;

  const T = {
    g0: gate?.t0 ?? 1e9,
    g1: gate?.t1 ?? 1e9,
  };
  const G_FLIP = T.g0 + 4.6;

  // what is on screen at narration time t
  const segs = [
    {
      t0: 0,
      t1: L("connect").t0 - 0.2,
      run: MAIN,
      keys: [
        [L("intro").t0 + 0.4, 0.3],
        [L("intro").t1 + 0.4, planEnd + 0.2],
      ],
    },
    {
      t0: L("connect").t0 - 0.2,
      t1: L("shape").t0 - 0.2,
      run: BOLT,
      bolt: true,
      keys: [
        [L("connect").t0, 0.1],
        [L("connect").t1, 1.6],
      ],
    },
    {
      t0: L("shape").t0 - 0.2,
      t1: L("snapshot").t0 - 0.2,
      run: MAIN,
      keys: [[0, 0]],
      still: true,
    },
    {
      t0: L("snapshot").t0 - 0.2,
      t1: L("loop").t0,
      run: MAIN,
      keys: [
        [Wd("snapshot", "press") - 0.5, 0.25],
        [Wd("snapshot", "button,") + 0.2, T0 + 0.03],
      ],
    },
    {
      t0: L("loop").t0,
      t1: L("tryit").t0,
      run: MAIN,
      keys: [
        [L("loop").t0 + 0.3, T0 + 0.03],
        [L("loop").t1, T0 + 0.7],
        [L("ff").t1, T0 + 1.25],
        [L("ff").t1 + 1.2, planEnd + 0.3],
      ],
    },
    { t0: L("tryit").t0, t1: T.g0, run: WEAVE, keys: [[0, 0.25]] },
    {
      t0: T.g0,
      t1: G_FLIP,
      run: WEAVE,
      keys: [
        [T.g0 + 0.3, 0.3],
        [T.g0 + 1.0, 1.25],
        [G_FLIP - 0.1, 2.9],
      ],
      weave: true,
    },
    {
      t0: G_FLIP,
      t1: T.g1,
      run: CALM,
      keys: [
        [G_FLIP, 0.6],
        [G_FLIP + 0.6, 1.25],
        [T.g1, 2.7],
      ],
    },
    {
      t0: T.g1,
      t1: L("clock").t0 - 0.2,
      run: WEAVE,
      keys: [
        [L("why").t0, 1.2],
        [L("why").t1, 2.9],
      ],
      why: true,
    },
    {
      t0: L("clock").t0 - 0.2,
      t1: VOICE.duration + 1,
      run: HELD,
      keys: [
        [L("clock").t0, 0.25],
        [
          Wd("clock", "short.") + 0.4,
          HELD.findIndex((s) => s.ended === "clock") / SR + 0.6,
        ],
      ],
      clock: true,
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
    { t: L("shape").t0 - 0.2, x: 700, y: 560, z: 1.35, d: 1.2 },
    { t: L("snapshot").t0 - 0.2, x: 1000, y: 300, z: 1.2, d: 1.2 },
    { t: L("loop").t0 - 0.1, x: 1380, y: 280, z: 1.4, d: 1.2 },
    { t: L("ff").t0 - 0.2, x: 600, y: 300, z: 1.35, d: 1.2 },
    { t: L("tryit").t0 - 0.2, ...FULL, d: 1.0 },
    { t: L("clock").t0 - 0.2, ...FULL, d: 1.0 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function codeState(t, live) {
    if (live)
      return {
        page: "plan",
        hot: live.kp === 10 ? [6, 8] : [6, 8],
        gain: live.kp,
      };
    const lit = (pairs) => {
      let cur = [];
      for (const [at, lines] of pairs) if (t >= at) cur = lines;
      return cur;
    };
    if (t < L("snapshot").t0 - 0.2)
      return {
        page: "plan",
        hot: t >= L("shape").t0 - 0.2 ? [0, 1, 2, 3] : [],
      };
    if (t < L("loop").t0)
      return {
        page: "init",
        hot: lit([
          [L("snapshot").t0, [2, 3, 4]],
          [Wd("snapshot", "fast"), [4]],
          [Wd("snapshot", "fast") + 1.2, [5]],
        ]),
      };
    if (t < L("tryit").t0)
      return {
        page: "exec",
        pulse: true,
        hot: lit([
          [L("loop").t0, [0]],
          [Wd("loop", "plan"), [1]],
          [L("ff").t0, [4]],
          [Wd("ff", "correction"), [5, 6, 7, 8]],
          [Wd("ff", "toward"), [10, 11]],
        ]),
      };
    if (t < L("clock").t0 - 0.2) {
      const seg = segs.find((g) => t >= g.t0 && t < g.t1);
      const gain = seg?.run === CALM ? 3 : 10;
      return { page: "plan", hot: t >= T.g0 ? [6, 8] : [], gain };
    }
    return {
      page: "fin",
      hot: lit([
        [L("clock").t0, [1, 2]],
        [Wd("clock", "ending"), [6, 9, 10]],
      ]),
    };
  }

  function drawCode(ctx, t, live) {
    panel(ctx, CODE);
    const st = codeState(t, live);
    const pg = PAGES[st.page];
    micro(ctx, pg.file, CODE.x + 28, CODE.y + 40);
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 58, CODE.w, 1);
    const pulse = st.pulse ? 0.5 + 0.5 * Math.cos(((t % 0.4) / 0.4) * TAU) : 0;
    let y = CODE.y + 96;
    pg.lines.forEach((ln0, i) => {
      if (!ln0) {
        y += LH / 2;
        return;
      }
      let ln = ln0;
      // the gate flips the X and Y gains between 10 and 3
      if (st.gain === 10 && (i === 6 || i === 8))
        ln = "    new PIDController(10.0, 0.0, 0.0);";
      if (st.hot.includes(i))
        runBar(ctx, CODE.x + 1, y - 20, CODE.w - 2, LH, pulse);
      codeLine(ctx, ln, CODE.x + 28, y, {
        size: CODE_SIZE,
        a: st.hot.length && !st.hot.includes(i) ? 0.55 : 1,
      });
      if (st.gain && (i === 6 || i === 8))
        text(
          ctx,
          st.gain === 10 ? "kP 10 · the old gain" : "kP 3",
          CODE.x + CODE.w - 28,
          y,
          {
            font: MONO,
            size: 18,
            weight: 600,
            align: "right",
            color: st.gain === 10 ? C.err : C.accent,
          }
        );
      y += LH;
    });
  }

  const modulesFor = (s) => {
    const c = Math.cos(-s.theta);
    const sn = Math.sin(-s.theta);
    return swerveModules(s.vx * c - s.vy * sn, s.vx * sn + s.vy * c, s.w ?? 0);
  };

  function drawFieldPanel(ctx, t, V, live) {
    const s = live ?? V.s;
    const F = drawField(ctx, FIELD, { view: VIEW });
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    const goal = s.goal ?? GOAL;
    const gA = live || V.seg.bolt ? 1 : 1;
    // the triangle beat slides the goal in to 1.5 m
    let g = goal;
    if (!live && t >= L("triangle").t0 - 0.2 && t < L("snapshot").t0 - 0.2) {
      const k = window_(
        t,
        Wd("triangle", "under") - 0.2,
        L("snapshot").t0 - 0.2,
        0.8
      );
      g = {
        x: lerp(GOAL.x, NEAR.x, k),
        y: lerp(GOAL.y, NEAR.y, k),
        theta: Math.PI,
      };
    }
    drawSwerveRobot(ctx, F, g, {
      ghost: true,
      label: "goal",
      color: alpha(C.tx2, 0.9),
    });
    void gA;
    // the plan: a dashed straight line from the snapshot to the goal
    const cmdStart =
      s.cmd?.start ??
      (s.ended === "clock" && V.run
        ? V.run.find((q) => q.cmd)?.cmd.start
        : null);
    const from = cmdStart ?? (V.seg?.still ? START : null);
    if (from && !V.seg?.bolt) {
      ctx.strokeStyle = alpha(C.accent, 0.6);
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(...F.P(from.x, from.y));
      ctx.lineTo(...F.P(g.x, g.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // trail
    if (!live && V.run) {
      ctx.fillStyle = alpha(V.seg.bolt ? C.tx3 : C.accent, 0.5);
      for (let u = Math.max(0, V.s.u - 2.5); u < V.s.u; u += 0.035) {
        const p = sampleAt(V.run, u);
        const [px, py] = F.P(p.x, p.y);
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
    if (live) {
      ctx.fillStyle = alpha(C.accent, 0.5);
      for (const [x, y] of live.trail) {
        const [px, py] = F.P(x, y);
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
    // the snapshot pin
    const pinA = live
      ? 0
      : window_(t, Wd("snapshot", "starts") - 0.2, L("ff").t0, 0.4);
    if (pinA > 0) {
      const st = MAIN.find((q) => q.cmd)?.cmd.start;
      if (st) {
        const [px, py] = F.P(st.x, st.y);
        ctx.save();
        ctx.globalAlpha = pinA;
        ctx.fillStyle = C.accent;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, TAU);
        ctx.fill();
        arrow(ctx, px, py, px + st.vx * 0.45 * F.s, py - st.vy * 0.45 * F.s, {
          color: C.accent,
          width: 3,
          head: 12,
        });
        rrect(ctx, px - 150, py + 54, 300, 62, 4);
        ctx.fillStyle = alpha(C.bg, 0.92);
        ctx.fill();
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        text(ctx, "t = 0 · startState", px, py + 78, {
          font: MONO,
          size: 17,
          weight: 600,
          align: "center",
          color: C.accent,
        });
        text(
          ctx,
          `(${st.x.toFixed(2)}, ${st.y.toFixed(2)})  ${Math.hypot(st.vx, st.vy).toFixed(2)} m/s`,
          px,
          py + 104,
          { font: MONO, size: 17, align: "center", color: C.tx }
        );
        ctx.restore();
      }
    }
    // the ghost on the plan
    const arrowsOn = !live && t >= L("ff").t0 - 0.2 && t < L("tryit").t0;
    if (s.sp && (s.cmd || live))
      drawSwerveRobot(ctx, F, s.sp, {
        ghost: true,
        label: live || arrowsOn ? "" : "plan",
      });
    if (V.seg?.bolt)
      drawSwerveRobot(ctx, F, s, {
        modules: modulesFor({ ...s, w: 0 }),
        label: "last time · kP 10, no plan",
        color: C.tx3,
      });
    else drawSwerveRobot(ctx, F, s, { modules: modulesFor(s) });
    // the hand that holds it back on the clock beat
    if (V.seg?.clock && s.drag > 0) {
      const [px, py] = F.P(s.x, s.y);
      drawHand(ctx, px - 74, py - 10, "held back", true);
    }
    if (!live && V.seg?.weave && t >= T.g0 + 0.8 && t < T.g0 + 1.8) {
      const [px, py] = F.P(s.x, s.y);
      drawHand(ctx, px - 10, py + 60, "shove", true);
    }
    if (!live && V.run === CALM && t >= G_FLIP + 0.3 && t < G_FLIP + 1.2) {
      const [px, py] = F.P(s.x, s.y);
      drawHand(ctx, px - 10, py + 60, "shove", true);
    }
    // feedforward + correction arrows
    const arrows = live
      ? 1
      : window_(t, L("ff").t0 - 0.2, L("tryit").t0, 0.3) +
        (t >= T.g0 && t < L("clock").t0 - 0.2 ? 1 : 0);
    if (arrows > 0 && s.ff && s.cmd) {
      const [px, py] = F.P(s.x, s.y);
      const sc = 0.35 * F.s;
      ctx.save();
      ctx.globalAlpha = Math.min(1, arrows);
      const fx = px + s.ff.vx * sc;
      const fy = py - s.ff.vy * sc;
      arrow(ctx, px, py, fx, fy, { color: C.accent, width: 7, head: 20 });
      arrow(ctx, fx, fy, fx + s.corr.vx * sc, fy - s.corr.vy * sc, {
        color: C.tx,
        width: 3,
        head: 12,
      });
      if (!live && t < L("tryit").t0) {
        text(ctx, "plan's speed", fx - 40, fy - 60, {
          font: MONO,
          size: 18,
          weight: 600,
          align: "center",
          color: C.accent,
        });
        text(
          ctx,
          "correction",
          fx + s.corr.vx * sc + 14,
          fy - s.corr.vy * sc + 30,
          { font: MONO, size: 18, weight: 600, color: C.tx }
        );
      }
      ctx.restore();
    }
    ctx.restore();
    if (!live && V.rate > 0 && V.rate < 0.95)
      text(
        ctx,
        `robot clock · slow motion ×${V.rate.toFixed(2)}`,
        FIELD.x + FIELD.w - 16,
        FIELD.y + 30,
        { font: MONO, size: 18, weight: 600, align: "right", color: C.accent }
      );
    return F;
  }

  // The Motion Magic trapezoid from the arm video, re-axised in meters.
  function drawProfilePlot(ctx, t, V, live) {
    const s = live ?? V.s;
    const shapeOn =
      !live && t >= L("shape").t0 - 0.2 && t < L("snapshot").t0 - 0.2;
    const arm = shapeOn && t < Wd("shape", "meters.") - 0.1;
    // which plan is drawn
    let path = s.cmd?.path ?? null;
    let t0 = s.cmd?.t0 ?? null;
    if (!path && s.ended === "clock" && V.run) {
      const q = [...V.run].reverse().find((r) => r.cmd && r.u <= s.u);
      path = q?.cmd.path;
      t0 = q?.cmd.t0;
    }
    let d = null;
    if (shapeOn) {
      const k =
        t >= L("triangle").t0 - 0.2
          ? window_(
              t,
              Wd("triangle", "under") - 0.2,
              L("snapshot").t0 - 0.2,
              0.8
            )
          : 0;
      d = lerp(Math.hypot(GOAL.x - START.x, GOAL.y - START.y), 1.5, k);
    }
    const series = [];
    let playhead = null;
    let prof = null;
    if (d != null) prof = trapezoid(d, 0, CRUISE, ACCEL);
    else if (path) prof = path.lin;
    const v1 = 5.2;
    const tEnd = 3.4;
    if (prof) {
      const pts = [];
      const reveal =
        shapeOn && !arm
          ? 99
          : shapeOn
            ? clamp((t - Wd("shape", "speed")) / 2.2) * prof.T
            : 99;
      for (let u = 0; u <= Math.min(prof.T, reveal) + 1e-6; u += 0.02)
        pts.push([u, prof.at(u).v]);
      pts.push([Math.min(prof.T, reveal), prof.at(Math.min(prof.T, reveal)).v]);
      series.push({ pts, color: C.accent, width: 4 });
    }
    // the robot's own speed over this command
    if (!live && V.run && t0 != null && !V.seg.bolt) {
      const pts = [];
      for (let u = t0; u <= s.u; u += 1 / 60) {
        const q = sampleAt(V.run, u);
        pts.push([u - t0, Math.hypot(q.vx, q.vy)]);
      }
      series.push({ pts, color: alpha(C.tx, 0.85), width: 2.5 });
      playhead = s.u - t0;
    }
    if (live && live.hist.length) {
      series.push({
        pts: live.hist.map((h) => [h.u, h.v]),
        color: alpha(C.tx, 0.85),
        width: 2.5,
      });
      playhead = live.hist.at(-1).u;
    }
    if (V.seg?.bolt) {
      const pts = [];
      for (let u = 0.2; u <= s.u; u += 1 / 60)
        pts.push([
          u - 0.2,
          Math.hypot(sampleAt(BOLT, u).vx, sampleAt(BOLT, u).vy),
        ]);
      series.push({ pts, color: C.tx3, width: 3 });
    }
    const title = V.seg?.bolt
      ? "last time · speed from distance"
      : arm
        ? "Motion Magic profile · the arm, rot/s"
        : "LinearPath · planned speed, m/s";
    const P = drawPlot(ctx, PLOT, {
      title,
      t0: 0,
      t1: tEnd,
      v0: 0,
      v1,
      series,
      playhead,
    });
    // top speed line
    ctx.strokeStyle = alpha(C.tx3, 0.7);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(P.X(0), P.Y(MAX_V));
    ctx.lineTo(P.X(tEnd), P.Y(MAX_V));
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "top speed 4.54", P.X(tEnd), P.Y(MAX_V) - 8, {
      font: MONO,
      size: 16,
      align: "right",
      color: C.tx3,
    });
    if (V.seg?.bolt)
      text(ctx, "flat out, then a crawl", P.X(1.2), P.Y(3.2), {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.tx2,
      });
    if (prof && !V.seg?.bolt) {
      const lab = (u, v, s, dy = -14) =>
        text(ctx, s, P.X(u), P.Y(v) + dy, {
          font: MONO,
          size: 18,
          color: C.tx2,
          align: "center",
        });
      const ph = (w) => (shapeOn ? clamp((t - Wd("shape", w)) / 0.4) : 1);
      ctx.save();
      if (prof.tc > 0.05) {
        ctx.globalAlpha = ph("speed");
        lab(prof.ta / 2 - 0.1, prof.vp / 2, "speed up", 0);
        ctx.globalAlpha = ph("cruise,");
        lab(prof.ta + prof.tc / 2, prof.vp, arm ? "cruise" : "cruise 2.5 m/s");
        ctx.globalAlpha = ph("slow");
        lab(
          prof.ta + prof.tc + prof.td / 2 + 0.25,
          prof.vp / 2,
          "slow down",
          0
        );
      } else {
        lab(prof.ta, prof.vp, `no cruise · peak ${prof.vp.toFixed(2)} m/s`);
      }
      ctx.restore();
      if (shapeOn && !arm)
        text(ctx, "ramp 3.0 m/s²", P.X(0.12), P.Y(1.2), {
          font: MONO,
          size: 16,
          color: C.tx3,
        });
      if (d != null)
        text(ctx, `trip ${d.toFixed(2)} m`, PLOT.x + PLOT.w - 24, PLOT.y + 34, {
          font: MONO,
          size: 18,
          weight: 600,
          align: "right",
          color: d < 2.11 ? C.accent : C.tx2,
        });
      // the plan ends: a dashed line on the time axis
      if (!shapeOn) {
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(P.X(prof.T), P.Y(0));
        ctx.lineTo(P.X(prof.T), P.Y(3.6));
        ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, "plan ends", P.X(prof.T) + 8, P.Y(3.6) + 4, {
          font: MONO,
          size: 17,
          weight: 600,
          color: C.accent,
        });
      }
    }
    text(ctx, "s", PLOT.x + PLOT.w - 18, PLOT.y + PLOT.h - 12, {
      font: MONO,
      size: 16,
      color: C.tx3,
    });
  }

  // the plan's clock and the sum that goes out
  function drawCard(ctx, t, V, live) {
    const s = live ?? V.s;
    panel(ctx, CARD, C.bg2);
    micro(ctx, "DriveToPoint · this loop", CARD.x + 24, CARD.y + 38);
    const running = !!s.cmd;
    const st = running
      ? "running"
      : s.ended === "clock"
        ? "finished"
        : s.ended === "cancel"
          ? "canceled"
          : "not scheduled";
    text(ctx, st, CARD.x + CARD.w - 24, CARD.y + 39, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "right",
      color: running ? C.accent : s.ended === "cancel" ? C.err : C.tx2,
    });
    // clock bar
    const path = s.cmd?.path;
    const tt = running ? s.u - s.cmd.t0 : null;
    micro(ctx, "plan clock", CARD.x + 24, CARD.y + 86);
    const bx = CARD.x + 24;
    const bw = CARD.w - 48;
    ctx.fillStyle = alpha(C.tx3, 0.25);
    ctx.fillRect(bx, CARD.y + 100, bw, 10);
    if (running) {
      ctx.fillStyle = C.accent;
      ctx.fillRect(bx, CARD.y + 100, bw * clamp(tt / path.T), 10);
      text(
        ctx,
        `t = ${tt.toFixed(2)} s of ${path.T.toFixed(2)} s`,
        CARD.x + CARD.w - 24,
        CARD.y + 86,
        { font: MONO, size: 18, weight: 600, align: "right", color: C.tx }
      );
    } else if (s.ended === "clock") {
      ctx.fillStyle = C.accent;
      ctx.fillRect(bx, CARD.y + 100, bw, 10);
      text(ctx, "isFinished() → true", CARD.x + CARD.w - 24, CARD.y + 86, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "right",
        color: C.accent,
      });
    }
    const row = (y, label, v, color = C.tx) => {
      micro(ctx, label, CARD.x + 24, y);
      text(ctx, v, CARD.x + CARD.w - 24, y + 2, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "right",
        color,
      });
    };
    const f = (o) => (o ? `${o.vx.toFixed(2)}, ${o.vy.toFixed(2)}` : "–");
    row(
      CARD.y + 160,
      "plan's speed  vx, vy",
      f(running ? s.ff : null),
      C.accent
    );
    row(
      CARD.y + 204,
      `+ correction  kP ${s.kp ?? 10}`,
      f(running ? s.corr : null)
    );
    ctx.fillStyle = C.rule;
    ctx.fillRect(CARD.x + 24, CARD.y + 222, CARD.w - 48, 1);
    row(
      CARD.y + 256,
      "= sent  m/s",
      running ? f(s.req) : s.kind === "zero" ? "0.00, 0.00  (zero)" : "–",
      running ? C.tx : C.tx2
    );
    if (running && s.sp) {
      const e = Math.hypot(s.sp.x - s.x, s.sp.y - s.y);
      row(CARD.y + 300, "gap to the plan", `${(e * 100).toFixed(0)} cm`, C.tx2);
    } else if (s.ended === "clock") {
      const e = Math.hypot(s.goal.x - s.x, s.goal.y - s.y);
      row(
        CARD.y + 300,
        "short of the goal",
        `${(e * 100).toFixed(0)} cm`,
        C.tx2
      );
    }
  }

  // kP 10 vs 3, the gap to the plan after the same shove
  function drawWhy(ctx, t) {
    const a = window_(t, L("why").t0 - 0.2, L("clock").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 470, y: 60, w: 450, h: 300 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = alpha(C.bg2, 0.97);
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    micro(ctx, "after a shove · sideways gap to the plan", R.x + 20, R.y + 34, {
      size: 16,
    });
    const reveal = clamp((t - L("why").t0) / 2.5);
    const trace = (run, y0, color, label) => {
      ctx.strokeStyle = alpha(C.tx3, 0.6);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(R.x + 20, y0);
      ctx.lineTo(R.x + R.w - 20, y0);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 120 * reveal; i++) {
        const u = 1.25 + i * 0.02;
        const q = sampleAt(run, u);
        const gap = q.sp ? q.y - q.sp.y : 0;
        const x = R.x + 20 + (i / 120) * (R.w - 40);
        const y = y0 - clamp(gap, -0.22, 0.22) * 190;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      text(ctx, label, R.x + R.w - 20, y0 - 34, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "right",
        color,
      });
    };
    trace(WEAVE, R.y + 120, C.err, "kP 10 · buzzes");
    trace(CALM, R.y + 230, C.accent, "kP 3 · calm");
    text(ctx, "10 × 0.20 m = 2.0 m/s of correction", R.x + 20, R.y + R.h - 14, {
      font: MONO,
      size: 17,
      color: C.tx2,
      a: clamp((t - Wd("why", "drift")) / 0.4),
    });
    ctx.restore();
  }

  // ---- full-screen cards -----------------------------------------------------------

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
      "Workshop 6 · Profiled Drive to Point",
      W / 2,
      440 - 20 * (1 - k),
      { align: "center", a: k, color: C.accent }
    );
    text(ctx, "Plan the Trip", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "A command with an ending", W / 2, 450, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "is a step.", W / 2, 556, {
      font: SERIF,
      size: 84,
      align: "center",
      color: C.accent,
    });
    text(ctx, "It can go in a list, after anything else.", W / 2, 660, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "list,") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const V = live ? { s: live, seg: {}, rate: 0 } : viewAt(t);
    const s = live ?? V.s;
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawCode(ctx, t, live);
    drawFieldPanel(ctx, t, V, live);
    drawProfilePlot(ctx, t, V, live);
    drawCard(ctx, t, V, live);
    drawPad(ctx, !V.seg?.bolt && (s.held ?? false));
    if (!live) drawWhy(ctx, t);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate ---------------------------------------------------------------------

  function liveGate() {
    const A = { x: 6.6, y: 1.5, theta: Math.PI };
    const B = { x: 2.5, y: 2.4, theta: Math.PI };
    const s = { ...fresh(A), time: gate.t0, trail: [], hist: [] };
    s.kp = 10;
    s.held = true;
    s.goal = { ...B };
    let shoves = { 10: 0, 3: 0 };
    let doneAt = null;
    let lastShove = -9;
    return {
      state: s,
      prompt: () => {
        if (doneAt != null)
          return "Ten weaves around the plan. Three rides it.";
        if (shoves[s.kp] === 0) return `kP ${s.kp}: shove the robot (S).`;
        return s.kp === 10
          ? "Now flip the gain to 3 (G), and shove again."
          : "Flip back to 10 (G) to compare.";
      },
      input(k, v) {
        if (k === "shove" && v) {
          s.vy += s.y < 2 ? 1.6 : -1.6;
          shoves[s.kp]++;
          lastShove = s.time;
        }
        if (k === "gain" && v) s.kp = s.kp === 10 ? 3 : 10;
      },
      pointer(type) {
        if (type === "down") {
          s.vy += s.y < 2 ? 1.6 : -1.6;
          shoves[s.kp]++;
          lastShove = s.time;
        }
      },
      step(dt) {
        const d = dt * 0.6;
        step(s, d);
        s.time += dt;
        // when the clock runs out, the next trip goes back the other way
        if (s.ended === "clock" && !s.cmd) {
          s.goal =
            Math.hypot(s.goal.x - A.x, s.goal.y - A.y) < 0.1
              ? { ...B }
              : { ...A };
          s.ended = null;
          s.hist = [];
        }
        if (s.cmd)
          s.hist.push({ u: s.u - s.cmd.t0, v: Math.hypot(s.vx, s.vy) });
        s.trail.push([s.x, s.y]);
        if (s.trail.length > 90) s.trail.shift();
        if (
          doneAt == null &&
          shoves[10] > 0 &&
          shoves[3] > 0 &&
          s.time - lastShove > 2.0
        )
          doneAt = s.time;
        return doneAt !== null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (!gate || t < gate.t0 || t >= gate.t1) return null;
    if (t < T.g0 + 0.8) return "kP 10: shove the robot.";
    if (t < G_FLIP) return "Ten centimeters off, and it weaves.";
    if (t < G_FLIP + 0.6) return "Flip the gain to 3, and shove again.";
    return "Three rides the plan.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      { k: "shove", label: "Shove", key: "KeyS", kind: "press" },
      { k: "gain", label: "Gain 10 / 3", key: "KeyG", kind: "press" },
    ],
  };
}
