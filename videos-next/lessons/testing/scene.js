// One Tick by Hand. A test is the robot loop run by hand, with no robot: schedule
// only puts a command in line, one scheduler.run() is one tick, and the check reads
// back the request. Then the flywheel test fakes the sensor and checks both sides
// of the tolerance, and widening the tolerance makes the second check fail.
//
// Everything here is closed form in t. Nothing moves on the bench: a test checks
// the request, so the arm stays a ghost the whole video.
// Code: branch mech-6-Testing, src/test/java/first/robot/mechanisms/ArmTest.java and
// FlywheelTest.java (line numbers are the file's own), Flywheel.java line 43.

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
  drawArmBody,
  drawMotorCard,
  drawStand,
  drawTargetMark,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const CODE = { x: 30, y: 40, w: 950, h: 610 };
const RES = { x: 30, y: 675, w: 950, h: 200 };
const SCHED = { x: 1000, y: 40, w: 890, h: 200 };
const ARMCARD = { x: 1000, y: 270, w: 420, h: 250 };
const PIVOT = { x: 1670, y: 520 };
const ARM_LEN = 160;
const TOLP = { x: 1000, y: 260, w: 890, h: 92 };
const FLYCARD = { x: 1000, y: 372, w: 420, h: 310 };
const SIM = { x: 1000, y: 712, w: 420, h: 120 };
const DIAL = { x: 1665, y: 640, r: 185 };
const LH = 26;
const CS = 20;
const TAU = 2 * Math.PI;
const FULL = { x: 960, y: 540, z: 1 };
const TARGET_RPS = 75;
const D0 = 60;
const D1 = 90;

const ARM_TEST = [
  [23, "class ArmTest {"],
  [24, "  private final Scheduler scheduler = Scheduler.getDefault();"],
  [25, "  private Arm arm;"],
  [0, ""],
  [27, "  @BeforeEach"],
  [28, "  void setUp() {", "setup"],
  [30, "    assertTrue(HAL.initialize());", "setup"],
  [31, "    arm = new Arm();", "setup"],
  [32, "  }"],
  [0, ""],
  [40, "  @Test"],
  [41, "  void verticalAsksForAQuarterTurn() {"],
  [42, "    scheduler.schedule(arm.vertical());", "sched"],
  [43, "    scheduler.run();", "run"],
  [0, ""],
  [
    45,
    "    assertEquals(0.25, arm.getTargetPosition().in(Rotations), 1e-9);",
    "assert",
  ],
  [46, "  }"],
  [63, "}"],
];

const FLY_TEST = [
  [32, "  @BeforeEach"],
  [33, "  void setUp() {"],
  [36, "    flywheel = new Flywheel();"],
  [
    40,
    '    motorSim = new TalonFX(21, new CANBus("canivore")).getSimState();',
    "sim",
  ],
  [
    43,
    "    motorSim.Orientation = ChassisReference.Clockwise_Positive;",
    "sim",
  ],
  [44, "  }"],
  [0, ""],
  [60, "  @Test"],
  [61, "  void atTargetOnlyWithinHalfARotationPerSecond() {"],
  [62, "    scheduler.schedule(flywheel.runFast());", "sched"],
  [63, "    scheduler.run();", "run"],
  [0, ""],
  [65, "    motorSim.setRotorVelocity(74.8);", "set1"],
  [67, "    Timer.delay(0.1);", "delay1"],
  [68, "    assertTrue(flywheel.isAtTarget());", "chk1"],
  [0, ""],
  [70, "    motorSim.setRotorVelocity(70.0);", "set2"],
  [71, "    Timer.delay(0.1);", "delay2"],
  [72, "    assertFalse(flywheel.isAtTarget());", "chk2"],
  [73, "  }"],
];

function layoutLines(src) {
  let y = CODE.y + 112;
  return src.map(([n, s, id]) => {
    if (!s) {
      y += LH / 2;
      return { n, s, id };
    }
    const ln = { n, s, id, y };
    y += LH;
    return ln;
  });
}
const ARM_LINES = layoutLines(ARM_TEST);
const FLY_LINES = layoutLines(FLY_TEST);
const lineOf = (lines, id) => lines.find((l) => l.id === id);

const inside = (v, tol) => Math.abs(v - TARGET_RPS) <= tol + 1e-9;
const dialAng = (v) =>
  Math.PI + ((clamp(v, D0, D1) - D0) / (D1 - D0)) * Math.PI; // canvas angle, left to right over the top
const fmtTol = (v) => v.toFixed(1);

