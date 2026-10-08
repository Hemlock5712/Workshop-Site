// Steps. A hold has no ending, so a list that starts with one never moves on.
// .withTimeout gives a hold an ending; Command.sequence runs steps in order; the
// last member decides whether the whole list ends; a race ends on its first finisher.
//
// What is simulated, and how:
//   arm        the Motion Magic position model from motion-magic-code: the TalonFX
//              runs a trapezoid profile toward the requested angle and keeps running
//              it after the command ends, because the request is still on the motor.
//   flywheel   a velocity request (MotionMagicVelocityVoltage, 75 rps) as a first-order
//              spin-up. stopMotor() in coast lets it spin down slowly.
//   scheduler  bars on a timeline, one lane per mechanism. A bar starts when its
//              command starts and closes only when the command really ends.
// Angles are rotations on the unit circle: 0 points right, 0.25 straight up.

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
  micro,
  ramp,
  rrect,
  text,
  vignette,
  window_,
} from "../../engine/core.js";
import {
  codeLine,
  codeWidth,
  drawArmBody,
  drawController,
  drawFlywheel,
  drawStand,
  drawTargetMark,
  drawTimeline,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const PAD = { x: 60, y: 70, w: 440, h: 270 };
const CHIP_A = { x: 60, y: 420, w: 440, h: 72 };
const CHIP_F = { x: 60, y: 504, w: 440, h: 72 };
const PIVOT = { x: 780, y: 290 };
const ARM_LEN = 170;
const FLOOR = 485;
const FLY = { x: 1040, y: 280 };
const FLY_R = 85;
const CODE = { x: 1220, y: 40, w: 660, h: 536 };
const TL = { x: 60, y: 600, w: 1800, h: 300 };
const LH = 31;
const SPAN = 5; // seconds of robot time across the timeline
const REST = -0.25;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const PHYS = { kM: 2.6, b: 4, g: 12 };
const MM = { cruise: 0.5, accel: 1.2 };
const DT = 1 / 960;

function stepProfile(sp, target, dt) {
  const d = target - sp.p;
  if (Math.abs(d) < 2e-4 && Math.abs(sp.v) < 5e-3) {
    sp.p = target;
    sp.v = 0;
    sp.a = 0;
    return;
  }
  const dir = Math.sign(d);
  const stop = (sp.v * sp.v) / (2 * MM.accel);
  if (Math.sign(sp.v) === dir && Math.abs(d) <= stop + Math.abs(sp.v) * dt)
    sp.a = -Math.sign(sp.v) * MM.accel;
  else if (Math.abs(sp.v) < MM.cruise - 1e-9) sp.a = dir * MM.accel;
  else sp.a = 0;
  const v0 = sp.v;
  sp.v = clamp(sp.v + sp.a * dt, -MM.cruise, MM.cruise);
  if (sp.a !== 0 && Math.sign(v0) !== 0 && Math.sign(sp.v) !== Math.sign(v0))
    sp.v = 0;
  sp.p += sp.v * dt;
}

function armVolts(s) {
  if (s.armReq == null) return 0;
  const phi = s.rot * TAU;
  const e = (s.sp.p - s.rot) * TAU;
  const ev = (s.sp.v - s.w) * TAU;
  const v =
    (PHYS.g * Math.cos(phi) + PHYS.b * s.sp.v * TAU + 0.7 * s.sp.a * TAU) /
      PHYS.kM +
    10 * e +
    3.5 * ev;
  return clamp(v, -12, 12);
}

function stepPhysics(s, dt) {
  if (s.armReq != null) stepProfile(s.sp, s.armReq, dt);
  s.volts = armVolts(s);
  const phi = s.rot * TAU;
  const acc = PHYS.kM * s.volts - PHYS.g * Math.cos(phi) - PHYS.b * s.w * TAU;
  s.w += (acc / TAU) * dt;
  s.rot += s.w * dt;
  // flywheel: a velocity request pulls it to target; neutral in coast lets it drift down
  if (s.flyReq?.kind === "vel") s.fly += ((s.flyReq.target - s.fly) / 0.3) * dt;
  else s.fly += (-s.fly / 5) * dt;
  s.flyAng += s.fly * 0.02 * TAU * dt; // drawn far slower than real, so the spokes read
}

// ---- the scheduler --------------------------------------------------------------------

const live_ = (s, role) => s.bars.find((b) => b.role === role && b.end == null);
const isOn = (s, role) => !!live_(s, role);

function startBar(s, role, lane, label, { open = false, chip = null } = {}) {
  s.bars.push({
    role,
    lane,
    label,
    start: s.time,
    end: null,
    open,
    chip,
    state: "run",
  });
}
function endBar(s, role, state) {
  const b = live_(s, role);
  if (b) {
    b.end = s.time;
    b.state = state;
  }
}
function newRun(s) {
  s.runStart = s.time;
  s.bars = [];
  s.group = null;
}
function setArm(s, target) {
  if (s.armReq !== target) {
    s.armReq = target;
    s.sp = { p: s.rot, v: s.w, a: 0 };
  }
}

// Y, bound with whileTrue(spinUpWhenReady).whileFalse(robot.flywheel.stop())
function setY(s, down) {
  if (s.prog !== "seq" || down === s.y) return;
  s.y = down;
  if (down) {
    newRun(s);
    s.group = { start: s.time, end: null, label: "Spin Up When Ready (hold)" };
    startBar(s, "m0", 0, "vertical (hold)", {
      open: !s.timeoutOn,
      chip: s.timeoutOn ? 1.0 : null,
    });
    setArm(s, 0.25);
  } else {
    endBar(s, "m0", "cancel");
    endBar(s, "m1", "cancel");
    if (s.group) s.group.end = s.time;
    startBar(s, "stop", 1, "stop (hold)", { open: true });
    s.flyReq = { kind: "stop" };
  }
}
// the left trigger, bound to robot.arm.vertical() alone
function setLT(s, down) {
  if (s.prog !== "hold" || down === s.lt) return;
  s.lt = down;
  if (down) {
    newRun(s);
    startBar(s, "hold", 0, "vertical (hold)", { open: true });
    setArm(s, 0.25);
  } else endBar(s, "hold", "cancel");
}
function startRace(s) {
  s.prog = "race";
  newRun(s);
  s.group = { start: s.time, end: null, label: "Spin While Holding Arm" };
  startBar(s, "rf", 1, "runFast (hold)", { chip: 2.0 });
  startBar(s, "ra", 0, "horizontal (hold)", { open: true });
  setArm(s, 0.5);
  s.flyReq = { kind: "vel", target: 75 };
}

function tick(s) {
  const m0 = live_(s, "m0");
  if (m0 && m0.chip && s.time - m0.start >= m0.chip - 1e-9) {
    endBar(s, "m0", "done");
    startBar(s, "m1", 1, "runFast (hold)", { open: true });
  }
  const rf = live_(s, "rf");
  if (rf && s.time - rf.start >= rf.chip - 1e-9) {
    endBar(s, "rf", "done");
    endBar(s, "ra", "cancel");
    if (s.group) s.group.end = s.time;
  }
  // every running command re-sends its request each loop
  if (isOn(s, "m0") || isOn(s, "hold")) setArm(s, 0.25);
  if (isOn(s, "ra")) setArm(s, 0.5);
  if (isOn(s, "m1") || isOn(s, "rf")) s.flyReq = { kind: "vel", target: 75 };
  if (isOn(s, "stop")) s.flyReq = { kind: "stop" };
}

const fresh = (time = 0) => ({
  time,
  rot: REST,
  w: 0,
  sp: { p: REST, v: 0, a: 0 },
  armReq: null,
  volts: 0,
  fly: 0,
  flyAng: 0,
  flyReq: null,
  prog: "idle",
  lt: false,
  y: false,
  timeoutOn: true,
  runStart: null,
  bars: [],
  group: null,
  restartedAt: -9,
});

function reset(s, prog) {
  Object.assign(s, fresh(s.time), {
    prog,
    restartedAt: s.time,
    flyAng: s.flyAng,
  });
}

const snap = (s) => ({
  ...s,
  sp: { ...s.sp },
  bars: s.bars.map((b) => ({ ...b })),
  group: s.group && { ...s.group },
  flyReq: s.flyReq && { ...s.flyReq },
});

function advance(s, dt) {
  const n = Math.max(1, Math.round(dt / DT));
  for (let i = 0; i < n; i++) {
    tick(s);
    stepPhysics(s, DT);
    s.time += DT;
  }
}

function simulate(events, duration, rate) {
  const s = fresh(0);
  const out = [];
  let e = 0;
  for (let i = 0, n = Math.ceil(duration * rate) + 2; i < n; i++) {
    while (s.time < i / rate) {
      while (e < events.length && events[e].t <= s.time) events[e++].do(s);
      tick(s);
      stepPhysics(s, DT);
      s.time += DT;
    }
    out.push(snap(s));
  }
  return out;
}

// ---- shared drawing: timeline, stopwatch -------------------------------------------------

function drawStopwatch(ctx, x, y, r, frac, color = C.accent) {
  ctx.save();
  ctx.fillStyle = C.bg2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = alpha(color, 0.55);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(frac));
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(x - 3, y - r - 6, 6, 5);
  ctx.restore();
}

