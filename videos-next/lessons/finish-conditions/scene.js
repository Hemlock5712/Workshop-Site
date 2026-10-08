// Ask Every Loop. .until(() -> robot.arm.isAtTarget()) ends a step on the first loop
// the arm's own sensor says it arrived; .withTimeout backs it with a clock. On the
// timeline the step is a race between the condition and a stopwatch.
//
// What is simulated, and how:
//   arm        the Motion Magic position model from motion-magic-code (a quicker
//              profile here, so a healthy raise takes about half a second). The
//              request stays on the motor after every step, so the arm never drops.
//   sensor     the CANcoder reading: the arm's angle plus a small fixed offset and a
//              deterministic jitter of a few hundredths of a degree. Close, never exact.
//   scheduler  loops every 20 ms. Each loop asks isAtTarget() once; the first true
//              ends the condition, or the 2 s stopwatch ends the step first.
//   flywheel   the next step: a 75 rps velocity request, first-order spin-up.
// Angles are rotations on the unit circle: 0 points right, 0.25 straight up (90°).

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
  drawFlywheel,
  drawStand,
  drawTargetMark,
  drawTimeline,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const GAUGE = { x: 60, y: 40, w: 440, h: 360 };
const CHIP_A = { x: 60, y: 420, w: 440, h: 72 };
const CHIP_F = { x: 60, y: 504, w: 440, h: 72 };
const PIVOT = { x: 780, y: 290 };
const ARM_LEN = 170;
const FLOOR = 485;
const FLY = { x: 1040, y: 280 };
const FLY_R = 85;
const CODE = { x: 1220, y: 40, w: 660, h: 536 };
const TL = { x: 60, y: 590, w: 1800, h: 310 };
const LANES = ["Arm", "timer", "Flywheel"];
const LH = 31;
const SPAN = 5;
const START = 0.5; // each run starts at horizontal (0.5 rot), where its last request held it
const TARGET = 0.25;
const LOOP = 0.02;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const PHYS = { kM: 5, b: 4, g: 12 };
const MM = { cruise: 1.0, accel: 4.0 };
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

function stepPhysics(s, dt) {
  stepProfile(s.sp, s.armReq, dt);
  const phi = s.rot * TAU;
  const e = (s.sp.p - s.rot) * TAU;
  const ev = (s.sp.v - s.w) * TAU;
  s.volts = clamp(
    (PHYS.g * Math.cos(phi) + PHYS.b * s.sp.v * TAU + 0.7 * s.sp.a * TAU) /
      PHYS.kM +
      10 * e +
      3.5 * ev,
    -12,
    12
  );
  const acc = PHYS.kM * s.volts - PHYS.g * Math.cos(phi) - PHYS.b * s.w * TAU;
  s.w += (acc / TAU) * dt;
  s.rot += s.w * dt;
  if (s.flyReq) s.fly += ((s.flyReq - s.fly) / 0.3) * dt;
  else s.fly += (-s.fly / 5) * dt;
  s.flyAng += s.fly * 0.02 * TAU * dt;
}

