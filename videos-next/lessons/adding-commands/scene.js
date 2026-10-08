// Every Command Is a Hold. The setters are private, so a command is the only way in;
// each command hands its job to runRepeatedly, which runs it every loop until
// something else takes the arm.
//
// What is on screen, and what is live:
//   the code        Arm.java from mech-2-Commands, typed in as the narration adds it,
//                   the running command's lines lit, its lambda pulsing every loop
//   the scheduler   which command has the arm, and which one it just canceled
//   the TalonFX     the request on the motor. A new owner's request replaces the old
//                   one on its first loop; until then the old one is still there
//   the arm         voltage-driven: 3 V lifts it part way, 6 V spins it over the top,
//                   NeutralOut lets it coast back down
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
  drawMotorCard,
  drawStand,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const SCHED = { x: 60, y: 70, w: 440, h: 330 };
const CARD = { x: 60, y: 450, w: 440, h: 370 };
const PIVOT = { x: 770, y: 450 };
const ARM_LEN = 210;
const CODE = { x: 1040, y: 50, w: 820, h: 840 };
const LH = 26;
const CS = 20; // code size
const REST = -0.25;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const PHYS = { kM: 2.6, b: 4, g: 10 };
const DT = 1 / 960;
const LOOP = 0.45; // one drawn loop; the real one is 20 ms
const LAND = 0.55; // fraction of a loop for a request to reach the motor

const CMDS = {
  runSlow: {
    name: "runSlow (hold)",
    req: "VoltageOut",
    volts: 3,
    chip: "3.0 V",
  },
  runFast: {
    name: "runFast (hold)",
    req: "VoltageOut",
    volts: 6,
    chip: "6.0 V",
  },
  stop: { name: "stop (hold)", req: "NeutralOut", volts: 0, chip: "neutral" },
};
const ORDER = ["runSlow", "runFast", "stop"];

function stepArm(s, v, dt) {
  const phi = s.rot * TAU;
  const acc = PHYS.kM * v - PHYS.g * Math.cos(phi) - PHYS.b * s.w * TAU;
  s.w += (acc / TAU) * dt;
  s.rot += s.w * dt;
}

// The owner's request lands on its first loop and again every loop after. Nothing
// clears it when the owner is canceled; the next owner's request replaces it.
function control(s) {
  if (s.owner && s.time - s.ownerAt >= LAND * LOOP) s.request = s.owner;
  s.volts = s.request ? CMDS[s.request].volts : 0;
  return s.volts;
}

function schedule(s, k) {
  if (s.owner === k) return false;
  if (s.owner) s.canceled = { k: s.owner, at: s.time };
  s.owner = k;
  s.ownerAt = s.time;
  return true;
}

const fresh = (time = 0) => ({
  time,
  rot: REST,
  w: 0,
  owner: null,
  ownerAt: -9,
  canceled: null,
  request: null,
  volts: 0,
  restartedAt: time,
});

function simulate(events, duration, rate) {
  const s = fresh(0);
  const out = [];
  let e = 0;
  for (let i = 0, n = Math.ceil(duration * rate) + 2; i < n; i++) {
    while (s.time < i / rate) {
      while (e < events.length && events[e].t <= s.time) events[e++].do(s);
      stepArm(s, control(s), DT);
      s.time += DT;
    }
    out.push({ ...s });
  }
  return out;
}

// ---- the code on screen (mech-2-Commands, Arm.java) ------------------------------------

