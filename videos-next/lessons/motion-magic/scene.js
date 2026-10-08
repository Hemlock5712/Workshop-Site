// Walking the Target. Motion Magic in Tuner X: the target no longer jumps; the
// motor walks it there, speeding up, cruising, and slowing down.
//
// What is drawn, and how:
//   profile   Motion Magic's trapezoid in closed form: accelerate at `a` up to
//             cruise `v`, hold, decelerate at `a`, arrive with no speed. A move too
//             short to reach cruise is a triangle. The setpoint is the ghost arm.
//   arm       the tuned loop following that setpoint a moment behind. Slot 0 is the
//             student's (hatched), and never changes in this video.
//   panels    three views on one playhead: the arm, reference velocity (the
//             trapezoid) and position (the S-curve ending flat on the target).
// Angles are rotations: 0 is level, 0.25 straight up, -0.25 hanging down. A quarter
// turn up from hanging is half a rotation of travel, so the page's limits (0.5 rot/s,
// 1 rot/s^2) draw a full trapezoid.
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
  drawFlywheel,
  drawStand,
  drawToolWindow,
  panel,
} from "../../engine/kit.js";

const TAU = 2 * Math.PI;

// ---- layout ------------------------------------------------------------------------

const TOP = { x: 60, y: 60, w: 820, h: 230 };
const PIVOT = { x: 470, y: 600 };
const ARM_LEN = 195;
const VEL = { x: 960, y: 60, w: 900, h: 380 };
const POS = { x: 960, y: 460, w: 900, h: 360 };
const RIGHT = { x: 960, y: 60, w: 900, h: 760 };
const REST = -0.25;
const PAGE = { v: 0.5, a: 1 }; // the page's first limits

// ---- the profile -----------------------------------------------------------------------

function profile(D, v, a) {
  const d = Math.abs(D);
  let ta = v / a;
  let tc = (d - v * ta) / v;
  let vp = v;
  if (tc < 0) {
    ta = Math.sqrt(d / a);
    tc = 0;
    vp = a * ta;
  }
  const T = 2 * ta + tc;
  const sg = Math.sign(D) || 1;
  const pos = (u) => {
    if (u <= 0) return 0;
    if (u < ta) return sg * 0.5 * a * u * u;
    if (u < ta + tc) return sg * (0.5 * a * ta * ta + vp * (u - ta));
    if (u < T) {
      const r = T - u;
      return sg * (d - 0.5 * a * r * r);
    }
    return sg * d;
  };
  const vel = (u) => {
    if (u <= 0 || u >= T) return 0;
    if (u < ta) return a * u;
    if (u < ta + tc) return vp;
    return a * (T - u);
  };
  const phase = (u) =>
    u <= 0
      ? ""
      : u < ta
        ? "speed up"
        : u < ta + tc
          ? "cruise"
          : u < T
            ? "slow down"
            : "arrived";
  return { T, ta, tc, vp, v, a, d, pos, vel, phase };
}

// the tuned loop's step response, for "last time" (no profile)
function stepResp(u) {
  const z = 0.75;
  const w = 9;
  const wd = w * Math.sqrt(1 - z * z);
  return u <= 0
    ? 0
    : 1 -
        Math.exp(-z * w * u) *
          (Math.cos(wd * u) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * u));
}

// a run: { t, from, to, v, a, lag, view: { span, v1 } }. kind "mm" | "step" | "hand" | "hold"
function evalRun(r, t) {
  const u = t - r.t;
  if (r.kind === "hold") return { sp: r.from, rot: r.from };
  if (r.kind === "hand") {
    const k = easeInOut(clamp(u / 0.8));
    const p = lerp(r.from, r.to, k);
    return { sp: p, rot: p };
  }
  if (r.kind === "step")
    return { sp: r.to, rot: r.from + (r.to - r.from) * stepResp(u) };
  const P = r.P;
  const sp = r.from + P.pos(u);
  const rot = r.from + P.pos(u - r.lag);
  return { sp, rot };
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

function hatch(ctx, x, y, w, h) {
  ctx.save();
  rrect(ctx, x, y, w, h, 3);
  ctx.clip();
  ctx.fillStyle = alpha(C.accent, 0.18);
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = alpha(C.accent, 0.55);
  ctx.lineWidth = 2;
  for (let hx = x - h; hx < x + w; hx += 10) {
    ctx.beginPath();
    ctx.moveTo(hx, y + h);
    ctx.lineTo(hx + h, y);
    ctx.stroke();
  }
  ctx.restore();
}

function enableButton(ctx, x, y, on) {
  rrect(ctx, x, y, 190, 52, 5);
  ctx.fillStyle = on ? C.accent : alpha(C.err, 0.14);
  ctx.fill();
  ctx.strokeStyle = on ? C.accent : C.err;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, on ? "ENABLED" : "DISABLED", x + 95, y + 35, {
    font: MONO,
    size: 21,
    weight: 600,
    align: "center",
    color: on ? C.accentInk : C.err,
    spacing: 2,
  });
}

