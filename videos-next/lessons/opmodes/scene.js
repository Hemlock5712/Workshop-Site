// Two Edges. An OpMode is a class; its constructor binds each edge of a button.
//
// What is simulated, and how:
//   bindings  MyTeleop on mech-2-Commands: left trigger whileTrue(arm.runFast) /
//             whileFalse(arm.stop); right trigger whileTrue(flywheel.runFast) /
//             whileFalse(flywheel.runSlow). The press edge cancels the lane's owner and
//             starts the whileTrue command; the release edge starts the whileFalse one.
//   mode      the driver station's selected OpMode. Bindings belong to MyTeleop, so in
//             My Auto an edge does nothing; switching back builds MyTeleop again.
//   arm       voltage-driven, the latched video's model (stopMotor leaves it in coast).
//   flywheel  first-order speed from volts; in neutral it coasts down.
// The gate lets the student choose what the right trigger's whileFalse runs.

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
  drawStand,
  drawTimeline,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const PAD = { x: 60, y: 70, w: 440, h: 270 };
const EDGES = { x: 60, y: 400, w: 440, h: 212 };
const DS = { x: 540, y: 30, w: 480, h: 226 };
const PIVOT = { x: 650, y: 425 };
const ARM_LEN = 125;
const FLOOR = 590;
const FLY = { x: 900, y: 400 };
const FLY_R = 70;
const CODE = { x: 1060, y: 30, w: 800, h: 580 };
const LANES = { x: 60, y: 632, w: 1800, h: 262 };
const LH = 26;
const TAU = 2 * Math.PI;

// ---- the model ----------------------------------------------------------------------

const PHYS = { kV: 2.6, bDriven: 4, bCoast: 0.85, g: 12 };
const FLYM = { rpsPerVolt: 8, tauDriven: 0.5, tauCoast: 1.5 };
const DT = 1 / 960;
const VOLTS = { runFast: 6, runSlow: 3, stop: 0 };
const REQ = {
  runFast: "VoltageOut 6.0 V",
  runSlow: "VoltageOut 3.0 V",
  stop: "NeutralOut",
};

function stepPhysics(s, dt) {
  const va = s.armCmd === "runFast" ? 6 : 0;
  const b = va ? PHYS.bDriven : PHYS.bCoast;
  s.omega += (PHYS.kV * va - b * s.omega - PHYS.g * Math.sin(s.theta)) * dt;
  s.theta += s.omega * dt;
  const vf = s.flyVolts;
  if (vf > 0) s.rps += ((vf * FLYM.rpsPerVolt - s.rps) * dt) / FLYM.tauDriven;
  else s.rps -= (s.rps * dt) / FLYM.tauCoast;
  s.ang += s.rps * 0.25 * TAU * dt; // a quarter of the real speed, so the spokes don't strobe
}

function take(s, lane, name) {
  const cur = s.bars.findLast((b) => b.lane === lane && b.end == null);
  if (cur) {
    cur.end = s.time;
    cur.state = "cancel";
  }
  s.bars.push({
    lane,
    start: s.time,
    end: null,
    label: `${name} (hold)`,
    open: true,
    state: "run",
  });
  if (lane === 0) s.armCmd = name;
  else {
    s.flyCmd = name;
    s.flyVolts = VOLTS[name];
  }
}

function control(s) {
  for (const [k, lane, onTrue, onFalse] of [
    ["lt", 0, "runFast", "stop"],
    ["rt", 1, "runFast", s.pick],
  ]) {
    const was = k + "Was";
    if (s[k] !== s[was]) {
      s.edges.push({ k, t: s.time, down: s[k], bound: s.mode === "teleop" });
      if (s.mode === "teleop") take(s, lane, s[k] ? onTrue : onFalse);
    }
    s[was] = s[k];
  }
}