// Each line: s, open (when its space opens), at (when it types), and its role.
function codeModel(T) {
  const block = (open, lines) =>
    lines.map((l, i) => ({ ...l, open, at: open + 0.12 + i * 0.22 }));
  const cmd = (k, comment, lambda, open) =>
    block(open, [
      { s: "", blank: true },
      { s: comment, comment: true },
      { s: `public Command ${k}() {`, cmd: k },
      { s: `  return runRepeatedly(${lambda})`, cmd: k, lambda: true },
      { s: `      .named("${CMDS[k].name}");`, cmd: k, name: true },
      { s: "}" },
    ]);
  return [
    { s: "import org.wpilib.command3.Command;", open: T.imp, at: T.imp + 0.1 },
    { s: "import org.wpilib.command3.Mechanism;", open: 0, at: 0 },
    ...cmd(
      "runSlow",
      "/** Push the arm at 3 volts and keep pushing. Never finishes. */",
      "() -> setVoltage(3.0)",
      T.slow
    ),
    ...cmd(
      "runFast",
      "/** Push the arm at 6 volts and keep pushing. Never finishes. */",
      "() -> setVoltage(6.0)",
      T.fast
    ),
    ...cmd(
      "stop",
      "/** Stop the arm motor and keep it stopped. Never finishes. */",
      "() -> stopMotor()",
      T.stop
    ),
    { s: "", blank: true, open: 0, at: 0 },
    {
      s: "private void setVoltage(double voltage) {",
      open: 0,
      at: 0,
      lock: true,
      setter: "v",
    },
    {
      s: "  motor.setControl(voltageOut.withOutput(voltage));",
      open: 0,
      at: 0,
      setter: "v",
      send: true,
    },
    { s: "}", open: 0, at: 0 },
    { s: "", blank: true, open: 0, at: 0 },
    { s: "/** Stop the motor. */", open: 0, at: 0, comment: true },
    {
      s: "private void stopMotor() {",
      open: 0,
      at: 0,
      lock: true,
      setter: "n",
    },
    { s: "  motor.stopMotor();", open: 0, at: 0, setter: "n", send: true },
    { s: "}", open: 0, at: 0 },
  ];
}

