// One Motion, Then Silence. PID tuning in Tuner X: the TalonFX runs the loop,
// Tuner X sends a target and plots what happens.
//
// What is drawn, and how:
//   responses  every move is a closed-form step response (a damped second-order
//              curve), one per gain setting: falls short, overshoots and rings,
//              settles once, buzzes, runs away. Deterministic by construction.
//   gravity    the pull that turns the arm, drawn at the tip, scaled by cos(angle);
//              kG's counter-arrow is the same length the other way.
//   output     a stacked bar, feedforward slab plus feedback sliver, never volts:
//              the numbers would be gains in disguise.
// No tuned gain appears anywhere. Set gains are hatched "yours" cells.
// Angles are rotations: 0 is level, 0.25 straight up. The arm rests on a stop
// just below level when nothing holds it.
//
// The Tuner X steps (lines marked rec) are drawn schematically with the real
// control names, one function per step, to be swapped for footage later.

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
  drawArmBody,
  drawPlot,
  drawStand,
  drawToolWindow,
  panel,
} from "../../engine/kit.js";

const TAU = 2 * Math.PI;

// ---- layout ------------------------------------------------------------------------

const OUTBAR = { x: 60, y: 60, w: 640, h: 130 };
const PIVOT = { x: 480, y: 500 };
const ARM_LEN = 220;
const TOOL = { x: 1000, y: 60, w: 860, h: 450 };
const PLOT = { x: 1000, y: 530, w: 860, h: 330 };
const REST = -0.06; // the lower stop
const TARGET = 0.1;
const ROW_H = 44;
const GAINS = ["kP", "kI", "kD", "kS", "kV", "kA", "kG"];

// ---- responses -----------------------------------------------------------------------

// unit step response of a damped second-order loop, scaled to A
function second(z, w, A = 1) {
  const wd = w * Math.sqrt(1 - z * z);
  return (u) =>
    A *
    (1 -
      Math.exp(-z * w * u) *
        (Math.cos(wd * u) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * u)));
}
const good = second(0.85, 14, 1);
const RESP = {
  short1: second(0.9, 6, 0.6),
  short2: second(0.8, 8, 0.8),
  short4: second(0.55, 11, 0.9),
  over8: second(0.18, 15, 0.96),
  half: second(0.5, 11, 0.92),
  good,
  buzz: (u) =>
    good(u) + 0.075 * Math.sin(TAU * 19 * u) * (1 - Math.exp(-u / 0.15)),
  low: second(0.9, 6, 0.6),
  high: second(0.12, 16, 0.97),
  right: good,
  hand: (u) => easeInOut(clamp(u / 0.45)),
};

// One move: from `from`, toward `to`, along kind. "sag" falls to the stop; "runaway"
// leaves the wrong way; "hold" stays put.
function moveAt(seg, u) {
  if (seg.kind === "hold") return seg.from;
  if (seg.kind === "sag")
    return Math.max(
      REST,
      seg.from - (seg.from - REST) * (1 - Math.exp(-u / 0.28)) * 1.02
    );
  if (seg.kind === "runaway")
    return Math.max(REST - 0.02, seg.from - 0.012 * (Math.exp(u / 0.22) - 1));
  return seg.from + (seg.to - seg.from) * RESP[seg.kind](u);
}

function chip(
  ctx,
  s,
  x,
  y,
  { a = 1, color = C.accent, align = "left", size = 20 } = {}
) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `600 ${size}px ${MONO}`;
  const w = ctx.measureText(s).width + 32;
  const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  rrect(ctx, x0, y - size - 10, w, size + 24, 4);
  ctx.fillStyle = alpha(C.bg2, 0.92);
  ctx.fill();
  ctx.fillStyle = alpha(color, 0.14);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, s, x0 + 16, y + 2, { font: MONO, size, weight: 600, color });
  ctx.restore();
}

