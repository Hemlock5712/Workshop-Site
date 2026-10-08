// Naming a Target. The latched video in reverse: a request that names a position
// stays on the motor after the command ends, and staying is what holds the arm.
//
// What is simulated, and how:
//   profile   Motion Magic's trapezoid, run on the TalonFX: the setpoint (the ghost
//             arm) speeds up, cruises, slows down. It keeps running after the command
//             ends, because the request is still on the motor.
//   control   gravity feedforward (Arm_Cosine) + velocity feedforward + PD on the
//             setpoint. That stands in for "your gains". Zero gains send 0 V.
//   physics   one rotating arm with gravity and back-EMF damping.
// Angles are rotations on the unit circle: 0 points right, 0.25 straight up.

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
  drawController,
  drawMotorCard,
  drawStand,
  drawTargetMark,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const PAD = { x: 60, y: 70, w: 440, h: 270 };
const CARD = { x: 60, y: 450, w: 440, h: 370 };
const PIVOT = { x: 770, y: 420 };
const ARM_LEN = 220;
const CODE = { x: 1040, y: 60, w: 820, h: 590 };
const PLOT = { x: 1040, y: 670, w: 820, h: 190 };
const LH = 27;
const TARGET = 0.25;
const REST = -0.25; // hanging straight down

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const PHYS = { kM: 2.6, b: 4, g: 12 }; // rad/s^2 per volt, back-EMF damping, gravity at horizontal
const MM = { cruise: 0.5, accel: 1.2 }; // rot/s, rot/s^2
const DT = 1 / 960;

// Motion Magic's trapezoid, stepped: accelerate toward cruise, and start slowing
// down the moment the remaining distance equals the stopping distance.
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

// The volts the TalonFX outputs for a position request. `gains`:
// "tuned" = feedforward + PD, "zero" = the branch as shipped, "hunt" = P only, too high.
function volts(s, gains = "tuned") {
  if (!s.request || gains === "zero") return 0;
  const phi = s.rot * TAU;
  const w = s.w * TAU;
  const e = (s.sp.p - s.rot) * TAU;
  const ev = (s.sp.v - s.w) * TAU;
  let v;
  if (gains === "hunt") v = 30 * e;
  else
    v =
      (PHYS.g * Math.cos(phi) + PHYS.b * s.sp.v * TAU + 0.7 * s.sp.a * TAU) /
        PHYS.kM +
      10 * e +
      3.5 * ev;
  void w;
  return clamp(v, -12, 12);
}

function stepArm(s, v, dt) {
  const phi = s.rot * TAU;
  const acc = PHYS.kM * v - PHYS.g * Math.cos(phi) - PHYS.b * s.w * TAU; // rad/s^2
  s.w += (acc / TAU) * dt;
  s.rot += s.w * dt;
}

// The scheduler and the TalonFX. The command sets the request every loop; when it
// ends, nothing clears the request, so the profile carries on.
function control(s) {
  s.cmd = s.trigger ? "vertical" : null;
  if (s.cmd && !s.request) {
    s.request = { target: TARGET };
    s.moveStart = s.time;
    s.sp = { p: s.rot, v: 0, a: 0 };
  }
  if (s.request) stepProfile(s.sp, s.request.target, DT);
  s.volts = volts(s, s.gains);
  return s.volts;
}

const fresh = (time = 0, gains = "tuned") => ({
  time,
  rot: REST,
  w: 0,
  sp: { p: REST, v: 0, a: 0 },
  trigger: false,
  cmd: null,
  request: null,
  volts: 0,
  moveStart: -1,
  gains,
  restartedAt: time,
  nudgeAt: -1,
});

function simulate(events, duration, rate, gains = "tuned") {
  const s = fresh(0, gains);
  const out = [];
  let e = 0;
  for (let i = 0, n = Math.ceil(duration * rate) + 2; i < n; i++) {
    while (s.time < i / rate) {
      while (e < events.length && events[e].t <= s.time) events[e++].do(s);
      stepArm(s, control(s), DT);
      s.time += DT;
    }
    out.push({ ...s, sp: { ...s.sp } });
  }
  return out;
}

// ---- the code on screen ---------------------------------------------------------------

