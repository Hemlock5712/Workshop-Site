// Fork and Wait. An autonomous routine written as one method that pauses on a line.
//
// What is simulated, and how:
//   the routine   RaiseAndShootOpMode.raiseAndShoot on mech-5-Coroutines, run on 20 ms
//                 loops: fork the arm, bounded wait, fork the flywheel, bounded wait,
//                 one second for the shot, fork stop(). Ending it cancels every fork,
//                 and a canceled command sends nothing.
//   the arm       the Motion Magic arm from motion-magic-code: trapezoid profile on the
//                 TalonFX, gravity feedforward + PD, one rotating arm with gravity.
//   the flywheel  a first-order velocity model: runFast() pulls it to 75 rps, stop()
//                 leaves it in coast (the branch's NeutralMode) and it spins down.
// The robot clock is not the narration's: each run is simulated once in robot time and
// mapped onto the narration with a few keyframes, labelled when it runs slow or fast.
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
  drawArmBody,
  drawController,
  drawFlywheel,
  drawMotorCard,
  drawStand,
  drawTargetMark,
  drawTimeline,
  panel,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const MAIN = { x: 110, w: 540 };
const LH = 25;
const CODE_SIZE = 20;
const ARM_LANE = { x: 690, w: 190 };
const FLY_LANE = { x: 900, w: 190 };
const DS = { x: 1130, y: 56, w: 480, h: 154 };
const PAD = { x: 1630, y: 74, s: 0.58 };
const PIVOT = { x: 1300, y: 480 };
const ARM_LEN = 150;
const FLOOR = 650;
const WHEEL = { x: 1700, y: 448 };
const WHEEL_R = 82;
const ARM_CARD = { x: 1130, y: 690, w: 360, h: 225 };
const FLY_CARD = { x: 1520, y: 690, w: 360, h: 225 };

// The routine's body, as nodes down the left: the page's lines, the branch's code.
const NODE_SPECS = [
  { lines: ["coroutine.fork(robot.arm.vertical());"] },
  {
    lines: [
      "if (coroutine.waitUntil(",
      "    () -> robot.arm.isAtTarget(),",
      "    Seconds.of(3.0)).timedOut()) {",
      "  return;",
      "}",
    ],
    wait: 3,
    ret: [3],
  },
  { lines: ["coroutine.fork(robot.flywheel.runFast());"] },
  {
    lines: [
      "if (coroutine.waitUntil(",
      "    () -> robot.flywheel.isAtTarget(),",
      "    Seconds.of(3.0)).timedOut()) {",
      "  coroutine.fork(robot.flywheel.stop());",
      "  return;",
      "}",
    ],
    wait: 3,
    ret: [3, 4],
  },
  { lines: ["coroutine.wait(Seconds.of(1.0)); // shoot"], wait: 1 },
  { lines: ["coroutine.fork(robot.flywheel.stop());"] },
];
const NODES = (() => {
  let y = 96;
  return NODE_SPECS.map((n) => {
    const h = 22 + n.lines.length * LH + (n.wait ? 28 : 0);
    const node = { ...n, y, h, mid: y + (n.wait ? 12 + LH * 0.5 + 11 : h / 2) };
    y += h + 20;
    return node;
  });
})();
const BOTTOM = NODES.at(-1).y + NODES.at(-1).h;
const JOIN_Y = BOTTOM + 30;
const laneTop = (node) => NODES[node].mid + 36;

// ---- the model ----------------------------------------------------------------------

const TAU = 2 * Math.PI;
const TARGET = 0.25;
const REST = -0.25;
const PHYS = { kM: 2.6, b: 4, g: 12 };
const MM = { cruise: 0.5, accel: 1.2 };
const DT = 1 / 960;
const LOOP = 0.02;
const SR = 480; // samples per robot second
const AUTO = 15;
const ARM_TOL = 1 / 360; // Degrees.of(1.0)
const FLY_TOL = 0.5; // RotationsPerSecond.of(0.5)
const FLY = { target: 75, tau: 0.2, coast: 3.0 };

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

