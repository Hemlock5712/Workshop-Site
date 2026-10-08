// A Path That Knows Where It Ends. Leave Start again, as a drawn path instead of a timer.
//
// What is simulated, and how:
//   the path      one cubic Bezier from the tape mark, about two meters out, the heading
//                 turning from 0 to 45 degrees along it. Sampled by arc length and run on a
//                 trapezoid at the page's Global Constraints, 2 m/s and 2 m/s^2. That is the
//                 setpoint: the ghost robot.
//   following     the robot trails the setpoint a little, and any push off the line is an
//                 error the PPHolonomicDriveController pulls back: a damped spring on the
//                 error, deterministic, standing in for "your gains".
//   events        Neutral Zone Run's first path with its Intake zone: Intake starts when the
//                 robot enters the zone and is canceled when it leaves.
// Recorded beats (Robot Config, drawing the path, the auto) are drawn as plain schematics
// with drawToolWindow, one function each, until the footage is captured.

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
  drawField,
  drawPoseReadout,
  drawSwerveRobot,
  drawTimeline,
  drawToolWindow,
  panel,
  swerveModules,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const FIELD = { x: 60, y: 90, w: 1080, h: 740 };
const VIEW = { x0: 1.0, y0: 2.3, x1: 5.4, y1: 5.9 };
const SIDE = { x: 1180, y: 90, w: 690, h: 740 };
const TAPE = { x: 2.0, y: 4.0 };
const TAU = Math.PI * 2;

// ---- the path ------------------------------------------------------------------------

const BEZ = [
  [2.0, 4.0],
  [2.85, 4.0],
  [3.15, 4.55],
  [3.9, 4.6],
];
const END_HEADING = Math.PI / 4;
function bez(P, u) {
  const m = 1 - u;
  return [0, 1].map(
    (k) =>
      m * m * m * P[0][k] +
      3 * m * m * u * P[1][k] +
      3 * m * u * u * P[2][k] +
      u * u * u * P[3][k]
  );
}
function arcTable(P) {
  const pts = [];
  let len = 0;
  let prev = bez(P, 0);
  for (let i = 0; i <= 400; i++) {
    const p = bez(P, i / 400);
    len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    pts.push({ x: p[0], y: p[1], d: len });
    prev = p;
  }
  return { pts, len };
}
function atDist(A, d) {
  const dd = clamp(d, 0, A.len);
  let i = A.pts.findIndex((p) => p.d >= dd);
  if (i <= 0) i = 1;
  const a = A.pts[i - 1];
  const b = A.pts[i];
  const k = b.d > a.d ? (dd - a.d) / (b.d - a.d) : 0;
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  const n = Math.hypot(tx, ty) || 1;
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), tx: tx / n, ty: ty / n };
}
const PATH = arcTable(BEZ);

// trapezoid along the path: 2 m/s, 2 m/s^2, ends at rest
function profile(len, vmax = 2, acc = 2) {
  const ta = vmax / acc;
  const da = 0.5 * acc * ta * ta;
  if (2 * da > len) {
    const tp = Math.sqrt(len / acc);
    return {
      T: 2 * tp,
      at: (t) =>
        t < tp ? 0.5 * acc * t * t : len - 0.5 * acc * (2 * tp - t) ** 2,
      vAt: (t) => (t < tp ? acc * t : acc * Math.max(0, 2 * tp - t)),
    };
  }
  const tc = (len - 2 * da) / vmax;
  const T = 2 * ta + tc;
  return {
    T,
    at: (t) =>
      t <= 0
        ? 0
        : t < ta
          ? 0.5 * acc * t * t
          : t < ta + tc
            ? da + vmax * (t - ta)
            : t < T
              ? len - 0.5 * acc * (T - t) ** 2
              : len,
    vAt: (t) =>
      t <= 0
        ? 0
        : t < ta
          ? acc * t
          : t < ta + tc
            ? vmax
            : t < T
              ? acc * (T - t)
              : 0,
  };
}
const PROF = profile(PATH.len);

const SR = 120;
const K = 30; // the correction, a damped spring on the error
const D = 9;

// One run of the path. shoves: robot times at which the robot gets pushed sideways.
function simulate(shoves = [], dur = 4.5) {
  const out = [];
  let ex = 0;
  let ey = 0;
  let vx = 0;
  let vy = 0;
  const dt = 1 / SR;
  const pending = [...shoves].sort((a, b) => a - b);
  for (let i = 0; i <= Math.ceil(dur * SR); i++) {
    const u = i / SR;
    while (pending.length && pending[0] <= u) {
      pending.shift();
      // a shove to the robot's right of the path
      const p = atDist(PATH, PROF.at(Math.min(u, PROF.T)));
      vx += p.ty * 3.2;
      vy += -p.tx * 3.2;
    }
    const d = PROF.at(u);
    const p = atDist(PATH, d);
    const v = PROF.vAt(u);
    const frac = d / PATH.len;
    const th = END_HEADING * easeInOut(frac);
    // the robot trails the setpoint by a hair while it moves
    const lag = 0.06 * (v / 2);
    const rx = p.x - p.tx * lag + ex;
    const ry = p.y - p.ty * lag + ey;
    const corr = { x: -ex * K * 0.12 - vx * 0.1, y: -ey * K * 0.12 - vy * 0.1 };
    out.push({
      u,
      sp: { x: p.x, y: p.y, theta: th },
      rb: { x: rx, y: ry, theta: th - 0.04 * (v / 2) },
      v,
      tx: p.tx,
      ty: p.ty,
      err: Math.hypot(ex, ey),
      ex,
      ey,
      corr,
      done: u >= PROF.T,
    });
    const ax = -K * ex - D * vx;
    const ay = -K * ey - D * vy;
    vx += ax * dt;
    vy += ay * dt;
    ex += vx * dt;
    ey += vy * dt;
  }
  return out;
}
const sampleAt = (run, u) => run[clamp(Math.floor(u * SR), 0, run.length - 1)];

