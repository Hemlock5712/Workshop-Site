// Facing One Way, Driving Another. How a swerve drive moves, which way "forward"
// is, and where the robot thinks it is.
//
// What is simulated, and how:
//   driver    the left stick names a direction, the right stick a spin. Field centric
//             turns "stick up" into "down the field" (flipped for a red driver), robot
//             centric turns it into "toward the nose".
//   robot     a point with a heading. The asked-for field velocity is eased in, turned
//             into robot-relative speeds, and swerveModules() gives each wheel's angle
//             and speed. A stopped wheel keeps the angle it had.
//   odometry  a second pose that adds up wheel travel every loop. It sees what the
//             wheels did, not what the robot did: a slip, a shove and a wrong wheel
//             size all leave it behind, and nothing ever takes the error back out.
// The field origin is the blue corner for both alliances. Only the driver's forward
// flips on red. Module angle optimisation is not drawn or named: the page doesn't
// teach it.

import {
  C,
  MONO,
  SANS,
  SERIF,
  W,
  H,
  alpha,
  background,
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
  drawController,
  drawField,
  drawPoseReadout,
  drawSwerveRobot,
  panel,
  swerveModules,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const FIELD = { x: 50, y: 70, w: 1300, h: 650 };
const PAD = { x: 1420, y: 110, w: 440, h: 270 };
const INSET = { x: 1410, y: 520, w: 460, h: 340 };
const FL = 16.54;
const FWD = 8.07;
const FULLV = { x0: -0.9, y0: -0.25, x1: FL + 0.9, y1: FWD + 0.25 };
const TAU = 2 * Math.PI;

// ---- the model ----------------------------------------------------------------------

const VMAX = 1.6; // m/s at full stick
const WMAX = 2.0; // rad/s at full stick
const DT = 1 / 240;
const RATE = 120;

const rotate = (x, y, th) => [
  x * Math.cos(th) - y * Math.sin(th),
  x * Math.sin(th) + y * Math.cos(th),
];

function fresh(time = 0) {
  return {
    time,
    x: 4,
    y: 4,
    th: 0,
    vfx: 0,
    vfy: 0,
    om: 0,
    stick: { x: 0, y: 0 },
    turn: 0, // + = counterclockwise
    mode: "field",
    alliance: "blue",
    odo: { x: 4, y: 4 },
    radiusErr: 0,
    slip: false,
    shove: 0, // seconds of shove left
    mods: [0, 1, 2, 3].map(() => ({ angle: 0, speed: 0 })),
    vr: [0, 0], // robot-relative velocity
    goal: null, // { x, y } drive to, for staging
    ease: 0.18,
  };
}

// what the driver asked for, as a field velocity
function asked(s) {
  if (s.goal) {
    const dx = s.goal.x - s.x;
    const dy = s.goal.y - s.y;
    const d = Math.hypot(dx, dy);
    const v = Math.min(s.goal.v ?? 2.4, d * 3);
    return d < 1e-3 ? [0, 0] : [(dx / d) * v, (dy / d) * v];
  }
  // stick up = the driver's forward, stick right = the driver's right
  const fwd = s.stick.y * VMAX;
  const left = -s.stick.x * VMAX;
  if (s.mode === "robot") return rotate(fwd, left, s.th);
  return s.alliance === "red" ? [-fwd, -left] : [fwd, left];
}

function step(s, dt) {
  const [ax, ay] = asked(s);
  const k = 1 - Math.exp(-dt / s.ease);
  s.vfx += (ax - s.vfx) * k;
  s.vfy += (ay - s.vfy) * k;
  s.om += (s.turn * WMAX - s.om) * k;
  const [vxR, vyR] = rotate(s.vfx, s.vfy, -s.th);
  s.vr = [vxR, vyR];
  const ms = swerveModules(vxR, vyR, s.om);
  s.mods = ms.map((m, i) =>
    m.speed < 0.04 ? { angle: s.mods[i].angle, speed: 0 } : m
  );
  // the truth
  const slip = s.slip ? 0.35 : 1;
  let tx = s.vfx * slip;
  let ty = s.vfy * slip;
  if (s.shove > 0) {
    ty -= 1.6;
    s.shove -= dt;
  }
  s.x = clamp(s.x + tx * dt, 0.45, FL - 0.45);
  s.y = clamp(s.y + ty * dt, 0.45, FWD - 0.45);
  s.th += s.om * dt;
  // odometry: what the wheels say, times the wheel size the file believes
  s.odo.x += s.vfx * (1 + s.radiusErr) * dt;
  s.odo.y += s.vfy * (1 + s.radiusErr) * dt;
  s.time += dt;
}

const place = (s, x, y, th = 0) =>
  Object.assign(s, { x, y, th, vfx: 0, vfy: 0, om: 0, odo: { x, y } });
const snap = (s) => ({
  ...s,
  stick: { ...s.stick },
  odo: { ...s.odo },
  mods: s.mods.map((m) => ({ ...m })),
  goal: s.goal && { ...s.goal },
});

function simulate(events, duration) {
  const s = fresh(0);
  const out = [];
  let e = 0;
  for (let i = 0, n = Math.ceil(duration * RATE) + 2; i < n; i++) {
    while (s.time < i / RATE) {
      while (e < events.length && events[e].t <= s.time) events[e++].do(s);
      step(s, DT);
    }
    out.push(snap(s));
  }
  return out;
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd } = cues(VOICE);
  const gate = VOICE.gates[0];
  const gd = gate.t1 - gate.t0;

  const T = {
    anat: L("anatomy").t0,
    spins: Wd("anatomy", "spins"),
    points: Wd("anatomy", "points"),
    files: Wd("anatomy", "generated"),
    holo: L("holonomic").t0,
    spinAsk: Wd("holonomic", "spin"),
    robot: L("robot").t0,
    nose: Wd("robot", "nose."),
    turn: Wd("robot", "turn"),
    field: L("field").t0,
    gyro: Wd("field", "gyro"),
    alliance: L("alliance").t0,
    flips: Wd("alliance", "flips"),
    pushing: Wd("alliance", "pushing"),
    pose: L("pose").t0,
    poseX: Wd("pose", "x"),
    poseY: Wd("pose", "y"),
    heading: Wd("pose", "heading."),
    origin: Wd("pose", "origin"),
    trap: L("trap").t0,
    red: Wd("trap", "red."),
    only: Wd("trap", "only"),
    odo: L("odometry").t0,
    adds: Wd("odometry", "adds,"),
    drift: L("drift").t0,
    slips: Wd("drift", "slips,"),
    shoves: Wd("drift", "shoves"),
    size: Wd("drift", "size"),
    walks: Wd("drift", "walks"),
    calib: Wd("drift", "calibration"),
    vision: Wd("drift", "vision"),
    close: L("close").t0,
  };

  const set = (t, f) => ({ t, do: f });
  const events = [
    // anatomy: parked, the wheels turn in place as "points it" is said
    set(0, (s) => place(s, 3.7, 3.8, 0)),
    set(T.spins - 0.1, (s) => (s.stick = { x: 0, y: 0.25 })),
    set(T.points - 0.1, (s) => (s.stick = { x: -0.2, y: 0 })),
    set(T.points + 1.0, (s) => (s.stick = { x: 0, y: 0 })),
    // holonomic: slide sideways, then the same direction with a spin on top
    set(T.holo - 0.2, (s) => ((s.mode = "field"), place(s, 3.2, 1.9, 0))),
    set(T.holo + 0.2, (s) => (s.stick = { x: -0.5, y: 0 })),
    set(
      T.spinAsk - 0.2,
      (s) => ((s.stick = { x: 0, y: 0.75 }), (s.turn = 0.8))
    ),
    set(T.robot - 0.3, (s) => ((s.stick = { x: 0, y: 0 }), (s.turn = 0))),
    // robot centric: forward is the nose, then the robot turns around
    set(T.robot + 0.3, (s) => ((s.mode = "robot"), place(s, 2.6, 4.4, 0))),
    set(T.nose - 0.6, (s) => (s.stick = { x: 0, y: 0.8 })),
    set(T.turn, (s) => (s.turn = 1.0)),
    set(T.turn + Math.PI / WMAX, (s) => (s.turn = 0)),
    set(T.field - 0.4, (s) => (s.stick = { x: 0, y: 0 })),
    // field centric: stick up all the way, the robot spins and still goes down field
    set(T.field + 0.1, (s) => ((s.mode = "field"), place(s, 2.2, 4.0, 0))),
    set(T.field + 0.5, (s) => ((s.stick = { x: 0, y: 0.7 }), (s.turn = 0.55))),
    set(L("field").t1 + 0.3, (s) => ((s.stick = { x: 0, y: 0 }), (s.turn = 0))),
    // the gate, played for you
    set(gate.t0, (s) => ((s.mode = "field"), place(s, 4.5, 4.0, 0))),
    set(gate.t0 + 0.7, (s) => (s.stick = { x: 0, y: 0.8 })),
    set(gate.t0 + 1.6, (s) => (s.turn = 0.8)),
    set(gate.t0 + gd * 0.62, (s) => (s.mode = "robot")),
    set(gate.t0 + gd * 0.9, (s) => ((s.stick = { x: 0, y: 0 }), (s.turn = 0))),
    // red alliance: the driver at the red wall pushes away, the robot drives toward blue
    set(
      gate.t1 + 0.05,
      (s) => (
        (s.mode = "field"),
        (s.alliance = "red"),
        place(s, 13.4, 4.6, Math.PI)
      )
    ),
    set(T.pushing, (s) => (s.stick = { x: 0, y: 0.8 })),
    set(L("alliance").t1 + 0.1, (s) => (s.stick = { x: 0, y: 0 })),
    // the pose: settle somewhere readable
    set(T.pose - 0.2, (s) => (s.goal = { x: 10.2, y: 2.8, v: 2.2 })),
    set(T.poseX - 0.3, (s) => (s.goal = null)),
    // the trap: park against the red wall
    set(
      T.trap + 0.2,
      (s) => ((s.goal = { x: FL - 0.48, y: 4.0, v: 3.2 }), (s.turn = 0))
    ),
    set(T.odo - 0.3, (s) => (s.goal = null)),
    // odometry: a fresh start near blue, a gentle drive
    set(T.odo - 0.1, (s) => ((s.alliance = "blue"), place(s, 1.4, 1.6, 0))),
    set(
      T.odo + 0.4,
      (s) => ((s.stick = { x: -0.12, y: 0.35 }), (s.turn = 0.12))
    ),
    set(T.adds, (s) => (s.stick = { x: 0.1, y: 0.38 })),
    // drift
    set(
      T.drift - 0.1,
      (s) => ((s.stick = { x: -0.08, y: 0.4 }), (s.turn = 0.1))
    ),
    set(T.slips, (s) => (s.slip = true)),
    set(T.slips + 0.9, (s) => (s.slip = false)),
    set(T.shoves, (s) => (s.shove = 0.45)),
    set(T.size, (s) => (s.radiusErr = 0.06)),
    set(T.calib - 0.3, (s) => ((s.stick = { x: 0, y: 0 }), (s.turn = 0))),
  ].sort((a, b) => a.t - b.t);

  const samples = simulate(events, VOICE.duration);
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // the field view: zoomed on the robot for anatomy, the whole field after
  const views = [
    { t: 0, v: { x0: 2.15, y0: 3.05, x1: 5.85, y1: 4.95 }, d: 0.01 },
    { t: T.holo - 0.4, v: { x0: 0.8, y0: 0.8, x1: 10.8, y1: 5.8 }, d: 1.2 },
    { t: T.robot - 0.2, v: FULLV, d: 1.2 },
  ];
  function viewAt(t) {
    let cur = views[0].v;
    for (const s of views) {
      if (t < s.t) break;
      const k = easeInOut(ramp(t, s.t, s.d));
      cur = {
        x0: lerp(cur.x0, s.v.x0, k),
        y0: lerp(cur.y0, s.v.y0, k),
        x1: lerp(cur.x1, s.v.x1, k),
        y1: lerp(cur.y1, s.v.y1, k),
      };
    }
    return cur;
  }

  // ---- pieces --------------------------------------------------------------------

  // A driver station block outside the wall, with its forward arrow.
  function driverStation(
    ctx,
    F,
    side,
    { a = 1, hot = false, label = "" } = {}
  ) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const blue = side === "blue";
    const x0 = blue ? -0.75 : FL + 0.15;
    const [px, py] = F.P(x0, 5.6);
    const [qx, qy] = F.P(x0 + 0.6, 2.4);
    rrect(ctx, px, py, qx - px, qy - py, 3);
    ctx.fillStyle = hot ? alpha(C.accent, 0.25) : C.bg3;
    ctx.fill();
    ctx.strokeStyle = hot ? C.accent : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    // driver's forward: away from their own wall
    const y = 6.75;
    const xa = blue ? 0.35 : FL - 0.35;
    const xb = blue ? 2.6 : FL - 2.6;
    arrow(ctx, F.P(xa, y), F.P(xb, y), hot ? C.accent : C.tx2, 4);
    text(ctx, label || "driver forward", F.X((xa + xb) / 2), F.Y(y) - 14, {
      font: MONO,
      size: 17,
      weight: 600,
      align: "center",
      color: hot ? C.accent : C.tx2,
    });
    ctx.restore();
  }

  function arrow(ctx, [x0, y0], [x1, y1], color, w = 4) {
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1 - Math.cos(ang) * 10, y1 - Math.sin(ang) * 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - Math.cos(ang - 0.45) * 18, y1 - Math.sin(ang - 0.45) * 18);
    ctx.lineTo(x1 - Math.cos(ang + 0.45) * 18, y1 - Math.sin(ang + 0.45) * 18);
    ctx.closePath();
    ctx.fill();
  }

  // the robot's travel direction, from its centre
  function travelArrow(ctx, F, s, { a = 1, label = "" } = {}) {
    const sp = Math.hypot(s.vfx, s.vfy);
    if (sp < 0.15 || a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a * clamp(sp / 0.5);
    const len = Math.max(0.9, Math.min(1.6, sp)) * Math.max(1, 60 / F.s);
    const [x0, y0] = F.P(s.x, s.y);
    const [x1, y1] = F.P(s.x + (s.vfx / sp) * len, s.y + (s.vfy / sp) * len);
    arrow(ctx, [x0, y0], [x1, y1], C.tx, 4);
    if (label)
      text(ctx, label, x1 + 12, y1 - 12, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.tx,
      });
    ctx.restore();
  }

  function trail(
    ctx,
    F,
    t,
    from,
    key = null,
    { color = C.tx3, dots = false } = {}
  ) {
    if (t <= from) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let first = true;
    for (let u = from; u <= t; u += 1 / 30) {
      const s = at(u);
      const p = key ? s[key] : s;
      const [px, py] = F.P(p.x, p.y);
      if (first) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      first = false;
    }
    ctx.stroke();
    if (dots) {
      // one tick per added step (drawn every 0.25 s so they read)
      ctx.fillStyle = C.accent;
      for (let u = from; u <= t; u += 0.25) {
        const p = at(u)[key];
        const [px, py] = F.P(p.x, p.y);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function moduleLabels(ctx, F, s, a) {
    if (a <= 0) return;
    const names = [
      ["FL", 0.5, 0.5],
      ["FR", 0.5, -0.5],
      ["BL", -0.5, 0.5],
      ["BR", -0.5, -0.5],
    ];
    for (const [n, lx, ly] of names) {
      const [dx, dy] = rotate(lx, ly, s.th);
      text(ctx, n, F.X(s.x + dx), F.Y(s.y + dy) + 8, {
        font: MONO,
        size: 24,
        weight: 600,
        align: "center",
        color: C.tx2,
        a,
      });
    }
  }

  // close up of whatever the robot is doing, so the wheels read at any zoom
  function inset(ctx, s, t, live) {
    const a = live ? 1 : window_(t, T.holo + 0.2, T.calib - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    panel(ctx, INSET, C.bg2);
    const R = {
      x: INSET.x + 10,
      y: INSET.y + 50,
      w: INSET.w - 20,
      h: INSET.h - 60,
    };
    const F = drawField(ctx, R, {
      view: { x0: s.x - 1.1, y0: s.y - 0.75, x1: s.x + 1.1, y1: s.y + 0.75 },
      axes: false,
      labels: false,
      grid: 0.5,
    });
    drawSwerveRobot(
      ctx,
      F,
      { x: s.x, y: s.y, theta: s.th },
      { modules: s.mods, maxSpeed: 2.2 }
    );
    micro(ctx, "close up · the four wheels", INSET.x + 20, INSET.y + 34, {
      size: 16,
    });
    ctx.restore();
  }

  function modeChip(ctx, s, t, live) {
    const a = live ? 1 : window_(t, T.robot + 0.2, T.alliance + 0.1, 0.35);
    if (a <= 0) return;
    const R = { x: 1410, y: 420, w: 460, h: 80 };
    ctx.save();
    ctx.globalAlpha = a;
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = alpha(C.accent, 0.1);
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    const field = s.mode === "field";
    micro(ctx, field ? "field centric" : "robot centric", R.x + 22, R.y + 32, {
      color: C.accent,
    });
    text(
      ctx,
      field ? "forward = down the field" : "forward = the robot's nose",
      R.x + 22,
      R.y + 64,
      { font: MONO, size: 21, weight: 600 }
    );
    ctx.restore();
  }

  function anatomyCard(ctx, t) {
    const a = window_(t, T.anat + 0.3, T.holo - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 1410, y: 70, w: 460, h: 560 };
    panel(ctx, R, C.bg2);
    micro(ctx, "one module · seen from above", R.x + 22, R.y + 38, {
      size: 16,
    });
    const cx = R.x + 230;
    const cy = R.y + 220;
    // steer: the housing turns; drive: the wheel rolls
    const steer = (at(t).mods[0].angle ?? 0) * 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, TAU);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    const steerOn = t > T.points - 0.1 && t < T.points + 1.4;
    ctx.strokeStyle = steerOn ? C.accent : C.rule;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-steer);
    rrect(ctx, -80, -30, 160, 60, 6);
    ctx.fillStyle = C.bg;
    ctx.fill();
    const driveOn = t > T.spins - 0.1 && t < T.points;
    ctx.strokeStyle = driveOn ? C.accent : C.tx3;
    ctx.lineWidth = 3;
    ctx.stroke();
    // tread marks roll while driving
    const roll = (at(t).time * 90) % 20;
    ctx.save();
    rrect(ctx, -80, -30, 160, 60, 6);
    ctx.clip();
    ctx.strokeStyle = alpha(C.tx3, 0.6);
    ctx.lineWidth = 2;
    for (let x = -100 + (driveOn ? roll : 0); x < 100; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, -30);
      ctx.lineTo(x, 30);
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();
    // CANcoder on top of the steer axis
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, TAU);
    ctx.fillStyle = C.tx3;
    ctx.fill();
    const row = (y, name, job, on) => {
      text(ctx, name, R.x + 30, y, {
        font: MONO,
        size: 22,
        weight: 600,
        color: on ? C.accent : C.tx,
      });
      text(ctx, job, R.x + 30, y + 30, { size: 21, color: C.tx2 });
    };
    row(R.y + 400, "drive motor", "spins the wheel", driveOn);
    row(R.y + 470, "steer motor", "points it", steerOn);
    text(ctx, "+ a CANcoder reads the angle", R.x + 30, R.y + 535, {
      font: MONO,
      size: 17,
      color: C.tx3,
    });
    ctx.restore();
  }

  function filesCard(ctx, t) {
    const a = window_(t, T.files - 0.3, T.holo + 0.3, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 1410, y: 650, w: 460, h: 210 };
    panel(ctx, R, C.bg2);
    micro(ctx, "the math lives in", R.x + 22, R.y + 38, { size: 16 });
    text(ctx, "TunerConstants.java", R.x + 22, R.y + 86, {
      font: MONO,
      size: 23,
      weight: 600,
      color: C.accent,
    });
    text(ctx, "CommandSwerveDrivetrain.java", R.x + 22, R.y + 124, {
      font: MONO,
      size: 23,
      weight: 600,
      color: C.accent,
    });
    text(ctx, "generated by Tuner X, not typed", R.x + 22, R.y + 172, {
      size: 20,
      color: C.tx2,
    });
    ctx.restore();
  }

  function requestCard(ctx, s, t) {
    const a = window_(t, T.holo + 0.1, T.robot - 0.1, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 1410, y: 420, w: 460, h: 80 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "you ask for", R.x + 22, R.y + 32);
    const spin = s.turn !== 0;
    text(
      ctx,
      spin ? "a direction + a spin" : "a direction",
      R.x + 22,
      R.y + 64,
      { font: MONO, size: 21, weight: 600, color: spin ? C.accent : C.tx }
    );
    ctx.restore();
  }

  function gyroChip(ctx, F, s, t, live) {
    const a = live ? 1 : window_(t, T.gyro - 0.3, T.alliance + 0.1, 0.35);
    if (a <= 0) return;
    const deg = ((((s.th * 180) / Math.PI) % 360) + 360) % 360;
    ctx.save();
    ctx.globalAlpha = a;
    const x = 60;
    const y = 760;
    rrect(ctx, x, y, 470, 92, 5);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = live ? C.rule : C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "Pigeon 2 · gyro", x + 22, y + 34, {
      color: live ? C.tx3 : C.accent,
    });
    text(ctx, `heading ${deg.toFixed(0).padStart(3, " ")}°`, x + 22, y + 72, {
      font: MONO,
      size: 26,
      weight: 600,
    });
    // a small dial
    const cx = x + 410;
    const cy = y + 46;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, TAU);
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(-s.th) * 26, cy + Math.sin(-s.th) * 26);
    ctx.stroke();
    ctx.restore();
  }

  // pose beats: projections to the axes and the readout
  function poseCallout(ctx, F, s, t) {
    const a = window_(t, T.pose + 0.2, T.odo - 0.15, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const [rx, ry] = F.P(s.x, s.y);
    const kx = easeOut(ramp(t, T.poseX - 0.1, 0.6));
    const ky = easeOut(ramp(t, T.poseY - 0.1, 0.6));
    ctx.setLineDash([9, 7]);
    ctx.strokeStyle = alpha(C.accent, 0.9);
    ctx.lineWidth = 3;
    if (kx > 0) {
      ctx.beginPath();
      ctx.moveTo(F.X(0), F.Y(0) - 0);
      ctx.lineTo(lerp(F.X(0), rx, kx), F.Y(0));
      ctx.stroke();
      text(ctx, `x = ${s.x.toFixed(2)} m`, lerp(F.X(0), rx, 0.5), F.Y(0) - 16, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.accent,
        a: kx,
      });
    }
    if (ky > 0) {
      ctx.beginPath();
      ctx.moveTo(rx, F.Y(0));
      ctx.lineTo(rx, lerp(F.Y(0), ry, ky));
      ctx.stroke();
      const right = rx < F.X(12);
      text(
        ctx,
        `y = ${s.y.toFixed(2)} m`,
        rx + (right ? 18 : -18),
        lerp(F.Y(0), ry, 0.5),
        {
          font: MONO,
          size: 22,
          weight: 600,
          align: right ? "left" : "right",
          color: C.accent,
          a: ky,
        }
      );
    }
    ctx.setLineDash([]);
    // the origin, pulsing when it is named
    const pulse =
      window_(t, T.origin - 0.2, T.trap + 3.5, 0.3) *
      (0.5 + 0.5 * Math.cos((t - T.origin) * 5));
    if (t > T.origin - 0.2) {
      ctx.beginPath();
      ctx.arc(F.X(0), F.Y(0), 16 + 10 * pulse, 0, TAU);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.stroke();
      text(
        ctx,
        t > T.red - 0.3
          ? "(0, 0) · the blue corner, on either alliance"
          : "(0, 0) · the blue corner",
        F.X(0) + 30,
        F.Y(0) + 40,
        { font: MONO, size: 20, weight: 600, color: C.accent }
      );
    }
    ctx.restore();
  }

  function poseCard(ctx, s, t) {
    const a = window_(t, T.pose + 0.2, T.close, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 60, y: 760, w: 760, h: 100 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    const odo = t > T.odo - 0.1;
    const shown = odo
      ? { x: s.odo.x, y: s.odo.y, theta: s.th }
      : { x: s.x, y: s.y, theta: s.th };
    drawPoseReadout(ctx, R.x + 24, R.y + 36, shown, {
      title: odo
        ? "drivetrain.getPose() · odometry"
        : "drivetrain.getPose() · Pose2d",
    });
    // the trap: a big x on red
    const trapK = window_(t, T.red - 0.2, T.odo - 0.2, 0.3);
    if (trapK > 0)
      text(ctx, "large x, not 0", R.x + R.w - 24, R.y + 68, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "right",
        color: C.accent,
        a: trapK,
      });
    if (odo && t > T.slips) {
      const err = Math.hypot(s.odo.x - s.x, s.odo.y - s.y);
      text(ctx, `off by ${err.toFixed(2)} m`, R.x + R.w - 24, R.y + 68, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "right",
        color: err > 0.05 ? C.err : C.tx3,
      });
    }
    ctx.restore();
  }

  function driftNotes(ctx, F, s, t) {
    const note = (when, label, dy, dur = 2.6) => {
      const k = window_(t, when - 0.1, when + dur, 0.25);
      if (k <= 0) return;
      const p = at(T.slips);
      text(ctx, label, F.X(p.x), F.Y(p.y) + dy, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.tx,
        a: k,
      });
    };
    note(T.slips, "slip: wheels turn, robot doesn't", 64, 4.2);
    note(T.shoves, "shoved: no wheel turned", 94, 3.6);
    note(T.size, "wheel size 6% off", 124, 3.2);
    // the fixes
    const chip = (x, when, head, body) => {
      const k =
        easeOut(ramp(t, when - 0.15, 0.5)) *
        (1 - easeInOut(ramp(t, T.close, 0.5)));
      if (k <= 0) return;
      ctx.save();
      ctx.globalAlpha = k;
      rrect(ctx, x, 760, 500, 100, 5);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      micro(ctx, head, x + 22, 794, { color: C.accent });
      text(ctx, body, x + 22, 838, { font: MONO, size: 21, weight: 600 });
      ctx.restore();
    };
    chip(850, T.calib, "calibration · next lessons", "the error grows slower");
    chip(1370, T.vision, "vision · workshop 6", "addVisionMeasurement(...)");
  }

  // ---- full-screen cards -------------------------------------------------------

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("intro").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 5 · How Swerve Works", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Facing One Way, Driving Another", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 104,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // the opening line: one robot, nose one way, travel another
  function introCard(ctx, t) {
    const t1 = T.anat - 0.3;
    if (t < L("intro").t0 - 0.7 || t > t1 + 0.7) return;
    ctx.save();
    ctx.globalAlpha = 1 - easeInOut(ramp(t, t1, 0.7));
    background(ctx);
    const R = { x: 260, y: 140, w: 1400, h: 680 };
    const F = drawField(ctx, R, {
      view: { x0: 0, y0: 0.6, x1: 9, y1: 5 },
      axes: false,
      labels: false,
    });
    const u = t - L("intro").t0;
    const x = 1.2 + clamp(u, -1, 6) * 1.0;
    const th = 1.15 * Math.sin(u * 0.9);
    const ms = swerveModules(...rotate(1.0, 0, -th), 0);
    drawSwerveRobot(
      ctx,
      F,
      { x, y: 2.8, theta: th },
      { modules: ms, maxSpeed: 1.6 }
    );
    // facing vs driving
    const [cx, cy] = F.P(x, 2.8);
    arrow(
      ctx,
      [cx, cy],
      [cx + Math.cos(-th) * 150, cy + Math.sin(-th) * 150],
      C.accent,
      4
    );
    text(ctx, "faces", cx + Math.cos(-th) * 170, cy + Math.sin(-th) * 170 - 6, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.accent,
    });
    arrow(ctx, [cx, cy + 0], [cx + 220, cy], C.tx, 4);
    text(ctx, "drives", cx + 236, cy + 8, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.tx,
    });
    ctx.restore();
  }

  function closeCard(ctx, t) {
    const a = easeInOut(ramp(t, T.close - 0.2, 0.8));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    text(ctx, "Thirteen devices.", W / 2, 360, {
      font: SERIF,
      size: 96,
      align: "center",
    });
    const parts = [
      ["4", "drive motors"],
      ["4", "steer motors"],
      ["4", "CANcoders"],
      ["1", "Pigeon 2"],
    ];
    parts.forEach(([n, name], i) => {
      const k = easeOut(ramp(t, T.close + 0.4 + i * 0.25, 0.5));
      const x = 420 + i * 360;
      text(ctx, n, x, 520, {
        font: SERIF,
        size: 92,
        align: "center",
        color: C.accent,
        a: k,
      });
      text(ctx, name, x, 576, {
        font: MONO,
        size: 24,
        align: "center",
        color: C.tx2,
        a: k,
      });
    });
    text(ctx, "Write down every ID, corner by corner.", W / 2, 700, {
      font: SERIF,
      size: 54,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "write") - 0.1, 0.6)),
    });
    text(ctx, "The generator asks for them next.", W / 2, 776, {
      size: 32,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "generator") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- the frame ---------------------------------------------------------------

  function drawBench(ctx, s, t, live) {
    const view = live ? FULLV : viewAt(t);
    const F = drawField(ctx, FIELD, { view });
    const redOn = live ? 0 : window_(t, T.alliance - 0.1, T.odo - 0.15, 0.4);
    const blueAll = live ? 1 : clamp((t - T.robot) / 0.4);
    driverStation(ctx, F, "blue", {
      a: blueAll * (1 - 0.6 * redOn),
      hot: !redOn,
      label: "blue driver forward",
    });
    driverStation(ctx, F, "red", {
      a: redOn,
      hot: true,
      label: "red driver forward",
    });
    if (redOn > 0) {
      text(ctx, "applyOperatorPerspective", F.X(FL) - 20, F.Y(6.0), {
        font: MONO,
        size: 20,
        weight: 600,
        align: "right",
        color: C.accent,
        a: redOn,
      });
      text(
        ctx,
        "blue Rotation2d.ZERO · red Rotation2d.PI",
        F.X(FL) - 20,
        F.Y(5.55),
        { font: MONO, size: 18, align: "right", color: C.tx2, a: redOn }
      );
    }
    // trails
    if (!live) {
      if (t > T.robot + 0.4 && t < T.field) trail(ctx, F, t, T.robot + 0.4);
      if (t > T.field + 0.2 && t < gate.t0) trail(ctx, F, t, T.field + 0.2);
      if (t > T.odo && t < T.close) {
        trail(ctx, F, t, T.odo - 0.05, null, { color: C.tx3 });
        trail(ctx, F, t, T.odo - 0.05, "odo", {
          color: alpha(C.accent, 0.7),
          dots: t < T.drift,
        });
      }
    } else if (live.trail.length > 1) {
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      live.trail.forEach(([x, y], i) =>
        i ? ctx.lineTo(...F.P(x, y)) : ctx.moveTo(...F.P(x, y))
      );
      ctx.stroke();
    }
    const pose = { x: s.x, y: s.y, theta: s.th };
    drawSwerveRobot(ctx, F, pose, {
      modules: s.mods,
      maxSpeed: 2.2,
      label: !live && t > T.odo ? "true" : "",
    });
    if (!live && t > T.odo - 0.05 && t < T.close)
      drawSwerveRobot(
        ctx,
        F,
        { x: s.odo.x, y: s.odo.y, theta: s.th },
        {
          ghost: true,
          label:
            Math.hypot(s.odo.x - s.x, s.odo.y - s.y) > 0.6 ? "odometry" : "",
        }
      );
    if (!live)
      moduleLabels(ctx, F, s, window_(t, T.anat + 0.4, T.holo - 0.2, 0.4));
    const showTravel = live || (t > T.holo && t < T.pose);
    if (showTravel)
      travelArrow(ctx, F, s, {
        label:
          live || t > T.robot
            ? s.mode === "robot"
              ? "stick forward"
              : ""
            : "",
      });
    if (!live) {
      poseCallout(ctx, F, s, t);
      driftNotes(ctx, F, s, t);
      const back =
        window_(t, T.field + 0.6, gate.t0, 0.3) *
        clamp(1 - Math.abs((((s.th % TAU) + TAU) % TAU) - Math.PI) / 0.5);
      if (back > 0)
        text(
          ctx,
          "facing the driver, still going down field",
          F.X(s.x),
          F.Y(s.y) - 62,
          {
            font: MONO,
            size: 20,
            weight: 600,
            align: "center",
            color: C.accent,
            a: back,
          }
        );
    }
    return F;
  }

  function draw(ctx, t, live = null) {
    const s = live ?? at(t);
    background(ctx);
    const F = drawBench(ctx, s, t, live);
    const padA = live ? 1 : clamp((t - T.holo) / 0.4);
    if (padA > 0) {
      ctx.save();
      ctx.globalAlpha = padA;
      drawController(ctx, PAD, {
        left: s.stick,
        right: { x: -s.turn, y: 0 },
        label: false,
      });
      ctx.restore();
    }
    if (!live) {
      anatomyCard(ctx, t);
      filesCard(ctx, t);
      requestCard(ctx, s, t);
      poseCard(ctx, s, t);
    }
    modeChip(ctx, s, t, live);
    gyroChip(ctx, F, s, t, live);
    inset(ctx, s, t, live);
    vignette(ctx);
    if (live) return;
    introCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate ----------------------------------------------------------------

  function liveGate() {
    const s = { ...fresh(gate.t0), trail: [] };
    place(s, 4.5, 4.0, 0);
    const keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      ccw: false,
      cw: false,
    };
    let spunWhileDriving = 0;
    let drove = false;
    let doneAt = null;
    let lastTrail = 0;
    return {
      state: s,
      prompt() {
        if (doneAt != null) return "The path held. Only the nose turned.";
        if (!drove) return "Hold an arrow key to drive.";
        if (spunWhileDriving < 0.3)
          return "Keep holding it, and spin with Q or E.";
        return s.mode === "field"
          ? "Field centric: the path stays put."
          : "Robot centric: the path turns with the nose.";
      },
      input(k, v) {
        if (k === "mode") {
          if (v) s.mode = s.mode === "field" ? "robot" : "field";
          return;
        }
        keys[k] = v;
        s.stick = {
          x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
          y: (keys.up ? 1 : 0) - (keys.down ? 1 : 0),
        };
        const n = Math.hypot(s.stick.x, s.stick.y);
        if (n > 1)
          s.stick = { x: (s.stick.x / n) * 0.8, y: (s.stick.y / n) * 0.8 };
        else s.stick = { x: s.stick.x * 0.8, y: s.stick.y * 0.8 };
        s.turn = ((keys.ccw ? 1 : 0) - (keys.cw ? 1 : 0)) * 0.8;
      },
      step(dt) {
        const n = Math.ceil(dt / DT);
        for (let i = 0; i < n; i++) step(s, dt / n);
        const driving = Math.hypot(s.stick.x, s.stick.y) > 0.1;
        if (driving) drove = true;
        if (driving && s.turn !== 0 && s.mode === "field")
          spunWhileDriving += Math.abs(s.om) * dt;
        if (s.time - lastTrail > 1 / 20) {
          s.trail.push([s.x, s.y]);
          if (s.trail.length > 160) s.trail.shift();
          lastTrail = s.time;
        }
        if (doneAt == null && spunWhileDriving > Math.PI) doneAt = s.time;
        return doneAt != null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 1.6) return "Hold a direction.";
    if (u < gd * 0.62) return "Spin. The path stays down the field.";
    if (u < gd * 0.9) return "Robot centric: the path turns with the nose.";
    return "Robot centric: the path turned too.";
  }

  const gateControls = [
    { k: "up", label: "Drive ↑", key: "ArrowUp", kind: "hold" },
    { k: "down", label: "↓", key: "ArrowDown", kind: "hold" },
    { k: "left", label: "←", key: "ArrowLeft", kind: "hold" },
    { k: "right", label: "→", key: "ArrowRight", kind: "hold" },
    { k: "ccw", label: "Spin left", key: "KeyQ", kind: "hold" },
    { k: "cw", label: "Spin right", key: "KeyE", kind: "hold" },
    { k: "mode", label: "Field / robot centric", key: "KeyC", kind: "press" },
  ];

  return { draw, gate, liveGate, gatePromptAt, gateControls };
}
