// One File From Tuner X. The swerve generator measures the drivetrain, tests each
// module and writes TunerConstants.java; the workshop's DriveMechanism is what the
// code talks to; and teleop's default command, the only setDefaultCommand in the
// course, sends zero when the sticks centre.
//
// Most beats are recorded procedures in Tuner X, VS Code and AdvantageScope. Until
// that footage exists each one is drawn with drawToolWindow, one function per beat
// (rec* below), using the real control names from CTRE's generator docs.
//
// The one animated idea: a drivetrain's last request is a speed, and a request stays
// on the motors. Without something re-sending it, the robot keeps rolling. The default
// command re-reads the sticks every loop, so centred sticks ask for zero.
// No gate in this video.

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
  drawController,
  drawField,
  drawMotorCard,
  drawSwerveRobot,
  drawTimeline,
  drawToolWindow,
  panel,
  runBar,
  swerveModules,
} from "../../engine/kit.js";

const TAU = 2 * Math.PI;
const FULL = { x: 960, y: 480, z: 1 };

// ---- a robot on a field, for the sim / default / check beats ------------------------

// One drivetrain: stick events in, pose out, sampled at 120 Hz. Field centric, blue
// driver, heading held. `latched` = nothing re-sends the request: the last speed stays.
function runRobot(events, duration, { x = 2, y = 2, vmax = 2.2 } = {}) {
  const RATE = 120;
  const s = {
    time: 0,
    x,
    y,
    vx: 0,
    vy: 0,
    stick: { x: 0, y: 0 },
    req: 0,
    latched: false,
    mods: [0, 1, 2, 3].map(() => ({ angle: 0, speed: 0 })),
  };
  const out = [];
  let e = 0;
  const dt = 1 / RATE;
  for (let i = 0, n = Math.ceil(duration * RATE) + 2; i < n; i++) {
    while (e < events.length && events[e].t <= s.time) events[e++].do(s);
    // the request: re-read every loop, unless latched
    if (!s.latched) {
      const m = Math.hypot(s.stick.x, s.stick.y);
      s.req =
        m < 0.1
          ? { vx: 0, vy: 0 }
          : { vx: s.stick.y * vmax, vy: -s.stick.x * vmax };
    }
    const k = 1 - Math.exp(-dt / 0.2);
    s.vx += (s.req.vx - s.vx) * k;
    s.vy += (s.req.vy - s.vy) * k;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    const ms = swerveModules(s.vx, s.vy, 0);
    s.mods = ms.map((m, j) =>
      m.speed < 0.04 ? { angle: s.mods[j].angle, speed: 0 } : m
    );
    s.time += dt;
    out.push({
      ...s,
      stick: { ...s.stick },
      req: { ...s.req },
      mods: s.mods.map((m) => ({ ...m })),
    });
  }
  return (t) => out[clamp(Math.floor(t * RATE), 0, out.length - 1)];
}

// ---- small drawing helpers ------------------------------------------------------------

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

function arrow(ctx, x0, y0, x1, y1, color, w = 3) {
  const ang = Math.atan2(y1 - y0, x1 - x0);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1 - Math.cos(ang) * 8, y1 - Math.sin(ang) * 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - Math.cos(ang - 0.45) * 16, y1 - Math.sin(ang - 0.45) * 16);
  ctx.lineTo(x1 - Math.cos(ang + 0.45) * 16, y1 - Math.sin(ang + 0.45) * 16);
  ctx.closePath();
  ctx.fill();
}

// a dimension line with end ticks and a label
function dim(ctx, x0, y0, x1, y1, label, hot, { side = 1 } = {}) {
  const col = hot ? C.accent : C.tx3;
  arrow(ctx, (x0 + x1) / 2, (y0 + y1) / 2, x0, y0, col, hot ? 3.5 : 2.5);
  arrow(ctx, (x0 + x1) / 2, (y0 + y1) / 2, x1, y1, col, hot ? 3.5 : 2.5);
  const vertical = Math.abs(x1 - x0) < 1;
  if (vertical)
    text(ctx, label, x0 + side * 18, (y0 + y1) / 2 + 7, {
      font: MONO,
      size: 20,
      weight: 600,
      align: side > 0 ? "left" : "right",
      color: col,
    });
  else
    text(ctx, label, (x0 + x1) / 2, y0 + side * 32 + (side > 0 ? 6 : 0), {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: col,
    });
}

