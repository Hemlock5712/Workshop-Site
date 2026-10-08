// Fifteen Seconds, No Driver. One autonomous routine: drive forward, wait, send a stop.
//
// What is simulated, and how:
//   the routine   LeaveStartAuto on swerve-autonomous, run on 20 ms loops: setControl(forward),
//                 coroutine.wait(1.5 s), setControl(stopped). Disabling runs end(), which
//                 cancels the routine; the coroutine stops where it is, the last line never
//                 runs, and whenCanceled sends the same stopped request.
//   the drive     a first-order velocity model on the request the drivetrain holds: forward
//                 pulls it to 1 m/s, stopped pulls it to 0, disabled cuts output. A request
//                 stays applied until another one replaces it (there is no default command).
//   the pose      robot-centric: X is the front bumper, so the heading on the tape aims it.
// The robot clock is not the narration's: each run is simulated once in robot time and
// mapped onto the narration with a few keyframes.

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
  drawField,
  drawPoseReadout,
  drawSwerveRobot,
  panel,
  runBar,
  swerveModules,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const DS = { x: 60, y: 56, w: 500, h: 176 };
const REQ = { x: 590, y: 56, w: 430, h: 176 };
const FIELD = { x: 60, y: 256, w: 960, h: 560 };
const VIEW = { x0: 0.8, y0: 2.0, x1: 7.2, y1: 6.0 };
const CODE = { x: 1050, y: 56, w: 830, h: 790 };
const CODE_SIZE = 20;
const LH = 25;
const TAPE = { x: 2.0, y: 4.0 };

// The page's LeaveStartAuto, reflowed to fit. kind: n1/n2/n3 are the coroutine's three
// lines, wc is whenCanceled; tag marks the lifecycle and behavior lines.
const SRC = [
  { s: '@Autonomous(name = "Leave Start")', tag: "life" },
  { s: "public class LeaveStartAuto extends PeriodicOpMode {" },
  { s: "  private final Command routine;" },
  { s: "", gap: 6 },
  { s: "  public LeaveStartAuto(Robot robot) {" },
  { s: "    final var forward =", req: "forward" },
  {
    s: "        new SwerveRequest.RobotCentric().withVelocityX(1.0);",
    req: "forward",
  },
  {
    s: "    final var stopped = new SwerveRequest.RobotCentric();",
    req: "stopped",
  },
  { s: "", gap: 6 },
  { s: "    routine = robot.drivetrain", tag: "beh" },
  { s: "        .run(coroutine -> {" },
  { s: "          robot.drivetrain.setControl(forward);", kind: "n1" },
  { s: "          coroutine.wait(Seconds.of(1.5));", kind: "n2" },
  { s: "          robot.drivetrain.setControl(stopped);", kind: "n3" },
  { s: "        })" },
  {
    s: "        .whenCanceled(() -> robot.drivetrain.setControl(stopped))",
    kind: "wc",
  },
  { s: '        .named("Leave Start");' },
  { s: "  }" },
  { s: "", gap: 6 },
  { s: "  @Override" },
  { s: "  public void start() {", tag: "life" },
  { s: "    Scheduler.getDefault().schedule(routine);" },
  { s: "  }" },
  { s: "  @Override" },
  { s: "  public void end() {", tag: "life" },
  { s: "    Scheduler.getDefault().cancel(routine);" },
  { s: "  }" },
  { s: "}" },
];
const ROWS = (() => {
  let y = CODE.y + 84;
  return SRC.map((r) => {
    const h = r.gap ?? (r.kind === "n2" ? LH + 34 : r.kind ? LH + 12 : LH);
    const row = { ...r, y, h, base: y + (r.kind ? 6 : 0) + LH - 7 };
    y += h;
    return row;
  });
})();
const row = (kind) => ROWS.find((r) => r.kind === kind);

// ---- the model ----------------------------------------------------------------------

const SR = 120; // samples per robot second
const LOOP = 0.02;
const WAIT = 1.5;
const TAU_V = 0.16; // how quickly the modules reach a requested speed
const TAU_CUT = 0.12; // disabled: no output, the robot scrubs to a stop

