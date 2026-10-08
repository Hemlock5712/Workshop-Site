// Three Parts and a Bus. Workshop 1 opens here: a motor, a sensor, and the bus
// that reaches them from a laptop, with no robot in between.
//
// The top band is the bench as a signal path, and it stays on screen the whole
// video: laptop, USB, CANivore, CAN FD, the motor, the encoder. The lower band
// changes with the narration: a look inside each part, then the Tuner X steps.
// The Tuner X steps (lines marked rec in script.json) are drawn schematically,
// one function per step, so each one can be swapped for real footage later.
//
// No gate: this lesson is a procedure, and the series gives it no "your turn".

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
  drawArmBody,
  drawFlywheel,
  drawStand,
  drawToolWindow,
  panel,
} from "../../engine/kit.js";

const TAU = 2 * Math.PI;

// ---- layout: the signal path (top band) -----------------------------------------------

const LAPTOP = { x: 110, y: 200, w: 220, h: 140 };
const SLOT = { x: 370, y: 96, w: 230, h: 92 }; // the robot controller this workshop does not need
const CANIVORE = { x: 620, y: 240, w: 240, h: 120 };
const MOTOR = { x: 1050, y: 230, w: 330, h: 140 }; // Kraken X44, TalonFX in the back (left end)
const CODER = { x: 1520, y: 246, w: 220, h: 108 };
const BUS_Y = 300;
const LOWER = { x: 110, y: 480, w: 1700, h: 400 };

// where a packet goes: laptop -> USB -> CANivore -> CAN FD -> TalonFX -> CANcoder
const PATH = [
  [LAPTOP.x + LAPTOP.w, BUS_Y],
  [CANIVORE.x, BUS_Y],
  [CANIVORE.x + CANIVORE.w, BUS_Y],
  [MOTOR.x, BUS_Y],
  [MOTOR.x + 60, BUS_Y],
  [MOTOR.x + 60, 420],
  [CODER.x + CODER.w / 2, 420],
  [CODER.x + CODER.w / 2, CODER.y + CODER.h],
];

function along(path, k) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(
      path[i][0] - path[i - 1][0],
      path[i][1] - path[i - 1][1]
    );
    segs.push(d);
    total += d;
  }
  let want = clamp(k) * total;
  for (let i = 0; i < segs.length; i++) {
    if (want <= segs[i]) {
      const f = segs[i] ? want / segs[i] : 0;
      return [
        path[i][0] + (path[i + 1][0] - path[i][0]) * f,
        path[i][1] + (path[i + 1][1] - path[i][1]) * f,
      ];
    }
    want -= segs[i];
  }
  return path.at(-1);
}

// hatched cell: a value that belongs to the student, or that the bench does not show
function hatch(ctx, x, y, w, h, color = C.accent) {
  ctx.save();
  rrect(ctx, x, y, w, h, 3);
  ctx.clip();
  ctx.fillStyle = alpha(color, 0.14);
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = alpha(color, 0.5);
  ctx.lineWidth = 2;
  for (let hx = x - h; hx < x + w; hx += 10) {
    ctx.beginPath();
    ctx.moveTo(hx, y + h);
    ctx.lineTo(hx + h, y);
    ctx.stroke();
  }
  ctx.restore();
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
  ctx.fillStyle = alpha(color, 0.14);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, s, x0 + 16, y + 2, { font: MONO, size, weight: 600, color });
  ctx.restore();
}

