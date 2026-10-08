// Numbers and First Motion. Every device gets its own CAN ID, the arm's encoder
// gets its direction and zero, and then the motor moves under power for the
// first time, on a request with no target.
//
// What is simulated, and how:
//   arm       a light bench arm. Under Voltage Out it settles to a fixed speed per
//             volt and keeps it: nothing in the request knows where the arm is. It
//             stops only at the end of travel (a hard stop) or when disabled.
//   hand      during the encoder check the arm is turned by hand, from keyframes.
//   encoder   CANcoder 32 reads the arm angle plus an offset until it is zeroed
//             with the arm level; after that, rotations on the unit circle.
// Angles are rotations: 0 points right (level), 0.25 straight up, CCW positive.
//
// The Tuner X steps (lines marked rec in script.json) are drawn schematically with
// the real control names, one function per step, to be swapped for footage later.

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

const ENC = { x: 60, y: 60, w: 400, h: 124 };
const OUT = { x: 490, y: 60, w: 400, h: 124 };
const PIVOT = { x: 480, y: 500 };
const ARM_LEN = 220;
const TOOL = { x: 1000, y: 60, w: 860, h: 560 };
const STRIP = { x: 1000, y: 650, w: 860, h: 200 };
const STOP = 0.42; // end of travel, past vertical
const OFFSET = 0.371; // what the CANcoder reads at level before it is zeroed

// ---- the model ----------------------------------------------------------------------

const SPEED = 0.08; // rot/s per volt, once it is up to speed
const TAU_UP = 0.15; // s
const DT = 1 / 960;

const fresh = (time = 0) => ({
  time,
  rot: 0,
  w: 0,
  enabled: false,
  volts: 0,
  hit: false,
  restartedAt: time,
  hand: null,
  zeroed: false,
  inverted: false,
});

function stepArm(s, dt) {
  if (s.hand != null) {
    s.w = (s.hand - s.rot) / dt;
    s.rot = s.hand;
    s.hit = false;
    return;
  }
  s.volts = s.enabled ? 1 : 0;
  const dir = s.inverted ? -1 : 1;
  const wTarget = dir * SPEED * s.volts;
  s.w += ((wTarget - s.w) / (s.enabled ? TAU_UP : 0.25)) * dt;
  s.rot += s.w * dt;
  if (s.rot >= STOP) {
    s.rot = STOP;
    s.w = 0;
    s.hit = s.enabled;
  } else s.hit = false;
}

const reading = (s) => (s.zeroed ? s.rot : s.rot + OFFSET);

// hand keyframes for the encoder check: [time, rot]
function handAt(keys, t) {
  if (t < keys[0][0] || t > keys.at(-1)[0]) return null;
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const k = easeInOut((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
      return lerp(keys[i - 1][1], keys[i][1], k);
    }
  }
  return keys.at(-1)[1];
}

// ---- small pieces ------------------------------------------------------------------

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

function readout(
  ctx,
  R,
  label,
  value,
  { color = C.tx, lit = 0, arrow = 0 } = {}
) {
  rrect(ctx, R.x, R.y, R.w, R.h, 6);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.strokeStyle = lit ? alpha(C.accent, 0.4 + 0.6 * lit) : C.rule;
  ctx.lineWidth = 2 + 2 * lit;
  ctx.stroke();
  micro(ctx, label, R.x + 24, R.y + 38, { size: 16 });
  text(ctx, value, R.x + 24, R.y + 96, {
    font: MONO,
    size: 40,
    weight: 600,
    color,
  });
  if (arrow) {
    // counting up (+1) or down (-1)
    const ax = R.x + R.w - 44;
    const ay = R.y + 76;
    ctx.fillStyle = arrow > 0 ? C.accent : C.err;
    ctx.beginPath();
    ctx.moveTo(ax, ay - 22 * arrow);
    ctx.lineTo(ax - 16, ay + 6 * arrow);
    ctx.lineTo(ax + 16, ay + 6 * arrow);
    ctx.fill();
  }
}

