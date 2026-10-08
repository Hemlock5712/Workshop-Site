// Speed From Distance. DriveToPoint on 5-DriveToPoint: three P controllers turn the
// gap between the robot's pose and the goal's into a field velocity, every loop.
//
// What is simulated, and how:
//   the command   DriveToPoint.execute() on 20 ms loops: vx = 10 * x error, vy = 10 * y
//                 error, omega = 7 * heading error (wrapped, enableContinuousInput).
//                 end() sends a zero ChassisVelocities; the Idle comparison keeps the
//                 last request instead.
//   the drive     the request is clipped to what the drivetrain can do (4.54 m/s,
//                 kSpeedAt12Volts), the wheels follow it with a short lag, and a small
//                 speed is lost to friction, so a tiny request does not move the robot.
//                 That loss is what leaves P alone a few centimeters short.
// Each run is simulated once in robot time and mapped onto the narration with keys,
// labelled when it runs slow. The field is blue-origin: X down the field, Y to the left.

import {
  C,
  MONO,
  SANS,
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
  drawMotorCard,
  drawPlot,
  drawPoseReadout,
  drawSwerveRobot,
  panel,
  runBar,
  swerveModules,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const FIELD = { x: 40, y: 40, w: 900, h: 470 };
const VIEW = { x0: -0.3, y0: -0.3, x1: 8.0, y1: 4.0 };
const CODE = { x: 980, y: 40, w: 900, h: 470 };
const CARD = { x: 40, y: 540, w: 420, h: 340 };
const DIAL = { x: 480, y: 540, w: 460, h: 340 };
const PLOT = { x: 980, y: 540, w: 560, h: 340 };
const PAD = { x: 1570, y: 600, s: 0.7 };
const CODE_SIZE = 19;
const LH = 27;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const MAX_V = 4.54; // kSpeedAt12Volts
const MAX_W = 11; // rad/s, the same wheels spinning the robot
const KP = 10;
const KH = 7;
const LOSS = 0.3; // m/s lost to friction: ask for less and the wheels do not turn
const LOSS_W = 0.25;
const LOOP = 0.02;
const DT = 1 / 480;
const SR = 240; // samples per robot second
const START = { x: 6.0, y: 2.6, theta: (20 * Math.PI) / 180 };
const GOAL = { x: 3, y: 2, theta: Math.PI };
const GATE_GOAL = { x: 4.4, y: 3.3, theta: Math.PI / 2 };
const D2R = Math.PI / 180;

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

// what DriveToPoint.execute() sends, before the drivetrain clips it
function ask(s, goal) {
  return {
    vx: KP * (goal.x - s.x),
    vy: KP * (goal.y - s.y),
    w: KH * wrap(goal.theta - s.theta),
  };
}

// the drivetrain: clip to what it can do, lose a little to friction, lag a little
function stepDrive(s, dt) {
  const r = s.req;
  let tvx = 0;
  let tvy = 0;
  let tw = 0;
  if (r) {
    const m = Math.hypot(r.vx, r.vy);
    const lim = Math.min(m, MAX_V);
    const eff = Math.max(0, lim - LOSS);
    if (m > 1e-9) {
      tvx = (r.vx / m) * eff;
      tvy = (r.vy / m) * eff;
    }
    const wl = clamp(r.w, -MAX_W, MAX_W);
    tw = Math.sign(wl) * Math.max(0, Math.abs(wl) - LOSS_W);
  }
  const speeding = Math.hypot(tvx, tvy) > Math.hypot(s.vx, s.vy);
  const k = 1 - Math.exp(-dt / (speeding ? 0.14 : 0.012));
  s.vx += (tvx - s.vx) * k;
  s.vy += (tvy - s.vy) * k;
  s.w += (tw - s.w) * (1 - Math.exp(-dt / 0.08));
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  s.theta = wrap(s.theta + s.w * dt);
  // the field wall
  if (s.x < 0.42 || s.x > 16.1) ((s.x = clamp(s.x, 0.42, 16.1)), (s.vx = 0));
  if (s.y < 0.42 || s.y > 7.65) ((s.y = clamp(s.y, 0.42, 7.65)), (s.vy = 0));
}

const fresh = (pose = START, goal = GOAL) => ({
  u: 0,
  ...pose,
  vx: 0,
  vy: 0,
  w: 0,
  held: false,
  req: null,
  asked: null,
  kind: "none",
  goal: { ...goal },
  loopAcc: 0,
  stopMode: "zero",
  releasedAt: -1,
});

// one robot loop: the command runs while the button is held
function robotLoop(s) {
  if (s.held) {
    s.asked = ask(s, s.goal);
    s.req = { ...s.asked };
    s.kind = "field";
  } else if (s.kind === "field") {
    // the command ends: end(true) sends zero, or the Idle variant sends nothing
    if (s.stopMode === "zero") {
      s.req = { vx: 0, vy: 0, w: 0 };
      s.kind = "zero";
    } else s.kind = "idle"; // Idle: every module keeps its last request
    s.asked = null;
  }
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
  goal: { ...s.goal },
  req: s.req && { ...s.req },
  asked: s.asked && { ...s.asked },
});

