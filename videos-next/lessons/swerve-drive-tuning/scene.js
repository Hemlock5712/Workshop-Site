// What the Carpet Says. The generator guessed the wheel radius, the top speed and the
// slip current; this video measures each on the floor, in that order, then closes the
// drive's speed loop and trims the deadband.
//
// What is simulated, and how:
//   radius    odometry distance = wheel turns × the radius in the file. The robot
//             drives a taped 5 m; the logged distance scales with the file's radius.
//             The gate drags that radius until the two marks agree. The video does
//             not say which way the correction goes (unsettled on the site,
//             SITE-FIXES #5): no inch values, no "bigger/smaller", just two marks.
//   speed     a full-stick run: a spike, then the plateau that is the real top speed.
//   slip      Voltage Out ramped slowly against a wall: current climbs while the
//             wheel holds, then the wheel breaks loose, velocity jumps and current
//             drops. The reading is the top of the climb.
// Measured values (the student's) are hatched "yours" cells, never numbers. The
// generator's shipped example values are shown as shipped.

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
  codeLine,
  codeWidth,
  drawField,
  drawPlot,
  drawSwerveRobot,
  drawToolWindow,
  panel,
  runBar,
  swerveModules,
} from "../../engine/kit.js";

const TAU = 2 * Math.PI;

// ---- the radius model --------------------------------------------------------------

const TAPE = 5.0; // meters, measured with the tape
const START_RATIO = 1.04; // the file's radius makes odometry read 4% long at the start
// the gate's knob: 0..100, 50 = the radius as generated. Odometry = TAPE × factor.
const factorOf = (v) => START_RATIO * (1 + ((v - 50) / 50) * 0.1);
const AGREE_V = 50 + ((1 / START_RATIO - 1) / 0.1) * 50; // where the marks agree

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