// Each line: text, or steps [[time, text], ...] it morphs through; `on` = running.
function codeModel(T) {
  return {
    teleop: [
      { s: "public MyTeleop(Robot robot) {" },
      { s: "  driver.leftTrigger()" },
      {
        steps: [
          [0, "      .whileTrue(robot.arm.runFast())"],
          [T.commands, "      .whileTrue(robot.arm.vertical())"],
          [T.unbind + 1.0, "      .whileTrue(robot.arm.vertical());"],
        ],
        on: (s) => s.trigger,
      },
      {
        s: "      .whileFalse(robot.arm.stop());",
        strikeAt: T.unbind,
        goneAt: T.unbind + 1.0,
      },
      { s: "}" },
    ],
    arm: [
      {
        steps: [
          [0, "private final VoltageOut voltageOut ="],
          [T.swap, "private final MotionMagicVoltage positionOut ="],
        ],
        mark: T.swap,
      },
      {
        steps: [
          [0, "    new VoltageOut(0);"],
          [T.swap, "    new MotionMagicVoltage(0);"],
        ],
        mark: T.swap,
      },
      { s: "" },
      {
        steps: [
          [0, "public Command runFast() {"],
          [T.commands, "public Command vertical() {"],
        ],
        on: (s) => s.cmd,
      },
      {
        steps: [
          [0, "  return runRepeatedly(() -> setVoltage(6.0))"],
          [T.commands, "  return runRepeatedly(() -> setPosition(0.25))"],
        ],
        on: (s) => s.cmd,
        loop: true,
      },
      {
        steps: [
          [0, '      .named("runFast (hold)");'],
          [T.commands, '      .named("vertical (hold)");'],
        ],
      },
      { s: "}" },
      { s: "" },
      {
        steps: [
          [0, "private void setVoltage(double voltage) {"],
          [T.swap, "private void setPosition(double rotations) {"],
        ],
        on: (s) => s.cmd,
      },
      {
        steps: [
          [0, "  motor.setControl(voltageOut.withOutput(voltage));"],
          [T.swap, "  motor.setControl(positionOut.withPosition(rotations));"],
        ],
        on: (s) => s.cmd,
        loop: true,
        send: true,
        mark: T.swap,
      },
      { s: "}" },
    ],
  };
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    swap: Wd("swap", "Motion") - 0.15,
    commands: Wd("target", "commands"),
    unbind: Wd("binding", "release"),
    paste: Wd("gains", "paste"),
  };
  const code = codeModel(T);

  const events = [
    { t: Wd("press", "Hold") + 0.3, do: (s) => (s.trigger = true) },
    { t: Wd("release", "go.") + 0.05, do: (s) => (s.trigger = false) },
    // a nudge while the request holds the arm: it comes back
    {
      t: Wd("reverse", "holds") - 0.1,
      do: (s) => ((s.w -= 0.35), (s.nudgeAt = s.time)),
    },
    // the gate, played for you: let go halfway through the move
    { t: gate.t0, do: (s) => Object.assign(s, fresh(s.time)) },
    { t: gate.t0 + 0.8, do: (s) => (s.trigger = true) },
    { t: gate.t0 + 1.55, do: (s) => (s.trigger = false) },
  ].sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = simulate(events, VOICE.duration, RATE);
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // the two failure insets: the same press, with the gains as shipped and with P alone
  const INSET = 4.0;
  const press = [{ t: 0.4, do: (s) => (s.trigger = true) }];
  const zeroRun = simulate(press, INSET, RATE, "zero");
  const huntRun = simulate(press, INSET, RATE, "hunt");

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 465, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("swap").t0 - 0.3, x: 1450, y: 330, z: 1.55, d: 1.2 },
    { t: Wd("target", "straight") - 0.3, x: 1080, y: 360, z: 1.15, d: 1.2 },
    { t: L("binding").t0 - 0.2, x: 1450, y: 190, z: 1.6, d: 1.0 },
    { t: L("press").t0 - 0.3, ...FULL, d: 1.2 },
    { t: L("reverse").t0, x: 760, y: 420, z: 1.35, d: 1.2 },
    { t: L("tryit").t0, ...FULL, d: 1.0 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawCode(ctx, s, t, live) {
    panel(ctx, CODE);
    micro(ctx, "running", CODE.x + 28, CODE.y + 44);
    text(
      ctx,
      s.cmd ? "vertical (hold)" : "nothing",
      CODE.x + 140,
      CODE.y + 45,
      { font: MONO, size: 22, weight: 600, color: s.cmd ? C.accent : C.tx3 }
    );
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const tt = live ? 1e9 : t; // a live gate shows the finished code
    const pulse = 0.5 + 0.5 * Math.cos(((t % 0.13) / 0.13) * TAU);
    const block = (lines, top, file) => {
      micro(ctx, file, CODE.x + 28, top - 40);
      let ly = top - LH;
      for (const ln of lines) {
        const str = ln.s ?? ln.steps[0][1];
        ly += str ? LH : LH / 2;
        if (!str) continue;
        if (ln.goneAt && tt > ln.goneAt + 0.6) {
          ly -= LH;
          continue;
        }
        const active = ln.on?.(s);
        if (active)
          runBar(ctx, CODE.x + 1, ly - 22, CODE.w - 2, LH, ln.loop ? pulse : 0);
        let cur = str;
        let prev = null;
        let since = 99;
        if (ln.steps) {
          for (const [st, txt] of ln.steps) {
            if (tt >= st) {
              prev = cur;
              cur = txt;
              since = tt - st;
            }
          }
        }
        const k = clamp(since / 0.45);
        if (prev && k < 1) codeLine(ctx, prev, CODE.x + 28, ly, { a: 1 - k });
        const goneA = ln.goneAt ? 1 - clamp((tt - ln.goneAt) / 0.6) : 1;
        codeLine(ctx, cur, CODE.x + 28, ly, {
          a: (prev && k < 1 ? k : 1) * goneA,
        });
        // a freshly changed line keeps an accent tick for a moment
        if (ln.steps && since < 2.5 && since > 0) {
          ctx.fillStyle = alpha(C.accent, 1 - since / 2.5);
          ctx.fillRect(CODE.x + 8, ly - 20, 4, LH - 4);
        }
        if (ln.strikeAt && tt >= ln.strikeAt) {
          const w =
            codeWidth(ctx, cur.trimStart()) *
            easeOut(clamp((tt - ln.strikeAt) / 0.4));
          ctx.strokeStyle = alpha(C.err, goneA);
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(CODE.x + 28 + codeWidth(ctx, "      "), ly - 7);
          ctx.lineTo(CODE.x + 28 + codeWidth(ctx, "      ") + w, ly - 7);
          ctx.stroke();
        }
        if (ln.send && active)
          text(ctx, "→ motor", CODE.x + CODE.w - 28, ly, {
            font: MONO,
            size: 18,
            weight: 600,
            align: "right",
            color: C.accent,
          });
      }
      return ly;
    };
    block(code.teleop, CODE.y + 130, "MyTeleop.java");
    block(code.arm, CODE.y + 300, "Arm.java");
  }

  // The constructor's pasted config, reduced to the gains: zeros as shipped, then
  // the student's own (never numbers; ours are not to be copied).
  function drawGains(ctx, t) {
    const k = window_(t, L("gains").t0 - 0.2, L("target").t0 + 0.2, 0.4);
    if (k <= 0) return;
    ctx.save();
    ctx.globalAlpha = k;
    const R = { x: CODE.x + 20, y: CODE.y + 80, w: CODE.w - 40, h: 420 };
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "Arm() · config pasted from Tuner X", R.x + 28, R.y + 44);
    const rows = [
      ["withKG", "Slot 0"],
      ["withKS", "Slot 0"],
      ["withKP", "Slot 0"],
      ["withKD", "Slot 0"],
      ["withMotionMagicCruiseVelocity", "Motion Magic"],
      ["withMotionMagicAcceleration", "Motion Magic"],
    ];
    rows.forEach(([name, group], i) => {
      const y = R.y + 96 + i * 52;
      codeLine(ctx, `.${name}(`, R.x + 28, y);
      const vx = R.x + 28 + codeWidth(ctx, `.${name}(`);
      const pasted = clamp((t - T.paste - i * 0.12) / 0.35);
      // the shipped zero, wiped away by the paste
      codeLine(ctx, "0.0", vx, y, { a: 1 - pasted });
      if (pasted > 0) {
        const cw = 120 * easeOut(pasted);
        ctx.save();
        rrect(ctx, vx, y - 21, cw, 28, 3);
        ctx.clip();
        ctx.fillStyle = alpha(C.accent, 0.18);
        ctx.fillRect(vx, y - 21, cw, 28);
        ctx.strokeStyle = alpha(C.accent, 0.55);
        ctx.lineWidth = 2;
        for (let hx = vx - 30; hx < vx + cw; hx += 10) {
          ctx.beginPath();
          ctx.moveTo(hx, y + 7);
          ctx.lineTo(hx + 28, y - 21);
          ctx.stroke();
        }
        ctx.restore();
      }
      codeLine(
        ctx,
        ")",
        vx +
          codeWidth(ctx, "0.0") +
          (128 - codeWidth(ctx, "0.0")) * easeOut(pasted),
        y
      );
      text(ctx, pasted > 0.5 ? "yours" : group, R.x + R.w - 28, y, {
        font: MONO,
        size: 17,
        align: "right",
        color: pasted > 0.5 ? C.accent : C.tx3,
      });
    });
    ctx.restore();
  }

  function drawPlot(ctx, s, t, hist) {
    panel(ctx, PLOT, C.bg2);
    micro(
      ctx,
      "Motion Magic profile · speed over time",
      PLOT.x + 24,
      PLOT.y + 36
    );
    const ox = PLOT.x + 40;
    const oy = PLOT.y + PLOT.h - 40;
    const pw = PLOT.w - 80;
    const ph = PLOT.h - 84;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy - ph);
    ctx.lineTo(ox, oy);
    ctx.lineTo(ox + pw, oy);
    ctx.stroke();
    micro(ctx, "time", ox + pw - 50, oy + 30);
    if (!hist.length) return;
    const span = 2.4;
    const X = (u) => ox + (u / span) * pw;
    const Y = (v) => oy - (Math.abs(v) / MM.cruise) * ph * 0.9;
    // the trace so far
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.beginPath();
    hist.forEach((h, i) =>
      i ? ctx.lineTo(X(h.u), Y(h.v)) : ctx.moveTo(X(h.u), Y(h.v))
    );
    ctx.stroke();
    const last = hist.at(-1);
    ctx.beginPath();
    ctx.arc(X(last.u), Y(last.v), 8, 0, TAU);
    ctx.fillStyle = C.accent;
    ctx.fill();
    // name each phase once it has happened
    const phase = (pred) => hist.find(pred);
    const up = phase((h) => h.a > 0);
    const cruise = phase((h) => h.a === 0 && Math.abs(h.v) > MM.cruise * 0.98);
    const down = phase((h) => h.a < 0);
    if (up)
      text(ctx, "speed up", X(up.u) + 30, oy - ph * 0.3, {
        font: MONO,
        size: 18,
        color: C.tx2,
      });
    if (cruise)
      text(ctx, "cruise", X(cruise.u) + 30, Y(MM.cruise) + 26, {
        font: MONO,
        size: 18,
        color: C.tx2,
      });
    if (down)
      text(ctx, "slow down", X(down.u) + 40, oy - ph * 0.3, {
        font: MONO,
        size: 18,
        color: C.tx2,
      });
    if (last.done)
      text(ctx, "arrived", X(last.u) + 14, oy - 12, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.accent,
      });
    // the command's own span, under the axis: it can end before the move does
    if (last.cmdEnd != null) {
      ctx.fillStyle = alpha(C.accent, 0.35);
      ctx.fillRect(X(0), oy + 10, X(Math.min(last.cmdEnd, span)) - X(0), 6);
      text(ctx, "command ran", X(0) + 8, oy + 34, {
        font: MONO,
        size: 16,
        color: C.tx3,
      });
    }
  }

  // history of the current move, for the plot, from the timeline samples
  function histAt(t) {
    const s = at(t);
    if (s.moveStart < 0) return [];
    const out = [];
    let cmdEnd = null;
    for (
      let u = s.moveStart;
      u <= t + 1e-6 && u - s.moveStart <= 2.4;
      u += 1 / RATE
    ) {
      const x = at(u);
      if (cmdEnd == null && !x.cmd && u > s.moveStart + 0.05)
        cmdEnd = u - s.moveStart;
      out.push({ u: u - s.moveStart, v: x.sp.v, a: x.sp.a });
    }
    if (out.length) {
      out.at(-1).done = s.sp.v === 0 && s.sp.p === TARGET;
      out.at(-1).cmdEnd = cmdEnd ?? (s.cmd ? out.at(-1).u : null);
    }
    return out;
  }

  function drawCard(ctx, s, t) {
    const lit = window_(t, L("release").t0 + 1.2, L("reverse").t1 + 0.4, 0.4);
    drawMotorCard(ctx, CARD, {
      led: s.request ? C.accent : C.tx3,
      lit,
      rows: [
        [
          "request on the motor",
          s.request ? "MotionMagicVoltage" : "none",
          s.request ? C.accent : C.tx3,
          28,
        ],
        ["target", s.request ? "0.25 rot" : "–", s.request ? C.tx : C.tx3, 28],
        ["arm at", `${s.rot.toFixed(3)} rot`, C.tx2, 28],
      ],
    });
    // power lead to the motor
    ctx.strokeStyle =
      s.request && Math.abs(s.volts) > 0.05 ? alpha(C.accent, 0.85) : C.rule;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CARD.x + CARD.w, CARD.y + 70);
    ctx.bezierCurveTo(
      CARD.x + CARD.w + 120,
      CARD.y + 70,
      PIVOT.x - 60,
      PIVOT.y + 200,
      PIVOT.x,
      PIVOT.y + 44
    );
    ctx.stroke();
  }

  function drawBench(ctx, s, t, history, live) {
    drawStand(ctx, PIVOT);
    const showTarget = live || t >= Wd("target", "straight") - 0.2;
    if (showTarget)
      drawTargetMark(
        ctx,
        PIVOT,
        ARM_LEN,
        TARGET,
        "0.25 rot · vertical",
        live ? 1 : easeOut(ramp(t, Wd("target", "straight") - 0.2, 0.5))
      );
    if (s.request && Math.abs(s.sp.p - s.rot) > 0.004)
      drawArmBody(ctx, PIVOT, ARM_LEN, s.sp.p, { ghost: true });
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, {
      history,
      driven: Math.abs(s.volts) > 0.3,
    });
    if (s.request && Math.abs(s.sp.p - s.rot) > 0.004)
      text(
        ctx,
        "setpoint",
        PIVOT.x + Math.cos(s.sp.p * TAU) * (ARM_LEN - 10) + 30,
        PIVOT.y - Math.sin(s.sp.p * TAU) * (ARM_LEN - 10) + 6,
        { font: MONO, size: 17, color: C.accent }
      );
    // the nudge
    if (s.nudgeAt > 0 && t - s.nudgeAt < 1.2 && !live) {
      const k = ramp(t, s.nudgeAt - 0.25, 0.5);
      const a = window_(t, s.nudgeAt - 0.3, s.nudgeAt + 1.2, 0.25);
      const tipY = PIVOT.y - ARM_LEN + 30;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = C.tx;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(PIVOT.x - 150 + 60 * easeOut(k), tipY);
      ctx.lineTo(PIVOT.x - 40 + 60 * easeOut(k), tipY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(PIVOT.x - 52 + 60 * easeOut(k), tipY - 12);
      ctx.lineTo(PIVOT.x - 38 + 60 * easeOut(k), tipY);
      ctx.lineTo(PIVOT.x - 52 + 60 * easeOut(k), tipY + 12);
      ctx.stroke();
      text(ctx, "nudge", PIVOT.x - 150, tipY - 18, {
        font: MONO,
        size: 18,
        color: C.tx2,
      });
      ctx.restore();
    }
    const since = t - s.restartedAt;
    if (s.restartedAt > 0 && since < 2.2)
      text(ctx, "starting over", PIVOT.x, 850, {
        font: MONO,
        size: 20,
        align: "center",
        color: C.tx2,
        a: window_(since, 0, 2.2, 0.3),
        spacing: 1.5,
      });
  }

  // last time vs this time, while the narration draws the contrast
  function drawContrast(ctx, t) {
    const k = window_(t, Wd("reverse", "position,") - 0.3, L("tryit").t0, 0.4);
    if (k <= 0) return;
    ctx.save();
    ctx.globalAlpha = k;
    const R = { x: 515, y: 60, w: 510, h: 118 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = alpha(C.bg2, 0.97);
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    micro(ctx, "last time", R.x + 22, R.y + 36);
    text(ctx, "6 volts stayed → kept spinning", R.x + 150, R.y + 37, {
      font: MONO,
      size: 18,
      color: C.tx3,
    });
    micro(ctx, "this time", R.x + 22, R.y + 86, { color: C.accent });
    text(ctx, "a position stayed → holds it", R.x + 150, R.y + 87, {
      font: MONO,
      size: 18,
      weight: 600,
      color: C.accent,
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
    micro(ctx, "Workshop 3 · Motion Magic in Code", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Naming a Target", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // A voltage vs a target, then the same move in Tuner X.
  function openingCard(ctx, t) {
    const t1 = L("swap").t0 - 0.4;
    if (t < L("intro").t0 - 0.6 || t > t1 + 0.8) return;
    ctx.save();
    ctx.globalAlpha = 1 - easeInOut(ramp(t, t1, 0.8));
    background(ctx);
    const chip = (y, label, req, val, at, hot) => {
      const k = easeOut(ramp(t, at - 0.15, 0.5));
      ctx.save();
      ctx.globalAlpha *= k;
      rrect(ctx, 460, y, 1000, 92, 5);
      ctx.fillStyle = hot ? alpha(C.accent, 0.12) : C.bg2;
      ctx.fill();
      ctx.strokeStyle = hot ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      micro(ctx, label, 490, y + 36);
      text(ctx, req, 490, y + 74, {
        font: MONO,
        size: 32,
        weight: 600,
        color: hot ? C.accent : C.tx,
      });
      text(ctx, val, 1430, y + 66, {
        font: MONO,
        size: 32,
        weight: 600,
        align: "right",
        color: hot ? C.accent : C.tx2,
      });
      ctx.restore();
    };
    chip(
      150,
      "names a voltage",
      "VoltageOut",
      "6.0 V",
      Wd("intro", "voltage,"),
      false
    );
    chip(
      262,
      "names a target",
      "MotionMagicVoltage",
      "0.25 rot",
      Wd("intro", "target."),
      true
    );

    // Tuner X, Workshop 1: the same request, and the ramp it drew
    const kp = easeOut(ramp(t, L("callback").t0, 0.6));
    ctx.globalAlpha *= kp;
    const P = { x: 460, y: 420, w: 1000, h: 420 };
    rrect(ctx, P.x, P.y, P.w, P.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "Tuner X · Control · Workshop 1", P.x + 30, P.y + 44);
    text(ctx, "Motion Magic", P.x + 30, P.y + 100, { size: 34, weight: 600 });
    text(ctx, "position 0.25", P.x + 30, P.y + 140, {
      font: MONO,
      size: 24,
      color: C.tx2,
    });
    // a trapezoid drawn as the narration names its parts
    const ox = P.x + 380;
    const oy = P.y + 360;
    const pts = [
      [0, 0],
      [140, 200],
      [400, 200],
      [540, 0],
    ];
    const marks = [
      Wd("callback", "speed"),
      Wd("callback", "cruise,"),
      Wd("callback", "slow"),
    ];
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy - 230);
    ctx.lineTo(ox, oy);
    ctx.lineTo(ox + 580, oy);
    ctx.stroke();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    for (let i = 1; i < 4; i++) {
      const k = clamp((t - marks[i - 1] + 0.1) / 0.5);
      if (k <= 0) break;
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      ctx.lineTo(ox + x0 + (x1 - x0) * k, oy - (y0 + (y1 - y0) * k));
    }
    ctx.stroke();
    const labels = ["speed up", "cruise", "slow down"];
    const lx = [30, 210, 420];
    const ly = [70, 225, 70];
    labels.forEach((l, i) =>
      text(ctx, l, ox + lx[i], oy - ly[i], {
        font: MONO,
        size: 20,
        color: C.tx2,
        a: clamp((t - marks[i]) / 0.4),
      })
    );
    ctx.restore();
  }

  function failuresCard(ctx, t) {
    const t0 = L("wrong").t0 - 0.2;
    const a = window_(t, t0, L("close").t0 + 0.1, 0.5);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.95);
    ctx.fillRect(0, 0, W, H);
    const u = (t - t0) % INSET;
    const box = (x, run, title, fix, at) => {
      const s = run[clamp(Math.floor(u * RATE), 0, run.length - 1)];
      const k = easeOut(ramp(t, at - 0.2, 0.5));
      ctx.save();
      ctx.globalAlpha *= k;
      rrect(ctx, x, 140, 760, 720, 6);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, title, x + 36, 206, { size: 36, weight: 600 });
      const P = { x: x + 380, y: 520 };
      drawStand(ctx, P, 760);
      drawTargetMark(ctx, P, 170, TARGET, "target", 1);
      drawArmBody(ctx, P, 170, s.rot, { driven: Math.abs(s.volts) > 0.3 });
      micro(ctx, "the fix", x + 36, 800);
      text(ctx, fix, x + 36, 836, { size: 26, color: C.accent });
      ctx.restore();
    };
    box(
      140,
      zeroRun,
      "Doesn't move at all",
      "Gains are still 0.0. Paste again.",
      L("wrong").t0
    );
    box(
      1020,
      huntRun,
      "Overshoots and hunts",
      "Retune in Tuner X, then paste again.",
      Wd("wrong", "overshoots")
    );
    ctx.restore();
  }

  function closeCard(ctx, t) {
    const a = easeInOut(ramp(t, L("close").t0 + 0.1, 0.8));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    text(ctx, "Name where the arm should be,", W / 2, 450, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "and the motor keeps it there.", W / 2, 556, {
      font: SERIF,
      size: 84,
      align: "center",
      color: C.accent,
    });
    text(ctx, "Even after the command ends.", W / 2, 660, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "even") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? at(t);
    const history = [];
    if (!live) for (let i = 6; i >= 1; i--) history.push(at(t - i * 0.035).rot);
    else history.push(...live.trail);

    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawCode(ctx, s, t, !!live);
    if (!live) drawGains(ctx, t);
    drawPlot(ctx, s, t, live ? live.hist : histAt(t));
    drawCard(ctx, s, t);
    drawBench(ctx, s, t, history, !!live);
    drawController(ctx, PAD, { lt: s.trigger });
    if (!live) drawContrast(ctx, t);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    openingCard(ctx, t);
    failuresCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = { ...fresh(gate.t0), trail: [], hist: [] };
    let phase = "hold";
    let doneAt = null;
    return {
      state: s,
      prompt: () =>
        ({
          hold: "Hold the trigger.",
          early: "Let go before it gets there.",
          late: "It got there first. Let go anyway.",
          carry: "Command's over. Watch the arm.",
          done: "It finished the move, and it's holding.",
        })[phase],
      input(name, down) {
        if (name !== "trigger") return;
        s.trigger = down;
        if (down && phase === "hold") phase = "early";
        if (!down && (phase === "early" || phase === "late"))
          phase = phase === "early" ? "carry" : "done";
        if (!down && phase === "done" && doneAt == null) doneAt = s.time + 1.0;
      },
      step(dt) {
        const n = Math.ceil(dt / DT);
        for (let i = 0; i < n; i++) {
          stepArm(s, control(s), DT);
          s.time += DT;
        }
        s.trail.push(s.rot);
        if (s.trail.length > 6) s.trail.shift();
        if (s.moveStart >= 0 && s.time - s.moveStart <= 2.4) {
          if (!s.cmd && s.cmdEnd == null) s.cmdEnd = s.time - s.moveStart;
          s.hist.push({
            u: s.time - s.moveStart,
            v: s.sp.v,
            a: s.sp.a,
            done: s.sp.v === 0 && s.sp.p === TARGET,
            cmdEnd: s.cmdEnd ?? (s.cmd ? s.time - s.moveStart : null),
          });
        }
        const arrived =
          s.request &&
          s.sp.v === 0 &&
          s.sp.p === TARGET &&
          Math.abs(s.rot - TARGET) < 0.01;
        if (arrived && phase === "early") phase = "late";
        if (arrived && phase === "carry") {
          phase = "done";
          doneAt = s.time;
        }
        return doneAt !== null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.8) return "Hold the trigger.";
    if (u < 1.55) return "Let go before it gets there.";
    if (u < 3.4) return "Command's over. Watch the arm.";
    return "It finished the move, and it's holding.";
  }

  return { draw, liveGate, gate, gatePromptAt, gateKeys: ["trigger"] };
}
