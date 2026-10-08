// The Latched Request. Requests, the code we wrote, press, release, stop.
//
// Three things are on screen the whole time and each one is live:
//   the controller   what the driver is pressing
//   the code         which lines are running right now, lit as they run
//   the TalonFX      the request sitting on the motor, and what it outputs
// A command that ends sends nothing, so the TalonFX card keeps its last
// request until something replaces it. That is the whole lesson.

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

// ---- layout ------------------------------------------------------------------------

const PAD = { x: 60, y: 70, w: 440, h: 270 }; // controller
const TALON = { x: 60, y: 600, w: 440, h: 250 };
const PIVOT = { x: 770, y: 400 };
const ARM_LEN = 230;
const CODE = { x: 1040, y: 60, w: 820, h: 790 };
const LH = 29; // code line height; blank lines take half

// ---- physics ----------------------------------------------------------------------

// theta = 0 hangs down. Driven, the motor's back-EMF damps hard; in coast it is
// nearly free, so it swings and settles.
const PHYS = { kV: 2.6, bDriven: 4, bCoast: 0.85, g: 12 };
const VISUAL_LOOP = 0.13; // one drawn pulse per this many seconds; the real loop is 20 ms
const DT = 1 / 960;

function stepArm(s, volts, dt) {
  const b = volts !== 0 ? PHYS.bDriven : PHYS.bCoast;
  s.omega += (PHYS.kV * volts - b * s.omega - PHYS.g * Math.sin(s.theta)) * dt;
  s.theta += s.omega * dt;
}

// The scheduler and the motor controller. Note what is missing: nothing clears
// `request` when a command ends.
function control(s) {
  if (s.trigger) s.cmd = "runFast";
  else if (s.cmd === "runFast") {
    s.cmd = s.fixed ? "stop" : null;
    s.endedAt = s.time;
  }
  if (s.cmd === "runFast") s.request = "VoltageOut 6.0 V";
  if (s.cmd === "stop") s.request = "NeutralOut";
  s.volts = s.enabled && s.request === "VoltageOut 6.0 V" ? 6 : 0;
  return s.volts;
}

const fresh = (fixed = false, time = 0) => ({
  time,
  theta: 0,
  omega: 0,
  trigger: false,
  enabled: true,
  cmd: null,
  request: null,
  volts: 0,
  fixed,
  endedAt: -1,
  restartedAt: time,
});

// ---- the code on screen -------------------------------------------------------------

const TELEOP = [
  { s: "public MyTeleop(Robot robot) {" },
  { s: "  driver.leftTrigger()" },
  { s: "      .whileTrue(robot.arm.runFast())", on: (s) => s.trigger },
  {
    s: "      .whileFalse(robot.arm.stop());",
    on: (s) => s.fixed && !s.trigger && s.cmd === "stop",
    fix: true,
  },
  { s: "}" },
];
const ARM = [
  { s: "public Command runFast() {", on: (s) => s.cmd === "runFast" },
  {
    s: "  return runRepeatedly(() -> setVoltage(6.0))",
    on: (s) => s.cmd === "runFast",
    loop: true,
  },
  { s: '      .named("runFast (hold)");' },
  { s: "}" },
  { s: "" },
  { s: "public Command stop() {", on: (s) => s.cmd === "stop", stop: true },
  {
    s: "  return runRepeatedly(() -> stopMotor())",
    on: (s) => s.cmd === "stop",
    loop: true,
    stop: true,
  },
  { s: '      .named("stop (hold)");', stop: true },
  { s: "}", stop: true },
  { s: "" },
  {
    s: "private void setVoltage(double voltage) {",
    on: (s) => s.cmd === "runFast",
  },
  {
    s: "  motor.setControl(voltageOut.withOutput(voltage));",
    on: (s) => s.cmd === "runFast",
    loop: true,
    send: true,
  },
  { s: "}" },
  { s: "" },
  { s: "private void stopMotor() {", on: (s) => s.cmd === "stop", stop: true },
  {
    s: "  motor.stopMotor();",
    on: (s) => s.cmd === "stop",
    loop: true,
    send: true,
    stop: true,
    ctre: true,
  },
  { s: "}", stop: true },
];
const TELEOP_Y = CODE.y + 136;
const ARM_Y = CODE.y + 338;
const KEYWORD = /^(public|private|return|void|double)$/;