// The CANcoder, in degrees: a fixed few-hundredths offset plus jitter. Never exact.
function readingDeg(s) {
  const k = Math.floor(s.time / LOOP) * LOOP; // one reading per loop
  const jitter =
    (0.012 * (Math.sin(TAU * 7.3 * k) + 0.6 * Math.sin(TAU * 13.1 * k + 1))) /
    1.6;
  return s.rot * 360 - 0.03 + jitter;
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

// mode "guess": last lesson's vertical().withTimeout(1.0)
// mode "until": .until(...) alone;  mode "both": .until(...) and .withTimeout(2.0)
function run(s, mode) {
  Object.assign(s, {
    rot: START,
    w: 0,
    sp: { p: START, v: 0, a: 0 },
    armReq: START,
    fly: 0,
    flyReq: null,
    restartedAt: s.time,
  });
  s.runStart = s.time;
  s.bars = [];
  s.asks = [];
  s.group = null;
  s.outcome = null;
  s.mode = mode;
  s.nextLoop = s.time;
  if (mode === "guess")
    startBar(s, "guess", 0, "vertical (hold)", { chip: 1.0 });
  else startBar(s, "cond", 0, "vertical until at target");
  if (mode === "both") {
    startBar(s, "timer", 1, "timeout", { chip: 2.0 });
    s.group = { start: s.time, end: null, label: "raiseArm · a race" };
  }
  s.armReq = TARGET;
  s.sp = { p: s.rot, v: 0, a: 0 };
}

function next(s, outcome) {
  s.outcome = outcome;
  s.outcomeAt = s.time;
  s.outcomeDeg = readingDeg(s);
  if (s.group) s.group.end = s.time;
  startBar(s, "next", 2, "runFast (hold)", { open: true });
  s.flyReq = 75;
}

function tick(s) {
  if (s.runStart == null || s.time + 1e-9 < s.nextLoop) return;
  s.nextLoop += LOOP;
  s.answer = Math.abs(readingDeg(s) - TARGET * 360) <= s.tol;
  if (isOn(s, "cond")) {
    s.asks.push({ t: s.time, v: s.answer });
    if (s.answer) {
      endBar(s, "cond", "done");
      endBar(s, "timer", "cancel");
      next(s, "arrived");
    }
  }
  const tm = live_(s, "timer");
  if (tm && s.time - tm.start >= 2.0 - 1e-9) {
    endBar(s, "timer", "done");
    endBar(s, "cond", "cancel");
    next(s, "timed out");
  }
  const g = live_(s, "guess");
  if (g && s.time - g.start >= 1.0 - 1e-9) {
    endBar(s, "guess", "done");
    next(s, "one second passed");
  }
}

const fresh = (time = 0) => ({
  time,
  rot: START,
  w: 0,
  sp: { p: START, v: 0, a: 0 },
  armReq: START,
  volts: 0,
  fly: 0,
  flyAng: 0,
  flyReq: null,
  tol: 1.0,
  answer: false,
  runStart: null,
  nextLoop: 0,
  bars: [],
  asks: [],
  group: null,
  mode: "both",
  outcome: null,
  outcomeAt: -9,
  outcomeDeg: 0,
  restartedAt: -9,
});

const snap = (s) => ({
  ...s,
  sp: { ...s.sp },
  bars: s.bars.map((b) => ({ ...b })),
  asks: s.asks.slice(),
  group: s.group && { ...s.group },
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

// ---- shared drawing: timeline, stopwatch (same as chaining-commands) ---------------------

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

//   v: { bars, group, now, asks, noScroll, note, hot }   (times relative to the run)
function drawSched(ctx, v) {
  const R = TL;
  const left = R.x + 170;
  const right = R.x + R.w - 24;
  const t0 = v.noScroll ? 0 : Math.max(0, v.now - (SPAN - 1));
  const X = (u) => left + ((u - t0) / SPAN) * (right - left);
  const pinned = [];
  const bars = v.bars.map((b) => {
    if (X(b.start) < left + 4) {
      pinned.push(b);
      return { ...b, label: "" };
    }
    return b;
  });
  const g = drawTimeline(ctx, R, {
    lanes: LANES,
    bars,
    view: { t0, span: SPAN },
    now: v.now,
  });
  const top = R.y + 60;
  const laneH = g.laneH;
  const n = LANES.length;
  ctx.fillStyle = C.bg2;
  ctx.fillRect(left - 40, top + n * laneH + 3, right - left + 58, 26);
  for (let sec = Math.ceil(t0 - 1e-9); sec <= t0 + SPAN + 1e-9; sec++)
    text(ctx, `${sec} s`, X(sec), top + n * laneH + 22, {
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
    const cancel = b.state === "cancel" && b.end != null && b.end <= v.now;
    text(ctx, b.label, left + 12, g.laneY(b.lane) + (laneH - 24) / 2 + 7, {
      font: MONO,
      size: 18,
      weight: 600,
      color: cancel ? C.err : C.tx,
    });
  }
  // one tick per loop along the condition's bar: hollow while false, lit when true
  if (v.asks) {
    const y = g.laneY(0) + laneH - 24 - 7;
    for (const a of v.asks) {
      if (a.t > v.now) break;
      const x = X(a.t);
      ctx.fillStyle = a.v ? C.accent : alpha(C.tx3, 0.8);
      ctx.fillRect(x - 1.5, a.v ? y - 8 : y - 3, 3, a.v ? 14 : 6);
    }
  }
  ctx.restore();
  for (const b of v.bars) {
    if (!b.chip || b.start > v.now) continue;
    const xe = X(b.start + b.chip);
    if (xe < left - 10 || xe > right + 10) continue;
    const y = g.laneY(b.lane) + (laneH - 24) / 2;
    const frac = clamp((v.now - b.start) / b.chip);
    const doneHere = b.end != null && b.end <= v.now && b.state === "done";
    rrect(ctx, xe - 2, y - 17, 104, 34, 17);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = doneHere ? C.accent : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawStopwatch(
      ctx,
      xe + 17,
      y + 1,
      10,
      b.end != null && b.end <= v.now ? (b.end - b.start) / b.chip : frac
    );
    text(ctx, `${b.chip.toFixed(1)} s`, xe + 36, y + 8, {
      font: MONO,
      size: 18,
      weight: 600,
      color: doneHere ? C.accent : C.tx2,
    });
  }
  // the group bracket, around the arm and timer lanes
  if (v.group && v.group.start <= v.now) {
    const ended = v.group.end != null && v.group.end <= v.now;
    const gx0 = X(v.group.start) - 6;
    const gx1 = ended ? X(v.group.end) + 6 : X(v.now) + 24;
    const y0 = top - 2;
    const y1 = top + 2 * laneH - 4;
    ctx.save();
    ctx.beginPath();
    ctx.rect(left - 8, R.y, right - left + 16, R.h);
    ctx.clip();
    ctx.strokeStyle = C.tx2;
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
      color: C.tx2,
    });
  }
  // a preview can light one bar to point at it
  if (v.hot != null) {
    const b = v.bars[v.hot];
    const y = g.laneY(b.lane);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(
      X(b.start) - 4,
      y - 4,
      X(b.end ?? SPAN) - X(b.start) + 8,
      laneH - 16
    );
  }
  if (v.note)
    text(ctx, v.note.s, R.x + R.w - 24, R.y + 36, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "right",
      color: v.note.color ?? C.tx2,
    });
}

function schedView(s) {
  if (s.runStart == null) return { bars: [], group: null, now: -1, asks: [] };
  const r = s.runStart;
  const rel = (u) => (u == null ? null : u - r);
  return {
    bars: s.bars.map((b) => ({ ...b, start: b.start - r, end: rel(b.end) })),
    group: s.group && {
      ...s.group,
      start: s.group.start - r,
      end: rel(s.group.end),
    },
    asks: s.asks.map((a) => ({ t: a.t - r, v: a.v })),
    now: s.time - r,
  };
}

// ---- formatting -----------------------------------------------------------------------

const tolText = (tol) => {
  const r = Math.round(tol * 1000) / 1000;
  return Number.isInteger(r) ? r.toFixed(1) : String(r);
};

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    introRun: Wd("intro", "ends") - 0.2,
    guessRun: Wd("callback", "the") + 0.1,
    question: L("question").t0,
    every: L("every").t0,
    arrow: Wd("every", "arrow"),
    everyRun: Wd("every", "ends") - 0.75,
    timeout: L("timeout").t0,
    addTimeout: Wd("timeout", "timeout."),
    arrives: Wd("timeout", "arrives,"),
    clock: Wd("timeout", "clock"),
    raceRun: Wd("race", "sensor") - 0.2,
    tryit: L("tryit").t0,
    loseRun: Wd("lose", "clock") - 2.0,
    proves: L("proves").t0,
  };
  const SQ0 = gate.t0 + 0.4; // the slider, played for you
  const SQ1 = gate.t0 + 2.0;
  const GRUN = gate.t0 + 2.6;

  const events = [
    { t: T.introRun, do: (s) => run(s, "until") },
    { t: T.guessRun, do: (s) => run(s, "guess") },
    { t: T.everyRun, do: (s) => run(s, "until") },
    {
      t: T.timeout,
      do: (s) => (
        (s.runStart = null),
        (s.bars = []),
        (s.group = null),
        (s.outcome = null)
      ),
    },
    { t: T.raceRun, do: (s) => run(s, "both") },
    { t: GRUN, do: (s) => run(s, "both") },
    { t: T.loseRun, do: (s) => run(s, "both") },
  ];
  // the slider goes down in steps the scheduler sees
  for (let k = 0; k <= 30; k++) {
    const u = k / 30;
    events.push({
      t: SQ0 + u * (SQ1 - SQ0),
      do: (s) =>
        (s.tol = Math.max(0.001, Math.round(1000 * (1 - easeInOut(u))) / 1000)),
    });
  }
  events.sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = simulate(events, VOICE.duration, RATE);
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // when the arm really got there, on last time's one-second guess
  let guessArrive = 0;
  for (let t = T.guessRun + 0.05; t < T.guessRun + 1; t += 1 / RATE) {
    if (Math.abs(at(t).rot * 360 - 90) <= 1) {
      guessArrive = t - T.guessRun;
      break;
    }
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 540, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: T.question - 0.1, x: 1480, y: 300, z: 1.35, d: 1.1 },
    { t: Wd("question", "Close") - 0.2, x: 520, y: 290, z: 1.45, d: 1.2 },
    { t: T.every - 0.1, x: 1480, y: 400, z: 1.35, d: 1.1 },
    { t: Wd("every", "asked") - 0.4, ...FULL, d: 1.1 },
    { t: Wd("proves", "A") - 0.3, x: 520, y: 290, z: 1.45, d: 1.2 },
    { t: L("close").t0 - 0.3, ...FULL, d: 0.8 },
  ];

  // ---- code ----------------------------------------------------------------------

  function drawCode(ctx, s, t, live) {
    panel(ctx, CODE);
    micro(ctx, "running", CODE.x + 28, CODE.y + 44);
    const cur = s.bars.find((b) => b.end == null);
    const name =
      s.group && s.group.end == null
        ? "raiseArm"
        : cur
          ? cur.label.replace("next step · ", "")
          : null;
    text(ctx, name ?? "nothing", CODE.x + 140, CODE.y + 45, {
      font: MONO,
      size: 21,
      weight: 600,
      color: name ? C.accent : C.tx3,
    });
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const pulse = 0.5 + 0.5 * Math.cos(((t % 0.13) / 0.13) * TAU);
    const asking = isOn(s, "cond");
    const x = CODE.x + 28;

    // Arm.java: the question
    micro(ctx, "Arm.java", x, CODE.y + 112);
    let y = CODE.y + 150;
    codeLine(ctx, "private final Angle tolerance =", x, y);
    y += LH;
    const tolHot = live ? 1 : window_(t, T.tryit, gate.t1 + 0.3, 0.3);
    if (tolHot > 0) runBar(ctx, CODE.x + 1, y - 22, CODE.w - 2, LH, 0);
    const end = codeLine(ctx, "    Degrees.of(", x, y);
    const v = tolText(s.tol);
    const vx = codeLine(ctx, v, end, y);
    codeLine(ctx, ");", vx, y);
    if (s.tol < 0.999) {
      ctx.fillStyle = C.accent;
      ctx.fillRect(end, y + 5, vx - end, 2);
    }
    y += LH + 6;
    const qa = asking ? 1 : 0;
    for (const ln of [
      "public boolean isAtTarget() {",
      "  return getPosition().isNear(",
      "      getTargetPosition(), tolerance);",
      "}",
    ]) {
      if (qa && ln !== "}" && !ln.startsWith("public"))
        runBar(ctx, CODE.x + 1, y - 22, CODE.w - 2, LH, pulse * 0.6);
      codeLine(ctx, ln, x, y);
      y += LH;
    }

    // the step: last time's guess, then the condition, then the condition and a timeout
    const guess = !live && t < T.question;
    const withTimeout = live || t >= T.addTimeout - 0.2;
    const ta = live ? 1 : easeOut(ramp(t, guess ? 0 : T.question, 0.4));
    y += 14;
    ctx.save();
    ctx.globalAlpha = ta;
    if (guess && t >= T.guessRun - 0.6) {
      micro(ctx, "last time", x, y);
      y += 38;
      const on = isOn(s, "guess");
      if (on) runBar(ctx, CODE.x + 1, y - 22, CODE.w - 2, LH * 2, pulse);
      codeLine(ctx, "robot.arm.vertical()", x, y);
      codeLine(ctx, "    .withTimeout(Seconds.of(1.0))", x, y + LH);
      drawStopwatch(ctx, CODE.x + CODE.w - 30, y + LH - 7, 11, 0.25);
    } else {
      micro(ctx, "the step", x, y);
      y += 38;
      codeLine(ctx, "Command raiseArm =", x, y);
      y += LH;
      if (asking || isOn(s, "guess"))
        runBar(ctx, CODE.x + 1, y - 22, CODE.w - 2, LH, pulse);
      codeLine(ctx, "    robot.arm.vertical()", x, y);
      y += LH;
      if (asking) runBar(ctx, CODE.x + 1, y - 22, CODE.w - 2, LH, pulse);
      const ux = codeLine(ctx, "      .until(", x, y);
      const ax = codeLine(ctx, "() ->", ux, y);
      codeLine(ctx, " robot.arm.isAtTarget())", ax, y);
      const arrowK = live
        ? 0
        : window_(t, T.arrow - 0.1, Wd("every", "asked"), 0.3);
      if (arrowK > 0) {
        ctx.fillStyle = alpha(C.accent, arrowK);
        ctx.fillRect(ux, y + 5, ax - ux, 3);
      }
      // the answer to this loop's question
      if (s.runStart != null && s.mode !== "guess") {
        const ans = asking ? s.answer : s.outcome === "arrived";
        const cx = CODE.x + CODE.w - 70;
        rrect(ctx, cx - 4, y - 22, 66, 30, 15);
        ctx.fillStyle = ans ? C.accent : C.bg3;
        ctx.fill();
        text(ctx, ans ? "true" : "false", cx + 29, y - 1, {
          font: MONO,
          size: 17,
          weight: 700,
          align: "center",
          color: ans ? C.accentInk : C.tx2,
        });
      }
      y += LH;
      codeLine(
        ctx,
        withTimeout
          ? '      .named("vertical until at target")'
          : '      .named("vertical until at target");',
        x,
        y
      );
      y += LH;
      if (withTimeout) {
        const k = live ? 1 : easeOut(ramp(t, T.addTimeout - 0.2, 0.4));
        if (isOn(s, "timer"))
          runBar(ctx, CODE.x + 1, y - 22, CODE.w - 2, LH, 0);
        codeLine(ctx, "      .withTimeout(Seconds.of(2.0));", x, y, { a: k });
        ctx.save();
        ctx.globalAlpha *= k;
        drawStopwatch(ctx, CODE.x + CODE.w - 30, y - 7, 11, 0.25);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ---- the gauge -------------------------------------------------------------------

  function drawGauge(ctx, s, t, live) {
    const R = GAUGE;
    panel(ctx, R, C.bg2);
    micro(ctx, "CANcoder · arm angle", R.x + 24, R.y + 38, { size: 16 });
    const deg = readingDeg(s);
    const tgt = TARGET * 360;
    const inBand = Math.abs(deg - tgt) <= s.tol;
    text(ctx, `${deg.toFixed(3)}°`, R.x + 24, R.y + 96, {
      font: MONO,
      size: 42,
      weight: 600,
      color: inBand ? C.accent : C.tx,
    });
    micro(ctx, "target", R.x + 24, R.y + 136, { size: 16 });
    text(ctx, `${tgt.toFixed(3)}°`, R.x + 130, R.y + 137, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.tx2,
    });
    micro(ctx, "tolerance", R.x + 24, R.y + 168, { size: 16 });
    text(ctx, `± ${tolText(s.tol)}°`, R.x + 160, R.y + 169, {
      font: MONO,
      size: 22,
      weight: 600,
      color: live || s.tol < 0.999 ? C.accent : C.tx2,
    });
    // the ruler: zooms in as the band gets narrower, so the gap stays visible
    const S = clamp(s.tol * 3, 0.1, 4);
    const x0 = R.x + 36;
    const x1 = R.x + R.w - 36;
    const cy = R.y + 240;
    const X = (d) => x0 + ((d - (tgt - S)) / (2 * S)) * (x1 - x0);
    ctx.fillStyle = C.rule;
    ctx.fillRect(x0, cy, x1 - x0, 2);
    const bw = Math.max(3, X(tgt + s.tol) - X(tgt - s.tol));
    ctx.fillStyle = alpha(C.accent, 0.22);
    ctx.fillRect(X(tgt) - bw / 2, cy - 30, bw, 60);
    ctx.fillStyle = C.accent;
    ctx.fillRect(X(tgt) - bw / 2, cy - 30, 2, 60);
    ctx.fillRect(X(tgt) + bw / 2 - 2, cy - 30, 2, 60);
    ctx.fillRect(X(tgt) - 1, cy - 38, 2, 8);
    const lab = (d) => `${d.toFixed(S < 1 ? 2 : 0)}°`;
    text(ctx, lab(tgt - S), x0, cy + 56, {
      font: MONO,
      size: 17,
      align: "center",
      color: C.tx3,
    });
    text(ctx, lab(tgt), X(tgt), cy + 56, {
      font: MONO,
      size: 17,
      align: "center",
      color: C.accent,
    });
    text(ctx, lab(tgt + S), x1, cy + 56, {
      font: MONO,
      size: 17,
      align: "center",
      color: C.tx3,
    });
    // the needle; off the scale it waits at the edge
    const nx = X(deg);
    const off = nx > x1 + 4 || nx < x0 - 4;
    const px = clamp(nx, x0, x1);
    ctx.fillStyle = inBand ? C.accent : C.tx;
    ctx.beginPath();
    ctx.moveTo(px, cy - 4);
    ctx.lineTo(px - 10, cy - 24);
    ctx.lineTo(px + 10, cy - 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(px - 1.5, cy - 24, 3, 46);
    if (off)
      text(ctx, nx > x1 ? "→" : "←", px + (nx > x1 ? -26 : 26), cy - 32, {
        font: MONO,
        size: 20,
        weight: 700,
        align: "center",
        color: C.tx2,
      });
    // how the last step ended
    if (s.outcome && s.mode !== "guess") {
      const bad = s.outcome === "timed out";
      micro(ctx, "step ended", R.x + 24, R.y + 336, { size: 16 });
      text(
        ctx,
        bad
          ? `timed out · ${(tgt - s.outcomeDeg).toFixed(3)}° short`
          : "arrived",
        R.x + 160,
        R.y + 337,
        { font: MONO, size: 20, weight: 600, color: bad ? C.err : C.accent }
      );
    }
  }

  // ---- motors and bench ----------------------------------------------------------------

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

  function drawMotors(ctx, s) {
    const lead = (on, path) => {
      ctx.strokeStyle = on ? alpha(C.accent, 0.8) : C.rule;
      ctx.lineWidth = 4;
      ctx.beginPath();
      path();
      ctx.stroke();
    };
    lead(true, () => {
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
    lead(!!s.flyReq, () => {
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
    chip(
      ctx,
      CHIP_A,
      "arm motor · request on it",
      "MotionMagicVoltage",
      `${s.armReq} rot`,
      true,
      0
    );
    chip(
      ctx,
      CHIP_F,
      "flywheel motor · request on it",
      s.flyReq ? "MotionMagicVelocityVoltage" : "none",
      s.flyReq ? `${s.flyReq} rps` : "",
      !!s.flyReq,
      0
    );
  }

  function drawBench(ctx, s, t, live) {
    drawStand(ctx, PIVOT, FLOOR);
    drawTargetMark(ctx, PIVOT, ARM_LEN, TARGET, "90° · vertical", 1);
    if (Math.abs(s.sp.p - s.rot) > 0.004)
      drawArmBody(ctx, PIVOT, ARM_LEN, s.sp.p, { ghost: true });
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, {
      driven: Math.abs(s.volts) > 0.3,
    });
    text(ctx, `${(s.rot * 360).toFixed(1)}°`, PIVOT.x, 525, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: C.tx2,
    });
    drawFlywheel(ctx, FLY, FLY_R, s.flyAng, {
      rps: s.fly,
      driven: !!s.flyReq,
      label: `${s.fly.toFixed(1)} rps`,
    });
    const since = t - s.restartedAt;
    if (!live && since >= 0 && since < 1.2 && s.restartedAt > 0)
      text(ctx, "starting at horizontal", 910, 572, {
        font: MONO,
        size: 20,
        align: "center",
        color: C.tx2,
        a: window_(since, 0, 1.2, 0.25),
        spacing: 1.5,
      });
  }

  function schedFor(s, t, live) {
    if (!live && t >= T.timeout && t < T.raceRun) {
      // two ways to end, before either has happened
      const k = easeOut(ramp(t, T.addTimeout - 0.1, 0.5));
      const bars = [
        {
          lane: 0,
          start: 0,
          end: null,
          label: "vertical until at target",
          dashed: true,
          open: true,
        },
      ];
      if (k > 0)
        bars.push({
          lane: 1,
          start: 0,
          end: 2.0,
          label: "timeout",
          dashed: true,
          chip: 2.0,
        });
      let hot = null;
      if (t >= T.arrives - 0.1 && t < T.clock - 0.1) hot = 0;
      if (t >= T.clock - 0.1) hot = 1;
      const v = {
        bars,
        group:
          k > 0 ? { start: 0, end: null, label: "raiseArm · a race" } : null,
        now: 2.6,
        noScroll: true,
        hot,
      };
      return v;
    }
    const v = schedView(s);
    v.noScroll = true; // every run here is short; a long wait leaves the step in view
    if (!live) {
      if (t > Wd("callback", "That") - 0.1 && t < T.question)
        v.note = {
          s: `arrived at ${guessArrive.toFixed(2)} s · waited to 1.00 s`,
        };
      if (
        t > Wd("race", "wins") - 0.3 &&
        t < T.tryit &&
        s.outcome === "arrived"
      )
        v.note = {
          s: `the sensor won at ${(s.outcomeAt - s.runStart).toFixed(2)} s`,
          color: C.accent,
        };
      if (
        t > Wd("lose", "clock") &&
        t < L("close").t0 &&
        s.outcome === "timed out"
      )
        v.note = {
          s: "the clock won · the next step starts anyway",
          color: C.err,
        };
    } else if (s.outcome === "timed out")
      v.note = {
        s: "the clock won · the next step starts anyway",
        color: C.err,
      };
    else if (s.outcome === "arrived")
      v.note = { s: "the sensor won", color: C.accent };
    return v;
  }

  // ---- cards -----------------------------------------------------------------------

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("intro").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 4 · Finish Conditions", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Ask Every Loop", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "End on the sensor. Back it with a timer.", W / 2, 470, {
      font: SERIF,
      size: 76,
      align: "center",
    });
    text(ctx, "A timer running out is not arriving.", W / 2, 580, {
      font: SERIF,
      size: 64,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "never") - 0.1, 0.6)),
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
    drawMotors(ctx, s);
    drawBench(ctx, s, t, !!live);
    drawGauge(ctx, s, t, !!live);
    drawSched(ctx, schedFor(s, t, !!live));
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = fresh(gate.t0);
    let phase = "squeeze";
    let doneAt = null;
    return {
      state: s,
      prompt: () =>
        ({
          squeeze: "Drag the tolerance down to 0.001, then press R.",
          ready: "Now run it. Press R.",
          running: "Watch the needle, and the stopwatch.",
          won: "The sensor won that one. Squeeze the tolerance down and run it again.",
          lost: "The clock won at 2.0 s. The next step started anyway.",
        })[phase],
      input(name, v) {
        if (name === "tol") {
          s.tol = clamp(Number(v), 0.001, 1);
          if (phase === "squeeze" || phase === "won")
            phase = s.tol <= 0.02 ? "ready" : phase;
        }
        if (name === "run" && v === true && phase !== "lost") {
          run(s, "both");
          phase = "running";
        }
      },
      step(dt) {
        advance(s, dt);
        if (phase === "running" && s.outcome === "arrived")
          phase = s.tol <= 0.02 ? "ready" : "won";
        if (phase === "running" && s.outcome === "timed out") {
          phase = "lost";
          doneAt = s.time;
        }
        return doneAt !== null && s.time - doneAt > 2.0;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    if (t < SQ1) return "Drag the tolerance down to 0.001, then press R.";
    if (t < GRUN) return "Now run it. Press R.";
    if (t < GRUN + 2.0) return "Watch the needle, and the stopwatch.";
    return "The clock won at 2.0 s. The next step started anyway.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      {
        k: "tol",
        label: "Tolerance (degrees)",
        kind: "range",
        min: 0.001,
        max: 1,
        step: 0.001,
        value: 1,
      },
      { k: "run", label: "Run it", key: "KeyR", kind: "press" },
    ],
  };
}