function downloadIcon(ctx, x, y, hot) {
  rrect(ctx, x, y, 60, 52, 4);
  ctx.fillStyle = hot ? C.accent : C.bg3;
  ctx.fill();
  const ink = hot ? C.accentInk : C.tx;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 30, y + 10);
  ctx.lineTo(x + 30, y + 33);
  ctx.moveTo(x + 20, y + 24);
  ctx.lineTo(x + 30, y + 34);
  ctx.lineTo(x + 40, y + 24);
  ctx.moveTo(x + 16, y + 41);
  ctx.lineTo(x + 44, y + 41);
  ctx.stroke();
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const T = {
    jumped: Wd("intro", "jumped"),
    walks: Wd("intro", "Motion"),
    go: Wd("route", "go,"),
    speedUp: Wd("route", "speed"),
    speeds: Wd("trapezoid", "speeds"),
    cruise: Wd("trapezoid", "cruises,"),
    slows: Wd("trapezoid", "slows"),
    gains: Wd("same", "gains"),
    target: Wd("same", "target"),
    cv: Wd("set", "half"),
    acc: Wd("set", "one"),
    jerk: Wd("set", "jerk"),
    apply: Wd("set", "apply."),
    pick: Wd("run", "Motion"),
    quarter: Wd("run", "quarter"),
    enable: Wd("run", "enable."),
    draws: Wd("run", "draws"),
    short: Wd("triangle", "short"),
    before: Wd("triangle", "before"),
    correct: Wd("triangle", "correct."),
    fly: Wd("flywheel", "flywheel"),
    noCruise: Wd("flywheel", "no"),
    onlyAcc: Wd("flywheel", "acceleration"),
    raise: Wd("raise", "Raise"),
    lag: Wd("raise", "lag,"),
    back: Wd("raise", "back"),
    three: Wd("generate", "three"),
    gen: Wd("generate", "Generate"),
    copies: Wd("generate", "copies"),
    ws3: Wd("generate", "Workshop"),
  };

  const VIEW = { span: 2.2, v1: 0.7 };
  const SLOW = { v: 0.25, a: 0.25 }; // the concept beat, slowed so the narration fits

  // ---- the timeline of runs --------------------------------------------------------
  // [time, kind, to, { v, a, lag, view, label }]
  const plan = [
    [0, "hold", REST],
    // last time: the target jumps
    [
      T.jumped - 0.1,
      "step",
      0.25,
      { view: VIEW, label: "a step: the target jumps" },
    ],
    [T.walks - 0.45, "hand", REST],
    [T.walks + 0.4, "mm", 0.25, { ...PAGE, view: VIEW }],
    [L("route").t0 + 0.2, "hand", REST],
    // the concept, slowed down: speed up, cruise, slow down
    [T.speeds - 0.1, "mm", 0.25, { ...SLOW, view: { span: 3.6, v1: 0.35 } }],
    [T.gains - 0.2, "hand", REST],
    [T.target - 1.2, "mm", 0.25, { ...PAGE, view: VIEW }],
    // reset by hand while Tuner X is up
    [L("set").t0 + 0.6, "hand", REST],
    [T.enable + 0.05, "mm", 0.25, { ...PAGE, view: VIEW }],
    [L("tryit").t0, "hand", REST],
    // the gate, played for you: the full move, then a short one
    [gate.t0 + 0.3, "mm", 0.25, { ...PAGE, view: VIEW }],
    [gate.t0 + 2.2, "hand", REST],
    [gate.t0 + 3.2, "mm", REST + 0.15, { ...PAGE, view: VIEW, overlay: true }],
    // the triangle, again, for the narration
    [T.short - 0.1, "hand", REST],
    [T.short + 0.8, "mm", REST + 0.15, { ...PAGE, view: VIEW, overlay: true }],
    [T.correct + 0.3, "hold", REST + 0.15],
    // raise the limits: steeper each time, then too far, then back off
    [T.raise - 0.3, "hand", REST],
    [
      T.raise + 0.5,
      "mm",
      0.25,
      { v: 0.5, a: 2, lag: 0.05, view: VIEW, step: 1 },
    ],
    [T.raise + 1.6, "hand", REST],
    [
      T.raise + 2.3,
      "mm",
      0.25,
      { v: 0.5, a: 4, lag: 0.07, view: VIEW, step: 2 },
    ],
    [T.lag - 0.9, "hand", REST],
    [
      T.lag - 0.3,
      "mm",
      0.25,
      { v: 0.5, a: 8, lag: 0.17, view: VIEW, step: 3, lagging: true },
    ],
    [T.back + 0.2, "hand", REST],
    [
      T.back + 0.9,
      "mm",
      0.25,
      { v: 0.5, a: 3.2, lag: 0.06, view: VIEW, step: 2.5 },
    ],
  ];
  const runs = [];
  for (const [t, kind, to, o = {}] of plan) {
    const prev = runs.at(-1);
    const from = prev ? evalRun(prev, t).rot : REST;
    const r = { t, kind, from, to, lag: 0.05, ...o };
    if (kind === "mm") r.P = profile(to - from, r.v, r.a);
    runs.push(r);
  }
  const runAt = (t) => {
    let r = runs[0];
    for (const x of runs) if (x.t <= t) r = x;
    return r;
  };
  // the run the plots show: the latest profile or step at or before t
  const plotRunAt = (t) => {
    let r = null;
    let prev = null;
    for (const x of runs) {
      if (x.t > t) break;
      if (x.kind === "mm" || x.kind === "step") {
        if (r && r.kind === "mm" && !r.overlay) prev = r;
        r = x;
      }
    }
    return { r, prev: r?.overlay ? prev : null };
  };

  function stateAt(t) {
    const r = runAt(t);
    const { sp, rot } = evalRun(r, t);
    const pr = plotRunAt(t);
    const enabled = t >= T.enable - 0.1 && t < L("flywheel").t0;
    return {
      time: t,
      sp,
      rot,
      run: pr.r,
      prev: pr.prev,
      moving: r.kind === "mm" || r.kind === "step",
      enabled,
      len: null,
    };
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 470, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("run").t0 - 0.2, x: 520, y: 360, z: 1.3, d: 1.2 },
    { t: T.enable - 0.4, ...FULL, d: 1.0 },
    { t: L("generate").t0 - 0.2, x: 1410, y: 420, z: 1.15, d: 1.2 },
  ];

  // ---- the bench ---------------------------------------------------------------

  function drawBench(ctx, s, t, live) {
    const fly = live
      ? 0
      : window_(t, L("flywheel").t0 - 0.3, L("raise").t0, 0.5);
    ctx.save();
    ctx.globalAlpha = 1 - fly;
    drawStand(ctx, PIVOT, 840);
    if (s.run && s.run.kind !== "hand") {
      // the target mark
      const ang = s.run.to * TAU;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(
        PIVOT.x + Math.cos(ang) * (ARM_LEN + 30),
        PIVOT.y - Math.sin(ang) * (ARM_LEN + 30)
      );
      ctx.lineTo(
        PIVOT.x + Math.cos(ang) * (ARM_LEN + 60),
        PIVOT.y - Math.sin(ang) * (ARM_LEN + 60)
      );
      ctx.stroke();
      text(
        ctx,
        `${s.run.to.toFixed(2)}`,
        PIVOT.x +
          Math.cos(ang) * (ARM_LEN + 76) +
          (Math.cos(ang) < -0.2 ? -60 : 8),
        PIVOT.y - Math.sin(ang) * (ARM_LEN + 76) + 8,
        { font: MONO, size: 20, weight: 600, color: C.accent }
      );
    }
    const showGhost = Math.abs(s.sp - s.rot) > 0.003;
    if (showGhost) drawArmBody(ctx, PIVOT, ARM_LEN, s.sp, { ghost: true });
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, {
      driven: s.moving && Math.abs(s.sp - s.rot) > 0.001,
    });
    if (showGhost) {
      const ang = s.sp * TAU;
      const lab =
        !live && t >= T.target - 1.3 && t < L("set").t0
          ? "the target the gains chase"
          : "setpoint";
      text(
        ctx,
        lab,
        PIVOT.x + Math.cos(ang) * (ARM_LEN - 20) + 30,
        PIVOT.y - Math.sin(ang) * (ARM_LEN - 20) + 6,
        { font: MONO, size: 18, weight: 600, color: C.accent }
      );
    }
    ctx.restore();
    if (fly > 0) {
      ctx.save();
      ctx.globalAlpha = fly;
      const u = clamp((t - T.fly) * 2.2, 0, 7);
      const rps = 100 * Math.min(1, u / 5);
      const ang =
        rps > 0
          ? (0.5 * 20 * Math.min(u, 5) ** 2 + 100 * Math.max(0, u - 5)) * 0.05
          : 0;
      drawFlywheel(ctx, { x: PIVOT.x, y: PIVOT.y - 60 }, 160, ang, {
        rps: rps * 0.6,
        driven: rps > 0,
        label: `${rps.toFixed(0)} rps`,
      });
      ctx.restore();
    }
  }

  // ---- the top-left panel, one state per beat ---------------------------------------

  function drawTop(ctx, s, t, live) {
    if (live) return controlPanel(ctx, s, t, true);
    const beats = [
      [L("intro").t0, L("route").t0, introTop],
      [L("route").t0, L("trapezoid").t0, routeTop],
      [L("trapezoid").t0, L("same").t0, phaseTop],
      [L("same").t0, L("set").t0, sameTop],
      [
        L("run").t0 - 0.2,
        L("flywheel").t0,
        (c, tt) => controlPanel(c, s, tt, false),
      ],
      [L("flywheel").t0, L("raise").t0, flyTop],
      [L("raise").t0, L("generate").t0, raiseTop],
    ];
    for (const [a0, a1, f] of beats) {
      const a = window_(t, a0 - 0.2, a1, 0.3);
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = a;
      panel(ctx, TOP, C.bg2);
      f(ctx, t);
      ctx.restore();
    }
  }

  function introTop(ctx, t) {
    micro(ctx, "last time · this time", TOP.x + 24, TOP.y + 40);
    const r1 = (y, a, k, hot) => {
      ctx.save();
      ctx.globalAlpha *= k;
      text(ctx, a[0], TOP.x + 24, y, {
        font: MONO,
        size: 26,
        weight: 600,
        color: hot ? C.accent : C.tx2,
      });
      text(ctx, a[1], TOP.x + 360, y, {
        size: 24,
        color: hot ? C.accent : C.tx2,
      });
      ctx.restore();
    };
    r1(
      TOP.y + 110,
      ["PID only", "the target jumps"],
      easeOut(ramp(t, T.jumped - 0.2, 0.4)),
      false
    );
    r1(
      TOP.y + 170,
      ["Motion Magic", "the target walks"],
      easeOut(ramp(t, T.walks - 0.1, 0.4)),
      true
    );
  }

  function routeTop(ctx, t) {
    micro(ctx, "two numbers describe the walk", TOP.x + 24, TOP.y + 40);
    const k1 = easeOut(ramp(t, Wd("route", "how") - 0.1, 0.4));
    const k2 = easeOut(ramp(t, Wd("route", "how", 2) - 0.1, 0.4));
    text(ctx, "cruise velocity", TOP.x + 24, TOP.y + 110, {
      font: MONO,
      size: 26,
      weight: 600,
      color: C.accent,
      a: k1,
    });
    text(ctx, "how fast it may go", TOP.x + 340, TOP.y + 110, {
      size: 24,
      color: C.tx2,
      a: k1,
    });
    text(ctx, "acceleration", TOP.x + 24, TOP.y + 170, {
      font: MONO,
      size: 26,
      weight: 600,
      color: C.accent,
      a: k2,
    });
    text(ctx, "how fast it may speed up", TOP.x + 340, TOP.y + 170, {
      size: 24,
      color: C.tx2,
      a: k2,
    });
  }

  function phaseTop(ctx, t) {
    micro(ctx, "every move has three parts", TOP.x + 24, TOP.y + 40);
    const ph = [
      ["speed up", T.speeds],
      ["cruise", T.cruise],
      ["slow down", T.slows],
    ];
    ph.forEach(([p, at], i) => {
      const on = t >= at - 0.1;
      text(ctx, p, TOP.x + 24 + i * 260, TOP.y + 130, {
        font: SERIF,
        size: 46,
        color: on ? C.accent : C.tx3,
      });
    });
    text(ctx, "arriving with no speed left", TOP.x + 24, TOP.y + 196, {
      font: MONO,
      size: 21,
      color: C.tx2,
      a: easeOut(ramp(t, Wd("trapezoid", "arriving") - 0.1, 0.4)),
    });
  }

  function sameTop(ctx, t) {
    micro(ctx, "your gains don't change", TOP.x + 24, TOP.y + 40);
    const box = (x, w, title, sub, hot, k) => {
      ctx.save();
      ctx.globalAlpha *= k;
      rrect(ctx, x, TOP.y + 70, w, 120, 5);
      ctx.fillStyle = hot ? alpha(C.accent, 0.12) : C.bg;
      ctx.fill();
      ctx.strokeStyle = hot ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, title, x + 18, TOP.y + 112, {
        font: MONO,
        size: 21,
        weight: 600,
        color: hot ? C.accent : C.tx,
      });
      text(ctx, sub, x + 18, TOP.y + 146, {
        font: MONO,
        size: 17,
        color: C.tx2,
      });
      ctx.restore();
    };
    const k1 = easeOut(ramp(t, T.gains - 0.2, 0.4));
    const k2 = easeOut(ramp(t, Wd("same", "Motion") - 0.1, 0.4));
    box(TOP.x + 24, 250, "Motion Magic", "moves the target", true, k2);
    text(ctx, "→", TOP.x + 290, TOP.y + 140, {
      font: MONO,
      size: 28,
      color: C.tx3,
      a: k2,
    });
    box(TOP.x + 330, 250, "Slot 0", "unchanged", false, k1);
    ctx.save();
    ctx.globalAlpha *= k1;
    hatch(ctx, TOP.x + 348, TOP.y + 160, 200, 18);
    ctx.restore();
    text(ctx, "→", TOP.x + 596, TOP.y + 140, {
      font: MONO,
      size: 28,
      color: C.tx3,
      a: k1,
    });
    box(TOP.x + 636, 160, "motor", "volts", false, k1);
  }

  // Control pane: MotionMagicVoltage, a position, enable. Run, the gate, the triangle.
  function controlPanel(ctx, s, t, live) {
    if (live) panel(ctx, TOP, C.bg2);
    micro(ctx, "Tuner X · TalonFX 31 · Control", TOP.x + 24, TOP.y + 40);
    const hotPick = !live && t >= T.pick - 0.3 && t < T.quarter - 0.3;
    const hotPos = !live && t >= T.quarter - 0.3 && t < T.enable - 0.2;
    const pos = live
      ? s.len != null
        ? (REST + s.len).toFixed(2)
        : "0.25"
      : s.run && s.run.kind === "mm" && t > T.quarter
        ? s.run.to.toFixed(2)
        : t >= T.quarter
          ? "0.25"
          : "—";
    const row = (y, label, value, hot) => {
      if (hot) {
        ctx.fillStyle = alpha(C.accent, 0.12);
        ctx.fillRect(TOP.x + 2, y - 30, TOP.w - 4, 44);
        ctx.fillStyle = C.accent;
        ctx.fillRect(TOP.x + 2, y - 30, 4, 44);
      }
      text(ctx, label, TOP.x + 24, y, { size: 22, color: hot ? C.tx : C.tx2 });
      text(ctx, value, TOP.x + 520, y, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "right",
        color: hot ? C.accent : C.tx,
      });
    };
    row(
      TOP.y + 92,
      "Control",
      live || t >= T.pick - 0.1 ? "MotionMagicVoltage" : "—",
      hotPick
    );
    row(TOP.y + 140, "Position", pos, hotPos);
    row(TOP.y + 188, "Slot", "0", false);
    enableButton(ctx, TOP.x + 590, TOP.y + 70, live ? true : s.enabled);
    text(ctx, "rotations", TOP.x + 590, TOP.y + 170, {
      font: MONO,
      size: 18,
      color: C.tx3,
    });
  }

  function flyTop(ctx, t) {
    micro(ctx, "flywheel · Motion Magic settings", TOP.x + 24, TOP.y + 40);
    const kn = easeOut(ramp(t, T.noCruise - 0.2, 0.4));
    const ka = easeOut(ramp(t, T.onlyAcc - 0.2, 0.4));
    // cruise velocity: present, never read
    ctx.save();
    ctx.globalAlpha *= 0.35 + 0.65 * (1 - kn * 0.6);
    text(ctx, "Motion Magic Cruise Velocity", TOP.x + 24, TOP.y + 96, {
      size: 22,
      color: C.tx3,
    });
    ctx.restore();
    text(ctx, "not read", TOP.x + TOP.w - 24, TOP.y + 96, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "right",
      color: C.err,
      a: kn,
    });
    if (kn > 0) {
      ctx.strokeStyle = alpha(C.tx3, kn);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(TOP.x + 24, TOP.y + 89);
      ctx.lineTo(TOP.x + 24 + 330 * kn, TOP.y + 89);
      ctx.stroke();
    }
    if (ka > 0.01) {
      ctx.fillStyle = alpha(C.accent, 0.12 * ka);
      ctx.fillRect(TOP.x + 2, TOP.y + 116, TOP.w - 4, 44);
    }
    text(ctx, "Motion Magic Acceleration", TOP.x + 24, TOP.y + 146, {
      size: 22,
      color: ka > 0.5 ? C.tx : C.tx2,
    });
    text(ctx, "20", TOP.x + TOP.w - 24, TOP.y + 146, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "right",
      color: C.accent,
    });
    text(
      ctx,
      "MotionMagicVelocityVoltage · Velocity 100",
      TOP.x + 24,
      TOP.y + 200,
      { font: MONO, size: 19, color: C.tx2 }
    );
  }

  // rec · raise: acceleration up one step at a time, until the arm lags; then back off
  function raiseTop(ctx, t) {
    micro(ctx, "Tuner X · Configs · Motion Magic", TOP.x + 24, TOP.y + 40);
    const r = plotRunAt(t).r;
    const step = r?.step ?? 0;
    text(ctx, "Motion Magic Acceleration", TOP.x + 24, TOP.y + 100, {
      size: 22,
      color: C.tx,
    });
    ctx.fillStyle = alpha(C.accent, 0.12);
    ctx.fillRect(TOP.x + 2, TOP.y + 70, TOP.w - 4, 44);
    ctx.fillStyle = C.accent;
    ctx.fillRect(TOP.x + 2, TOP.y + 70, 4, 44);
    hatch(ctx, TOP.x + TOP.w - 180, TOP.y + 78, 150, 28);
    text(ctx, "yours", TOP.x + TOP.w - 196, TOP.y + 100, {
      font: MONO,
      size: 17,
      align: "right",
      color: C.accent,
    });
    // the steps, as pips
    for (let i = 0; i < 3; i++) {
      const on = step >= i + 1 || (step === 2.5 && i < 2);
      rrect(ctx, TOP.x + 24 + i * 70, TOP.y + 140, 56, 22, 3);
      ctx.fillStyle = on ? (i === 2 && step === 3 ? C.err : C.accent) : C.bg3;
      ctx.fill();
    }
    const msg = r?.lagging
      ? "the arm lags: too far"
      : step === 2.5
        ? "backed off a little"
        : "one step at a time";
    text(ctx, msg, TOP.x + 260, TOP.y + 158, {
      font: MONO,
      size: 21,
      weight: 600,
      color: r?.lagging ? C.err : C.accent,
    });
    text(
      ctx,
      "Motion Magic Cruise Velocity: the same way",
      TOP.x + 24,
      TOP.y + 206,
      { font: MONO, size: 18, color: C.tx3 }
    );
  }

  // ---- the two plots on one playhead ------------------------------------------------

  function plotFrame(ctx, R, title) {
    panel(ctx, R, C.bg2);
    micro(ctx, title, R.x + 24, R.y + 36);
    const L0 = R.x + 50;
    const B = R.y + R.h - 40;
    const T0 = R.y + 60;
    const R1 = R.x + R.w - 30;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L0, T0);
    ctx.lineTo(L0, B);
    ctx.lineTo(R1, B);
    ctx.stroke();
    micro(ctx, "time", R1 - 60, B + 30, { size: 16 });
    return { L0, B, T0, R1 };
  }

  function line(ctx, pts, color, width = 4, dash = null) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  }

  function drawPlots(ctx, s, t, live) {
    const fly = live
      ? 0
      : window_(t, L("flywheel").t0 - 0.3, L("raise").t0, 0.5);
    const r = s.run;
    const now = live ? s.time : t;
    // velocity
    const fv = plotFrame(
      ctx,
      VEL,
      fly > 0.5 ? "reference velocity · flywheel" : "reference velocity"
    );
    const fp = plotFrame(ctx, POS, "reference · position");
    if (fly > 0.5) return drawFlyPlot(ctx, fv, t);
    if (!r) return;
    const view = r.view ?? VIEW;
    const u = now - r.t;
    const X = (f, uu) => f.L0 + (uu / view.span) * (f.R1 - f.L0);
    const Yv = (v) => fv.B - (v / view.v1) * (fv.B - fv.T0);
    const p0 = REST - 0.03;
    const p1 = 0.3;
    const Yp = (p) => fp.B - ((p - p0) / (p1 - p0)) * (fp.B - fp.T0);
    const sample = (run, upTo, f) => {
      const pts = [];
      for (let k = 0; k <= upTo + 1e-6 && k <= view.span; k += 1 / 60)
        pts.push(f(run, k));
      return pts;
    };
    // the earlier run, faint, when comparing
    if (s.prev && s.prev.kind === "mm") {
      const pr = s.prev;
      line(
        ctx,
        sample(pr, view.span, (q, k) => [X(fv, k), Yv(q.P.vel(k))]),
        alpha(C.tx3, 0.7),
        3,
        [8, 7]
      );
      line(
        ctx,
        sample(pr, view.span, (q, k) => [X(fp, k), Yp(q.from + q.P.pos(k))]),
        alpha(C.tx3, 0.7),
        3,
        [8, 7]
      );
    }
    if (r.kind === "step") {
      // a step: the reference jumps; velocity has nothing to draw but a spike
      line(
        ctx,
        [
          [X(fp, 0), Yp(r.from)],
          [X(fp, 0), Yp(r.to)],
          [X(fp, Math.min(u, view.span)), Yp(r.to)],
        ],
        C.tx2,
        3,
        [9, 7]
      );
      line(
        ctx,
        sample(r, u, (q, k) => [
          X(fp, k),
          Yp(q.from + (q.to - q.from) * stepResp(k)),
        ]),
        C.accent,
        4
      );
      text(ctx, "the target jumped", X(fp, 0) + 24, Yp(r.to) - 14, {
        font: MONO,
        size: 18,
        color: C.tx2,
      });
      text(ctx, "no route, no speed limit", fv.L0 + 30, fv.T0 + 60, {
        font: MONO,
        size: 20,
        color: C.tx3,
      });
      return;
    }
    const P = r.P;
    // cruise velocity cap
    const capK = live
      ? 1
      : clamp(
          easeOut(ramp(t, T.go - 0.5, 0.4)) + (t > L("trapezoid").t0 ? 1 : 0)
        );
    if (capK > 0) {
      ctx.save();
      ctx.globalAlpha = capK;
      line(
        ctx,
        [
          [fv.L0, Yv(P.v)],
          [fv.R1, Yv(P.v)],
        ],
        alpha(C.tx2, 0.6),
        2,
        [5, 6]
      );
      text(ctx, "cruise velocity", fv.R1 - 10, Yv(P.v) - 12, {
        font: MONO,
        size: 17,
        align: "right",
        color: C.tx2,
      });
      ctx.restore();
    }
    // the trapezoid so far, and the playhead dot
    line(
      ctx,
      sample(r, u, (q, k) => [X(fv, k), Yv(q.P.vel(k))]),
      C.accent,
      5
    );
    const ue = clamp(u, 0, view.span);
    ctx.beginPath();
    ctx.arc(X(fv, ue), Yv(P.vel(ue)), 8, 0, TAU);
    ctx.fillStyle = C.accent;
    ctx.fill();
    // acceleration slope label
    const accK = live ? 0 : window_(t, T.speedUp - 0.2, L("trapezoid").t0, 0.3);
    if (accK > 0)
      text(ctx, "acceleration", X(fv, P.ta * 0.5) + 18, Yv(P.vp * 0.5) + 6, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.accent,
        a: accK,
      });
    // phase names, once each has happened
    if (u > 0.05)
      text(ctx, "speed up", X(fv, P.ta * 0.5) + 18, Yv(P.vp * 0.5) + 34, {
        font: MONO,
        size: 18,
        color: C.tx2,
        a: accK > 0.5 ? 0 : 1,
      });
    if (P.tc > 0 && u > P.ta + 0.05)
      text(ctx, "cruise", X(fv, P.ta + P.tc / 2), Yv(P.vp) - 16, {
        font: MONO,
        size: 18,
        align: "center",
        color: C.tx2,
      });
    if (u > P.ta + P.tc + 0.05)
      text(
        ctx,
        "slow down",
        X(fv, P.ta + P.tc + P.ta * 0.5) + 18,
        Yv(P.vp * 0.5) + 6,
        { font: MONO, size: 18, color: C.tx2 }
      );
    if (P.tc === 0 && u > P.ta && (live || t > gate.t0))
      text(ctx, "no room to cruise", X(fv, P.ta), Yv(P.vp) - 16, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: C.accent,
      });
    // position: reference and measured
    line(
      ctx,
      sample(r, u, (q, k) => [X(fp, k), Yp(q.from + q.P.pos(k))]),
      C.tx2,
      3,
      [9, 7]
    );
    line(
      ctx,
      sample(r, u, (q, k) => [X(fp, k), Yp(q.from + q.P.pos(k - q.lag))]),
      r.lagging ? C.err : C.accent,
      4
    );
    if (u > P.T)
      text(
        ctx,
        "arrived, flat on the target",
        X(fp, Math.min(P.T, view.span - 0.6)) - 20,
        Yp(r.to) - 16,
        { font: MONO, size: 18, color: C.accent }
      );
    if (r.lagging && u > 0.15)
      text(ctx, "lag", X(fp, 0.3) + 24, Yp(r.from + P.pos(0.3)) + 30, {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.err,
      });
    micro(ctx, "reference", POS.x + POS.w - 260, POS.y + 36, { size: 16 });
    micro(ctx, "position", POS.x + POS.w - 130, POS.y + 36, {
      size: 16,
      color: C.accent,
    });
  }

  // flywheel: velocity only, a ramp to a flat line; acceleration alone shapes it
  function drawFlyPlot(ctx, fv, t) {
    const u = clamp((t - T.fly) * 2.2, 0, 7);
    const X = (k) => fv.L0 + (k / 7) * (fv.R1 - fv.L0);
    const Y = (v) => fv.B - (v / 130) * (fv.B - fv.T0);
    line(
      ctx,
      [
        [fv.L0, Y(100)],
        [fv.R1, Y(100)],
      ],
      alpha(C.tx2, 0.6),
      2,
      [5, 6]
    );
    text(ctx, "Velocity 100 rps · the request", fv.R1 - 10, Y(100) - 12, {
      font: MONO,
      size: 17,
      align: "right",
      color: C.tx2,
    });
    const pts = [];
    for (let k = 0; k <= u; k += 1 / 30)
      pts.push([X(k), Y(Math.min(100, 20 * k))]);
    line(ctx, pts, C.accent, 5);
    text(ctx, "acceleration 20 rps²", X(3) + 30, Y(30), {
      font: MONO,
      size: 18,
      weight: 600,
      color: C.accent,
    });
    text(
      ctx,
      "no cruise to reach: the request is the speed",
      fv.L0 + 30,
      fv.B - 20,
      {
        font: MONO,
        size: 18,
        color: C.tx3,
        a: easeOut(ramp(t, T.noCruise, 0.4)),
      }
    );
    // the position panel has nothing to show for a wheel
    ctx.save();
    ctx.fillStyle = alpha(C.bg, 0.6);
    ctx.fillRect(POS.x + 1, POS.y + 50, POS.w - 2, POS.h - 51);
    ctx.restore();
    text(
      ctx,
      "no position target for a flywheel",
      POS.x + POS.w / 2,
      POS.y + POS.h / 2,
      { font: MONO, size: 22, align: "center", color: C.tx3 }
    );
  }

  // ---- Tuner X overlays on the right column (rec) -----------------------------------

  // rec · set: Configs → Motion Magic: cruise 0.5, acceleration 1, jerk 0, apply
  function recSet(ctx, t) {
    const a = window_(t, L("set").t0 - 0.2, L("run").t0 - 0.2, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    drawToolWindow(ctx, RIGHT, {
      app: "Tuner X",
      title: "TalonFX 31 · Configs · Motion Magic",
      rowH: 92,
      rows: [
        {
          label: "Motion Magic Cruise Velocity",
          value: t >= T.cv ? "0.5" : "0",
          hot: t >= T.cv - 0.3 && t < T.acc - 0.2,
          note: "rotations per second",
        },
        {
          label: "Motion Magic Acceleration",
          value: t >= T.acc ? "1" : "0",
          hot: t >= T.acc - 0.2 && t < T.jerk - 0.2,
          note: "rotations per second squared",
        },
        {
          label: "Motion Magic Jerk",
          value: "0",
          hot: t >= T.jerk - 0.2 && t < T.apply - 0.3,
          note: "zero: no jerk limit, a plain trapezoid",
        },
      ],
    });
    const hot = t >= T.apply - 0.3;
    downloadIcon(ctx, RIGHT.x + 26, RIGHT.y + 380, hot);
    text(ctx, "download icon · apply", RIGHT.x + 106, RIGHT.y + 414, {
      font: MONO,
      size: 21,
      weight: 600,
      color: hot ? C.accent : C.tx2,
    });
    text(ctx, "start slow", RIGHT.x + 26, RIGHT.y + 520, {
      font: SERIF,
      size: 44,
      color: C.accent,
      a: easeOut(ramp(t, Wd("set", "start") - 0.1, 0.4)),
    });
    text(ctx, "Slot 0 stays as you tuned it", RIGHT.x + 26, RIGHT.y + 580, {
      font: MONO,
      size: 20,
      color: C.tx3,
    });
    ctx.restore();
  }

  // rec · generate: three dots → Generate Code copies the device's config out
  function recGenerate(ctx, t) {
    const a = window_(t, L("generate").t0 - 0.2, L("close").t0 + 0.3, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    drawToolWindow(ctx, RIGHT, {
      app: "Tuner X",
      title: "TalonFX 31 · Configs",
      rowH: 60,
      rows: [
        { label: "Slot 0", value: null },
        { label: "Motion Magic Cruise Velocity", value: "0.5" },
        { label: "Motion Magic Acceleration", value: "1" },
        { label: "Motion Magic Jerk", value: "0" },
        { label: "Feedback · Motor Output · …", value: "" },
      ],
    });
    hatch(ctx, RIGHT.x + RIGHT.w - 26 - 150, RIGHT.y + 70 + 14, 150, 28);
    text(ctx, "yours", RIGHT.x + RIGHT.w - 196, RIGHT.y + 70 + 36, {
      font: MONO,
      size: 17,
      align: "right",
      color: C.accent,
    });
    text(
      ctx,
      "everything you set lives on the motor",
      RIGHT.x + 26,
      RIGHT.y + 420,
      {
        font: MONO,
        size: 21,
        color: C.tx2,
        a: easeOut(ramp(t, Wd("generate", "lives") - 0.2, 0.4)),
      }
    );
    // the three dots on the Configs bar, then the menu item
    const dx = RIGHT.x + RIGHT.w - 300;
    const dy = RIGHT.y + 470;
    const hot = t >= T.three - 0.2;
    rrect(ctx, dx + 220, dy, 50, 42, 4);
    ctx.fillStyle = hot ? C.accent : C.bg3;
    ctx.fill();
    text(ctx, "⋯", dx + 245, dy + 31, {
      font: SANS,
      size: 28,
      weight: 700,
      align: "center",
      color: hot ? C.accentInk : C.tx,
    });
    micro(ctx, "three dots", dx + 200, dy + 28, { align: "right", size: 16 });
    const km = easeOut(ramp(t, T.gen - 0.3, 0.3));
    if (km > 0) {
      ctx.save();
      ctx.globalAlpha *= km;
      rrect(ctx, dx - 50, dy + 58, 320, 62, 4);
      ctx.fillStyle = C.bg3;
      ctx.fill();
      ctx.fillStyle = alpha(C.accent, 0.2);
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, "Generate Code", dx - 26, dy + 99, {
        size: 25,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
    }
    chip(ctx, "copied out", RIGHT.x + 26, RIGHT.y + 560, {
      a: easeOut(ramp(t, T.copies - 0.1, 0.4)),
      size: 22,
    });
    chip(
      ctx,
      "the code picks up here · Workshop 3",
      RIGHT.x + 26,
      RIGHT.y + 640,
      { a: easeOut(ramp(t, T.ws3 - 0.4, 0.4)), size: 22 }
    );
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
      "Workshop 1 · Motion Magic in Tuner X",
      W / 2,
      440 - 20 * (1 - k),
      { align: "center", a: k, color: C.accent }
    );
    text(ctx, "Walking the Target", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
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
    text(ctx, "Name where it should end up,", W / 2, 450, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "and the motor plans the way there.", W / 2, 556, {
      font: SERIF,
      size: 84,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "and") - 0.1, 0.6)),
    });
    text(ctx, "speed up · cruise · slow down", W / 2, 660, {
      font: MONO,
      size: 30,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "plans") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? stateAt(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawTop(ctx, s, t, !!live);
    drawBench(ctx, s, t, !!live);
    drawPlots(ctx, s, t, !!live);
    if (!live) {
      recSet(ctx, t);
      recGenerate(ctx, t);
    }
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = {
      time: gate.t0,
      sp: REST,
      rot: REST,
      run: null,
      prev: null,
      moving: false,
      enabled: true,
      len: 0.5,
    };
    let doneAt = null;
    let phase = "start";
    let hand = null;
    return {
      state: s,
      prompt: () =>
        ({
          start: "Press Run for the full move.",
          shorten: "Now make the move shorter, and run it again.",
          trapezoid: "Still room to cruise. Shorter.",
          done: "No room to cruise: a triangle. That's correct.",
        })[phase],
      input(k, v) {
        if (k === "len") {
          s.len = v;
          return;
        }
        if (k !== "run" || !v || doneAt !== null) return;
        // back to hanging, then the move
        const start = s.time + (Math.abs(s.rot - REST) > 0.002 ? 0.6 : 0);
        hand = { t: s.time, from: s.rot, until: start };
        const to = REST + s.len;
        const r = {
          t: start,
          kind: "mm",
          from: REST,
          to,
          lag: 0.05,
          view: VIEW,
          overlay: true,
          P: profile(to - REST, PAGE.v, PAGE.a),
        };
        s.prev = s.run && s.run.kind === "mm" ? s.run : null;
        s.pending = r;
      },
      step(dt) {
        s.time += dt;
        if (s.pending && s.time >= s.pending.t) {
          s.run = s.pending;
          s.pending = null;
          const tri = s.run.P.tc === 0;
          if (tri) {
            phase = "done";
            doneAt = s.run.t + s.run.P.T + 1.6;
          } else phase = phase === "start" ? "shorten" : "trapezoid";
        }
        if (hand && s.time < hand.until) {
          const k = easeInOut(clamp((s.time - hand.t) / (hand.until - hand.t)));
          s.rot = s.sp = lerp(hand.from, REST, k);
          s.moving = false;
        } else if (s.run) {
          const e = evalRun(s.run, s.time);
          s.sp = e.sp;
          s.rot = e.rot;
          s.moving = true;
        }
        return doneAt !== null && s.time > doneAt;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 2.2) return "The full move: speed up, cruise, slow down.";
    if (u < 3.6) return "Now make the move shorter.";
    return "No room to cruise: a triangle. That's correct.";
  }

  return {
    draw,
    liveGate,
    gate,
    gatePromptAt,
    gateControls: [
      {
        k: "len",
        label: "Move length (rot)",
        kind: "range",
        min: 0.05,
        max: 0.5,
        step: 0.05,
        value: 0.5,
      },
      { k: "run", label: "Run", key: "Space", kind: "press" },
    ],
  };
}
