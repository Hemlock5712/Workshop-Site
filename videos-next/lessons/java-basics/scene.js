// Handing Over Code. A lambda is code written down and handed over, not run.
//
// What is on screen, and what is live:
//   the code       runSlow() and setVoltage() from mech-2-Commands, lit as they run
//   the package    `setVoltage(3.0)` sealed inside a lambda. Calling runSlow() puts it
//                  in a Command and nothing else happens. Running the command opens it
//                  every loop, and each opening lands a request on the motor
//   the TalonFX    the request on the motor: none until the command runs
//   the arm        voltage-driven, gravity pulls it down; 3 V lifts it part way
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

const ACTS = { x: 60, y: 70, w: 440, h: 300 }; // the two things that can happen
const CARD = { x: 60, y: 450, w: 440, h: 370 }; // TalonFX
const PIVOT = { x: 770, y: 420 };
const ARM_LEN = 220;
const CODE = { x: 1040, y: 60, w: 820, h: 460 };
const CMD = { x: 1040, y: 545, w: 820, h: 305 };
const CMDCARD = { x: 1070, y: 600, w: 520, h: 225 };
const SLOT = { x: 1330, y: 768 }; // where the package sits inside the command
const STAGE = { x: 1250, y: 462 }; // where the package sits next to the code
const CONSOLE = { x: 515, y: 60, w: 510, h: 118 };
const LH = 30;
const REST = -0.25; // hanging straight down

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const PHYS = { kM: 2.6, b: 4, g: 10 }; // rad/s^2 per volt, back-EMF damping, gravity at horizontal
const DT = 1 / 960;
const LOOP = 0.45; // one drawn loop; the real one is 20 ms
const LAND = 0.55; // fraction of a loop for the request to travel to the motor

function stepArm(s, v, dt) {
  const phi = s.rot * TAU;
  const acc = PHYS.kM * v - PHYS.g * Math.cos(phi) - PHYS.b * s.w * TAU; // rad/s^2
  s.w += (acc / TAU) * dt;
  s.rot += s.w * dt;
}

// The motor gets a request only once a running command's package has opened and its
// request has landed. Calling the method alone sends nothing.
function control(s) {
  s.request = s.running && s.time - s.runAt >= LAND * LOOP;
  s.volts = s.request ? 3 : 0;
  return s.volts;
}