// One enable of Leave Start. disableAt: robot time of the disable, or null.
function simulate({
  heading = 0,
  disableAt = null,
  noStop = false,
  dur = 6,
  x0 = TAPE.x,
  y0 = TAPE.y,
  endScale = 1,
} = {}) {
  const r = {
    pc: -1,
    req: "none",
    waitStart: 0,
    ended: null,
    how: null,
    enabled: true,
    v: 0,
    x: x0,
    y: y0,
    n3At: null,
  };
  const out = [];
  let next = 0;
  const dt = 1 / SR;
  for (let i = 0; i <= Math.ceil(dur * SR); i++) {
    const u = i / SR;
    while (next <= u + 1e-9) {
      // the robot loop: the scheduler runs the routine, then the mode boundary
      if (r.enabled && disableAt != null && next >= disableAt - 1e-9) {
        r.enabled = false;
        if (r.ended == null) {
          // end() cancels the routine; whenCanceled sends the zero
          r.ended = next;
          r.how = "canceled";
          r.req = "stopped";
        }
      }
      if (r.enabled && r.ended == null) {
        if (r.pc === -1) {
          r.req = "forward";
          r.pc = 1;
          r.waitStart = next;
        } else if (r.pc === 1 && next - r.waitStart >= WAIT - 1e-9) {
          r.pc = 2;
          r.n3At = next;
          if (!noStop) r.req = "stopped";
          r.ended = next;
          r.how = "done";
        }
      }
      next += LOOP;
    }
    out.push({
      u,
      pc: r.pc,
      req: r.req,
      waitStart: r.waitStart,
      ended: r.ended,
      how: r.how,
      enabled: r.enabled,
      v: r.v,
      x: r.x,
      y: r.y,
      theta: heading,
      n3At: r.n3At,
      noStop,
    });
    // the drive
    if (!r.enabled) r.v -= (r.v / TAU_CUT) * dt;
    else if (r.req === "forward") r.v += ((1.0 * endScale - r.v) / TAU_V) * dt;
    else if (r.req === "stopped") r.v -= (r.v / TAU_V) * dt;
    r.x += r.v * Math.cos(heading) * dt;
    r.y += r.v * Math.sin(heading) * dt;
  }
  return out;
}
const sampleAt = (run, u) => run[clamp(Math.floor(u * SR), 0, run.length - 1)];