// The kit timeline, plus what this workshop adds on top of it: the view scrolls once
// the playhead nears the right edge (seconds stay true), a bracket around a group's
// members, a stopwatch chip where a timeout will end its bar, and a dashed "waiting"
// slot for the next member of a sequence.
//   v: { bars, group, now, waiting, noScroll, note }   (times relative to the run)
function drawSched(ctx, v, { groupHot = 0 } = {}) {
  const R = TL;
  const left = R.x + 170;
  const right = R.x + R.w - 24;
  const t0 = v.noScroll ? 0 : Math.max(0, v.now - (SPAN - 1));
  const X = (u) => left + ((u - t0) / SPAN) * (right - left);
  // a bar whose start has scrolled off gets its label pinned at the left edge instead
  const pinned = [];
  const bars = v.bars.map((b) => {
    if (X(b.start) < left + 4) {
      pinned.push(b);
      return { ...b, label: "" };
    }
    return b;
  });
  const g = drawTimeline(ctx, R, {
    lanes: ["Arm", "Flywheel"],
    bars,
    view: { t0, span: SPAN },
    now: v.now,
  });
  const top = R.y + 60;
  const laneH = g.laneH;
  // true seconds under the ticks
  ctx.fillStyle = C.bg2;
  ctx.fillRect(left - 40, top + 2 * laneH + 3, right - left + 58, 26);
  for (let sec = Math.ceil(t0 - 1e-9); sec <= t0 + SPAN + 1e-9; sec++)
    text(ctx, `${sec} s`, X(sec), top + 2 * laneH + 22, {
      font: MONO,
      size: 16,
      align: "center",
      color: C.tx3,
    });
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, R.y, right - left, R.h);
  ctx.clip();
  for (const b of pinned) {
    const end = b.end == null || b.end > v.now ? v.now : b.end;
    if (X(end) < left + 30) continue;
    const y = g.laneY(b.lane);
    const cancel = b.state === "cancel" && b.end != null && b.end <= v.now;
    text(ctx, b.label, left + 12, y + (laneH - 24) / 2 + 7, {
      font: MONO,
      size: 18,
      weight: 600,
      color: cancel ? C.err : C.tx,
    });
  }
  // the next member, queued behind the one that has not ended
  if (v.waiting) {
    const y = g.laneY(v.waiting.lane);
    const h = laneH - 24;
    const x = Math.min(X(v.now) + 22, right - 214);
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 200, h);
    ctx.setLineDash([]);
    text(ctx, v.waiting.label, x + 12, y + h / 2 - 2, {
      font: MONO,
      size: 17,
      weight: 600,
      color: C.tx3,
    });
    text(ctx, "waiting", x + 12, y + h / 2 + 20, {
      font: MONO,
      size: 16,
      color: C.tx3,
    });
  }
  ctx.restore();
  // stopwatch chips: where the timeout will end the bar
  for (const b of v.bars) {
    if (!b.chip || b.start > v.now) continue;
    const xe = X(b.start + b.chip);
    if (xe < left - 10 || xe > right + 10) continue;
    const y = g.laneY(b.lane) + (laneH - 24) / 2;
    const frac = clamp((v.now - b.start) / b.chip);
    const doneHere = b.end != null && b.end <= v.now;
    rrect(ctx, xe - 2, y - 17, 104, 34, 17);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = doneHere ? C.accent : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawStopwatch(ctx, xe + 17, y + 1, 10, frac);
    text(ctx, `${b.chip.toFixed(1)} s`, xe + 36, y + 8, {
      font: MONO,
      size: 18,
      weight: 600,
      color: doneHere ? C.accent : C.tx2,
    });
  }
  // the group bracket around its members; no right edge while it is still running
  if (v.group && v.group.start <= v.now) {
    const ended = v.group.end != null && v.group.end <= v.now;
    const gx0 = X(v.group.start) - 6;
    const gx1 = ended ? X(v.group.end) + 6 : X(v.now) + 24;
    const y0 = top - 2;
    const y1 = top + 2 * laneH - 4;
    const col = groupHot ? C.accent : C.tx2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 8, R.y, right - left + 16, R.h);
    ctx.clip();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gx1, y0);
    ctx.lineTo(gx0 + 6, y0);
    ctx.quadraticCurveTo(gx0, y0, gx0, y0 + 6);
    ctx.lineTo(gx0, y1 - 6);
    ctx.quadraticCurveTo(gx0, y1, gx0 + 6, y1);
    ctx.lineTo(gx1, y1);
    if (ended) {
      ctx.moveTo(gx1, y0);
      ctx.lineTo(gx1, y1);
    }
    ctx.stroke();
    ctx.restore();
    text(ctx, v.group.label, Math.max(gx0 + 8, R.x + 470), top - 9, {
      font: MONO,
      size: 18,
      weight: 600,
      color: col,
    });
  }
  if (v.note)
    text(ctx, v.note.s, R.x + R.w - 24, R.y + 36, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "right",
      color: v.note.color ?? C.tx2,
    });
  return { X };
}