// Tuner X's enable button: DISABLED until clicked, then ENABLED.
function enableButton(ctx, x, y, on, { a = 1, hot = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  rrect(ctx, x, y, 240, 60, 5);
  ctx.fillStyle = on ? C.accent : alpha(C.err, 0.14);
  ctx.fill();
  ctx.strokeStyle = on ? C.accent : C.err;
  ctx.lineWidth = 2 + 2 * hot;
  ctx.stroke();
  text(ctx, on ? "ENABLED" : "DISABLED", x + 120, y + 40, {
    font: MONO,
    size: 24,
    weight: 600,
    align: "center",
    color: on ? C.accentInk : C.err,
    spacing: 2,
  });
  ctx.restore();
}

function hardStop(ctx, a = 1, hit = false) {
  if (a <= 0) return;
  const ang = (STOP + 0.012) * TAU;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(PIVOT.x, PIVOT.y);
  ctx.rotate(-ang);
  ctx.fillStyle = hit ? alpha(C.err, 0.3) : C.bg3;
  ctx.strokeStyle = hit ? C.err : C.tx3;
  ctx.lineWidth = 2.5;
  ctx.setLineDash(hit ? [] : [7, 6]);
  rrect(ctx, 70, 20, ARM_LEN - 40, 34, 4);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  const lx = PIVOT.x + Math.cos(ang) * (ARM_LEN + 40) - 30;
  const ly = PIVOT.y - Math.sin(ang) * (ARM_LEN + 40) - 34;
  text(ctx, "end of travel", lx, ly, {
    font: MONO,
    size: 19,
    weight: 600,
    align: "center",
    color: hit ? C.err : C.tx3,
    a,
  });
}

// Device card along the bottom strip: model, ID, name, and a blinking LED.
function deviceCard(
  ctx,
  x,
  y,
  w,
  h,
  { model, id, name, led = false, bar = "none", lit = 0 }
) {
  rrect(ctx, x, y, w, h, 5);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.strokeStyle =
    bar === "err" ? C.err : lit ? alpha(C.accent, 0.4 + 0.6 * lit) : C.rule;
  ctx.lineWidth = bar === "err" || lit ? 3 : 2;
  ctx.stroke();
  ctx.fillStyle = bar === "err" ? C.err : bar === "ok" ? C.ok : C.bg3;
  ctx.fillRect(x + 1, y + 1, 9, h - 2);
  micro(ctx, model, x + 28, y + 36, { size: 16 });
  text(ctx, `ID ${id}`, x + 28, y + 90, {
    font: MONO,
    size: 34,
    weight: 600,
    color: bar === "err" ? C.err : C.tx,
  });
  text(ctx, name, x + 28, y + 130, {
    font: MONO,
    size: 19,
    color: name ? C.tx2 : C.tx3,
  });
  // the LED
  ctx.beginPath();
  ctx.arc(x + w - 30, y + 32, 11, 0, TAU);
  ctx.fillStyle = led ? C.accent : C.bg3;
  ctx.fill();
  if (led) {
    ctx.beginPath();
    ctx.arc(x + w - 30, y + 32, 20, 0, TAU);
    ctx.strokeStyle = alpha(C.accent, 0.5);
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const T = {
    factory: Wd("reset", "factory"),
    cleared: Wd("reset", "clears"),
    blink: Wd("blink", "Blink."),
    two: Wd("blink", "two"),
    id31: Wd("ids", "thirty", 1),
    id32: Wd("ids", "thirty", 2),
    id21: Wd("ids", "twenty"),
    zero: Wd("encoder", "level,"),
    pick: Wd("voltage", "Voltage"),
    volt: Wd("voltage", "one"),
    noStop: Wd("voltage", "place"),
    on: Wd("enable", "Enable"),
    off: Wd("enable", "again."),
    dirOn: Wd("direction", "counterclockwise,"),
    dirOff: Wd("direction", "up.") + 0.2,
    wrong: Wd("direction", "wrong"),
    invert: Wd("direction", "invert"),
    negative: Wd("direction", "negative"),
  };

  const HAND = [
    [Wd("encoder", "turn") - 0.1, 0],
    [Wd("encoder", "climb.") - 0.1, 0.1],
    [Wd("encoder", "Zero") - 0.3, 0.1],
    [Wd("encoder", "level,") - 0.15, 0],
    [Wd("encoder", "quarter") - 0.1, 0],
    [Wd("encoder", "reads"), 0.25],
    [L("link").t0 + 0.4, 0.25],
    [L("link").t0 + 1.6, 0],
  ];

  const events = [
    { t: T.zero, do: (s) => (s.zeroed = true) },
    { t: T.on + 0.05, do: (s) => (s.enabled = true) },
    { t: T.off, do: (s) => (s.enabled = false) },
    // the gate, played for you: enable, then stop it well before the end
    {
      t: gate.t0,
      do: (s) => Object.assign(s, fresh(s.time), { zeroed: true }),
    },
    { t: gate.t0 + 0.8, do: (s) => (s.enabled = true) },
    { t: gate.t0 + 3.0, do: (s) => (s.enabled = false) },
    // the direction check, from level again
    {
      t: L("direction").t0,
      do: (s) => Object.assign(s, fresh(s.time), { zeroed: true }),
    },
    { t: T.dirOn, do: (s) => (s.enabled = true) },
    { t: T.dirOff, do: (s) => (s.enabled = false) },
  ].sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = [];
  {
    const s = fresh();
    let e = 0;
    for (let i = 0, n = Math.ceil(VOICE.duration * RATE) + 2; i < n; i++) {
      while (s.time < i / RATE) {
        while (e < events.length && events[e].t <= s.time) events[e++].do(s);
        s.hand = handAt(HAND, s.time);
        stepArm(s, DT);
        s.time += DT;
      }
      samples.push({ ...s });
    }
  }
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // the wrong-way inset: same 1 V, motor output inverted, encoder counts down
  const wrongRun = [];
  {
    const s = Object.assign(fresh(), {
      zeroed: true,
      inverted: true,
      rot: 0.1,
    });
    for (let i = 0; i < 4 * RATE; i++) {
      s.enabled = i / RATE > 0.3 && i / RATE < 2.6;
      for (let k = 0; k < 8; k++) stepArm(s, DT);
      wrongRun.push({ ...s });
    }
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 470, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("ids").t0 - 0.2, x: 1430, y: 460, z: 1.12, d: 1.2 },
    { t: L("encoder").t0 - 0.3, ...FULL, d: 1.2 },
    { t: L("link").t0 + 1.4, x: 1430, y: 330, z: 1.2, d: 1.2 },
    { t: L("voltage").t0 - 0.2, ...FULL, d: 1.2 },
    { t: L("enable").t0 + 2.6, x: 700, y: 430, z: 1.2, d: 1.4 },
    { t: L("tryit").t0, ...FULL, d: 1.0 },
  ];

  // output volts over the last few seconds, for the plot
  function voltHist(t) {
    const pts = [];
    for (let u = Math.max(0, t - 6); u <= t; u += 1 / 20)
      pts.push([u - t, at(u).volts]);
    return pts;
  }

  // ---- the bench ---------------------------------------------------------------

  function drawBench(ctx, s, t, history, live) {
    // the unit circle, while the encoder is zeroed and checked
    const kc = live ? 0 : window_(t, L("encoder").t0, L("link").t1, 0.5);
    if (kc > 0) {
      ctx.save();
      ctx.globalAlpha = kc;
      ctx.beginPath();
      ctx.arc(PIVOT.x, PIVOT.y, ARM_LEN + 40, 0, TAU);
      ctx.strokeStyle = alpha(C.tx3, 0.4);
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      const lab = (r, s2, dx, dy) =>
        text(
          ctx,
          s2,
          PIVOT.x + Math.cos(r * TAU) * (ARM_LEN + 40) + dx,
          PIVOT.y - Math.sin(r * TAU) * (ARM_LEN + 40) + dy,
          { font: MONO, size: 20, weight: 600, color: C.tx2 }
        );
      lab(0, "0", 12, 8);
      lab(0.25, "0.25", 12, -8);
      lab(0.5, "0.5", -54, 8);
      ctx.restore();
    }
    const showStop = live || t >= T.noStop - 0.3;
    drawStand(ctx, PIVOT, 800);
    if (showStop)
      hardStop(ctx, live ? 1 : easeOut(ramp(t, T.noStop - 0.3, 0.5)), s.hit);
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, { history, driven: s.volts > 0 });
    // Blink: the arm motor's LED, at the pivot
    if (!live) {
      const blinkOne = t >= T.blink + 0.2 && t < T.two - 0.2;
      const blinkTwo = t >= T.two && t < L("blink").t1 + 0.4;
      if ((blinkOne || blinkTwo) && Math.floor(t * 4) % 2 === 0) {
        ctx.beginPath();
        ctx.arc(PIVOT.x, PIVOT.y, 58, 0, TAU);
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    }
    // the hand, turning the arm
    if (!live && s.hand != null && Math.abs(s.w) > 0.01) {
      const tip = {
        x: PIVOT.x + Math.cos(s.rot * TAU) * ARM_LEN,
        y: PIVOT.y - Math.sin(s.rot * TAU) * ARM_LEN,
      };
      text(ctx, "by hand", tip.x + 26, tip.y + 8, {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.tx,
      });
    }
    // CCW, the direction that counts up
    const kd = live
      ? 0
      : window_(t, Wd("direction", "arm") - 0.2, T.wrong, 0.4);
    if (kd > 0) {
      ctx.save();
      ctx.globalAlpha = kd;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(PIVOT.x, PIVOT.y, 90, -0.15 * TAU, -0.32 * TAU, true);
      ctx.stroke();
      const e = -0.32 * TAU;
      const ex = PIVOT.x + Math.cos(e) * 90;
      const ey = PIVOT.y + Math.sin(e) * 90;
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.moveTo(ex - 14, ey - 4);
      ctx.lineTo(ex + 6, ey - 14);
      ctx.lineTo(ex + 4, ey + 10);
      ctx.fill();
      text(ctx, "CCW", PIVOT.x + 112, PIVOT.y - 70, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
    }
    const since = t - s.restartedAt;
    if (s.restartedAt > 0 && since < 2.0)
      text(ctx, "starting over at level", PIVOT.x, 870, {
        font: MONO,
        size: 20,
        align: "center",
        color: C.tx2,
        a: window_(since, 0, 2.0, 0.3),
        spacing: 1.5,
      });
  }

  function drawReadouts(ctx, s, t, live) {
    const r = reading(s);
    const counting = Math.abs(s.w) > 0.01 ? Math.sign(s.w) : 0;
    const encLit = live
      ? 0
      : window_(t, L("encoder").t0, L("encoder").t1 + 0.3, 0.3) +
        window_(t, Wd("direction", "encoder") - 0.2, T.wrong, 0.3);
    readout(ctx, ENC, "CANcoder 32 · position", `${r.toFixed(3)} rot`, {
      color: s.zeroed ? C.tx : C.tx2,
      lit: clamp(encLit),
      arrow: counting,
    });
    readout(ctx, OUT, "TalonFX 31 · output", `${s.volts.toFixed(1)} V`, {
      color: s.volts ? C.accent : C.tx3,
    });
    if (!live) {
      const kz = window_(t, T.zero - 0.1, L("link").t0, 0.3);
      chip(ctx, "zeroed with the arm level", ENC.x, ENC.y + ENC.h + 50, {
        a: kz,
        size: 18,
      });
    }
  }

  // ---- the device strip ---------------------------------------------------------

  function drawStrip(ctx, t) {
    const k = easeOut(ramp(t, L("intro").t0 + 0.5, 0.6));
    if (k <= 0) return;
    const wrongA = window_(t, T.wrong - 0.2, L("close").t0, 0.4);
    ctx.save();
    ctx.globalAlpha =
      k *
      (1 - wrongA) *
      (1 - window_(t, L("link").t0 + 1.0, L("voltage").t0 + 0.2, 0.5));
    const cw = 275;
    const flashOn = Math.floor(t * 4) % 2 === 0;
    const one = t >= T.blink + 0.2 && t < T.two - 0.2;
    const two = t >= T.two && t < L("blink").t1 + 0.4;
    const dup = t >= T.two && t < T.id31;
    const cards = [
      {
        model: "TalonFX · arm",
        id: t >= T.id31 ? "31" : "0",
        name: t >= T.id31 + 0.4 ? "Arm motor" : "",
        led: (one || two) && flashOn,
        bar: dup ? "err" : t >= T.id31 ? "ok" : "none",
        lit: window_(t, T.id31 - 0.3, T.id31 + 1.0, 0.3),
      },
      {
        model: "CANcoder · arm",
        id: t >= T.id32 ? "32" : "0",
        name: t >= T.id32 + 0.4 ? "Arm encoder" : "",
        led: false,
        bar: t >= T.id32 ? "ok" : "none",
        lit: window_(t, T.id32 - 0.3, T.id32 + 1.0, 0.3),
      },
      {
        model: "TalonFX · flywheel",
        id: t >= T.id21 ? "21" : "0",
        name: t >= T.id21 + 0.4 ? "Flywheel motor" : "",
        led: two && flashOn,
        bar: dup ? "err" : t >= T.id21 ? "ok" : "none",
        lit: window_(t, T.id21 - 0.3, T.id21 + 1.0, 0.3),
      },
    ];
    cards.forEach((c, i) =>
      deviceCard(ctx, STRIP.x + i * (cw + 17), STRIP.y, cw, STRIP.h - 30, c)
    );
    chip(
      ctx,
      "same ID: both flash",
      STRIP.x + (cw + 17) * 2 + cw,
      STRIP.y - 22,
      {
        a: dup && t < L("ids").t0 + 0.6 ? 1 : 0,
        color: C.err,
        align: "right",
        size: 18,
      }
    );
    // the link: the motor reads the encoder
    const kl = window_(t, Wd("link", "encoder") - 0.2, L("voltage").t0, 0.4);
    if (kl > 0) {
      ctx.save();
      ctx.globalAlpha *= kl;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(STRIP.x + cw + 17 + 60, STRIP.y + STRIP.h - 30);
      ctx.bezierCurveTo(
        STRIP.x + cw + 17 + 60,
        STRIP.y + STRIP.h + 10,
        STRIP.x + 140,
        STRIP.y + STRIP.h + 10,
        STRIP.x + 140,
        STRIP.y + STRIP.h - 30
      );
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // ---- the Tuner X steps (rec), one function each -----------------------------------

  // rec · reset: three dots → Factory Default
  function recReset(ctx, t) {
    const a = window_(t, L("reset").t0 - 0.3, L("blink").t0 - 0.05, 0.3);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const done = t >= T.cleared;
    drawToolWindow(ctx, TOOL, {
      app: "Tuner X",
      title: "TalonFX",
      rowH: 70,
      rows: [
        {
          label: "CAN ID",
          value: done ? "0" : "7",
          note: done ? "factory default" : "last season's",
        },
        {
          label: "Inverted",
          value: done ? "factory default" : "last season's",
        },
        { label: "Configs", value: done ? "factory default" : "last season's" },
      ],
    });
    // the three dots, and the menu item
    const dots = { x: TOOL.x + TOOL.w - 70, y: TOOL.y + 70 + 3 * 70 + 20 };
    const hot = t >= T.factory - 0.5;
    rrect(ctx, dots.x, dots.y, 48, 40, 4);
    ctx.fillStyle = hot ? C.accent : C.bg3;
    ctx.fill();
    text(ctx, "⋯", dots.x + 24, dots.y + 30, {
      font: SANS,
      size: 28,
      weight: 700,
      align: "center",
      color: hot ? C.accentInk : C.tx,
    });
    micro(ctx, "three dots", dots.x - 16, dots.y + 28, {
      align: "right",
      size: 16,
    });
    const km = window_(t, T.factory - 0.2, T.cleared + 0.6, 0.2);
    if (km > 0) {
      ctx.save();
      ctx.globalAlpha *= km;
      const mx = dots.x - 300;
      const my = dots.y + 54;
      rrect(ctx, mx, my, 348, 64, 4);
      ctx.fillStyle = C.bg3;
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = alpha(C.accent, 0.18);
      ctx.fillRect(mx + 2, my + 2, 344, 60);
      text(ctx, "Factory Default", mx + 24, my + 41, {
        size: 24,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
    }
    ctx.restore();
  }

  // rec · blink: the Blink button; the device that flashes is the one being edited
  function recBlink(ctx, t) {
    const a = window_(t, L("blink").t0 - 0.05, L("ids").t0 - 0.05, 0.3);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    drawToolWindow(ctx, TOOL, {
      app: "Tuner X",
      title: "TalonFX · ID 0",
      rowH: 70,
      rows: [
        { label: "CAN ID", value: "0" },
        { label: "Name", value: "" },
      ],
      buttons: [{ label: "Blink", hot: t >= T.blink - 0.3 }],
    });
    text(ctx, "flashing: the one you're editing", TOOL.x + 30, TOOL.y + 290, {
      font: MONO,
      size: 22,
      color: C.accent,
      a: window_(t, Wd("blink", "flashes") - 0.1, T.two - 0.1, 0.3),
    });
    text(ctx, "two flashing: they share ID 0", TOOL.x + 30, TOOL.y + 290, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.err,
      a: easeOut(ramp(t, T.two, 0.3)),
    });
    ctx.restore();
  }

  // rec · ids: each device gets its number and a name
  function recIds(ctx, t) {
    const a = window_(t, L("ids").t0 - 0.05, L("encoder").t0 - 0.05, 0.3);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const cur =
      t >= T.id21 - 0.3
        ? ["TalonFX", "21", "Flywheel motor"]
        : t >= T.id32 - 0.3
          ? ["CANcoder", "32", "Arm encoder"]
          : ["TalonFX", "31", "Arm motor"];
    const startedAt =
      t >= T.id21 - 0.3 ? T.id21 : t >= T.id32 - 0.3 ? T.id32 : T.id31;
    const typed = t >= startedAt - 0.1 ? cur[1] : "";
    drawToolWindow(ctx, TOOL, {
      app: "Tuner X",
      title: cur[0],
      rowH: 70,
      rows: [
        { label: "CAN ID", value: typed || " ", hot: true },
        { label: "Name", value: t >= startedAt + 0.4 ? cur[2] : " " },
      ],
    });
    // the table the narration reads out
    const rows = [
      ["Arm TalonFX", "31", "Arm motor", T.id31],
      ["Arm CANcoder", "32", "Arm encoder", T.id32],
      ["Flywheel TalonFX", "21", "Flywheel motor", T.id21],
    ];
    rows.forEach(([dev, id, name, when], i) => {
      const y = TOOL.y + 300 + i * 64;
      const k = easeOut(ramp(t, when - 0.2, 0.4));
      text(ctx, dev, TOOL.x + 30, y, {
        font: MONO,
        size: 22,
        color: C.tx2,
        a: 0.35 + 0.65 * k,
      });
      text(ctx, id, TOOL.x + 360, y, {
        font: MONO,
        size: 26,
        weight: 600,
        color: C.accent,
        a: k,
      });
      text(ctx, name, TOOL.x + 460, y, {
        font: MONO,
        size: 22,
        color: C.tx,
        a: k,
      });
    });
    ctx.restore();
  }

  // rec · encoder: plot CANcoder 32's position while the arm is turned by hand
  function recEncoder(ctx, t) {
    const a = window_(t, L("encoder").t0 - 0.05, L("link").t0 + 0.3, 0.3);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    drawToolWindow(ctx, TOOL, { app: "Tuner X", title: "CANcoder 32 · plot" });
    const t0 = L("encoder").t0;
    const pts = [];
    for (let u = t0; u <= t; u += 1 / 30) pts.push([u - t0, reading(at(u))]);
    drawPlot(
      ctx,
      { x: TOOL.x + 24, y: TOOL.y + 66, w: TOOL.w - 48, h: 360 },
      {
        title: "Position · rotations",
        t0: 0,
        t1: 10,
        v0: -0.05,
        v1: 0.6,
        series: [{ pts, color: C.accent, label: "" }],
      }
    );
    const s = at(t);
    text(ctx, `${reading(s).toFixed(3)}`, TOOL.x + TOOL.w - 40, TOOL.y + 470, {
      font: MONO,
      size: 40,
      weight: 600,
      align: "right",
      color: C.accent,
    });
    micro(ctx, "Position", TOOL.x + 30, TOOL.y + 462);
    text(ctx, "climbs as the arm turns CCW", TOOL.x + 30, TOOL.y + 520, {
      font: MONO,
      size: 20,
      color: C.tx2,
      a: window_(t, Wd("encoder", "climb.") - 0.2, T.zero - 0.2, 0.3),
    });
    text(ctx, "a quarter turn up reads 0.25", TOOL.x + 30, TOOL.y + 520, {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.accent,
      a: easeOut(ramp(t, Wd("encoder", "point") - 0.2, 0.4)),
    });
    ctx.restore();
  }

  // rec · link: TalonFX 31 → Configs → Feedback
  function recLink(ctx, t) {
    const a = window_(t, L("link").t0 + 0.3, L("voltage").t0 - 0.05, 0.3);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const kId = Wd("link", "ID,") - 0.4;
    const kSrc = Wd("link", "remote") - 0.2;
    drawToolWindow(ctx, TOOL, {
      app: "Tuner X",
      title: "TalonFX 31 · Configs · Feedback",
      rowH: 84,
      rows: [
        {
          label: "Feedback Remote Sensor ID",
          value: t >= kId ? "32" : "0",
          hot: t >= kId - 0.3 && t < kSrc - 0.2,
        },
        {
          label: "Feedback Sensor Source",
          value: t >= kSrc ? "RemoteCANcoder" : "RotorSensor",
          hot: t >= kSrc - 0.2,
        },
        {
          label: "Sensor To Mechanism Ratio",
          value: "1",
          note: "leave it at 1",
        },
      ],
    });
    text(
      ctx,
      "the motor's position now comes from encoder 32",
      TOOL.x + 30,
      TOOL.y + 380,
      {
        font: MONO,
        size: 21,
        color: C.accent,
        a: easeOut(ramp(t, kSrc + 0.4, 0.4)),
      }
    );
    ctx.restore();
  }

  // Control pane: Voltage Out, 1 V, the DISABLED button and the output plot.
  // Used by the voltage and enable lines, the gate, and the direction check.
  function recControl(ctx, s, t, live) {
    const a = live ? 1 : window_(t, L("voltage").t0 - 0.05, T.wrong + 0.2, 0.3);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const picked = live || t >= T.pick - 0.1;
    const volt = live || t >= T.volt;
    drawToolWindow(ctx, TOOL, {
      app: "Tuner X",
      title: "TalonFX 31 · Control",
      rowH: 64,
      rows: [
        {
          label: "Control",
          value: picked ? "Voltage Out" : "—",
          hot: !live && t >= T.pick - 0.3 && t < T.volt - 0.2,
        },
        {
          label: "Output",
          value: volt ? "1 V" : "0 V",
          hot: !live && t >= T.volt - 0.2 && t < Wd("voltage", "sends"),
        },
        { label: "Target", value: "none", note: "" },
      ],
    });
    // "none": no target, no place to stop
    if (!live)
      chip(
        ctx,
        "no target · no place to stop",
        TOOL.x + 300,
        TOOL.y + 70 + 128 + 46,
        {
          a: window_(t, Wd("voltage", "no") - 0.1, L("enable").t0 + 0.4, 0.3),
          size: 19,
        }
      );
    const hot = live
      ? 0
      : window_(t, T.on - 0.4, T.on + 0.5, 0.2) +
        window_(t, T.off - 0.4, T.off + 0.5, 0.2);
    enableButton(ctx, TOOL.x + 30, TOOL.y + 280, s.enabled, {
      hot: clamp(hot),
    });
    // what the motor gets: a flat 1 V from click to click
    const pts = live ? s.hist.map(([u, v]) => [u - s.time, v]) : voltHist(t);
    drawPlot(
      ctx,
      { x: TOOL.x + 300, y: TOOL.y + 260, w: TOOL.w - 324, h: 280 },
      {
        title: "output · last 6 s",
        t0: -6,
        t1: 0,
        v0: 0,
        v1: 1.4,
        series: [{ pts, color: C.accent }],
      }
    );
    if (!live) {
      const k1 =
        easeOut(ramp(t, Wd("enable", "moves") - 0.1, 0.4)) *
        (1 - ramp(t, L("tryit").t0, 0.4));
      const k2 =
        easeOut(ramp(t, Wd("enable", "keeps") - 0.1, 0.4)) *
        (1 - ramp(t, L("tryit").t0, 0.4));
      chip(ctx, "moves the moment you click", 540, 236, { a: k1, size: 20 });
      chip(ctx, "keeps going until you click again", 540, 288, {
        a: k2,
        size: 20,
      });
    }
    ctx.restore();
  }

  // the wrong way, and the fix: invert the motor output, never a negative voltage
  function wrongWay(ctx, t) {
    const a = window_(t, T.wrong - 0.2, L("close").t0 + 0.3, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const kInv = t >= T.invert;
    drawToolWindow(ctx, TOOL, {
      app: "Tuner X",
      title: "TalonFX 31 · Configs · Motor Output",
      rowH: 74,
      rows: [
        {
          label: "Inverted",
          value: kInv ? "Clockwise_Positive" : "CounterClockwise_Positive",
          hot: t >= T.invert - 0.3,
          note: kInv ? "flipped, then apply and run the test again" : "",
        },
      ],
    });
    // the bad fix, struck out
    const kn = easeOut(ramp(t, T.negative - 0.15, 0.4));
    if (kn > 0) {
      ctx.save();
      ctx.globalAlpha *= kn;
      text(ctx, "Output  −1 V", TOOL.x + 30, TOOL.y + 250, {
        font: MONO,
        size: 30,
        weight: 600,
        color: C.err,
      });
      ctx.strokeStyle = C.err;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(TOOL.x + 24, TOOL.y + 240);
      ctx.lineTo(
        TOOL.x + 24 + 250 * easeOut(ramp(t, T.negative + 0.2, 0.4)),
        TOOL.y + 240
      );
      ctx.stroke();
      text(
        ctx,
        "hides the problem in every request you write later",
        TOOL.x + 30,
        TOOL.y + 296,
        { font: MONO, size: 20, color: C.tx2 }
      );
      ctx.restore();
    }
    // the inset: 1 V with the motor the wrong way round; the encoder counts down
    const u = (t - T.wrong + 0.2) % 4;
    const s = wrongRun[clamp(Math.floor(u * RATE), 0, wrongRun.length - 1)];
    const box = { x: TOOL.x, y: 400, w: TOOL.w, h: 450 };
    ctx.globalAlpha *= kInv ? 0.7 : 1;
    panel(ctx, box, C.bg2);
    micro(
      ctx,
      kInv ? "before the fix" : "1 V, wrong way",
      box.x + 24,
      box.y + 40,
      { color: C.err }
    );
    const P = { x: box.x + 230, y: box.y + 220 };
    ctx.save();
    ctx.translate(P.x, P.y);
    ctx.scale(0.8, 0.8);
    ctx.translate(-P.x, -P.y);
    drawStand(ctx, P, P.y + 260);
    drawArmBody(ctx, P, 220, s.rot, { driven: s.volts > 0 });
    ctx.restore();
    text(ctx, "turns clockwise", box.x + 440, box.y + 170, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.err,
    });
    micro(ctx, "CANcoder 32", box.x + 440, box.y + 240);
    text(ctx, `${s.rot.toFixed(3)} rot`, box.x + 440, box.y + 290, {
      font: MONO,
      size: 36,
      weight: 600,
      color: C.err,
    });
    text(ctx, "counting down", box.x + 440, box.y + 330, {
      font: MONO,
      size: 20,
      color: C.err,
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
      "Workshop 1 · Motor Setup & CAN IDs",
      W / 2,
      440 - 20 * (1 - k),
      { align: "center", a: k, color: C.accent }
    );
    text(ctx, "Numbers and First Motion", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Every device has its own number,", W / 2, 440, {
      font: SERIF,
      size: 80,
      align: "center",
    });
    text(ctx, "and positive means the same thing everywhere.", W / 2, 546, {
      font: SERIF,
      size: 80,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "positive") - 0.1, 0.6)),
    });
    text(ctx, "Before any code runs.", W / 2, 654, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "before") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? at(t);
    const history = [];
    if (!live) for (let i = 6; i >= 1; i--) history.push(at(t - i * 0.05).rot);
    else history.push(...live.trail);

    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawReadouts(ctx, s, t, !!live);
    drawBench(ctx, s, t, history, !!live);
    if (!live) {
      drawStrip(ctx, t);
      recReset(ctx, t);
      recBlink(ctx, t);
      recIds(ctx, t);
      recEncoder(ctx, t);
      recLink(ctx, t);
    }
    recControl(ctx, s, t, !!live);
    if (!live) wrongWay(ctx, t);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = { ...fresh(gate.t0), zeroed: true, trail: [], hist: [] };
    let phase = "ready";
    let doneAt = null;
    return {
      state: s,
      prompt: () =>
        ({
          ready: "Click Enable.",
          running: "It won't stop by itself. Disable it.",
          hit: "It reached the end, and it's still pushing. Disable it.",
          stopped: "Stopped. Only the button ends Voltage Out.",
          crashed: "Voltage Out never stops by itself.",
        })[phase],
      input(k, down) {
        if (k !== "toggle" || !down || doneAt !== null) return;
        if (phase === "ready") {
          s.enabled = true;
          phase = "running";
        } else if (phase === "running" || phase === "hit") {
          s.enabled = false;
          phase = phase === "running" ? "stopped" : "crashed";
          doneAt = s.time;
        }
      },
      step(dt) {
        const n = Math.ceil(dt / DT);
        for (let i = 0; i < n; i++) {
          stepArm(s, dt / n);
          s.time += dt / n;
        }
        if (s.hit && phase === "running") phase = "hit";
        s.trail.push(s.rot);
        if (s.trail.length > 6) s.trail.shift();
        s.hist.push([s.time, s.volts]);
        while (s.hist.length && s.hist[0][0] < s.time - 6) s.hist.shift();
        return doneAt !== null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.8) return "Click Enable.";
    if (u < 3.0) return "It won't stop by itself. Disable it.";
    return "Stopped. Only the button ends Voltage Out.";
  }

  return {
    draw,
    liveGate,
    gate,
    gatePromptAt,
    gateControls: [
      { k: "toggle", label: "Enable / Disable", key: "Space", kind: "press" },
    ],
  };
}
