// What Nobody Watched. The Raise And Shoot routine gives up in autonomous, and only the
// log file can say why.
//
// What is simulated, and how:
//   the routine   RaiseAndShootOpMode from the coroutines video, same 20 ms loops: fork
//                 the arm, wait up to 3 s for isAtTarget(), give up and return.
//   the arm       the Motion Magic arm from motion-magic-code, plus static friction that
//                 its gains don't overcome near the top. It stalls about eight degrees
//                 short of 0.25, still pushing about 2 V, and the wait times out.
//   the log       record() on every loop (addPeriodic), three values per loop, exactly what
//                 table.log writes. The wrong version logs only while the command runs.
// One run is simulated once in robot time and sampled; draw(t) maps narration time onto it.
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
  drawFlywheel,
  drawMotorCard,
  drawStand,
  drawTargetMark,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const DS = { x: 60, y: 56, w: 480, h: 154 };
const PIVOT = { x: 240, y: 452 };
const ARM_LEN = 140;
const FLOOR = 572;
const CARD = { x: 420, y: 236, w: 340, h: 225 };
const WHEEL = { x: 870, y: 386 };
const WHEEL_R = 60;
const CODE = { x: 1010, y: 56, w: 850, h: 512 };
const PLOT = { x: 60, y: 588, w: 1800, h: 288 };
const PX0 = PLOT.x + 250;
const PX1 = PLOT.x + PLOT.w - 30;
const MODE_Y = PLOT.y + 46; // mode strip
const ROT = { y: PLOT.y + 80, h: 100 }; // TargetRot + PositionRot
const VOLT = { y: PLOT.y + 194, h: 66 }; // AppliedVolts
const AXIS_Y = PLOT.y + PLOT.h - 12;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const TARGET = 0.25;
const REST = -0.25;
const PHYS = { kM: 2.6, b: 4, g: 12 };
const MM = { cruise: 0.5, accel: 1.2 };
const FRICTION = { stat: 7, kin: 5 }; // rad/s^2
const DT = 1 / 960;
const LOOP = 0.02;
const SR = 240;
const AUTO = 15;
const ARM_TOL = 1 / 360;

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

function armVolts(a) {
  if (a.req == null) return 0;
  const phi = a.rot * TAU;
  const e = (a.sp.p - a.rot) * TAU;
  const ev = (a.sp.v - a.w) * TAU;
  const v =
    (PHYS.g * Math.cos(phi) + PHYS.b * a.sp.v * TAU + 0.7 * a.sp.a * TAU) /
      PHYS.kM +
    10 * e +
    3.5 * ev;
  return clamp(v, -12, 12);
}

function stepArm(a, friction) {
  if (a.req != null) stepProfile(a.sp, a.req, DT);
  a.volts = armVolts(a);
  const phi = a.rot * TAU;
  let acc = PHYS.kM * a.volts - PHYS.g * Math.cos(phi) - PHYS.b * a.w * TAU;
  if (friction) {
    if (Math.abs(a.w) < 2e-3 && Math.abs(acc) < FRICTION.stat) {
      acc = 0;
      a.w = 0;
    } else acc -= Math.sign(a.w || acc) * FRICTION.kin;
  }
  a.w += (acc / TAU) * DT;
  a.rot += a.w * DT;
}

// Autonomous: Raise And Shoot, with an arm that stalls short. Starts disabled at u0.
function simulateAuto({ u0 = -1.5, dur = 12 } = {}) {
  const a = {
    rot: REST,
    w: 0,
    sp: { p: REST, v: 0, a: 0 },
    req: null,
    volts: 0,
  };
  const r = { pc: 0, waitStart: 0, ended: null, reason: null, forked: false };
  const log = [];
  const samples = [];
  const loop = (u) => {
    if (u > 0 && r.ended == null) {
      if (r.pc === 0) {
        r.forked = true;
        r.pc = 1;
        r.waitStart = u;
      }
      if (r.pc === 1) {
        if (Math.abs(a.rot - TARGET) < ARM_TOL) {
          r.pc = 2; // would fork the flywheel; this arm never gets here
        } else if (u - r.waitStart >= 3 - 1e-9) {
          r.ended = u;
          r.reason = "timeout";
        }
      }
    }
    if (r.forked && r.ended == null && a.req == null) {
      a.req = TARGET;
      a.sp = { p: a.rot, v: 0, a: 0 };
    }
    // record(), every loop, from addPeriodic
    log.push({
      u,
      pos: a.rot,
      tgt: a.req == null ? 0 : TARGET,
      volts: a.volts,
    });
  };
  let u = u0;
  let next = Math.ceil(u0 / LOOP + 1e-9) * LOOP;
  for (let i = 0, n = Math.ceil(dur * SR); i <= n; i++) {
    const until = u0 + i / SR;
    while (u < until - 1e-12) {
      if (u >= next - 1e-9) {
        loop(Math.round(next / LOOP) * LOOP);
        next += LOOP;
      }
      stepArm(a, true);
      u += DT;
    }
    samples.push({
      u: until,
      rot: a.rot,
      sp: a.sp.p,
      req: a.req,
      volts: a.volts,
      waiting: r.forked && r.ended == null,
      waitStart: r.waitStart,
      ended: r.ended,
    });
  }
  return { u0, samples, log };
}