// narration time -> robot time, piecewise linear, constant rate after the last key
function mapKeys(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ta, ua] = keys[i - 1];
    const [tb, ub] = keys[i];
    if (t <= tb) return ua + ((ub - ua) * (t - ta)) / (tb - ta);
  }
  const [ta, ua] = keys.at(-1);
  return ua + (t - ta);
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const RUN = simulate({ dur: 5 });
  const NOSTOP = simulate({ noStop: true, dur: 9 });
  const SIDE = simulate({ heading: Math.PI / 2, dur: 5 });
  // the three measured runs: battery and carpet move each one a little
  const THREE = [
    simulate({ dur: 4, endScale: 1.0, y0: TAPE.y + 0.012 }),
    simulate({ dur: 4, endScale: 0.965, y0: TAPE.y - 0.018 }),
    simulate({ dur: 4, endScale: 1.03, y0: TAPE.y + 0.004 }),
  ];
  const ends = THREE.map((r) => r.at(-1));
  const runEnd = RUN.at(-1);

  const tRun = Wd("run", "enable") + 0.25;
  const tNo = Wd("nostop", "delete") + 0.7;
  const tDis = L("disable").t0 - 0.2;
  const disAt = clamp(Wd("disable", "halfway") + 0.15 - tDis, 0.35, 1.25);
  const DIS = simulate({ disableAt: disAt, dur: 5 });
  const tGate = gate.t0 + 1.0;
  const GATE_DIS = 0.9;
  const GDIS = simulate({ disableAt: GATE_DIS, dur: 5 });
  const tSide = Wd("heading", "same") - 0.1;
  const tFloor = Wd("test", "floor");
  const tThree = Wd("test", "three");

  const segs = [
    {
      t0: tRun - 0.01,
      t1: L("nostop").t0 - 0.25,
      run: RUN,
      keys: [
        [tRun, 0],
        [Math.max(tRun + 1.6, Wd("run", "stops")), 1.54],
      ],
    },
    {
      t0: tNo - 0.01,
      t1: L("disable").t0 - 0.25,
      run: NOSTOP,
      keys: [[tNo, 0]],
      noStop: true,
    },
    { t0: tDis - 0.01, t1: L("tryit").t0 - 0.25, run: DIS, keys: [[tDis, 0]] },
    { t0: tGate - 0.01, t1: gate.t1, run: GDIS, keys: [[tGate, 0]] },
    {
      t0: tSide - 0.01,
      t1: L("test").t0 - 0.25,
      run: SIDE,
      keys: [[tSide, 0]],
      ghostEnd: runEnd,
    },
    {
      t0: tFloor - 0.01,
      t1: tThree,
      run: RUN,
      keys: [
        [tFloor, 0],
        [tThree - 0.2, 3],
      ],
    },
  ];

  // what is on screen at narration time t (not live)
  function viewAt(t) {
    const seg = segs.find((g) => t >= g.t0 && t < g.t1);
    if (seg) {
      const u = mapKeys(seg.keys, t);
      return {
        s: sampleAt(seg.run, u),
        noStop: !!seg.noStop,
        ghostEnd: seg.ghostEnd,
      };
    }
    // rotating on the tape before the side run
    let theta = 0;
    if (t >= L("heading").t0 - 0.25 && t < L("test").t0 - 0.25)
      theta =
        (Math.PI / 2) * easeInOut(ramp(t, Wd("heading", "rotate") - 0.1, 1.0));
    return {
      s: null,
      theta,
      noStop: t >= tNo - 1 && t < L("disable").t0 - 0.25,
    };
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 500, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("intro").t0 - 0.4, x: 560, y: 420, z: 1.3, d: 0.01 },
    { t: L("layers").t0 - 0.2, x: 1465, y: 520, z: 1.12, d: 1.2 },
    { t: L("build").t0 - 0.2, x: 1400, y: 430, z: 1.55, d: 1.0 },
    { t: L("run").t0 - 0.2, ...FULL, d: 1.0 },
    { t: L("heading").t0 - 0.2, x: 620, y: 500, z: 1.15, d: 1.0 },
    { t: L("test").t0 - 0.2, ...FULL, d: 1.0 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawDS(ctx, s, t, live) {
    panel(ctx, DS, C.bg2);
    micro(ctx, "driver station · autonomous", DS.x + 22, DS.y + 34, {
      size: 17,
    });
    // the mode list
    const pick = live ? 1 : ramp(t, Wd("intro", "one") - 0.2, 0.3);
    rrect(ctx, DS.x + 22, DS.y + 52, 270, 50, 4);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle =
      !live && window_(t, Wd("run", "pick") - 0.2, Wd("run", "enable"), 0.2) > 0
        ? C.accent
        : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(
      ctx,
      pick < 0.5 ? "Raise And Shoot" : "Leave Start",
      DS.x + 38,
      DS.y + 86,
      { size: 25, weight: 600 }
    );
    ctx.fillStyle = C.tx3;
    ctx.beginPath();
    ctx.moveTo(DS.x + 264, DS.y + 72);
    ctx.lineTo(DS.x + 278, DS.y + 72);
    ctx.lineTo(DS.x + 271, DS.y + 81);
    ctx.fill();
    // enable / disable
    const en = s ? s.enabled : false;
    const disabledByUser = s && !s.enabled;
    const btn = (x, label, on, color) => {
      rrect(ctx, x, DS.y + 52, 88, 50, 4);
      ctx.fillStyle = on ? color : C.bg3;
      ctx.fill();
      ctx.strokeStyle = on ? color : C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, label, x + 44, DS.y + 83, {
        size: 19,
        weight: 600,
        align: "center",
        color: on ? C.accentInk : C.tx2,
      });
    };
    btn(DS.x + 306, "Enable", en, C.accent);
    btn(DS.x + 400, "Disable", disabledByUser, C.err);
    const status = !s
      ? "disabled"
      : en
        ? `enabled · ${s.u.toFixed(2)} s`
        : "disabled · output cut";
    text(ctx, status, DS.x + 22, DS.y + 150, {
      font: MONO,
      size: 19,
      weight: 600,
      color: !s ? C.tx3 : en ? C.accent : C.err,
    });
  }

  // the two requests the class builds, and the one the drivetrain holds right now
  function drawRequests(ctx, s, t, live) {
    panel(ctx, REQ, C.bg2);
    micro(ctx, "drivetrain request", REQ.x + 22, REQ.y + 34, { size: 17 });
    const show = live ? 1 : ramp(t, Wd("build", "forward") - 0.3, 0.4);
    const req = s?.req ?? "none";
    const chip = (x, name, val, on, k) => {
      ctx.save();
      ctx.globalAlpha *= k;
      rrect(ctx, x, REQ.y + 54, 186, 76, 4);
      ctx.fillStyle = on ? alpha(C.accent, 0.18) : C.bg3;
      ctx.fill();
      ctx.strokeStyle = on ? C.accent : C.rule;
      ctx.lineWidth = on ? 2.5 : 1.5;
      ctx.stroke();
      text(ctx, name, x + 16, REQ.y + 84, {
        font: MONO,
        size: 20,
        weight: 600,
        color: on ? C.accent : C.tx2,
      });
      text(ctx, val, x + 16, REQ.y + 114, {
        font: MONO,
        size: 18,
        color: on ? C.tx : C.tx3,
      });
      ctx.restore();
    };
    chip(REQ.x + 22, "forward", "vx 1.0 m/s", req === "forward", show);
    chip(
      REQ.x + 222,
      "stopped",
      "every speed 0",
      req === "stopped",
      live ? 1 : ramp(t, Wd("build", "stop") - 0.3, 0.4)
    );
    const note =
      req === "none"
        ? "none yet"
        : s.noStop && s.ended != null && req === "forward"
          ? "latched · nothing replaced it"
          : s.enabled
            ? "latched"
            : "latched · output cut";
    text(ctx, note, REQ.x + 22, REQ.y + 158, {
      font: MONO,
      size: 17,
      weight: 600,
      color: note.includes("nothing") ? C.err : C.tx3,
    });
  }

  function drawTape(ctx, F, x, y, theta, a = 1) {
    // tape corners around the robot's footprint on the carpet
    const half = 0.42 + 0.05;
    ctx.save();
    ctx.globalAlpha *= a;
    const [cx, cy] = F.P(x, y);
    ctx.translate(cx, cy);
    ctx.rotate(-theta);
    ctx.strokeStyle = C.tx2;
    ctx.lineWidth = 5;
    const h = half * F.s;
    const l = 0.22 * F.s;
    for (const [sx, sy] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(sx * h - sx * l, sy * h);
      ctx.lineTo(sx * h, sy * h);
      ctx.lineTo(sx * h, sy * h - sy * l);
      ctx.stroke();
    }
    ctx.restore();
    text(ctx, "tape mark", cx, cy + 0.6 * F.s, {
      font: MONO,
      size: 17,
      align: "center",
      color: C.tx3,
      a,
    });
  }

  function drawFieldView(ctx, V, t, live) {
    const F = drawField(ctx, FIELD, { view: VIEW, axes: false, labels: false });
    const s = V.s;
    const theta = s ? s.theta : (V.theta ?? 0);
    // a ghost of where the first run ended, while the heading beat runs
    if (V.ghostEnd) {
      drawSwerveRobot(
        ctx,
        F,
        { x: V.ghostEnd.x, y: V.ghostEnd.y, theta: 0 },
        { ghost: true, label: "facing down the field", color: C.tx3 }
      );
    }
    drawTape(ctx, F, TAPE.x, TAPE.y, theta);
    const pose = s
      ? { x: s.x, y: s.y, theta }
      : { x: TAPE.x, y: TAPE.y, theta };
    // the trail
    if (s && Math.hypot(s.x - TAPE.x, s.y - TAPE.y) > 0.02) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
      ctx.clip();
      ctx.strokeStyle = alpha(C.accent, 0.55);
      ctx.lineWidth = 4;
      ctx.setLineDash([2, 10]);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(...F.P(TAPE.x, TAPE.y));
      ctx.lineTo(...F.P(s.x, s.y));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    // test: on blocks, the wheels drive and the robot goes nowhere
    const blocks =
      !live && t >= Wd("test", "blocks") - 0.2 && t < tFloor - 0.05;
    let modules = swerveModules(s ? s.v : 0, 0, 0);
    if (blocks) {
      const u = clamp(t - Wd("test", "blocks"), 0, 4);
      modules = swerveModules(sampleAt(RUN, u).v, 0, 0);
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    if (blocks) {
      const [cx, cy] = F.P(TAPE.x, TAPE.y);
      ctx.save();
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth = 2;
      for (const [dx, dy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const bx = cx + dx * 0.34 * F.s - 16;
        const by = cy + dy * 0.34 * F.s - 16;
        ctx.strokeRect(bx, by, 32, 32);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 32, by + 32);
        ctx.stroke();
      }
      ctx.restore();
    }
    drawSwerveRobot(ctx, F, pose, { modules, maxSpeed: 1.6 });
    ctx.restore();
    if (blocks)
      text(
        ctx,
        "on blocks · wheels turn, robot stays put",
        FIELD.x + FIELD.w / 2,
        FIELD.y + 44,
        { font: MONO, size: 21, weight: 600, align: "center", color: C.accent }
      );

    // never stops: no default command takes over
    if (s?.noStop && s.ended != null) {
      const k = clamp((s.u - s.ended) / 0.4);
      text(
        ctx,
        "routine ended · no default command · still 1.0 m/s",
        FIELD.x + FIELD.w / 2,
        FIELD.y + 44,
        {
          font: MONO,
          size: 21,
          weight: 600,
          align: "center",
          color: C.err,
          a: k,
        }
      );
    }
    if (s?.how === "canceled") {
      const k = clamp((s.u - s.ended) / 0.3);
      text(
        ctx,
        "disabled mid-wait · whenCanceled sent stopped",
        FIELD.x + FIELD.w / 2,
        FIELD.y + 44,
        {
          font: MONO,
          size: 21,
          weight: 600,
          align: "center",
          color: C.err,
          a: k,
        }
      );
    }
    if (V.ghostEnd && s) {
      const k = clamp(s.u / 0.6);
      text(
        ctx,
        "robot-centric X · the front bumper aims it",
        FIELD.x + FIELD.w / 2,
        FIELD.y + FIELD.h - 30,
        {
          font: MONO,
          size: 21,
          weight: 600,
          align: "center",
          color: C.accent,
          a: k,
        }
      );
    }
    // three measured runs
    if (!live && t >= tThree - 0.2 && t < L("close").t0 + 0.4)
      drawThree(ctx, F, t);

    drawPoseReadout(ctx, FIELD.x, FIELD.y + FIELD.h + 40, pose, {
      title: "Drivetrain/Pose",
    });
    if (s)
      text(
        ctx,
        `${s.v.toFixed(2)} m/s`,
        FIELD.x + FIELD.w,
        FIELD.y + FIELD.h + 72,
        {
          font: MONO,
          size: 22,
          weight: 600,
          align: "right",
          color: s.v > 0.05 ? C.accent : C.tx3,
        }
      );
    return F;
  }

  // three end poses, and a magnified look at how close they landed
  function drawThree(ctx, F, t) {
    const k = easeOut(ramp(t, tThree - 0.2, 0.5));
    ends.forEach((e, i) => {
      const a = clamp((t - tThree - i * 0.45) / 0.3);
      if (a <= 0) return;
      drawSwerveRobot(
        ctx,
        F,
        { x: e.x, y: e.y, theta: 0 },
        { ghost: true, color: alpha(C.tx2, 0.35 + 0.3 * a) }
      );
      const [x, y] = F.P(e.x, e.y);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = alpha(C.accent, a);
      ctx.fill();
    });
    // the inset
    const R = { x: 620, y: 300, w: 380, h: 330 };
    const mid = { x: 1.3, y: TAPE.y };
    const sc = 1500; // px per meter
    ctx.save();
    ctx.globalAlpha *= k;
    panel(ctx, R, C.bg2);
    micro(ctx, "end poses · zoomed in", R.x + 20, R.y + 32, { size: 16 });
    const cx = R.x + R.w / 2;
    const cy = R.y + R.h / 2 + 14;
    const avg = ends.reduce(
      (a, e) => ({ x: a.x + e.x / 3, y: a.y + e.y / 3 }),
      { x: 0, y: 0 }
    );
    // the 10 cm ring
    const ring = ramp(t, Wd("test", "ten") - 0.3, 0.5);
    ctx.beginPath();
    ctx.arc(cx, cy, 0.1 * sc, 0, Math.PI * 2);
    ctx.strokeStyle = alpha(C.accent, 0.3 + 0.7 * ring);
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "10 cm", cx + 0.1 * sc * 0.72 + 8, cy - 0.1 * sc * 0.72 - 6, {
      font: MONO,
      size: 18,
      weight: 600,
      color: C.accent,
      a: 0.4 + 0.6 * ring,
    });
    ends.forEach((e, i) => {
      const a = clamp((t - tThree - i * 0.45) / 0.3);
      if (a <= 0) return;
      const px = cx + (e.x - avg.x) * sc;
      const py = cy - (e.y - avg.y) * sc;
      ctx.strokeStyle = alpha(C.accent, a);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 12, py);
      ctx.lineTo(px + 12, py);
      ctx.moveTo(px, py - 12);
      ctx.lineTo(px, py + 12);
      ctx.stroke();
      text(
        ctx,
        `run ${i + 1} · x ${e.x.toFixed(2)}`,
        R.x + 20,
        R.y + R.h - 76 + i * 26,
        { font: MONO, size: 17, color: C.tx2, a }
      );
    });
    ctx.restore();
    void mid;
  }

  // ---- the code, with the coroutine's playhead -----------------------------------

  function drawCode(ctx, V, t, live) {
    const s = V.s;
    panel(ctx, CODE);
    micro(ctx, "opmodes/LeaveStartAuto.java", CODE.x + 24, CODE.y + 40);
    if (s)
      text(
        ctx,
        `robot clock ${s.u.toFixed(2)} s`,
        CODE.x + CODE.w - 24,
        CODE.y + 40,
        { font: MONO, size: 18, weight: 600, align: "right", color: C.tx2 }
      );
    // which lines the narration is pointing at
    const lifeK = live
      ? 0
      : window_(t, Wd("layers", "thin") - 0.2, L("layers").t1 + 0.4, 0.3);
    const behK = live
      ? 0
      : window_(t, Wd("layers", "everything") - 0.2, L("build").t0 + 0.2, 0.3);
    const startK = live
      ? 0
      : window_(
          t,
          Wd("layers", "starts") - 0.15,
          Wd("layers", "ends") - 0.05,
          0.2
        );
    const endK = live
      ? 0
      : window_(
          t,
          Wd("layers", "ends") - 0.15,
          Wd("layers", "everything") - 0.1,
          0.2
        );
    const typed = {
      n1: live ? 1 : ramp(t, Wd("build", "drive") - 0.2, 0.6),
      n2: live ? 1 : ramp(t, Wd("build", "wait") - 0.2, 0.5),
      n3: live ? 1 : ramp(t, Wd("build", "stop") - 0.2, 0.6),
    };
    const wcShow = live ? 1 : t >= L("disable").t0 - 0.3 ? 1 : 0.35;
    const struck =
      V.noStop && (live ? false : t >= Wd("nostop", "delete") - 0.1);
    const focusDim =
      lifeK > 0 || behK > 0 ? 1 - 0.65 * Math.max(lifeK, behK) : 1;
    let inBody = false;
    for (const r of ROWS) {
      if (!r.s) continue;
      if (r.tag === "beh") inBody = true;
      if (r.s.startsWith("        .named(")) inBody = false;
      const isLife = r.tag === "life" || r.s.includes("Scheduler.getDefault()");
      const isBody =
        inBody || r.tag === "beh" || r.s.startsWith("        .named(");
      let a = 1;
      if (lifeK > 0 && behK === 0) a = isLife ? 1 : focusDim;
      if (behK > 0) a = isBody ? 1 : focusDim;
      if (r.s.includes("schedule(routine)") || r.s.includes("start()"))
        a = Math.max(a, startK);
      if (r.s.includes("cancel(routine)") || r.s.includes("end()"))
        a = Math.max(a, endK);
      if (r.kind === "wc") a *= wcShow;
      if (r.kind)
        drawNode(
          ctx,
          r,
          V,
          t,
          typed[r.kind] ?? 1,
          a,
          struck && r.kind === "n3",
          live
        );
      else codeLine(ctx, r.s, CODE.x + 24, r.base, { size: CODE_SIZE, a });
      // highlights on the request lines while the build names them
      if (r.req && !live) {
        const k =
          r.req === "forward"
            ? window_(
                t,
                Wd("build", "forward") - 0.2,
                Wd("build", "wait") - 0.1,
                0.25
              )
            : window_(t, Wd("build", "stop") - 0.2, L("build").t1 + 0.6, 0.25);
        if (k > 0) {
          ctx.fillStyle = alpha(C.accent, 0.14 * k);
          ctx.fillRect(CODE.x + 10, r.y + 1, CODE.w - 20, LH);
          ctx.fillStyle = alpha(C.accent, k);
          ctx.fillRect(CODE.x + 10, r.y + 1, 4, LH);
        }
      }
      // lifecycle / behavior tags
      if (r.tag && (lifeK > 0 || behK > 0)) {
        const on = r.tag === "life" ? lifeK : behK;
        if (on > 0) {
          const label =
            r.tag === "life"
              ? "lifecycle · the class"
              : "behavior · the command";
          text(ctx, label, CODE.x + CODE.w - 24, r.base, {
            font: MONO,
            size: 18,
            weight: 600,
            align: "right",
            color: C.accent,
            a: on,
          });
        }
      }
      if (
        (startK > 0 && r.s.includes("start()")) ||
        (endK > 0 && r.s.includes("end()"))
      ) {
        const k = r.s.includes("start()") ? startK : endK;
        ctx.fillStyle = alpha(C.accent, 0.14 * k);
        ctx.fillRect(CODE.x + 10, r.y + 1, CODE.w - 20, LH * 3);
      }
    }
  }

  // a coroutine line as a node: lit while it runs, a budget bar on the wait
  function drawNode(ctx, r, V, t, typed, a, struck, live) {
    const s = V.s;
    const x = CODE.x + 12;
    const w = CODE.w - 24;
    const y = r.y + 3;
    const h = r.h - 6;
    let state = "idle";
    if (s) {
      if (r.kind === "n1")
        state = s.pc >= 1 ? (s.u < 0.25 ? "active" : "past") : "idle";
      if (r.kind === "n2")
        state =
          s.pc === 1 && s.ended == null
            ? "active"
            : s.pc >= 1
              ? "past"
              : "idle";
      if (r.kind === "n3")
        state =
          s.how === "done"
            ? s.u - s.n3At < 0.6
              ? "active"
              : "past"
            : s.how === "canceled"
              ? "skipped"
              : "idle";
      if (r.kind === "wc")
        state =
          s.how === "canceled"
            ? s.u - s.ended < 1.6
              ? "active"
              : "past"
            : "idle";
    }
    if (struck) state = "struck";
    ctx.save();
    ctx.globalAlpha *= a;
    rrect(ctx, x, y, w, h, 4);
    ctx.fillStyle =
      state === "active"
        ? alpha(C.accent, 0.16)
        : state === "skipped" || state === "struck"
          ? alpha(C.err, 0.08)
          : C.bg2;
    ctx.fill();
    ctx.strokeStyle =
      state === "skipped" || state === "struck"
        ? alpha(C.err, 0.8)
        : alpha(C.accent, r.kind === "wc" ? 0.45 : 0.7);
    ctx.lineWidth = state === "active" ? 2.5 : 1.5;
    if (r.kind === "n2" || r.kind === "wc") ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    if (state === "active") runBar(ctx, x, y, w, h, 0.5);
    // the code, typed in
    if (typed > 0) {
      const n = Math.round(r.s.length * typed);
      const str = r.s.slice(0, n);
      const end = codeLine(ctx, str, CODE.x + 24, r.base, {
        size: CODE_SIZE,
        a: state === "past" ? 0.7 : 1,
      });
      if (state === "struck" || state === "skipped") {
        ctx.fillStyle = C.err;
        ctx.fillRect(
          CODE.x + 24 + 10 * 12,
          r.base - 7,
          end - (CODE.x + 24 + 10 * 12),
          2.5
        );
      }
    }
    // a status tag on the right
    let tag = null;
    if (state === "skipped") tag = ["never runs", C.err];
    if (state === "struck") tag = ["deleted", C.err];
    if (r.kind === "wc" && (state === "active" || state === "past"))
      tag = ["sent stopped", C.accent];
    if (
      r.kind === "n3" &&
      (state === "active" || state === "past") &&
      !s?.noStop
    )
      tag = ["sent stopped", C.accent];
    if (tag && r.kind !== "wc")
      text(ctx, tag[0], x + w - 14, r.base, {
        font: MONO,
        size: 17,
        weight: 600,
        align: "right",
        color: tag[1],
      });
    if (tag && r.kind === "wc")
      text(ctx, tag[0], x + w - 14, r.base - 26, {
        font: MONO,
        size: 17,
        weight: 600,
        align: "right",
        color: tag[1],
      });
    // the wait's budget
    if (r.kind === "n2") {
      const bx = CODE.x + 24 + 10 * 12;
      const by = r.y + r.h - 16;
      const bw = 300;
      ctx.fillStyle = alpha(C.tx3, 0.25);
      ctx.fillRect(bx, by - 6, bw, 6);
      let used = null;
      if (s && s.pc >= 1)
        used = (s.ended != null ? s.ended : s.u) - s.waitStart;
      if (used != null) {
        ctx.fillStyle =
          s.how === "canceled"
            ? C.err
            : state === "active"
              ? C.accent
              : alpha(C.accent, 0.6);
        ctx.fillRect(bx, by - 6, bw * clamp(used / WAIT), 6);
      }
      const lbl =
        used == null
          ? "1.5 s"
          : s.how === "canceled"
            ? `canceled at ${used.toFixed(2)} of 1.5 s`
            : `${clamp(used, 0, WAIT).toFixed(2)} of 1.5 s`;
      text(ctx, lbl, bx + bw + 14, by + 1, {
        font: MONO,
        size: 17,
        color: s?.how === "canceled" ? C.err : used == null ? C.tx3 : C.tx2,
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
    micro(ctx, "Workshop 5 · Autonomous", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Fifteen Seconds, No Driver", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 112,
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
    text(ctx, "Write down where it ended.", W / 2, 440, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "Next, a path that knows where it ends.", W / 2, 560, {
      font: SERIF,
      size: 72,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "next") - 0.1, 0.5)),
    });
    ctx.restore();
  }

  // the callback: Raise And Shoot on the list, then Leave Start
  function introNote(ctx, t) {
    const a = window_(t, L("intro").t0 - 0.2, L("layers").t0 - 0.1, 0.35);
    if (a <= 0) return;
    const one = ramp(t, Wd("intro", "one") - 0.2, 0.3);
    text(
      ctx,
      one < 0.5
        ? "Workshop 4 · ran the arm, nobody on the sticks"
        : "this one drives the whole robot",
      DS.x + 22,
      DS.y + DS.h + 40,
      {
        font: MONO,
        size: 20,
        weight: 600,
        color: one < 0.5 ? C.tx2 : C.accent,
        a,
      }
    );
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const V = live ? liveView(live) : viewAt(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawFieldView(ctx, V, t, live);
    drawDS(ctx, V.s, t, live);
    drawRequests(ctx, V.s ? { ...V.s, noStop: V.noStop } : null, t, live);
    drawCode(ctx, V, t, live);
    if (!live) introNote(ctx, t);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate: a live Disable key ----------------------------------------------------

  const cache = new Map();
  function runFor(disableAt) {
    const key = disableAt == null ? "none" : disableAt.toFixed(2);
    if (!cache.has(key)) cache.set(key, simulate({ disableAt, dur: 6 }));
    return cache.get(key);
  }

  function liveView(state) {
    if (state.u < 0) return { s: null, theta: 0 };
    return { s: sampleAt(runFor(state.disableAt), state.u) };
  }

  function liveGate() {
    const state = {
      time: gate.t0,
      u: -1.0,
      disableAt: null,
      outcome: null,
      doneAt: null,
      runs: 0,
    };
    return {
      state,
      prompt() {
        if (state.u < 0)
          return state.runs
            ? "Again. Press Disable during the wait."
            : "Leave Start enables in a moment. Disable it whenever you like.";
        const s = liveView(state).s;
        if (s.how === "canceled")
          return s.pc === 1 || s.n3At == null
            ? "Canceled mid-wait: whenCanceled sent the stop."
            : "Canceled.";
        if (state.disableAt != null && s.how === "done")
          return "It had already finished. The last line sent the stop.";
        if (s.how === "done") return "No disable: the last line sent the stop.";
        return s.pc === 1 ? "Waiting 1.5 s. Disable now?" : "Driving forward.";
      },
      input(k, down) {
        if (k !== "disable" || !down || state.u < 0 || state.disableAt != null)
          return;
        state.disableAt = Math.round(state.u / LOOP) * LOOP + LOOP;
      },
      step(dt) {
        state.time += dt;
        state.u += dt;
        if (state.u < 0) return false;
        const s = liveView(state).s;
        if (s.ended != null && state.doneAt == null) state.doneAt = state.u;
        if (state.doneAt != null && state.u - state.doneAt > 2.2) {
          if (s.how === "canceled" || state.runs >= 1) return true;
          // it finished on its own: put it back on the tape for one more try
          state.runs += 1;
          state.u = -1.2;
          state.disableAt = null;
          state.doneAt = null;
        }
        return false;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - tGate;
    if (u < 0)
      return "Leave Start enables in a moment. Disable it whenever you like.";
    if (u < GATE_DIS) return "Waiting 1.5 s. Disable now?";
    return "Canceled mid-wait: whenCanceled sent the stop.";
  }

  const gateControls = [
    { k: "disable", label: "Disable", key: "KeyD", kind: "press", cls: "dis" },
  ];

  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