function simulate({
  events = [],
  dur = 4,
  pose = START,
  goal = GOAL,
  stopMode = "zero",
} = {}) {
  const s = fresh(pose, goal);
  s.stopMode = stopMode;
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

// narration time -> robot time, piecewise linear; also the local rate
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
  bind: {
    file: "opmodes/TeleopOpMode.java",
    lines: [
      "driver.a().whileTrue(new DriveToPoint(drivetrain, Pose2d.ZERO));",
      "driver",
      "    .b()",
      "    .whileTrue(",
      "        new DriveToPoint(",
      "            drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))));",
    ],
  },
  loop: {
    file: "utils/ClassicCommand.java",
    lines: [
      "public final void run(Coroutine coroutine) {",
      "  initialize();",
      "  while (true) {",
      "    execute();",
      "    if (isFinished()) {",
      "      break;",
      "    }",
      "    coroutine.yield();",
      "  }",
      "  end(false); // natural finish",
      "}",
      "",
      "public final void onCancel() {",
      "  end(true);",
      "}",
    ],
  },
  dtp: {
    file: "commands/DriveToPoint.java",
    lines: [
      "xController = new PIDController(10, 0, 0);",
      "yController = new PIDController(10, 0, 0);",
      "headingController = new PIDController(7, 0, 0);",
      "headingController.enableContinuousInput(-Math.PI, Math.PI);",
      "",
      "Pose2d currentPose = drivetrain.getPose();",
      "double vx = xController.calculate(currentPose.getX(), targetPose.getX());",
      "double vy = yController.calculate(currentPose.getY(), targetPose.getY());",
      "double omega =",
      "    headingController.calculate(",
      "        currentPose.getRotation().getRadians(),",
      "        targetPose.getRotation().getRadians());",
      "drivetrain.setControl(driveRequest.withVelocity(",
      "    new ChassisVelocities(vx, vy, omega)));",
    ],
  },
  end: {
    file: "commands/DriveToPoint.java",
    lines: [
      "@Override",
      "protected boolean isFinished() {",
      "  return false;",
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
  if (len < 2) return;
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(ang) * head * 0.6, y1 - Math.sin(ang) * head * 0.6);
  ctx.stroke();
  ctx.setLineDash([]);
  const h = Math.min(head, len * 0.6);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(ang - 0.42) * h, y1 - Math.sin(ang - 0.42) * h);
  ctx.lineTo(x1 - Math.cos(ang + 0.42) * h, y1 - Math.sin(ang + 0.42) * h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// the kit's controller, scaled, with A / B / X lit when held
function drawPad(ctx, { b = false, left = null } = {}) {
  ctx.save();
  ctx.translate(PAD.x, PAD.y);
  ctx.scale(PAD.s, PAD.s);
  const R = { x: 0, y: 0, w: 440, h: 270 };
  drawController(ctx, R, { left, label: false });
  if (b) {
    const bx = R.x + R.w - 110 + 28;
    const by = R.y + 120;
    ctx.beginPath();
    ctx.arc(bx, by, 15, 0, TAU);
    ctx.fillStyle = C.accent;
    ctx.fill();
    text(ctx, "B", bx, by + 6, {
      font: MONO,
      size: 15,
      weight: 600,
      align: "center",
      color: C.accentInk,
    });
  }
  ctx.restore();
  text(
    ctx,
    b ? "B held" : left ? "left stick" : "B up",
    PAD.x + 154,
    PAD.y + 240,
    {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: b || left ? C.accent : C.tx3,
    }
  );
}

function codeW(ctx, n) {
  ctx.font = `500 ${CODE_SIZE}px ${MONO}`;
  return ctx.measureText("x".repeat(n)).width;
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  // the runs, each simulated once
  const MAIN = simulate({
    events: [{ u: 0.3, do: (s) => (s.held = true) }],
    dur: 3.2,
  });
  const ZERO = simulate({
    events: [
      { u: 0.2, do: (s) => (s.held = true) },
      { u: 0.75, do: (s) => (s.held = false) },
    ],
    dur: 3,
    stopMode: "zero",
  });
  const IDLE = simulate({
    events: [
      { u: 0.2, do: (s) => (s.held = true) },
      { u: 0.75, do: (s) => (s.held = false) },
    ],
    dur: 3,
    stopMode: "idle",
  });
  const GATE = simulate({
    events: [{ u: 0.3, do: (s) => (s.held = true) }],
    dur: 3.2,
    goal: GATE_GOAL,
  });

  // where MAIN's request comes off the top-speed ring
  const offRing = (
    MAIN.find(
      (s, i) =>
        i > 0.4 * SR && s.asked && Math.hypot(s.asked.vx, s.asked.vy) < MAX_V
    ) ?? MAIN[SR]
  ).u;
  const settled = (
    MAIN.find((s, i) => i > offRing * SR && Math.hypot(s.vx, s.vy) < 0.004) ??
    MAIN.at(-1)
  ).u;

  const T = {
    hold: Wd("intro", "Hold"),
    drive: Wd("connect", "Now"),
    goal: Wd("goal", "goal"),
    math: L("math").t0,
    flat: Wd("math", "flat"),
    g0: gate?.t0 ?? 1e9,
    g1: gate?.t1 ?? 1e9,
  };
  const GDRAG = T.g0 + 0.6;
  const GHOLD = T.g0 + 2.6;

  // what is on screen at narration time t (not live)
  const segs = [
    {
      t0: 0,
      t1: L("connect").t0 - 0.3,
      run: MAIN,
      keys: [
        [T.hold, 0],
        [T.hold + 3.4, 2.0],
      ],
    },
    { t0: L("connect").t0 - 0.3, t1: L("math").t0, run: MAIN, keys: [[0, 0]] },
    {
      t0: L("math").t0,
      t1: L("tryit").t0,
      run: MAIN,
      keys: [
        [T.flat - 1.2, 0.3],
        [T.flat + 1.6, offRing + 0.05],
      ],
    },
    { t0: L("tryit").t0, t1: T.g0, run: MAIN, keys: [[0, 0]] },
    {
      t0: T.g0,
      t1: T.g1,
      run: GATE,
      gate: true,
      keys: [
        [GHOLD - 0.3, 0],
        [GHOLD + 3.6, 1.6],
      ],
    },
    {
      t0: T.g1,
      t1: L("stop").t0 - 0.2,
      run: MAIN,
      keys: [
        [L("creep").t0, offRing - 0.12],
        [L("creep").t1 - 0.3, settled + 0.1],
      ],
    },
    { t0: L("stop").t0 - 0.2, t1: VOICE.duration + 1, run: null },
  ];
  function viewAt(t) {
    const seg = segs.find((g) => t >= g.t0 && t < g.t1) ?? segs[0];
    if (!seg.run) return { s: null, seg, rate: 0 };
    const { u, rate } = mapKeys(seg.keys, t);
    return { s: sampleAt(seg.run, u), seg, rate, run: seg.run };
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 470, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("goal").t0 - 0.2, x: 760, y: 330, z: 1.25, d: 1.2 },
    { t: L("loop").t0 - 0.3, x: 1330, y: 290, z: 1.55, d: 1.2 },
    { t: L("three").t0 - 0.2, ...FULL, d: 1.2 },
    { t: L("wrap").t0 - 0.2, x: 1100, y: 470, z: 1.3, d: 1.2 },
    { t: L("math").t0 - 0.2, x: 600, y: 360, z: 1.3, d: 1.2 },
    { t: T.flat + 1.0, ...FULL, d: 1.2 },
    { t: T.g0 - 0.6, ...FULL, d: 0.6 },
    { t: L("creep").t0 - 0.3, x: 560, y: 380, z: 1.45, d: 1.2 },
    { t: L("stop").t0 - 0.3, ...FULL, d: 1.0 },
  ];

  // ---- pieces --------------------------------------------------------------------

  // which page of code is up, and which lines are lit
  function codeState(t, live) {
    if (live) return { page: "dtp", hot: s0(live) };
    const lit = (pairs) => {
      let cur = [];
      for (const [at, lines] of pairs) if (t >= at) cur = lines;
      return cur;
    };
    if (t < L("loop").t0 - 0.3)
      return { page: "bind", hot: t >= T.goal ? [1, 2, 3, 4, 5] : [] };
    if (t < L("three").t0 - 0.2)
      return {
        page: "loop",
        hot: lit([
          [Wd("loop", "Start,"), [1]],
          [Wd("loop", "run"), [3]],
          [Wd("loop", "check"), [4, 5]],
          [Wd("loop", "done,") + 0.3, [7]],
          [Wd("loop", "stop"), [9, 13]],
        ]),
        pulse: t >= Wd("loop", "run") && t < Wd("loop", "stop"),
      };
    if (t < L("stop").t0 - 0.2)
      return {
        page: "dtp",
        hot: lit([
          [L("three").t0, [0, 1, 2]],
          [Wd("three", "X,"), [6]],
          [Wd("three", "Y,"), [7]],
          [Wd("three", "heading."), [8, 9, 10, 11]],
          [Wd("three", "Each"), [12, 13]],
          [L("wrap").t0, [3]],
          [L("math").t0, [0, 6]],
          [T.flat - 0.4, [12, 13]],
          [T.g0, [5, 6, 7, 8, 9, 10, 11, 12, 13]],
          [L("creep").t0, [6, 7]],
        ]),
      };
    return {
      page: "end",
      hot: lit([
        [L("stop").t0, [6, 9, 10]],
        [Wd("stop", "idle"), [7, 8]],
      ]),
    };
  }
  const s0 = () => [5, 6, 7, 8, 9, 10, 11, 12, 13];

  function drawCode(ctx, t, live) {
    panel(ctx, CODE);
    const st = codeState(t, live);
    const pg = PAGES[st.page];
    micro(ctx, pg.file, CODE.x + 28, CODE.y + 40);
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 58, CODE.w, 1);
    const pulse = st.pulse ? 0.5 + 0.5 * Math.cos(((t % 0.4) / 0.4) * TAU) : 0;
    let y = CODE.y + 96;
    pg.lines.forEach((ln, i) => {
      if (!ln) {
        y += LH / 2;
        return;
      }
      if (st.hot.includes(i))
        runBar(ctx, CODE.x + 1, y - 20, CODE.w - 2, LH, pulse);
      codeLine(ctx, ln, CODE.x + 28, y, {
        size: CODE_SIZE,
        a: st.hot.length && !st.hot.includes(i) ? 0.55 : 1,
      });
      y += LH;
    });
    // the end page: the Idle line nobody should write, struck through
    if (st.page === "end" && t >= Wd("stop", "idle")) {
      const k = easeOut(ramp(t, Wd("stop", "idle"), 0.4));
      const yy = y + 30;
      ctx.save();
      ctx.globalAlpha = k;
      codeLine(
        ctx,
        "  drivetrain.setControl(new SwerveRequest.Idle());",
        CODE.x + 28,
        yy,
        { size: CODE_SIZE }
      );
      ctx.strokeStyle = C.err;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(CODE.x + 28 + codeW(ctx, 2), yy - 7);
      ctx.lineTo(CODE.x + 28 + codeW(ctx, 51), yy - 7);
      ctx.stroke();
      text(ctx, "not a stop", CODE.x + CODE.w - 28, yy, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "right",
        color: C.err,
      });
      ctx.restore();
    }
  }

  // field-frame velocity -> robot-frame module states
  const modulesFor = (s) => {
    const c = Math.cos(-s.theta);
    const sn = Math.sin(-s.theta);
    return swerveModules(s.vx * c - s.vy * sn, s.vx * sn + s.vy * c, s.w);
  };

  function drawRobot(ctx, F, s, { label = "" } = {}) {
    drawSwerveRobot(ctx, F, s, {
      modules: modulesFor(s),
      label,
      maxSpeed: 4.5,
    });
  }

  // error arrows, the asked velocity, and the top-speed ring
  function drawVectors(ctx, F, s, t, { errs = 0, vel = 0, axes = 0 } = {}) {
    if (!s) return;
    const [rx, ry] = F.P(s.x, s.y);
    const [gx, gy] = F.P(s.goal.x, s.goal.y);
    if (errs > 0) {
      arrow(ctx, rx, ry, gx, gy, {
        color: C.tx2,
        width: 2.5,
        head: 12,
        dash: [8, 6],
        a: errs,
      });
    }
    if (axes > 0) {
      ctx.save();
      ctx.globalAlpha = axes;
      arrow(ctx, rx, ry + 70, gx, ry + 70, { color: C.tx, width: 3, head: 12 });
      text(
        ctx,
        `x error ${(s.goal.x - s.x).toFixed(2)} m`,
        (rx + gx) / 2,
        ry + 100,
        { font: MONO, size: 18, weight: 600, align: "center", color: C.tx }
      );
      arrow(ctx, gx - 70, ry, gx - 70, gy, { color: C.tx, width: 3, head: 12 });
      text(
        ctx,
        `y ${(s.goal.y - s.y).toFixed(2)} m`,
        gx - 82,
        (ry + gy) / 2 + 6,
        { font: MONO, size: 18, weight: 600, align: "right", color: C.tx }
      );
      const he = wrap(s.goal.theta - s.theta);
      ctx.strokeStyle = C.tx;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(rx, ry, 78, -s.theta, -s.theta - he, he > 0);
      ctx.stroke();
      text(ctx, `heading ${(he / D2R).toFixed(0)}°`, rx + 30, ry - 88, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.tx,
      });
      ctx.restore();
    }
    if (vel > 0 && s.asked) {
      const scale = 0.2 * F.s; // px per m/s
      const ax = s.asked.vx;
      const ay = s.asked.vy;
      const m = Math.hypot(ax, ay);
      const ring = MAX_V * scale;
      ctx.save();
      ctx.globalAlpha = vel;
      ctx.strokeStyle = alpha(C.tx3, 0.8);
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(rx, ry, ring, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, "4.54 m/s", rx, ry + ring + 22, {
        font: MONO,
        size: 16,
        align: "center",
        color: C.tx3,
      });
      if (m > 0.01) {
        const ux = ax / m;
        const uy = ay / m;
        const tip = Math.min(m, MAX_V) * scale;
        if (m > MAX_V) {
          arrow(ctx, rx, ry, rx + ux * m * scale, ry - uy * m * scale, {
            color: alpha(C.accent, 0.35),
            width: 3,
            head: 16,
            dash: [10, 8],
          });
          // the clip
          const cx = rx + ux * ring;
          const cy = ry - uy * ring;
          ctx.strokeStyle = C.err;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx - uy * 18, cy - ux * 18);
          ctx.lineTo(cx + uy * 18, cy + ux * 18);
          ctx.stroke();
          text(
            ctx,
            Math.abs(ax) > 5 * Math.abs(ay)
              ? `vx = 10 × ${(ax / KP).toFixed(2)} = ${ax.toFixed(1)} m/s`
              : `asks ${m.toFixed(1)} m/s`,
            rx + ux * m * scale * 0.7,
            ry - uy * m * scale * 0.7 - 22,
            {
              font: MONO,
              size: 20,
              weight: 600,
              align: "center",
              color: C.accent,
            }
          );
        }
        arrow(ctx, rx, ry, rx + ux * tip, ry - uy * tip, {
          color: C.accent,
          width: 6,
          head: 18,
        });
      }
      ctx.restore();
    }
  }

  function drawGoal(ctx, F, goal, a = 1, label = "goal (3, 2, 180°)") {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    drawSwerveRobot(ctx, F, goal, { ghost: true, label });
    ctx.restore();
  }

  function drawFieldPanel(ctx, t, V, live) {
    const s = live ?? V.s;
    const F = drawField(ctx, FIELD, { view: VIEW, labels: true });
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    // who drove so far: a person's trail, for the connect line
    if (!live) {
      const k = window_(t, L("connect").t0 - 0.2, L("goal").t0 + 0.3, 0.4);
      if (k > 0) {
        ctx.save();
        ctx.globalAlpha = k;
        ctx.strokeStyle = alpha(C.tx2, 0.7);
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        const pts = [
          [0.9, 0.9],
          [2.4, 1.0],
          [3.8, 3.2],
          [5.0, 3.3],
          [START.x, START.y],
        ];
        ctx.moveTo(...F.P(...pts[0]));
        for (let i = 1; i < pts.length; i++) ctx.lineTo(...F.P(...pts[i]));
        ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, "driven by a person", ...F.P(2.6, 0.55), {
          font: MONO,
          size: 18,
          color: C.tx2,
          align: "center",
        });
        ctx.restore();
      }
    }
    const goalA = live
      ? 1
      : t >= T.goal - 0.2
        ? easeOut(ramp(t, T.goal - 0.2, 0.5))
        : t >= T.hold && t < L("connect").t0
          ? 1
          : 0;
    if (s) {
      const g = s.goal;
      const lbl =
        g.x === GOAL.x && g.y === GOAL.y
          ? "goal (3, 2, 180°)"
          : `goal (${g.x.toFixed(1)}, ${g.y.toFixed(1)}, ${Math.round(wrap(g.theta) / D2R)}°)`;
      // the scripted gate drags the goal from the old spot to the new one
      if (!live && V.seg.gate) {
        const k = easeInOut(ramp(t, GDRAG, 1.4));
        const gg = {
          x: lerp(GOAL.x, GATE_GOAL.x, k),
          y: lerp(GOAL.y, GATE_GOAL.y, k),
          theta: lerp(GOAL.theta, GATE_GOAL.theta, k),
        };
        drawGoal(ctx, F, gg, 1, k < 1 ? "goal" : lbl);
        if (t < GHOLD) {
          const [hx, hy] = F.P(gg.x, gg.y);
          drawHand(ctx, hx + 18, hy + 18, t >= GDRAG && t < GDRAG + 1.4);
        }
      } else drawGoal(ctx, F, g, goalA, lbl);
      // trail
      if (!live && V.run && V.s.u > 0) {
        ctx.fillStyle = alpha(C.accent, 0.5);
        for (let u = 0; u < V.s.u; u += 0.04) {
          const p = sampleAt(V.run, u);
          const [px, py] = F.P(p.x, p.y);
          ctx.fillRect(px - 2, py - 2, 4, 4);
        }
      }
      if (live) {
        ctx.fillStyle = alpha(C.accent, 0.5);
        for (const [px, py] of live.trail.map((p) => F.P(p[0], p[1])))
          ctx.fillRect(px - 2, py - 2, 4, 4);
      }
      drawRobot(ctx, F, s);
      const errs = live
        ? 1
        : window_(t, L("three").t0 - 0.2, L("wrap").t0, 0.3) +
          window_(t, L("creep").t0, L("stop").t0 - 0.2, 0.3);
      const axes = live
        ? 0
        : window_(t, Wd("three", "X,") - 0.3, L("wrap").t0, 0.3);
      const vel = live
        ? 1
        : t >= Wd("math", "ten,") - 0.2 && t < L("tryit").t0
          ? easeOut(ramp(t, Wd("math", "ten,") - 0.2, 0.5))
          : t >= T.g0 && t < T.g1
            ? 1
            : t >= L("creep").t0 && t < L("stop").t0 - 0.2
              ? 1
              : 0;
      // on the math line, show the ask before the robot moves
      const showS =
        !live && t >= L("math").t0 && t < T.flat - 1.2
          ? { ...s, asked: ask(s, s.goal) }
          : s;
      drawVectors(ctx, F, showS, t, { errs: Math.min(1, errs), vel, axes });
    }
    ctx.restore();
    // robot clock
    if (!live && V.rate > 0 && V.rate < 0.95)
      text(
        ctx,
        `robot clock · slow motion ×${V.rate.toFixed(2)}`,
        FIELD.x + FIELD.w - 16,
        FIELD.y + 30,
        { font: MONO, size: 18, weight: 600, align: "right", color: C.accent }
      );
    if (live)
      text(
        ctx,
        "robot clock · slow motion ×0.50",
        FIELD.x + FIELD.w - 16,
        FIELD.y + 30,
        { font: MONO, size: 18, weight: 600, align: "right", color: C.accent }
      );
    return F;
  }

  function drawHand(ctx, x, y, pressed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = pressed ? C.accent : C.tx;
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
    text(ctx, "drag", x + 30, y + 20, {
      font: MONO,
      size: 18,
      weight: 600,
      color: pressed ? C.accent : C.tx2,
    });
  }

  function drawCard(ctx, s, t, live) {
    const r = s?.req;
    const kind = s?.kind ?? "none";
    const name =
      kind === "field"
        ? "ApplyFieldVelocity"
        : kind === "zero"
          ? "ApplyFieldVelocity · zero"
          : kind === "idle"
            ? "Idle"
            : "none";
    const col = kind === "idle" ? C.err : kind === "none" ? C.tx3 : C.accent;
    const f = (v) => (r ? v.toFixed(2) : "–");
    drawMotorCard(ctx, CARD, {
      title: "drivetrain · request",
      led: col,
      rows: [
        ["request", name, col, 24],
        [
          "vx  vy  (m/s) · ω  (rad/s)",
          `${f(r?.vx ?? 0)}  ${f(r?.vy ?? 0)} · ${f(r?.w ?? 0)}`,
          C.tx,
          24,
        ],
      ],
    });
    // the pose, as the robot reports it
    if (s)
      drawPoseReadout(ctx, CARD.x + 24, CARD.y + CARD.h - 50, s, {
        title: "pose · getPose()",
        color: C.tx2,
      });
  }

  // heading on a dial: -180..180, the seam on the left
  function drawDial(ctx, t, s, live) {
    panel(ctx, DIAL, C.bg2);
    micro(ctx, "heading · radians wrap at ±π", DIAL.x + 22, DIAL.y + 34);
    const cx = DIAL.x + DIAL.w / 2;
    const cy = DIAL.y + 190;
    const R = 112;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    // the seam
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(cx - R - 22, cy);
    ctx.lineTo(cx - R + 22, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "±180°", cx - R - 28, cy - 14, {
      font: MONO,
      size: 17,
      align: "right",
      color: C.tx3,
    });
    text(ctx, "0°", cx + R + 14, cy + 6, {
      font: MONO,
      size: 17,
      color: C.tx3,
    });
    text(ctx, "90°", cx, cy - R - 14, {
      font: MONO,
      size: 17,
      align: "center",
      color: C.tx3,
    });
    const needle = (a, color, w, dashed = false) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      if (dashed) ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (R - 8), cy - Math.sin(a) * (R - 8));
      ctx.stroke();
      ctx.setLineDash([]);
    };
    const wrapOn = !live && t >= L("wrap").t0 - 0.2 && t < L("math").t0 - 0.2;
    if (!wrapOn) {
      if (!s) return;
      needle(s.goal.theta, C.accent, 3, true);
      needle(s.theta, C.tx, 5);
      text(
        ctx,
        `robot ${Math.round(wrap(s.theta) / D2R)}°   goal ${Math.round(wrap(s.goal.theta) / D2R)}°`,
        cx,
        DIAL.y + DIAL.h - 16,
        { font: MONO, size: 18, align: "center", color: C.tx2 }
      );
      return;
    }
    // the wrap demo: 179° asked for -179°
    const from = 179 * D2R;
    const to = -179 * D2R;
    const tLong = Wd("wrap", "Otherwise,");
    const tShort = Wd("wrap", "around.") + 0.5;
    let cur = from;
    if (t >= tLong && t < tShort)
      cur = from - easeInOut(ramp(t, tLong + 0.3, 2.4)) * (358 * D2R);
    if (t >= tShort) cur = from + easeInOut(ramp(t, tShort, 0.7)) * (2 * D2R);
    needle(to, C.accent, 3, true);
    if (t >= tLong && t < tShort) {
      ctx.strokeStyle = alpha(C.err, 0.85);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 14, -from, -cur, false);
      ctx.stroke();
      text(ctx, "error = −358° · the long way", cx, DIAL.y + DIAL.h - 16, {
        font: MONO,
        size: 19,
        weight: 600,
        align: "center",
        color: C.err,
      });
    }
    if (t >= tShort) {
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 14, -from, -from - 2 * D2R, true);
      ctx.stroke();
      text(ctx, "continuous input · error = 2°", cx, DIAL.y + DIAL.h - 16, {
        font: MONO,
        size: 19,
        weight: 600,
        align: "center",
        color: C.accent,
      });
    }
    needle(cur, C.tx, 5);
    text(ctx, "179°", cx - R + 4, cy - 26, {
      font: MONO,
      size: 17,
      color: C.tx2,
    });
    text(ctx, "−179°", cx - R + 4, cy + 38, {
      font: MONO,
      size: 17,
      color: C.accent,
    });
  }

  // speed over the trip, the page's Drivetrain/TranslationSpeedMps graph
  function drawSpeed(ctx, t, V, live) {
    let pts = [];
    let askPts = [];
    let now = null;
    if (live) {
      pts = live.hist.map((h) => [h.u, h.v]);
      askPts = live.hist.map((h) => [h.u, Math.min(h.a, 5.6)]);
      now = live.hist.at(-1)?.u ?? null;
    } else if (V.run && V.s.u > 0) {
      for (let u = 0; u <= V.s.u; u += 1 / 60) {
        const p = sampleAt(V.run, u);
        pts.push([u, Math.hypot(p.vx, p.vy)]);
        if (p.asked)
          askPts.push([u, Math.min(Math.hypot(p.asked.vx, p.asked.vy), 5.6)]);
      }
      now = V.s.u;
    }
    const P = drawPlot(ctx, PLOT, {
      title: "Drivetrain/TranslationSpeedMps",
      t0: 0,
      t1: 2.2,
      v0: 0,
      v1: 6,
      playhead: now,
      series: [
        { pts: askPts, color: alpha(C.tx3, 0.9), dashed: true, width: 2.5 },
        { pts, color: C.accent },
      ],
    });
    ctx.strokeStyle = alpha(C.err, 0.7);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(P.X(0), P.Y(MAX_V));
    ctx.lineTo(P.X(2.2), P.Y(MAX_V));
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "top speed 4.54", P.X(2.2), P.Y(MAX_V) - 8, {
      font: MONO,
      size: 16,
      align: "right",
      color: C.tx3,
    });
    text(ctx, "- - asked", PLOT.x + PLOT.w - 24, PLOT.y + 34, {
      font: MONO,
      size: 16,
      align: "right",
      color: C.tx3,
    });
    text(ctx, "m/s", PLOT.x + 10, PLOT.y + 66, {
      font: MONO,
      size: 16,
      color: C.tx3,
    });
    text(ctx, "s", PLOT.x + PLOT.w - 18, PLOT.y + PLOT.h - 12, {
      font: MONO,
      size: 16,
      color: C.tx3,
    });
  }

  // the creep, magnified, and the shape it makes
  function drawCreep(ctx, t, s) {
    const a = window_(t, L("creep").t0 + 0.2, L("stop").t0 - 0.3, 0.4);
    if (a <= 0 || !s) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 440, y: 70, w: 480, h: 230 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = alpha(C.bg2, 0.96);
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const e = Math.hypot(s.goal.x - s.x, s.goal.y - s.y);
    micro(ctx, "close to the goal", R.x + 22, R.y + 36);
    text(ctx, `error  ${(e * 100).toFixed(1)} cm`, R.x + 22, R.y + 82, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.tx,
    });
    text(ctx, `asks   ${(KP * e).toFixed(2)} m/s`, R.x + 22, R.y + 120, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.accent,
    });
    const stalled = KP * e < LOSS + 0.02 && Math.hypot(s.vx, s.vy) < 0.02;
    text(
      ctx,
      stalled ? "too little to turn the wheels" : "shrinking with the gap",
      R.x + 22,
      R.y + 160,
      { font: MONO, size: 19, color: stalled ? C.err : C.tx2 }
    );
    // falls short, the tuning shape
    const ox = R.x + 22;
    const oy = R.y + 214;
    micro(ctx, "falls short", R.x + R.w - 22, R.y + 36, {
      align: "right",
      color: C.accent,
      size: 16,
    });
    ctx.strokeStyle = alpha(C.tx3, 0.8);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ox + 230, R.y + 182);
    ctx.lineTo(ox + 360, R.y + 182);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const x = ox + 230 + (i / 40) * 130;
      const y = oy - 6 - (1 - Math.exp(-i / 8)) * 20;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // release mid-trip: end(true) sends zero, Idle sends nothing new
  function drawStop(ctx, t) {
    const a = easeOut(ramp(t, L("stop").t0 - 0.2, 0.5));
    const u = clamp(0.2 + (t - (L("stop").t0 + 0.1)) * 0.2, 0, 2.9);
    const rel = Wd("stop", "Let");
    const uu = t < rel ? Math.min(u, 0.74) : Math.max(0.76, u);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(FIELD.x - 4, FIELD.y - 4, FIELD.w + 8, FIELD.h + 8);
    const half = (FIELD.h - 16) / 2;
    const rows = [
      {
        run: ZERO,
        R: { x: FIELD.x, y: FIELD.y, w: FIELD.w, h: half },
        title: "end(true) · zero ChassisVelocities",
        bad: false,
        show: 0,
      },
      {
        run: IDLE,
        R: { x: FIELD.x, y: FIELD.y + half + 16, w: FIELD.w, h: half },
        title: "SwerveRequest.Idle instead",
        bad: true,
        show: Wd("stop", "Sending") - 0.2,
      },
    ];
    for (const r of rows) {
      const k = easeOut(ramp(t, r.show, 0.4));
      if (k <= 0) continue;
      ctx.save();
      ctx.globalAlpha *= k;
      const F = drawField(ctx, r.R, {
        view: { x0: -0.3, y0: 1.0, x1: 7.6, y1: 3.8 },
        labels: false,
        axes: false,
      });
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.R.x, r.R.y, r.R.w, r.R.h);
      ctx.clip();
      const s = sampleAt(r.run, r.bad ? uu : uu);
      drawSwerveRobot(ctx, F, GOAL, { ghost: true });
      ctx.fillStyle = alpha(r.bad ? C.err : C.accent, 0.5);
      for (let q = 0; q < s.u; q += 0.04) {
        const p = sampleAt(r.run, q);
        const [px, py] = F.P(p.x, p.y);
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
      drawRobot(ctx, F, s);
      ctx.restore();
      rrect(ctx, r.R.x + 12, r.R.y + 12, 470, 40, 4);
      ctx.fillStyle = alpha(C.bg, 0.85);
      ctx.fill();
      text(ctx, r.title, r.R.x + 26, r.R.y + 40, {
        font: MONO,
        size: 20,
        weight: 600,
        color: r.bad ? C.err : C.accent,
      });
      const sp = Math.hypot(s.vx, s.vy);
      const released = s.u > 0.76;
      const note = !released
        ? "B held"
        : r.bad
          ? `still rolling · ${sp.toFixed(2)} m/s`
          : sp < 0.02
            ? "stopped"
            : `stopping · ${sp.toFixed(2)} m/s`;
      text(ctx, note, r.R.x + r.R.w - 20, r.R.y + 40, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "right",
        color: released && r.bad ? C.err : C.tx2,
      });
      ctx.restore();
    }
    ctx.restore();
    return sampleAt(t >= Wd("stop", "Sending") ? IDLE : ZERO, uu);
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
    micro(ctx, "Workshop 6 · Drive to Point", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Speed From Distance", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Speed from distance gets you there,", W / 2, 450, {
      font: SERIF,
      size: 80,
      align: "center",
    });
    text(ctx, "badly.", W / 2, 556, {
      font: SERIF,
      size: 80,
      align: "center",
      color: C.accent,
    });
    text(ctx, "Next, plan the trip.", W / 2, 660, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "Next,") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const V = live ? { s: live, seg: {}, rate: 0.5 } : viewAt(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawCode(ctx, t, live);
    drawFieldPanel(ctx, t, V, live);
    let s = live ?? V.s;
    if (!live && t >= L("stop").t0 - 0.2) s = drawStop(ctx, t);
    drawCard(ctx, s, t, live);
    drawDial(ctx, t, s, live);
    drawSpeed(
      ctx,
      t,
      live ? V : t >= L("stop").t0 - 0.2 ? { run: null } : V,
      live
    );
    if (!live) drawCreep(ctx, t, V.s);
    const held = s?.held ?? false;
    const person =
      !live && t >= L("connect").t0 - 0.3 && t < Wd("connect", "Now");
    drawPad(ctx, { b: held, left: person ? { x: -0.3, y: 0.8 } : null });
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate ---------------------------------------------------------------------

  function liveGate() {
    const s = { ...fresh(START, GOAL), time: gate.t0, trail: [], hist: [] };
    let phase = "drag";
    let moved = false;
    let doneAt = null;
    let dragging = false;
    let F = null;
    const presets = [
      GATE_GOAL,
      { x: 2.0, y: 3.2, theta: -Math.PI / 2 },
      { x: 5.0, y: 0.9, theta: 0 },
      GOAL,
    ];
    let pi = -1;
    const setGoal = (g) => {
      s.goal = {
        x: clamp(g.x, 0.6, 7.6),
        y: clamp(g.y, 0.6, 3.7),
        theta: g.theta,
      };
      if (phase === "drag") phase = "hold";
    };
    const toField = (px, py) => {
      F ??= {
        X0: FIELD.x,
        s: Math.min(
          FIELD.w / (VIEW.x1 - VIEW.x0),
          FIELD.h / (VIEW.y1 - VIEW.y0)
        ),
      };
      const sc = F.s;
      const ox =
        FIELD.x + (FIELD.w - (VIEW.x1 - VIEW.x0) * sc) / 2 - VIEW.x0 * sc;
      const oy =
        FIELD.y +
        FIELD.h -
        (FIELD.h - (VIEW.y1 - VIEW.y0) * sc) / 2 +
        VIEW.y0 * sc;
      return [(px - ox) / sc, (oy - py) / sc];
    };
    return {
      state: s,
      prompt: () =>
        ({
          drag: "Drag the goal somewhere else (or press G).",
          hold: "Now hold B.",
          drive: "Bolting at top speed, then creeping.",
          done: "There, give or take a few centimeters.",
        })[phase],
      input(k, v) {
        if (k === "goal" && v) {
          pi = (pi + 1) % presets.length;
          setGoal(presets[pi]);
        }
        if (k === "hold") {
          s.held = v;
          if (v && phase !== "done") phase = "drive";
          if (!v && moved && doneAt == null) {
            phase = "done";
            doneAt = s.time;
          }
        }
      },
      pointer(type, x, y) {
        const [fx, fy] = toField(x, y);
        if (type === "down" && Math.hypot(fx - s.goal.x, fy - s.goal.y) < 0.8)
          dragging = true;
        if (type === "move" && dragging)
          setGoal({ x: fx, y: fy, theta: s.goal.theta });
        if (type === "up") dragging = false;
      },
      step(dt) {
        const d = dt * 0.5;
        step(s, d);
        s.time += dt;
        if (s.held) {
          if (!s.t0) s.t0 = s.u;
          s.hist.push({
            u: s.u - s.t0,
            v: Math.hypot(s.vx, s.vy),
            a: s.asked ? Math.hypot(s.asked.vx, s.asked.vy) : 0,
          });
          if (s.hist.length > 400) s.hist.shift();
        }
        s.trail.push([s.x, s.y]);
        if (s.trail.length > 120) s.trail.shift();
        if (Math.hypot(s.x - START.x, s.y - START.y) > 0.5) moved = true;
        if (
          s.held &&
          moved &&
          Math.hypot(s.vx, s.vy) < 0.01 &&
          doneAt == null
        ) {
          phase = "done";
          doneAt = s.time;
        }
        return doneAt !== null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (!gate || t < gate.t0 || t >= gate.t1) return null;
    if (t < GDRAG + 1.4) return "Drag the goal somewhere else.";
    if (t < GHOLD) return "Now hold B.";
    if (t < GHOLD + 2.2) return "Bolting at top speed, then creeping.";
    return "There, give or take a few centimeters.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      { k: "hold", label: "Hold B", key: "Space", kind: "hold" },
      { k: "goal", label: "Move goal", key: "KeyG", kind: "press" },
    ],
  };
}