// One run of the flywheel test from time R, with the tolerance as it was pressed.
// Returns where the test is: the line running, the faked speed, both checks.
function flyRun(tol, R, now) {
  const u = now - R;
  const v = {
    tol,
    slot: u < 0 ? "run" : u < 0.3 ? "wait" : "run",
    speed: 0,
    c1: null,
    c2: null,
    line: null,
    summary: null,
    req: u >= 0.3,
  };
  if (u < 0) return v;
  v.speed = lerp(0, 74.8, easeInOut(ramp(u, 0.45, 0.45)));
  if (u >= 1.45) v.speed = lerp(74.8, 70, easeInOut(ramp(u, 1.45, 0.45)));
  v.line =
    u < 0.3
      ? "sched"
      : u < 0.45
        ? "run"
        : u < 0.9
          ? "set1"
          : u < 1.1
            ? "delay1"
            : u < 1.45
              ? "chk1"
              : u < 1.9
                ? "set2"
                : u < 2.1
                  ? "delay2"
                  : "chk2";
  if (u >= 1.1) v.c1 = inside(74.8, tol);
  if (u >= 2.1 && v.c1) v.c2 = !inside(70, tol);
  if (u >= 2.4) v.summary = v.c1 && v.c2 ? "PASSED" : "FAILED";
  if (u >= 1.1 && !v.c1) v.summary = "FAILED";
  return v;
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    edit: Wd("hook", "changes"),
    simStop: Wd("callback", "nothing"),
    sched: Wd("schedule", "schedules"),
    runHi: Wd("tick", "runs"),
    tick: Wd("tick", "tick"),
    pass: Wd("tick", "passes"),
    skip: Wd("skip", "Leave"),
    fail: Wd("skip", "fails"),
    flySwap: L("fake").t0 - 0.3,
    fakes: Wd("fake", "fakes"),
    set1: Wd("fake", "sets"),
    chk1: Wd("fake", "counts"),
    set2: Wd("fake", "sets", 2),
    chk2: Wd("fake", "doesnt"),
    widenA: gate.t0 + 0.6,
    widenB: gate.t0 + 2.4,
    run: gate.t0 + 3.0,
    limits: L("limits").t0 - 0.3,
  };
  T.flyRun = T.fakes + 0.5; // schedule + one tick, before the fake speed

  const mode = (t) => (t < T.flySwap || t >= T.limits ? "arm" : "fly");

  // ---- the arm test, scripted --------------------------------------------------
  function armView(t) {
    const v = {
      slot: null,
      req: false,
      result: null,
      skipped: false,
      tickFlash: 0,
      ticks: 0,
    };
    if (t >= T.limits)
      return { ...v, slot: "run", req: true, result: "PASSED", ticks: 1 };
    if (t >= T.sched + 0.3) v.slot = "wait";
    if (t >= T.tick) {
      v.slot = "run";
      v.req = true;
      v.ticks = 1;
    }
    v.tickFlash = window_(t, T.tick - 0.05, T.tick + 0.6, 0.12);
    if (t >= T.pass) v.result = "PASSED";
    if (t >= T.skip) {
      // the same test again, without the tick
      v.skipped = true;
      v.slot = t >= T.skip + 0.6 ? "wait" : null;
      v.req = false;
      v.ticks = 0;
      v.result = t >= T.fail ? "FAILED" : null;
    }
    return v;
  }

  // ---- the flywheel test, scripted ----------------------------------------------
  function flyView(t) {
    if (t >= T.run) return { ...flyRun(10, T.run, t), tolNow: 10 };
    if (t >= gate.t0) {
      const tol = 0.5 + 9.5 * easeInOut(ramp(t, T.widenA, T.widenB - T.widenA));
      const snapped = Math.round(tol * 2) / 2;
      return {
        tol: snapped,
        tolNow: snapped,
        slot: "run",
        speed: 70,
        c1: null,
        c2: null,
        line: null,
        summary: null,
        req: true,
      };
    }
    const v = {
      tol: 0.5,
      tolNow: 0.5,
      slot: null,
      speed: 0,
      c1: null,
      c2: null,
      line: null,
      summary: null,
      req: false,
    };
    if (t >= T.flyRun) v.slot = "wait";
    if (t >= T.flyRun + 0.45) {
      v.slot = "run";
      v.req = true;
    }
    v.speed = lerp(0, 74.8, easeInOut(ramp(t, T.set1 + 0.2, 0.6)));
    if (t >= T.set2)
      v.speed = lerp(74.8, 70, easeInOut(ramp(t, T.set2 + 0.2, 0.6)));
    if (t >= T.chk1) v.c1 = true;
    if (t >= T.chk2) v.c2 = true;
    if (t >= T.chk2 + 0.4) v.summary = "PASSED";
    const at = [
      ["sim", T.fakes - 0.1, T.flyRun],
      ["sched", T.flyRun, T.flyRun + 0.45],
      ["run", T.flyRun + 0.45, T.set1 - 0.1],
      ["set1", T.set1 - 0.1, Wd("fake", "just") + 0.3],
      ["delay1", Wd("fake", "just") + 0.3, T.chk1 - 0.6],
      ["chk1", T.chk1 - 0.6, T.set2 - 0.1],
      ["set2", T.set2 - 0.1, Wd("fake", "checks", 2) - 0.3],
      ["delay2", Wd("fake", "checks", 2) - 0.3, Wd("fake", "checks", 2) + 0.1],
      ["chk2", Wd("fake", "checks", 2) + 0.1, L("fake").t1 + 0.6],
    ].find(([, a, b]) => t >= a && t < b);
    v.line = at ? at[0] : null;
    return v;
  }

  // ---- camera ------------------------------------------------------------------
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("schedule").t0 - 0.3, x: 900, y: 400, z: 1.18, d: 1.2 },
    { t: L("skip").t0 - 0.2, ...FULL, d: 1.0 },
    { t: L("fake").t0 + 0.6, x: 960, y: 520, z: 1.04, d: 1.2 },
    { t: L("tryit").t0, ...FULL, d: 1.0 },
    { t: L("caught").t0 - 0.2, x: 1000, y: 480, z: 1.08, d: 1.0 },
    { t: L("limits").t0 - 0.2, x: 1152, y: 470, z: 1.22, d: 1.2 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawCode(ctx, t, m, A, F, live) {
    panel(ctx, CODE);
    const fly = m === "fly";
    micro(
      ctx,
      fly ? "FlywheelTest.java · src/test" : "ArmTest.java · src/test",
      CODE.x + 28,
      CODE.y + 44
    );
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const lines = fly ? FLY_LINES : ARM_LINES;
    // which lines are lit
    const lit = new Set();
    let failId = null;
    if (!fly && !live) {
      if (t >= Wd("callback", "same") - 0.1 && t < T.simStop + 0.5)
        lit.add("setup");
      if (t >= T.sched - 0.1 && t < T.runHi - 0.1) lit.add("sched");
      if (t >= T.runHi - 0.1 && t < T.pass - 0.4) lit.add("run");
      if (t >= T.pass - 0.4 && t < T.skip) lit.add("assert");
      if (t >= T.skip + 0.5 && t < T.fail - 0.4) lit.add("sched");
      if (t >= T.fail - 0.4 && t < T.limits)
        failId = A.result === "FAILED" ? "assert" : null;
      if (t >= T.fail - 0.4 && t < T.fail && !failId) lit.add("assert");
    }
    if (fly) {
      if (F.line) lit.add(F.line);
      if (F.summary === "FAILED") failId = F.c1 === false ? "chk1" : "chk2";
    }
    for (const ln of lines) {
      if (!ln.s) continue;
      text(ctx, String(ln.n), CODE.x + 52, ln.y, {
        font: MONO,
        size: 17,
        align: "right",
        color: C.tx3,
      });
      if (lit.has(ln.id)) runBar(ctx, CODE.x + 62, ln.y - 19, CODE.w - 63, LH);
      if (failId && ln.id === failId) {
        ctx.fillStyle = alpha(C.err, 0.16);
        ctx.fillRect(CODE.x + 62, ln.y - 19, CODE.w - 63, LH);
        ctx.fillStyle = C.err;
        ctx.fillRect(CODE.x + 62, ln.y - 19, 4, LH);
      }
      // the skipped tick: struck through and dimmed
      const struck = !fly && ln.id === "run" && A.skipped && t < T.limits;
      codeLine(ctx, ln.s, CODE.x + 76, ln.y, {
        size: CS,
        a: struck ? 0.35 : 1,
      });
      if (struck) {
        const w =
          codeWidth(ctx, ln.s.trim(), CS) * easeOut(clamp((t - T.skip) / 0.4));
        ctx.strokeStyle = C.err;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(CODE.x + 76 + codeWidth(ctx, "    ", CS), ln.y - 7);
        ctx.lineTo(CODE.x + 76 + codeWidth(ctx, "    ", CS) + w, ln.y - 7);
        ctx.stroke();
        text(ctx, "left out", CODE.x + CODE.w - 24, ln.y, {
          font: MONO,
          size: 18,
          weight: 700,
          align: "right",
          color: C.err,
        });
      }
    }
    // side notes, as the narration names them
    if (!fly && !live) {
      const n1 = window_(t, T.sched + 0.2, T.runHi - 0.1, 0.3);
      if (n1 > 0)
        text(
          ctx,
          "puts it in line",
          CODE.x + CODE.w - 24,
          lineOf(lines, "sched").y,
          {
            font: MONO,
            size: 18,
            weight: 700,
            align: "right",
            color: C.accent,
            a: n1,
          }
        );
      const n2 = window_(t, T.tick - 0.2, T.skip, 0.3);
      if (n2 > 0)
        text(ctx, "one tick", CODE.x + CODE.w - 24, lineOf(lines, "run").y, {
          font: MONO,
          size: 18,
          weight: 700,
          align: "right",
          color: C.accent,
          a: n2,
        });
    }
    if (fly) {
      const a1 = lineOf(lines, "chk1");
      const a2 = lineOf(lines, "chk2");
      const mark = (ln, ok) => {
        if (ok == null) return;
        text(ctx, ok ? "pass" : "FAIL", CODE.x + CODE.w - 24, ln.y, {
          font: MONO,
          size: 18,
          weight: 700,
          align: "right",
          color: ok ? C.accent : C.err,
        });
      };
      mark(a1, F.c1);
      mark(a2, F.c2);
      const sa = !live ? window_(t, T.fakes - 0.1, T.flyRun + 0.2, 0.3) : 0;
      if (sa > 0)
        text(
          ctx,
          "a second handle on CAN 21",
          CODE.x + CODE.w - 24,
          lineOf(lines, "sim").y - 28,
          {
            font: MONO,
            size: 18,
            weight: 700,
            align: "right",
            color: C.accent,
            a: sa,
          }
        );
    }
  }

  function drawResults(ctx, t, m, A, F) {
    panel(ctx, RES, C.bg2);
    micro(
      ctx,
      "test results · WPILib: Test Robot Code",
      RES.x + 24,
      RES.y + 36
    );
    const row = (y, name, status, detail) => {
      text(ctx, name, RES.x + 24, y, {
        font: MONO,
        size: 19,
        weight: 600,
        color: C.tx2,
      });
      if (status) {
        const col = status === "PASSED" ? C.accent : C.err;
        text(ctx, status, RES.x + RES.w - 24, y, {
          font: MONO,
          size: 22,
          weight: 700,
          align: "right",
          color: col,
        });
      } else
        text(ctx, "not run", RES.x + RES.w - 24, y, {
          font: MONO,
          size: 19,
          align: "right",
          color: C.tx3,
        });
      if (detail)
        text(ctx, detail, RES.x + 44, y + 34, {
          font: MONO,
          size: 19,
          weight: 600,
          color: C.err,
        });
    };
    if (m === "arm") {
      row(
        RES.y + 86,
        "ArmTest > verticalAsksForAQuarterTurn()",
        A.result,
        A.result === "FAILED"
          ? "expected: <0.25> but was: <0.0>   at ArmTest.java:45"
          : null
      );
    } else {
      const d =
        F.summary === "FAILED"
          ? F.c1 === false
            ? "expected: <true> but was: <false>   at FlywheelTest.java:68"
            : "expected: <false> but was: <true>   at FlywheelTest.java:72"
          : null;
      row(
        RES.y + 86,
        "FlywheelTest > atTargetOnlyWithinHalfARotationPerSecond()",
        F.summary,
        d
      );
    }
  }

  function drawSched(ctx, t, m, A, F, live) {
    panel(ctx, SCHED, C.bg2);
    micro(
      ctx,
      "scheduler · nothing loops on its own",
      SCHED.x + 24,
      SCHED.y + 36
    );
    const name = m === "arm" ? "vertical (hold)" : "runFast (hold)";
    const slot = m === "arm" ? A.slot : F.slot;
    const S1 = { x: SCHED.x + 24, y: SCHED.y + 60, w: 300, h: 116 };
    const S2 = { x: SCHED.x + 384, y: SCHED.y + 60, w: 300, h: 116 };
    for (const [R, label, on] of [
      [S1, "waiting", slot === "wait"],
      [S2, "running", slot === "run"],
    ]) {
      rrect(ctx, R.x, R.y, R.w, R.h, 5);
      ctx.fillStyle = alpha(C.bg, 0.5);
      ctx.fill();
      ctx.strokeStyle = on ? C.accent : C.rule;
      ctx.lineWidth = 2;
      if (label === "waiting") ctx.setLineDash([7, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      micro(ctx, label, R.x + 16, R.y + 30, {
        size: 16,
        color: on ? C.tx2 : C.tx3,
      });
    }
    // arrow between
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(S1.x + S1.w + 10, S1.y + 70);
    ctx.lineTo(S2.x - 12, S1.y + 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(S2.x - 22, S1.y + 60);
    ctx.lineTo(S2.x - 10, S1.y + 70);
    ctx.lineTo(S2.x - 22, S1.y + 80);
    ctx.stroke();
    // the command chip: slides from waiting to running on the tick
    if (slot) {
      let k = slot === "run" ? 1 : 0;
      if (m === "arm" && !live && slot === "run" && t < T.limits)
        k = easeInOut(ramp(t, T.tick, 0.45));
      if (m === "fly" && !live && t < gate.t0 && slot === "run")
        k = easeInOut(ramp(t, T.flyRun + 0.45, 0.4));
      const x = lerp(S1.x + 16, S2.x + 16, k);
      const arriveA =
        m === "arm" && !live && t < T.tick
          ? easeOut(ramp(t, T.sched + 0.1, 0.35))
          : 1;
      ctx.save();
      ctx.globalAlpha *= arriveA;
      rrect(ctx, x, S1.y + 48, 268, 50, 4);
      ctx.fillStyle = k >= 1 ? alpha(C.accent, 0.2) : C.bg3;
      ctx.fill();
      ctx.strokeStyle = k >= 1 ? C.accent : C.tx3;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, name, x + 134, S1.y + 81, {
        font: MONO,
        size: 21,
        weight: 700,
        align: "center",
        color: k >= 1 ? C.accent : C.tx2,
      });
      ctx.restore();
    }
    // the loop: auto in Hardware Simulation, stopped in a test, one tick by hand
    const LC = { x: SCHED.x + 790, y: SCHED.y + 106 };
    let auto = 0;
    if (!live)
      auto = window_(t, Wd("callback", "Hardware") - 0.1, T.simStop, 0.2);
    let flash = 0;
    if (m === "arm" && !live) flash = A.tickFlash;
    if (m === "fly") {
      const fr = live
        ? F.runAt
        : t >= T.run
          ? T.run
          : t >= T.flyRun
            ? T.flyRun
            : null;
      const ft = live ? F.time : t;
      if (fr != null) flash = window_(ft, fr + 0.3, fr + 0.75, 0.1);
    }
    const beat = auto > 0 ? 0.5 + 0.5 * Math.cos(((t % 0.4) / 0.4) * TAU) : 0;
    ctx.beginPath();
    ctx.arc(LC.x, LC.y, 36, 0, TAU);
    ctx.fillStyle =
      flash > 0
        ? alpha(C.accent, 0.25 + 0.6 * flash)
        : auto > 0
          ? alpha(C.accent, 0.1 + 0.3 * beat * auto)
          : C.bg3;
    ctx.fill();
    ctx.strokeStyle = flash > 0 || auto > 0 ? C.accent : C.rule;
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, flash > 0 ? "tick" : "loop", LC.x, LC.y + 7, {
      font: MONO,
      size: 19,
      weight: 700,
      align: "center",
      color: flash > 0 ? C.accentInk : C.tx2,
    });
    const sub =
      auto > 0.5 ? "sim: every 20 ms" : flash > 0 ? "run() · once" : "stopped";
    text(ctx, sub, LC.x, LC.y + 70, {
      font: MONO,
      size: 17,
      weight: 600,
      align: "center",
      color: auto > 0.5 || flash > 0 ? C.accent : C.tx3,
    });
  }

  function drawArmBench(ctx, t, A, live) {
    drawMotorCard(ctx, ARMCARD, {
      led: A.req ? C.accent : C.tx3,
      lit:
        !live && t < T.limits
          ? Math.max(
              window_(
                t,
                Wd("schedule", "no") - 0.2,
                L("schedule").t1 + 0.3,
                0.3
              ),
              window_(t, Wd("tick", "request") - 0.2, T.pass, 0.3)
            )
          : 0,
      rows: [
        [
          "request",
          A.req ? "MotionMagicVoltage" : "none",
          A.req ? C.accent : C.tx3,
          26,
        ],
        ["target", A.req ? "0.25 rot" : "–", A.req ? C.tx : C.tx3, 26],
      ],
    });
    drawStand(ctx, PIVOT);
    if (A.req)
      drawTargetMark(ctx, PIVOT, ARM_LEN, 0.25, "0.25 rot · asked for", 1);
    // no robot: the arm is a ghost, and it never moves
    drawArmBody(ctx, PIVOT, ARM_LEN, -0.25, { ghost: true });
    if (live || t < Wd("limits", "bench") - 0.2)
      text(ctx, "no robot · the arm never moves", PIVOT.x, 840, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: C.tx3,
      });
    // the limits beat: what the test saw, and what only the bench can show
    const la = live
      ? 0
      : window_(t, Wd("limits", "checks") - 0.1, L("close").t0 + 0.3, 0.3);
    if (la > 0) {
      ctx.save();
      ctx.globalAlpha = la;
      text(
        ctx,
        "the test reads this",
        ARMCARD.x + ARMCARD.w / 2,
        ARMCARD.y + ARMCARD.h + 40,
        { font: MONO, size: 20, weight: 700, align: "center", color: C.accent }
      );
      const lb = easeOut(ramp(t, Wd("limits", "bench") - 0.1, 0.4));
      text(ctx, "the bench", PIVOT.x + 110, 690, {
        font: MONO,
        size: 20,
        weight: 700,
        color: C.tx,
        a: lb,
      });
      text(ctx, "shows this", PIVOT.x + 110, 716, {
        font: MONO,
        size: 20,
        weight: 700,
        color: C.tx,
        a: lb,
      });
      ctx.restore();
    }
  }

  function drawFlyBench(ctx, t, F, live) {
    // the line a teammate edits
    panel(ctx, TOLP, C.bg2);
    micro(ctx, "Flywheel.java · line 43", TOLP.x + 24, TOLP.y + 32, {
      size: 16,
    });
    const pre =
      "private final AngularVelocity tolerance = RotationsPerSecond.of(";
    const tol = F.tolNow ?? F.tol;
    const edited = tol !== 0.5;
    const x0 = TOLP.x + 24;
    codeLine(ctx, pre, x0, TOLP.y + 70, { size: 19 });
    const vx = x0 + codeWidth(ctx, pre, 19);
    const vs = fmtTol(tol);
    if (edited) {
      ctx.fillStyle = alpha(C.err, 0.2);
      ctx.fillRect(vx - 2, TOLP.y + 50, codeWidth(ctx, vs, 19) + 4, 28);
    }
    text(ctx, vs, vx, TOLP.y + 70, {
      font: MONO,
      size: 19,
      weight: 700,
      color: edited ? C.err : C.tx,
    });
    codeLine(ctx, ");", vx + codeWidth(ctx, vs, 19), TOLP.y + 70, { size: 19 });

    drawMotorCard(ctx, FLYCARD, {
      title: "TalonFX 21 · motor controller",
      led: F.req ? C.accent : C.tx3,
      rows: [
        [
          "request",
          F.req ? "MotionMagicVelocityVoltage" : "none",
          F.req ? C.accent : C.tx3,
          22,
        ],
        ["target", F.req ? "75 rps" : "–", F.req ? C.tx : C.tx3, 26],
        ["velocity · faked by the test", `${F.speed.toFixed(1)} rps`, C.tx, 26],
      ],
    });
    // the test's own handle on the same simulated motor
    const ha = live ? 1 : easeOut(ramp(t, T.fakes - 0.2, 0.5));
    if (ha > 0) {
      ctx.save();
      ctx.globalAlpha *= ha;
      panel(ctx, SIM, C.bg2);
      micro(ctx, "test's handle · same sim motor", SIM.x + 20, SIM.y + 34, {
        size: 16,
      });
      const setting =
        F.speed > 72 || F.line === "set1" ? "74.8" : F.speed > 0 ? "70.0" : "…";
      text(
        ctx,
        `motorSim.setRotorVelocity(${setting})`,
        SIM.x + 20,
        SIM.y + 78,
        { font: MONO, size: 19, weight: 600, color: C.tx }
      );
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(SIM.x + SIM.w / 2, SIM.y);
      ctx.lineTo(SIM.x + SIM.w / 2, FLYCARD.y + FLYCARD.h + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(SIM.x + SIM.w / 2 - 9, FLYCARD.y + FLYCARD.h + 14);
      ctx.lineTo(SIM.x + SIM.w / 2, FLYCARD.y + FLYCARD.h + 2);
      ctx.lineTo(SIM.x + SIM.w / 2 + 9, FLYCARD.y + FLYCARD.h + 14);
      ctx.stroke();
      ctx.restore();
    }
    drawDial(ctx, t, F);
  }

  function drawDial(ctx, t, F) {
    const { x, y, r } = DIAL;
    const tol = F.tolNow ?? F.tol;
    // track
    ctx.lineCap = "butt";
    ctx.strokeStyle = C.bg3;
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, TAU);
    ctx.stroke();
    // tolerance band
    ctx.strokeStyle = alpha(C.accent, 0.45);
    ctx.beginPath();
    ctx.arc(x, y, r, dialAng(TARGET_RPS - tol), dialAng(TARGET_RPS + tol));
    ctx.stroke();
    // ticks, labelled inside
    for (let v = D0; v <= D1; v += 5) {
      const a = dialAng(v);
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r - 16), y + Math.sin(a) * (r - 16));
      ctx.lineTo(x + Math.cos(a) * (r - 30), y + Math.sin(a) * (r - 30));
      ctx.stroke();
      if (v % 10 === 0)
        text(
          ctx,
          String(v),
          x + Math.cos(a) * (r - 52),
          y + Math.sin(a) * (r - 52) + 6,
          { font: MONO, size: 17, align: "center", color: C.tx3 }
        );
    }
    // target
    const at = dialAng(TARGET_RPS);
    ctx.strokeStyle = C.tx;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(at) * (r - 14), y + Math.sin(at) * (r - 14));
    ctx.lineTo(x + Math.cos(at) * (r + 14), y + Math.sin(at) * (r + 14));
    ctx.stroke();
    // the two markers the test sets: just inside, well outside
    const marker = (v, label, res, dx) => {
      const a = dialAng(v);
      const px = x + Math.cos(a) * (r + 22);
      const py = y + Math.sin(a) * (r + 22);
      const inBand = inside(v, tol);
      const col = res === false ? C.err : inBand ? C.accent : C.tx2;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(
        px + Math.cos(a) * 18 + Math.cos(a + Math.PI / 2) * 9,
        py + Math.sin(a) * 18 + Math.sin(a + Math.PI / 2) * 9
      );
      ctx.lineTo(px, py);
      ctx.lineTo(
        px + Math.cos(a) * 18 - Math.cos(a + Math.PI / 2) * 9,
        py + Math.sin(a) * 18 - Math.sin(a + Math.PI / 2) * 9
      );
      ctx.fill();
      const lx = x + Math.cos(a) * (r + 60) + dx;
      const ly = y + Math.sin(a) * (r + 60);
      text(ctx, v.toFixed(1), lx, ly, {
        font: MONO,
        size: 20,
        weight: 700,
        align: "center",
        color: col,
      });
      text(ctx, label, lx, ly - 24, {
        font: MONO,
        size: 16,
        weight: 600,
        align: "center",
        color: C.tx3,
      });
    };
    marker(74.8, inside(74.8, tol) ? "just inside" : "outside", F.c1, -40);
    marker(70, inside(70, tol) ? "now inside" : "well outside", F.c2, -30);
    // needle
    if (F.speed > 0) {
      const a = dialAng(F.speed);
      ctx.strokeStyle = C.tx;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * (r - 40), y + Math.sin(a) * (r - 40));
      ctx.stroke();
      ctx.lineCap = "butt";
    }
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, TAU);
    ctx.fillStyle = C.tx2;
    ctx.fill();
    text(ctx, `getVelocity() ${F.speed.toFixed(1)} rps`, x, y + 50, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.tx,
    });
    text(ctx, `band: 75 ± ${fmtTol(tol)} rps`, x, y + 84, {
      font: MONO,
      size: 20,
      weight: 700,
      align: "center",
      color: tol !== 0.5 ? C.err : C.accent,
    });
    // the caught beat: the far-off speed is inside the band now
    if (F.c2 === false)
      text(ctx, "70.0 is inside the band now", x, y + 124, {
        font: MONO,
        size: 19,
        weight: 700,
        align: "center",
        color: C.err,
      });
  }

  // ---- full-screen cards -----------------------------------------------------------

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("hook").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 4 · Testing", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "One Tick by Hand", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // The hook: one number changes, the robot is in a crate. Then what a test is.
  function openingCard(ctx, t) {
    const t1 = L("callback").t0 - 0.3;
    if (t < L("hook").t0 - 0.6 || t > t1 + 0.8) return;
    ctx.save();
    ctx.globalAlpha = 1 - easeInOut(ramp(t, t1, 0.8));
    background(ctx);
    // the edit
    const ea = easeOut(ramp(t, L("hook").t0, 0.5));
    ctx.save();
    ctx.globalAlpha *= ea;
    micro(ctx, "Flywheel.java · a teammate's edit", 300, 170);
    const pre =
      "private final AngularVelocity tolerance = RotationsPerSecond.of(";
    const sz = 24;
    codeLine(ctx, pre, 300, 230, { size: sz });
    const vx = 300 + codeWidth(ctx, pre, sz);
    const k = clamp((t - T.edit - 0.4) / 0.35);
    const vs = k < 0.5 ? "0.5" : "10.0";
    if (k > 0) {
      ctx.fillStyle = alpha(C.err, 0.22 * Math.min(1, k * 2));
      ctx.fillRect(vx - 3, 205, codeWidth(ctx, "10.0", sz) + 6, 34);
    }
    text(ctx, vs, vx, 230, {
      font: MONO,
      size: sz,
      weight: 700,
      color: k >= 0.5 ? C.err : C.tx,
    });
    codeLine(ctx, ");", vx + codeWidth(ctx, vs, sz), 230, { size: sz });
    ctx.restore();
    // the crate
    const ca = easeOut(ramp(t, Wd("hook", "robot's") - 0.1, 0.5));
    if (ca > 0) {
      ctx.save();
      ctx.globalAlpha *= ca;
      const B = { x: 700, y: 320, w: 520, h: 230 };
      rrect(ctx, B.x, B.y, B.w, B.h, 4);
      ctx.fillStyle = C.bg3;
      ctx.fill();
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 6;
      for (const yy of [B.y + 30, B.y + B.h - 30]) {
        ctx.beginPath();
        ctx.moveTo(B.x + 8, yy);
        ctx.lineTo(B.x + B.w - 8, yy);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(B.x + 12, B.y + B.h - 34);
      ctx.lineTo(B.x + B.w - 12, B.y + 34);
      ctx.stroke();
      text(ctx, "ROBOT · PACKED", B.x + B.w / 2, B.y + B.h / 2 + 12, {
        font: MONO,
        size: 34,
        weight: 700,
        align: "center",
        color: C.tx2,
        spacing: 4,
      });
      ctx.restore();
    }
    // who notices?
    const wa = window_(t, Wd("hook", "Who") - 0.1, L("intro").t0, 0.3);
    if (wa > 0)
      text(ctx, "Who notices?", W / 2, 690, {
        font: SERIF,
        size: 72,
        align: "center",
        color: C.accent,
        a: wa,
      });
    // what a test is
    const chips = [
      ["code changes", Wd("intro", "check") - 0.2],
      ["the computer runs the tests", Wd("intro", "computer") - 0.1],
      ["PASSED / FAILED, every time", Wd("intro", "every") - 0.1],
    ];
    chips.forEach(([s, at], i) => {
      const a = easeOut(ramp(t, at, 0.45));
      if (a <= 0) return;
      const x = 330 + i * 430;
      ctx.save();
      ctx.globalAlpha *= a;
      rrect(ctx, x, 640, 400, 84, 5);
      ctx.fillStyle = i === 2 ? alpha(C.accent, 0.12) : C.bg2;
      ctx.fill();
      ctx.strokeStyle = i === 2 ? C.accent : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, s, x + 200, 692, {
        size: 26,
        weight: 600,
        align: "center",
        color: i === 2 ? C.accent : C.tx,
      });
      if (i < 2)
        text(ctx, "→", x + 415, 694, {
          size: 30,
          weight: 600,
          align: "center",
          color: C.tx3,
        });
      ctx.restore();
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
    text(ctx, "Put decisions where a test can read them,", W / 2, 460, {
      font: SERIF,
      size: 76,
      align: "center",
    });
    text(ctx, "and let the computer check them every time.", W / 2, 566, {
      font: SERIF,
      size: 76,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "and") - 0.1, 0.5)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const m = live ? "fly" : mode(t);
    const A = m === "arm" ? armView(t) : null;
    const F = live ? live.view : m === "fly" ? flyView(t) : null;
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    // the swap between the two tests: a quick dip
    drawCode(ctx, t, m, A, F, !!live);
    drawResults(ctx, t, m, A, F);
    drawSched(ctx, t, m, A, F, !!live);
    if (m === "arm") drawArmBench(ctx, t, A, !!live);
    else drawFlyBench(ctx, t, F, !!live);
    ctx.restore();
    if (!live) {
      const dip = Math.max(
        window_(t, T.flySwap - 0.3, T.flySwap + 0.3, 0.3),
        window_(t, T.limits - 0.3, T.limits + 0.3, 0.3)
      );
      if (dip > 0) {
        ctx.fillStyle = alpha(C.bg, dip);
        ctx.fillRect(0, 0, W, H);
      }
    }
    vignette(ctx);
    if (live) return;
    openingCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = {
      time: gate.t0,
      tol: 0.5,
      runAt: null,
      runTol: 0.5,
      view: null,
      sawFail: null,
      lastResult: null,
    };
    const idle = () => ({
      tol: s.tol,
      tolNow: s.tol,
      slot: "run",
      speed: 70,
      c1: null,
      c2: null,
      line: null,
      summary: null,
      req: true,
      runAt: s.runAt,
      time: s.time,
    });
    s.view = idle();
    let doneAt = null;
    return {
      state: s,
      prompt() {
        const v = s.view;
        if (s.runAt != null && !v.summary) return "Running the tests…";
        if (v.summary === "FAILED")
          return "The second check failed. Edit caught.";
        if (v.summary === "PASSED")
          return s.tol < 5
            ? "Both pass. Widen it more, then run again."
            : "Both pass. Run again.";
        if (s.tol <= 0.5) return "Drag the tolerance wider.";
        return "Now press Run tests.";
      },
      input(k, val) {
        if (k === "tol") {
          s.tol = Number(val);
          if (s.runAt == null || s.view.summary) {
            s.runAt = null;
            s.view = idle();
          }
        }
        if (k === "run" && val && (s.runAt == null || s.view.summary)) {
          s.runAt = s.time;
          s.runTol = s.tol;
        }
      },
      step(dt) {
        s.time += dt;
        if (s.runAt != null)
          s.view = {
            ...flyRun(s.runTol, s.runAt, s.time),
            tolNow: s.runTol,
            runAt: s.runAt,
            time: s.time,
          };
        else s.view = idle();
        if (s.view.summary === "FAILED" && doneAt == null)
          doneAt = s.time + 2.0;
        return doneAt !== null && s.time >= doneAt;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    if (t < T.widenB) return "Drag the tolerance wider.";
    if (t < T.run) return "Now press Run tests.";
    if (t < T.run + 2.4) return "Running the tests…";
    return "The second check failed. Edit caught.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      {
        k: "tol",
        label: "Tolerance (rps)",
        kind: "range",
        min: 0.5,
        max: 10,
        step: 0.5,
        value: 0.5,
      },
      { k: "run", label: "Run tests", key: "KeyT", kind: "press" },
    ],
  };
}