// sim state -> the timeline's view of it
function schedView(s) {
  if (s.runStart == null) return { bars: [], group: null, now: -1 };
  const r = s.runStart;
  const rel = (u) => (u == null ? null : u - r);
  const now = s.time - r;
  const bars = s.bars.map((b) => ({
    ...b,
    start: b.start - r,
    end: rel(b.end),
  }));
  const group = s.group && {
    ...s.group,
    start: s.group.start - r,
    end: rel(s.group.end),
  };
  const waiting = isOn(s, "m0") ? { lane: 1, label: "runFast (hold)" } : null;
  return { bars, group, now, waiting };
}

// ---- the code on screen ---------------------------------------------------------------

const BLOCKS = {
  hold: {
    file: "a hold",
    lines: [
      { s: "// A hold. Drives to vertical and keeps" },
      { s: "// holding it, never finishes." },
      { s: "robot.arm.vertical()", on: (s) => isOn(s, "hold"), loop: true },
    ],
  },
  step: {
    file: "a hold, and the same hold as a step",
    lines: [
      { s: "import static org.wpilib.units.Units.Seconds;", stepPart: true },
      { s: "" },
      { s: "// A hold. Drives to vertical and keeps" },
      { s: "// holding it, never finishes." },
      { s: "robot.arm.vertical()" },
      { s: "" },
      { s: "// A step. Holds vertical for one second,", stepPart: true },
      { s: "// then ends.", stepPart: true },
      { s: "robot.arm.vertical()", stepPart: true },
      { s: "    .withTimeout(Seconds.of(1.0))", stepPart: true, chip: 1.0 },
    ],
  },
  seq: {
    file: "MyTeleop.java",
    lines: [
      { s: "Command spinUpWhenReady =" },
      { s: "    Command.sequence(" },
      {
        s: "        robot.arm.vertical()",
        on: (s) => isOn(s, "m0"),
        loop: true,
      },
      {
        s: "            .withTimeout(Seconds.of(1.0)),",
        on: (s) => isOn(s, "m0"),
        chip: 1.0,
        removable: true,
      },
      {
        s: "        robot.flywheel.runFast())",
        on: (s) => isOn(s, "m1"),
        loop: true,
      },
      { s: '      .named("Spin Up When Ready (hold)");', hot: "named" },
      { s: "" },
      { s: "driver.y().whileTrue(spinUpWhenReady)", on: (s) => s.y },
      {
        s: "    .whileFalse(robot.flywheel.stop());",
        on: (s) => isOn(s, "stop"),
        loop: true,
      },
    ],
  },
  race: {
    file: "MyTeleop.java",
    lines: [
      { s: "Command spinWhileHolding =" },
      { s: "    Command.race(" },
      {
        s: "        robot.flywheel.runFast()",
        on: (s) => isOn(s, "rf"),
        loop: true,
      },
      {
        s: "            .withTimeout(Seconds.of(2.0)),",
        on: (s) => isOn(s, "rf"),
        chip: 2.0,
      },
      {
        s: "        robot.arm.horizontal())",
        on: (s) => isOn(s, "ra"),
        loop: true,
      },
      { s: '      .named("Spin While Holding Arm");' },
    ],
  },
};

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    holdDown: Wd("callback", "Hold") + 0.15,
    holdUp: Wd("callback", "end.") + 0.35,
    problem: L("problem").t0,
    stuckY: Wd("problem", "first"),
    step: L("step").t0,
    stepTimeout: Wd("step", "timeout"),
    seq: L("sequence").t0 - 0.1,
    seqY: Wd("sequence", "one") - 1.0,
    release: Wd("last", "go"),
    tryit: L("tryit").t0,
    neverUp: Wd("never", "ends.") + 0.25,
    race: L("race").t0,
    raceGo: Wd("race", "They"),
  };

  const events = [
    { t: L("callback").t0, do: (s) => (s.prog = "hold") },
    { t: T.holdDown, do: (s) => setLT(s, true) },
    { t: T.holdUp, do: (s) => setLT(s, false) },
    { t: T.problem, do: (s) => (reset(s, "seq"), (s.timeoutOn = false)) },
    { t: T.stuckY, do: (s) => setY(s, true) },
    { t: T.step, do: (s) => reset(s, "idle") },
    { t: T.seq, do: (s) => reset(s, "seq") },
    { t: T.seqY, do: (s) => setY(s, true) },
    { t: T.release, do: (s) => setY(s, false) },
    { t: T.tryit, do: (s) => reset(s, "seq") },
    // the gate, played for you
    { t: gate.t0 + 0.6, do: (s) => (s.timeoutOn = false) },
    { t: gate.t0 + 1.6, do: (s) => setY(s, true) },
    { t: T.neverUp, do: (s) => setY(s, false) },
    {
      t: T.race,
      do: (s) => (
        (s.prog = "race"),
        (s.timeoutOn = true),
        (s.runStart = null),
        (s.bars = []),
        (s.group = null)
      ),
    },
    { t: T.raceGo, do: (s) => startRace(s) },
  ].sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = simulate(events, VOICE.duration, RATE);
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 540, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: T.step + 0.1, x: 1480, y: 330, z: 1.35, d: 1.1 },
    { t: T.stepTimeout - 0.2, ...FULL, d: 1.1 },
    { t: L("stays").t0 - 0.1, x: 560, y: 300, z: 1.45, d: 1.2 },
    { t: L("last").t0 - 0.2, ...FULL, d: 1.1 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function blockAt(t, live) {
    if (live) return ["seq", -9];
    if (t < T.problem) return ["hold", L("intro").t0 - 0.4];
    if (t < T.step) return ["seq", T.problem];
    if (t < T.seq) return ["step", T.step];
    if (t < T.race) return ["seq", T.seq];
    return ["race", T.race];
  }

  function runningName(s) {
    if (s.group && s.group.end == null) return s.group.label;
    const b = s.bars.find((x) => x.end == null);
    return b ? b.label : null;
  }

  function drawCode(ctx, s, t, live) {
    panel(ctx, CODE);
    micro(ctx, "running", CODE.x + 28, CODE.y + 44);
    const name = runningName(s);
    text(ctx, name ?? "nothing", CODE.x + 140, CODE.y + 45, {
      font: MONO,
      size: 21,
      weight: 600,
      color: name ? C.accent : C.tx3,
    });
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const [key, since] = blockAt(t, live);
    const B = BLOCKS[key];
    const a = live ? 1 : easeOut(ramp(t, since, 0.45));
    const pulse = 0.5 + 0.5 * Math.cos(((t % 0.13) / 0.13) * TAU);
    ctx.save();
    ctx.globalAlpha = a;
    micro(ctx, B.file, CODE.x + 28, CODE.y + 112);
    let ly = CODE.y + 160 - LH;
    for (const ln of B.lines) {
      ly += ln.s ? LH : LH / 2;
      if (!ln.s) continue;
      let la = 1;
      if (ln.stepPart && !live) la = easeOut(ramp(t, T.stepTimeout - 0.3, 0.5));
      if (la <= 0) continue;
      // in the step beat the lines light from the preview, not the sim
      let on = ln.on?.(s);
      if (key === "step")
        on = ln.stepPart
          ? t >= T.stepTimeout && t < T.stepTimeout + 1.2 && ln.chip
          : t >= T.step + 0.3 &&
            t < T.stepTimeout - 0.3 &&
            ln.s === "robot.arm.vertical()";
      if (key === "step" && ln.stepPart && ln.s === "robot.arm.vertical()")
        on = t >= T.stepTimeout && t < T.stepTimeout + 1.2;
      const removed = ln.removable && !s.timeoutOn;
      if (on && !removed)
        runBar(ctx, CODE.x + 1, ly - 22, CODE.w - 2, LH, ln.loop ? pulse : 0);
      codeLine(ctx, ln.s, CODE.x + 28, ly, { a: la * (removed ? 0.35 : 1) });
      if (removed) {
        const x0 = CODE.x + 28 + codeWidth(ctx, "            ");
        ctx.strokeStyle = C.err;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x0, ly - 7);
        ctx.lineTo(x0 + codeWidth(ctx, ln.s.trim()), ly - 7);
        ctx.stroke();
      }
      if (ln.chip && !removed) {
        const hint =
          !live && t >= T.tryit && t < gate.t0 + 0.6
            ? 0.5 + 0.5 * Math.cos(t * 6)
            : live && s.timeoutOn
              ? 0.5 + 0.5 * Math.cos(s.time * 6)
              : 0;
        ctx.save();
        ctx.globalAlpha *= la;
        if (hint) {
          ctx.beginPath();
          ctx.arc(CODE.x + CODE.w - 30, ly - 7, 18 + 4 * hint, 0, TAU);
          ctx.strokeStyle = alpha(C.accent, 0.3 + 0.5 * hint);
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        drawStopwatch(ctx, CODE.x + CODE.w - 30, ly - 7, 11, 0.25);
        ctx.restore();
      }
      if (ln.hot === "named" && !live) {
        const k = window_(
          t,
          Wd("last", "whole") - 0.1,
          Wd("last", "Letting") - 0.1,
          0.3
        );
        if (k > 0) {
          ctx.fillStyle = alpha(C.accent, 0.9 * k);
          ctx.fillRect(CODE.x + 8, ly - 20, 4, LH - 4);
          const x0 =
            CODE.x + 28 + codeWidth(ctx, '      .named("Spin Up When Ready ');
          ctx.strokeStyle = alpha(C.accent, k);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x0, ly + 5);
          ctx.lineTo(x0 + codeWidth(ctx, "(hold)"), ly + 5);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function chip(ctx, R, title, value, target, on, lit) {
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = lit ? alpha(C.accent, 0.35 + 0.65 * lit) : C.rule;
    ctx.lineWidth = 2 + 2 * lit;
    ctx.stroke();
    micro(ctx, title, R.x + 22, R.y + 27, { size: 16 });
    ctx.beginPath();
    ctx.arc(R.x + R.w - 24, R.y + 22, 8, 0, TAU);
    ctx.fillStyle = on ? C.accent : C.tx3;
    ctx.fill();
    text(ctx, value, R.x + 22, R.y + 59, {
      font: MONO,
      size: 20,
      weight: 600,
      color: on ? C.accent : C.tx3,
    });
    if (target)
      text(ctx, target, R.x + R.w - 22, R.y + 59, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "right",
        color: C.tx,
      });
  }

  function drawMotors(ctx, s, t, live) {
    const lit = live
      ? 0
      : window_(t, Wd("stays", "Its") - 0.2, L("stays").t1 + 0.3, 0.3);
    // leads to the mechanisms
    const lead = (on, path) => {
      ctx.strokeStyle = on ? alpha(C.accent, 0.8) : C.rule;
      ctx.lineWidth = 4;
      ctx.beginPath();
      path();
      ctx.stroke();
    };
    lead(s.armReq != null, () => {
      ctx.moveTo(CHIP_A.x + CHIP_A.w, CHIP_A.y + 36);
      ctx.bezierCurveTo(
        CHIP_A.x + CHIP_A.w + 140,
        CHIP_A.y + 36,
        PIVOT.x - 60,
        PIVOT.y + 150,
        PIVOT.x - 20,
        PIVOT.y + 40
      );
    });
    lead(s.flyReq?.kind === "vel", () => {
      ctx.moveTo(CHIP_F.x + CHIP_F.w, CHIP_F.y + 36);
      ctx.bezierCurveTo(
        CHIP_F.x + CHIP_F.w + 150,
        CHIP_F.y + 56,
        860,
        FLOOR + 75,
        900,
        FLOOR + 6
      );
    });
    const ar = s.armReq;
    chip(
      ctx,
      CHIP_A,
      "arm motor · request on it",
      ar == null ? "none" : "MotionMagicVoltage",
      ar == null ? "" : `${ar} rot`,
      ar != null,
      lit
    );
    const fr = s.flyReq;
    chip(
      ctx,
      CHIP_F,
      "flywheel motor · request on it",
      !fr
        ? "none"
        : fr.kind === "vel"
          ? "MotionMagicVelocityVoltage"
          : "stopMotor()",
      !fr ? "" : fr.kind === "vel" ? `${fr.target} rps` : "neutral",
      fr?.kind === "vel",
      0
    );
  }

  function drawBench(ctx, s, t, live) {
    drawStand(ctx, PIVOT, FLOOR);
    if (s.armReq === 0.5) {
      drawTargetMark(ctx, PIVOT, ARM_LEN, 0.5, "", 1);
      text(ctx, "0.5 rot", PIVOT.x - ARM_LEN - 46, PIVOT.y - 22, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.accent,
      });
    } else if (s.armReq === 0.25)
      drawTargetMark(ctx, PIVOT, ARM_LEN, 0.25, "0.25 rot · vertical", 1);
    if (s.armReq != null && Math.abs(s.sp.p - s.rot) > 0.004)
      drawArmBody(ctx, PIVOT, ARM_LEN, s.sp.p, { ghost: true });
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, {
      driven: Math.abs(s.volts) > 0.3,
    });
    text(ctx, `${s.rot.toFixed(3)} rot`, PIVOT.x, 525, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: C.tx2,
    });
    drawFlywheel(ctx, FLY, FLY_R, s.flyAng, {
      rps: s.fly,
      driven: s.flyReq?.kind === "vel",
      label: `${s.fly.toFixed(1)} rps`,
    });
    const since = t - s.restartedAt;
    if (!live && since >= 0 && since < 2.0)
      text(ctx, "starting over", 910, 572, {
        font: MONO,
        size: 20,
        align: "center",
        color: C.tx2,
        a: window_(since, 0, 2.0, 0.3),
        spacing: 1.5,
      });
    // the step is over, the request is not
    if (!live) {
      const k = window_(
        t,
        Wd("stays", "stays") - 0.2,
        L("stays").t1 + 0.3,
        0.35
      );
      if (k > 0) {
        text(ctx, "step ended", PIVOT.x + 40, PIVOT.y - 150, {
          font: MONO,
          size: 20,
          weight: 600,
          color: C.tx3,
          a: k,
        });
        text(ctx, "arm still up", PIVOT.x + 40, PIVOT.y - 124, {
          font: MONO,
          size: 20,
          weight: 600,
          color: C.accent,
          a: k,
        });
      }
    }
  }

  function drawPad(ctx, s) {
    drawController(ctx, PAD, { lt: s.lt, label: false });
    const yx = PAD.x + PAD.w - 110;
    const yy = PAD.y + 120 - 28;
    if (s.y) {
      ctx.beginPath();
      ctx.arc(yx, yy, 17, 0, TAU);
      ctx.fillStyle = C.accent;
      ctx.fill();
      text(ctx, "Y", yx, yy + 6, {
        font: MONO,
        size: 16,
        weight: 700,
        align: "center",
        color: C.accentInk,
      });
    }
    const label =
      s.prog === "hold"
        ? s.lt
          ? "left trigger held"
          : "left trigger up"
        : s.prog === "seq"
          ? s.y
            ? "Y held"
            : "Y up"
          : s.prog === "race"
            ? "no button · scheduled"
            : "";
    const hot = s.lt || s.y;
    if (label)
      text(ctx, label, PAD.x + PAD.w / 2, PAD.y + PAD.h + 44, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: hot ? C.accent : C.tx3,
      });
  }

  function schedFor(s, t, live) {
    if (!live && t < L("callback").t0) {
      // a list, in order
      const k = easeOut(ramp(t, L("intro").t0 + 0.6, 0.8));
      return {
        bars: [
          { lane: 0, start: 0, end: 1.2, label: "command 1", dashed: true },
          { lane: 1, start: 1.2, end: 2.6, label: "command 2", dashed: true },
        ].filter(
          (b, i) => k > 0 && (i === 0 || t > Wd("intro", "order.") - 0.4)
        ),
        group: null,
        now: 99,
        noScroll: true,
      };
    }
    if (!live && t >= T.step && t < T.seq) {
      // the hold, then the same hold with an ending
      if (t < T.stepTimeout - 0.2) {
        const now = clamp((t - T.step - 0.3) * 1.2, 0, 3);
        return {
          bars: [
            {
              lane: 0,
              start: 0,
              end: null,
              label: "vertical (hold)",
              open: true,
            },
          ],
          group: null,
          now,
          noScroll: true,
        };
      }
      const now = clamp((t - T.stepTimeout) * 1.1, 0, 1.6);
      return {
        bars: [
          {
            lane: 0,
            start: 0,
            end: 1.0,
            label: "vertical (hold)",
            chip: 1.0,
            state: "done",
          },
        ],
        group: null,
        now,
        noScroll: true,
      };
    }
    const v = schedView(s);
    if (!live) {
      if (t > Wd("problem", "There's") - 0.1 && t < T.step)
        v.note = { s: "no error · nothing logged" };
      if (t > L("never").t0 && t < T.race)
        v.note = { s: "flywheel lane: empty" };
      if (t > Wd("race", "ends") && t < Wd("race", "So"))
        v.note = { s: "first to finish ends the race", color: C.accent };
      if (t >= Wd("race", "So") && t < L("close").t0 + 0.5)
        v.note = { s: "a hold never finishes, so it never wins", color: C.err };
    } else if (!s.timeoutOn && s.y && s.time - s.runStart > 2.2)
      v.note = { s: "flywheel lane: empty" };
    return v;
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
    micro(ctx, "Workshop 4 · Command Composition", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Steps", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Give every step an ending.", W / 2, 470, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "The last one decides whether the list ends.", W / 2, 580, {
      font: SERIF,
      size: 64,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "The") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? at(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawCode(ctx, s, t, !!live);
    drawMotors(ctx, s, t, !!live);
    drawBench(ctx, s, t, !!live);
    drawPad(ctx, s);
    const groupHot = live
      ? 0
      : window_(t, Wd("last", "whole") - 0.1, Wd("last", "Letting") - 0.1, 0.3);
    drawSched(ctx, schedFor(s, t, !!live), { groupHot });
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = fresh(gate.t0);
    s.prog = "seq";
    let phase = "remove";
    let doneAt = null;
    return {
      state: s,
      prompt: () =>
        ({
          remove: "Take the timeout off. Press X.",
          hold: "Timeout's off. Now hold Y.",
          withTimeout:
            "That run still had its timeout. Let go, press X, and hold Y again.",
          watch: "Keep holding. Watch the flywheel lane.",
          early: "Hold Y a little longer.",
          stuck: "The flywheel never starts.",
        })[phase],
      input(name, v) {
        if (name === "timeout" && v === true) {
          if (!s.y) s.timeoutOn = !s.timeoutOn;
          if (phase === "remove" || phase === "hold" || phase === "withTimeout")
            phase = s.timeoutOn ? "remove" : "hold";
        }
        if (name === "y") {
          setY(s, !!v);
          if (v) phase = s.timeoutOn ? "withTimeout" : "watch";
          else if (phase === "watch") phase = "early";
          else if (phase === "withTimeout")
            phase = s.timeoutOn ? "remove" : "hold";
        }
      },
      step(dt) {
        advance(s, dt);
        if (!s.timeoutOn && s.y && s.runStart != null) {
          const run = s.time - s.runStart;
          if (run > 2.2 && phase !== "stuck") phase = "stuck";
          if (run > 4.4 && doneAt == null) doneAt = s.time;
        }
        if (phase === "early" && !s.y && !s.timeoutOn) phase = "hold";
        return doneAt !== null && s.time - doneAt > 0.3;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.6) return "Take the timeout off. Press X.";
    if (u < 1.6) return "Timeout's off. Now hold Y.";
    if (u < 3.8) return "Keep holding. Watch the flywheel lane.";
    return "The flywheel never starts.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      { k: "timeout", label: "Remove the timeout", key: "KeyX", kind: "press" },
      { k: "y", label: "Hold Y", key: "KeyY", kind: "hold" },
    ],
  };
}