const fresh = (time = 0) => ({
  time,
  lt: false,
  rt: false,
  ltWas: false,
  rtWas: false,
  mode: "teleop",
  pick: "runSlow",
  pickAt: -1,
  armCmd: null,
  flyCmd: null,
  flyVolts: 0,
  theta: 0,
  omega: 0,
  rps: 0,
  ang: 0,
  bars: [],
  edges: [],
});

const armRot = (theta) => -theta / TAU - 0.25;

// ---- the code on screen -------------------------------------------------------------

// gen: only in the generated file (main); fin: only after the edit (mech-2-Commands).
const LINES = [
  { s: "@Teleop", to: '@Teleop(name = "Teleop")', id: "ann" },
  { s: "public class MyTeleop extends PeriodicOpMode {" },
  { s: "  private final Robot robot;", gen: true },
  { s: "  private final CommandNiDsXboxController driver =", fin: 0 },
  { s: "      new CommandNiDsXboxController(0);", fin: 0 },
  { s: "", gap: true },
  { s: "  public MyTeleop(Robot robot) {", id: "ctor" },
  { s: "    this.robot = robot;", gen: true },
  {
    s: "    driver.leftTrigger()",
    fin: 1,
    on: (s) => s.lt && s.mode === "teleop",
  },
  {
    s: "        .whileTrue(robot.arm.runFast())",
    fin: 1,
    on: (s) => s.lt && s.armCmd === "runFast" && s.mode === "teleop",
    edge: "press",
    arm: true,
  },
  {
    s: "        .whileFalse(robot.arm.stop());",
    fin: 1,
    on: (s) => !s.lt && s.armCmd === "stop" && s.mode === "teleop",
    edge: "release",
  },
  {
    s: "    driver.rightTrigger()",
    fin: 2,
    on: (s) => s.rt && s.mode === "teleop",
    fly: true,
  },
  {
    s: "        .whileTrue(robot.flywheel.runFast())",
    fin: 2,
    on: (s) => s.rt && s.flyCmd === "runFast" && s.mode === "teleop",
    edge: "press",
  },
  {
    s: (s) => `        .whileFalse(robot.flywheel.${s.pick}());`,
    fin: 2,
    on: (s) => !s.rt && s.flyCmd === s.pick && s.mode === "teleop",
    edge: "release",
    pick: true,
  },
  { s: "    driver.a()", fin: 3 },
  { s: "        .whileTrue(robot.flywheel.runFast())", fin: 3 },
  { s: "        .whileFalse(robot.flywheel.stop());", fin: 3 },
  { s: "  }" },
  { s: "", gap: true, gen: true },
  { s: "  @Override", gen: true },
  { s: "  public void disabledPeriodic() { ... }", gen: true },
  { s: "  @Override", gen: true },
  { s: "  public void start() { ... }", gen: true },
  { s: "  @Override", gen: true },
  { s: "  public void periodic() { ... }", gen: true },
  { s: "  @Override", gen: true },
  { s: "  public void end() { ... }", gen: true },
  { s: "  @Override", gen: true },
  { s: "  public void close() { ... }", gen: true },
  { s: "}" },
];

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    ds: L("intro").t0 + 0.4,
    ann: Wd("callback", "annotation") - 0.1,
    ghost: Wd("edit", "second") - 0.1,
    strike: Wd("edit", "list.") + 0.1,
    clear: Wd("bind", "Clear"),
    bind: Wd("bind", "bind"),
    hands: Wd("bind", "hands") - 0.2,
    edges: L("edges").t0,
    toAuto: Wd("mode", "Switch"),
    toTeleop: Wd("mode", "Switch", 2),
  };

  const events = [
    // edges: one press, one release
    { t: Wd("edges", "Pressing"), do: (s) => (s.lt = true) },
    { t: Wd("edges", "letting"), do: (s) => (s.lt = false) },
    // left: push, then stop
    { t: Wd("left", "Hold") + 0.3, do: (s) => (s.lt = true) },
    { t: Wd("left", "go,") + 0.05, do: (s) => (s.lt = false) },
    // right: fast, then back to slow
    { t: L("right").t0 - 0.5, do: (s) => (s.rt = true) },
    { t: Wd("right", "drops"), do: (s) => (s.rt = false) },
    // the gate, played for you: hold, pick stop, let go
    { t: gate.t0 + 0.6, do: (s) => (s.rt = true) },
    { t: gate.t0 + 1.8, do: (s) => ((s.pick = "stop"), (s.pickAt = s.time)) },
    { t: gate.t0 + 3.2, do: (s) => (s.rt = false) },
    { t: gate.t1, do: (s) => ((s.pick = "runSlow"), (s.pickAt = -1)) },
    // the mode switch: an edge in My Auto does nothing; back in Teleop it does
    { t: T.toAuto, do: (s) => (s.mode = "auto") },
    { t: Wd("mode", "triggers"), do: (s) => (s.rt = true) },
    { t: Wd("mode", "nothing.") + 0.2, do: (s) => (s.rt = false) },
    { t: T.toTeleop, do: (s) => (s.mode = "teleop") },
    { t: Wd("mode", "they're"), do: (s) => (s.rt = true) },
    { t: Wd("mode", "clean") - 0.2, do: (s) => (s.rt = false) },
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
      const { bars, edges, ...rest } = s;
      samples.push(rest);
    }
  }
  const BARS = final.bars;
  const EDGE_LOG = final.edges;
  const at = (t) => samples[clamp(Math.floor(t * RATE), 0, samples.length - 1)];

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 540, z: 1.0 };
  const TOP = { x: 1200, y: 330, z: 1.42 };
  const shots = [
    { t: 0, ...TOP, d: 0.01 },
    { t: L("bind").t0 - 0.3, x: 1280, y: 340, z: 1.5, d: 1.0 },
    { t: T.hands - 0.3, ...FULL, d: 1.2 },
    { t: L("edges").t0 - 0.2, x: 720, y: 420, z: 1.35, d: 1.2 },
    { t: L("left").t0 - 0.3, ...FULL, d: 1.2 },
    { t: L("mode").t0 - 0.2, ...TOP, d: 1.2 },
    { t: Wd("mode", "triggers") - 0.7, ...FULL, d: 1.0 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawDS(ctx, s, t, live) {
    const R = DS;
    panel(ctx, R, C.bg2);
    micro(ctx, "driver station · OpMode", R.x + 22, R.y + 36);
    rrect(ctx, R.x + R.w - 130, R.y + 14, 110, 32, 3);
    ctx.fillStyle = alpha(C.ok, 0.15);
    ctx.fill();
    text(ctx, "ENABLED", R.x + R.w - 75, R.y + 36, {
      font: MONO,
      size: 17,
      weight: 600,
      align: "center",
      color: C.ok,
      spacing: 2,
    });
    const tt = live ? 1e9 : t;
    const ghostIn = live ? 0 : window_(t, T.ghost, T.clear + 0.2, 0.4);
    const strike = live ? 0 : clamp((t - T.strike) / 0.4);
    const rows = [
      // an unnamed @Teleop lists under its class name (WPILib: "defaults to the name of the class")
      {
        name: live || t >= T.clear + 0.4 ? "Teleop" : "MyTeleop",
        file: "MyTeleop.java",
        kind: "teleop",
        h: 1,
      },
      { name: "MyTeleop2", file: "MyTeleop2.java", kind: "ghost", h: ghostIn },
      { name: "My Auto", file: "MyAuto.java", kind: "auto", h: 1 },
    ];
    let y = R.y + 62;
    const rowY = {};
    for (const r of rows) {
      if (r.h <= 0.01) continue;
      const h = 50 * r.h;
      rowY[r.kind] = y + 22;
      ctx.save();
      ctx.globalAlpha *= r.h;
      const sel = r.kind === s.mode;
      rrect(ctx, R.x + 18, y, R.w - 36, 42, 3);
      ctx.fillStyle = sel ? alpha(C.accent, 0.16) : C.bg;
      ctx.fill();
      ctx.strokeStyle =
        r.kind === "ghost"
          ? strike > 0
            ? C.err
            : C.tx3
          : sel
            ? C.accent
            : C.rule;
      ctx.lineWidth = 2;
      if (r.kind === "ghost") ctx.setLineDash([7, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, r.name, R.x + 36, y + 29, {
        size: 22,
        weight: 600,
        color: r.kind === "ghost" ? C.tx2 : sel ? C.accent : C.tx,
      });
      text(ctx, r.file, R.x + R.w - 36, y + 28, {
        font: MONO,
        size: 17,
        align: "right",
        color: r.kind === "ghost" ? C.tx3 : C.tx2,
      });
      if (r.kind === "ghost" && strike > 0) {
        ctx.strokeStyle = C.err;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(R.x + 28, y + 21);
        ctx.lineTo(R.x + 28 + (R.w - 56) * easeOut(strike), y + 21);
        ctx.stroke();
      }
      ctx.restore();
      y += h;
    }
    void tt;
    return rowY;
  }

  // The generated file collapsing into the bindings.
  function codeLayout(t, live) {
    const collapse = live ? 1 : easeInOut(ramp(t, T.clear, 0.9));
    const out = [];
    let y = CODE.y + 84;
    let first = true;
    for (const ln of LINES) {
      let h = 1;
      let a = 1;
      let chars = 1;
      if (ln.gen) {
        h = 1 - collapse;
        a = 1 - collapse;
      } else if (ln.fin != null) {
        const k = live ? 1 : ramp(t, T.bind + ln.fin * 0.45, 0.5);
        h = easeOut(clamp(k * 2));
        a = h;
        chars = k;
      }
      if (ln.gap) h *= 0.5;
      if (!first) y += LH * h;
      first = false;
      out.push({ ln, y, h, a, chars });
    }
    return out;
  }

  function drawCode(ctx, s, t, live, rowY) {
    panel(ctx, CODE);
    micro(ctx, "opmode/MyTeleop.java", CODE.x + 28, CODE.y + 44);
    const fin = live || t >= T.bind;
    text(
      ctx,
      fin ? "mech-2-Commands" : "as generated",
      CODE.x + CODE.w - 28,
      CODE.y + 44,
      { font: MONO, size: 17, align: "right", color: C.tx3 }
    );
    const auto = s.mode === "auto";
    const lay = codeLayout(t, live);
    const ctorRow = lay.find((r) => r.ln.id === "ctor");
    for (const r of lay) {
      const { ln, y, h, a, chars } = r;
      if (h <= 0.02 || a <= 0.02 || ln.gap) continue;
      let str = typeof ln.s === "function" ? ln.s(s) : ln.s;
      // the annotation gets its name in the edit
      let prev = null;
      let kSwap = 1;
      if (ln.to) {
        const ts = T.clear + 0.4;
        if (live || t >= ts) {
          kSwap = live ? 1 : clamp((t - ts) / 0.4);
          prev = str;
          str = ln.to;
        }
      }
      const binding = ln.fin != null && ln.fin >= 1;
      const dim = binding && auto ? 0.22 : 1;
      if (ln.on?.(s)) runBar(ctx, CODE.x + 1, y - 20, CODE.w - 2, LH, 0);
      if (ln.id === "ann" && !live) {
        const k = window_(t, T.ann, L("edit").t0 + 0.2, 0.3);
        if (k > 0) {
          ctx.fillStyle = alpha(C.accent, 0.18 * k);
          ctx.fillRect(CODE.x + 18, y - 22, codeWidth(ctx, str) + 20, LH + 2);
        }
      }
      if (prev && kSwap < 1)
        codeLine(ctx, prev, CODE.x + 28, y, { a: a * (1 - kSwap) });
      codeLine(
        ctx,
        chars < 1 ? str.slice(0, Math.ceil(str.length * chars)) : str,
        CODE.x + 28,
        y,
        { a: a * dim * (prev && kSwap < 1 ? kSwap : 1) }
      );
      // the edge each binding listens to
      if (ln.edge && !live) {
        const k = window_(
          t,
          Wd("edges", "Pressing") - 0.2,
          L("edges").t1 + 0.4,
          0.3
        );
        if (k > 0)
          text(
            ctx,
            ln.edge === "press" ? "← press" : "← release",
            CODE.x + 40 + codeWidth(ctx, str),
            y,
            { font: MONO, size: 18, weight: 600, color: C.accent, a: k }
          );
      }
      if (ln.pick && s.pickAt > 0 && t - s.pickAt < 2.5) {
        ctx.fillStyle = alpha(C.accent, 1 - (t - s.pickAt) / 2.5);
        ctx.fillRect(CODE.x + 8, y - 20, 4, LH - 4);
      }
    }
    // the constructor gets the robot
    if (!live && ctorRow) {
      const k = window_(t, T.hands, L("edges").t0 - 0.2, 0.3);
      if (k > 0) {
        const x0 = CODE.x + 28 + codeWidth(ctx, "  public MyTeleop(");
        ctx.strokeStyle = alpha(C.accent, k);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x0, ctorRow.y + 7);
        ctx.lineTo(x0 + codeWidth(ctx, "Robot robot"), ctorRow.y + 7);
        ctx.stroke();
      }
    }
    // the annotation puts it on the list
    if (!live && rowY.teleop) {
      const k = window_(t, T.ann + 0.3, L("edit").t0 + 0.2, 0.3);
      if (k > 0) {
        const ay = lay[0].y - 8;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(CODE.x + 14, ay);
        ctx.bezierCurveTo(
          CODE.x - 10,
          ay,
          DS.x + DS.w + 10,
          rowY.teleop,
          DS.x + DS.w - 18,
          rowY.teleop
        );
        ctx.stroke();
        ctx.restore();
      }
    }
    // bindings belong to the mode
    if (auto) {
      const ly = lay.find((r) => r.ln.fin === 2).y;
      rrect(ctx, CODE.x + 200, ly - 30, 400, 48, 4);
      ctx.fillStyle = alpha(C.bg2, 0.96);
      ctx.fill();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      text(ctx, "My Auto selected: no bindings", CODE.x + 400, ly + 2, {
        font: MONO,
        size: 19,
        weight: 600,
        align: "center",
        color: C.tx2,
      });
    }
    // the gate's choice
    if (live || (t >= gate.t0 && t < gate.t1)) {
      const y = CODE.y + 548;
      micro(ctx, "release runs", CODE.x + 28, y + 23, { size: 17 });
      let x = CODE.x + 200;
      ["stop", "runSlow", "runFast"].forEach((p, i) => {
        const lbl = `${i + 1} · ${p}`;
        ctx.font = `600 18px ${MONO}`;
        const w = ctx.measureText(lbl).width + 26;
        const on = s.pick === p;
        rrect(ctx, x, y, w, 34, 3);
        ctx.fillStyle = on ? C.accent : C.bg2;
        ctx.fill();
        ctx.strokeStyle = on ? C.accent : C.rule;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        text(ctx, lbl, x + 13, y + 24, {
          font: MONO,
          size: 18,
          weight: 600,
          color: on ? C.accentInk : C.tx2,
        });
        x += w + 12;
      });
    }
  }

  // Each trigger's signal over the last few seconds, with its two edges.
  function drawEdges(ctx, s, t, edgesLog) {
    const R = EDGES;
    const lit = window_(t, L("edges").t0, L("edges").t1 + 0.3, 0.4);
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = lit ? alpha(C.accent, 0.35 + 0.65 * lit) : C.rule;
    ctx.lineWidth = 2 + 2 * lit;
    ctx.stroke();
    micro(ctx, "edges · last 5 s", R.x + 20, R.y + 32, { size: 16 });
    const span = 5;
    const x0 = R.x + 20;
    const x1 = R.x + R.w - 20;
    const X = (u) => x0 + ((u - (t - span)) / span) * (x1 - x0);
    const rows = [
      {
        k: "lt",
        name: "LT → arm",
        cmd: s.armCmd,
        volts: s.armCmd === "runFast" ? 6 : 0,
      },
      { k: "rt", name: "RT → flywheel", cmd: s.flyCmd, volts: s.flyVolts },
    ];
    rows.forEach((r, i) => {
      const top = R.y + 50 + i * 82;
      text(ctx, r.name, x0, top + 18, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.tx2,
      });
      const unbound = s.mode === "auto";
      const cur = unbound
        ? "no binding"
        : r.cmd
          ? `${r.cmd} · ${r.volts.toFixed(0)} V`
          : "nothing yet";
      text(ctx, cur, x1, top + 18, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "right",
        color: unbound || !r.cmd ? C.tx3 : C.accent,
      });
      const hi = top + 34;
      const lo = top + 62;
      const ev = edgesLog.filter((e) => e.k === r.k && e.t <= t);
      let state = false;
      for (const e of ev) if (e.t <= t - span) state = e.down;
      ctx.strokeStyle = C.tx2;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, state ? hi : lo);
      for (const e of ev) {
        if (e.t <= t - span) continue;
        const x = X(e.t);
        ctx.lineTo(x, state ? hi : lo);
        state = e.down;
        ctx.lineTo(x, state ? hi : lo);
      }
      ctx.lineTo(x1, state ? hi : lo);
      ctx.stroke();
      // the edges themselves
      for (const e of ev) {
        if (e.t <= t - span) continue;
        const x = X(e.t);
        const age = t - e.t;
        ctx.fillStyle = e.bound ? C.accent : C.tx3;
        ctx.beginPath();
        if (e.down) {
          ctx.moveTo(x - 7, hi - 12);
          ctx.lineTo(x + 7, hi - 12);
          ctx.lineTo(x, hi - 3);
        } else {
          ctx.moveTo(x - 7, lo + 12);
          ctx.lineTo(x + 7, lo + 12);
          ctx.lineTo(x, lo + 3);
        }
        ctx.fill();
        if (age < 2.5) {
          const lbl = e.down ? "press" : "release";
          text(ctx, lbl, x + 10, (hi + lo) / 2 + 6, {
            font: MONO,
            size: 16,
            weight: 600,
            color: e.bound ? C.accent : C.tx3,
            a: 1 - age / 2.5,
          });
        }
      }
    });
  }

  function drawBench(ctx, s, t, history, live) {
    drawStand(ctx, PIVOT, FLOOR);
    drawArmBody(ctx, PIVOT, ARM_LEN, armRot(s.theta), {
      history,
      driven: s.armCmd === "runFast",
    });
    drawFlywheel(ctx, FLY, FLY_R, s.ang, {
      rps: s.rps,
      driven: s.flyVolts > 0,
    });
    text(ctx, "arm", PIVOT.x - 110, FLOOR - 14, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "center",
      color: C.tx3,
    });
    text(ctx, `flywheel · ${s.rps.toFixed(0)} rps`, FLY.x, FLY.y - FLY_R - 16, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "center",
      color: s.flyVolts > 0 ? C.accent : C.tx3,
    });
    if (live) return;
    // the robot hands the constructor the arm and the flywheel
    const k = window_(t, T.hands, L("edges").t0 - 0.2, 0.3);
    if (k > 0) {
      const lay = codeLayout(t, false);
      const ly = lay.find((r) => r.ln.arm).y - 8;
      const fy = lay.find((r) => r.ln.fly).y - 8;
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.setLineDash([9, 7]);
      ctx.beginPath();
      ctx.moveTo(CODE.x + 10, ly);
      ctx.bezierCurveTo(
        CODE.x - 200,
        ly,
        PIVOT.x + 120,
        PIVOT.y - 60,
        PIVOT.x + 50,
        PIVOT.y - 10
      );
      ctx.moveTo(CODE.x + 10, fy);
      ctx.bezierCurveTo(
        CODE.x - 60,
        fy,
        FLY.x + 120,
        FLY.y + 20,
        FLY.x + FLY_R + 8,
        FLY.y
      );
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, "robot.arm", PIVOT.x + 70, PIVOT.y - 90, {
        font: MONO,
        size: 19,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
    }
  }

  function drawLanes(ctx, s, t, live) {
    const a = live ? 1 : easeOut(ramp(t, L("edges").t0 - 0.4, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a * (s.mode === "auto" ? 0.45 : 1);
    const from = live ? t - 6.5 : Math.max(L("edges").t0 - 0.4, t - 6.5);
    drawTimeline(ctx, LANES, {
      lanes: ["Arm", "Flywheel"],
      bars: live ? s.bars : BARS,
      view: { t0: from, span: 9 },
      now: t,
    });
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
    micro(ctx, "Workshop 3 · OpModes", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Two Edges", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Every hold", W / 2, 450, {
      font: SERIF,
      size: 88,
      align: "center",
    });
    text(ctx, "needs a release.", W / 2, 556, {
      font: SERIF,
      size: 88,
      align: "center",
      color: C.accent,
    });
    text(ctx, "Next: what happens without one.", W / 2, 660, {
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
    if (!live)
      for (let i = 6; i >= 1; i--)
        history.push(armRot(at(t - i * 0.035).theta));
    else history.push(...live.trail);

    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    const rowY = drawDS(ctx, s, t, !!live);
    drawCode(ctx, s, t, !!live, rowY);
    drawBench(ctx, s, t, history, !!live);
    drawController(ctx, PAD, { lt: s.lt, rt: s.rt, label: false });
    drawPadLabel(ctx, s);
    drawEdges(ctx, s, t, live ? s.edges : EDGE_LOG);
    drawLanes(ctx, s, t, !!live);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  const RESULT = {
    stop: "The release ran stop: it coasts to zero.",
    runSlow: "The release ran runSlow: it settles at 3 V.",
    runFast: "The release ran runFast: it stays at 6 V.",
  };

  function liveGate() {
    const s0 = at(gate.t0);
    const keep = (b) => b.end != null && b.end <= gate.t0;
    const s = {
      ...s0,
      time: gate.t0,
      trail: [],
      bars: BARS.filter((b) => b.start < gate.t0).map((b) => ({
        ...b,
        end: keep(b) ? b.end : null,
        state: keep(b) ? b.state : "run",
      })),
      edges: EDGE_LOG.filter((e) => e.t < gate.t0).map((e) => ({ ...e })),
    };
    let picked = false;
    let releasedAt = null;
    let heldAt = null;
    return {
      state: s,
      prompt() {
        if (releasedAt != null) return RESULT[s.pick];
        if (!s.rt) return "Hold the right trigger.";
        if (!picked) return "Pick what the release runs: 1, 2 or 3.";
        return "Now let go.";
      },
      input(k, down) {
        if (k === "rt" && releasedAt == null) {
          if (down) heldAt = s.time;
          if (!down && s.rt && heldAt != null) releasedAt = s.time;
          s.rt = down;
        }
        if (down && k.startsWith("pick-") && releasedAt == null) {
          s.pick = {
            "pick-stop": "stop",
            "pick-slow": "runSlow",
            "pick-fast": "runFast",
          }[k];
          s.pickAt = s.time;
          picked = true;
        }
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
        return releasedAt !== null && s.time - releasedAt > 2.0;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 0.6) return "Hold the right trigger.";
    if (u < 1.8) return "Pick what the release runs: 1, 2 or 3.";
    if (u < 3.2) return "Now let go.";
    return RESULT.stop;
  }

  const gateControls = [
    { k: "rt", label: "Right trigger", key: "KeyR", kind: "hold" },
    { k: "pick-stop", label: "stop", key: "Digit1", kind: "press" },
    { k: "pick-slow", label: "runSlow", key: "Digit2", kind: "press" },
    { k: "pick-fast", label: "runFast", key: "Digit3", kind: "press" },
  ];

  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