function codeLine(ctx, s, x, y, a = 1) {
  // tiny highlighter: keywords dim, strings soft, the rest plain
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `500 21px ${MONO}`;
  const parts = s.split(/("[^"]*"|\b(?:public|private|return|void|double)\b)/);
  let cx = x;
  for (const p of parts) {
    if (!p) continue;
    ctx.fillStyle = p.startsWith('"') ? C.tx2 : KEYWORD.test(p) ? C.tx3 : C.tx;
    ctx.fillText(p, cx, y);
    cx += ctx.measureText(p).width;
  }
  ctx.restore();
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const tTyped = L("fix").t0 + 3.2; // when the whileFalse line starts typing

  const events = [
    { t: Wd("press", "Press") + 0.35, do: (s) => (s.trigger = true) },
    { t: Wd("release", "go.") + 0.05, do: (s) => (s.trigger = false) },
    { t: L("why").t1 + 0.4, do: (s) => (s.enabled = false) },
    // the gate, played for you when nobody is there to press
    { t: gate.t0, do: (s) => Object.assign(s, fresh(false, s.time)) },
    { t: gate.t0 + 0.9, do: (s) => (s.trigger = true) },
    { t: gate.t0 + 2.6, do: (s) => (s.trigger = false) },
    { t: gate.t0 + 5.9, do: (s) => (s.enabled = false) },
    // edit the binding, restart, run it again
    { t: tTyped + 1.4, do: (s) => Object.assign(s, fresh(true, s.time)) },
    { t: Wd("demo1", "Hold") + 0.2, do: (s) => (s.trigger = true) },
    { t: Wd("demo1", "go.") + 0.05, do: (s) => (s.trigger = false) },
  ].sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = [];
  {
    const s = fresh();
    let e = 0;
    for (let i = 0, n = Math.ceil(VOICE.duration * RATE) + 2; i < n; i++) {
      while (s.time < i / RATE) {
        while (e < events.length && events[e].t <= s.time) events[e++].do(s);
        stepArm(s, control(s), DT);
        s.time += DT;
      }
      samples.push({ ...s });
    }
  }
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 480, z: 1.04 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("code").t0 - 0.4, x: 1330, y: 420, z: 1.22, d: 1.2 },
    { t: L("press").t0 - 0.3, ...FULL, d: 1.2 },
    { t: L("why").t0, x: 420, y: 560, z: 1.4, d: 1.2 },
    { t: L("tryit").t0, ...FULL, d: 1.0 },
    { t: L("fix").t0 - 0.2, x: 1330, y: 260, z: 1.45, d: 1.2 },
    { t: L("stopmotor").t0 - 0.2, x: 1330, y: 690, z: 1.4, d: 1.2 },
    { t: L("demo1").t0 - 0.3, ...FULL, d: 1.2 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawController(ctx, s) {
    const { x, y, w, h } = PAD;
    const cx = x + w / 2;
    micro(ctx, "driver · port 0", x, y - 18);
    // triggers first, so the body sits over them
    const trig = (tx, held, label) => {
      const dy = held ? 10 : 0;
      rrect(ctx, tx, y + 8 + dy, 86, 46, 10);
      ctx.fillStyle = held ? C.accent : C.bg3;
      ctx.fill();
      ctx.strokeStyle = held ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, label, tx + 43, y + 38 + dy, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: held ? C.accentInk : C.tx3,
      });
    };
    trig(x + 58, s.trigger, "LT");
    trig(x + w - 144, false, "RT");
    // body: two grips joined across the top
    ctx.beginPath();
    ctx.moveTo(x + 70, y + 70);
    ctx.bezierCurveTo(x + 150, y + 52, x + w - 150, y + 52, x + w - 70, y + 70);
    ctx.bezierCurveTo(
      x + w - 10,
      y + 90,
      x + w + 10,
      y + 230,
      x + w - 40,
      y + h - 6
    );
    ctx.bezierCurveTo(
      x + w - 80,
      y + h + 10,
      x + w - 120,
      y + 230,
      x + w - 150,
      y + 200
    );
    ctx.lineTo(x + 150, y + 200);
    ctx.bezierCurveTo(x + 120, y + 230, x + 80, y + h + 10, x + 40, y + h - 6);
    ctx.bezierCurveTo(x - 10, y + 230, x + 10, y + 90, x + 70, y + 70);
    ctx.closePath();
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = s.trigger ? alpha(C.accent, 0.7) : C.rule;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    const ring = (px, py, r) => {
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = C.bg3;
      ctx.fill();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    ring(x + 120, y + 120, 30);
    ring(x + w - 175, y + 175, 30);
    ctx.fillStyle = C.bg3;
    ctx.fillRect(x + 160, y + 165, 50, 16);
    ctx.fillRect(x + 177, y + 148, 16, 50);
    [
      ["Y", 0, -28],
      ["X", -28, 0],
      ["B", 28, 0],
      ["A", 0, 28],
    ].forEach(([l, dx, dy]) => {
      ring(x + w - 110 + dx, y + 120 + dy, 15);
      text(ctx, l, x + w - 110 + dx, y + 126 + dy, {
        font: MONO,
        size: 15,
        weight: 600,
        align: "center",
        color: C.tx3,
      });
    });
    ring(cx, y + 104, 14);
    text(
      ctx,
      s.trigger ? "left trigger held" : "left trigger up",
      cx,
      y + h + 44,
      {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: s.trigger ? C.accent : C.tx3,
      }
    );
  }

  function drawTalon(ctx, s, t) {
    const { x, y, w, h } = TALON;
    rrect(ctx, x, y, w, h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    const lit = window_(t, L("why").t0 + 0.2, L("why").t1 + 0.3, 0.4);
    ctx.strokeStyle = lit ? alpha(C.accent, 0.35 + 0.65 * lit) : C.rule;
    ctx.lineWidth = 2 + 2 * lit;
    ctx.stroke();
    micro(ctx, "TalonFX 31 · motor controller", x + 24, y + 40, { size: 16 });
    const led = !s.enabled
      ? Math.floor(t * 2) % 2
        ? C.err
        : alpha(C.err, 0.25)
      : s.volts
        ? C.accent
        : C.tx3;
    ctx.beginPath();
    ctx.arc(x + w - 30, y + 34, 9, 0, Math.PI * 2);
    ctx.fillStyle = led;
    ctx.fill();
    micro(ctx, "request on the motor", x + 24, y + 92);
    const r = s.request;
    text(ctx, r ?? "none", x + 24, y + 140, {
      font: MONO,
      size: 34,
      weight: 600,
      color: r === "VoltageOut 6.0 V" ? C.accent : r ? C.tx : C.tx3,
    });
    ctx.fillStyle = C.rule;
    ctx.fillRect(x + 24, y + 168, w - 48, 1);
    text(
      ctx,
      !s.enabled ? "disabled · output cut" : `output ${s.volts.toFixed(1)} V`,
      x + 24,
      y + 214,
      {
        font: MONO,
        size: 24,
        weight: 500,
        color: !s.enabled ? C.err : s.volts ? C.tx : C.tx3,
      }
    );

    // power leads to the motor
    ctx.strokeStyle = s.volts ? alpha(C.accent, 0.85) : C.rule;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + w, y + 70);
    ctx.bezierCurveTo(
      x + w + 120,
      y + 70,
      PIVOT.x - 40,
      PIVOT.y + 220,
      PIVOT.x,
      PIVOT.y + 44
    );
    ctx.stroke();
  }

  function drawArm(ctx, s, history) {
    ctx.fillStyle = C.bg3;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PIVOT.x - 26, PIVOT.y);
    ctx.lineTo(PIVOT.x - 70, 790);
    ctx.lineTo(PIVOT.x + 70, 790);
    ctx.lineTo(PIVOT.x + 26, PIVOT.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.rule;
    ctx.fillRect(PIVOT.x - 170, 790, 340, 10);
    for (const [k, th] of history.entries()) {
      ctx.save();
      ctx.translate(PIVOT.x, PIVOT.y);
      ctx.rotate(th);
      ctx.globalAlpha = 0.06 + k * 0.035;
      ctx.fillStyle = C.accent;
      rrect(ctx, -16, 0, 32, ARM_LEN, 16);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(PIVOT.x, PIVOT.y);
    ctx.rotate(s.theta);
    ctx.fillStyle = C.tx2;
    rrect(ctx, -17, -17, 34, ARM_LEN + 17, 17);
    ctx.fill();
    ctx.fillStyle = C.bg3;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(0, (ARM_LEN * i) / 5, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(PIVOT.x, PIVOT.y, 44, 0, Math.PI * 2);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = s.volts ? C.accent : C.rule;
    ctx.stroke();
    ctx.save();
    ctx.translate(PIVOT.x, PIVOT.y);
    ctx.rotate(s.theta);
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCode(ctx, s, t, live) {
    const { x, y, w, h } = CODE;
    rrect(ctx, x, y, w, h, 6);
    ctx.fillStyle = "oklch(0.13 0.03 265)";
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // what the scheduler is running, as a header strip
    micro(ctx, "running", x + 28, y + 44);
    text(ctx, s.cmd ? `${s.cmd} (hold)` : "nothing", x + 140, y + 45, {
      font: MONO,
      size: 22,
      weight: 600,
      color: s.cmd ? C.accent : C.tx3,
    });
    if (s.endedAt > 0 && t - s.endedAt < 2.5 && s.cmd !== "runFast") {
      text(ctx, "runFast ended", x + w - 28, y + 45, {
        font: MONO,
        size: 20,
        align: "right",
        color: C.err,
        a: 1 - ramp(t, s.endedAt + 1.5, 1.0),
      });
    }
    ctx.fillStyle = C.rule;
    ctx.fillRect(x, y + 66, w, 1);

    const pulse =
      0.5 + 0.5 * Math.cos(((t % VISUAL_LOOP) / VISUAL_LOOP) * Math.PI * 2);
    const editing = !live && t >= L("fix").t0; // from here on the fix is on screen
    const typed = live ? 0 : clamp((t - tTyped) / 1.2);
    const block = (lines, top, file) => {
      micro(ctx, file, x + 28, top - 40);
      let ly = top - LH;
      lines.forEach((ln) => {
        ly += ln.s ? LH : LH / 2;
        if (!ln.s) return;
        const active = ln.on?.(s);
        if (active) {
          ctx.fillStyle = alpha(C.accent, ln.loop ? 0.1 + 0.12 * pulse : 0.08);
          ctx.fillRect(x + 1, ly - 22, w - 2, LH);
          ctx.fillStyle = C.accent;
          ctx.fillRect(x + 1, ly - 22, 4, LH);
        }
        if (ln.fix) {
          if (!s.fixed && typed <= 0) return;
          codeLine(
            ctx,
            ln.s.slice(0, Math.floor((s.fixed ? 1 : typed) * ln.s.length)),
            x + 28,
            ly
          );
          return;
        }
        codeLine(
          ctx,
          ln.s,
          x + 28,
          ly,
          ln.stop && !s.fixed && !editing ? 0.35 : 1
        );
        if (ln.send && active)
          text(ctx, "→ motor", x + w - 28, ly, {
            font: MONO,
            size: 18,
            weight: 600,
            align: "right",
            color: C.accent,
          });
        // point at CTRE's function while the narration names it
        if (ln.ctre && !live) {
          const k = window_(
            t,
            Wd("stopmotor", "built") - 0.2,
            L("stopmotor").t1,
            0.3
          );
          if (k > 0) {
            ctx.font = `500 21px ${MONO}`;
            const x0 = x + 28 + ctx.measureText("  motor.").width;
            const x1 = x0 + ctx.measureText("stopMotor()").width;
            ctx.strokeStyle = alpha(C.accent, k);
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x0, ly + 7);
            ctx.lineTo(x0 + (x1 - x0) * easeOut(k), ly + 7);
            ctx.stroke();
            text(ctx, "built into CTRE's TalonFX class", x0, ly + 36, {
              font: MONO,
              size: 18,
              color: C.accent,
              a: k,
            });
          }
        }
      });
    };
    block(TELEOP, TELEOP_Y, "MyTeleop.java");
    block(ARM, ARM_Y, "Arm.java");
  }

  function drawChips(ctx, s, t) {
    if (!s.enabled) {
      rrect(ctx, PIVOT.x - 110, 92, 220, 50, 4);
      ctx.fillStyle = alpha(C.err, 0.16);
      ctx.fill();
      ctx.strokeStyle = C.err;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, "DISABLED", PIVOT.x, 127, {
        font: MONO,
        size: 24,
        weight: 600,
        align: "center",
        color: C.err,
        spacing: 3,
      });
    }
    const since = t - s.restartedAt;
    if (s.restartedAt > 0 && since < 2.2) {
      text(
        ctx,
        s.fixed ? "edited · program restarted" : "program restarted",
        PIVOT.x,
        180,
        {
          font: MONO,
          size: 20,
          align: "center",
          color: C.tx2,
          a: window_(since, 0, 2.2, 0.3),
          spacing: 1.5,
        }
      );
    }
    // "keeps spinning": a ring around the arm on the word
    const k = ramp(t, Wd("spins", "spinning.") - 0.05, 0.9);
    if (k > 0 && k < 1) {
      ctx.beginPath();
      ctx.arc(PIVOT.x, PIVOT.y, 60 + easeOut(k) * 240, 0, Math.PI * 2);
      ctx.strokeStyle = alpha(C.accent, 0.8 * (1 - k));
      ctx.lineWidth = 6;
      ctx.stroke();
    }
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
    micro(ctx, "Workshop 3 · Running the Program", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "The Latched Request", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // Requests, and the ones the student already sent from Tuner X.
  function requestsCard(ctx, t) {
    const t1 = L("code").t0 - 0.4;
    if (t < L("intro").t0 - 0.6 || t > t1 + 0.8) return;
    const a = 1 - easeInOut(ramp(t, t1, 0.8));
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    text(ctx, "request", W / 2, 240, {
      font: SERIF,
      size: 104,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("intro", "requests.") - 0.15, 0.6)),
    });
    text(ctx, "what the motor controller should do right now", W / 2, 306, {
      size: 32,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("intro", "tells") - 0.1, 0.6)),
    });

    // the Tuner X control drop-down, reduced to the part that matters
    const px = 560;
    const py = 390;
    const pw = 800;
    ctx.globalAlpha = a * easeOut(ramp(t, L("tuner").t0, 0.6));
    rrect(ctx, px, py, pw, 370, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "Tuner X · Control · request type", px + 30, py + 46);
    ctx.fillStyle = C.rule;
    ctx.fillRect(px, py + 70, pw, 1);
    const rows = [
      {
        name: "Voltage Out",
        what: "a fixed voltage, no target",
        at: Wd("tuner", "Voltage"),
      },
      {
        name: "Motion Magic",
        what: "move to a position",
        at: Wd("tuner", "Motion"),
      },
    ];
    rows.forEach((r, i) => {
      const ry = py + 100 + i * 124;
      const sel = i === 0 && t >= Wd("tunerstop", "Voltage") - 0.1;
      ctx.save();
      ctx.globalAlpha *= easeOut(ramp(t, r.at - 0.15, 0.5));
      rrect(ctx, px + 30, ry, pw - 60, 100, 4);
      ctx.fillStyle = sel ? alpha(C.accent, 0.12) : C.bg;
      ctx.fill();
      ctx.strokeStyle = sel ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, r.name, px + 60, ry + 48, { size: 34, weight: 600 });
      text(ctx, r.what, px + 60, ry + 84, { size: 24, color: C.tx2 });
      ctx.restore();
    });
    // the callback: it kept running
    text(ctx, "kept running until you stopped it", px + pw - 60, py + 150, {
      font: MONO,
      size: 21,
      weight: 600,
      align: "right",
      color: C.accent,
      a: easeOut(ramp(t, Wd("tunerstop", "running") - 0.1, 0.5)),
    });
    ctx.restore();
  }

  function closeCard(ctx, t) {
    const a = easeInOut(ramp(t, L("close").t0 + 0.2, 0.8));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.95);
    ctx.fillRect(0, 0, W, H);
    text(ctx, "A request stays on the motor", W / 2, 440, {
      font: SERIF,
      size: 88,
      align: "center",
    });
    text(ctx, "until something replaces it.", W / 2, 548, {
      font: SERIF,
      size: 88,
      align: "center",
      color: C.accent,
    });
    text(ctx, "When a command ends, decide what replaces it.", W / 2, 660, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "whenever") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? at(t);
    const history = [];
    if (!live)
      for (let i = 6; i >= 1; i--) history.push(at(t - i * 0.035).theta);
    else history.push(...(live.trail ?? []));

    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawCode(ctx, s, t, !!live);
    drawTalon(ctx, s, t);
    drawArm(ctx, s, history);
    drawController(ctx, s);
    drawChips(ctx, s, t);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    requestsCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = { ...fresh(false, gate.t0), trail: [] };
    let phase = "hold";
    let doneAt = null;
    return {
      state: s,
      prompt: () =>
        ({
          hold: "Hold the trigger.",
          letgo: "Now let go.",
          watch: "Still spinning. Press Disable to stop it.",
          done: "The request stayed on the motor.",
        })[phase],
      input(name, down) {
        if (name === "trigger" && s.enabled) {
          s.trigger = down;
          if (down && phase === "hold") phase = "letgo";
          if (!down && phase === "letgo") phase = "watch";
        }
        if (name === "disable" && down && phase === "watch") {
          s.enabled = false;
          phase = "done";
          doneAt = s.time;
        }
      },
      step(dt) {
        const n = Math.ceil(dt / DT);
        for (let i = 0; i < n; i++) {
          stepArm(s, control(s), dt / n);
          s.time += dt / n;
        }
        s.trail.push(s.theta);
        if (s.trail.length > 6) s.trail.shift();
        return doneAt !== null && s.time - doneAt > 2.0;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.9) return "Hold the trigger.";
    if (u < 2.6) return "Now let go.";
    if (u < 5.9) return "Still spinning. Press Disable to stop it.";
    return "The request stayed on the motor.";
  }

  return { draw, liveGate, gate, gatePromptAt };
}