// The taped run, top down. d = meters driven so far; odo = the odometry reading at the
// end (shown once the run is done, or always when `marks`).
function drawRun(
  ctx,
  R,
  d,
  factor,
  { marks = false, title = "drive a measured distance" } = {}
) {
  panel(ctx, R, C.bg2);
  micro(ctx, title, R.x + 24, R.y + 36);
  const F = drawField(
    ctx,
    { x: R.x + 20, y: R.y + 60, w: R.w - 40, h: R.h - 200 },
    {
      view: { x0: -0.6, y0: 0, x1: 6.2, y1: 1.6 },
      axes: false,
      labels: false,
      grid: 0.5,
    }
  );
  // tape marks on the carpet
  const tape = (m, label) => {
    ctx.fillStyle = C.tx;
    ctx.fillRect(F.X(m) - 3, F.Y(1.45), 6, F.Y(0.15) - F.Y(1.45));
    text(ctx, label, F.X(m), F.Y(1.45) - 10, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "center",
      color: C.tx2,
    });
  };
  tape(0, "tape");
  tape(TAPE, "tape");
  const moving = d > 0 && d < TAPE;
  drawSwerveRobot(
    ctx,
    F,
    { x: d - 0.42, y: 0.8, theta: 0 },
    { modules: swerveModules(moving ? 1 : 0, 0, 0), size: 0.84, maxSpeed: 1.6 }
  );
  // the ruler under the run: what the tape says, and what odometry says
  const y = R.y + R.h - 100;
  const X = (m) => F.X(m);
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X(0), y);
  ctx.lineTo(X(6), y);
  ctx.stroke();
  for (let m = 0; m <= 6; m++) {
    ctx.fillStyle = C.tx3;
    ctx.fillRect(X(m) - 1, y - 6, 2, 12);
    text(ctx, `${m} m`, X(m), y + 30, {
      font: MONO,
      size: 16,
      align: "center",
      color: C.tx3,
    });
  }
  const odo = d * factor;
  const showOdo = marks || d >= TAPE;
  // tape mark
  const tri = (x, up, col) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y + (up ? -8 : 8));
    ctx.lineTo(x - 11, y + (up ? -28 : 28));
    ctx.lineTo(x + 11, y + (up ? -28 : 28));
    ctx.closePath();
    ctx.fill();
  };
  if (d >= TAPE || marks) {
    tri(X(TAPE), true, C.tx);
    text(ctx, `tape ${TAPE.toFixed(2)} m`, X(TAPE), y - 40, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.tx,
    });
  }
  if (showOdo) {
    const om = marks ? TAPE * factor : odo;
    tri(X(om), false, C.accent);
    text(ctx, `odometry ${om.toFixed(2)} m`, X(om), y + 66, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.accent,
    });
  }
  return { odo };
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd } = cues(VOICE);
  const gate = VOICE.gates[0];
  const gd = gate.t1 - gate.t0;
  const T = {
    intro: L("intro").t0,
    carpet: Wd("intro", "carpet"),
    order: L("order").t0,
    o1: Wd("order", "radius,"),
    o2: Wd("order", "top"),
    o3: Wd("order", "slip,"),
    o4: Wd("order", "close"),
    radius: L("radius").t0,
    compare: Wd("radius", "compare"),
    ratio: Wd("radius", "ratio"),
    speed: L("speed").t0,
    flat: Wd("speed", "flat"),
    levels: Wd("speed", "levels"),
    plateau: Wd("speed", "plateau,"),
    spike: Wd("speed", "spike"),
    slip: L("slip").t0,
    wall: Wd("slip", "wall"),
    voltage: Wd("slip", "voltage"),
    climb: Wd("slip", "climb.", 1),
    top: Wd("slip", "top"),
    loose: Wd("slip", "loose."),
    loop: L("loop").t0,
    kv: Wd("loop", "velocity"),
    ks: Wd("loop", "static,"),
    kp: Wd("loop", "proportional,"),
    ground: Wd("loop", "ground."),
    sw: L("switch").t0,
    word: Wd("switch", "word,"),
    speedW: Wd("switch", "speed"),
    db: L("deadband").t0,
    twitch: Wd("deadband", "twitches"),
    back: Wd("deadband", "back"),
    close: L("close").t0,
  };
  const beat = (t, a, b, e = 0.4) =>
    window_(t, L(a).t0 - 0.35, b ? L(b).t0 - 0.35 : VOICE.duration, e);

  // ---- the opening ------------------------------------------------------------------

  function introBeat(ctx, t) {
    const a = window_(t, T.intro - 0.5, T.order - 0.35, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    micro(ctx, "TunerConstants.java · the generator's guesses", 300, 250);
    const rows = [
      ["kWheelRadius = Inches.of(", "2.167", ");"],
      ["kSpeedAt12Volts = MetersPerSecond.of(", "4.54", ");"],
      ["kSlipCurrent = Amps.of(", "120", ");"],
    ];
    const kc = clamp((t - T.carpet - 0.3) / 0.8);
    rows.forEach(([pre, v, post], i) => {
      const y = 340 + i * 110;
      const k = easeOut(ramp(t, T.intro + 0.3 + i * 0.35, 0.5));
      codeLine(ctx, pre, 300, y, { size: 36, a: k });
      const vx = 300 + codeWidth(ctx, pre, 36);
      const sw = clamp(kc * 3 - i);
      codeLine(ctx, v, vx, y, { size: 36, a: k * (1 - sw) });
      if (sw > 0) hatch(ctx, vx, y - 34, 130 * sw, 44);
      codeLine(
        ctx,
        post,
        vx + Math.max(codeWidth(ctx, v, 36), 130 * sw) + 6,
        y,
        { size: 36, a: k }
      );
      text(ctx, sw > 0.5 ? "measured on your carpet" : "guessed", 1640, y, {
        font: MONO,
        size: 20,
        align: "right",
        color: sw > 0.5 ? C.accent : C.tx3,
        a: k,
      });
    });
    ctx.restore();
  }

  function orderBeat(ctx, t) {
    const a = beat(t, "order", "radius");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const steps = [
      ["wheel radius", "kWheelRadius", T.o1],
      ["top speed", "kSpeedAt12Volts", T.o2],
      ["slip", "kSlipCurrent", T.o3],
      ["close the speed loop", "driveGains · Velocity", T.o4],
    ];
    steps.forEach(([name, what, at], i) => {
      const k = easeOut(ramp(t, at - 0.15, 0.4));
      const x = 120 + i * 430;
      const hot = t >= at - 0.15 && (i === 3 || t < steps[i + 1][2] - 0.15);
      ctx.save();
      ctx.globalAlpha *= 0.3 + 0.7 * k;
      rrect(ctx, x, 330, 390, 230, 6);
      ctx.fillStyle = hot ? alpha(C.accent, 0.1) : C.bg2;
      ctx.fill();
      ctx.strokeStyle = hot ? C.accent : C.rule;
      ctx.lineWidth = hot ? 3 : 2;
      ctx.stroke();
      text(ctx, `${i + 1}`, x + 30, 410, {
        font: SERIF,
        size: 64,
        color: hot ? C.accent : C.tx3,
      });
      text(ctx, name, x + 30, 480, { size: 30, weight: 600 });
      text(ctx, what, x + 30, 524, { font: MONO, size: 19, color: C.tx2 });
      ctx.restore();
      if (i < 3) text(ctx, "→", x + 410, 455, { size: 30, color: C.tx3, a: k });
    });
    text(ctx, "radius and speed on volts · the speed loop last", 960, 660, {
      font: MONO,
      size: 22,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, T.o4, 0.5)),
    });
    ctx.restore();
  }

  // ---- recorded beats, drawn for now -------------------------------------------------

  // Camera on the carpet + AdvantageScope Drivetrain/Pose: tape, drive, tape again.
  const RUN = { x: 120, y: 120, w: 1680, h: 620 };
  function recRadius(ctx, t) {
    const a = beat(t, "radius", "tryit");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const d = TAPE * easeInOut(clamp((t - T.radius - 0.2) / 2.8));
    drawRun(ctx, RUN, d, START_RATIO, {
      title: "camera · tape at the front edge, drive slowly, tape again",
    });
    micro(
      ctx,
      "AdvantageScope · Drivetrain/Pose x",
      RUN.x + RUN.w - 420,
      RUN.y + 36
    );
    const k = easeOut(ramp(t, T.ratio - 0.2, 0.5));
    if (k > 0) {
      const pct = (START_RATIO - 1) * 100;
      text(ctx, `the two disagree by ${pct.toFixed(1)}%`, 960, 800, {
        font: MONO,
        size: 28,
        weight: 600,
        align: "center",
        color: C.accent,
        a: k,
      });
      text(ctx, "that ratio is how far off the radius is", 960, 846, {
        size: 24,
        align: "center",
        color: C.tx2,
        a: k,
      });
    }
    ctx.restore();
  }

  // the radius knob, unitless on purpose
  function drawKnob(ctx, v, agree) {
    const R = { x: 560, y: 790, w: 800, h: 90 };
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = agree ? C.accent : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    codeLine(ctx, "kWheelRadius = Inches.of(", R.x + 24, R.y + 56, {
      size: 22,
    });
    const hx = R.x + 24 + codeWidth(ctx, "kWheelRadius = Inches.of(", 22);
    hatch(ctx, hx, R.y + 34, 90, 30);
    codeLine(ctx, ");", hx + 96, R.y + 56, { size: 22 });
    const x0 = R.x + 500;
    const x1 = R.x + R.w - 40;
    ctx.fillStyle = C.rule;
    ctx.fillRect(x0, R.y + 44, x1 - x0, 4);
    const kx = lerp(x0, x1, v / 100);
    ctx.beginPath();
    ctx.arc(kx, R.y + 46, 13, 0, TAU);
    ctx.fillStyle = C.accent;
    ctx.fill();
  }

  // the scripted gate: the knob wanders past the agreement point, then settles on it
  function scriptedV(t) {
    const u = t - gate.t0;
    const over = AGREE_V + (AGREE_V < 50 ? -12 : 12);
    if (u < 1.0) return 50;
    if (u < 3.0) return lerp(50, over, easeInOut((u - 1.0) / 2.0));
    if (u < 4.6) return lerp(over, AGREE_V, easeInOut((u - 3.0) / 1.6));
    return AGREE_V;
  }

  // AdvantageScope line graph of Drivetrain/TranslationSpeedMps on a full-stick run.
  const speedCurve = (u) => {
    // rise, a spike, then the plateau
    if (u < 0) return 0;
    const rise = 1 - Math.exp(-u / 0.35);
    const spike = 0.14 * Math.exp(-((u - 0.9) ** 2) / 0.05);
    return 0.86 * rise + spike * rise;
  };
  function recSpeed(ctx, t) {
    const a = beat(t, "speed", "slip");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const u = clamp((t - T.speed - 0.3) * 1.4, 0, 4);
    const pts = [];
    for (let x = 0; x <= u; x += 0.02) pts.push([x, speedCurve(x - 0.3)]);
    const R = { x: 120, y: 110, w: 1680, h: 600 };
    micro(ctx, "AdvantageScope · line graph", R.x, R.y - 16, { color: C.tx2 });
    const P = drawPlot(ctx, R, {
      title: "Drivetrain/TranslationSpeedMps · full stick",
      t0: 0,
      t1: 4,
      v0: 0,
      v1: 1.15,
      series: [{ pts }],
    });
    // the plateau and the spike, named
    const kp = easeOut(ramp(t, T.levels - 0.2, 0.5));
    if (kp > 0) {
      ctx.save();
      ctx.globalAlpha *= kp;
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(P.X(1.8), P.Y(0.86));
      ctx.lineTo(P.X(4), P.Y(0.86));
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, "plateau → kSpeedAt12Volts", P.X(2.4), P.Y(0.86) - 20, {
        font: MONO,
        size: 24,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
    }
    const ks = easeOut(ramp(t, T.spike - 0.3, 0.5));
    if (ks > 0) {
      ctx.beginPath();
      ctx.arc(P.X(1.2), P.Y(speedCurve(0.9)), 30, 0, TAU);
      ctx.strokeStyle = alpha(C.tx2, ks);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      text(ctx, "not the spike", P.X(1.2) + 40, P.Y(speedCurve(0.9)) - 34, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.tx2,
        a: ks,
      });
    }
    // the reading, the student's
    ctx.save();
    ctx.globalAlpha *= kp;
    codeLine(ctx, "kSpeedAt12Volts = MetersPerSecond.of(", 420, 800, {
      size: 26,
    });
    const hx =
      420 + codeWidth(ctx, "kSpeedAt12Volts = MetersPerSecond.of(", 26);
    hatch(ctx, hx, 772, 110, 36);
    codeLine(ctx, ");", hx + 116, 800, { size: 26 });
    text(ctx, "yours", hx + 180, 800, {
      font: MONO,
      size: 20,
      color: C.accent,
    });
    ctx.restore();
    ctx.restore();
  }

  // Tuner X Voltage Out on one drive TalonFX, robot squared against a wall; velocity
  // and stator current plotted while the voltage ramps slowly.
  const KNEE = 2.6; // seconds into the ramp where the wheel breaks loose
  const slipVel = (u) =>
    u < KNEE ? 0 : 0.75 * (1 - Math.exp(-(u - KNEE) / 0.12));
  const slipCur = (u) =>
    u < 0
      ? 0
      : u < KNEE
        ? 0.85 * (u / KNEE) ** 1.1
        : 0.85 - 0.45 * (1 - Math.exp(-(u - KNEE) / 0.1));
  function recSlip(ctx, t) {
    const a = beat(t, "slip", "loop");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const u = clamp((t - T.climb + 1.2) * 0.75, 0, 4);
    const broke = u >= KNEE;
    drawToolWindow(
      ctx,
      { x: 60, y: 90, w: 560, h: 330 },
      {
        app: "Tuner X",
        title: "TalonFX · drive · Control",
        rows: [
          {
            label: "Control",
            value: "Voltage Out",
            hot: t > T.voltage - 0.2 && t < T.climb,
          },
          {
            label: "Output",
            value: t > T.climb - 1.2 ? "ramping slowly" : "0 V",
            hot: t >= T.climb - 1.2,
          },
          { label: "Plot", value: "velocity · stator current" },
        ],
        rowH: 62,
        buttons: [{ label: "Enable", hot: t > T.climb - 1.2 }],
      }
    );
    // the robot squared on the wall, from the side: the tire grips, then spins
    const WR = { x: 60, y: 450, w: 560, h: 330 };
    panel(ctx, WR, C.bg2);
    micro(ctx, "camera · all four wheels into the wall", WR.x + 22, WR.y + 34, {
      size: 16,
    });
    ctx.fillStyle = C.tx3;
    ctx.fillRect(WR.x + 440, WR.y + 70, 26, 220);
    ctx.fillRect(WR.x + 30, WR.y + 290, 500, 6);
    rrect(ctx, WR.x + 120, WR.y + 150, 320, 90, 6);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = C.tx2;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    const spin = broke ? (t * 14) % TAU : 0;
    for (const wx of [WR.x + 180, WR.x + 380]) {
      ctx.beginPath();
      ctx.arc(wx, WR.y + 252, 38, 0, TAU);
      ctx.fillStyle = C.bg;
      ctx.fill();
      ctx.strokeStyle = broke ? C.err : C.tx2;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx, WR.y + 252);
      ctx.lineTo(wx + Math.cos(spin) * 30, WR.y + 252 + Math.sin(spin) * 30);
      ctx.stroke();
    }
    text(
      ctx,
      broke ? "broke loose" : t > T.climb - 1.2 ? "gripping" : "",
      WR.x + 280,
      WR.y + 130,
      {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: broke ? C.err : C.tx2,
      }
    );
    // the two traces
    const vel = [];
    const cur = [];
    for (let x = 0; x <= u; x += 0.02) {
      vel.push([x, slipVel(x)]);
      cur.push([x, slipCur(x)]);
    }
    const R = { x: 660, y: 90, w: 1200, h: 690 };
    const P = drawPlot(ctx, R, {
      title: "velocity and stator current",
      t0: 0,
      t1: 4,
      v0: 0,
      v1: 1,
      series: [
        { pts: cur, color: C.accent },
        { pts: vel, color: C.tx2, dashed: true },
      ],
    });
    text(ctx, "stator current", R.x + R.w - 30, R.y + 40, {
      font: MONO,
      size: 19,
      weight: 600,
      align: "right",
      color: C.accent,
    });
    text(ctx, "velocity (dashed)", R.x + R.w - 30, R.y + 66, {
      font: MONO,
      size: 19,
      weight: 600,
      align: "right",
      color: C.tx2,
    });
    const kt = easeOut(ramp(t, T.top - 0.2, 0.5));
    if (kt > 0 && broke) {
      const kx = P.X(KNEE);
      const ky = P.Y(slipCur(KNEE - 0.001));
      ctx.beginPath();
      ctx.arc(kx, ky, 16, 0, TAU);
      ctx.strokeStyle = alpha(C.accent, kt);
      ctx.lineWidth = 3;
      ctx.stroke();
      text(ctx, "read here: the top of the climb", kx - 24, ky - 30, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "right",
        color: C.accent,
        a: kt,
      });
      ctx.save();
      ctx.globalAlpha *= kt;
      codeLine(ctx, "kSlipCurrent = Amps.of(", R.x + 40, R.y + R.h + 60, {
        size: 24,
      });
      const hx = R.x + 40 + codeWidth(ctx, "kSlipCurrent = Amps.of(", 24);
      hatch(ctx, hx, R.y + R.h + 34, 90, 34);
      codeLine(ctx, ");", hx + 96, R.y + R.h + 60, { size: 24 });
      ctx.restore();
    }
    text(ctx, "short ramps: a stalled motor heats fast", 340, 830, {
      font: MONO,
      size: 19,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, T.wall, 0.5)),
    });
    ctx.restore();
  }

  // The drive gains as shipped, tuned in order, with the robot on the ground.
  function loopBeat(ctx, t) {
    const a = beat(t, "loop", "switch");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const R = { x: 200, y: 180, w: 1520, h: 470 };
    panel(ctx, R);
    micro(
      ctx,
      "TunerConstants.java · driveGains, as shipped",
      R.x + 30,
      R.y + 46
    );
    codeLine(
      ctx,
      "private static final Slot0Configs driveGains =",
      R.x + 30,
      R.y + 110,
      { size: 26 }
    );
    codeLine(ctx, "    new Slot0Configs()", R.x + 30, R.y + 156, { size: 26 });
    const gains = [
      [".withKP(0.2)", T.kp, "3 · proportional"],
      [".withKI(0)", null, ""],
      [".withKD(0)", null, ""],
      [".withKS(0)", T.ks, "2 · static"],
      [".withKV(0.124);", T.kv, "1 · velocity"],
    ];
    let x = R.x + 30 + codeWidth(ctx, "        ", 26);
    gains.forEach(([g, at], i) => {
      const y = R.y + 220 + i * 46;
      const hot = at && t >= at - 0.15;
      const now =
        at &&
        hot &&
        gains.every(([, b]) => !b || b === at || t < b - 0.15 || b < at);
      if (hot) {
        ctx.fillStyle = alpha(C.accent, now ? 0.16 : 0.06);
        ctx.fillRect(R.x + 1, y - 32, R.w - 2, 44);
        ctx.fillStyle = C.accent;
        ctx.fillRect(R.x + 1, y - 32, 4, 44);
        text(ctx, gains[i][2], R.x + 520, y, {
          font: MONO,
          size: 22,
          weight: 600,
          color: C.accent,
        });
      }
      codeLine(ctx, "        " + g, R.x + 30, y, { size: 26 });
    });
    void x;
    const kg = easeOut(ramp(t, T.ground - 0.3, 0.5));
    text(
      ctx,
      "on the ground, not on blocks: no load, no real gains",
      960,
      740,
      {
        font: MONO,
        size: 24,
        weight: 600,
        align: "center",
        color: C.accent,
        a: kg,
      }
    );
    ctx.restore();
  }

  // VS Code TeleopOpMode.java: OpenLoopVoltage → Velocity, last.
  function recSwitch(ctx, t) {
    const a = beat(t, "switch", "deadband");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const R = { x: 160, y: 160, w: 1600, h: 480 };
    drawToolWindow(ctx, R, {
      app: "VS Code",
      title: "src/main/java/frc/robot/opmodes/TeleopOpMode.java",
      rows: [],
    });
    const lines = [
      "private final SwerveRequest.FieldCentric drive =",
      "    new SwerveRequest.FieldCentric()",
      "        .withDeadband(maxSpeed * 0.1)",
      "        .withRotationalDeadband(maxAngularRate * 0.1)",
    ];
    lines.forEach((l, i) =>
      codeLine(ctx, l, R.x + 40, R.y + 120 + i * 52, { size: 26 })
    );
    const y = R.y + 120 + 4 * 52;
    const pre = "        .withDriveRequestType(DriveRequestType.";
    const k = clamp((t - T.word - 0.1) / 0.5);
    runBar(ctx, R.x + 1, y - 34, R.w - 2, 48, 0.5 * k);
    codeLine(ctx, pre, R.x + 40, y, { size: 26 });
    const wx = R.x + 40 + codeWidth(ctx, pre, 26);
    codeLine(ctx, "OpenLoopVoltage);", wx, y, { size: 26, a: 1 - k });
    codeLine(ctx, "Velocity);", wx, y, { size: 26, a: k });
    if (k > 0) {
      ctx.fillStyle = alpha(C.accent, k);
      ctx.fillRect(wx, y + 10, codeWidth(ctx, "Velocity", 26), 3);
    }
    text(ctx, k > 0.5 ? "asks for a speed" : "asks for a voltage", 960, 740, {
      font: MONO,
      size: 28,
      weight: 600,
      align: "center",
      color: k > 0.5 ? C.accent : C.tx2,
    });
    ctx.restore();
  }

  // Shrink the deadband until ModuleTargets twitches at rest, then back off one step.
  function deadbandBeat(ctx, t) {
    const a = beat(t, "deadband", "close");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const steps = [
      [T.db, "0.1", false],
      [T.db + 0.9, "0.05", false],
      [T.twitch - 0.4, "0.025", true],
      [T.back - 0.1, "0.05", false],
    ];
    let cur = steps[0];
    for (const s of steps) if (t >= s[0]) cur = s;
    const R = { x: 160, y: 110, w: 1600, h: 180 };
    panel(ctx, R);
    micro(ctx, "TeleopOpMode.java · on blocks, hands off", R.x + 30, R.y + 44);
    const pre = "        .withDeadband(maxSpeed * ";
    codeLine(ctx, pre, R.x + 30, R.y + 120, { size: 30 });
    codeLine(ctx, cur[1] + ")", R.x + 30 + codeWidth(ctx, pre, 30), R.y + 120, {
      size: 30,
    });
    text(
      ctx,
      cur[2] ? "twitches" : t > T.back - 0.1 ? "back one step" : "still flat",
      R.x + R.w - 30,
      R.y + 120,
      {
        font: MONO,
        size: 24,
        weight: 600,
        align: "right",
        color: cur[2] ? C.err : C.accent,
      }
    );
    // ModuleTargets speed at rest: flat, then noise while the deadband is too small
    const pts = [];
    const span = 4;
    const t0 = t - span;
    for (let x = 0; x <= span; x += 0.02) {
      const tt = t0 + x;
      const noisy = tt > T.twitch - 0.4 && tt < T.back - 0.1;
      const n = noisy ? 0.25 * Math.sin(tt * 37) * Math.sin(tt * 11.3 + 1) : 0;
      pts.push([x, n]);
    }
    drawPlot(
      ctx,
      { x: 160, y: 330, w: 1600, h: 400 },
      {
        title: "Drivetrain/ModuleTargets · speed, sticks untouched",
        t0: 0,
        t1: span,
        v0: -0.5,
        v1: 0.5,
        series: [{ pts }],
      }
    );
    text(ctx, "10% of 4.54 m/s throws away about 0.45 m/s of stick", 960, 790, {
      font: MONO,
      size: 22,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, T.db + 0.3, 0.5)),
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
    micro(ctx, "Workshop 5 · Swerve Drive Tuning", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "What the Carpet Says", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
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
    text(ctx, "Measure on the carpet", W / 2, 450, {
      font: SERIF,
      size: 88,
      align: "center",
    });
    text(ctx, "you'll drive on.", W / 2, 556, {
      font: SERIF,
      size: 88,
      align: "center",
      color: C.accent,
    });
    text(
      ctx,
      "The file is only as good as the floor you took it from.",
      W / 2,
      660,
      {
        size: 32,
        align: "center",
        color: C.tx2,
        a: easeOut(ramp(t, Wd("close", "file") - 0.1, 0.6)),
      }
    );
    ctx.restore();
  }

  // ---- public -----------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    background(ctx);
    if (live) {
      drawRun(ctx, RUN, TAPE, factorOf(live.v), {
        marks: true,
        title: "drag the radius until the marks agree",
      });
      drawKnob(ctx, live.v, Math.abs(TAPE * factorOf(live.v) - TAPE) < 0.03);
      vignette(ctx);
      return;
    }
    introBeat(ctx, t);
    orderBeat(ctx, t);
    recRadius(ctx, t);
    // "try it" and the gate share the run, marks showing
    const ga = window_(t, L("tryit").t0 - 0.35, gate.t1, 0.35);
    if (ga > 0) {
      ctx.save();
      ctx.globalAlpha *= ga;
      const v = t >= gate.t0 ? scriptedV(t) : 50;
      drawRun(ctx, RUN, TAPE, factorOf(v), {
        marks: true,
        title: "drag the radius until the marks agree",
      });
      drawKnob(ctx, v, Math.abs(TAPE * factorOf(v) - TAPE) < 0.03);
      ctx.restore();
    }
    recSpeed(ctx, t);
    recSlip(ctx, t);
    loopBeat(ctx, t);
    recSwitch(ctx, t);
    deadbandBeat(ctx, t);
    vignette(ctx);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = { time: gate.t0, v: 50 };
    let agreeFor = 0;
    let doneAt = null;
    return {
      state: s,
      prompt() {
        if (doneAt != null) return "They agree. That's the radius.";
        const off = TAPE * factorOf(s.v) - TAPE;
        if (Math.abs(off) < 0.03) return "Hold it there.";
        return "Drag the radius until the marks agree.";
      },
      input(k, v) {
        if (k === "radius") s.v = v;
      },
      step(dt) {
        s.time += dt;
        const ok = Math.abs(TAPE * factorOf(s.v) - TAPE) < 0.03;
        agreeFor = ok ? agreeFor + dt : 0;
        if (doneAt == null && agreeFor > 0.6) doneAt = s.time;
        return doneAt != null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 3.0) return "Drag the radius.";
    if (u < 4.6) return "Too far. Back a little.";
    return "The marks agree. That's the radius.";
  }

  const gateControls = [
    {
      k: "radius",
      label: "Wheel radius",
      kind: "range",
      min: 0,
      max: 100,
      step: 0.5,
      value: 50,
    },
  ];

  return { draw, gate, liveGate, gatePromptAt, gateControls };
}