// Teleop: hold the trigger, let go halfway; record() is inside vertical().
function simulateTele({ u0 = -0.3, dur = 2.8, press = 0, release = 0.7 } = {}) {
  const a = {
    rot: REST,
    w: 0,
    sp: { p: REST, v: 0, a: 0 },
    req: null,
    volts: 0,
  };
  const log = [];
  const samples = [];
  let cmd = false;
  const loop = (u) => {
    cmd = u > press && u <= release + 1e-9;
    if (cmd) {
      if (a.req == null) {
        a.req = TARGET;
        a.sp = { p: a.rot, v: 0, a: 0 };
      }
      log.push({ u, pos: a.rot, tgt: TARGET, volts: a.volts }); // only while the command runs
    }
  };
  let u = u0;
  let next = Math.ceil(u0 / LOOP + 1e-9) * LOOP;
  for (let i = 0, n = Math.ceil(dur * SR); i <= n; i++) {
    const until = u0 + i / SR;
    while (u < until - 1e-12) {
      if (u >= next - 1e-9) {
        loop(Math.round(next / LOOP) * LOOP);
        next += LOOP;
      }
      stepArm(a, false);
      u += DT;
    }
    samples.push({
      u: until,
      rot: a.rot,
      sp: a.sp.p,
      req: a.req,
      volts: a.volts,
      cmd,
    });
  }
  return { u0, samples, log, press, release };
}

const sampleAt = (run, u) =>
  run.samples[clamp(Math.floor((u - run.u0) * SR), 0, run.samples.length - 1)];
const logAt = (run, u) => {
  let best = null;
  for (const p of run.log) {
    if (p.u <= u + 1e-9) best = p;
    else break;
  }
  return best;
};

function mapKeys(keys, t) {
  if (t <= keys[0][0]) return { u: keys[0][1], rate: 0 };
  for (let i = 1; i < keys.length; i++) {
    const [ta, ua] = keys[i - 1];
    const [tb, ub] = keys[i];
    if (t <= tb)
      return {
        u: ua + ((ub - ua) * (t - ta)) / (tb - ta),
        rate: (ub - ua) / (tb - ta),
      };
  }
  return { u: keys.at(-1)[1], rate: 0 };
}

// ---- code on screen -----------------------------------------------------------------