// a small padlock centred on (x, y)
function drawLock(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y - 6, 7, Math.PI, 0);
  ctx.lineTo(x + 7, y);
  ctx.moveTo(x - 7, y - 6);
  ctx.lineTo(x - 7, y);
  ctx.stroke();
  rrect(ctx, x - 11, y - 1, 22, 16, 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    imp: Wd("first", "Here's") - 0.3,
    slow: Wd("first", "first") - 0.1,
    fast: Wd("three", "other") - 0.1,
    stop: Wd("three", "two") + 0.3,
    bounce: Wd("intro", "nothing") - 0.1,
    run: Wd("every", "every") - 0.1,
    snap: Wd("named", "command.") - 0.1,
    leave: Wd("named", "Leave") - 0.1,
  };
  const code = codeModel(T);

  const events = [
    { t: T.run, do: (s) => schedule(s, "runSlow") },
    { t: Wd("three", "six") - 0.05, do: (s) => schedule(s, "runFast") },
    { t: Wd("three", "stop.") - 0.05, do: (s) => schedule(s, "stop") },
    // the gate, played for you: three picks, two swaps
    { t: gate.t0, do: (s) => Object.assign(s, fresh(s.time)) },
    { t: gate.t0 + 0.8, do: (s) => schedule(s, "runSlow") },
    { t: gate.t0 + 3.0, do: (s) => schedule(s, "runFast") },
    { t: gate.t0 + 5.3, do: (s) => schedule(s, "stop") },
    // something else takes the arm
    { t: Wd("hold", "takes") - 0.1, do: (s) => schedule(s, "runSlow") },
  ].sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = simulate(events, VOICE.duration, RATE);
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 465, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("first").t0 - 0.3, x: 1420, y: 260, z: 1.45, d: 1.2 },
    { t: Wd("every", "every") - 0.6, ...FULL, d: 1.2 },
    { t: L("tryit").t0, ...FULL, d: 1.0 },
  ];

  const loopPhase = (s, t) =>
    s.owner ? ((((t - s.ownerAt) % LOOP) + LOOP) % LOOP) / LOOP : -1;

  // where each line sits at time tt (lines open their space as they arrive)
  function layout(tt) {
    let ly = CODE.y + 110 - LH;
    return code.map((ln) => {
      const k = easeOut(ramp(tt, ln.open, 0.35));
      ly += (ln.blank ? LH / 2 : LH) * k;
      return { y: ly, k };
    });
  }

  // ---- pieces --------------------------------------------------------------------

  function drawCode(ctx, s, t, live, pos) {
    panel(ctx, CODE);
    micro(ctx, "Arm.java · mech-2-Commands", CODE.x + 28, CODE.y + 44);
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const tt = live ? 1e9 : t;
    const ph = loopPhase(s, t);
    const pulse = ph >= 0 ? (1 - ph) ** 2 : 0;
    const setter = s.owner ? (s.owner === "stop" ? "n" : "v") : null;
    const landed = s.owner && s.request === s.owner;
    ctx.save();
    ctx.beginPath();
    ctx.rect(CODE.x, CODE.y + 68, CODE.w, CODE.h - 70);
    ctx.clip();
    code.forEach((ln, i) => {
      const { y: ly, k } = pos[i];
      if (ln.blank || k < 0.5) return;
      const a = clamp((k - 0.5) * 2);
      const own = ln.cmd && ln.cmd === s.owner;
      const runsSetter = ln.setter && ln.setter === setter && landed;
      if (own)
        runBar(ctx, CODE.x + 1, ly - 19, CODE.w - 2, LH, ln.lambda ? pulse : 0);
      if (runsSetter) runBar(ctx, CODE.x + 1, ly - 19, CODE.w - 2, LH, pulse);
      const n = Math.floor(clamp((tt - ln.at) / 0.4) * ln.s.length);
      const str = ln.s.slice(0, n);
      if (ln.comment)
        text(ctx, str, CODE.x + 28, ly, {
          font: MONO,
          size: 18,
          color: C.tx3,
          a,
        });
      else codeLine(ctx, str, CODE.x + 28, ly, { a, size: CS });
      if (ln.lock) {
        const hot = live
          ? 0
          : window_(t, L("intro").t0 - 0.2, L("first").t0 - 0.2, 0.3);
        drawLock(
          ctx,
          CODE.x + CODE.w - 48,
          ly - 8,
          hot > 0 ? alpha(C.accent, 0.4 + 0.6 * hot) : C.tx3
        );
      }
      if (ln.send && runsSetter)
        text(ctx, "→ motor", CODE.x + CODE.w - 80, ly, {
          font: MONO,
          size: 18,
          weight: 600,
          align: "right",
          color: C.accent,
        });
      // every name ends in (hold)
      if (ln.name && !live) {
        const order = ORDER.indexOf(ln.cmd);
        const kh = window_(
          t,
          Wd("hold", "Hold.") - 0.2 + order * 0.15,
          L("close").t0,
          0.3
        );
        if (kh > 0) {
          const pre = `      .named("${CMDS[ln.cmd].name.replace(" (hold)", " ")}`;
          const x0 = CODE.x + 28 + codeWidth(ctx, pre, CS);
          const x1 = x0 + codeWidth(ctx, "(hold)", CS);
          ctx.strokeStyle = alpha(C.accent, kh);
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x0, ly + 6);
          ctx.lineTo(x0 + (x1 - x0) * easeOut(kh), ly + 6);
          ctx.stroke();
        }
      }
    });
    ctx.restore();

    // the runSlow callouts: the arrow hands the job over, runRepeatedly runs it
    if (!live) {
      const li = code.findIndex((ln) => ln.lambda && ln.cmd === "runSlow");
      const ni = code.findIndex((ln) => ln.name && ln.cmd === "runSlow");
      const ly = pos[li].y;
      const pre = "  return runRepeatedly(";
      const xa = CODE.x + 28 + codeWidth(ctx, pre, CS);
      const xb = xa + codeWidth(ctx, "() ->", CS);
      const xe =
        CODE.x +
        28 +
        codeWidth(ctx, "  return runRepeatedly(() -> setVoltage(3.0))", CS);
      const xr = CODE.x + 28 + codeWidth(ctx, "  return ", CS);
      const xr1 = xr + codeWidth(ctx, "runRepeatedly", CS);
      const end = L("named").t0;
      const ka = window_(t, Wd("every", "arrow") - 0.2, end, 0.3);
      const kr = window_(t, Wd("every", "this") - 0.2, end, 0.3);
      const kn = window_(t, Wd("named", "name") - 0.2, L("three").t0, 0.3);
      const under = (x0, x1, y, k) => {
        if (k <= 0) return;
        ctx.strokeStyle = alpha(C.accent, k);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + (x1 - x0) * easeOut(k), y);
        ctx.stroke();
      };
      under(xa, xb, ly + 6, ka);
      under(xr, xr1, ly + 9, kr);
      text(ctx, "hands the job over", xe + 24, ly, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.accent,
        a: ka * (1 - kr),
      });
      text(ctx, "runs it every loop", xe + 24, ly, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.accent,
        a: kr,
      });
      const ny = pos[ni].y;
      const xn = CODE.x + 28 + codeWidth(ctx, "      ", CS);
      under(
        xn,
        xn + codeWidth(ctx, '.named("runSlow (hold)");', CS),
        ny + 6,
        kn
      );
      text(
        ctx,
        "makes it a Command",
        xn + codeWidth(ctx, '.named("runSlow (hold)");', CS) + 24,
        ny,
        { font: MONO, size: 18, weight: 600, color: C.accent, a: kn }
      );
    }
  }

  // the outside call that bounces off the lock
  function drawBounce(ctx, t, pos) {
    const t0 = T.bounce;
    if (t < t0 || t > L("first").t0) return;
    const li = code.findIndex((ln) => ln.lock);
    const y = pos[li].y - 8;
    const hit = t0 + 0.9;
    const u =
      t < hit
        ? easeInOut(ramp(t, t0, 0.9))
        : 1 - 0.35 * easeOut(ramp(t, hit, 0.5));
    const w = 330;
    const x = 560 + (CODE.x - 10 - w - 560) * u;
    const a = window_(t, t0, L("first").t0, 0.3);
    const bad = t >= hit;
    ctx.save();
    ctx.globalAlpha = a;
    rrect(ctx, x, y - 24, w, 44, 4);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = bad ? C.err : C.tx3;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, "robot.arm.setVoltage(3.0)", x + w / 2, y + 6, {
      font: MONO,
      size: 19,
      weight: 600,
      align: "center",
      color: bad ? C.err : C.tx,
    });
    micro(ctx, "from outside the arm", x + 4, y - 38, { size: 16 });
    if (bad) {
      text(ctx, "setVoltage(double) has private access in Arm", 520, y + 58, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.err,
        a: easeOut(ramp(t, hit, 0.4)),
      });
    }
    ctx.restore();
    // a command is the only way in
    const kc = easeOut(ramp(t, Wd("intro", "command") - 0.1, 0.5));
    if (kc > 0)
      text(ctx, "the only way in: a command", 520, y + 104, {
        font: SANS,
        size: 26,
        weight: 600,
        color: C.accent,
        a: kc * a,
      });
  }

  function linkPoint(y0, k) {
    const P0 = [CODE.x, y0];
    const P1 = [960, 905];
    const P2 = [640, 905];
    const P3 = [CARD.x + CARD.w, CARD.y + 300];
    const u = 1 - k;
    const f = (i) =>
      u * u * u * P0[i] +
      3 * u * u * k * P1[i] +
      3 * u * k * k * P2[i] +
      k * k * k * P3[i];
    return [f(0), f(1)];
  }

  function drawLink(ctx, s, t, pos) {
    const ph = loopPhase(s, t);
    if (ph < 0) return;
    const li = code.findIndex((ln) => ln.lambda && ln.cmd === s.owner);
    const y0 = pos[li].y - 8;
    ctx.beginPath();
    ctx.moveTo(CODE.x, y0);
    ctx.bezierCurveTo(960, 905, 640, 905, CARD.x + CARD.w, CARD.y + 300);
    ctx.strokeStyle = alpha(C.accent, 0.3);
    ctx.lineWidth = 3;
    ctx.stroke();
    if (ph < LAND) {
      const [px, py] = linkPoint(y0, easeInOut(ph / LAND));
      const label = CMDS[s.owner].chip;
      rrect(ctx, px - 46, py - 17, 92, 34, 4);
      ctx.fillStyle = C.accent;
      ctx.fill();
      text(ctx, label, px, py + 7, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: C.accentInk,
      });
    }
  }

  function drawCard(ctx, s, t) {
    const ph = loopPhase(s, t);
    const land = s.request && ph >= LAND ? 1 - clamp((ph - LAND) / 0.3) : 0;
    const r = s.request ? CMDS[s.request] : null;
    drawMotorCard(ctx, CARD, {
      led: s.volts ? C.accent : C.tx3,
      lit: land,
      rows: [
        ["request on the motor", r ? r.req : "none", r ? C.accent : C.tx3, 28],
        ["output", `${s.volts.toFixed(1)} V`, s.volts ? C.tx : C.tx3, 28],
        ["sent by", r ? r.name : "–", r ? C.tx2 : C.tx3, 24],
      ],
    });
    ctx.strokeStyle = s.volts ? alpha(C.accent, 0.85) : C.rule;
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

  function drawSched(ctx, s, t, live) {
    panel(ctx, SCHED, C.bg2);
    micro(ctx, "scheduler · the arm", SCHED.x + 24, SCHED.y + 40);
    const ph = loopPhase(s, t);
    const beat = ph >= 0 ? (1 - ph) ** 3 : 0;
    ctx.beginPath();
    ctx.arc(SCHED.x + SCHED.w - 120, SCHED.y + 33, 9 + 4 * beat, 0, TAU);
    ctx.fillStyle = ph >= 0 ? alpha(C.accent, 0.35 + 0.65 * beat) : C.bg3;
    ctx.fill();
    text(ctx, "every loop", SCHED.x + SCHED.w - 100, SCHED.y + 40, {
      font: MONO,
      size: 16,
      color: ph >= 0 ? C.tx2 : C.tx3,
    });
    ctx.fillStyle = C.rule;
    ctx.fillRect(SCHED.x, SCHED.y + 62, SCHED.w, 1);
    const tt = live ? 1e9 : t;
    const shown = { runSlow: T.slow, runFast: T.fast, stop: T.stop };
    ORDER.forEach((k, i) => {
      const y = SCHED.y + 84 + i * 80;
      const a = easeOut(ramp(tt, shown[k] + 0.5, 0.4));
      if (a <= 0) return;
      const own = s.owner === k;
      const canc = s.canceled && s.canceled.k === k && !own;
      const fresh = own
        ? window_(t, s.ownerAt - 0.05, s.ownerAt + 0.8, 0.12)
        : 0;
      ctx.save();
      ctx.globalAlpha = a;
      rrect(ctx, SCHED.x + 16, y, SCHED.w - 32, 64, 4);
      ctx.fillStyle = own ? alpha(C.accent, 0.12 + 0.18 * fresh) : C.bg;
      ctx.fill();
      ctx.strokeStyle = own ? C.accent : canc ? alpha(C.err, 0.7) : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (live) {
        rrect(ctx, SCHED.x + 30, y + 16, 32, 32, 3);
        ctx.fillStyle = own ? C.accent : C.bg3;
        ctx.fill();
        text(ctx, String(i + 1), SCHED.x + 46, y + 40, {
          font: MONO,
          size: 20,
          weight: 700,
          align: "center",
          color: own ? C.accentInk : C.tx3,
        });
      }
      const nx = SCHED.x + (live ? 78 : 34);
      text(ctx, CMDS[k].name, nx, y + 41, {
        font: MONO,
        size: 21,
        weight: 600,
        color: own ? C.tx : canc ? C.err : C.tx2,
      });
      if (canc) {
        ctx.strokeStyle = C.err;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nx, y + 34);
        ctx.lineTo(nx + codeWidth(ctx, CMDS[k].name, 21), y + 34);
        ctx.stroke();
      }
      const st = own ? "has the arm" : canc ? "canceled" : "";
      text(ctx, st, SCHED.x + SCHED.w - 30, y + 40, {
        font: MONO,
        size: 17,
        weight: 600,
        align: "right",
        color: own ? C.accent : C.err,
      });
      ctx.restore();
    });
  }

  function drawBench(ctx, s, t, history) {
    drawStand(ctx, PIVOT, 800);
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, { history, driven: s.volts > 0 });
    // owner badge
    if (s.owner) {
      const name = CMDS[s.owner].name;
      const fresh = window_(t, s.ownerAt - 0.05, s.ownerAt + 0.8, 0.12);
      micro(ctx, "owned by", PIVOT.x, 152, { align: "center", size: 16 });
      ctx.font = `600 22px ${MONO}`;
      const w = ctx.measureText(name).width + 36;
      rrect(ctx, PIVOT.x - w / 2, 166, w, 42, 4);
      ctx.fillStyle = alpha(C.accent, 0.14 + 0.2 * fresh);
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, name, PIVOT.x, 195, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.accent,
      });
    }
    const since = t - s.restartedAt;
    if (s.restartedAt > 0 && since < 2.2)
      text(ctx, "starting over", PIVOT.x, 110, {
        font: MONO,
        size: 20,
        align: "center",
        color: C.tx2,
        a: window_(since, 0, 2.2, 0.3),
        spacing: 1.5,
      });
  }

  // runRepeatedly(...) is not a Command until .named(...) snaps on
  function snapCard(ctx, t) {
    const a = window_(t, L("named").t0 - 0.3, L("three").t0 - 0.1, 0.4);
    if (a <= 0) return;
    const R = { x: 60, y: 70, w: 950, h: 750 };
    ctx.save();
    ctx.globalAlpha = a;
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = alpha(C.bg2, 0.98);
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "what runRepeatedly(...) hands back", R.x + 32, R.y + 50);

    const size = 20;
    const A = "runRepeatedly(() -> setVoltage(3.0))";
    const B = '.named("runSlow (hold)")';
    const aw = codeWidth(ctx, A, size) + 40;
    const bw = codeWidth(ctx, B, size) + 40;
    const x0 = R.x + (R.w - aw - bw) / 2;
    const y = R.y + 150;
    const h = 64;
    const kin = easeInOut(
      ramp(t, Wd("named", "name") - 0.1, T.snap - Wd("named", "name") + 0.1)
    );
    const snapped = t >= T.snap;
    const flash = window_(t, T.snap, T.snap + 0.7, 0.12);
    // piece A, open on the right until the name arrives
    const piece = (x, w, s, hot, openRight) => {
      ctx.strokeStyle = hot ? C.accent : C.tx3;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = hot ? alpha(C.accent, 0.1) : C.bg3;
      ctx.fillRect(x, y, w, h);
      ctx.beginPath();
      if (openRight) {
        ctx.moveTo(x + w, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.rect(x, y, w, h);
        ctx.stroke();
      }
      codeLine(ctx, s, x + 20, y + 40, { size });
    };
    if (snapped) {
      ctx.fillStyle = alpha(C.accent, 0.12 + 0.25 * flash);
      ctx.fillRect(x0, y, aw + bw, h);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0, y, aw + bw, h);
      codeLine(ctx, A, x0 + 20, y + 40, { size });
      codeLine(ctx, B, x0 + aw + 20, y + 40, { size });
      micro(ctx, "Command", x0, y + h + 40, { color: C.accent });
      text(ctx, "a Command, named runSlow (hold)", x0 + 130, y + h + 41, {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.accent,
      });
    } else {
      piece(x0, aw, A, false, true);
      text(ctx, "not a Command yet", x0, y + h + 40, {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.tx3,
      });
      if (kin > 0) {
        const bx = x0 + aw + 220 * (1 - kin);
        ctx.save();
        ctx.globalAlpha *= kin;
        piece(bx, bw, B, true, false);
        ctx.restore();
      }
    }

    // leave it off: the build fails, and says so badly
    const kl = easeOut(ramp(t, T.leave, 0.5));
    if (kl > 0) {
      ctx.globalAlpha = a * kl;
      const by = R.y + 330;
      ctx.fillStyle = C.bg;
      ctx.fillRect(R.x + 32, by, R.w - 64, 300);
      ctx.strokeStyle = alpha(C.err, 0.8);
      ctx.lineWidth = 2;
      ctx.strokeRect(R.x + 32, by, R.w - 64, 300);
      micro(ctx, "leave .named(...) off · ./gradlew build", R.x + 60, by + 44);
      codeLine(
        ctx,
        "return runRepeatedly(() -> setVoltage(3.0));",
        R.x + 60,
        by + 96,
        { size }
      );
      text(ctx, "error: incompatible types:", R.x + 60, by + 150, {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.err,
        a: easeOut(ramp(t, Wd("named", "fails") - 0.1, 0.4)),
      });
      text(
        ctx,
        "NeedsNameBuilderStage cannot be converted to Command",
        R.x + 60,
        by + 182,
        {
          font: MONO,
          size: 20,
          weight: 600,
          color: C.err,
          a: easeOut(ramp(t, Wd("named", "fails") - 0.1, 0.4)),
        }
      );
      text(ctx, "BUILD FAILED", R.x + 60, by + 230, {
        font: MONO,
        size: 22,
        weight: 700,
        color: C.err,
        a: easeOut(ramp(t, Wd("named", "error") - 0.1, 0.4)),
      });
      text(ctx, "it means: add .named(...)", R.x + R.w - 60, by + 268, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "right",
        color: C.accent,
        a: easeOut(ramp(t, Wd("named", "why.") - 0.1, 0.4)),
      });
    }
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
    micro(ctx, "Workshop 3 · Writing Commands", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Every Command Is a Hold", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Every command here is a hold.", W / 2, 450, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "It runs until something takes the arm.", W / 2, 556, {
      font: SERIF,
      size: 84,
      align: "center",
      color: C.accent,
    });
    text(ctx, "Next: the driver's thumb takes it.", W / 2, 660, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "thumb,") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? at(t);
    const history = [];
    if (!live) for (let i = 6; i >= 1; i--) history.push(at(t - i * 0.035).rot);
    else history.push(...live.trail);
    const pos = layout(live ? 1e9 : t);

    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawLink(ctx, s, t, pos);
    drawCard(ctx, s, t);
    drawBench(ctx, s, t, history);
    drawSched(ctx, s, t, !!live);
    drawCode(ctx, s, t, !!live, pos);
    if (!live) {
      drawBounce(ctx, t, pos);
      snapCard(ctx, t);
    }
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = { ...fresh(gate.t0), restartedAt: -1, trail: [] };
    let picks = 0;
    let firstAt = null;
    let lastAt = null;
    let msg = "Pick a command.";
    return {
      state: s,
      prompt: () => msg,
      input(name, down) {
        name = { slow: "runSlow", fast: "runFast", stop: "stop" }[name];
        if (!down || !name) return;
        const prev = s.owner;
        if (!schedule(s, name)) {
          msg = `${CMDS[name].name} already has the arm.`;
          return;
        }
        picks++;
        firstAt ??= s.time;
        lastAt = s.time;
        msg = prev
          ? `${CMDS[name].name} took the arm. ${CMDS[prev].name.split(" ")[0]} was canceled.`
          : `${CMDS[name].name} has the arm. Now pick another.`;
      },
      step(dt) {
        const n = Math.ceil(dt / DT);
        for (let i = 0; i < n; i++) {
          stepArm(s, control(s), dt / n);
          s.time += dt / n;
        }
        s.trail.push(s.rot);
        if (s.trail.length > 6) s.trail.shift();
        if (picks >= 3 && s.time - lastAt > 1.5) return true;
        return (
          firstAt !== null && s.time - firstAt > 6.5 && s.time - lastAt > 1.0
        );
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.8) return "Pick a command.";
    if (u < 3.0) return "runSlow (hold) has the arm. Now pick another.";
    if (u < 5.3) return "runFast (hold) took the arm. runSlow was canceled.";
    return "stop (hold) took the arm. runFast was canceled.";
  }

  return {
    draw,
    liveGate,
    gate,
    gatePromptAt,
    gateControls: [
      { k: "slow", label: "runSlow · 3 V", key: "Digit1", kind: "press" },
      { k: "fast", label: "runFast · 6 V", key: "Digit2", kind: "press" },
      { k: "stop", label: "stop", key: "Digit3", kind: "press" },
    ],
  };
}