// One run of the OpMode: start() schedules the routine at u = 0, end() cancels it when
// the 15 s autonomous period runs out. `mode` is what line 1 says; `jam` stops the arm.
function simulateRun({ mode = "fork", jam = null, dur = 20 } = {}) {
  const a = {
    rot: REST,
    w: 0,
    sp: { p: REST, v: 0, a: 0 },
    req: null,
    volts: 0,
  };
  const f = { v: 0, ang: 0, req: null };
  const r = {
    pc: 0,
    waiting: false,
    waitStart: 0,
    visits: [-1, -1, -1, -1, -1, -1],
    ended: null,
    reason: null,
    gaveUp: null,
    arrived1: null,
    arrived2: null,
    armLane: null,
    flyLane: null,
    stopAt: null,
  };
  const armAt = () => Math.abs(a.rot - TARGET) < ARM_TOL;
  const flyAt = () =>
    f.req === "runFast" && Math.abs(f.v - FLY.target) < FLY_TOL;
  const end = (u, reason) => {
    r.ended = u;
    r.reason = reason;
    r.waiting = false;
    if (r.armLane) r.armLane.end = u;
    if (r.flyLane) r.flyLane.end = u;
  };
  const forkStop = (u) => {
    r.flyLane.cmd = "stop()";
    r.stopAt = u;
    f.req = "stop"; // stop() replaces runFast() and sends on this loop
  };
  function routine(u) {
    for (let guard = 0; guard < 12; guard++) {
      switch (r.pc) {
        case 0:
          r.visits[0] = u;
          if (!r.armLane)
            r.armLane = { start: u, end: null, cmd: "vertical()" };
          if (mode === "await") {
            r.waiting = true; // waits for vertical() to finish, which it never does
            return;
          }
          r.pc = 1;
          r.visits[1] = u;
          r.waitStart = u;
          r.waiting = true;
          continue;
        case 1:
          if (armAt()) {
            r.arrived1 = u;
            r.pc = 2;
            continue;
          }
          if (u - r.waitStart >= 3 - 1e-9) {
            r.gaveUp = { node: 1, u };
            end(u, "timeout");
          }
          return;
        case 2:
          r.visits[2] = u;
          r.flyLane = { start: u, end: null, cmd: "runFast()" };
          r.pc = 3;
          r.visits[3] = u;
          r.waitStart = u;
          r.waiting = true;
          continue;
        case 3:
          if (flyAt()) {
            r.arrived2 = u;
            r.pc = 4;
            r.visits[4] = u;
            r.waitStart = u;
            continue;
          }
          if (u - r.waitStart >= 3 - 1e-9) {
            r.gaveUp = { node: 3, u };
            forkStop(u);
            end(u, "timeout");
          }
          return;
        case 4:
          if (u - r.waitStart >= 1 - 1e-9) {
            r.pc = 5;
            r.visits[5] = u;
            continue;
          }
          return;
        case 5:
          forkStop(u);
          end(u, "done");
          return;
      }
    }
  }
  function loop(u) {
    if (r.ended == null) {
      if (u >= AUTO - 1e-9) end(u, "auto");
      else routine(u);
    }
    // the forked commands run on the same loop; a canceled one sends nothing
    if (r.armLane && r.armLane.end == null && a.req == null) {
      a.req = TARGET;
      a.sp = { p: a.rot, v: 0, a: 0 };
    }
    if (r.flyLane && r.flyLane.end == null)
      f.req = r.flyLane.cmd === "stop()" ? "stop" : "runFast";
  }
  function physics() {
    if (a.req != null) stepProfile(a.sp, a.req, DT);
    a.volts = armVolts(a);
    const phi = a.rot * TAU;
    const acc = PHYS.kM * a.volts - PHYS.g * Math.cos(phi) - PHYS.b * a.w * TAU;
    a.w += (acc / TAU) * DT;
    a.rot += a.w * DT;
    if (jam != null && a.rot > jam) {
      a.rot = jam;
      if (a.w > 0) a.w = 0;
    }
    if (f.req === "runFast") f.v += ((FLY.target - f.v) / FLY.tau) * DT;
    else f.v -= (f.v / FLY.coast) * DT;
    f.ang += f.v * DT * TAU * 0.05; // drawn slower than it spins
  }
  const out = [];
  let u = 0;
  let next = LOOP;
  for (let i = 0, n = Math.ceil(dur * SR) + 1; i < n; i++) {
    while (u < i / SR - 1e-12) {
      if (u >= next - 1e-9) {
        loop(next);
        next += LOOP;
      }
      physics();
      u += DT;
    }
    out.push({
      u: i / SR,
      rot: a.rot,
      sp: a.sp.p,
      req: a.req,
      volts: a.volts,
      fv: f.v,
      fang: f.ang,
      freq: f.req,
      pc: r.pc,
      waiting: r.waiting,
      waitStart: r.waitStart,
      visits: [...r.visits],
      ended: r.ended,
      reason: r.reason,
      gaveUp: r.gaveUp,
      arrived1: r.arrived1,
      arrived2: r.arrived2,
      armLane: r.armLane && { ...r.armLane },
      flyLane: r.flyLane && { ...r.flyLane },
      stopAt: r.stopAt,
      armAt: armAt(),
      mode,
      jam,
    });
  }
  return out;
}

const sampleAt = (run, u) => run[clamp(Math.floor(u * SR), 0, run.length - 1)];