// A Tuner X device card, reduced to what the lesson reads off it: the colour bar,
// the model, the name, and the firmware. `bar`: "ok" | "err" | "none" | "hatch".
function deviceCard(
  ctx,
  x,
  y,
  w,
  h,
  {
    model,
    name = "",
    fw = "",
    bar = "none",
    note = "",
    a = 1,
    lit = 0,
    off = false,
    nameColor = C.tx,
  } = {}
) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a * (off ? 0.4 : 1);
  rrect(ctx, x, y, w, h, 5);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.strokeStyle = lit ? alpha(C.accent, 0.4 + 0.6 * lit) : C.rule;
  ctx.lineWidth = 2 + 2 * lit;
  ctx.stroke();
  // the status bar down the left edge
  if (bar === "ok" || bar === "err") {
    ctx.fillStyle = bar === "ok" ? C.ok : C.err;
    ctx.fillRect(x + 1, y + 1, 10, h - 2);
  } else if (bar === "hatch") hatch(ctx, x + 1, y + 1, 10, h - 2, C.tx3);
  else {
    ctx.fillStyle = C.bg3;
    ctx.fillRect(x + 1, y + 1, 10, h - 2);
  }
  micro(ctx, model, x + 32, y + 38, { size: 16 });
  text(ctx, name, x + 32, y + 80, {
    font: MONO,
    size: 28,
    weight: 600,
    color: nameColor,
  });
  if (fw)
    text(ctx, fw, x + 32, y + 118, { font: MONO, size: 20, color: C.tx2 });
  if (note)
    text(ctx, note, x + 32, y + h - 22, { font: MONO, size: 18, color: C.tx3 });
  ctx.restore();
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd } = cues(VOICE);

  const T = {
    motor: Wd("intro", "motor,"),
    sensor: Wd("intro", "sensor,"),
    bus: Wd("intro", "bus"),
    laptop: Wd("intro", "laptop."),
    plugs: Wd("bus", "plugs"),
    noRobot: Wd("bus", "no"),
    power: Wd("connect", "Power"),
    usb: Wd("connect", "plug"),
    canUsb: Wd("connect", "CANivore"),
    address: Wd("connect", "address"),
    shows: Wd("name", "shows"),
    rename: Wd("name", "Rename"),
    typed: Wd("name", "canivore,"),
    code: Wd("name", "Every"),
    off: Wd("check", "Power"),
    on: Wd("check", "The"),
  };

  // the CANivore's name, as the top band shows it
  const nameAt = (t) => (t >= T.typed + 0.7 ? "canivore" : "");
  // power to the bench: off during the power cycle in "check"
  const powered = (t) => t >= T.power + 0.2 && !(t >= T.off + 0.4 && t < T.on);
  const usbIn = (t) =>
    t >= T.usb + 0.2 && !(t >= T.off + 0.7 && t < T.on + 0.4);

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 480, z: 1.0 };
  const BAND = { x: 925, y: 300, z: 1.14 };
  const shots = [
    { t: 0, ...BAND, d: 0.01 },
    { t: L("motor").t0 - 0.3, x: 1150, y: 520, z: 1.08, d: 1.2 },
    { t: L("sensor").t0 - 0.2, x: 1150, y: 520, z: 1.08, d: 1.2 },
    { t: L("bus").t0 - 0.2, ...BAND, d: 1.2 },
    { t: L("connect").t0 - 0.3, ...FULL, d: 1.2 },
    { t: L("colors").t0 - 0.2, x: 960, y: 640, z: 1.12, d: 1.2 },
    { t: L("check").t0 - 0.2, ...FULL, d: 1.2 },
  ];

  // ---- the signal path ----------------------------------------------------------

  function drawLaptop(ctx, t, a) {
    const { x, y, w, h } = LAPTOP;
    ctx.save();
    ctx.globalAlpha *= a;
    rrect(ctx, x + 16, y, w - 32, h - 34, 5);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 3;
    ctx.stroke();
    // the screen: Tuner X, as a row of lines
    ctx.fillStyle = alpha(C.tx3, 0.5);
    for (let i = 0; i < 3; i++)
      ctx.fillRect(x + 36, y + 22 + i * 22, 90 + ((i * 37) % 60), 8);
    ctx.beginPath();
    ctx.moveTo(x, y + h - 26);
    ctx.lineTo(x + w, y + h - 26);
    ctx.lineTo(x + w - 14, y + h - 8);
    ctx.lineTo(x + 14, y + h - 8);
    ctx.closePath();
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.stroke();
    text(ctx, "laptop", x + w / 2, y + h + 34, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: C.tx,
    });
    micro(ctx, "Tuner X", x + w / 2, y + h + 64, { align: "center", size: 16 });
    ctx.restore();
  }

  function drawCanivore(ctx, t, a, lit) {
    const { x, y, w, h } = CANIVORE;
    ctx.save();
    ctx.globalAlpha *= a;
    rrect(ctx, x, y, w, h, 8);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = lit ? C.accent : C.tx3;
    ctx.lineWidth = lit ? 4 : 3;
    ctx.stroke();
    micro(ctx, "CANivore", x + 22, y + 38, { size: 17, color: C.tx2 });
    const nm = nameAt(t);
    text(ctx, nm || "·  ·  ·", x + 22, y + 84, {
      font: MONO,
      size: 30,
      weight: 600,
      color: nm ? C.accent : C.tx3,
    });
    // status LED
    ctx.beginPath();
    ctx.arc(x + w - 24, y + 28, 8, 0, TAU);
    ctx.fillStyle = powered(t) && usbIn(t) ? C.ok : C.bg3;
    ctx.fill();
    text(ctx, "USB  →  CAN FD", x + w / 2, y + h + 34, {
      font: MONO,
      size: 18,
      align: "center",
      color: C.tx3,
    });
    ctx.restore();
  }

  function drawMotor(ctx, t, a, lit, rot) {
    const { x, y, w, h } = MOTOR;
    ctx.save();
    ctx.globalAlpha *= a;
    // the controller section at the back
    rrect(ctx, x, y + 10, 92, h - 20, 6);
    ctx.fillStyle = lit ? alpha(C.accent, 0.2) : C.bg3;
    ctx.fill();
    ctx.strokeStyle = lit ? C.accent : C.tx3;
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, "TalonFX", x + 46, y + h / 2 + 7, {
      font: MONO,
      size: 17,
      weight: 600,
      align: "center",
      color: lit ? C.accent : C.tx2,
    });
    // the motor can
    rrect(ctx, x + 92, y, w - 132, h, 10);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.tx3;
    ctx.stroke();
    // fins, sliding as the rotor turns
    ctx.save();
    rrect(ctx, x + 92, y, w - 132, h, 10);
    ctx.clip();
    ctx.strokeStyle = alpha(C.tx3, 0.45);
    ctx.lineWidth = 3;
    const off = ((rot % 1) + 1) % 1;
    for (let i = -1; i < 9; i++) {
      const fy = y + ((i + off) / 8) * h;
      ctx.beginPath();
      ctx.moveTo(x + 104, fy);
      ctx.lineTo(x + w - 52, fy);
      ctx.stroke();
    }
    ctx.restore();
    // shaft
    ctx.fillStyle = C.tx3;
    ctx.fillRect(x + w - 40, y + h / 2 - 9, 40, 18);
    text(ctx, "Kraken X44", x + w / 2 + 30, y + h + 34, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: C.tx,
    });
    micro(ctx, "motor", x + w / 2 + 30, y - 18, { align: "center", size: 16 });
    ctx.restore();
  }

  function drawCoder(ctx, t, a, lit) {
    const { x, y, w, h } = CODER;
    ctx.save();
    ctx.globalAlpha *= a;
    rrect(ctx, x, y, w, h, 8);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = lit ? C.accent : C.tx3;
    ctx.lineWidth = lit ? 4 : 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 56, y + h / 2, 30, 0, TAU);
    ctx.strokeStyle = alpha(C.tx3, 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 56, y + h / 2, 11, 0, TAU);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    text(ctx, "CANcoder", x + 104, y + 50, {
      font: MONO,
      size: 19,
      weight: 600,
      color: C.tx2,
    });
    text(ctx, "absolute", x + 104, y + 78, {
      font: MONO,
      size: 17,
      color: C.tx3,
    });
    text(ctx, "ThroughBore", x + w / 2, y + h + 34, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: C.tx,
    });
    micro(ctx, "sensor · arm only", x + w / 2, y - 18, {
      align: "center",
      size: 16,
    });
    ctx.restore();
  }

  function drawWires(ctx, t, kUsb, kBus) {
    // USB, laptop to CANivore
    const usbLive = usbIn(t);
    ctx.save();
    ctx.lineCap = "round";
    if (kUsb > 0) {
      ctx.globalAlpha = kUsb;
      ctx.strokeStyle = usbLive ? alpha(C.accent, 0.8) : C.rule;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(PATH[0][0], BUS_Y);
      ctx.lineTo(
        PATH[0][0] +
          (PATH[1][0] - PATH[0][0]) * (usbLive || t < T.off ? 1 : 0.55),
        BUS_Y
      );
      ctx.stroke();
      text(ctx, "USB", (PATH[0][0] + PATH[1][0]) / 2, BUS_Y + 34, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: usbLive ? C.accent : C.tx3,
      });
    }
    if (kBus > 0) {
      ctx.globalAlpha = kBus;
      ctx.strokeStyle = powered(t) ? alpha(C.tx2, 0.85) : C.rule;
      ctx.lineWidth = 5;
      ctx.beginPath();
      PATH.slice(2).forEach(([px, py], i) =>
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
      );
      ctx.stroke();
      text(ctx, "CAN FD", (PATH[2][0] + PATH[3][0]) / 2, BUS_Y - 18, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: C.tx2,
      });
    }
    ctx.restore();
  }

  function drawSlot(ctx, t) {
    const k = easeOut(ramp(t, T.noRobot - 0.2, 0.5));
    if (k <= 0) return;
    ctx.save();
    ctx.globalAlpha = k * (1 - 0.6 * ramp(t, L("connect").t0, 1));
    ctx.setLineDash([9, 8]);
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 2.5;
    rrect(ctx, SLOT.x, SLOT.y, SLOT.w, SLOT.h, 6);
    ctx.stroke();
    // the detour a robot would need, never taken
    ctx.beginPath();
    ctx.moveTo(SLOT.x + 30, BUS_Y - 6);
    ctx.lineTo(SLOT.x + 30, SLOT.y + SLOT.h);
    ctx.moveTo(SLOT.x + SLOT.w - 30, SLOT.y + SLOT.h);
    ctx.lineTo(SLOT.x + SLOT.w - 30, BUS_Y - 6);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "robot controller", SLOT.x + SLOT.w / 2, SLOT.y + 40, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.tx3,
    });
    text(ctx, "not needed", SLOT.x + SLOT.w / 2, SLOT.y + 70, {
      font: MONO,
      size: 18,
      align: "center",
      color: C.tx3,
    });
    ctx.restore();
  }

  function drawPackets(ctx, t) {
    const t0 = T.plugs;
    const t1 = L("bus").t1 + 0.4;
    if (t < t0 || t > t1) return;
    const period = 1.6;
    for (let n = 0; n < 4; n++) {
      const u = (t - t0 - n * (period / 2)) / period;
      if (u < 0 || t - t0 - n * (period / 2) > t1 - t0) continue;
      const k = u % 1;
      const [px, py] = along(PATH, easeInOut(k));
      ctx.save();
      ctx.globalAlpha = window_(k, 0, 1, 0.08);
      ctx.fillStyle = C.accent;
      rrect(ctx, px - 11, py - 11, 22, 22, 4);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawPath(ctx, t) {
    const kMotor = easeOut(ramp(t, T.motor - 0.15, 0.5));
    const kSensor = easeOut(ramp(t, T.sensor - 0.15, 0.5));
    const kBus = easeOut(ramp(t, T.bus - 0.15, 0.5));
    const kLaptop = easeOut(ramp(t, T.laptop - 0.15, 0.5));
    // the lower band takes over from "colors" on; the path steps back a little
    const dim = 1 - 0.45 * window_(t, L("colors").t0 - 0.2, L("check").t0, 0.5);
    ctx.save();
    ctx.globalAlpha = dim;
    drawWires(ctx, t, kLaptop, kBus);
    drawSlot(ctx, t);
    drawLaptop(ctx, t, kLaptop);
    drawCanivore(
      ctx,
      t,
      kBus,
      window_(t, L("name").t0, L("name").t1, 0.3) > 0.5 ||
        window_(t, L("bus").t0, Wd("bus", "devices"), 0.2) > 0.5
    );
    const spin = window_(t, Wd("motor", "runs"), L("motor").t1 + 0.4, 0.3);
    drawMotor(
      ctx,
      t,
      kMotor,
      window_(t, Wd("motor", "controller") - 0.1, L("motor").t1 + 0.3, 0.3) >
        0.5,
      (t - Wd("motor", "runs")) * 1.6 * spin
    );
    drawCoder(
      ctx,
      t,
      kSensor,
      window_(t, L("sensor").t0, Wd("sensor", "flywheel") - 0.2, 0.3) > 0.5
    );
    // the three parts, numbered as the narration lists them
    const n = (s, x, y, at) =>
      micro(ctx, s, x, y, {
        color: C.accent,
        a: window_(t, at - 0.1, L("intro").t1 + 0.6, 0.3),
      });
    n("1", MOTOR.x + MOTOR.w / 2 + 30 - 60, MOTOR.y - 18, T.motor);
    n("2", CODER.x + CODER.w / 2 - 110, CODER.y - 18, T.sensor);
    n("3 · bus", CANIVORE.x + CANIVORE.w / 2 - 42, CANIVORE.y - 18, T.bus);
    drawPackets(ctx, t);
    ctx.restore();
  }

  // ---- lower band: a look inside each part ----------------------------------------

  function motorInside(ctx, t) {
    const a = window_(t, L("motor").t0 - 0.2, L("sensor").t0 - 0.1, 0.4);
    if (a <= 0) return;
    const R = { x: 760, y: 500, w: 1050, h: 380 };
    ctx.save();
    ctx.globalAlpha = a;
    // leader from the motor
    ctx.strokeStyle = alpha(C.accent, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MOTOR.x + 46, MOTOR.y + MOTOR.h + 50);
    ctx.lineTo(MOTOR.x + 46, R.y);
    ctx.stroke();
    panel(ctx, R, C.bg2);
    micro(ctx, "inside the motor", R.x + 28, R.y + 42);
    // 1 · the controller on the back
    const k1 = easeOut(ramp(t, Wd("motor", "controller") - 0.1, 0.5));
    text(ctx, "controller built into the back", R.x + 28, R.y + 104, {
      size: 30,
      weight: 600,
      a: k1,
    });
    // 2 · its own loop, a thousand times a second
    const k2 = easeOut(ramp(t, Wd("motor", "loop") - 0.2, 0.5));
    const cx = R.x + 130;
    const cy = R.y + 240;
    ctx.save();
    ctx.globalAlpha *= k2;
    ctx.beginPath();
    ctx.arc(cx, cy, 64, 0, TAU);
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 6;
    ctx.stroke();
    const ang = (t * 2.2) % 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 64, ang * TAU - 1.1, ang * TAU);
    ctx.strokeStyle = C.accent;
    ctx.stroke();
    text(ctx, "its own loop", cx + 100, cy - 12, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.tx,
    });
    text(ctx, "1000 times a second", cx + 100, cy + 22, {
      font: MONO,
      size: 20,
      color: C.tx2,
    });
    ctx.restore();
    // 3 · it reports its own position
    const k3 = easeOut(ramp(t, Wd("motor", "position,") - 0.2, 0.5));
    const pos = 12.406 + Math.max(0, t - Wd("motor", "runs")) * 1.6;
    ctx.save();
    ctx.globalAlpha *= k3;
    micro(ctx, "reports · position", R.x + 620, R.y + 196);
    text(ctx, `${pos.toFixed(3)} rot`, R.x + 620, R.y + 252, {
      font: MONO,
      size: 44,
      weight: 600,
      color: C.accent,
    });
    ctx.restore();
    chip(ctx, "the motor is a sensor too", R.x + 620, R.y + 330, {
      a: easeOut(ramp(t, Wd("motor", "sensor") - 0.15, 0.4)),
      size: 22,
    });
    ctx.restore();
  }

  function sensorInside(ctx, t) {
    const a = window_(t, L("sensor").t0 - 0.1, L("bus").t0 + 0.2, 0.4);
    if (a <= 0) return;
    const R = { x: 760, y: 500, w: 1050, h: 380 };
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = alpha(C.accent, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CODER.x + CODER.w / 2, CODER.y + CODER.h + 50);
    ctx.lineTo(CODER.x + CODER.w / 2, R.y);
    ctx.stroke();
    panel(ctx, R, C.bg2);
    micro(ctx, "the arm's absolute encoder", R.x + 28, R.y + 42);
    // a small arm on its stand, the encoder at the pivot
    const P = { x: R.x + 220, y: R.y + 200 };
    const offK = window_(
      t,
      Wd("sensor", "power's") - 0.1,
      Wd("sensor", "week.") + 0.45,
      0.25
    );
    ctx.save();
    ctx.globalAlpha *= 1 - 0.55 * offK;
    drawStand(ctx, P, R.y + 340);
    drawArmBody(ctx, P, 130, 0.125, {});
    ctx.restore();
    ctx.beginPath();
    ctx.arc(P.x, P.y, 50, 0, TAU);
    ctx.strokeStyle = offK > 0.5 ? C.rule : C.accent;
    ctx.lineWidth = 4;
    ctx.stroke();
    // its reading
    micro(ctx, "CANcoder · position", R.x + 470, R.y + 130);
    if (offK > 0.5) {
      text(ctx, "power off", R.x + 470, R.y + 190, {
        font: MONO,
        size: 44,
        weight: 600,
        color: C.tx3,
      });
      text(ctx, "all week", R.x + 470, R.y + 232, {
        font: MONO,
        size: 22,
        color: C.tx3,
      });
    } else {
      text(ctx, "0.125 rot", R.x + 470, R.y + 190, {
        font: MONO,
        size: 44,
        weight: 600,
        color: C.accent,
      });
      const back = t > Wd("sensor", "week.");
      text(
        ctx,
        back ? "the same angle, power back on" : "absolute: it knows the angle",
        R.x + 470,
        R.y + 232,
        { font: MONO, size: 22, color: back ? C.accent : C.tx2 }
      );
    }
    // the flywheel has no encoder
    const kf = easeOut(ramp(t, Wd("sensor", "flywheel") - 0.15, 0.5));
    if (kf > 0) {
      ctx.save();
      ctx.globalAlpha *= kf;
      ctx.translate(R.x + 900, R.y + 170);
      ctx.scale(0.42, 0.42);
      drawFlywheel(ctx, { x: 0, y: 0 }, 120, t * 0.6, {});
      ctx.restore();
      text(ctx, "flywheel", R.x + 900, R.y + 310, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.tx2,
        a: kf,
      });
      text(ctx, "no CANcoder", R.x + 900, R.y + 340, {
        font: MONO,
        size: 18,
        align: "center",
        color: C.tx3,
        a: kf,
      });
    }
    ctx.restore();
  }

  function busCaption(ctx, t) {
    const a = window_(t, L("bus").t0, L("connect").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const steps = ["laptop", "USB", "CANivore", "CAN FD", "motor + encoder"];
    let x = 250;
    const y = 500;
    steps.forEach((s, i) => {
      const k = easeOut(ramp(t, T.plugs + i * 0.25, 0.4));
      text(ctx, s, x, y, {
        font: MONO,
        size: 26,
        weight: 600,
        color: i === 2 ? C.accent : C.tx,
        a: k,
      });
      ctx.font = `600 26px ${MONO}`;
      x += ctx.measureText(s).width + 26;
      if (i < steps.length - 1) {
        text(ctx, "→", x, y, { font: MONO, size: 26, color: C.tx3, a: k });
        x += 52;
      }
    });
    chip(ctx, "no robot in between · start right now", 250, 575, {
      a: easeOut(ramp(t, T.noRobot, 0.5)),
      size: 24,
    });
    ctx.restore();
  }

  // ---- lower band: the Tuner X steps (rec) ------------------------------------------
  // Each rec line is one self-contained function, to be replaced by footage later.

  const TOOL = { x: 760, y: 490, w: 1050, h: 400 };

  // rec · connect: power first, then USB; CANivore USB on; Team # or IP = localhost
  function recConnect(ctx, t) {
    const a = window_(t, L("connect").t0 - 0.2, L("name").t0 - 0.1, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    // the hardware order, left of the window
    const step = (n, s, at, y) => {
      const on = t >= at;
      rrect(ctx, 110, y, 600, 84, 5);
      ctx.fillStyle = on ? alpha(C.accent, 0.12) : C.bg2;
      ctx.fill();
      ctx.strokeStyle = on ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, n, 146, y + 54, {
        font: MONO,
        size: 30,
        weight: 600,
        color: on ? C.accent : C.tx3,
      });
      text(ctx, s, 196, y + 53, {
        size: 28,
        weight: 600,
        color: on ? C.tx : C.tx3,
      });
    };
    step("1", "power the mechanism", T.power, 520);
    step("2", "then plug in the USB", T.usb, 624);
    micro(ctx, "in that order", 110, 760);
    // Tuner X
    const typed = "localhost".slice(
      0,
      Math.floor(clamp((t - Wd("connect", "localhost.") + 0.2) / 0.6) * 9)
    );
    const onUsb = t >= T.canUsb + 0.2;
    drawToolWindow(ctx, TOOL, {
      app: "Tuner X",
      title: "Connection",
      rowH: 92,
      rows: [
        {
          label: "CANivore USB",
          value: onUsb ? "☑  on" : "☐  off",
          hot: t >= T.canUsb - 0.2 && t < T.address - 0.2,
        },
        {
          label: "Team # or IP",
          value: typed || " ",
          hot: t >= T.address - 0.2,
          note: "not a team number: there's no robot to find",
        },
      ],
    });
    // a text cursor in the field while it's typed
    if (t >= T.address - 0.2 && Math.floor(t * 2.5) % 2 === 0) {
      ctx.fillStyle = C.accent;
      ctx.fillRect(TOOL.x + TOOL.w - 22, TOOL.y + 70 + 92 + 18, 3, 30);
    }
    ctx.restore();
  }

  // rec · name: the CANivore card appears; rename it canivore
  function recName(ctx, t) {
    const a = window_(t, L("name").t0 - 0.2, L("firmware").t0 - 0.1, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    drawToolWindow(ctx, TOOL, { app: "Tuner X", title: "Devices" });
    const shown = easeOut(ramp(t, T.shows - 0.3, 0.5));
    // the name field: a staged old name, cleared, then typed in lowercase
    const old = "CANivore-bench";
    let name = old;
    if (t >= T.rename)
      name = old.slice(
        0,
        Math.max(0, old.length - Math.floor((t - T.rename) / 0.03))
      );
    if (t >= T.typed - 0.1)
      name = "canivore".slice(
        0,
        Math.floor(clamp((t - T.typed + 0.1) / 0.7) * 8)
      );
    const editing = t >= T.rename - 0.2 && t < T.typed + 1.2;
    deviceCard(ctx, TOOL.x + 40, TOOL.y + 80, 520, 200, {
      model: "CANivore",
      name: name || " ",
      fw: "",
      bar: "ok",
      a: shown,
      lit: editing ? 1 : 0,
      nameColor: t >= T.typed ? C.accent : C.tx,
    });
    if (editing && Math.floor(t * 2.5) % 2 === 0) {
      ctx.font = `600 28px ${MONO}`;
      ctx.fillStyle = C.accent;
      ctx.fillRect(
        TOOL.x + 72 + ctx.measureText(name).width + 3,
        TOOL.y + 80 + 54,
        3,
        32
      );
    }
    micro(ctx, "name", TOOL.x + 72, TOOL.y + 80 + 120, { size: 16, a: shown });
    text(ctx, "all lowercase", TOOL.x + 72, TOOL.y + 80 + 160, {
      font: MONO,
      size: 20,
      color: C.accent,
      a: easeOut(ramp(t, Wd("name", "lowercase.") - 0.1, 0.4)),
    });
    // the callout: the code will ask for this exact string
    const kc = easeOut(ramp(t, T.code - 0.1, 0.5));
    if (kc > 0) {
      ctx.save();
      ctx.globalAlpha *= kc;
      ctx.strokeStyle = alpha(C.accent, 0.6);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(TOOL.x + 560, TOOL.y + 180);
      ctx.lineTo(TOOL.x + 640, TOOL.y + 180);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      chip(ctx, "same name in code later", TOOL.x + 650, TOOL.y + 190, {
        a: kc,
        size: 22,
      });
      text(ctx, "spelled exactly the same", TOOL.x + 650, TOOL.y + 246, {
        font: MONO,
        size: 20,
        color: C.tx2,
        a: easeOut(ramp(t, Wd("name", "spell") - 0.1, 0.4)),
      });
    }
    ctx.restore();
  }

  // rec · firmware: old firmware connects, then fails on and off; batch update to one version
  function recFirmware(ctx, t) {
    const a = window_(t, L("firmware").t0 - 0.2, L("colors").t0 - 0.1, 0.35);
    if (a <= 0) return;
    const tBatch = Wd("firmware", "Put");
    ctx.save();
    ctx.globalAlpha = a;
    drawToolWindow(ctx, TOOL, { app: "Tuner X", title: "Devices · firmware" });
    const devs = [
      { model: "CANivore", name: "canivore", old: false },
      { model: "TalonFX", name: "TalonFX", old: true },
      { model: "CANcoder", name: "CANcoder", old: true },
    ];
    devs.forEach((d, i) => {
      const x = TOOL.x + 30 + i * 335;
      const y = TOOL.y + 70;
      const k = clamp((t - tBatch - 0.3 - i * 0.12) / 1.0);
      const done = !d.old || k >= 1;
      deviceCard(ctx, x, y, 315, 190, {
        model: d.model,
        name: d.name,
        fw: done ? "firmware · latest" : "firmware · older",
        bar: done ? "ok" : "none",
        lit: d.old && t >= tBatch && k < 1 ? 1 : 0,
      });
      // progress while it flashes
      if (d.old && t >= tBatch) {
        ctx.fillStyle = C.bg3;
        ctx.fillRect(x + 32, y + 150, 250, 10);
        ctx.fillStyle = C.accent;
        ctx.fillRect(x + 32, y + 150, 250 * easeInOut(k), 10);
      }
      // "connected" is not "working": the old ones fail now and then
      if (d.old && t >= Wd("firmware", "fails") - 0.1 && t < tBatch) {
        const flick =
          Math.floor((t - Wd("firmware", "fails")) * 3 + i * 1.7) % 3 === 0;
        if (flick)
          chip(
            ctx,
            i === 1 ? "config refused" : "signal unreadable",
            x + 20,
            y + 240,
            { color: C.err, size: 18 }
          );
        else
          text(ctx, "connected", x + 36, y + 240, {
            font: MONO,
            size: 18,
            color: C.tx3,
          });
      }
    });
    // the batch update control
    const hot = t >= tBatch - 0.2;
    const bx = TOOL.x + 30;
    const by = TOOL.y + TOOL.h - 78;
    rrect(ctx, bx, by, 290, 54, 4);
    ctx.fillStyle = hot ? C.accent : C.bg3;
    ctx.fill();
    // an update glyph: an arrow into a tray
    const ink = hot ? C.accentInk : C.tx;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + 34, by + 12);
    ctx.lineTo(bx + 34, by + 34);
    ctx.moveTo(bx + 25, by + 26);
    ctx.lineTo(bx + 34, by + 35);
    ctx.lineTo(bx + 43, by + 26);
    ctx.moveTo(bx + 20, by + 42);
    ctx.lineTo(bx + 48, by + 42);
    ctx.stroke();
    text(ctx, "batch update", bx + 64, by + 35, {
      font: SANS,
      size: 21,
      weight: 600,
      color: ink,
    });
    text(ctx, "every device on the same version", bx + 320, by + 36, {
      font: MONO,
      size: 20,
      color: C.accent,
      a: easeOut(ramp(t, Wd("firmware", "same") - 0.1, 0.4)),
    });
    ctx.restore();
  }

  // still strip: the five card colours (only green is produced live on the bench)
  function colorStrip(ctx, t) {
    const a = window_(t, L("colors").t0 - 0.2, L("check").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    micro(ctx, "Tuner X · device card colour", 110, 500);
    const cards = [
      { c: "Green", m: "current", bar: "ok", at: Wd("colors", "Green") },
      {
        c: "Yellow",
        m: "update available",
        bar: "hatch",
        at: Wd("colors", "Yellow"),
      },
      { c: "Purple", m: "unexpected or beta", bar: "hatch", at: null },
      {
        c: "Red",
        m: "two devices share an ID",
        bar: "err",
        at: Wd("colors", "Red"),
      },
      { c: "Blue", m: "couldn't fetch the list", bar: "hatch", at: null },
    ];
    cards.forEach((cd, i) => {
      const x = 110 + i * 342;
      const y = 530;
      const on = cd.at != null && t >= cd.at - 0.1;
      const k = on ? easeOut(ramp(t, cd.at - 0.1, 0.4)) : 0;
      ctx.save();
      ctx.globalAlpha *= cd.at == null ? 0.5 : 0.55 + 0.45 * k;
      rrect(ctx, x, y, 318, 250, 5);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = on
        ? cd.bar === "err"
          ? C.err
          : cd.bar === "ok"
            ? C.ok
            : C.tx2
        : C.rule;
      ctx.lineWidth = on ? 3 : 2;
      ctx.stroke();
      if (cd.bar === "ok" || cd.bar === "err") {
        ctx.fillStyle = cd.bar === "ok" ? C.ok : C.err;
        ctx.fillRect(x + 1, y + 1, 316, 16);
      } else hatch(ctx, x + 1, y + 1, 316, 16, C.tx3);
      text(ctx, cd.c, x + 26, y + 92, {
        font: SERIF,
        size: 46,
        color: cd.bar === "err" ? C.err : cd.bar === "ok" ? C.ok : C.tx,
      });
      text(ctx, cd.m, x + 26, y + 140, { font: MONO, size: 19, color: C.tx2 });
      ctx.restore();
    });
    chip(ctx, "next lesson · Motor Setup", 110 + 3 * 342 + 22, 760, {
      a: easeOut(ramp(t, Wd("colors", "next") - 0.15, 0.4)),
      color: C.err,
      size: 20,
    });
    text(
      ctx,
      "only green shows on a healthy bench; the others are the page's table",
      110,
      860,
      { font: MONO, size: 18, color: C.tx3 }
    );
    ctx.restore();
  }

  // rec · check: power cycle; the name and firmware come back from the devices
  function recCheck(ctx, t) {
    const a = window_(t, L("check").t0 - 0.2, L("close").t0 + 0.3, 0.35);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const off = !powered(t) || !usbIn(t);
    // left: the power cycle, as two switches
    const sw = (label, on, y) => {
      rrect(ctx, 110, y, 600, 84, 5);
      ctx.fillStyle = on ? C.bg2 : alpha(C.err, 0.1);
      ctx.fill();
      ctx.strokeStyle = on ? C.rule : C.err;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, label, 146, y + 53, {
        size: 28,
        weight: 600,
        color: on ? C.tx : C.err,
      });
      text(ctx, on ? "on" : "off", 680, y + 53, {
        font: MONO,
        size: 26,
        weight: 600,
        align: "right",
        color: on ? C.ok : C.err,
      });
    };
    sw("battery", powered(t), 520);
    sw("USB", usbIn(t), 624);
    micro(ctx, "power cycle everything", 110, 760);
    drawToolWindow(ctx, TOOL, { app: "Tuner X", title: "Devices" });
    const devs = [
      ["CANivore", "canivore"],
      ["TalonFX", "TalonFX"],
      ["CANcoder", "CANcoder"],
    ];
    devs.forEach(([model, name], i) => {
      const x = TOOL.x + 30 + i * 335;
      deviceCard(ctx, x, TOOL.y + 70, 315, 190, {
        model,
        name: off ? "—" : name,
        fw: off ? "not connected" : "firmware · latest",
        bar: off ? "none" : "ok",
        off,
        nameColor: i === 0 && !off ? C.accent : C.tx,
      });
    });
    const k1 = easeOut(ramp(t, Wd("check", "name") - 0.1, 0.4));
    const k2 = easeOut(ramp(t, Wd("check", "firmware") - 0.1, 0.4));
    chip(ctx, "name ✓", TOOL.x + 30, TOOL.y + 330, {
      a: off ? 0 : k1,
      size: 22,
    });
    chip(ctx, "firmware ✓", TOOL.x + 210, TOOL.y + 330, {
      a: off ? 0 : k2,
      size: 22,
    });
    text(ctx, "they live on the devices", TOOL.x + 460, TOOL.y + 330, {
      font: MONO,
      size: 22,
      color: C.tx2,
      a: off ? 0 : easeOut(ramp(t, Wd("check", "live") - 0.1, 0.4)),
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
    micro(ctx, "Workshop 1 · Hardware Setup", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Three Parts and a Bus", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Three parts, one bus,", W / 2, 450, {
      font: SERIF,
      size: 88,
      align: "center",
    });
    text(ctx, "and a name that matches the code.", W / 2, 556, {
      font: SERIF,
      size: 88,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "and") - 0.1, 0.6)),
    });
    text(ctx, "canivore", W / 2, 672, {
      font: MONO,
      size: 36,
      weight: 600,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "code.") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t) {
    background(ctx);
    ctx.save();
    applyCamera(ctx, camera(shots, t));
    drawPath(ctx, t);
    motorInside(ctx, t);
    sensorInside(ctx, t);
    busCaption(ctx, t);
    recConnect(ctx, t);
    recName(ctx, t);
    recFirmware(ctx, t);
    colorStrip(ctx, t);
    recCheck(ctx, t);
    ctx.restore();
    vignette(ctx);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  return { draw, gate: undefined, gatePromptAt: () => null };
}
