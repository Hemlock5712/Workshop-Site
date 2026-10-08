// The Scheduler. Fifty times a second, one line hands the scheduler a turn, and
// the scheduler decides which one command owns each mechanism.
//
// What is simulated, and how:
//   bindings  MyTeleop on mech-2-Commands: left trigger whileTrue(arm.runFast) /
//             whileFalse(arm.stop); right trigger whileTrue(flywheel.runFast) /
//             whileFalse(flywheel.runSlow). Each edge cancels the lane's owner and
//             starts the next command in the same tick.
//   lanes     one per mechanism. Every bar is a command; all of them are holds, so
//             a bar only ends when something cancels it.
//   arm       voltage-driven, the latched video's model: 6 V pushes it over the top,
//             stopMotor() leaves it in coast and it swings down.
//   flywheel  first-order speed from volts; in neutral it coasts down slowly.
// The "second command" in the newcomer beat is hypothetical: the branch binds no
// second arm command, so it is labelled that way and sends nothing we claim.

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
  drawArmBody,
  drawController,
  drawFlywheel,
  drawStand,
  drawTimeline,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const PAD = { x: 60, y: 70, w: 440, h: 270 };
const ARMCARD = { x: 60, y: 408, w: 400, h: 94 };
const FLYCARD = { x: 60, y: 516, w: 400, h: 94 };
const TICK = { x: 540, y: 30, w: 490, h: 160 };
const PIVOT = { x: 640, y: 372 };
const ARM_LEN = 140;
const FLOOR = 545;
const FLY = { x: 900, y: 350 };
const FLY_R = 75;
const CODE = { x: 1060, y: 30, w: 800, h: 580 };
const LANES = { x: 60, y: 632, w: 1800, h: 262 };
const LH = 26;
const TAU = 2 * Math.PI;
const VISUAL_TICK = 0.5; // one drawn pulse per this many seconds; the real loop is 20 ms

// ---- the model ----------------------------------------------------------------------

const PHYS = { kV: 2.6, bDriven: 4, bCoast: 0.85, g: 12 };
const FLYM = { rpsPerVolt: 8, tauDriven: 0.5, tauCoast: 3.0 };
const DT = 1 / 960;

const VOLTS = { runFast: 6, runSlow: 3, stop: 0 };
const REQ = {
  runFast: "VoltageOut 6.0 V",
  runSlow: "VoltageOut 3.0 V",
  stop: "NeutralOut",
};

function stepPhysics(s, dt) {
  const va = s.armReq === REQ.runFast ? 6 : 0;
  const b = va ? PHYS.bDriven : PHYS.bCoast;
  s.omega += (PHYS.kV * va - b * s.omega - PHYS.g * Math.sin(s.theta)) * dt;
  s.theta += s.omega * dt;
  const vf = s.flyVolts;
  if (vf > 0) s.rps += ((vf * FLYM.rpsPerVolt - s.rps) * dt) / FLYM.tauDriven;
  else s.rps -= (s.rps * dt) / FLYM.tauCoast;
  // drawn at a quarter of the real speed so the spokes don't strobe at 30 fps
  s.ang += s.rps * 0.25 * TAU * dt;
}

// The scheduler's turn: an edge on a trigger cancels the lane's owner and starts the
// next command in the same tick. A canceled command sends nothing more.
function take(s, lane, name, label) {
  const key = lane === 0 ? "armCmd" : "flyCmd";
  const cur = s.bars.findLast((b) => b.lane === lane && b.end == null);
  if (cur) {
    cur.end = s.time;
    cur.state = "cancel";
  }
  s[key] = name;
  s.bars.push({
    lane,
    start: s.time,
    end: null,
    label,
    open: true,
    state: "run",
    hypo: name === "second",
  });
  if (lane === 0 && REQ[name]) s.armReq = REQ[name];
  if (lane === 1 && REQ[name]) {
    s.flyReq = REQ[name];
    s.flyVolts = VOLTS[name];
  }
  s.lastEdge = { lane, t: s.time };
}

function control(s) {
  if (s.lt !== s.ltWas)
    take(
      s,
      0,
      s.lt ? "runFast" : "stop",
      s.lt ? "runFast (hold)" : "stop (hold)"
    );
  if (s.rt !== s.rtWas)
    take(
      s,
      1,
      s.rt ? "runFast" : "runSlow",
      s.rt ? "runFast (hold)" : "runSlow (hold)"
    );
  s.ltWas = s.lt;
  s.rtWas = s.rt;
}