function mapKeys(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ta, ua] = keys[i - 1];
    const [tb, ub] = keys[i];
    if (t <= tb) return ua + ((ub - ua) * (t - ta)) / (tb - ta);
  }
  const [ta, ua] = keys.at(-1);
  return ua + (t - ta);
}

// ---- the events path: Start to Neutral Zone, with its Intake zone ----------------------

const NZ = arcTable([
  [1.6, 2.0],
  [3.6, 2.0],
  [5.0, 1.2],
  [7.6, 1.4],
]);
const NZ_PROF = profile(NZ.len);
const ZONE = [0.52, 0.8]; // fraction of the path's length

// ---- the code -------------------------------------------------------------------------

const BUILDER = [
  ["import com.pathplanner.lib.command3.AutoBuilder;", "imp"],
  ["", null],
  ["AutoBuilder.configure(", null],
  ["    () -> getPose(),", "where"],
  ["    pose -> resetPose(pose),", "reset"],
  ["    () -> getRobotVelocity(),", "fast"],
  [
    "    speeds -> drivetrain.setControl(pathRequest.withVelocity(speeds)),",
    "drive",
  ],
  ["    new PPHolonomicDriveController(", "pid"],
  [
    "        new PIDConstants(5.0, 0.0, 0.0), new PIDConstants(5.0, 0.0, 0.0)),",
    "pid",
  ],
  ["    loadPathConfig(),", null],
  [
    "    () -> MatchState.getAlliance().orElse(Alliance.BLUE) == Alliance.RED,",
    null,
  ],
  ["    this);", null],
];
const BUILDER_NOTES = {
  where: "where the robot is",
  reset: "how to reset that",
  fast: "how fast it's moving",
  drive: "how to drive it",
};