// A big top-down robot schematic, centred at (cx, cy), side px. angles[i] in radians
// (robot frame, 0 = forward = up the screen here), lit[i] highlights a corner.
function bigRobot(
  ctx,
  cx,
  cy,
  side,
  {
    angles = [0, 0, 0, 0],
    lit = [],
    bad = [],
    labels = true,
    spin = [0, 0, 0, 0],
  } = {}
) {
  const h = side / 2;
  rrect(ctx, cx - h, cy - h, side, side, 6);
  ctx.fillStyle = C.bg3;
  ctx.fill();
  ctx.strokeStyle = C.tx2;
  ctx.lineWidth = 3;
  ctx.stroke();
  // the front: top edge here
  ctx.fillStyle = C.accent;
  ctx.fillRect(cx - h * 0.6, cy - h, h * 1.2, 7);
  const corners = [
    ["FL", -1, -1],
    ["FR", 1, -1],
    ["BL", -1, 1],
    ["BR", 1, 1],
  ];
  corners.forEach(([n, sx, sy], i) => {
    const mx = cx + sx * h * 0.58;
    const my = cy + sy * h * 0.58;
    const isBad = bad.includes(i);
    const isLit = lit.includes(i);
    ctx.beginPath();
    ctx.arc(mx, my, h * 0.3, 0, TAU);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = isBad ? C.err : isLit ? C.accent : C.rule;
    ctx.lineWidth = isBad || isLit ? 4 : 2;
    ctx.stroke();
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(-(angles[i] ?? 0));
    rrect(ctx, -h * 0.07, -h * 0.2, h * 0.14, h * 0.4, 3);
    ctx.fillStyle = C.bg;
    ctx.fill();
    ctx.strokeStyle = isBad ? C.err : isLit ? C.accent : C.tx3;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (spin[i])
      arrow(
        ctx,
        0,
        0,
        0,
        -h * 0.34 * Math.sign(spin[i]),
        isBad ? C.err : C.accent,
        3
      );
    ctx.restore();
    if (labels)
      text(ctx, n, cx + sx * (h + 34), cy + sy * h * 0.58 + 8, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: isBad ? C.err : isLit ? C.accent : C.tx2,
      });
  });
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd } = cues(VOICE);
  const T = {
    measureW: Wd("intro", "measure"),
    testW: Wd("intro", "test"),
    writeW: Wd("intro", "write"),
    devices: L("devices").t0,
    measure: L("measure").t0,
    newProj: Wd("measure", "new"),
    four: Wd("measure", "four"),
    front: Wd("measure", "front"),
    side: Wd("measure", "side"),
    radius: Wd("measure", "radius,"),
    ratio: Wd("measure", "ratio."),
    swap: Wd("measure", "swap,"),
    modules: L("modules").t0,
    encoder: Wd("modules", "encoder"),
    motors: Wd("modules", "motors,"),
    straight: Wd("modules", "straight"),
    zero: Wd("modules", "zero."),
    verify: L("verify").t0,
    wrong: Wd("verify", "wrong"),
    swapped: Wd("verify", "swapped."),
    generate: L("generate").t0,
    replace: Wd("generate", "replace"),
    team: Wd("generate", "team"),
    deploy: Wd("generate", "deploy."),
    sim: L("sim").t0,
    run: Wd("sim", "run"),
    push: Wd("sim", "push"),
    watch: Wd("sim", "watch"),
    files: L("files").t0,
    ctre: Wd("files", "ctre."),
    third: Wd("files", "third,"),
    talks: Wd("files", "talks"),
    def: L("default").t0,
    speed: Wd("default", "speed,"),
    stays: Wd("default", "stays"),
    defCmd: Wd("default", "default"),
    reads: Wd("default", "reads"),
    loop: Wd("default", "loop."),
    letgo: Wd("default", "let"),
    zeroW: Wd("default", "zero."),
    check: L("check").t0,
    floor: Wd("check", "floor,"),
    letgo2: Wd("check", "let"),
    close: L("close").t0,
  };

  // a beat's window: from just before its first line to just before the next beat
  const beat = (t, a, b, e = 0.4) =>
    window_(t, L(a).t0 - 0.35, b ? L(b).t0 - 0.35 : VOICE.duration, e);

  // the robots
  const simRobot = runRobot(
    [
      { t: T.push, do: (s) => (s.stick = { x: 0.2, y: 0.9 }) },
      { t: T.push + 2.4, do: (s) => (s.stick = { x: -0.5, y: 0.5 }) },
      { t: T.push + 3.6, do: (s) => (s.stick = { x: 0, y: 0 }) },
    ],
    VOICE.duration,
    { x: 2.5, y: 2.5 }
  );
  // the latched speed: one push, then nothing re-sends the request
  const latchedRobot = runRobot(
    [
      { t: T.speed - 1.2, do: (s) => (s.stick = { x: 0, y: 0.85 }) },
      {
        t: T.speed - 0.2,
        do: (s) => ((s.latched = true), (s.stick = { x: 0, y: 0 })),
      },
    ],
    VOICE.duration,
    { x: 1.2, y: 2.0 }
  );
  // the default command: re-reads the sticks every loop
  const defaultRobot = runRobot(
    [
      { t: T.reads - 0.1, do: (s) => (s.stick = { x: 0, y: 0.85 }) },
      { t: T.letgo, do: (s) => (s.stick = { x: 0, y: 0 }) },
    ],
    VOICE.duration,
    { x: 1.2, y: 2.0 }
  );
  const floorRobot = runRobot(
    [
      { t: T.floor - 0.6, do: (s) => (s.stick = { x: 0, y: 0.8 }) },
      { t: T.letgo2, do: (s) => (s.stick = { x: 0, y: 0 }) },
    ],
    VOICE.duration,
    { x: 1.0, y: 1.5 }
  );

  const shots = [{ t: 0, ...FULL, d: 0.01 }];

  // ---- the opening ---------------------------------------------------------------

  function introBeat(ctx, t) {
    const a = window_(t, L("intro").t0 - 0.6, T.devices - 0.35, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const cx = 700;
    const cy = 450;
    const side = 380;
    const tested = clamp((t - T.testW) / 1.2);
    bigRobot(ctx, cx, cy, side, {
      lit: [0, 1, 2, 3].filter((i) => tested * 4 > i + 0.5),
    });
    const km = easeOut(ramp(t, T.measureW - 0.1, 0.5));
    if (km > 0) {
      ctx.globalAlpha *= km;
      dim(
        ctx,
        cx - side / 2,
        cy - side / 2 - 50,
        cx + side / 2,
        cy - side / 2 - 50,
        "side to side",
        true,
        { side: -1 }
      );
      dim(
        ctx,
        cx - side / 2 - 70,
        cy - side / 2,
        cx - side / 2 - 70,
        cy + side / 2,
        "front to back",
        true,
        { side: -1 }
      );
      ctx.globalAlpha /= km;
    }
    if (tested > 0)
      text(ctx, "every module tested", cx, cy + side / 2 + 70, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.accent,
        a: tested,
      });
    const kw = easeOut(ramp(t, T.writeW - 0.1, 0.5));
    if (kw > 0) {
      ctx.globalAlpha *= kw;
      rrect(ctx, 1180, 380, 560, 140, 6);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      micro(ctx, "one file", 1210, 420, { color: C.accent });
      text(ctx, "TunerConstants.java", 1210, 480, {
        font: MONO,
        size: 34,
        weight: 600,
      });
      arrow(ctx, cx + side / 2 + 110, cy, 1160, cy, C.accent, 4);
    }
    ctx.restore();
  }

  // ---- recorded beats, drawn for now ---------------------------------------------

  // Tuner X, Devices: thirteen devices on the CANivore, no warnings.
  function recDevices(ctx, t) {
    const a = beat(t, "devices", "measure");
    if (a <= 0) return;
    const k = (i) => clamp((t - T.devices - 0.2 - i * 0.18) / 0.3);
    const rows = [
      { label: "TalonFX · drive", value: "× 4" },
      { label: "TalonFX · steer", value: "× 4" },
      { label: "CANcoder", value: "× 4" },
      { label: "Pigeon 2", value: "× 1" },
      {
        label: "Devices on canivore",
        value: "13",
        hot: t > Wd("devices", "thirteen") - 0.1 && t < Wd("devices", "own"),
      },
      {
        label: "Duplicate IDs",
        value: "none",
        hot: t > Wd("devices", "own") - 0.1 && t < Wd("devices", "no"),
      },
      { label: "Warnings", value: "none", hot: t > Wd("devices", "no") - 0.1 },
    ];
    drawToolWindow(
      ctx,
      { x: 460, y: 90, w: 1000, h: 560 },
      {
        app: "Tuner X",
        title: "Devices",
        rows: rows.map((r, i) => ({
          ...r,
          label: k(i) > 0 ? r.label : "",
          value: k(i) > 0.5 ? r.value : null,
        })),
        rowH: 60,
        a,
      }
    );
    text(ctx, "one bus, one ID each per device type", 960, 720, {
      font: MONO,
      size: 22,
      align: "center",
      color: C.tx2,
      a: a * easeOut(ramp(t, Wd("devices", "own") - 0.1, 0.5)),
    });
  }

  // Tuner X, Mechanisms → New Project, then the four numbers.
  function recMeasure(ctx, t) {
    const a = beat(t, "measure", "modules");
    if (a <= 0) return;
    const swap = t > T.swap - 0.2;
    const hot = (from, to) => t >= from - 0.1 && t < to - 0.1;
    const rows = [
      {
        label: "Wheel Radius (inches)",
        value: "2.167",
        hot: hot(T.radius, T.ratio),
      },
      {
        label: "FL to FR distance (inches)",
        value: "20",
        hot: hot(T.side, T.radius) || swap,
        note: swap ? "side to side" : null,
      },
      {
        label: "FL to BL distance (inches)",
        value: "20",
        hot: hot(T.front, T.side) || swap,
        note: swap ? "front to back" : null,
      },
      { label: "Module Type", value: "yours" },
      { label: "Drive Ratio", value: "7.36", hot: hot(T.ratio, T.swap) },
    ];
    const proj = t < T.four - 0.2;
    drawToolWindow(
      ctx,
      { x: 80, y: 90, w: 820, h: 640 },
      {
        app: "Tuner X",
        title: proj ? "Mechanisms · Swerve" : "New Project",
        rows: proj ? [{ label: "Swerve generator", value: "" }] : rows,
        rowH: 74,
        buttons: proj
          ? [
              { label: "New Project", hot: t > T.newProj - 0.1 },
              { label: "Import Project" },
            ]
          : [],
        a,
      }
    );
    if (proj) return;
    ctx.save();
    ctx.globalAlpha *= a;
    // the robot, with the two distances drawn on it
    const cx = 1390;
    const cy = 430;
    const side = 340;
    bigRobot(ctx, cx, cy, side, { lit: swap ? [0, 1, 2] : [] });
    dim(
      ctx,
      cx - side / 2 + 30,
      cy - side / 2 - 50,
      cx + side / 2 - 30,
      cy - side / 2 - 50,
      "FL to FR · side to side",
      hot(T.side, T.radius) || swap,
      { side: -1 }
    );
    dim(
      ctx,
      cx - side / 2 - 60,
      cy - side / 2 + 30,
      cx - side / 2 - 60,
      cy + side / 2 - 30,
      "FL to BL",
      hot(T.front, T.side) || swap,
      { side: -1 }
    );
    text(ctx, "front to back", cx - side / 2 - 78, cy + 36, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "right",
      color: hot(T.front, T.side) || swap ? C.accent : C.tx3,
    });
    if (swap)
      text(ctx, "easy to swap: read them twice", cx, cy + side / 2 + 120, {
        font: MONO,
        size: 24,
        weight: 600,
        align: "center",
        color: C.accent,
        a: easeOut(ramp(t, T.swap - 0.2, 0.5)),
      });
    ctx.restore();
  }

  // Tuner X, module setup and Encoder Calibration, four times.
  function recModules(ctx, t) {
    const a = beat(t, "modules", "verify");
    if (a <= 0) return;
    const names = ["Front Left", "Front Right", "Back Left", "Back Right"];
    // first corner slowly, the other three at speed
    const doneAt = [T.zero, T.zero + 0.9, T.zero + 1.6, T.zero + 2.3];
    const cur = doneAt.findIndex((d) => t < d);
    const idx = cur < 0 ? 3 : cur;
    const pick = (w) => t >= w - 0.1;
    drawToolWindow(
      ctx,
      { x: 80, y: 90, w: 820, h: 560 },
      {
        app: "Tuner X",
        title: `Swerve · ${names[idx]}`,
        rows: [
          { label: "Module", value: names[idx] },
          {
            label: "Encoder",
            value: pick(T.encoder) ? "CANcoder" : "select",
            hot: pick(T.encoder) && t < T.motors - 0.1,
          },
          {
            label: "Steer Motor",
            value: pick(T.motors) ? "TalonFX" : "select",
            hot: pick(T.motors) && t < T.straight - 0.3,
          },
          {
            label: "Drive Motor",
            value: pick(T.motors) ? "TalonFX" : "select",
            hot: pick(T.motors) && t < T.straight - 0.3,
          },
        ],
        rowH: 70,
        buttons: [
          {
            label: "Encoder Calibration",
            hot: t > T.straight - 0.3 && t < T.zero + 2.6,
          },
        ],
        a,
      }
    );
    ctx.save();
    ctx.globalAlpha *= a;
    // Incomplete Modules: each corner leaves the list once calibrated
    panel(ctx, { x: 80, y: 680, w: 820, h: 190 }, C.bg2);
    micro(ctx, "Incomplete Modules", 104, 716);
    names.forEach((n, i) => {
      const done = t >= doneAt[i];
      text(ctx, n, 104 + i * 200, 790, {
        font: MONO,
        size: 20,
        weight: 600,
        color: done ? C.tx3 : C.tx,
      });
      if (done) {
        ctx.fillStyle = C.tx3;
        ctx.fillRect(104 + i * 200, 783, 150, 2);
      }
    });
    // the wheel, held straight: that angle is the zero
    const cx = 1390;
    const cy = 400;
    panel(ctx, { x: 1000, y: 90, w: 780, h: 620 }, C.bg2);
    micro(ctx, "the wheel, held straight", 1030, 130);
    const hold = clamp((t - T.straight + 0.2) / 0.8);
    const ang = lerp(0.35, 0, easeOut(hold));
    ctx.beginPath();
    ctx.arc(cx, cy, 170, 0, TAU);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 3;
    ctx.stroke();
    // straight-ahead reference
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = alpha(C.accent, 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 250);
    ctx.lineTo(cx, cy + 250);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    rrect(ctx, -40, -130, 80, 260, 8);
    ctx.fillStyle = C.bg;
    ctx.fill();
    ctx.strokeStyle = hold >= 1 ? C.accent : C.tx2;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
    text(ctx, "straight ahead", cx + 18, cy - 230, {
      font: MONO,
      size: 20,
      color: C.accent,
    });
    const kz = easeOut(ramp(t, T.zero - 0.2, 0.5));
    text(ctx, "this angle = the module's zero", cx, 680, {
      font: MONO,
      size: 24,
      weight: 600,
      align: "center",
      color: C.accent,
      a: kz,
    });
    ctx.restore();
  }

  // Tuner X, Verify Steer / Verify Drive; the wrong corner moving means swapped IDs.
  function recVerify(ctx, t) {
    const a = beat(t, "verify", "generate");
    if (a <= 0) return;
    const wrong = t > T.wrong - 0.1;
    drawToolWindow(
      ctx,
      { x: 80, y: 90, w: 760, h: 420 },
      {
        app: "Tuner X",
        title: "Verification",
        rows: [
          {
            label: "Module",
            value: wrong ? "Front Left" : "all four",
            hot: wrong,
          },
          {
            label: "Verify Steer",
            value: "turns each module",
            note: "counterclockwise, seen from above",
          },
          { label: "Verify Drive", value: "spins each wheel" },
        ],
        rowH: 74,
        buttons: [
          { label: "Verify Steer", hot: !wrong },
          { label: "Verify Drive", hot: wrong },
        ],
        a,
      }
    );
    ctx.save();
    ctx.globalAlpha *= a;
    const u = t - T.verify;
    const steer = wrong ? 0 : clamp(u / 2.6) * TAU * 0.5;
    const spin = wrong ? [0, Math.sin(u * 9) > -2 ? 1 : 0, 0, 0] : [0, 0, 0, 0];
    bigRobot(ctx, 1320, 420, 380, {
      angles: [steer, steer, steer, steer],
      lit: wrong ? [0] : [0, 1, 2, 3],
      bad: wrong ? [1] : [],
      spin,
    });
    if (wrong) {
      const k = easeOut(ramp(t, T.wrong - 0.1, 0.5));
      text(ctx, "asked for Front Left", 1320, 720, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.accent,
        a: k,
      });
      text(ctx, "Front Right moved", 1320, 756, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.err,
        a: k,
      });
      text(ctx, "→ two IDs are swapped", 1320, 812, {
        size: 30,
        weight: 600,
        align: "center",
        color: C.tx,
        a: easeOut(ramp(t, T.swapped - 0.6, 0.5)),
      });
    } else {
      text(ctx, "Verify Steer · all four turn", 1320, 740, {
        font: MONO,
        size: 22,
        weight: 600,
        align: "center",
        color: C.tx2,
      });
    }
    ctx.restore();
  }

  // Tuner X Generate only TunerConstants, the file swap in VS Code, team number, deploy.
  function recGenerate(ctx, t) {
    const a = beat(t, "generate", "sim");
    if (a <= 0) return;
    drawToolWindow(
      ctx,
      { x: 80, y: 90, w: 700, h: 300 },
      {
        app: "Tuner X",
        title: "Generate",
        rows: [{ label: "Writes one file", value: "TunerConstants.java" }],
        rowH: 64,
        buttons: [
          { label: "Generate only TunerConstants", hot: t < T.replace - 0.1 },
          { label: "Save As", hot: false },
        ],
        a,
      }
    );
    ctx.save();
    ctx.globalAlpha *= a;
    const kr = easeOut(ramp(t, T.replace - 0.15, 0.5));
    const kt = easeOut(ramp(t, T.team - 0.15, 0.5));
    const R = { x: 840, y: 90, w: 1000, h: 640 };
    ctx.globalAlpha *= kr;
    drawToolWindow(ctx, R, {
      app: "VS Code",
      title: "src/main/java/frc/robot/generated/",
      rows: [],
    });
    // the file tree, with the old file swapped out
    const swapK = clamp((t - T.replace - 0.4) / 0.5);
    micro(ctx, "generated", R.x + 30, R.y + 100);
    text(ctx, "TunerConstants.java", R.x + 30, R.y + 146, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.tx3,
      a: 1 - swapK,
    });
    text(ctx, "TunerConstants.java", R.x + 30, R.y + 146, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.accent,
      a: swapK,
    });
    text(
      ctx,
      swapK > 0.5 ? "← from Tuner X, your robot" : "← the example robot's",
      R.x + 330,
      R.y + 146,
      { font: MONO, size: 20, color: swapK > 0.5 ? C.accent : C.tx3 }
    );
    codeLine(
      ctx,
      'public static final CANBus kCANBus = new CANBus("canivore");',
      R.x + 30,
      R.y + 210,
      { size: 19, a: swapK }
    );
    // team number
    if (kt > 0) {
      ctx.save();
      ctx.globalAlpha = a * kt;
      micro(ctx, ".wpilib/wpilib_preferences.json", R.x + 30, R.y + 300);
      const y = R.y + 350;
      codeLine(ctx, '"teamNumber": ', R.x + 30, y, { size: 22 });
      const cx = R.x + 30 + 14 * 13.3;
      const sw = clamp((t - T.team - 0.3) / 0.4);
      codeLine(ctx, "5712", cx, y, { size: 22, a: 1 - sw });
      if (sw > 0) hatch(ctx, cx, y - 22, 110 * sw, 30);
      text(ctx, sw > 0.5 ? "yours" : "ships as 5712", R.x + 300, y, {
        font: MONO,
        size: 18,
        color: sw > 0.5 ? C.accent : C.tx3,
      });
      ctx.restore();
    }
    const kd = easeOut(ramp(t, T.deploy - 0.2, 0.4));
    if (kd > 0) {
      ctx.save();
      ctx.globalAlpha = a * kd;
      rrect(ctx, R.x + 30, R.y + 430, 520, 56, 4);
      ctx.fillStyle = C.accent;
      ctx.fill();
      text(ctx, "WPILib: Deploy Robot Code", R.x + 290, R.y + 466, {
        size: 22,
        weight: 600,
        align: "center",
        color: C.accentInk,
      });
      text(ctx, "→ SystemCore", R.x + 580, R.y + 466, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.tx2,
      });
      ctx.restore();
    }
    ctx.restore();
  }

  // VS Code Simulate Robot Code, the sim GUI's joystick and mode, AdvantageScope's 2D field.
  function recSim(ctx, t) {
    const a = beat(t, "sim", "files");
    if (a <= 0) return;
    const run = t > T.run - 0.1;
    drawToolWindow(
      ctx,
      { x: 60, y: 90, w: 600, h: 420 },
      {
        app: "Robot Simulation",
        title: run ? "Sim GUI" : "VS Code",
        rows: run
          ? [
              {
                label: "Joystick[0]",
                value: "your controller",
                hot: t < T.push - 0.1,
              },
              { label: "Robot State", value: "Teleoperated" },
              { label: "OpMode", value: "Teleop" },
            ]
          : [{ label: "WPILib: Simulate Robot Code", value: "", hot: true }],
        rowH: 70,
        a,
      }
    );
    ctx.save();
    ctx.globalAlpha *= a;
    const s = simRobot(t);
    const R = { x: 700, y: 90, w: 1160, h: 640 };
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = "oklch(0.18 0.012 265)";
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    micro(
      ctx,
      "AdvantageScope · 2D Field · Drivetrain/Pose",
      R.x + 22,
      R.y + 32,
      { size: 15 }
    );
    const F = drawField(
      ctx,
      { x: R.x + 20, y: R.y + 56, w: R.w - 40, h: R.h - 76 },
      { view: { x0: 0, y0: 0, x1: 10, y1: 5.5 } }
    );
    drawSwerveRobot(
      ctx,
      F,
      { x: s.x, y: s.y, theta: 0 },
      { modules: s.mods, maxSpeed: 2.6 }
    );
    drawController(
      ctx,
      { x: 140, y: 570, w: 440, h: 270 },
      { left: s.stick, label: false }
    );
    ctx.restore();
  }

  // ---- animated beats -------------------------------------------------------------

  function filesBeat(ctx, t) {
    const a = beat(t, "files", "default");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const cards = [
      [
        "TunerConstants.java",
        "Tuner X wrote it",
        "IDs, sizes, ratios, offsets",
        T.files + 0.4,
      ],
      [
        "CommandSwerveDrivetrain.java",
        "Tuner X wrote it",
        "the swerve math",
        T.ctre - 0.3,
      ],
      [
        "DriveMechanism.java",
        "the workshop's",
        "what your code talks to",
        T.third - 0.1,
      ],
    ];
    cards.forEach(([name, who, what, at], i) => {
      const k = easeOut(ramp(t, at, 0.5));
      const x = 110 + i * 580;
      const hot = i === 2 && t > T.third - 0.1;
      ctx.save();
      ctx.globalAlpha *= k;
      rrect(ctx, x, 260, 540, 300, 6);
      ctx.fillStyle = hot ? alpha(C.accent, 0.1) : C.bg2;
      ctx.fill();
      ctx.strokeStyle = hot ? C.accent : C.rule;
      ctx.lineWidth = hot ? 3 : 2;
      ctx.stroke();
      micro(ctx, who, x + 30, 310, { color: hot ? C.accent : C.tx3 });
      text(ctx, name, x + 30, 372, {
        font: MONO,
        size: name.length > 22 ? 25 : 30,
        weight: 600,
      });
      text(ctx, what, x + 30, 430, { size: 26, color: C.tx2 });
      if (i === 2)
        text(ctx, "implements Mechanism", x + 30, 500, {
          font: MONO,
          size: 20,
          color: C.tx3,
        });
      ctx.restore();
    });
    // your code → DriveMechanism → the drivetrain
    const kt = easeOut(ramp(t, T.talks - 0.2, 0.5));
    if (kt > 0) {
      ctx.globalAlpha *= kt;
      text(ctx, "TeleopOpMode", 1540, 700, {
        font: MONO,
        size: 26,
        weight: 600,
        align: "center",
        color: C.accent,
      });
      arrow(ctx, 1540, 670, 1540, 580, C.accent, 4);
      text(ctx, "applyRequest · seedFieldCentric · getPose", 960, 780, {
        font: MONO,
        size: 22,
        align: "center",
        color: C.tx2,
      });
    }
    ctx.restore();
  }

  // The latched speed, then the default command that re-sends the sticks every loop.
  function defaultBeat(ctx, t) {
    const a = beat(t, "default", "check");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const phaseB = t > T.defCmd - 0.3;
    const s = phaseB ? defaultRobot(t) : latchedRobot(t);
    // callback: the arm held a position; a speed is different
    const kc = window_(t, T.def + 0.2, T.defCmd - 0.3, 0.35);
    // field
    const FR = { x: 60, y: 70, w: 880, h: 440 };
    panel(ctx, FR, C.bg2);
    const F = drawField(
      ctx,
      { x: FR.x + 16, y: FR.y + 50, w: FR.w - 32, h: FR.h - 66 },
      { view: { x0: 0, y0: 0, x1: 10, y1: 4.6 }, labels: false }
    );
    micro(
      ctx,
      phaseB ? "with the default command" : "if the last speed stays",
      FR.x + 22,
      FR.y + 34,
      { color: phaseB ? C.accent : C.err }
    );
    drawSwerveRobot(
      ctx,
      F,
      { x: Math.min(s.x, 9.6), y: s.y, theta: 0 },
      { modules: s.mods, maxSpeed: 2.6 }
    );
    if (!phaseB && t > T.speed) {
      const k = easeOut(ramp(t, T.speed, 0.5));
      text(ctx, "sticks centred · still rolling", F.X(5), F.Y(4.0), {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.err,
        a: k,
      });
    }
    // the request on the drivetrain
    const vx = s.req.vx ?? 0;
    const latchedNote = !phaseB && t > T.speed - 0.2;
    drawMotorCard(
      ctx,
      { x: 910 + 50, y: 540, w: 420, h: 330 },
      {
        title: "request on the modules",
        led: Math.abs(vx) > 0.01 ? C.accent : C.tx3,
        lit: phaseB ? 0.6 * window_(t, T.letgo - 0.2, T.check, 0.3) : 0,
        rows: [
          ["request", "FieldCentric", C.tx, 28],
          [
            latchedNote ? "vx · latched" : "vx",
            `${vx.toFixed(2)} m/s`,
            latchedNote ? C.err : Math.abs(vx) > 0.01 ? C.accent : C.tx,
            34,
          ],
        ],
      }
    );
    // the scheduler lane: nothing, then applyRequest forever
    const view = { t0: T.def - 0.5, span: L("check").t0 - T.def + 0.5 };
    const bars = phaseB
      ? [
          {
            lane: 0,
            start: T.defCmd,
            end: null,
            label: "applyRequest · default",
            open: true,
            state: "run",
          },
        ]
      : [];
    const tl = drawTimeline(
      ctx,
      { x: 60, y: 540, w: 870, h: 200 },
      {
        lanes: ["Drivetrain"],
        bars,
        view,
        now: t,
        title: "scheduler · who owns the drivetrain",
      }
    );
    if (phaseB && t > T.defCmd) {
      // one tick per loop (drawn every 0.25 s): read the sticks, send a request
      ctx.fillStyle = C.accent;
      for (let u = T.defCmd + 0.25; u < t; u += 0.25)
        ctx.fillRect(tl.X(u) - 1, tl.laneY(0) + tl.laneH - 22, 2, 10);
      text(ctx, "reads the sticks every loop", 90, 790, {
        font: MONO,
        size: 20,
        color: C.tx2,
        a: easeOut(ramp(t, T.reads - 0.1, 0.5)),
      });
    }
    if (!phaseB)
      text(ctx, "nothing re-sends the request", 90, 790, {
        font: MONO,
        size: 20,
        color: C.tx3,
        a: easeOut(ramp(t, T.stays - 0.2, 0.5)),
      });
    if (phaseB && t > T.zeroW - 0.3)
      text(ctx, "sticks centred → asks for zero", 90, 830, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.accent,
        a: easeOut(ramp(t, T.zeroW - 0.3, 0.5)),
      });
    // the code
    const CR = { x: 980, y: 70, w: 880, h: 440 };
    panel(ctx, CR);
    micro(
      ctx,
      "TeleopOpMode.java · the only setDefaultCommand",
      CR.x + 24,
      CR.y + 38
    );
    const lines = [
      "drivetrain.setDefaultCommand(",
      "    drivetrain.applyRequest(",
      "        () ->",
      "            drive",
      "                .withVelocityX(-driver.getLeftY() * maxSpeed)",
      "                .withVelocityY(-driver.getLeftX() * maxSpeed)",
      "                .withRotationalRate(-driver.getRightX() * maxAngularRate)));",
    ];
    const kcode = phaseB ? 1 : 0.35;
    const pulse = 0.5 + 0.5 * Math.cos(((t % 0.25) / 0.25) * TAU);
    lines.forEach((l, i) => {
      const y = CR.y + 90 + i * 30;
      if (phaseB && i >= 3 && t > T.reads - 0.1)
        runBar(ctx, CR.x + 1, y - 22, CR.w - 2, 30, pulse);
      codeLine(ctx, l, CR.x + 24, y, { size: 17, a: kcode });
    });
    micro(ctx, "DriveMechanism.java", CR.x + 24, CR.y + 330, { a: kcode });
    codeLine(
      ctx,
      "public Command applyRequest(Supplier<SwerveRequest> request) {",
      CR.x + 24,
      CR.y + 366,
      { size: 17, a: kcode }
    );
    codeLine(
      ctx,
      "  return runRepeatedly(() -> drivetrain.setControl(request.get()))",
      CR.x + 24,
      CR.y + 394,
      { size: 17, a: kcode }
    );
    codeLine(ctx, '      .named("applyRequest");', CR.x + 24, CR.y + 422, {
      size: 17,
      a: kcode,
    });
    // the controller
    drawController(
      ctx,
      { x: 1420, y: 590, w: 420, h: 260 },
      { left: s.stick, label: false }
    );
    // the callback chip, over the code while the arm is named
    if (kc > 0) {
      ctx.save();
      ctx.globalAlpha *= kc;
      rrect(ctx, CR.x + 40, CR.y + 70, CR.w - 80, 200, 6);
      ctx.fillStyle = alpha(C.bg2, 0.97);
      ctx.fill();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      micro(ctx, "the arm", CR.x + 70, CR.y + 120);
      text(ctx, "last request: a position → it holds", CR.x + 220, CR.y + 121, {
        font: MONO,
        size: 21,
        color: C.tx3,
      });
      micro(ctx, "drivetrain", CR.x + 70, CR.y + 180, { color: C.accent });
      text(ctx, "last request: a speed → it rolls", CR.x + 220, CR.y + 181, {
        font: MONO,
        size: 21,
        weight: 600,
        color: C.accent,
        a: easeOut(ramp(t, T.speed - 0.3, 0.4)),
      });
      text(
        ctx,
        "a request stays on the motor · /running-program#latched",
        CR.x + 70,
        CR.y + 238,
        {
          font: MONO,
          size: 17,
          color: C.tx3,
          a: easeOut(ramp(t, T.stays - 0.3, 0.4)),
        }
      );
      ctx.restore();
    }
    ctx.restore();
  }

  // On blocks: forward lines the wheels up. On the floor: let go, it stops.
  function recCheck(ctx, t) {
    const a = beat(t, "check", "close");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const u = t - T.check;
    const fwd = clamp((u - 0.8) / 0.6);
    // on blocks: the wheels start every which way, then line up and spin in place
    panel(ctx, { x: 80, y: 90, w: 820, h: 700 }, C.bg2);
    micro(ctx, "on blocks · stick forward", 110, 132, {
      color: fwd > 0 ? C.accent : C.tx3,
    });
    const start = [0.6, -0.9, 1.2, -0.3];
    const angles = start.map((s) => lerp(s, 0, easeInOut(fwd)));
    bigRobot(ctx, 490, 450, 380, {
      angles,
      lit: fwd >= 1 ? [0, 1, 2, 3] : [],
      spin: fwd >= 1 ? [1, 1, 1, 1] : [0, 0, 0, 0],
    });
    text(ctx, fwd >= 1 ? "all four lined up" : "", 490, 740, {
      font: MONO,
      size: 24,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    // on the floor
    const s = floorRobot(t);
    const R = { x: 960, y: 90, w: 880, h: 700 };
    panel(ctx, R, C.bg2);
    const kf = t > T.floor - 0.6;
    micro(ctx, "on the floor · let go", R.x + 30, R.y + 42, {
      color: kf ? C.accent : C.tx3,
    });
    const F = drawField(
      ctx,
      { x: R.x + 20, y: R.y + 70, w: R.w - 40, h: R.h - 200 },
      { view: { x0: 0, y0: 0, x1: 6, y1: 3 }, labels: false, axes: false }
    );
    drawSwerveRobot(
      ctx,
      F,
      { x: Math.min(s.x, 5.5), y: s.y, theta: 0 },
      { modules: s.mods, maxSpeed: 2.6 }
    );
    const stopped = t > T.letgo2 + 0.6;
    text(ctx, stopped ? "it stops" : "", R.x + R.w / 2, R.y + R.h - 70, {
      font: MONO,
      size: 26,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    ctx.restore();
  }

  // ---- full-screen cards ----------------------------------------------------------

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
      "Workshop 5 · Swerve Project Generator",
      W / 2,
      440 - 20 * (1 - k),
      { align: "center", a: k, color: C.accent }
    );
    text(ctx, "One File From Tuner X", W / 2, 560 - 30 * (1 - k), {
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
    // stacked: side by side, the third phrase is wider than its slot and runs into the second
    const step = (w, i, s) =>
      text(ctx, s, W / 2, 380 + i * 100, {
        font: SERIF,
        size: 72,
        align: "center",
        color: i === 2 ? C.accent : C.tx,
        a: easeOut(ramp(t, Wd("close", w) - 0.15, 0.5)),
      });
    step("measure", 0, "Measure it.");
    step("generate", 1, "Generate it.");
    step("drive", 2, "Drive it in sim.");
    text(ctx, "before it ever touches the floor", W / 2, 700, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "touches") - 0.2, 0.6)),
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t) {
    background(ctx);
    ctx.save();
    applyCamera(ctx, camera(shots, t));
    introBeat(ctx, t);
    recDevices(ctx, t);
    recMeasure(ctx, t);
    recModules(ctx, t);
    recVerify(ctx, t);
    recGenerate(ctx, t);
    recSim(ctx, t);
    filesBeat(ctx, t);
    defaultBeat(ctx, t);
    recCheck(ctx, t);
    ctx.restore();
    vignette(ctx);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  return { draw, gate: undefined, gatePromptAt: () => null };
}