const fresh = (time = 0) => ({
  time,
  rot: REST,
  w: 0,
  called: false,
  callAt: -9,
  running: false,
  runAt: -9,
  request: false,
  volts: 0,
  restartedAt: time,
  noRunAt: -9,
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

const COMMENT =
  "/** Push the arm at 3 volts and keep pushing. Never finishes. */";
const LINES = [
  { s: "public Command runSlow() {", call: true },
  {
    s: "  return runRepeatedly(() -> setVoltage(3.0))",
    call: true,
    lambda: true,
  },
  { s: '      .named("runSlow (hold)");', call: true },
  { s: "}" },
  { s: "" },
  { s: "private void setVoltage(double voltage) {", body: true },
  {
    s: "  motor.setControl(voltageOut.withOutput(voltage));",
    body: true,
    send: true,
  },
  { s: "}" },
];

// ---- the package ----------------------------------------------------------------------

// A sealed box carrying a line of code, centred on (x, y). `open` 0..1 lifts the lid.
function drawPackage(ctx, x, y, { open = 0, a = 1, scale = 1 } = {}) {
  const w = 300;
  const h = 62;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // glow while it is open
  if (open > 0.02) {
    ctx.fillStyle = alpha(C.accent, 0.22 * open);
    rrect(ctx, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 8);
    ctx.fill();
  }
  rrect(ctx, -w / 2, -h / 2, w, h, 5);
  ctx.fillStyle = C.bg3;
  ctx.fill();
  ctx.strokeStyle = open > 0.02 ? C.accent : C.tx3;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  text(ctx, "setVoltage(3.0)", 0, 9, {
    font: MONO,
    size: 24,
    weight: 600,
    align: "center",
    color: open > 0.3 ? C.accent : C.tx2,
  });
  // the lid, hinged at the back-left corner
  ctx.save();
  ctx.translate(-w / 2, -h / 2 - 20 * open);
  ctx.rotate(-0.12 * open);
  rrect(ctx, 0, -10, w, 14, 3);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.strokeStyle = open > 0.02 ? C.accent : C.tx3;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  // the seal, only while shut
  if (open < 0.05) {
    ctx.beginPath();
    ctx.arc(w / 2 - 22, -h / 2 + 1, 9, 0, TAU);
    ctx.fillStyle = C.accent;
    ctx.fill();
  }
  ctx.restore();
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    pkg: Wd("parcel", "package") - 0.1,
    arrow: Wd("parcel", "arrow") - 0.1,
    call: Wd("call", "runs,") - 0.1,
    run: Wd("run", "run") + 0.1,
    reset: L("tryit").t0 - 0.1,
  };

  const events = [
    { t: T.call, do: (s) => ((s.called = true), (s.callAt = s.time)) },
    { t: T.run, do: (s) => ((s.running = true), (s.runAt = s.time)) },
    { t: T.reset, do: (s) => Object.assign(s, fresh(s.time)) },
    // the gate, played for you: call, wait, then run
    { t: gate.t0 + 0.8, do: (s) => ((s.called = true), (s.callAt = s.time)) },
    { t: gate.t0 + 3.4, do: (s) => ((s.running = true), (s.runAt = s.time)) },
  ].sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = simulate(events, VOICE.duration, RATE);
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 465, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("show").t0 - 0.4, x: 1450, y: 290, z: 1.5, d: 1.2 },
    { t: L("call").t0 - 0.2, ...FULL, d: 1.2 },
    { t: L("silent").t0 - 0.1, x: 900, y: 490, z: 1.1, d: 1.2 },
    { t: L("run").t0 - 0.1, ...FULL, d: 1.1 },
  ];

  // loop phase 0..1 since the command started running
  const loopPhase = (s, t) =>
    s.running ? ((((t - s.runAt) % LOOP) + LOOP) % LOOP) / LOOP : -1;

  // ---- pieces --------------------------------------------------------------------

  function drawCode(ctx, s, t, live) {
    panel(ctx, CODE);
    micro(ctx, "Arm.java · mech-2-Commands", CODE.x + 28, CODE.y + 44);
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    text(ctx, COMMENT, CODE.x + 28, CODE.y + 112, {
      font: MONO,
      size: 19,
      color: C.tx3,
    });
    const ph = loopPhase(s, t);
    const pulse = ph >= 0 ? (1 - ph) ** 2 : 0;
    const callFlash = s.called
      ? window_(t, s.callAt - 0.05, s.callAt + 0.9, 0.15)
      : 0;
    let ly = CODE.y + 112;
    const ys = {};
    LINES.forEach((ln, i) => {
      ly += ln.s ? LH : LH / 2;
      ys[i] = ly;
      if (!ln.s) return;
      if (ln.call && callFlash > 0)
        runBar(ctx, CODE.x + 1, ly - 22, CODE.w - 2, LH, callFlash);
      if (ln.body && s.request)
        runBar(ctx, CODE.x + 1, ly - 22, CODE.w - 2, LH, pulse);
      if (ln.lambda && s.running)
        runBar(ctx, CODE.x + 1, ly - 22, CODE.w - 2, LH, pulse);
      codeLine(ctx, ln.s, CODE.x + 28, ly);
      if (ln.send && s.request)
        text(ctx, "→ motor", CODE.x + CODE.w - 28, ly, {
          font: MONO,
          size: 18,
          weight: 600,
          align: "right",
          color: C.accent,
        });
    });

    // the lambda, called out while the narration names it
    const lamY = ys[1];
    const x0 = CODE.x + 28 + codeWidth(ctx, "  return runRepeatedly(");
    const xArrow = x0 + codeWidth(ctx, "() ->");
    const x1 = x0 + codeWidth(ctx, "() -> setVoltage(3.0)");
    const kArrow = live ? 1 : easeOut(ramp(t, T.arrow, 0.4));
    const kBox = live ? 1 : easeOut(ramp(t, T.pkg - 0.6, 0.4));
    const stay = live ? 1 : 1 - ramp(t, L("silent").t0, 0.5);
    if (kArrow > 0 && stay > 0) {
      ctx.save();
      ctx.globalAlpha *= stay;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, lamY + 7);
      ctx.lineTo(x0 + (xArrow - x0) * kArrow, lamY + 7);
      ctx.stroke();
      text(ctx, "lambda", x1 + 34, lamY, {
        font: MONO,
        size: 19,
        weight: 600,
        color: C.accent,
        a: kArrow,
      });
      if (kBox > 0) {
        ctx.globalAlpha *= kBox;
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 2;
        rrect(ctx, x0 - 6, lamY - 24, x1 - x0 + 12, 34, 3);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // what the package is, while it waits by the code
    if (!live && !s.called) {
      const words = [
        ["written down", Wd("parcel", "written")],
        ["handed over", Wd("parcel", "handed")],
        ["not run", Wd("parcel", "not")],
      ];
      let wx = STAGE.x + 170;
      for (const [w, wt] of words) {
        const k = easeOut(ramp(t, wt - 0.1, 0.4));
        text(ctx, w, wx, STAGE.y + 8, {
          font: SANS,
          size: 22,
          weight: 600,
          color: w === "not run" ? C.accent : C.tx2,
          a: k * stay,
        });
        ctx.font = `600 22px ${SANS}`;
        wx += ctx.measureText(w).width + 24;
      }
    }
    return { lamX: (x0 + x1) / 2, lamY };
  }

  function drawCommand(ctx, s, t, live, lam) {
    panel(ctx, CMD, C.bg2);
    micro(ctx, "what runSlow() hands back", CMD.x + 28, CMD.y + 38);
    const ph = loopPhase(s, t);
    const enter = s.called ? easeInOut(clamp((t - s.callAt) / 0.8)) : 0;
    if (!s.called || enter < 1) {
      // nothing yet
      ctx.save();
      ctx.globalAlpha = 1 - enter;
      ctx.setLineDash([8, 7]);
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 2;
      rrect(ctx, CMDCARD.x, CMDCARD.y, CMDCARD.w, CMDCARD.h, 5);
      ctx.stroke();
      ctx.setLineDash([]);
      text(
        ctx,
        "no command yet",
        CMDCARD.x + CMDCARD.w / 2,
        CMDCARD.y + CMDCARD.h / 2 + 8,
        { font: MONO, size: 22, align: "center", color: C.tx3 }
      );
      ctx.restore();
    }
    if (s.called) {
      ctx.save();
      ctx.globalAlpha = enter;
      rrect(ctx, CMDCARD.x, CMDCARD.y, CMDCARD.w, CMDCARD.h, 5);
      ctx.fillStyle = C.bg;
      ctx.fill();
      ctx.strokeStyle = s.running ? C.accent : C.tx3;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      micro(ctx, "Command", CMDCARD.x + 24, CMDCARD.y + 40);
      text(ctx, '"runSlow (hold)"', CMDCARD.x + 24, CMDCARD.y + 84, {
        font: MONO,
        size: 26,
        weight: 600,
        color: s.running ? C.accent : C.tx,
      });
      ctx.restore();
    }
    // status and the loop's heartbeat
    const sx = CMDCARD.x + CMDCARD.w + 30;
    micro(ctx, "status", sx, CMDCARD.y + 40);
    const status = s.running ? "running" : s.called ? "waiting" : "–";
    text(ctx, status, sx, CMDCARD.y + 84, {
      font: MONO,
      size: 26,
      weight: 600,
      color: s.running ? C.accent : C.tx3,
    });
    if (s.called && !s.running)
      text(ctx, "nothing runs it", sx, CMDCARD.y + 118, {
        font: MONO,
        size: 18,
        color: C.tx3,
      });
    micro(ctx, "every loop", sx, CMDCARD.y + 166);
    const beat = ph >= 0 ? (1 - ph) ** 3 : 0;
    ctx.beginPath();
    ctx.arc(sx + 16, CMDCARD.y + 200, 12 + 5 * beat, 0, TAU);
    ctx.fillStyle = ph >= 0 ? alpha(C.accent, 0.35 + 0.65 * beat) : C.bg3;
    ctx.fill();
    text(ctx, ph >= 0 ? "20 ms" : "idle", sx + 44, CMDCARD.y + 207, {
      font: MONO,
      size: 20,
      color: ph >= 0 ? C.tx2 : C.tx3,
    });
    // pressed "run" with nothing to run
    if (s.noRunAt > 0 && t - s.noRunAt < 2.2) {
      text(
        ctx,
        "nothing to run yet",
        CMDCARD.x + CMDCARD.w / 2,
        CMDCARD.y + CMDCARD.h / 2 + 46,
        {
          font: MONO,
          size: 20,
          weight: 600,
          align: "center",
          color: C.err,
          a: window_(t - s.noRunAt, 0, 2.2, 0.2),
        }
      );
    }

    // the package: by the code, then into the command
    const shown = live || t >= T.pkg;
    if (!shown) return;
    const pop = live ? 1 : easeOut(ramp(t, T.pkg, 0.6));
    let x = lerp2(lam.lamX, STAGE.x, pop);
    let y = lerp2(lam.lamY, STAGE.y, pop);
    let scale = 0.6 + 0.4 * pop;
    if (s.called) {
      x = lerp2(STAGE.x, SLOT.x, enter);
      y = lerp2(STAGE.y, SLOT.y, enter);
      scale = 1;
    }
    const open = ph >= 0 ? (1 - ph) ** 2 : 0;
    drawPackage(ctx, x, y, { open, scale, a: s.called ? 1 : pop });
  }

  const lerp2 = (a, b, k) => a + (b - a) * k;

  // the link a request travels along, command to motor
  function linkPath(ctx) {
    ctx.beginPath();
    ctx.moveTo(CMDCARD.x, SLOT.y);
    ctx.bezierCurveTo(900, 905, 640, 905, CARD.x + CARD.w, CARD.y + 300);
  }
  function linkPoint(k) {
    const P0 = [CMDCARD.x, SLOT.y];
    const P1 = [900, 905];
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

  function drawLink(ctx, s, t) {
    const ph = loopPhase(s, t);
    linkPath(ctx);
    ctx.setLineDash(s.running ? [] : [7, 7]);
    ctx.strokeStyle = s.running ? alpha(C.accent, 0.35) : C.rule;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);
    if (ph >= 0 && ph < LAND) {
      const [px, py] = linkPoint(easeInOut(ph / LAND));
      rrect(ctx, px - 40, py - 17, 80, 34, 4);
      ctx.fillStyle = C.accent;
      ctx.fill();
      text(ctx, "3.0 V", px, py + 7, {
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
    const land = ph >= LAND ? 1 - clamp((ph - LAND) / 0.3) : 0;
    const silentLit = window_(
      t,
      L("silent").t0 + 0.2,
      L("silent").t1 + 0.3,
      0.4
    );
    drawMotorCard(ctx, CARD, {
      led: s.request ? C.accent : C.tx3,
      lit: s.request ? Math.max(land, 0) : silentLit,
      rows: [
        [
          "request on the motor",
          s.request ? "VoltageOut" : "none",
          s.request ? C.accent : C.tx3,
          28,
        ],
        ["output", `${s.volts.toFixed(1)} V`, s.request ? C.tx : C.tx3, 28],
        ["arm at", `${s.rot.toFixed(3)} rot`, C.tx2, 28],
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

  function drawActs(ctx, s, t, live) {
    panel(ctx, ACTS, C.bg2);
    micro(
      ctx,
      live ? "your keys" : "two separate steps",
      ACTS.x + 24,
      ACTS.y + 40
    );
    const row = (i, badge, main, sub, on, flash) => {
      const y = ACTS.y + 78 + i * 108;
      rrect(ctx, ACTS.x + 24, y, 44, 44, 4);
      ctx.fillStyle = on ? C.accent : C.bg3;
      ctx.fill();
      text(ctx, badge, ACTS.x + 46, y + 31, {
        font: MONO,
        size: 22,
        weight: 700,
        align: "center",
        color: on ? C.accentInk : C.tx3,
      });
      if (flash > 0) {
        ctx.strokeStyle = alpha(C.accent, flash);
        ctx.lineWidth = 3;
        rrect(ctx, ACTS.x + 14, y - 10, ACTS.w - 28, 96, 5);
        ctx.stroke();
      }
      text(ctx, main, ACTS.x + 88, y + 24, {
        font: MONO,
        size: 24,
        weight: 600,
        color: on ? C.tx : C.tx2,
      });
      text(ctx, sub, ACTS.x + 88, y + 60, {
        size: 20,
        color: on ? C.accent : C.tx3,
      });
    };
    const callFlash = s.called
      ? window_(t, s.callAt - 0.05, s.callAt + 1.0, 0.15)
      : 0;
    const runFlash = s.running
      ? window_(t, s.runAt - 0.05, s.runAt + 1.0, 0.15)
      : 0;
    row(
      0,
      live ? "C" : "1",
      "arm.runSlow()",
      s.called ? "made a command · no motion" : "call the method",
      s.called,
      callFlash
    );
    row(
      1,
      live ? "S" : "2",
      "run the command",
      s.running ? "opens every loop" : "something runs it",
      s.running,
      runFlash
    );
  }

  function drawConsole(ctx, t) {
    const k = window_(t, Wd("silent", "error") - 0.3, L("run").t0 + 0.2, 0.35);
    if (k <= 0) return;
    ctx.save();
    ctx.globalAlpha = k;
    rrect(ctx, CONSOLE.x, CONSOLE.y, CONSOLE.w, CONSOLE.h, 5);
    ctx.fillStyle = alpha(C.bg2, 0.97);
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    micro(ctx, "console", CONSOLE.x + 22, CONSOLE.y + 36);
    text(ctx, "no error", CONSOLE.x + 22, CONSOLE.y + 84, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.tx3,
    });
    text(ctx, "no warning", CONSOLE.x + 230, CONSOLE.y + 84, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.tx3,
      a: easeOut(ramp(t, Wd("silent", "warning.") - 0.1, 0.4)),
    });
    ctx.restore();
  }

  function drawBench(ctx, s, t, history) {
    drawStand(ctx, PIVOT);
    drawArmBody(ctx, PIVOT, ARM_LEN, s.rot, { history, driven: s.volts > 0 });
    const still = !s.request;
    if (still && s.called)
      text(ctx, "arm: still", PIVOT.x, 210, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.tx3,
      });
    if (s.request)
      text(ctx, "3 V · arm climbs", PIVOT.x, 210, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.accent,
      });
    const since = t - s.restartedAt;
    if (s.restartedAt > 0 && since < 2.2)
      text(ctx, "starting over", PIVOT.x, 120, {
        font: MONO,
        size: 20,
        align: "center",
        color: C.tx2,
        a: window_(since, 0, 2.2, 0.3),
        spacing: 1.5,
      });
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
    micro(ctx, "Workshop 2 · Java Basics", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Handing Over Code", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // The ordinary pieces and the one that isn't, then Tuner X's instant push.
  function openingCard(ctx, t) {
    const t1 = L("show").t0 - 0.4;
    if (t < L("intro").t0 - 0.6 || t > t1 + 0.8) return;
    ctx.save();
    ctx.globalAlpha = 1 - easeInOut(ramp(t, t1, 0.8));
    background(ctx);
    const chips = [
      ["class", "class Arm", Wd("intro", "classes,")],
      ["field", "motor", Wd("intro", "fields,")],
      ["method", "runSlow()", Wd("intro", "methods.")],
      ["lambda", "() -> ...", Wd("intro", "differently,") - 0.3],
    ];
    chips.forEach(([name, ex, at], i) => {
      const k = easeOut(ramp(t, at - 0.15, 0.5));
      const x = 235 + i * 370;
      const hot = i === 3;
      ctx.save();
      ctx.globalAlpha *= k;
      rrect(ctx, x, 150 - 16 * (1 - k), 340, 140, 5);
      ctx.fillStyle = hot ? alpha(C.accent, 0.12) : C.bg2;
      ctx.fill();
      ctx.strokeStyle = hot ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      micro(ctx, name, x + 28, 196 - 16 * (1 - k), {
        color: hot ? C.accent : C.tx3,
      });
      text(ctx, ex, x + 28, 254 - 16 * (1 - k), {
        font: MONO,
        size: 32,
        weight: 600,
        color: hot ? C.accent : C.tx,
      });
      ctx.restore();
    });
    text(ctx, "ordinary", 235 + 525, 340, {
      size: 26,
      align: "center",
      color: C.tx3,
      a: easeOut(ramp(t, Wd("intro", "ordinary:") - 0.1, 0.5)),
    });
    text(ctx, "works differently", 235 + 3 * 370 + 170, 340, {
      size: 26,
      weight: 600,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("intro", "differently,") - 0.1, 0.5)),
    });

    // Tuner X, Workshop 1: the push and the enable were the same moment
    const kp = easeOut(ramp(t, L("callback").t0 - 0.1, 0.6));
    ctx.globalAlpha *= kp;
    const P = { x: 235, y: 410, w: 1450, h: 400 };
    rrect(ctx, P.x, P.y, P.w, P.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, "when does the push happen?", P.x + 30, P.y + 46);
    const lane = (y, label, at, marks) => {
      const k = easeOut(ramp(t, at - 0.15, 0.5));
      ctx.save();
      ctx.globalAlpha *= k;
      text(ctx, label, P.x + 30, y + 10, {
        size: 30,
        weight: 600,
        color: C.tx,
      });
      const x0 = P.x + 300;
      const x1 = P.x + P.w - 60;
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
      for (const m of marks) {
        const km = easeOut(ramp(t, m.at - 0.1, 0.4));
        if (km <= 0) continue;
        const mx = x0 + m.u * (x1 - x0);
        ctx.beginPath();
        ctx.arc(mx, y, 11, 0, TAU);
        ctx.fillStyle = m.hot ? C.accent : C.tx2;
        ctx.globalAlpha = ctx.globalAlpha;
        ctx.fill();
        text(ctx, m.label, mx, y + (m.below ? 50 : -24), {
          font: MONO,
          size: 22,
          weight: 600,
          align: "center",
          color: m.hot ? C.accent : C.tx2,
          a: km,
        });
      }
      ctx.restore();
    };
    const en = Wd("callback", "enabled");
    lane(P.y + 150, "Tuner X", L("callback").t0, [
      { u: 0.08, label: "enable", at: en },
      { u: 0.08, label: "push", at: en + 0.15, hot: true, below: true },
    ]);
    const code = Wd("callback", "Code");
    lane(P.y + 300, "code", code, [
      { u: 0.08, label: "write it", at: code + 0.1 },
      { u: 0.8, label: "push, later", at: code + 0.9, hot: true, below: true },
    ]);
    // the gap in the code lane
    const kg = easeOut(ramp(t, code + 0.5, 0.6));
    if (kg > 0) {
      const x0 = P.x + 300 + 0.08 * (P.w - 360);
      const x1 = P.x + 300 + 0.8 * (P.w - 360);
      ctx.strokeStyle = alpha(C.accent, 0.6 * kg);
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0 + 20, P.y + 300);
      ctx.lineTo(x0 + 20 + (x1 - x0 - 40) * kg, P.y + 300);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function closeCard(ctx, t) {
    const a = easeInOut(ramp(t, L("close").t0 + 0.1, 0.8));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    text(ctx, "A lambda is code you hand over", W / 2, 450, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "for something else to run later.", W / 2, 556, {
      font: SERIF,
      size: 84,
      align: "center",
      color: C.accent,
    });
    text(ctx, "Next: what runs it.", W / 2, 660, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "Next,") - 0.1, 0.6)),
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
    drawLink(ctx, s, t);
    drawCard(ctx, s, t);
    drawBench(ctx, s, t, history);
    drawActs(ctx, s, t, !!live);
    const lam = drawCode(ctx, s, t, !!live);
    drawCommand(ctx, s, t, !!live, lam);
    if (!live) drawConsole(ctx, t);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    openingCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = { ...fresh(gate.t0), restartedAt: -1, trail: [] };
    let phase = "start";
    let movedAt = null;
    return {
      state: s,
      prompt: () =>
        ({
          start: "Call the method, then run the command.",
          norun: "Nothing to run yet. Call the method first.",
          called: "Command made. The arm is still. Now run it.",
          running: "Running. The package opens every loop.",
          moved: "Running the command moved the arm.",
        })[phase],
      input(name, down) {
        if (!down) return;
        if (name === "call" && !s.called) {
          s.called = true;
          s.callAt = s.time;
          phase = "called";
        }
        if (name === "run") {
          if (!s.called) {
            s.noRunAt = s.time;
            phase = "norun";
          } else if (!s.running) {
            s.running = true;
            s.runAt = s.time;
            phase = "running";
          }
        }
      },
      step(dt) {
        const n = Math.ceil(dt / DT);
        for (let i = 0; i < n; i++) {
          stepArm(s, control(s), dt / n);
          s.time += dt / n;
        }
        s.trail.push(s.rot);
        if (s.trail.length > 6) s.trail.shift();
        if (s.running && movedAt == null && s.rot - REST > 0.03) {
          movedAt = s.time;
          phase = "moved";
        }
        return movedAt !== null && s.time - movedAt > 1.5;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.8) return "Call the method, then run the command.";
    if (u < 3.4) return "Command made. The arm is still. Now run it.";
    if (u < 4.6) return "Running. The package opens every loop.";
    return "Running the command moved the arm.";
  }

  return {
    draw,
    liveGate,
    gate,
    gatePromptAt,
    gateControls: [
      { k: "call", label: "Call the method", key: "KeyC", kind: "press" },
      { k: "run", label: "Run the command", key: "KeyS", kind: "press" },
    ],
  };
}