function hatch(ctx, x, y, w, h, k = 1) {
  if (k <= 0) return;
  const cw = w * easeOut(k);
  ctx.save();
  rrect(ctx, x, y, cw, h, 3);
  ctx.clip();
  ctx.fillStyle = alpha(C.accent, 0.18);
  ctx.fillRect(x, y, cw, h);
  ctx.strokeStyle = alpha(C.accent, 0.55);
  ctx.lineWidth = 2;
  for (let hx = x - h; hx < x + cw; hx += 10) {
    ctx.beginPath();
    ctx.moveTo(hx, y + h);
    ctx.lineTo(hx + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

function enableButton(ctx, x, y, on) {
  rrect(ctx, x, y, 200, 56, 5);
  ctx.fillStyle = on ? C.accent : alpha(C.err, 0.14);
  ctx.fill();
  ctx.strokeStyle = on ? C.accent : C.err;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, on ? "ENABLED" : "DISABLED", x + 100, y + 37, {
    font: MONO,
    size: 22,
    weight: 600,
    align: "center",
    color: on ? C.accentInk : C.err,
    spacing: 2,
  });
}

// an arrow from (x, y) along (dx, dy)
function arrow(ctx, x, y, dx, dy, color, width = 6) {
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len;
  const uy = dy / len;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx - ux * 14, y + dy - uy * 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + dx, y + dy);
  ctx.lineTo(x + dx - ux * 22 - uy * 12, y + dy - uy * 22 + ux * 12);
  ctx.lineTo(x + dx - ux * 22 + uy * 12, y + dy - uy * 22 - ux * 12);
  ctx.fill();
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const T = {
    loop: Wd("intro", "loop."),
    sends: Wd("intro", "sends"),
    draws: Wd("intro", "draws"),
    zeroRows: Wd("zero", "every"),
    enable: Wd("zero", "enable."),
    zeroV: Wd("zero", "zero", 2),
    hardest: Wd("gravity", "hardest"),
    up0: Wd("gravity", "not"),
    up1: Wd("gravity", "up.") + 0.2,
    cancels: Wd("kg", "cancels"),
    raise: Wd("kg", "Raise"),
    holds: Wd("kg", "holds"),
    smallest: Wd("ks", "smallest"),
    largest: Wd("ks", "largest"),
    half: Wd("ks", "half"),
    double: Wd("kp", "Double"),
    over: Wd("kp", "overshoots,"),
    cut: Wd("kp", "cut"),
    kd: Wd("kd", "takes"),
    tooMuch: Wd("kd", "Too"),
    apply: Wd("apply", "Apply"),
    power: Wd("apply", "power"),
    saved: Wd("apply", "saved"),
  };

  // which Slot 0 gains hold a value of the student's (hatched), and since when
  const setAt = { kG: T.raise, kS: T.half, kP: T.double, kD: T.kd };

  // ---- the timeline of moves --------------------------------------------------------
  // [time, kind, to, target shown on the plot]
  const plan = [
    [0, "hold", REST, null],
    [T.enable, "hold", REST, TARGET],
    // the gravity sweep is drawn separately; here the arm goes back to rest
    [T.raise + 0.15, "hand", 0, null],
    [T.raise + 0.75, "sag", REST, null],
    [Wd("kg", "until") + 0.3, "hand", 0, null],
    [Wd("kg", "until") + 0.8, "hold", 0, null],
    // kP doublings, the target stepping both ways
    [T.double, "short1", TARGET, TARGET],
    [T.double + 0.85, "short2", 0, 0],
    [T.double + 1.7, "short4", TARGET, TARGET],
    [T.over - 0.25, "over8", 0, 0],
    [T.cut + 0.1, "half", TARGET, TARGET],
    // kD
    [T.kd, "good", 0, 0],
    [T.tooMuch, "buzz", TARGET, TARGET],
    [L("tryit").t0 + 0.2, "hand", 0, null],
    // the gate, played for you
    [gate.t0 + 0.4, "low", TARGET, TARGET],
    [gate.t0 + 3.6, "hand", 0, null],
    [gate.t0 + 4.1, "high", TARGET, TARGET],
    [L("shapes").t0, "hand", 0, null],
    [L("apply").t0, "good", TARGET, TARGET],
    [T.power + 0.1, "sag", REST, null],
  ];
  const segs = [];
  for (const [t, kind, to, target] of plan) {
    const prev = segs.at(-1);
    const from = prev ? moveAt(prev, t - prev.t) : REST;
    segs.push({ t, kind, from, to, target });
  }
  const segAt = (t) => {
    let s = segs[0];
    for (const x of segs) if (x.t <= t) s = x;
    return s;
  };
  const measured = (t) => {
    const s = segAt(t);
    return moveAt(s, t - s.t);
  };
  const targetAt = (t) => segAt(t).target;

  // the gravity concept: level, then up to vertical, then back to level
  const SWEEP = [
    [L("gravity").t0 - 0.4, REST],
    [L("gravity").t0 + 0.3, 0],
    [T.up0, 0],
    [T.up1, 0.25],
    [T.cancels - 0.2, 0.25],
    [Wd("kg", "angle.") + 0.1, 0],
    [T.raise + 0.15, 0],
  ];
  const sweepAt = (t) => {
    if (t < SWEEP[0][0] || t >= SWEEP.at(-1)[0]) return null;
    for (let i = 1; i < SWEEP.length; i++)
      if (t < SWEEP[i][0])
        return lerp(
          SWEEP[i - 1][1],
          SWEEP[i][1],
          easeInOut((t - SWEEP[i - 1][0]) / (SWEEP[i][0] - SWEEP[i - 1][0]))
        );
    return null;
  };

  const enabledAt = (t) =>
    t >= T.enable && !(t >= T.power && t < L("close").t0 + 99);
  const kGon = (t) => t >= setAt.kG;
  const kPon = (t) => t >= setAt.kP;

  // the state draw() reads, from the timeline
  function stateAt(t) {
    const sw = sweepAt(t);
    const rot = sw ?? measured(t);
    const target = sw != null ? null : targetAt(t);
    const v = (measured(t + 0.01) - measured(t - 0.01)) / 0.02;
    const concept = sw != null && t > T.cancels - 0.2;
    return {
      time: t,
      rot,
      target,
      enabled: enabledAt(t),
      ff:
        (kGon(t) || concept) && (enabledAt(t) || concept)
          ? Math.max(0, Math.cos(rot * TAU))
          : 0,
      fb:
        kPon(t) && enabledAt(t) && target != null
          ? clamp(Math.abs(target - rot) * 3 + Math.abs(v) * 0.04, 0, 0.3)
          : 0,
      buzz: segAt(t).kind === "buzz" && sw == null,
    };
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 470, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("gravity").t0 - 0.3, x: 560, y: 420, z: 1.3, d: 1.2 },
    { t: T.raise - 0.3, ...FULL, d: 1.2 },
    { t: L("ks").t0 - 0.2, x: 1430, y: 560, z: 1.15, d: 1.2 },
    { t: L("kp").t0 - 0.1, ...FULL, d: 1.2 },
    { t: L("tryit").t0, ...FULL, d: 1.0 },
  ];

  // ---- the bench ---------------------------------------------------------------

  function drawBench(ctx, s, t, live) {
    drawStand(ctx, PIVOT, 800);
    // the lower stop, on a strut from the stand
    const sa = REST * TAU - 0.03;
    const bx = PIVOT.x + Math.cos(sa) * 150 + Math.sin(-sa) * 0;
    const by = PIVOT.y - Math.sin(sa) * 150 + 26;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(PIVOT.x + 40, 700);
    ctx.lineTo(bx, by + 10);
    ctx.stroke();
    rrect(ctx, bx - 30, by, 60, 22, 3);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 2;
    ctx.stroke();
    // the target, when there is one
    if (s.target != null) {
      const ang = s.target * TAU;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(
        PIVOT.x + Math.cos(ang) * (ARM_LEN + 30),
        PIVOT.y - Math.sin(ang) * (ARM_LEN + 30)
      );
      ctx.lineTo(
        PIVOT.x + Math.cos(ang) * (ARM_LEN + 62),
        PIVOT.y - Math.sin(ang) * (ARM_LEN + 62)
      );
      ctx.stroke();
      text(
        ctx,
        `target ${s.target.toFixed(1)}`,
        PIVOT.x + Math.cos(ang) * (ARM_LEN + 78),
        PIVOT.y - Math.sin(ang) * (ARM_LEN + 78) + 6,
        { font: MONO, size: 20, weight: 600, color: C.accent }
      );
    }
    const jitter = s.buzz ? 0.004 * Math.sin(t * TAU * 23) : 0;
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot + jitter, {
      driven: s.ff + s.fb > 0.02,
    });
    if (s.buzz) {
      // buzz: short strokes around the tip
      const ang = s.rot * TAU;
      const tx = PIVOT.x + Math.cos(ang) * ARM_LEN;
      const ty = PIVOT.y - Math.sin(ang) * ARM_LEN;
      ctx.strokeStyle = alpha(C.err, 0.8);
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const r = 30 + i * 12 + 4 * Math.sin(t * 40 + i);
        ctx.beginPath();
        ctx.arc(tx, ty, r, -0.6, 0.6);
        ctx.stroke();
      }
      text(ctx, "buzz", tx + 70, ty - 16, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.err,
      });
    }
    if (!live) drawGravity(ctx, s, t);
    // the loop runs on the motor
    const kl = live ? 0 : window_(t, T.loop - 0.3, L("zero").t0, 0.3);
    if (kl > 0) {
      ctx.save();
      ctx.globalAlpha = kl;
      const a0 = (t * 2.5) % 1;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(PIVOT.x, PIVOT.y, 70, a0 * TAU, a0 * TAU + 1.3);
      ctx.stroke();
      text(ctx, "the loop runs here, on the TalonFX", PIVOT.x, PIVOT.y + 120, {
        font: MONO,
        size: 20,
        align: "center",
        color: C.accent,
      });
      ctx.restore();
    }
  }

  // gravity's turning pull at the tip, and kG's counter-pull
  function drawGravity(ctx, s, t) {
    const kg = window_(t, T.hardest - 0.3, T.raise + 0.2, 0.3);
    const kc = window_(t, T.cancels - 0.2, T.raise + 0.2, 0.3);
    if (kg <= 0) return;
    const ang = s.rot * TAU;
    const c = Math.cos(ang);
    const tx = PIVOT.x + Math.cos(ang) * (ARM_LEN - 10);
    const ty = PIVOT.y - Math.sin(ang) * (ARM_LEN - 10);
    // tangent, clockwise (the way gravity turns it)
    const nx = Math.sin(ang);
    const ny = Math.cos(ang);
    const len = 150 * c;
    ctx.save();
    ctx.globalAlpha = kg;
    arrow(ctx, tx, ty, nx * len, ny * len, C.tx);
    text(ctx, "gravity's pull", tx + 30, ty + Math.max(40, len * 0.6), {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.tx,
    });
    ctx.restore();
    if (kc > 0) {
      ctx.save();
      ctx.globalAlpha = kc;
      arrow(
        ctx,
        tx - 14 * Math.cos(ang),
        ty + 14 * Math.sin(ang),
        -nx * len,
        -ny * len,
        C.accent
      );
      text(ctx, "kG · cos(angle)", tx + 30, ty - Math.max(30, len * 0.6), {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
    }
    // how hard, as a share of level
    ctx.save();
    ctx.globalAlpha = kg;
    micro(ctx, "pull on the arm", 120, 270);
    text(ctx, `${Math.round(Math.max(0, c) * 100)}%`, 120, 326, {
      font: MONO,
      size: 46,
      weight: 600,
      color: C.tx,
    });
    text(ctx, "of its pull at level", 120, 362, {
      font: MONO,
      size: 18,
      color: C.tx3,
    });
    ctx.restore();
  }

  // the output, as a stack: feedforward slab + feedback sliver. Never in volts.
  function drawOutput(ctx, s) {
    panel(ctx, OUTBAR, C.bg2);
    micro(ctx, "TalonFX 31 · output", OUTBAR.x + 22, OUTBAR.y + 34, {
      size: 16,
    });
    const x = OUTBAR.x + 22;
    const y = OUTBAR.y + 54;
    const w = OUTBAR.w - 44;
    ctx.fillStyle = C.bg;
    ctx.fillRect(x, y, w, 34);
    const ffw = w * 0.7 * s.ff;
    const fbw =
      w * s.fb + (s.buzz ? 12 + 10 * Math.abs(Math.sin(s.time * 70)) : 0);
    ctx.fillStyle = alpha(C.accent, 0.35);
    ctx.fillRect(x, y, ffw, 34);
    ctx.fillStyle = C.accent;
    ctx.fillRect(x + ffw, y, fbw, 34);
    if (ffw + fbw < 2)
      text(ctx, "nothing: zero volts", x + 12, y + 25, {
        font: MONO,
        size: 19,
        color: C.tx3,
      });
    text(ctx, "feedforward", x, y + 62, {
      font: MONO,
      size: 17,
      color: ffw > 2 ? C.tx2 : C.tx3,
    });
    text(ctx, "+ feedback", x + 190, y + 62, {
      font: MONO,
      size: 17,
      color: fbw > 2 ? C.accent : C.tx3,
    });
    enableButton(ctx, OUTBAR.x + OUTBAR.w + 30, OUTBAR.y + 36, s.enabled);
  }

  // ---- Tuner X: Slot 0 ------------------------------------------------------------
  // rec · zero, kg, kp, apply all edit this one panel; `hotRow` is the gain being set.

  function drawSlot0(
    ctx,
    t,
    {
      hot = null,
      set = {},
      title = "TalonFX 31 · Configs · Slot 0",
      dim = 0,
      notes = {},
    } = {}
  ) {
    ctx.save();
    ctx.globalAlpha *= 1 - 0.6 * dim;
    const rows = GAINS.map((g) => ({
      label: g,
      value: set[g] != null ? null : "0",
      hot: hot === g,
      note: notes[g],
    }));
    rows.push({
      label: "Gravity Type",
      value: "Arm_Cosine",
      hot: hot === "Gravity Type",
    });
    drawToolWindow(ctx, TOOL, { app: "Tuner X", title, rows, rowH: ROW_H });
    GAINS.forEach((g, i) => {
      if (set[g] == null) return;
      const y = TOOL.y + 70 + i * ROW_H;
      hatch(ctx, TOOL.x + TOOL.w - 26 - 120, y + 2, 120, 28, set[g]);
      if (set[g] > 0.5)
        text(ctx, "yours", TOOL.x + TOOL.w - 166, y + 24, {
          font: MONO,
          size: 17,
          align: "right",
          color: C.accent,
        });
    });
    ctx.restore();
  }

  function slotFor(t) {
    const set = {};
    for (const [g, at0] of Object.entries(setAt))
      if (t >= at0) set[g] = clamp((t - at0) / 0.35);
    let hot = null;
    if (t >= T.zeroRows - 0.2 && t < T.enable)
      hot = GAINS[clamp(Math.floor((t - T.zeroRows) / 0.17), 0, 6)];
    if (t >= T.enable - 0.1 && t < T.enable + 1.2) hot = "Gravity Type";
    if (t >= T.raise - 0.2 && t < L("ks").t0) hot = "kG";
    if (t >= T.half - 0.2 && t < L("kp").t0) hot = "kS";
    if (t >= T.double - 0.3 && t < L("kd").t0) hot = "kP";
    if (t >= T.kd - 0.3 && t < L("tryit").t0) hot = "kD";
    if (t >= L("tryit").t0) hot = "kP";
    return { set, hot };
  }

  // rec · apply: the download icon, then a power cycle; the gains stay on the motor
  function recApply(ctx, t) {
    const a = window_(t, L("apply").t0 - 0.2, L("close").t0 + 0.3, 0.3);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    panel(ctx, PLOT, C.bg2);
    micro(ctx, "Slot 0 · apply, then power cycle", PLOT.x + 24, PLOT.y + 36);
    const bx = PLOT.x + 30;
    const by = PLOT.y + 80;
    const hot = window_(t, T.apply - 0.3, T.apply + 0.8, 0.2);
    rrect(ctx, bx, by, 64, 56, 4);
    ctx.fillStyle = hot > 0.5 ? C.accent : C.bg3;
    ctx.fill();
    const ink = hot > 0.5 ? C.accentInk : C.tx;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + 32, by + 12);
    ctx.lineTo(bx + 32, by + 36);
    ctx.moveTo(bx + 22, by + 27);
    ctx.lineTo(bx + 32, by + 37);
    ctx.lineTo(bx + 42, by + 27);
    ctx.moveTo(bx + 18, by + 44);
    ctx.lineTo(bx + 46, by + 44);
    ctx.stroke();
    text(ctx, "download icon · apply", bx + 84, by + 37, {
      font: MONO,
      size: 21,
      weight: 600,
      color: hot > 0.5 ? C.accent : C.tx2,
    });
    const off = t >= T.power && t < T.saved - 0.4;
    if (t >= T.power)
      text(
        ctx,
        off ? "power cycle…" : "saved on the motor",
        bx + 84,
        by + 100,
        { font: MONO, size: 24, weight: 600, color: off ? C.tx3 : C.accent }
      );
    ctx.restore();
  }

  // ---- the plot ----------------------------------------------------------------------

  function plotSeries(t0, t1, f) {
    const pts = [];
    for (let u = t0; u <= t1 + 1e-6; u += 1 / 60) {
      const v = f(u);
      if (v != null) pts.push([u, v]);
    }
    return pts;
  }

  function drawResponse(ctx, t, live) {
    if (live) {
      const s = live;
      const u = s.time - s.runStart;
      const pts = s.hist.map(([uu, v]) => [uu, v]);
      drawPlot(ctx, PLOT, {
        title: s.kind
          ? `kP ${{ low: "too low", high: "too high", right: "about right" }[s.kind]} · reference · position`
          : "pick a kP",
        t0: 0,
        t1: 3.2,
        v0: -0.08,
        v1: 0.2,
        series: s.kind
          ? [
              {
                pts: [
                  [0, TARGET],
                  [3.2, TARGET],
                ],
                color: C.tx2,
                dashed: true,
                width: 2.5,
              },
              { pts, color: C.accent },
            ]
          : [],
        playhead: s.kind ? Math.min(u, 3.2) : null,
      });
      return;
    }
    const a =
      1 -
      window_(t, L("gravity").t0 - 0.2, T.raise, 0.3) -
      window_(t, L("ks").t0 - 0.2, L("kp").t0, 0.3) -
      easeOut(ramp(t, L("apply").t0 - 0.3, 0.4));
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = clamp(a);
    const span = 4.5;
    const t0 = t - span;
    const show = (u) => u >= T.draws;
    const series = [];
    if (t >= T.draws) {
      series.push({
        pts: plotSeries(Math.max(t0, T.draws), t, (u) =>
          show(u) ? targetAt(u) : null
        ),
        color: C.tx2,
        dashed: true,
        width: 2.5,
      });
      series.push({
        pts: plotSeries(Math.max(t0, T.draws), t, (u) => measured(u)),
        color: C.accent,
      });
    }
    // the gate's plot starts with each pick
    drawPlot(ctx, PLOT, {
      title: "closed-loop reference · position",
      t0,
      t1: t,
      v0: -0.08,
      v1: 0.2,
      series,
    });
    micro(ctx, "reference", PLOT.x + PLOT.w - 250, PLOT.y + 34, { size: 16 });
    micro(ctx, "position", PLOT.x + PLOT.w - 120, PLOT.y + 34, {
      size: 16,
      color: C.accent,
    });
    if (t >= T.zeroV - 0.4 && t < L("gravity").t0)
      chip(ctx, "zero gains → zero volts", PLOT.x + 60, PLOT.y + PLOT.h - 60, {
        size: 20,
        a: easeOut(ramp(t, T.zeroV - 0.4, 0.4)),
      });
    if (t >= T.over - 0.1 && t < T.cut + 0.2)
      chip(ctx, "overshoots → cut kP in half", PLOT.x + 60, PLOT.y + 100, {
        size: 20,
      });
    if (t >= T.double - 0.1 && t < T.over - 0.1) {
      const n = clamp(Math.floor((t - T.double) / 0.85), 0, 2);
      chip(
        ctx,
        ["kP", "kP × 2", "kP × 4"][n] + "  ·  falls short",
        PLOT.x + 60,
        PLOT.y + 100,
        { size: 20 }
      );
    }
    if (t >= T.kd && t < T.tooMuch)
      chip(ctx, "kD: one motion, then still", PLOT.x + 60, PLOT.y + 100, {
        size: 20,
      });
    if (t >= T.tooMuch + 0.3 && t < L("tryit").t0)
      chip(ctx, "too much kD: buzz", PLOT.x + 60, PLOT.y + 100, {
        size: 20,
        color: C.err,
      });
    ctx.restore();
  }

  // ks: half the gap between the smallest and largest kG that hold. No numbers.
  function drawKs(ctx, t) {
    const a = window_(t, L("ks").t0 - 0.2, L("kp").t0, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    panel(ctx, PLOT, C.bg2);
    micro(ctx, "kG values that hold the arm level", PLOT.x + 24, PLOT.y + 36);
    const x0 = PLOT.x + 70;
    const x1 = PLOT.x + PLOT.w - 70;
    const y = PLOT.y + 170;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    text(ctx, "sags", x0, y + 44, { font: MONO, size: 18, color: C.tx3 });
    text(ctx, "drifts up", x1, y + 44, {
      font: MONO,
      size: 18,
      align: "right",
      color: C.tx3,
    });
    const lo = x0 + 230;
    const hi = x1 - 230;
    const mk = (x, label, at, above) => {
      const k = easeOut(ramp(t, at - 0.2, 0.4));
      if (k <= 0) return;
      ctx.save();
      ctx.globalAlpha *= k;
      ctx.fillStyle = C.tx;
      ctx.fillRect(x - 2, y - 26, 4, 52);
      text(ctx, label, x, above ? y - 40 : y + 80, {
        font: MONO,
        size: 19,
        weight: 600,
        align: "center",
        color: C.tx,
      });
      ctx.restore();
    };
    mk(lo, "smallest that holds", T.smallest, true);
    mk(hi, "largest that holds", T.largest, true);
    // the band that holds, the middle (kG), and half the gap (kS)
    const kb = easeOut(ramp(t, T.largest + 0.2, 0.5));
    if (kb > 0) {
      ctx.fillStyle = alpha(C.accent, 0.18 * kb);
      ctx.fillRect(lo, y - 14, hi - lo, 28);
      const mid = (lo + hi) / 2;
      ctx.save();
      ctx.globalAlpha *= kb;
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.arc(mid, y, 10, 0, TAU);
      ctx.fill();
      text(ctx, "kG: the middle", mid, y + 80, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.accent,
      });
      ctx.restore();
      const kk = easeOut(ramp(t, Wd("ks", "hold.") - 0.1, 0.5));
      if (kk > 0) {
        ctx.save();
        ctx.globalAlpha *= kk;
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 3;
        const by = y + 112;
        ctx.beginPath();
        ctx.moveTo(lo, by - 10);
        ctx.lineTo(lo, by);
        ctx.lineTo(mid, by);
        ctx.lineTo(mid, by - 10);
        ctx.stroke();
        text(ctx, "kS: half the gap", (lo + mid) / 2, by + 30, {
          font: MONO,
          size: 20,
          weight: 600,
          align: "center",
          color: C.accent,
        });
        ctx.restore();
      }
    }
    chip(ctx, "kS covers friction", PLOT.x + 24, PLOT.y + 92, {
      a: easeOut(ramp(t, Wd("ks", "friction.") - 0.2, 0.4)),
      size: 19,
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
      "Workshop 1 · PID Tuning in Tuner X",
      W / 2,
      440 - 20 * (1 - k),
      { align: "center", a: k, color: C.accent }
    );
    text(ctx, "One Motion, Then Silence", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // the three shapes: arm and trace, then the arm taken away
  const SHAPES = [
    {
      title: "Runs away",
      fix: "wrong direction: disable, back to Motor Setup",
      kind: "runaway",
      at: () => Wd("shapes", "runs"),
    },
    {
      title: "Buzzes",
      fix: "too much gain: cut kP first",
      kind: "buzz",
      at: () => Wd("shapes", "buzzes,"),
    },
    {
      title: "Falls short",
      fix: "a steady gap: more kP",
      kind: "short1",
      at: () => Wd("shapes", "falls"),
    },
  ];
  function shapesCard(ctx, t) {
    const a = window_(t, L("shapes").t0 - 0.2, L("apply").t0 - 0.1, 0.5);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.96);
    ctx.fillRect(0, 0, W, H);
    const strip = easeInOut(ramp(t, Wd("shapes", "Read") - 0.1, 0.8));
    SHAPES.forEach((sh, i) => {
      const k = easeOut(ramp(t, sh.at() - 0.2, 0.5));
      if (k <= 0) return;
      const x = 100 + i * 590;
      const y = 110;
      ctx.save();
      ctx.globalAlpha *= k;
      rrect(ctx, x, y, 540, 700, 6);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, sh.title, x + 30, y + 60, { size: 36, weight: 600 });
      const u = (((t - sh.at() + 0.2) % 3.0) + 3.0) % 3.0;
      const seg = { kind: sh.kind, from: 0, to: TARGET };
      const rot = moveAt(seg, u);
      // the arm, fading out on "read the plot"
      if (strip < 1) {
        ctx.save();
        ctx.globalAlpha *= 1 - strip;
        const P = { x: x + 270, y: y + 300 };
        ctx.translate(P.x, P.y);
        ctx.scale(0.62, 0.62);
        ctx.translate(-P.x, -P.y);
        drawStand(ctx, P, P.y + 280);
        drawArmBody(
          ctx,
          P,
          220,
          rot + (sh.kind === "buzz" ? 0.004 * Math.sin(t * TAU * 23) : 0),
          { driven: true }
        );
        ctx.restore();
      }
      // the trace, growing as the arm goes; it takes the panel once the arm is gone
      const R = {
        x: x + 24,
        y: lerp(y + 400, y + 110, strip),
        w: 492,
        h: lerp(220, 500, strip),
      };
      const pts = plotSeries(0, Math.min(u, 2.4), (uu) => moveAt(seg, uu));
      drawPlot(ctx, R, {
        t0: 0,
        t1: 2.4,
        v0: -0.1,
        v1: 0.2,
        series: [
          {
            pts: [
              [0, TARGET],
              [2.4, TARGET],
            ],
            color: C.tx2,
            dashed: true,
            width: 2,
          },
          { pts, color: sh.kind === "short1" ? C.accent : C.err },
        ],
      });
      text(ctx, sh.fix, x + 30, y + 670, {
        font: MONO,
        size: 18,
        color: C.tx2,
      });
      ctx.restore();
    });
    text(ctx, "Three shapes tell you what's wrong.", W / 2, 70, {
      font: SERIF,
      size: 40,
      align: "center",
      color: C.tx,
    });
    text(ctx, "Read the plot, not the mechanism.", W / 2, 870, {
      font: SERIF,
      size: 44,
      align: "center",
      color: C.accent,
      a: strip,
    });
    ctx.restore();
  }

  function closeCard(ctx, t) {
    const a = easeInOut(ramp(t, L("close").t0 - 0.1, 0.8));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    text(ctx, "Feedforward pays for holding.", W / 2, 300, {
      font: SERIF,
      size: 72,
      align: "center",
    });
    text(ctx, "Feedback fixes what's left.", W / 2, 390, {
      font: SERIF,
      size: 72,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "Feedback") - 0.1, 0.6)),
    });
    // the stack
    const x = 560;
    const w = 800;
    const y = 450;
    const k1 = easeOut(ramp(t, Wd("close", "pays") - 0.1, 0.7));
    const k2 = easeOut(ramp(t, Wd("close", "fixes") - 0.1, 0.5));
    ctx.fillStyle = C.bg2;
    ctx.fillRect(x, y, w, 56);
    ctx.fillStyle = alpha(C.accent, 0.35);
    ctx.fillRect(x, y, 660 * k1, 56);
    ctx.fillStyle = C.accent;
    ctx.fillRect(x + 660, y, 90 * k2, 56);
    text(ctx, "kG · holding", x + 20, y + 38, {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.tx,
      a: k1,
    });
    text(ctx, "kP", x + 676, y + 38, {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.accentInk,
      a: k2,
    });
    const k3 = easeOut(ramp(t, Wd("close", "tuned") - 0.2, 0.6));
    text(
      ctx,
      "A tuned arm makes one motion, and then it's silent.",
      W / 2,
      640,
      { size: 36, align: "center", color: C.tx2, a: k3 }
    );
    micro(
      ctx,
      "now try the shapes yourself in the playground below",
      W / 2,
      740,
      {
        align: "center",
        a: easeOut(ramp(t, Wd("close", "silent.") - 0.1, 0.6)),
      }
    );
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? stateAt(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawOutput(ctx, s);
    drawBench(ctx, s, t, !!live);
    if (live) {
      drawSlot0(ctx, t, { hot: "kP", set: { kG: 1, kS: 1, kP: 1 } });
    } else {
      const { set, hot } = slotFor(t);
      const dim = window_(t, T.power, T.saved - 0.3, 0.2);
      drawSlot0(ctx, t, { hot, set, dim });
    }
    drawResponse(ctx, t, live);
    if (!live) {
      drawKs(ctx, t);
      recApply(ctx, t);
    }
    ctx.restore();
    vignette(ctx);
    if (live) return;
    shapesCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = {
      time: gate.t0,
      rot: 0,
      target: null,
      enabled: true,
      ff: 1,
      fb: 0,
      buzz: false,
      kind: null,
      runStart: gate.t0,
      hist: [],
    };
    const tried = new Set();
    let doneAt = null;
    return {
      state: s,
      prompt: () => {
        if (!tried.has("low") && !tried.has("high"))
          return "Pick a kP that's too low.";
        if (!tried.has("high"))
          return "It falls short. Now pick one that's too high.";
        if (!tried.has("low"))
          return "It overshoots and rings. Now try one that's too low.";
        return "Short, or ringing: the plot told you which.";
      },
      input(k, down) {
        if (!down || !["low", "right", "high"].includes(k)) return;
        s.kind = k;
        s.runStart = s.time;
        s.hist = [];
        s.from = 0;
        tried.add(k);
        if (tried.has("low") && tried.has("high") && doneAt == null)
          doneAt = s.time + 2.6;
      },
      step(dt) {
        s.time += dt;
        if (s.kind) {
          const u = s.time - s.runStart;
          const seg = { kind: s.kind, from: 0, to: TARGET };
          s.rot = moveAt(seg, u);
          s.target = TARGET;
          const v =
            (moveAt(seg, u + 0.01) - moveAt(seg, Math.max(0, u - 0.01))) / 0.02;
          s.fb = clamp(
            Math.abs(TARGET - s.rot) * 3 + Math.abs(v) * 0.04,
            0,
            0.3
          );
          s.ff = Math.cos(s.rot * TAU);
          if (u <= 3.2) s.hist.push([u, s.rot]);
        }
        return doneAt !== null && s.time > doneAt;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.4) return "Pick a kP that's too low.";
    if (u < 4.1) return "It falls short. Now pick one that's too high.";
    return "It overshoots and rings. Read the plot.";
  }

  return {
    draw,
    liveGate,
    gate,
    gatePromptAt,
    gateControls: [
      { k: "low", label: "kP too low", key: "Digit1", kind: "press" },
      { k: "right", label: "kP about right", key: "Digit2", kind: "press" },
      { k: "high", label: "kP too high", key: "Digit3", kind: "press" },
    ],
  };
}