// narration time -> robot time, piecewise linear; also the local rate
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

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const FORK = simulateRun({ mode: "fork", dur: 20 });
  const AWAIT = simulateRun({ mode: "await", dur: 19.5 });
  const JAM = simulateRun({ mode: "fork", jam: 0.07, dur: 10 });

  const fin = FORK.at(-1);
  const uA = fin.arrived1;
  const uS = fin.arrived2;
  const uE = fin.ended;
  // the instant the arm is inside tolerance, before the routine's next loop notices
  const condA = (FORK.find((s) => s.armAt && s.pc === 1) ?? { u: uA - 0.001 })
    .u;

  const PICK = gate.t0 + 1.2; // the scripted gate picks await here
  const segs = [
    {
      t0: L("fork").t0 - 0.2,
      t1: L("tryit").t0 - 0.2,
      run: FORK,
      fill: "fork",
      keys: [
        [L("fork").t0 - 0.1, 0],
        [Wd("fork", "starts") + 0.1, 0.021],
        [Wd("wait", "place,"), condA + 0.0005],
      ],
    },
    { t0: L("tryit").t0 - 0.2, t1: PICK, run: null, fill: "blank" },
    {
      t0: PICK,
      t1: L("timeout").t0 - 0.3,
      run: AWAIT,
      fill: "await",
      keys: [
        [PICK, 0],
        [PICK + 6, 15],
        [PICK + 10, 19],
      ],
    },
    {
      t0: L("timeout").t0 - 0.3,
      t1: L("shoot").t0 - 0.6,
      run: JAM,
      fill: "fork",
      keys: [
        [Wd("timeout", "leaves.") - 3.04, 0],
        [Wd("timeout", "leaves.") + 6, 9.04],
      ],
    },
    {
      t0: L("shoot").t0 - 0.6,
      t1: VOICE.duration + 1,
      run: FORK,
      fill: "fork",
      keys: [
        [L("shoot").t0 - 0.6, 0],
        [Wd("shoot", "flywheel"), uA + 0.001],
        [Wd("shoot", "speed,"), uS + 0.001],
        [Wd("stop", "stop") - 0.05, uE - 0.003],
        [Wd("stop", "stop") + 0.1, uE + 0.003],
        [
          L("close").t0 + 0.5,
          uE + 0.003 + (L("close").t0 + 0.4 - Wd("stop", "stop")),
        ],
      ],
    },
  ];

  // what is on screen at narration time t (not live)
  function viewAt(t) {
    const seg = segs.find((g) => t >= g.t0 && t < g.t1);
    if (!seg) {
      // the intro walks the code: line one, then the wait it pauses on
      let walk = null;
      if (t >= Wd("intro", "line") && t < L("fork").t0 - 0.2)
        walk = {
          pc: t >= Wd("intro", "after") ? 1 : 0,
          waiting: t >= Wd("intro", "pause"),
        };
      return { fill: "fork", s: null, walk, rate: 1 };
    }
    if (!seg.run) return { fill: seg.fill, s: null, rate: 1 };
    const { u, rate } = mapKeys(seg.keys, t);
    return { fill: seg.fill, s: sampleAt(seg.run, u), rate };
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 520, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("intro").t0 - 0.4, x: 560, y: 420, z: 1.4, d: 0.01 },
    { t: L("callback").t0 - 0.2, x: 1500, y: 250, z: 1.55, d: 1.2 },
    { t: L("fork").t0 - 0.4, ...FULL, d: 1.0 },
    { t: L("tryit").t0 - 0.2, x: 600, y: 300, z: 1.3, d: 1.0 },
    { t: gate.t0, ...FULL, d: 0.8 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawHeader(ctx, V) {
    micro(ctx, "the routine · raiseAndShoot(coroutine)", MAIN.x, 76);
    const s = V.s;
    if (!s) return;
    const tag =
      V.rate > 0 && V.rate < 0.8
        ? " · slow motion"
        : V.rate > 1.4
          ? ` · ×${V.rate.toFixed(1)}`
          : V.rate === 0
            ? " · paused"
            : "";
    text(
      ctx,
      `robot clock ${s.u.toFixed(2)} s${tag}`,
      FLY_LANE.x + FLY_LANE.w,
      JOIN_Y + 34,
      {
        font: MONO,
        size: 18,
        weight: 600,
        align: "right",
        color: tag ? C.accent : C.tx2,
      }
    );
  }

  // node state: active / past / future, from the run
  function nodeState(i, V) {
    const s = V.s;
    if (V.walk)
      return i === V.walk.pc ? "active" : i < V.walk.pc ? "past" : "future";
    if (!s) return "idle";
    if (s.ended != null) return s.visits[i] >= 0 ? "past" : "future";
    if (i === s.pc) return "active";
    return s.visits[i] >= 0 ? "past" : "future";
  }

  function drawNodes(ctx, V, t) {
    const s = V.s;
    NODES.forEach((n, i) => {
      const st = nodeState(i, V);
      const active = st === "active";
      const waiting = active && (V.walk ? V.walk.waiting : s?.waiting);
      const op = { idle: 0.9, active: 1, past: 0.55, future: 0.3 }[st];
      // a fork line runs and returns on one loop; let it glow a moment after
      const glow =
        s && !n.wait && s.visits[i] >= 0 && (i !== 0 || s.mode === "fork")
          ? clamp(1 - (s.u - s.visits[i]) / 0.3)
          : 0;
      ctx.save();
      ctx.globalAlpha = op;
      rrect(ctx, MAIN.x, n.y, MAIN.w, n.h, 4);
      ctx.fillStyle =
        active || glow > 0
          ? alpha(C.accent, 0.1 + 0.08 * (active ? 1 : glow))
          : C.bg2;
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = active ? 2.5 : 1.5;
      const dashed = n.wait || (i === 0 && V.fill === "await");
      if (dashed) ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      if (active || glow > 0) {
        ctx.fillStyle = alpha(C.accent, active ? 1 : glow);
        ctx.fillRect(MAIN.x, n.y, 5, n.h);
      }
      // the code
      n.lines.forEach((ln, k) => {
        const y = n.y + 12 + LH * (k + 1) - 6;
        let str = ln;
        if (i === 0) str = lineOne(ctx, V, t, y);
        if (str == null) return;
        // a taken `return` lights up
        if (n.ret && s?.gaveUp?.node === i && n.ret.includes(k)) {
          ctx.fillStyle = alpha(C.err, 0.16);
          ctx.fillRect(MAIN.x + 6, y - 20, MAIN.w - 12, LH);
        }
        codeLine(ctx, str, MAIN.x + 18, y, { size: CODE_SIZE });
      });
      if (n.wait) drawWaitBits(ctx, n, i, V, st);
      ctx.restore();
    });
  }

  // line one, with its verb: fork, await, or a blank to fill
  function lineOne(ctx, V, t, y) {
    const x = MAIN.x + 18;
    if (V.fill === "fork") return "coroutine.fork(robot.arm.vertical());";
    if (V.fill === "await") {
      const s = V.s;
      const k = s ? clamp(s.u / 0.6) : 1;
      if (k < 1) {
        ctx.fillStyle = alpha(C.accent, 0.35 * (1 - k));
        ctx.fillRect(x + codeW(ctx, 10) - 4, y - 21, codeW(ctx, 5) + 8, 28);
      }
      return "coroutine.await(robot.arm.vertical());";
    }
    // blank
    const pre = "coroutine.";
    codeLine(ctx, pre, x, y, { size: CODE_SIZE });
    const bx = x + codeW(ctx, pre.length);
    const bw = codeW(ctx, 5) + 10;
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    rrect(ctx, bx, y - 22, bw, 30, 3);
    ctx.fillStyle = alpha(C.accent, 0.12 + 0.12 * pulse);
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "?", bx + bw / 2, y, {
      font: MONO,
      size: CODE_SIZE,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    codeLine(ctx, "(robot.arm.vertical());", bx + bw, y, { size: CODE_SIZE });
    // the two choices, in the header row
    text(ctx, "fork  or  await", FLY_LANE.x + FLY_LANE.w, 76, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "right",
      color: C.accent,
    });
    return null;
  }

  function codeW(ctx, nChars) {
    ctx.font = `500 ${CODE_SIZE}px ${MONO}`;
    return ctx.measureText("x".repeat(nChars)).width;
  }

  // two exits from a bounded wait, and how much of the limit is used
  function drawWaitBits(ctx, n, i, V, st) {
    const s = V.s;
    const y0 = n.y + 12 + LH - 6;
    if (n.wait === 3) {
      const arrived =
        s &&
        (i === 1
          ? s.arrived1 != null || (s.pc === 1 && s.armAt && s.ended == null)
          : s.arrived2 != null);
      const gave = s?.gaveUp?.node === i;
      const chip = (x, label, on, color) => {
        rrect(ctx, x, y0 - 21, 104, 28, 3);
        ctx.fillStyle = on ? alpha(color, 0.22) : "transparent";
        ctx.fill();
        ctx.strokeStyle = on ? color : C.rule;
        ctx.lineWidth = on ? 2 : 1.5;
        ctx.stroke();
        text(ctx, label, x + 52, y0 - 1, {
          font: MONO,
          size: 17,
          weight: 600,
          align: "center",
          color: on ? color : C.tx3,
        });
      };
      chip(MAIN.x + MAIN.w - 228, "arrived ↓", arrived, C.ok);
      chip(MAIN.x + MAIN.w - 116, "gave up", gave, C.err);
    }
    // the budget bar
    const by = n.y + n.h - 20;
    const bx = MAIN.x + 18;
    const bw = MAIN.w - 210;
    let used = null;
    if (s && s.visits[i] >= 0) {
      const ended = s.pc !== i || s.ended != null;
      const stopAt =
        s.pc !== i
          ? i === 1
            ? s.arrived1
            : i === 3
              ? s.arrived2
              : s.visits[5]
          : s.ended;
      used = (ended && stopAt != null ? stopAt : s.u) - s.visits[i];
      if (s.gaveUp?.node === i) used = n.wait;
      if (i === 4 && s.pc < 4) used = null;
    }
    ctx.fillStyle = alpha(C.tx3, 0.25);
    ctx.fillRect(bx, by - 6, bw, 6);
    if (used != null) {
      ctx.fillStyle =
        s?.gaveUp?.node === i
          ? C.err
          : st === "active"
            ? C.accent
            : alpha(C.accent, 0.6);
      ctx.fillRect(bx, by - 6, bw * clamp(used / n.wait), 6);
    }
    const lbl =
      used == null
        ? `limit ${n.wait.toFixed(1)} s`
        : `${Math.max(0, used).toFixed(2)} of ${n.wait.toFixed(1)} s`;
    text(ctx, lbl, bx + bw + 14, by + 1, {
      font: MONO,
      size: 17,
      color: used == null ? C.tx3 : C.tx2,
    });
  }

  // forked lanes: peel off the main column, scroll while running, cut when it ends
  function drawLanes(ctx, V, t) {
    const s = V.s;
    const lanes = [
      {
        R: ARM_LANE,
        node: 0,
        wake: 1,
        lane: s?.armLane,
        name: "ARM",
        cond: s && s.pc === 1 && s.armAt,
      },
      {
        R: FLY_LANE,
        node: 2,
        wake: 3,
        lane: s?.flyLane,
        name: "FLYWHEEL",
        cond: s && s.pc === 3 && Math.abs(s.fv - 75) < FLY_TOL,
      },
    ];
    for (const L_ of lanes) {
      const { R, lane } = L_;
      const top = laneTop(L_.node);
      const cx = R.x + R.w / 2;
      const running = lane && lane.end == null;
      const cut = lane && lane.end != null;
      ctx.save();
      ctx.globalAlpha = lane ? 1 : 0.2;
      rrect(ctx, R.x, top, R.w, BOTTOM - top, 3);
      ctx.fillStyle = running ? alpha(C.accent, 0.12) : "transparent";
      ctx.fill();
      ctx.strokeStyle = cut ? C.tx3 : C.accent;
      ctx.lineWidth = running ? 2 : 1.5;
      if (cut || !lane) ctx.setLineDash([6, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      const verb = s?.mode === "await" && L_.node === 0 ? "awaited" : "forked";
      micro(ctx, `${verb} · ${L_.name.toLowerCase()}`, R.x + 14, top + 30, {
        size: 16,
        spacing: 1,
        color: lane ? C.tx2 : C.tx3,
      });
      const cmd = lane?.cmd ?? (L_.node === 0 ? "vertical()" : "runFast()");
      text(ctx, cmd, R.x + 14, top + 60, {
        font: MONO,
        size: 20,
        weight: 600,
        color: running ? C.accent : C.tx3,
      });
      let status = "not started";
      if (lane) {
        if (cut) status = "canceled";
        else if (L_.node === 0)
          status = Math.abs(s.rot - TARGET) < 0.01 ? "holding" : "moving";
        else
          status =
            lane.cmd === "stop()"
              ? "replaced runFast()"
              : Math.abs(s.fv - 75) < FLY_TOL
                ? "holding 75 rps"
                : "spinning up";
      }
      text(ctx, status, R.x + 14, top + 88, {
        font: MONO,
        size: 17,
        color: cut ? C.err : C.tx2,
      });
      // chevrons: they scroll for as long as the lane runs
      ctx.save();
      ctx.beginPath();
      ctx.rect(R.x, top + 104, R.w, BOTTOM - top - 108);
      ctx.clip();
      const off = running ? (t * 60) % 56 : 0;
      ctx.strokeStyle = cut || !lane ? C.tx3 : C.accent;
      ctx.globalAlpha *= running ? 0.85 : 0.4;
      ctx.lineWidth = 2;
      for (let y = top + 104 - 56 + off; y < BOTTOM; y += 56) {
        ctx.beginPath();
        ctx.moveTo(cx - 9, y);
        ctx.lineTo(cx, y + 9);
        ctx.lineTo(cx + 9, y);
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();

      // the fork connector
      const fy = NODES[L_.node].mid;
      ctx.save();
      ctx.globalAlpha = lane ? 1 : 0.2;
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(MAIN.x + MAIN.w, fy);
        ctx.lineTo(cx - 26, fy);
        ctx.quadraticCurveTo(cx, fy, cx, fy + 26);
        ctx.lineTo(cx, top - 6);
      };
      path();
      ctx.strokeStyle = C.bg;
      ctx.lineWidth = 9;
      ctx.stroke();
      path();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      arrowHead(ctx, cx, top - 2, Math.PI / 2, C.accent);
      ctx.restore();

      // the wake-up: the condition flips and the routine moves on
      if (s?.mode === "await") continue;
      const wy = NODES[L_.wake].mid;
      const lit =
        L_.cond ||
        (lane &&
          (L_.node === 0 ? s.arrived1 : s.arrived2) != null &&
          s.u - (L_.node === 0 ? s.arrived1 : s.arrived2) < 0.25);
      ctx.save();
      ctx.globalAlpha = lane ? 1 : 0.2;
      ctx.strokeStyle = C.bg;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(R.x, wy);
      ctx.lineTo(MAIN.x + MAIN.w + 4, wy);
      ctx.stroke();
      ctx.strokeStyle = lit ? C.ok : alpha(C.accent, 0.7);
      ctx.lineWidth = lit ? 3 : 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(R.x, wy);
      ctx.lineTo(MAIN.x + MAIN.w + 10, wy);
      ctx.stroke();
      ctx.setLineDash([]);
      arrowHead(ctx, MAIN.x + MAIN.w + 4, wy, Math.PI, lit ? C.ok : C.accent);
      ctx.beginPath();
      ctx.arc(R.x, wy, lit ? 8 : 5, 0, TAU);
      ctx.fillStyle = lit ? C.ok : C.bg3;
      ctx.fill();
      ctx.restore();
    }

    // the join: ending the routine cancels every fork at once
    const ended = s?.ended != null;
    ctx.save();
    ctx.globalAlpha = ended ? 1 : 0.3;
    ctx.strokeStyle = ended ? C.accent : C.tx3;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(MAIN.x + MAIN.w / 2, BOTTOM);
    ctx.lineTo(MAIN.x + MAIN.w / 2, JOIN_Y);
    ctx.lineTo(FLY_LANE.x + FLY_LANE.w / 2, JOIN_Y);
    for (const R of [ARM_LANE, FLY_LANE]) {
      ctx.moveTo(R.x + R.w / 2, JOIN_Y);
      ctx.lineTo(R.x + R.w / 2, BOTTOM + 8);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    for (const R of [ARM_LANE, FLY_LANE])
      arrowHead(
        ctx,
        R.x + R.w / 2,
        BOTTOM + 4,
        -Math.PI / 2,
        ended ? C.accent : C.tx3
      );
    let msg = "routine ends → every fork is canceled";
    if (ended && s.reason === "timeout")
      msg = "gave up → return → every fork canceled";
    if (ended && s.reason === "auto")
      msg = "auto over → end() cancels the routine";
    if (ended && s.reason === "done")
      msg = "body ran out → every fork canceled";
    text(ctx, msg, MAIN.x, JOIN_Y + 34, {
      font: MONO,
      size: 19,
      weight: 600,
      color: ended ? (s.reason === "done" ? C.accent : C.err) : C.tx3,
    });
    ctx.restore();
  }

  function arrowHead(ctx, x, y, ang, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawDS(ctx, V, focus) {
    const s = V.s;
    panel(ctx, DS, C.bg2);
    micro(ctx, "driver station · autonomous", DS.x + 22, DS.y + 34, {
      size: 17,
    });
    rrect(ctx, DS.x + 22, DS.y + 52, 276, 50, 4);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = focus > 0 ? alpha(C.accent, 0.4 + 0.6 * focus) : C.rule;
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
    const left = s ? Math.max(0, AUTO - s.u) : AUTO;
    const over = s && s.u >= AUTO - 1e-6;
    const on = s && !over;
    text(ctx, `${left.toFixed(1)} s`, DS.x + DS.w - 22, DS.y + 92, {
      font: MONO,
      size: 40,
      weight: 600,
      align: "right",
      color: over ? C.err : on ? C.accent : C.tx2,
    });
    // the 15 s bar
    ctx.fillStyle = alpha(C.tx3, 0.25);
    ctx.fillRect(DS.x + 22, DS.y + 118, DS.w - 44, 6);
    ctx.fillStyle = over ? C.err : C.accent;
    ctx.fillRect(DS.x + 22, DS.y + 118, (DS.w - 44) * (left / AUTO), 6);
    text(
      ctx,
      over ? "auto over · disabled" : on ? "enabled" : "disabled",
      DS.x + 22,
      DS.y + 146,
      {
        font: MONO,
        size: 17,
        weight: 600,
        color: over ? C.err : on ? C.accent : C.tx3,
      }
    );
    if (focus > 0)
      text(ctx, '@Autonomous(name = "Raise And Shoot")', DS.x + 4, DS.y - 14, {
        font: MONO,
        size: 18,
        color: C.accent,
        a: focus,
      });
  }

  function drawPad(ctx, focus) {
    ctx.save();
    ctx.translate(PAD.x, PAD.y);
    ctx.scale(PAD.s, PAD.s);
    ctx.beginPath();
    ctx.rect(-20, 0, 500, 300);
    ctx.clip();
    ctx.globalAlpha = 0.75;
    drawController(ctx, { x: 0, y: 0 }, { label: false });
    ctx.restore();
    text(ctx, "nobody holding it", PAD.x + 128, PAD.y + 190, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "center",
      color: focus > 0 ? C.accent : C.tx3,
    });
  }

  function drawBench(ctx, V, t) {
    const s = V.s;
    const rot = s ? s.rot : REST;
    drawStand(ctx, PIVOT, FLOOR);
    drawTargetMark(ctx, PIVOT, ARM_LEN, TARGET, "0.25 rot", 1);
    if (s?.jam != null) {
      // the jam: something in the arm's way
      const ang = (s.jam + 0.035) * TAU;
      const r = ARM_LEN * 0.72;
      ctx.save();
      ctx.translate(PIVOT.x + Math.cos(ang) * r, PIVOT.y - Math.sin(ang) * r);
      ctx.rotate(-ang);
      rrect(ctx, -34, -14, 68, 28, 3);
      ctx.fillStyle = alpha(C.err, 0.25);
      ctx.fill();
      ctx.strokeStyle = C.err;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
      text(
        ctx,
        "jammed",
        PIVOT.x + Math.cos(ang) * r - 10,
        PIVOT.y - Math.sin(ang) * r - 30,
        { font: MONO, size: 19, weight: 600, align: "center", color: C.err }
      );
    }
    if (s?.req != null && Math.abs(s.sp - s.rot) > 0.006)
      drawArmBody(ctx, PIVOT, ARM_LEN, s.sp, { ghost: true });
    drawArmBody(ctx, PIVOT, ARM_LEN, rot, { driven: s?.req != null });
    micro(ctx, "arm", PIVOT.x - 150, FLOOR - 16, { size: 17 });
    drawFlywheel(ctx, WHEEL, WHEEL_R, s ? s.fang : 0, {
      rps: s ? s.fv : 0,
      driven: s?.freq === "runFast",
    });
    micro(ctx, "flywheel", WHEEL.x + 100, FLOOR - 16, { size: 17 });

    const reqA = s?.req != null;
    drawMotorCard(ctx, ARM_CARD, {
      title: "TalonFX · arm",
      led: reqA ? C.accent : C.tx3,
      rows: [
        [
          "request on the motor",
          reqA ? "MotionMagicVoltage" : "none",
          reqA ? C.accent : C.tx3,
          22,
        ],
        ["position · target 0.25", `${rot.toFixed(3)} rot`, C.tx2, 22],
      ],
    });
    const fq = s?.freq;
    drawMotorCard(ctx, FLY_CARD, {
      title: "TalonFX · flywheel",
      led: fq === "runFast" ? C.accent : C.tx3,
      lit:
        fq === "stop" && s.stopAt != null
          ? window_(s.u - s.stopAt, 0, 1.2, 0.2)
          : 0,
      rows: [
        [
          "request on the motor",
          fq === "runFast"
            ? "MotionMagicVelocityVoltage"
            : fq === "stop"
              ? "stopMotor() · coast"
              : "none",
          fq === "runFast" ? C.accent : fq === "stop" ? C.tx : C.tx3,
          20,
        ],
        ["velocity · target 75", `${(s ? s.fv : 0).toFixed(1)} rps`, C.tx2, 22],
      ],
    });
  }

  // a small card over the lanes: what would have happened instead
  function callout(ctx, R, a, kicker, l1, l2) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    rrect(ctx, R.x, R.y, R.w, R.h, 5);
    ctx.fillStyle = alpha(C.bg2, 0.97);
    ctx.fill();
    ctx.strokeStyle = C.err;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(ctx, kicker, R.x + 22, R.y + 36, { color: C.err, size: 17 });
    text(ctx, l1, R.x + 22, R.y + 74, { font: MONO, size: 20, color: C.tx });
    text(ctx, l2, R.x + 22, R.y + 108, {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.err,
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
    micro(ctx, "Workshop 4 · Coroutines", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Fork and Wait", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 120,
      weight: 500,
      align: "center",
      a: k,
    });
    ctx.restore();
  }

  // a list runs one thing at a time; the routine needs the arm held across all of it
  function whyCard(ctx, t) {
    const t0 = L("why").t0 - 0.3;
    const a = window_(t, t0, L("fork").t0 - 0.25, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.96);
    ctx.fillRect(0, 0, W, H);
    const now = clamp((t - t0) * 1.5, 0, 6);
    const view = { t0: 0, span: 6 };
    drawTimeline(
      ctx,
      { x: 260, y: 120, w: 1400, h: 250 },
      {
        lanes: ["Arm", "Flywheel"],
        view,
        now,
        title: "a list · each step waits for the one before",
        bars: [
          {
            lane: 0,
            start: 0,
            end: null,
            open: true,
            label: "vertical() · never finishes",
          },
          {
            lane: 1,
            start: 0,
            end: null,
            dashed: true,
            label: "runFast() · waiting its turn",
          },
        ],
      }
    );
    const stuck = ramp(t, Wd("why", "can't") - 0.1, 0.4);
    text(ctx, "stuck behind a hold", 1640, 112, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "right",
      color: C.err,
      a: stuck,
    });
    const k2 = easeOut(ramp(t, Wd("why", "while") - 0.2, 0.5));
    ctx.globalAlpha = a * k2;
    drawTimeline(
      ctx,
      { x: 260, y: 470, w: 1400, h: 250 },
      {
        lanes: ["Arm", "Flywheel"],
        view,
        now: clamp((t - Wd("why", "while") + 0.2) * 1.5, 0, 6),
        title: "what the routine needs · the arm holds through every step",
        bars: [
          {
            lane: 0,
            start: 0,
            end: null,
            open: true,
            label: "vertical() · holding",
          },
          { lane: 1, start: 1.5, end: null, open: true, label: "runFast()" },
        ],
      }
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
    text(ctx, "Fork the holds, await the steps.", W / 2, 400, {
      font: SERIF,
      size: 80,
      align: "center",
    });
    text(ctx, "Put a limit on every wait.", W / 2, 510, {
      font: SERIF,
      size: 80,
      align: "center",
      a: easeOut(ramp(t, Wd("close", "put") - 0.1, 0.5)),
    });
    text(ctx, "Stop what you started before you leave.", W / 2, 620, {
      font: SERIF,
      size: 80,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "stop") - 0.1, 0.5)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const V = live ? liveView(live) : viewAt(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawHeader(ctx, V);
    drawLanes(ctx, V, t);
    drawNodes(ctx, V, t);
    const focus = live
      ? 0
      : window_(t, L("callback").t0 - 0.2, L("callback").t1 + 0.5, 0.4);
    drawDS(ctx, V, focus);
    drawPad(ctx, focus);
    drawBench(ctx, V, t);
    if (!live) {
      callout(
        ctx,
        { x: 690, y: 190, w: 420, h: 128 },
        window_(t, Wd("timeout", "without") - 0.2, L("timeout").t1 + 0.4, 0.35),
        "without the if",
        "flywheel spins up anyway",
        "shoots at 0.07 rot"
      );
      callout(
        ctx,
        { x: 690, y: 470, w: 420, h: 128 },
        window_(t, Wd("stop", "canceling") - 0.2, L("close").t0 + 0.2, 0.35),
        "without the last fork",
        "canceled runFast() sent nothing",
        "still spinning at 75 rps"
      );
    }
    ctx.restore();
    vignette(ctx);
    if (live) return;
    whyCard(ctx, t);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveView(state) {
    if (!state.fill) return { fill: "blank", s: null, rate: 1 };
    const run = state.fill === "fork" ? FORK : AWAIT;
    return {
      fill: state.fill,
      s: sampleAt(run, state.u),
      rate: state.fill === "await" ? 2.5 : 1,
    };
  }

  function liveGate() {
    const state = { time: gate.t0, fill: null, u: 0 };
    return {
      state,
      prompt() {
        if (!state.fill) return "Fill the blank: fork or await?";
        const s = liveView(state).s;
        if (state.fill === "await")
          return s.ended != null
            ? "Auto's over. It never got past line 1."
            : "await: stuck on line 1 while the clock runs.";
        if (s.ended != null)
          return "Done. Ending the routine canceled every fork.";
        if (s.pc >= 2)
          return "The arm keeps holding while the routine carries on.";
        return "fork: it moved straight on to the wait.";
      },
      input(k, down) {
        if (!down || state.fill) return;
        if (k === "fork" || k === "await") state.fill = k;
      },
      step(dt) {
        state.time += dt;
        if (!state.fill) return false;
        state.u += dt * (state.fill === "await" ? 2.5 : 1);
        if (state.fill === "await") return state.u >= AUTO + 1.5 * 2.5;
        const s = sampleAt(FORK, state.u);
        return s.ended != null && state.u - s.ended > 2.0;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    if (t < PICK) return "Fill the blank: fork or await?";
    if (t < PICK + 6) return "await: stuck on line 1 while the clock runs.";
    return "Auto's over. It never got past line 1.";
  }

  const gateControls = [
    { k: "fork", label: "fork", key: "KeyF", kind: "press" },
    { k: "await", label: "await", key: "KeyA", kind: "press" },
  ];

  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