const fresh = (time = 0) => ({
  time,
  lt: false,
  rt: false,
  ltWas: false,
  rtWas: false,
  armCmd: null,
  flyCmd: null,
  armReq: null,
  flyReq: null,
  flyVolts: 0,
  theta: 0,
  omega: 0,
  rps: 0,
  ang: 0,
  bars: [],
  lastEdge: null,
});

const armRot = (theta) => -theta / TAU - 0.25; // latched's theta (0 hangs) to the kit's rotations

// ---- the code on screen -------------------------------------------------------------

const ROBOT = [
  { s: "public class Robot extends OpModeRobot {" },
  { s: "  public final Arm arm = new Arm();" },
  { s: "  public final Flywheel flywheel = new Flywheel();" },
  { s: "" },
  { s: "  @Override" },
  { s: "  public void robotPeriodic() {" },
  { s: "    Scheduler.getDefault().run();", sched: true },
  { s: "  }" },
  { s: "}" },
];
const TELEOP = [
  { s: "public MyTeleop(Robot robot) {" },
  { s: "  driver.leftTrigger()", on: (s) => s.lt },
  {
    s: "      .whileTrue(robot.arm.runFast())",
    on: (s) => s.lt && s.armCmd === "runFast",
  },
  {
    s: "      .whileFalse(robot.arm.stop());",
    on: (s) => !s.lt && s.armCmd === "stop",
  },
  { s: "  driver.rightTrigger()", on: (s) => s.rt },
  {
    s: "      .whileTrue(robot.flywheel.runFast())",
    on: (s) => s.rt && s.flyCmd === "runFast",
  },
  {
    s: "      .whileFalse(robot.flywheel.runSlow());",
    on: (s) => !s.rt && s.flyCmd === "runSlow",
  },
  { s: "}" },
];

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    calls: Wd("tick", "calls"),
    line: Wd("tick", "line,"),
    checks: Wd("tick", "checks"),
    starts: Wd("tick", "starts"),
    runs: Wd("tick", "runs"),
    lanes: L("lanes").t0,
    press: Wd("press", "Hold") + 0.3,
    release: Wd("release", "go,") + 0.05,
    newcomer: Wd("newcomer", "asks"),
    timelineFrom: L("lanes").t0 - 0.6,
  };

  const events = [
    { t: T.press, do: (s) => (s.lt = true) },
    { t: T.release, do: (s) => (s.lt = false) },
    // the gate, played for you: right, then both, then let go one at a time
    { t: gate.t0 + 0.8, do: (s) => (s.rt = true) },
    { t: gate.t0 + 2.4, do: (s) => (s.lt = true) },
    { t: gate.t0 + 4.6, do: (s) => (s.lt = false) },
    { t: gate.t0 + 6.0, do: (s) => (s.rt = false) },
    // hypothetical: a second command asks for the arm's lane
    { t: T.newcomer, do: (s) => take(s, 0, "second", "a second command") },
  ].sort((a, b) => a.t - b.t);

  const RATE = 120;
  const samples = [];
  const final = fresh();
  {
    const s = final;
    let e = 0;
    for (let i = 0, n = Math.ceil(VOICE.duration * RATE) + 2; i < n; i++) {
      while (s.time < i / RATE) {
        while (e < events.length && events[e].t <= s.time) events[e++].do(s);
        control(s);
        stepPhysics(s, DT);
        s.time += DT;
      }
      const { bars, ...rest } = s;
      samples.push(rest);
    }
  }
  const BARS = final.bars; // ends are filled in; drawTimeline treats end > now as running
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 540, z: 1.0 };
  const TICKSHOT = { x: 1200, y: 330, z: 1.45 };
  const shots = [
    { t: 0, ...TICKSHOT, d: 0.01 },
    { t: L("lanes").t0 - 0.4, x: 960, y: 640, z: 1.08, d: 1.2 },
    { t: L("press").t0 - 0.3, ...FULL, d: 1.2 },
    { t: L("hold").t0, x: 960, y: 560, z: 1.1, d: 1.2 },
    { t: L("release").t0 - 0.3, ...FULL, d: 1.0 },
    { t: L("newcomer").t0, x: 960, y: 620, z: 1.08, d: 1.2 },
  ];

  // ---- pieces --------------------------------------------------------------------

  const tickCount = (t) => Math.max(0, Math.floor((t - T.calls) * 50));

  function drawTick(ctx, s, t, live) {
    const R = TICK;
    const lit = live ? 0 : window_(t, L("tick").t0, L("tick").t1 + 0.3, 0.4);
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = lit ? alpha(C.accent, 0.35 + 0.65 * lit) : C.rule;
    ctx.lineWidth = 2 + 2 * lit;
    ctx.stroke();
    const running = live || t >= T.calls;
    const ph = running
      ? ((((t - T.calls) % VISUAL_TICK) + VISUAL_TICK) % VISUAL_TICK) /
        VISUAL_TICK
      : 0;
    const cx = R.x + 64;
    const cy = R.y + 66;
    ctx.beginPath();
    ctx.arc(cx, cy, 38, 0, TAU);
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 6;
    ctx.stroke();
    if (running) {
      ctx.beginPath();
      ctx.arc(cx, cy, 38, -Math.PI / 2, -Math.PI / 2 + ph * TAU);
      ctx.strokeStyle = C.accent;
      ctx.stroke();
      // the flash as a turn begins
      const f = 1 - clamp(ph / 0.35);
      ctx.beginPath();
      ctx.arc(cx, cy, 16 + 26 * (1 - f), 0, TAU);
      ctx.fillStyle = alpha(C.accent, 0.5 * f);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, TAU);
    ctx.fillStyle = running ? C.accent : C.bg3;
    ctx.fill();
    text(ctx, "50 times a second", R.x + 126, R.y + 56, {
      size: 30,
      weight: 600,
      color: running ? C.tx : C.tx3,
    });
    text(
      ctx,
      running
        ? `turn ${tickCount(t).toLocaleString("en-US")} · every 20 ms`
        : "every 20 ms",
      R.x + 126,
      R.y + 90,
      { font: MONO, size: 20, color: C.tx2 }
    );
    // the three things a turn does
    const steps = ["check triggers", "start · cancel", "run owners"];
    const at3 = [T.checks, T.starts, T.runs];
    let x = R.x + 24;
    steps.forEach((st, i) => {
      ctx.font = `600 17px ${MONO}`;
      const w = ctx.measureText(st).width + 22;
      let on;
      if (!live && t >= at3[0] - 0.2 && t < L("tick").t1 + 0.4)
        on =
          t >= at3[i] - 0.1 &&
          (i === 2 || t < at3[i + 1] - 0.1 || t > T.runs + 0.8);
      else on = running && Math.floor(ph * 3) === i;
      rrect(ctx, x, R.y + 112, w, 32, 3);
      ctx.fillStyle = on ? alpha(C.accent, 0.18) : C.bg;
      ctx.fill();
      ctx.strokeStyle = on ? C.accent : C.rule;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      text(ctx, st, x + 11, R.y + 134, {
        font: MONO,
        size: 17,
        weight: 600,
        color: on ? C.accent : C.tx3,
      });
      x += w + 10;
    });
  }

  function drawCode(ctx, s, t, live) {
    panel(ctx, CODE);
    const running = live || t >= T.calls;
    const pulse = running
      ? 0.5 +
        0.5 *
          Math.cos(
            (((((t - T.calls) % VISUAL_TICK) + VISUAL_TICK) % VISUAL_TICK) /
              VISUAL_TICK) *
              TAU
          )
      : 0;
    const block = (lines, top, file) => {
      micro(ctx, file, CODE.x + 28, top - 36);
      let ly = top - LH;
      for (const ln of lines) {
        ly += ln.s ? LH : LH / 2;
        if (!ln.s) continue;
        const active = ln.sched ? running : ln.on?.(s);
        if (active)
          runBar(
            ctx,
            CODE.x + 1,
            ly - 20,
            CODE.w - 2,
            LH,
            ln.sched ? pulse : 0
          );
        codeLine(ctx, ln.s, CODE.x + 28, ly);
        // "one line": point at it as the narration says so
        if (ln.sched && !live) {
          const k = window_(t, T.line - 0.2, L("tick").t1, 0.3);
          if (k > 0)
            text(ctx, "← the one line", CODE.x + 470, ly, {
              font: MONO,
              size: 19,
              weight: 600,
              color: C.accent,
              a: k,
            });
        }
      }
    };
    block(ROBOT, CODE.y + 84, "Robot.java");
    block(TELEOP, CODE.y + 386, "opmode/MyTeleop.java");
  }

  function miniCard(ctx, R, title, req, out, on) {
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = on ? alpha(C.accent, 0.6) : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, title, R.x + 20, R.y + 32, { size: 16 });
    text(ctx, req ?? "no request yet", R.x + 20, R.y + 72, {
      font: MONO,
      size: 24,
      weight: 600,
      color: req && on ? C.accent : req ? C.tx : C.tx3,
    });
    text(ctx, out, R.x + R.w - 20, R.y + 32, {
      font: MONO,
      size: 18,
      align: "right",
      color: C.tx2,
    });
  }

  function drawBench(ctx, s, t, history) {
    drawStand(ctx, PIVOT, FLOOR);
    drawArmBody(ctx, PIVOT, ARM_LEN, armRot(s.theta), {
      history,
      driven: s.armReq === REQ.runFast,
    });
    drawFlywheel(ctx, FLY, FLY_R, s.ang, {
      rps: s.rps,
      driven: s.flyVolts > 0,
    });
    const own = (cmd) =>
      cmd === "second"
        ? "a second command"
        : cmd
          ? `${cmd} (hold)`
          : "no owner";
    text(ctx, "arm", PIVOT.x, FLOOR + 36, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.tx2,
    });
    text(ctx, own(s.armCmd), PIVOT.x, FLOOR + 62, {
      font: MONO,
      size: 18,
      align: "center",
      color: s.armCmd ? C.accent : C.tx3,
    });
    text(ctx, "flywheel", FLY.x, FLOOR + 36, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.tx2,
    });
    text(ctx, own(s.flyCmd), FLY.x, FLOOR + 62, {
      font: MONO,
      size: 18,
      align: "center",
      color: s.flyCmd ? C.accent : C.tx3,
    });
    miniCard(
      ctx,
      ARMCARD,
      "TalonFX 31 · arm",
      s.armReq,
      s.armReq === REQ.runFast ? "6.0 V" : "0.0 V",
      s.armReq === REQ.runFast
    );
    miniCard(
      ctx,
      FLYCARD,
      "TalonFX 21 · flywheel",
      s.flyReq,
      `${s.rps.toFixed(0)} rps`,
      s.flyVolts > 0
    );
    // "nothing else can drive that motor"
    const k = window_(
      t,
      Wd("press", "nothing") - 0.2,
      L("press").t1 + 0.6,
      0.3
    );
    if (k > 0) {
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(PIVOT.x, PIVOT.y, ARM_LEN + 26, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  function drawLanes(ctx, s, t, live) {
    const a = live ? 1 : easeOut(ramp(t, T.timelineFrom, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const now = t;
    const from = live ? now - 6.5 : Math.max(T.timelineFrom, now - 6.5);
    const bars = live ? s.bars : BARS;
    const g = drawTimeline(ctx, LANES, {
      lanes: ["Arm", "Flywheel"],
      bars,
      view: { t0: from, span: 9 },
      now,
    });
    const lit = live ? 0 : window_(t, L("lanes").t0, L("lanes").t1 + 0.3, 0.4);
    if (lit > 0) {
      rrect(ctx, LANES.x, LANES.y, LANES.w, LANES.h, 6);
      ctx.strokeStyle = alpha(C.accent, lit);
      ctx.lineWidth = 3;
      ctx.stroke();
      text(
        ctx,
        "one lane per mechanism · one command per lane",
        LANES.x + LANES.w - 24,
        LANES.y + 36,
        {
          font: MONO,
          size: 19,
          weight: 600,
          align: "right",
          color: C.accent,
          a: lit,
        }
      );
    }
    if (!live) {
      // notes that ride just right of the playhead, in the lane they talk about
      const note = (str, lane, t0, t1, color = C.accent) => {
        const k = window_(t, t0, t1, 0.3);
        if (k > 0)
          text(
            ctx,
            str,
            g.X(now) + 30,
            g.laneY(lane) + (g.laneH - 24) / 2 + 7,
            { font: MONO, size: 18, weight: 600, color, a: k }
          );
      };
      note(
        "owns the arm: nothing else drives it",
        0,
        Wd("press", "owns") - 0.2,
        L("press").t1 + 0.5
      );
      note(
        "no ending of its own",
        0,
        Wd("hold", "never") - 0.2,
        L("hold").t1 + 0.3
      );
      note(
        "newcomer wins, old one canceled",
        0,
        Wd("newcomer", "wins,") - 0.1,
        L("close").t0 + 0.4
      );
      // one tick: cancel and start together
      const kr = window_(
        t,
        Wd("release", "single") - 0.2,
        L("release").t1 + 1.0,
        0.3
      );
      if (kr > 0) {
        const x = g.X(T.release);
        ctx.save();
        ctx.globalAlpha *= kr;
        ctx.fillStyle = C.accent;
        ctx.fillRect(x - 1.5, g.laneY(0) - 14, 3, g.laneH + 2);
        text(
          ctx,
          "one tick: cancel runFast, start stop",
          x + 10,
          g.laneY(0) - 10,
          { font: MONO, size: 18, weight: 600, color: C.accent }
        );
        ctx.restore();
      }
      // the newcomer, which the branch doesn't have
      const kn = window_(t, T.newcomer - 0.1, L("close").t0 + 0.4, 0.3);
      if (kn > 0)
        text(
          ctx,
          "hypothetical · not bound in MyTeleop",
          g.X(T.newcomer) - 12,
          g.laneY(0) - 10,
          {
            font: MONO,
            size: 18,
            weight: 600,
            align: "right",
            color: C.tx2,
            a: kn,
          }
        );
    }
    ctx.restore();
  }

  function drawPadLabel(ctx, s) {
    const cx = PAD.x + PAD.w / 2;
    const lt = s.lt ? "LT held" : "LT up";
    const rt = s.rt ? "RT held" : "RT up";
    ctx.font = `600 22px ${MONO}`;
    const wl = ctx.measureText(lt + "   ").width;
    const wr = ctx.measureText(rt).width;
    const x0 = cx - (wl + wr) / 2;
    text(ctx, lt, x0, PAD.y + PAD.h + 44, {
      font: MONO,
      size: 22,
      weight: 600,
      color: s.lt ? C.accent : C.tx3,
    });
    text(ctx, rt, x0 + wl, PAD.y + PAD.h + 44, {
      font: MONO,
      size: 22,
      weight: 600,
      color: s.rt ? C.accent : C.tx3,
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
    micro(
      ctx,
      "Workshop 2 · The Command Framework",
      W / 2,
      440 - 20 * (1 - k),
      { align: "center", a: k, color: C.accent }
    );
    text(ctx, "The Scheduler", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // When / What / How, then the package waiting for something to run it.
  function triadCard(ctx, t) {
    const t1 = L("tick").t0 - 0.5;
    if (t < L("intro").t0 - 0.6 || t > t1 + 0.8) return;
    ctx.save();
    ctx.globalAlpha = 1 - easeInOut(ramp(t, t1, 0.8));
    background(ctx);
    const cb = L("callback").t0;
    const cards = [
      {
        q: "when",
        name: "Triggers",
        ex: "driver.leftTrigger()",
        at: Wd("intro", "Triggers"),
      },
      {
        q: "what",
        name: "Mechanisms",
        ex: "robot.arm",
        at: Wd("intro", "Mechanisms"),
      },
      {
        q: "how",
        name: "Commands",
        ex: "runFast (hold)",
        at: Wd("intro", "Commands"),
      },
    ];
    cards.forEach((c, i) => {
      const k = easeOut(ramp(t, c.at - 0.15, 0.5));
      const dim = i < 2 && t > cb ? 1 - 0.55 * easeOut(ramp(t, cb, 0.6)) : 1;
      const x = 270 + i * 480;
      const y = 170 + 20 * (1 - k);
      ctx.save();
      ctx.globalAlpha *= k * dim;
      rrect(ctx, x, y, 420, 300, 6);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = i === 2 && t > cb ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      micro(ctx, c.q, x + 36, y + 60, { color: C.accent, size: 22 });
      text(ctx, c.name, x + 36, y + 140, { size: 56, weight: 600 });
      text(ctx, c.ex, x + 36, y + 230, { font: MONO, size: 26, color: C.tx2 });
      ctx.restore();
    });
    // the package and the thing that runs it
    const kp = easeOut(ramp(t, Wd("callback", "package") - 0.15, 0.5));
    if (kp > 0) {
      ctx.save();
      ctx.globalAlpha *= kp;
      rrect(ctx, 750, 560, 420, 110, 6);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 2;
      ctx.setLineDash([9, 7]);
      ctx.stroke();
      ctx.setLineDash([]);
      micro(ctx, "a command · built, waiting", 780, 600);
      text(ctx, "robot.arm.runFast()", 780, 645, {
        font: MONO,
        size: 28,
        weight: 600,
      });
      // arrow up from the commands card
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1440, 475);
      ctx.bezierCurveTo(1440, 560, 1300, 615, 1180, 615);
      ctx.stroke();
      ctx.restore();
    }
    const ks = easeOut(ramp(t, Wd("callback", "scheduler.") - 0.15, 0.5));
    if (ks > 0) {
      ctx.save();
      ctx.globalAlpha *= ks;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(740, 615);
      ctx.lineTo(560, 615);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(575, 603);
      ctx.lineTo(560, 615);
      ctx.lineTo(575, 627);
      ctx.stroke();
      rrect(ctx, 250, 560, 300, 110, 6);
      ctx.fillStyle = alpha(C.accent, 0.12);
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      micro(ctx, "runs it", 280, 600, { color: C.accent });
      text(ctx, "the scheduler", 280, 645, {
        size: 34,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
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
    text(ctx, "Fifty times a second, the scheduler", W / 2, 450, {
      font: SERIF,
      size: 80,
      align: "center",
    });
    text(ctx, "decides who owns each mechanism.", W / 2, 554, {
      font: SERIF,
      size: 80,
      align: "center",
      color: C.accent,
    });
    text(ctx, "One command per lane. The newcomer wins.", W / 2, 656, {
      font: SANS,
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "owns") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const s = live ?? at(t);
    const history = [];
    if (!live)
      for (let i = 6; i >= 1; i--)
        history.push(armRot(at(t - i * 0.035).theta));
    else history.push(...live.trail);

    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawCode(ctx, s, t, !!live);
    drawTick(ctx, s, t, !!live);
    drawBench(ctx, s, t, history);
    drawController(ctx, PAD, { lt: s.lt, rt: s.rt, label: false });
    drawPadLabel(ctx, s);
    drawLanes(ctx, s, t, !!live);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    triadCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    // pick up exactly where the narration left the bench
    const s0 = at(gate.t0);
    const s = {
      ...s0,
      time: gate.t0,
      trail: [],
      bars: BARS.filter((b) => b.start < gate.t0).map((b) => ({
        ...b,
        end: b.end != null && b.end <= gate.t0 ? b.end : null,
        state: b.end != null && b.end <= gate.t0 ? b.state : "run",
      })),
    };
    let ltCycle = false;
    let rtCycle = false;
    let doneAt = null;
    return {
      state: s,
      prompt() {
        if (doneAt != null) return "Two mechanisms, two owners.";
        if (s.lt && s.rt) return "Both held: two lanes, two owners. Let go.";
        if (s.lt || s.rt)
          return ltCycle || rtCycle ? "Let go." : "Now hold the other one too.";
        if (ltCycle !== rtCycle)
          return ltCycle ? "Now the right trigger." : "Now the left trigger.";
        return "Hold one trigger.";
      },
      input(k, down) {
        if (k === "lt") {
          if (s.lt && !down) ltCycle = true;
          s.lt = down;
        }
        if (k === "rt") {
          if (s.rt && !down) rtCycle = true;
          s.rt = down;
        }
        if (ltCycle && rtCycle && !s.lt && !s.rt && doneAt == null)
          doneAt = s.time;
      },
      step(dt) {
        const n = Math.ceil(dt / DT);
        for (let i = 0; i < n; i++) {
          control(s);
          stepPhysics(s, dt / n);
          s.time += dt / n;
        }
        s.trail.push(armRot(s.theta));
        if (s.trail.length > 6) s.trail.shift();
        return doneAt !== null && s.time - doneAt > 1.5;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.8) return "Hold one trigger.";
    if (u < 2.4) return "Now hold the other one too.";
    if (u < 4.6) return "Both held: two lanes, two owners. Let go.";
    if (u < 6.0) return "Let go.";
    return "Two mechanisms, two owners.";
  }

  const gateControls = [
    { k: "lt", label: "Left trigger", key: "Space", kind: "hold" },
    { k: "rt", label: "Right trigger", key: "KeyR", kind: "hold" },
  ];

  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