const OPMODE = [
  ['@Autonomous(name = "Auto")', null],
  ["public class AutoOpMode extends PeriodicOpMode {", null],
  ["  private final Selectable<Command> autoChooser;", null],
  ["  private Command routine;", null],
  ["", null],
  ["  public AutoOpMode(Robot robot) {", null],
  ["    NamedCommands.registerCommand(", "reg"],
  ['        "Shoot",', "reg"],
  [
    '        Command.noRequirements(coroutine -> coroutine.wait(Seconds.of(1.0))).named("Shoot"));',
    "reg",
  ],
  ["    NamedCommands.registerCommand(", "reg"],
  [
    '        "Intake", Command.noRequirements(coroutine -> coroutine.park()).named("Intake"));',
    "reg",
  ],
  ["", null],
  ['    autoChooser = AutoBuilder.buildAutoChooser("Leave Start");', "build"],
  ['    Tunables.publish("Auto", autoChooser);', "build"],
  ["  }", null],
  ["", null],
  ["  @Override", null],
  ["  public void start() {", "read"],
  ["    routine = autoChooser.getSelected();", "read"],
  ["    Scheduler.getDefault().schedule(routine);", "read"],
  ["  }", null],
  ["", null],
  ["  @Override", null],
  ["  public void end() {", null],
  ["    Scheduler.getDefault().cancel(routine);", null],
  ["  }", null],
  ['  // close() takes the drop-down off: Tunables.remove("Auto")', null],
  ["}", null],
];

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const FOLLOW = simulate([1.0], 4.5);
  const tFollow = L("follow").t0 + 0.3;
  const followKeys = [
    [tFollow, 0],
    [L("follow").t1 + 0.2, PROF.T + 0.9],
  ];
  const GATE_SHOVE = 0.9;
  const RATE = 0.45; // the live and scripted gate run in slow motion
  const GATE = simulate([GATE_SHOVE], 4.5);
  const tGate = gate.t0 + 0.6;

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 500, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("intro").t0 - 0.4, x: 600, y: 460, z: 1.25, d: 0.01 },
    { t: L("pathauto").t0 - 0.2, ...FULL, d: 1.0 },
  ];

  // ---- the field ------------------------------------------------------------------

  function pathCurve(
    ctx,
    F,
    A,
    { a = 1, upto = 1, color = C.accent, width = 4, dash = null } = {}
  ) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    const n = Math.max(2, Math.round(A.pts.length * upto));
    A.pts
      .slice(0, n)
      .forEach((p, i) =>
        i ? ctx.lineTo(...F.P(p.x, p.y)) : ctx.moveTo(...F.P(p.x, p.y))
      );
    ctx.stroke();
    ctx.restore();
  }

  function tape(ctx, F, a = 1) {
    const [cx, cy] = F.P(TAPE.x, TAPE.y);
    const h = 0.47 * F.s;
    const l = 0.22 * F.s;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = C.tx2;
    ctx.lineWidth = 5;
    for (const [sx, sy] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx + sx * h - sx * l, cy + sy * h);
      ctx.lineTo(cx + sx * h, cy + sy * h);
      ctx.lineTo(cx + sx * h, cy + sy * h - sy * l);
      ctx.stroke();
    }
    ctx.restore();
    text(ctx, "tape mark", cx, cy + h + 26, {
      font: MONO,
      size: 18,
      align: "center",
      color: C.tx3,
      a,
    });
  }

  // the timer's three end spots, from Autonomous
  const TIMER_ENDS = [
    { x: 3.36, y: 4.012 },
    { x: 3.31, y: 3.982 },
    { x: 3.41, y: 4.004 },
  ];
  const PATH_ENDS = [
    { x: 3.9, y: 4.603 },
    { x: 3.905, y: 4.596 },
    { x: 3.896, y: 4.599 },
  ];

  function drawLeaveField(ctx, t, s, live) {
    const F = drawField(ctx, FIELD, { view: VIEW, axes: false, labels: false });
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    tape(ctx, F);
    // intro: the timer's scatter, then the path
    if (!live && t < L("pathauto").t0 + 0.2) {
      const k = easeOut(ramp(t, L("intro").t0, 0.6));
      TIMER_ENDS.forEach((e) =>
        drawSwerveRobot(
          ctx,
          F,
          { ...e, theta: 0 },
          { ghost: true, color: alpha(C.tx3, 0.8 * k) }
        )
      );
      text(ctx, "timer · three runs, three spots", ...F.P(3.36, 3.35), {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.tx2,
        a: k,
      });
      const p = easeInOut(ramp(t, Wd("intro", "path") - 0.1, 1.0));
      if (p > 0) {
        pathCurve(ctx, F, PATH, { upto: p });
        if (p >= 1)
          drawSwerveRobot(
            ctx,
            F,
            { x: 3.9, y: 4.6, theta: END_HEADING },
            { ghost: true, label: "the path's end" }
          );
      }
    } else {
      pathCurve(ctx, F, PATH, { a: 0.7, dash: [10, 8], width: 3 });
      drawSwerveRobot(
        ctx,
        F,
        { x: 3.9, y: 4.6, theta: END_HEADING },
        { ghost: true, color: alpha(C.tx3, 0.9), label: "goal · 45°" }
      );
    }
    if (s) {
      drawSwerveRobot(ctx, F, s.sp, { ghost: true, label: "setpoint" });
      // robot-relative velocity for the wheels
      const fvx = s.tx * s.v - s.ex * 2;
      const fvy = s.ty * s.v - s.ey * 2;
      const c = Math.cos(s.rb.theta);
      const sn = Math.sin(s.rb.theta);
      const mods = swerveModules(
        c * fvx + sn * fvy,
        -sn * fvx + c * fvy,
        s.v * 0.35
      );
      drawSwerveRobot(ctx, F, s.rb, { modules: mods, maxSpeed: 2.4 });
      // the correction: from the robot toward where the plan says it should be
      const em = Math.hypot(s.ex, s.ey);
      if (em > 0.01) {
        const [ax, ay] = F.P(s.rb.x, s.rb.y);
        const len = 0.25 + Math.min(1, em * 4) * 0.5;
        const [bx, by] = F.P(
          s.rb.x - (s.ex / em) * len,
          s.rb.y - (s.ey / em) * len
        );
        arrow(ctx, ax, ay, bx, by, C.accent, 5);
        text(ctx, "correction", bx - 20, by + 6, {
          font: MONO,
          size: 19,
          weight: 600,
          align: "right",
          color: C.accent,
        });
      }
    } else if (live || t >= L("pathauto").t0 + 0.2) {
      drawSwerveRobot(ctx, F, { x: TAPE.x, y: TAPE.y, theta: 0 }, {});
    }
    ctx.restore();
    if (s)
      drawPoseReadout(ctx, FIELD.x, FIELD.y + FIELD.h + 40, s.rb, {
        title: "Drivetrain/Pose",
      });
    return F;
  }

  function arrow(ctx, x0, y0, x1, y1, color, w = 4) {
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1 - Math.cos(ang) * 10, y1 - Math.sin(ang) * 10);
    ctx.stroke();
    ctx.translate(x1, y1);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-14, -10);
    ctx.lineTo(-14, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // the controller's readout beside the field, while following
  function drawFollowPanel(ctx, s, rateLabel) {
    panel(ctx, SIDE, C.bg2);
    micro(ctx, "PPHolonomicDriveController", SIDE.x + 28, SIDE.y + 44);
    const rows = [
      ["setpoint speed", `${(s ? s.v : 0).toFixed(2)} m/s`],
      ["off the path", `${((s ? s.err : 0) * 100).toFixed(0)} cm`],
      [
        "heading",
        `${(((s ? s.sp.theta : 0) * 180) / Math.PI).toFixed(0)}° → 45°`,
      ],
    ];
    rows.forEach(([l, v], i) => {
      micro(ctx, l, SIDE.x + 28, SIDE.y + 110 + i * 100, { size: 17 });
      text(ctx, v, SIDE.x + 28, SIDE.y + 154 + i * 100, {
        font: MONO,
        size: 36,
        weight: 600,
        color: i === 1 && s && s.err > 0.03 ? C.accent : C.tx,
      });
    });
    // error bar
    const ek = clamp((s ? s.err : 0) / 0.3);
    ctx.fillStyle = alpha(C.tx3, 0.25);
    ctx.fillRect(SIDE.x + 28, SIDE.y + 420, SIDE.w - 56, 8);
    ctx.fillStyle = C.accent;
    ctx.fillRect(SIDE.x + 28, SIDE.y + 420, (SIDE.w - 56) * ek, 8);
    text(
      ctx,
      "the plan moves ahead; the robot drives toward it",
      SIDE.x + 28,
      SIDE.y + 490,
      { font: SANS, size: 22, color: C.tx2 }
    );
    text(
      ctx,
      "a push off the line is error, and error is correction",
      SIDE.x + 28,
      SIDE.y + 526,
      { font: SANS, size: 22, color: C.tx2 }
    );
    if (s?.done)
      text(
        ctx,
        "finished on the waypoint, turned to 45°",
        SIDE.x + 28,
        SIDE.y + 600,
        { font: MONO, size: 21, weight: 600, color: C.accent }
      );
    if (rateLabel)
      text(ctx, rateLabel, SIDE.x + SIDE.w - 28, SIDE.y + 44, {
        font: MONO,
        size: 17,
        weight: 600,
        align: "right",
        color: C.tx3,
      });
  }

  // an auto's command list, the way the app stacks it
  function drawAutoList(ctx, R, name, items, lit, a = 1) {
    ctx.save();
    ctx.globalAlpha *= a;
    panel(ctx, R, C.bg2);
    micro(ctx, `auto · ${name}`, R.x + 28, R.y + 44);
    items.forEach(([label, kind], i) => {
      const y = R.y + 74 + i * 86;
      const on = lit(i);
      rrect(ctx, R.x + 28, y, R.w - 56, 68, 4);
      ctx.fillStyle = on ? alpha(C.accent, 0.16) : C.bg3;
      ctx.fill();
      ctx.strokeStyle = on ? C.accent : C.rule;
      ctx.lineWidth = on ? 2.5 : 1.5;
      if (kind === "named") ctx.setLineDash([7, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      micro(ctx, kind === "path" ? "path" : "named command", R.x + 48, y + 28, {
        size: 15,
        color: on ? C.accent : C.tx3,
      });
      text(ctx, label, R.x + 48, y + 56, {
        font: MONO,
        size: 22,
        weight: 600,
        color: on ? C.tx : C.tx2,
      });
      if (i < items.length - 1) {
        ctx.fillStyle = C.tx3;
        ctx.fillRect(R.x + R.w / 2 - 1, y + 68, 2, 18);
      }
    });
    ctx.restore();
  }

  // ---- beats ----------------------------------------------------------------------

  function beatPathAuto(ctx, t) {
    const a = window_(t, L("pathauto").t0 - 0.2, L("config").t0 - 0.2, 0.4);
    if (a <= 0) return;
    const curve = window_(t, Wd("pathauto", "path") - 0.2, L("config").t0, 0.3);
    const list = ramp(t, Wd("pathauto", "auto") - 0.2, 0.4);
    ctx.save();
    ctx.globalAlpha *= a;
    if (curve > 0)
      text(
        ctx,
        "a path · one curve, start pose to end pose",
        FIELD.x + 30,
        FIELD.y + 50,
        { font: MONO, size: 22, weight: 600, color: C.accent, a: curve }
      );
    drawAutoList(
      ctx,
      { x: SIDE.x, y: SIDE.y, w: SIDE.w, h: 360 },
      "Shoot and Leave",
      [
        ["Start to Shoot", "path"],
        ["Shoot", "named"],
        ["Shoot to Neutral Zone", "path"],
      ],
      (i) => i !== 1 && t >= Wd("pathauto", "paths") - 0.1,
      list
    );
    text(ctx, "an auto · a list of steps", SIDE.x + 28, SIDE.y + 410, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.accent,
      a: list,
    });
    text(
      ctx,
      "the robot builds each auto into one command",
      SIDE.x + 28,
      SIDE.y + 450,
      { font: SANS, size: 22, color: C.tx2, a: list }
    );
    ctx.restore();
  }

  // REC: Settings → Robot Config. Generator stand-ins from the branch, not tuned gains.
  function recConfig(ctx, t) {
    const a = window_(t, L("config").t0 - 0.3, L("draw").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.96);
    ctx.fillRect(0, 0, W, H);
    const mass = window_(
      t,
      Wd("config", "mass") - 0.2,
      Wd("config", "size") - 0.1,
      0.15
    );
    const size = window_(
      t,
      Wd("config", "size") - 0.2,
      Wd("config", "how") - 0.1,
      0.15
    );
    const push = ramp(t, Wd("config", "push") - 0.4, 0.2);
    drawToolWindow(
      ctx,
      { x: 360, y: 40, w: 1200, h: 860 },
      {
        app: "PathPlanner",
        title: "Settings · Robot Config",
        rowH: 58,
        rows: [
          { label: "Robot Mass", value: "68 kg", hot: mass > 0.5 },
          { label: "Robot MOI", value: "8.0 kg·m²" },
          { label: "Bumper Width", value: "0.84 m", hot: size > 0.5 },
          { label: "Bumper Length", value: "0.84 m", hot: size > 0.5 },
          { label: "Wheel Radius", value: "0.055 m", hot: push > 0.5 },
          { label: "Drive Gearing", value: "7.364", hot: push > 0.5 },
          { label: "True Max Drive Speed", value: "4.54 m/s", hot: push > 0.5 },
          { label: "Drive Motor", value: "Kraken X60" },
          { label: "Current Limit", value: "120 A", hot: push > 0.5 },
          { label: "Wheel COF", value: "1.2", hot: push > 0.5 },
          { label: "Module Offsets", value: "±0.254 m" },
        ],
      }
    );
    text(
      ctx,
      "measured, not guessed · the robot reads these back",
      W / 2,
      880,
      { font: MONO, size: 20, weight: 600, align: "center", color: C.tx3 }
    );
    ctx.restore();
  }

  // REC: the path editor. Ideal Starting State, Goal End State, Global Constraints, preview.
  function recDraw(ctx, t) {
    const a = window_(t, L("draw").t0 - 0.3, L("auto").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.97);
    ctx.fillRect(0, 0, W, H);
    const R = { x: 60, y: 90, w: 1080, h: 740 };
    micro(ctx, "PathPlanner · path editor · Leave Start", R.x, R.y - 22, {
      size: 16,
    });
    const F = drawField(ctx, R, { view: VIEW, axes: false, labels: false });
    ctx.save();
    ctx.beginPath();
    ctx.rect(R.x, R.y, R.w, R.h);
    ctx.clip();
    tape(ctx, F);
    const start = ramp(t, Wd("draw", "tape") - 0.3, 0.4);
    const out = easeInOut(ramp(t, Wd("draw", "two") - 0.2, 1.0));
    const turn = easeInOut(ramp(t, Wd("draw", "turned") - 0.1, 0.8));
    // the end waypoint slides out from the start
    const P = BEZ.map((p, i) =>
      i === 0 ? p : [lerp(BEZ[0][0], p[0], out), lerp(BEZ[0][1], p[1], out)]
    );
    const A = arcTable(P);
    // hub: the line clears it, the bumper corner does not
    const mid = atDist(PATH, PATH.len * 0.5);
    const hub = { x: mid.x - 0.25, y: mid.y - 0.33 - 0.42, w: 0.5, h: 0.42 };
    const preview = ramp(t, Wd("draw", "preview") - 0.1, 2.2);
    const hit = preview > 0.35;
    const [hx, hy] = F.P(hub.x, hub.y + hub.h);
    ctx.fillStyle = hit ? alpha(C.err, 0.2) : C.bg3;
    ctx.fillRect(hx, hy, hub.w * F.s, hub.h * F.s);
    ctx.strokeStyle = hit ? C.err : C.tx3;
    ctx.lineWidth = 2;
    ctx.strokeRect(hx, hy, hub.w * F.s, hub.h * F.s);
    text(ctx, "hub", hx + (hub.w * F.s) / 2, hy + (hub.h * F.s) / 2 + 7, {
      font: MONO,
      size: 18,
      align: "center",
      color: hit ? C.err : C.tx3,
    });
    if (out > 0) {
      pathCurve(ctx, F, A, { width: 4 });
      // control handles
      ctx.strokeStyle = alpha(C.tx3, 0.8);
      ctx.lineWidth = 1.5;
      for (const [i, j] of [
        [0, 1],
        [3, 2],
      ]) {
        ctx.beginPath();
        ctx.moveTo(...F.P(...P[i]));
        ctx.lineTo(...F.P(...P[j]));
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(...F.P(...P[j]), 6, 0, TAU);
        ctx.fillStyle = C.tx3;
        ctx.fill();
      }
    }
    // the bumper outline swept through the preview
    if (preview > 0) {
      for (let k = 0; k <= 10; k++) {
        const f = k / 10;
        if (f > preview) break;
        const p = atDist(PATH, PATH.len * f);
        drawSwerveRobot(
          ctx,
          F,
          { x: p.x, y: p.y, theta: END_HEADING * easeInOut(f) },
          { ghost: true, color: alpha(C.accent, 0.35) }
        );
      }
      const p = atDist(PATH, PATH.len * Math.min(1, preview));
      drawSwerveRobot(
        ctx,
        F,
        {
          x: p.x,
          y: p.y,
          theta: END_HEADING * easeInOut(Math.min(1, preview)),
        },
        { ghost: true, label: "preview" }
      );
    }
    // waypoints
    if (start > 0) dot(ctx, ...F.P(...P[0]), start);
    if (out > 0) {
      dot(ctx, ...F.P(...P[3]), 1);
      drawSwerveRobot(
        ctx,
        F,
        { x: P[3][0], y: P[3][1], theta: END_HEADING * turn },
        { ghost: true, color: C.tx2 }
      );
    }
    ctx.restore();
    if (hit)
      text(
        ctx,
        "the line clears it · the bumper doesn't",
        R.x + R.w / 2,
        R.y + 48,
        { font: MONO, size: 22, weight: 600, align: "center", color: C.err }
      );
    drawToolWindow(
      ctx,
      { x: 1180, y: 90, w: 690, h: 740 },
      {
        app: "PathPlanner",
        title: "Paths · Leave Start",
        rowH: 60,
        rows: [
          {
            label: "Ideal Starting State",
            value: null,
            hot: start > 0.5 && out < 0.5,
          },
          { label: "   Rotation", value: "0°", hot: start > 0.5 && out < 0.5 },
          {
            label: "Goal End State",
            value: null,
            hot: out > 0.5 && preview <= 0,
          },
          {
            label: "   Rotation",
            value: `${Math.round(45 * turn)}°`,
            hot: turn > 0 && preview <= 0,
          },
          { label: "   Velocity", value: "0 m/s" },
          { label: "Global Constraints", value: null },
          { label: "   Max Velocity", value: "2.0 m/s" },
          { label: "   Max Acceleration", value: "2.0 m/s²" },
          {
            label: "Preview",
            value: preview > 0 ? `${(preview * PROF.T).toFixed(2)} s` : "",
            hot: preview > 0,
          },
        ],
      }
    );
    ctx.restore();
  }

  function dot(ctx, x, y, a) {
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, TAU);
    ctx.fillStyle = C.accent;
    ctx.fill();
    ctx.strokeStyle = C.bg;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // REC: the Autos section. Leave Start, with Reset Odometry on.
  function recAuto(ctx, t) {
    const a = window_(t, L("auto").t0 - 0.3, L("builder").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.97);
    ctx.fillRect(0, 0, W, H);
    const wrap = ramp(t, Wd("auto", "wrap") - 0.1, 0.4);
    const reset = ramp(t, Wd("auto", "reset") - 0.2, 0.3);
    drawAutoList(
      ctx,
      { x: 200, y: 150, w: 640, h: 300 },
      "Leave Start",
      [["Leave Start", "path"]],
      () => wrap > 0.5,
      1
    );
    drawToolWindow(
      ctx,
      { x: 920, y: 150, w: 800, h: 300 },
      {
        app: "PathPlanner",
        title: "Autos · Leave Start",
        rows: [
          {
            label: "Reset Odometry",
            value: reset > 0.5 ? "on" : "",
            hot: reset > 0.5,
          },
          { label: "Command list", value: "Leave Start (path)" },
        ],
      }
    );
    const k = ramp(t, Wd("auto", "starts") - 0.2, 0.5);
    text(
      ctx,
      "at enable: odometry is told the robot sits on the path's start pose",
      W / 2,
      560,
      {
        font: MONO,
        size: 24,
        weight: 600,
        align: "center",
        color: C.accent,
        a: k,
      }
    );
    text(ctx, "Drivetrain/Pose  →  x 2.00 m   y 4.00 m   θ 0°", W / 2, 620, {
      font: MONO,
      size: 24,
      align: "center",
      color: C.tx2,
      a: k,
    });
    ctx.restore();
  }

  function codePanel(
    ctx,
    R,
    title,
    lines,
    { lit = () => 0, notes = null, noteX = 0, size = 20, lh = 30 } = {}
  ) {
    panel(ctx, R);
    micro(ctx, title, R.x + 28, R.y + 40);
    lines.forEach(([s, tag], i) => {
      const y = R.y + 84 + i * lh;
      const k = lit(tag);
      if (k > 0) {
        ctx.fillStyle = alpha(C.accent, 0.14 * k);
        ctx.fillRect(R.x + 10, y - lh + 8, R.w - 20, lh);
        ctx.fillStyle = alpha(C.accent, k);
        ctx.fillRect(R.x + 10, y - lh + 8, 4, lh);
      }
      if (s.trim().startsWith("//"))
        text(ctx, s, R.x + 28, y, { font: MONO, size, color: C.tx3 });
      else codeLine(ctx, s, R.x + 28, y, { size });
      if (notes && notes[tag] && k > 0)
        text(ctx, notes[tag], noteX, y, {
          font: MONO,
          size: 20,
          weight: 600,
          color: C.accent,
          a: k,
        });
    });
  }

  function beatBuilder(ctx, t) {
    const a = window_(t, L("builder").t0 - 0.3, L("opmode").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.97);
    ctx.fillRect(0, 0, W, H);
    const cue = {
      where: Wd("builder", "where"),
      reset: Wd("builder", "reset"),
      fast: Wd("builder", "fast"),
      drive: Wd("builder", "drive"),
    };
    const order = ["where", "reset", "fast", "drive"];
    codePanel(
      ctx,
      { x: 100, y: 110, w: 1720, h: 480 },
      "subsystems/DriveMechanism.java · constructor",
      BUILDER,
      {
        notes: BUILDER_NOTES,
        noteX: 1140,
        lit: (tag) => {
          if (tag === "imp")
            return window_(t, L("builder").t0 - 0.3, cue.where - 0.2, 0.3);
          const i = order.indexOf(tag);
          if (i < 0) return 0;
          return (
            ramp(t, cue[tag] - 0.2, 0.3) *
            (i === order.findLastIndex((o) => t >= cue[o] - 0.2) ? 1 : 0.45)
          );
        },
      }
    );
    text(ctx, "import from command3", 1140, 194, {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.accent,
      a: window_(t, L("builder").t0 - 0.3, cue.where - 0.2, 0.3),
    });
    // the 5.0s are the branch's starting values, not tuned
    text(ctx, "starting values · tune on your robot", 1140, 110 + 84 + 8 * 30, {
      font: MONO,
      size: 18,
      color: C.tx3,
    });
    text(ctx, "once, in the constructor, before any auto loads", 100, 660, {
      font: SANS,
      size: 26,
      color: C.tx2,
    });
    ctx.restore();
  }

  function beatOpMode(ctx, t) {
    const a = window_(t, L("opmode").t0 - 0.3, L("follow").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.97);
    ctx.fillRect(0, 0, W, H);
    const cReg = Wd("opmode", "registers");
    const cBuild = Wd("opmode", "builds");
    const cRead = Wd("opmode", "reads");
    const which =
      t >= cRead - 0.2
        ? "read"
        : t >= cBuild - 0.2
          ? "build"
          : t >= cReg - 0.2
            ? "reg"
            : null;
    codePanel(
      ctx,
      { x: 40, y: 30, w: 1210, h: 880 },
      "opmodes/AutoOpMode.java",
      OPMODE,
      { size: 19, lh: 29.5, lit: (tag) => (tag && tag === which ? 1 : 0) }
    );
    // the drop-down it publishes
    const k = ramp(t, cBuild + 0.2, 0.4);
    const R = { x: 1290, y: 260, w: 580, h: 380 };
    ctx.save();
    ctx.globalAlpha *= k;
    panel(ctx, R, C.bg2);
    micro(ctx, "dashboard · Tunables/Auto", R.x + 28, R.y + 42);
    const opts = ["None", "Leave Start", "Shoot and Leave", "Neutral Zone Run"];
    opts.forEach((o, i) => {
      const y = R.y + 70 + i * 66;
      const on = o === "Leave Start";
      rrect(ctx, R.x + 28, y, R.w - 56, 54, 4);
      ctx.fillStyle = on ? alpha(C.accent, 0.16) : C.bg3;
      ctx.fill();
      ctx.strokeStyle = on ? C.accent : C.rule;
      ctx.lineWidth = on ? 2 : 1;
      ctx.stroke();
      text(ctx, o, R.x + 48, y + 36, {
        font: MONO,
        size: 22,
        weight: 600,
        color: on ? C.tx : C.tx2,
      });
      if (on)
        text(ctx, "default", R.x + R.w - 48, y + 36, {
          font: MONO,
          size: 17,
          align: "right",
          color: C.accent,
        });
    });
    ctx.restore();
    const r = ramp(t, cRead - 0.2, 0.4);
    text(ctx, "read in start(), at enable", R.x, R.y + R.h + 50, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.accent,
      a: r,
    });
    text(
      ctx,
      "the drop-down can change after the mode is picked",
      R.x,
      R.y + R.h + 86,
      { font: SANS, size: 21, color: C.tx2, a: r }
    );
    ctx.restore();
  }

  // events: Neutral Zone Run, Intake running only inside its zone
  function beatEvents(ctx, t) {
    const a = window_(t, L("events").t0 - 0.3, L("close").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const R = { x: 60, y: 90, w: 1080, h: 560 };
    micro(ctx, "Neutral Zone Run · Start to Neutral Zone", R.x, R.y - 22, {
      size: 16,
    });
    const F = drawField(ctx, R, {
      view: { x0: 0.6, y0: 0.2, x1: 8.6, y1: 3.4 },
      axes: false,
      labels: false,
    });
    const t0 = L("events").t0 + 0.4;
    const rate = (NZ_PROF.T + 0.6) / Math.max(1, L("events").t1 - t0 + 0.3);
    const u = clamp((t - t0) * rate, 0, NZ_PROF.T + 1);
    const d = NZ_PROF.at(u);
    const p = atDist(NZ, d);
    const frac = d / NZ.len;
    ctx.save();
    ctx.beginPath();
    ctx.rect(R.x, R.y, R.w, R.h);
    ctx.clip();
    // the zone, shaded along the path
    const inZone = frac >= ZONE[0] && frac < ZONE[1];
    ctx.strokeStyle = alpha(C.accent, inZone ? 0.35 : 0.18);
    ctx.lineWidth = 0.9 * F.s;
    ctx.lineCap = "butt";
    ctx.beginPath();
    NZ.pts
      .filter((q) => q.d / NZ.len >= ZONE[0] && q.d / NZ.len <= ZONE[1])
      .forEach((q, i) =>
        i ? ctx.lineTo(...F.P(q.x, q.y)) : ctx.moveTo(...F.P(q.x, q.y))
      );
    ctx.stroke();
    const zm = atDist(NZ, (NZ.len * (ZONE[0] + ZONE[1])) / 2);
    text(ctx, "Intake zone", F.X(zm.x), F.Y(zm.y) - 0.6 * F.s, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    pathCurve(ctx, F, NZ, { a: 0.8, dash: [10, 8], width: 3 });
    drawSwerveRobot(
      ctx,
      F,
      { x: p.x, y: p.y, theta: Math.atan2(p.ty, p.tx) * 0.3 },
      { modules: swerveModules(NZ_PROF.vAt(u), 0, 0), maxSpeed: 2.4 }
    );
    ctx.restore();
    // the scheduler: the path command, and Intake as its child inside the zone
    const tz0 = solveT(NZ_PROF, NZ.len * ZONE[0]);
    const tz1 = solveT(NZ_PROF, NZ.len * ZONE[1]);
    drawTimeline(
      ctx,
      { x: 60, y: 690, w: 1080, h: 230 },
      {
        lanes: ["Drive", "Intake"],
        view: { t0: 0, span: Math.ceil(NZ_PROF.T + 1) },
        now: u,
        title: "scheduler · who owns what",
        bars: [
          {
            lane: 0,
            start: 0,
            end: NZ_PROF.T,
            label: "Start to Neutral Zone",
            state: "done",
          },
          { lane: 1, start: tz0, end: tz1, label: "Intake", state: "cancel" },
        ],
      }
    );
    drawAutoList(
      ctx,
      { x: SIDE.x, y: 90, w: SIDE.w, h: 350 },
      "Neutral Zone Run",
      [
        ["Start to Neutral Zone", "path"],
        ["Neutral Zone to Shoot", "path"],
        ["Shoot", "named"],
      ],
      (i) => i === 0 && u < NZ_PROF.T,
      1
    );
    const st =
      u < tz0
        ? "Intake · not started"
        : u < tz1
          ? "Intake · running, the robot is in the zone"
          : "Intake · canceled as it left";
    text(ctx, st, SIDE.x, 500, {
      font: MONO,
      size: 22,
      weight: 600,
      color: u < tz0 ? C.tx3 : u < tz1 ? C.accent : C.err,
    });
    text(
      ctx,
      "Intake parks forever; the zone is its finish line",
      SIDE.x,
      545,
      { font: SANS, size: 21, color: C.tx2 }
    );
    ctx.restore();
  }
  function solveT(P, d) {
    let lo = 0;
    let hi = P.T;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (P.at(m) < d) lo = m;
      else hi = m;
    }
    return lo;
  }

  // ---- cards ----------------------------------------------------------------------

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("intro").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 5 · PathPlanner Paths", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "A Path That Knows Where It Ends", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 104,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // the check: three timer runs against three path runs, then the takeaway
  function closeCard(ctx, t) {
    const a = easeInOut(ramp(t, L("close").t0 - 0.2, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const sc = 1600;
    const box = (x, title, ends, color, k) => {
      ctx.save();
      ctx.globalAlpha *= k;
      panel(ctx, { x, y: 120, w: 620, h: 420 }, C.bg2);
      micro(ctx, title, x + 28, 162);
      const cx = x + 310;
      const cy = 350;
      const avg = ends.reduce(
        (s, e) => ({ x: s.x + e.x / 3, y: s.y + e.y / 3 }),
        { x: 0, y: 0 }
      );
      ctx.beginPath();
      ctx.arc(cx, cy, 0.1 * sc, 0, TAU);
      ctx.strokeStyle = alpha(C.tx3, 0.6);
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, "10 cm", cx + 0.1 * sc + 10, cy + 6, {
        font: MONO,
        size: 18,
        color: C.tx3,
      });
      for (const e of ends) {
        const px = cx + (e.x - avg.x) * sc;
        const py = cy - (e.y - avg.y) * sc;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px - 13, py);
        ctx.lineTo(px + 13, py);
        ctx.moveTo(px, py - 13);
        ctx.lineTo(px, py + 13);
        ctx.stroke();
      }
      ctx.restore();
    };
    box(300, "timer · Leave Start, three runs", TIMER_ENDS, C.tx2, 1);
    box(
      1000,
      "path · Leave Start, three runs",
      PATH_ENDS,
      C.accent,
      ramp(t, Wd("close", "path") - 0.1, 0.5)
    );
    text(ctx, "A path knows where it ends.", W / 2, 700, {
      font: SERIF,
      size: 80,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "point") - 0.3, 0.5)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function followSample(t) {
    if (t >= tFollow - 0.01 && t < L("tryit").t0 - 0.2)
      return { s: sampleAt(FOLLOW, mapKeys(followKeys, t)), rate: null };
    if (t >= tGate && t < gate.t1)
      return { s: sampleAt(GATE, (t - tGate) * RATE), rate: "slow motion" };
    return { s: null };
  }

  function draw(ctx, t, live = null) {
    background(ctx);
    if (live) {
      const s = live.u < 0 ? null : sampleAt(runFor(live.shoves), live.u);
      drawLeaveField(ctx, t, s, true);
      drawFollowPanel(ctx, s, "slow motion");
      vignette(ctx);
      return;
    }
    const { s, rate } = followSample(t);
    ctx.save();
    applyCamera(ctx, camera(shots, t));
    drawLeaveField(ctx, t, s, false);
    if (t >= L("follow").t0 - 0.3) drawFollowPanel(ctx, s, rate);
    beatPathAuto(ctx, t);
    ctx.restore();
    vignette(ctx);
    recConfig(ctx, t);
    recDraw(ctx, t);
    recAuto(ctx, t);
    beatBuilder(ctx, t);
    beatOpMode(ctx, t);
    beatEvents(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate: shove it off the path ------------------------------------------------

  const cache = new Map();
  function runFor(shoves) {
    const key = shoves.map((x) => x.toFixed(2)).join(",");
    if (!cache.has(key)) cache.set(key, simulate(shoves, 4.5));
    return cache.get(key);
  }

  function liveGate() {
    const state = { time: gate.t0, u: -0.6, shoves: [], doneAt: null, laps: 0 };
    return {
      state,
      prompt() {
        if (state.u < 0) return "Press Shove while it drives the path.";
        const s = sampleAt(runFor(state.shoves), state.u);
        if (!state.shoves.length)
          return s.done
            ? "Again: shove it this time."
            : "Press Shove while it drives the path.";
        if (s.err > 0.04) return "Off the path. The correction pulls it back.";
        return s.done
          ? "Back on the path, and it still ends on the waypoint."
          : "Back on the path.";
      },
      input(k, down) {
        if (k !== "shove" || !down || state.u < 0 || state.u > PROF.T) return;
        if (state.shoves.length < 3)
          state.shoves = [...state.shoves, state.u + 0.01];
      },
      step(dt) {
        state.time += dt;
        state.u += dt * RATE;
        if (state.u < 0) return false;
        const s = sampleAt(runFor(state.shoves), state.u);
        if (s.done && state.doneAt == null) state.doneAt = state.time;
        if (state.doneAt != null && state.time - state.doneAt > 1.8) {
          if (state.shoves.length || state.laps >= 1) return true;
          state.laps += 1;
          state.u = -0.6;
          state.doneAt = null;
        }
        return false;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const s = followSample(t).s;
    if (!s || (t - tGate) * RATE < GATE_SHOVE)
      return "Press Shove while it drives the path.";
    if (s.err > 0.04) return "Off the path. The correction pulls it back.";
    return s.done
      ? "Back on the path, and it still ends on the waypoint."
      : "Back on the path.";
  }

  const gateControls = [
    { k: "shove", label: "Shove", key: "Space", kind: "press" },
  ];

  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