const FILES = {
  robot: {
    file: "Robot.java",
    size: 21,
    lines: [
      "public Robot() {",
      "  DataLogManager.start();",
      "  DriverStation.startDataLog(DataLogManager.getLog());",
      "}",
    ],
  },
  record: {
    file: "Arm.java",
    size: 18,
    lines: [
      "private void record() {",
      "  TelemetryTable table = Telemetry.getTable(getName());",
      "",
      '  table.log("PositionRot", getPosition().in(Rotations));',
      '  table.log("TargetRot", getTargetPosition().in(Rotations));',
      '  table.log("AppliedVolts", motor.getMotorVoltage().getValueAsDouble());',
      "}",
    ],
  },
  ctor: {
    file: "Arm.java",
    size: 21,
    lines: [
      "public Arm() {",
      "  // ... the pasted config, unchanged",
      "  motor.getConfigurator().apply(talonFXCfg);",
      "  Scheduler.getDefault().addPeriodic(() -> record());",
      "}",
    ],
  },
  wrong: {
    file: "Arm.java · the mistake",
    size: 21,
    lines: [
      "public Command vertical() {",
      "  return runRepeatedly(() -> {",
      "        setPosition(0.25);",
      "        record();",
      "      })",
      '      .named("vertical (hold)");',
      "}",
    ],
  },
  routine: {
    file: "RaiseAndShootOpMode.java",
    size: 20,
    lines: [
      "coroutine.fork(robot.arm.vertical());",
      "",
      "if (coroutine.waitUntil(",
      "    () -> robot.arm.isAtTarget(),",
      "    Seconds.of(3.0)).timedOut()) {",
      "  return;",
      "}",
      "",
      "coroutine.fork(robot.flywheel.runFast());",
    ],
  },
};

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const AUTO_RUN = simulateAuto();
  const TELE = simulateTele();
  const GIVE = AUTO_RUN.samples.at(-1).ended; // when the wait timed out
  const STEP = AUTO_RUN.log.find((p) => p.tgt > 0).u; // when TargetRot stepped
  const VIEW_AUTO = { u0: -1.5, u1: 6.5 };
  const VIEW_TELE = { u0: -0.3, u1: 2.5 };

  // ---- when things happen ------------------------------------------------------
  const T = {
    coldRun: [
      [Wd("cold", "runs.") - 0.1, -0.2],
      [Wd("cold", "then") + 0.3, GIVE + 0.08],
    ],
    plotIn: Wd("intro", "log") - 0.2,
    robot: L("start").t0 - 0.2,
    band: Wd("start", "enabled,"),
    mode: Wd("start", "mode"),
    record: L("record").t0 - 0.2,
    rowPos: Wd("record", "where"),
    rowTgt: Wd("record", "trying"),
    rowVolts: Wd("record", "voltage"),
    units: Wd("record", "units"),
    ctor: L("always").t0 - 0.2,
    fill: [
      [Wd("always", "runs"), VIEW_AUTO.u0],
      [Wd("always", "program.") + 0.6, VIEW_AUTO.u1],
    ],
    wrong: L("wrong").t0 - 0.2,
    teleRun: [
      [Wd("wrong", "command") - 0.05, -0.1],
      [Wd("wrong", "trigger,") - 0.05, TELE.release + 0.005],
      [L("wrong").t1 + 0.4, 1.9],
    ],
    back: L("tryit").t0 - 0.3,
  };
  const CURSOR0 = 0.6;
  const scriptCursor = (t) => {
    // the scripted gate: drag right, find the moment, snap
    const k = easeInOut(clamp((t - gate.t0 - 0.8) / 2.6));
    return CURSOR0 + (GIVE - 0.12 - CURSOR0) * k;
  };
  const SNAP_T = gate.t0 + 3.5;

  // the scene state for narration time t
  function viewAt(t) {
    const V = {
      t,
      file: null,
      plot: "none",
      rows: 0,
      band: 0,
      mode: 0,
      head: null,
      run: AUTO_RUN,
      view: VIEW_AUTO,
      bench: "auto",
      u: 0,
      cursor: null,
      snapped: null,
    };
    if (t < T.plotIn) V.u = mapKeys(T.coldRun, t).u;
    else V.u = GIVE + 0.08;
    if (t >= T.plotIn) V.plot = "auto";
    if (t >= T.robot) V.file = "robot";
    if (t >= T.record) V.file = "record";
    if (t >= T.ctor) V.file = "ctor";
    if (t >= T.wrong) V.file = "wrong";
    if (t >= T.back) V.file = "routine";
    V.band = easeOut(ramp(t, T.band - 0.2, 0.5));
    V.mode = easeOut(ramp(t, T.mode - 0.2, 0.5));
    V.rows = [T.rowPos, T.rowTgt, T.rowVolts].map((x) =>
      easeOut(ramp(t, x - 0.15, 0.4))
    );
    if (t >= T.fill[0][0]) {
      const { u } = mapKeys(T.fill, t);
      V.head = u;
      if (t < T.wrong) V.u = Math.max(u, VIEW_AUTO.u0);
    } else V.head = VIEW_AUTO.u0; // nothing recorded yet on screen
    if (t >= T.wrong && t < T.back) {
      V.run = TELE;
      V.view = VIEW_TELE;
      V.bench = "tele";
      const m = mapKeys(T.teleRun, t);
      V.u = m.u;
      V.rate = m.rate;
      V.head = m.u;
      V.plot = "tele";
    }
    if (t >= T.back) {
      V.head = VIEW_AUTO.u1;
      V.cursor =
        t >= gate.t0 ? (t >= SNAP_T ? GIVE : scriptCursor(t)) : CURSOR0;
      if (t >= SNAP_T) V.snapped = SNAP_T;
      V.u = V.cursor;
    }
    return V;
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 520, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("cold").t0 - 0.4, x: 520, y: 330, z: 1.35, d: 0.01 },
    { t: L("intro").t0, ...FULL, d: 1.2 },
    { t: L("start").t0 - 0.3, x: 1300, y: 360, z: 1.3, d: 1.2 },
    { t: Wd("start", "enabled,") - 0.6, ...FULL, d: 1.0 },
    { t: L("record").t0 - 0.2, x: 1300, y: 330, z: 1.3, d: 1.0 },
    { t: Wd("record", "where") - 0.3, ...FULL, d: 1.0 },
    { t: L("tryit").t0 - 0.3, ...FULL, d: 0.8 },
    { t: L("found").t0 - 0.2, x: 960, y: 610, z: 1.0, d: 1.0 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawDS(ctx, V) {
    const s = sampleAt(AUTO_RUN, V.u + (V.snapped != null ? 0.02 : 0));
    panel(ctx, DS, C.bg2);
    micro(ctx, "driver station · autonomous", DS.x + 22, DS.y + 34, {
      size: 17,
    });
    rrect(ctx, DS.x + 22, DS.y + 52, 276, 50, 4);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, "Raise And Shoot", DS.x + 38, DS.y + 86, {
      size: 25,
      weight: 600,
    });
    ctx.fillStyle = C.tx3;
    ctx.beginPath();
    ctx.moveTo(DS.x + 270, DS.y + 72);
    ctx.lineTo(DS.x + 284, DS.y + 72);
    ctx.lineTo(DS.x + 277, DS.y + 81);
    ctx.fill();
    const on = V.u > 0;
    const left = on ? Math.max(0, AUTO - V.u) : AUTO;
    text(ctx, `${left.toFixed(1)} s`, DS.x + DS.w - 22, DS.y + 92, {
      font: MONO,
      size: 40,
      weight: 600,
      align: "right",
      color: on ? C.accent : C.tx2,
    });
    ctx.fillStyle = alpha(C.tx3, 0.25);
    ctx.fillRect(DS.x + 22, DS.y + 118, DS.w - 44, 6);
    ctx.fillStyle = C.accent;
    ctx.fillRect(DS.x + 22, DS.y + 118, (DS.w - 44) * (left / AUTO), 6);
    let status = "disabled";
    let color = C.tx3;
    if (on && s.waiting) {
      status = `enabled · waiting on the arm  ${(V.u - s.waitStart).toFixed(1)} of 3.0 s`;
      color = C.accent;
    } else if (on && s.ended != null) {
      status = "enabled · routine ended";
      color = C.err;
    } else if (on) {
      status = "enabled";
      color = C.accent;
    }
    text(ctx, status, DS.x + 22, DS.y + 146, {
      font: MONO,
      size: 17,
      weight: 600,
      color,
    });
  }

  function drawPad(ctx, held) {
    ctx.save();
    ctx.translate(DS.x + 20, DS.y + 20);
    ctx.scale(0.55, 0.55);
    ctx.beginPath();
    ctx.rect(-20, 0, 500, 300);
    ctx.clip();
    drawController(ctx, { x: 0, y: 0 }, { lt: held, label: false });
    ctx.restore();
    text(
      ctx,
      held ? "left trigger held" : "left trigger up",
      DS.x + 300,
      DS.y + 100,
      { font: MONO, size: 22, weight: 600, color: held ? C.accent : C.tx3 }
    );
    micro(ctx, "teleop · MyTeleop", DS.x + 300, DS.y + 60, { size: 17 });
  }

  function drawBench(ctx, V) {
    const run = V.bench === "tele" ? TELE : AUTO_RUN;
    const s = sampleAt(run, V.u);
    drawStand(ctx, PIVOT, FLOOR);
    drawTargetMark(ctx, PIVOT, ARM_LEN, TARGET, "0.25 rot", 1);
    const fromFile = V.cursor != null;
    if (fromFile) {
      // the arm, put back where the file says it was
      const p = logAt(AUTO_RUN, V.cursor) ?? AUTO_RUN.log[0];
      drawArmBody(ctx, PIVOT, ARM_LEN, p.pos, { driven: p.volts > 0.3 });
    } else {
      if (s.req != null && Math.abs(s.sp - s.rot) > 0.006)
        drawArmBody(ctx, PIVOT, ARM_LEN, s.sp, { ghost: true });
      drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, { driven: s.req != null });
    }
    // how short it is
    const rot = fromFile
      ? (logAt(AUTO_RUN, V.cursor) ?? AUTO_RUN.log[0]).pos
      : s.rot;
    if (V.bench === "auto" && V.u > 1.4 && TARGET - rot > 0.008) {
      text(
        ctx,
        `short by ${((TARGET - rot) * 360).toFixed(1)}°`,
        PIVOT.x - 30,
        PIVOT.y - ARM_LEN - 20,
        { font: MONO, size: 19, weight: 600, align: "right", color: C.err }
      );
    }
    if (V.bench === "auto") {
      drawFlywheel(ctx, WHEEL, WHEEL_R, 0, { rps: 0, driven: false });
      micro(ctx, "flywheel · 0 rps", WHEEL.x, WHEEL.y - WHEEL_R - 26, {
        size: 17,
        align: "center",
      });
    }
    const p = fromFile ? (logAt(AUTO_RUN, V.cursor) ?? AUTO_RUN.log[0]) : null;
    const pos = p ? p.pos : s.rot;
    const volts = p ? p.volts : s.volts;
    drawMotorCard(ctx, CARD, {
      title: fromFile ? "from the file" : "TalonFX · arm",
      led: (p ? p.tgt > 0 : s.req != null) ? C.accent : C.tx3,
      rows: [
        ["position", `${pos.toFixed(3)} rot`, C.tx, 24],
        [
          "applied volts",
          `${volts.toFixed(2)} V`,
          Math.abs(volts) > 0.2 ? C.accent : C.tx2,
          24,
        ],
      ],
    });
  }

  function drawCode(ctx, V, t, live) {
    panel(ctx, CODE);
    const key = V.file;
    if (!key) {
      micro(ctx, "the code", CODE.x + 28, CODE.y + 44);
      return;
    }
    const F = FILES[key];
    micro(ctx, F.file, CODE.x + 28, CODE.y + 44, {
      color: key === "wrong" ? C.err : C.tx3,
    });
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const lh = F.size + 14;
    const top = CODE.y + 120;
    const x = CODE.x + 28;
    const lit = litLines(key, t, V, live);
    let y = top - lh;
    F.lines.forEach((ln, i) => {
      y += ln ? lh : lh / 2;
      if (!ln) return;
      const on = lit[i];
      if (on) {
        if (on === "err") {
          ctx.fillStyle = alpha(C.err, 0.16);
          ctx.fillRect(CODE.x + 1, y - lh + 8, CODE.w - 2, lh);
          ctx.fillStyle = C.err;
          ctx.fillRect(CODE.x + 1, y - lh + 8, 4, lh);
        } else
          runBar(
            ctx,
            CODE.x + 1,
            y - lh + 8,
            CODE.w - 2,
            lh,
            typeof on === "number" ? on : 0
          );
      }
      codeLine(ctx, ln, x, y, { size: F.size });
      if (key === "record" && i >= 3)
        unitGlow(
          ctx,
          ln,
          x,
          y,
          F.size,
          easeOut(ramp(t, T.units - 0.1, 0.4)) * (live ? 0 : 1)
        );
    });
    // footnotes under the code
    const foot = (s, color = C.tx2) =>
      text(ctx, s, x, CODE.y + CODE.h - 30, { font: MONO, size: 19, color });
    if (key === "robot") {
      const k = easeOut(ramp(t, Wd("start", "notes") - 0.1, 0.4));
      foot("line 2: enabled, mode, OpMode, joysticks", alpha(C.accent, k));
    }
    if (key === "record")
      foot("→ NT:/Telemetry/Arm/…  → DataLogManager → .wpilog");
    if (key === "ctor") {
      // a tick per loop: record() runs
      const loopK = (t * 50) % 1 < 0.5 ? 1 : 0.4;
      foot(
        "every 20 ms loop, enabled or not → record()",
        alpha(C.accent, loopK)
      );
    }
    if (key === "wrong")
      foot("record() runs only while vertical() runs", C.err);
    if (key === "routine") {
      const k = V.snapped != null ? 1 : 0;
      foot(
        k
          ? "timedOut() was true → return, nothing after it ran"
          : "somewhere in the file, this gave up",
        k ? C.err : C.tx3
      );
    }
  }

  function litLines(key, t, V, live) {
    const lit = {};
    if (key === "robot") {
      const both = !live && t < Wd("start", "notes") - 0.1;
      if (both) lit[1] = lit[2] = 1;
      else lit[2] = 1;
    }
    if (key === "record") {
      if (t < T.rowPos - 0.15) lit[1] = 1;
      else if (t < T.rowTgt - 0.15) lit[3] = 1;
      else if (t < T.rowVolts - 0.15) lit[4] = 1;
      else if (t < T.units - 0.1) lit[5] = 1;
      else lit[3] = lit[4] = lit[5] = 1;
    }
    if (key === "ctor")
      lit[3] = 0.5 + 0.5 * Math.cos(((t % 0.25) / 0.25) * TAU);
    if (key === "wrong") {
      const s = sampleAt(TELE, V.u);
      if (s.cmd)
        lit[1] =
          lit[2] =
          lit[3] =
            0.5 + 0.5 * Math.cos(((t % 0.25) / 0.25) * TAU);
    }
    if (key === "routine") {
      if (V.snapped != null) lit[4] = lit[5] = "err";
      else lit[2] = lit[3] = lit[4] = 0;
    }
    return lit;
  }

  // the unit words: in the name and in the call
  function unitGlow(ctx, ln, x, y, size, k) {
    if (k <= 0) return;
    for (const word of ["Rot", "Rotations", "Volts"]) {
      const re = new RegExp(word + "(?![a-z])", "g");
      let m;
      while ((m = re.exec(ln))) {
        const x0 = x + codeWidth(ctx, ln.slice(0, m.index), size);
        const w = codeWidth(ctx, word, size);
        ctx.fillStyle = alpha(C.accent, 0.9 * k);
        ctx.fillRect(x0, y + 5, w, 3);
      }
    }
  }

  // ---- the plot ------------------------------------------------------------------

  function drawPlot(ctx, V, t, live) {
    if (V.plot === "none") {
      const k = 0;
      void k;
      return;
    }
    const a = live ? 1 : easeOut(ramp(t, T.plotIn, 0.6));
    ctx.save();
    ctx.globalAlpha = a;
    panel(ctx, PLOT, C.bg2);
    const tele = V.plot === "tele";
    const run = tele ? TELE : AUTO_RUN;
    const view = V.view;
    const X = (u) => PX0 + ((u - view.u0) / (view.u1 - view.u0)) * (PX1 - PX0);
    const U = (x) => view.u0 + ((x - PX0) / (PX1 - PX0)) * (view.u1 - view.u0);
    const Yr = (v) => ROT.y + ROT.h - ((v + 0.3) / 0.6) * ROT.h;
    const Yv = (v) => VOLT.y + VOLT.h - (clamp(v, 0, 12) / 12) * VOLT.h;
    // the file
    if (V.cursor == null)
      micro(
        ctx,
        tele
          ? "the log · record() inside the command"
          : "the log · NT:/Telemetry/Arm",
        PLOT.x + 24,
        PLOT.y + 32,
        { color: tele ? C.err : C.tx3 }
      );
    if (V.cursor == null)
      text(
        ctx,
        "read it back in AdvantageScope",
        PLOT.x + PLOT.w - 24,
        PLOT.y + 32,
        { font: MONO, size: 17, align: "right", color: C.tx3 }
      );
    // enabled band and the mode strip (startDataLog)
    const band = live ? 1 : V.band;
    if (band > 0) {
      const bx0 = Math.max(PX0, X(0));
      ctx.fillStyle = alpha(C.accent, 0.07 * band);
      ctx.fillRect(bx0, MODE_Y - 2, PX1 - bx0, VOLT.y + VOLT.h - MODE_Y + 6);
      text(ctx, "enabled", bx0 + 10, MODE_Y + 18, {
        font: MONO,
        size: 17,
        weight: 600,
        color: C.accent,
        a: band,
      });
      text(ctx, "DS:enabled", PLOT.x + 24, MODE_Y + 18, {
        font: MONO,
        size: 17,
        color: C.tx2,
        a: band,
      });
    }
    const mode = live ? 1 : V.mode;
    if (mode > 0) {
      const bx0 = Math.max(PX0, X(0));
      text(
        ctx,
        tele ? "teleop · MyTeleop" : "autonomous · Raise And Shoot",
        PX1 - 12,
        MODE_Y + 18,
        { font: MONO, size: 17, align: "right", color: C.tx2, a: mode }
      );
    }
    if (tele) {
      // the trigger
      const x0 = X(TELE.press);
      const x1 = X(Math.min(V.u, TELE.release));
      if (V.u > TELE.press) {
        ctx.fillStyle = alpha(C.accent, 0.16);
        ctx.fillRect(
          x0,
          ROT.y - 8,
          Math.max(0, x1 - x0),
          VOLT.y + VOLT.h - ROT.y + 12
        );
        text(ctx, "LT held", x0 + 8, VOLT.y + 14, {
          font: MONO,
          size: 16,
          weight: 600,
          color: C.accent,
        });
      }
    }
    // row labels
    const rows = live ? [1, 1, 1] : V.rows;
    const lbl = (s, y, k, color) =>
      k > 0 &&
      text(ctx, s, PLOT.x + 24, y, {
        font: MONO,
        size: 19,
        weight: 600,
        color,
        a: k,
      });
    lbl("Arm/PositionRot", ROT.y + 30, rows[0], C.accent);
    lbl("Arm/TargetRot", ROT.y + 60, rows[1], C.tx);
    lbl("Arm/AppliedVolts", VOLT.y + 32, rows[2], C.tx2);
    // grid
    ctx.strokeStyle = alpha(C.rule, 0.8);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const v of [-0.25, 0, 0.25]) {
      ctx.moveTo(PX0, Yr(v));
      ctx.lineTo(PX1, Yr(v));
    }
    ctx.moveTo(PX0, Yv(0));
    ctx.lineTo(PX1, Yv(0));
    ctx.stroke();
    text(ctx, "0.25", PX0 - 10, Yr(0.25) + 6, {
      font: MONO,
      size: 16,
      align: "right",
      color: C.tx3,
    });
    text(ctx, "0", PX0 - 10, Yr(0) + 6, {
      font: MONO,
      size: 16,
      align: "right",
      color: C.tx3,
    });
    text(ctx, "−0.25", PX0 - 10, Yr(-0.25) + 6, {
      font: MONO,
      size: 16,
      align: "right",
      color: C.tx3,
    });
    text(ctx, "0 V", PX0 - 10, Yv(0) + 6, {
      font: MONO,
      size: 16,
      align: "right",
      color: C.tx3,
    });
    // seconds since enable
    for (let s = Math.ceil(view.u0); s <= view.u1; s++) {
      ctx.fillStyle = C.tx3;
      ctx.fillRect(X(s), AXIS_Y - 22, 1, 6);
      text(ctx, `${s} s`, X(s), AXIS_Y, {
        font: MONO,
        size: 16,
        align: "center",
        color: C.tx3,
      });
    }
    const head = V.head;
    // the real arm, which the file did not see (only in the wrong version)
    if (tele) {
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([7, 6]);
      ctx.beginPath();
      let first = true;
      for (const s of run.samples) {
        if (s.u > head || s.u < view.u0) continue;
        if (first) ctx.moveTo(X(s.u), Yr(s.rot));
        else ctx.lineTo(X(s.u), Yr(s.rot));
        first = false;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      const s = sampleAt(run, head);
      if (head > TELE.release + 0.15)
        text(ctx, "← the arm · not in the file", X(head) + 14, Yr(s.rot) + 6, {
          font: MONO,
          size: 17,
          color: C.tx2,
        });
    }
    // the logged traces: a sample per loop; between entries the value holds
    const trace = (field, Y, color, width, k, dash) => {
      if (k <= 0) return;
      const pts = run.log.filter(
        (p) => p.u <= head + 1e-9 && p.u >= view.u0 - 0.05
      );
      if (!pts.length) return;
      ctx.save();
      ctx.globalAlpha *= k;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = "round";
      if (dash) ctx.setLineDash(dash);
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i) ctx.lineTo(X(p.u), Y(pts[i - 1][field]));
        if (i) ctx.lineTo(X(p.u), Y(p[field]));
        else ctx.moveTo(X(p.u), Y(p[field]));
      });
      // the last value written holds until the next entry
      const lastU = tele ? head : pts.at(-1).u;
      ctx.lineTo(X(Math.min(view.u1, lastU)), Y(pts.at(-1)[field]));
      ctx.stroke();
      ctx.restore();
      return pts;
    };
    trace("tgt", Yr, C.tx, 2.5, rows[1], [10, 6]);
    const pts = trace("pos", Yr, C.accent, 4, rows[0]);
    trace("volts", Yv, C.tx2, 3, rows[2]);
    // the write head: a dot per loop
    if (pts && pts.length && head < view.u1 - 1e-3 && !V.cursor) {
      const p = pts.at(-1);
      if (!tele || V.u <= TELE.release + 0.01) {
        ctx.beginPath();
        ctx.arc(X(p.u), Yr(p.pos), 8, 0, TAU);
        ctx.fillStyle = C.accent;
        ctx.fill();
      }
    }
    if (tele && V.u > TELE.release + 0.1) {
      const p = run.log.at(-1);
      text(
        ctx,
        "flat: nothing written after release",
        X(TELE.release) + 16,
        Yr(p.pos) + 30,
        { font: MONO, size: 18, weight: 600, color: C.err }
      );
    }
    if (V.cursor != null) drawCursor(ctx, V, t, X, Yr, Yv, live);
    ctx.restore();
    return { U };
  }

  function drawCursor(ctx, V, t, X, Yr, Yv, live) {
    const u = V.cursor;
    const x = X(u);
    const snapped = V.snapped != null;
    const p = logAt(AUTO_RUN, u) ?? AUTO_RUN.log[0];
    // annotations once found
    if (snapped && !live) {
      const k1 = easeOut(ramp(t, Wd("found", "three") - 0.1, 0.5));
      if (k1 > 0) {
        const y = ROT.y - 4;
        ctx.save();
        ctx.globalAlpha *= k1;
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(X(STEP), y + 8);
        ctx.lineTo(X(STEP), y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + 8);
        ctx.stroke();
        text(ctx, "3.0 s", (X(STEP) + x) / 2, y - 8, {
          font: MONO,
          size: 18,
          weight: 600,
          align: "center",
          color: C.accent,
        });
        ctx.restore();
      }
      const k2 = easeOut(ramp(t, Wd("found", "short.") - 0.1, 0.4));
      if (k2 > 0) {
        ctx.save();
        ctx.globalAlpha *= k2;
        ctx.strokeStyle = C.err;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 14, Yr(TARGET));
        ctx.lineTo(x + 14, Yr(p.pos));
        ctx.stroke();
        text(ctx, "still short", x + 24, Yr((TARGET + p.pos) / 2) + 22, {
          font: MONO,
          size: 18,
          weight: 600,
          color: C.err,
        });
        ctx.restore();
      }
      const k3 = window_(
        t,
        Wd("found", "voltage") - 0.2,
        L("close").t0 + 0.2,
        0.4
      );
      if (k3 > 0) {
        ctx.save();
        ctx.globalAlpha *= k3;
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        rrect(ctx, X(STEP) - 6, VOLT.y - 6, PX1 - X(STEP) + 2, VOLT.h + 10, 4);
        ctx.stroke();
        text(ctx, "pushing the whole time", PX1 - 12, VOLT.y + 22, {
          font: MONO,
          size: 18,
          weight: 600,
          align: "right",
          color: C.accent,
        });
        ctx.restore();
      }
      const k4 = easeOut(ramp(t, Wd("found", "tuning") - 0.1, 0.4));
      if (k4 > 0) {
        const R = { x: PX1 - 390, y: ROT.y + 46, w: 380, h: 44 };
        ctx.save();
        ctx.globalAlpha *= k4;
        rrect(ctx, R.x, R.y, R.w, R.h, 4);
        ctx.fillStyle = C.bg3;
        ctx.fill();
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        text(ctx, "a tuning problem, not wiring", R.x + R.w / 2, R.y + 29, {
          font: MONO,
          size: 19,
          weight: 600,
          align: "center",
          color: C.accent,
        });
        ctx.restore();
      }
    }
    ctx.strokeStyle = snapped ? C.err : C.tx;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, MODE_Y - 4);
    ctx.lineTo(x, VOLT.y + VOLT.h + 4);
    ctx.stroke();
    // grab handle
    rrect(ctx, x - 9, VOLT.y + VOLT.h + 2, 18, 18, 3);
    ctx.fillStyle = snapped ? C.err : C.tx;
    ctx.fill();
    for (const [v, Y, c] of [
      [p.pos, Yr, C.accent],
      [p.tgt, Yr, C.tx],
      [p.volts, Yv, C.tx2],
    ]) {
      ctx.beginPath();
      ctx.arc(x, Y(v), 6, 0, TAU);
      ctx.fillStyle = c;
      ctx.fill();
    }
    const lbl = `${u.toFixed(2)} s · PositionRot ${p.pos.toFixed(3)} · TargetRot ${p.tgt.toFixed(2)} · AppliedVolts ${p.volts.toFixed(2)}`;
    const lw = codeWidth(ctx, lbl, 17) + 24;
    const lx = clamp(x - lw / 2, PLOT.x + 10, PLOT.x + PLOT.w - lw - 10);
    rrect(ctx, lx, PLOT.y + 8, lw, 32, 3);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = snapped ? C.err : C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, lbl, lx + 12, PLOT.y + 30, {
      font: MONO,
      size: 17,
      weight: 600,
      color: snapped ? C.err : C.tx,
    });
  }

  // the cold open's verdict
  function coldTag(ctx, t) {
    const a = window_(t, Wd("cold", "then") + 0.2, L("intro").t1, 0.3);
    if (a <= 0) return;
    text(ctx, "routine over · flywheel never ran", 590, 520, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.err,
      a,
    });
  }

  // a log is a file
  function fileIcon(ctx, t) {
    const a = window_(t, Wd("intro", "file") - 0.3, L("start").t0 + 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const x = 860;
    const y = 690;
    ctx.fillStyle = C.bg3;
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 70, y);
    ctx.lineTo(x + 96, y + 26);
    ctx.lineTo(x + 96, y + 124);
    ctx.lineTo(x, y + 124);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    text(ctx, ".wpilog", x + 48, y + 80, {
      font: MONO,
      size: 17,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    text(ctx, "one file on the robot, in logs/", x + 120, y + 56, {
      font: MONO,
      size: 20,
      color: C.tx,
    });
    text(ctx, "every value, every loop, with its time", x + 120, y + 88, {
      font: MONO,
      size: 20,
      color: C.tx2,
    });
    ctx.restore();
  }

  // ---- full-screen cards -----------------------------------------------------------

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("cold").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 4 · Logging", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "What Nobody Watched", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Log from the start, all the time,", W / 2, 450, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "and the file will tell you what nobody watched.", W / 2, 560, {
      font: SERIF,
      size: 66,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "file") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  let lastPlot = null;
  function draw(ctx, t, live = null) {
    const V = live ? liveView(live) : viewAt(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    if (V.bench === "tele")
      drawPad(
        ctx,
        sampleAt(TELE, V.u).cmd || (V.u > TELE.press && V.u <= TELE.release)
      );
    else drawDS(ctx, V);
    drawBench(ctx, V);
    drawCode(ctx, V, t, !!live);
    lastPlot = drawPlot(ctx, V, t, !!live);
    if (!live) {
      coldTag(ctx, t);
      fileIcon(ctx, t);
    }
    if (
      !live &&
      V.rate != null &&
      V.bench === "tele" &&
      V.rate > 0 &&
      V.rate < 0.8
    )
      text(ctx, "slow motion", DS.x + 300, DS.y + 140, {
        font: MONO,
        size: 17,
        color: C.tx3,
      });
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveView(state) {
    return {
      t: state.time,
      file: "routine",
      plot: "auto",
      rows: [1, 1, 1],
      band: 1,
      mode: 1,
      head: VIEW_AUTO.u1,
      run: AUTO_RUN,
      view: VIEW_AUTO,
      bench: "auto",
      u: state.cursor,
      cursor: state.cursor,
      snapped: state.snapped,
    };
  }

  function liveGate() {
    const state = {
      time: gate.t0,
      cursor: CURSOR0,
      snapped: null,
      drag: false,
    };
    const U = (x) =>
      VIEW_AUTO.u0 + ((x - PX0) / (PX1 - PX0)) * (VIEW_AUTO.u1 - VIEW_AUTO.u0);
    const move = (u) => {
      if (state.snapped != null) return;
      state.cursor = clamp(u, VIEW_AUTO.u0, VIEW_AUTO.u1);
      if (Math.abs(state.cursor - GIVE) < 0.15) {
        state.cursor = GIVE;
        state.snapped = state.time;
      }
    };
    return {
      state,
      prompt: () =>
        state.snapped != null
          ? "There. Three seconds after the target stepped: timedOut()."
          : "Drag the cursor (or J / L) to where it gave up.",
      input(k, down) {
        if (!down) return;
        if (k === "left") move(state.cursor - 0.1);
        if (k === "right") move(state.cursor + 0.1);
      },
      pointer(type, x, y) {
        if (
          type === "down" &&
          x >= PLOT.x &&
          x <= PLOT.x + PLOT.w &&
          y >= PLOT.y &&
          y <= PLOT.y + PLOT.h + 20
        )
          state.drag = true;
        if (type === "up") state.drag = false;
        if (state.drag && (type === "down" || type === "move")) move(U(x));
      },
      step(dt) {
        state.time += dt;
        return state.snapped != null && state.time - state.snapped > 2.0;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    if (t < SNAP_T) return "Drag the cursor (or J / L) to where it gave up.";
    return "There. Three seconds after the target stepped: timedOut().";
  }

  const gateControls = [
    { k: "left", label: "◀ earlier", key: "KeyJ", kind: "press" },
    { k: "right", label: "later ▶", key: "KeyL", kind: "press" },
  ];

  void lastPlot;
  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
