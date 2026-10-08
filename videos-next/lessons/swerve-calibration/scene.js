// Straight Means Straight. Three things called "zeroing" act on three different
// things, a half-degree module zero walks the robot off a line, and the steer loop is
// tuned by laying the measured angle over the commanded one.
//
// What is simulated, and how:
//   zeroing   one robot on the field drawable. The left bumper (seedFieldCentric)
//             swings the driver-forward arrow to the robot's nose; the alliance
//             setting (applyOperatorPerspective) snaps it to 0° or 180°. Neither
//             touches the pose readout. resetPose would move the pose, and it is
//             greyed: DriveMechanism doesn't expose it, nothing calls it.
//   the walk  a robot driving a 6 m line with one module tilted by a small angle
//             drifts sideways by tan(angle) × distance: 0.5° is 5 cm over 6 m. The
//             sideways scale is stretched so centimetres read; it says so on screen.
//   steering  commanded vs measured module angle through stick flicks: an untuned
//             loop lags and overshoots, a tuned one sits on top.
// Recorded beats (straight edge and bevel gears, Encoder Calibration, the plot) are
// drawn with drawToolWindow and schematics until the footage is captured.

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
  drawPlot,
  drawPoseReadout,
  drawSwerveRobot,
  drawToolWindow,
  panel,
  swerveModules,
} from "../../engine/kit.js";

const TAU = 2 * Math.PI;
const DEG = Math.PI / 180;
const FULL = { x: 960, y: 480, z: 1 };

// ---- the half-degree walk ----------------------------------------------------------

const LINE = 6; // meters
const RUN_V = 1.25; // m/s
const STRETCH = 9; // sideways exaggeration on the walk drawing

// lateral drift after d meters with one module tilted `deg`
const drift = (d, deg) => Math.tan(deg * DEG) * d;

// ---- helpers --------------------------------------------------------------------------

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

// The 6 m line seen from above, the robot walking along it. `d` meters driven,
// `deg` the bad module's tilt. Returns nothing; draws in R.
function drawWalk(
  ctx,
  R,
  d,
  deg,
  { title = "drive 6 m down a taped line", showOff = true } = {}
) {
  panel(ctx, R, C.bg2);
  micro(ctx, title, R.x + 24, R.y + 36);
  const x0 = R.x + 90;
  const x1 = R.x + R.w - 120;
  const yL = R.y + R.h / 2 + 10;
  const X = (m) => lerp(x0, x1, m / LINE);
  const pxPerM = (x1 - x0) / LINE;
  const Y = (m) => yL - m * pxPerM * STRETCH; // sideways meters → px, stretched
  // the tape
  ctx.strokeStyle = C.tx3;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x0, yL);
  ctx.lineTo(x1, yL);
  ctx.stroke();
  for (let m = 0; m <= LINE; m++) {
    ctx.fillStyle = C.tx3;
    ctx.fillRect(X(m) - 1, yL + 14, 2, 12);
    text(ctx, `${m} m`, X(m), yL + 50, {
      font: MONO,
      size: 17,
      align: "center",
      color: C.tx3,
    });
  }
  // the path so far
  ctx.strokeStyle = deg ? C.accent : C.tx;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let m = 0; m <= d + 1e-6; m += 0.05) {
    const px = X(m);
    const py = Y(drift(m, deg));
    m ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  // the robot, a box, nose along the line
  const ry = Y(drift(d, deg));
  rrect(ctx, X(d) - 26, ry - 26, 52, 52, 4);
  ctx.fillStyle = C.bg3;
  ctx.fill();
  ctx.strokeStyle = C.tx2;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = C.accent;
  ctx.fillRect(X(d) + 20, ry - 16, 6, 32);
  const off = drift(d, deg) * 100;
  if (showOff && Math.abs(off) > 0.05) {
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(d) + 44, yL);
    ctx.lineTo(X(d) + 44, ry);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, `${Math.abs(off).toFixed(1)} cm`, X(d) + 54, (yL + ry) / 2 + 8, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.accent,
    });
  }
  text(
    ctx,
    `sideways × ${STRETCH}, so centimetres show`,
    R.x + R.w - 24,
    R.y + 36,
    { font: MONO, size: 16, align: "right", color: C.tx3 }
  );
  text(ctx, `one module off by ${deg.toFixed(1)}°`, R.x + 24, R.y + R.h - 24, {
    font: MONO,
    size: 20,
    weight: 600,
    color: deg ? C.accent : C.tx2,
  });
}

// The robot from above, big, for the straight edge and bevel gear beat. gear[i] = +1
// faces in, -1 faces out.
function benchRobot(
  ctx,
  cx,
  cy,
  side,
  { edge = null, gear = [1, 1, 1, 1], flipK = 1, tilt = 0 } = {}
) {
  const h = side / 2;
  rrect(ctx, cx - h, cy - h, side, side, 6);
  ctx.fillStyle = C.bg3;
  ctx.fill();
  ctx.strokeStyle = C.tx2;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = C.accent;
  ctx.fillRect(cx - h * 0.6, cy - h, h * 1.2, 7);
  const corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  corners.forEach(([sx, sy], i) => {
    const mx = cx + sx * h * 0.6;
    const my = cy + sy * h * 0.58;
    const a = i === 0 ? tilt : 0;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(a);
    rrect(ctx, -20, -64, 40, 128, 5);
    ctx.fillStyle = C.bg;
    ctx.fill();
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 2;
    ctx.stroke();
    // the bevel gear on the wheel's side: in (toward the centre) or out
    const g = gear[i] < 0 ? lerp(-1, 1, flipK) : 1;
    const dir = -sx * g;
    ctx.beginPath();
    ctx.moveTo(dir * 22, -18);
    ctx.lineTo(dir * 40, 0);
    ctx.lineTo(dir * 22, 18);
    ctx.closePath();
    ctx.fillStyle = gear[i] < 0 && flipK < 1 ? C.err : C.accent;
    ctx.fill();
    ctx.restore();
  });
  // the straight edge, along the outside of both wheels on one side
  if (edge) {
    const sx = edge.side;
    const x = cx + sx * (h * 0.6 + 22);
    rrect(ctx, x - (sx < 0 ? 14 : 0), cy - h - 60, 14, side + 120, 2);
    ctx.fillStyle = alpha(C.tx, 0.9 * edge.k);
    ctx.fill();
  }
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd } = cues(VOICE);
  const gate = VOICE.gates[0];
  const gd = gate.t1 - gate.t0;
  const T = {
    intro: L("intro").t0,
    three: Wd("intro", "three", 2),
    bumper: L("bumper").t0,
    resets: Wd("bumper", "resets"),
    doesnt: Wd("bumper", "doesn't"),
    persp: L("perspective").t0,
    flips: Wd("perspective", "flips"),
    either: Wd("perspective", "either."),
    pose: L("pose").t0,
    nothing: Wd("pose", "nothing"),
    now: Wd("pose", "now,"),
    distance: Wd("pose", "distance"),
    offsets: L("offsets").t0,
    eye: Wd("offsets", "eye."),
    half: Wd("offsets", "half"),
    edge: L("edge").t0,
    side: Wd("edge", "side."),
    bevel: Wd("edge", "bevel"),
    turn: Wd("edge", "turn"),
    calib: L("calibrate").t0,
    generate: Wd("calibrate", "generate"),
    redeploy: Wd("calibrate", "redeploy."),
    steer: L("steer").t0,
    gravity: Wd("steer", "gravity", 1),
    staticW: Wd("steer", "static"),
    shipped: Wd("steer", "shipped"),
    plot: L("plot").t0,
    flick: Wd("plot", "flick"),
    tuned: Wd("plot", "tuned,"),
    close: L("close").t0,
    zeroW: Wd("close", "zero."),
    wander: Wd("close", "wander"),
  };
  const beat = (t, a, b, e = 0.4) =>
    window_(t, L(a).t0 - 0.35, b ? L(b).t0 - 0.35 : VOICE.duration, e);

  // ---- the zeroing beats ----------------------------------------------------------
  // robot heading: turns 90° left before the bumper is pressed
  const heading = (t) =>
    (Math.PI / 2) * easeInOut(ramp(t, T.bumper + 0.1, 1.3));
  const LB_AT = T.resets + 0.2;
  // the driver's forward, as a field angle
  function forwardAt(t) {
    if (t < LB_AT) return 0;
    if (t < T.flips) return (Math.PI / 2) * easeOut(ramp(t, LB_AT, 0.4));
    // the alliance setting snaps it to red's 180°
    return lerp(Math.PI / 2, Math.PI, easeOut(ramp(t, T.flips, 0.4)));
  }

  function cardsRow(ctx, t) {
    const a = window_(t, T.intro + 0.3, T.offsets - 0.35, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const cards = [
      [
        "left bumper",
        "seedFieldCentric()",
        "sets forward",
        T.intro + 0.6,
        T.bumper,
        T.persp,
      ],
      [
        "alliance",
        "applyOperatorPerspective()",
        "sets forward by alliance",
        T.intro + 1.2,
        T.persp,
        T.pose,
      ],
      [
        "not exposed in DriveMechanism",
        "resetPose(Pose2d)",
        "would move the pose",
        T.intro + 1.8,
        T.pose,
        T.offsets,
      ],
    ];
    cards.forEach(([head, call, does, appear, on, off], i) => {
      const k = easeOut(ramp(t, appear, 0.5));
      const x = 60 + i * 610;
      const hot = t >= on - 0.3 && t < off - 0.3;
      const grey = i === 2;
      ctx.save();
      ctx.globalAlpha *= k * (grey && !hot ? 0.75 : 1);
      rrect(ctx, x, 60, 580, 130, 6);
      ctx.fillStyle = hot ? alpha(C.accent, 0.1) : C.bg2;
      ctx.fill();
      ctx.strokeStyle = hot ? C.accent : C.rule;
      ctx.lineWidth = hot ? 3 : 2;
      if (grey) ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      micro(ctx, head, x + 24, 96, { size: 16, color: hot ? C.accent : C.tx3 });
      text(ctx, call, x + 24, 140, {
        font: MONO,
        size: 25,
        weight: 600,
        color: grey ? C.tx3 : C.tx,
      });
      text(ctx, does, x + 24, 174, { size: 21, color: C.tx2 });
      ctx.restore();
    });
    ctx.restore();
  }

  function zeroingBeat(ctx, t) {
    const a = window_(t, T.intro + 0.3, T.offsets - 0.35, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const R = { x: 60, y: 220, w: 1200, h: 600 };
    const poseBeat = t > T.pose - 0.3;
    // the true robot sits mid-field; from the pose beat on, it creeps forward
    const creep = poseBeat
      ? 1.2 * easeInOut(ramp(t, T.distance - 0.3, 2.0))
      : 0;
    const view = poseBeat
      ? { x0: -0.5, y0: -0.3, x1: 11.5, y1: 5.7 }
      : { x0: 3.2, y0: 1.4, x1: 8.8, y1: 4.2 };
    const F = drawField(ctx, R, { view });
    const th = poseBeat ? Math.PI / 2 : heading(t);
    const truth = { x: 6 + (poseBeat ? 0 : 0), y: 2.8 + creep, theta: th };
    // the pose as logged: distance since boot, so it started at (0, 0)
    const logged = poseBeat
      ? { x: 0, y: creep, theta: th }
      : { x: 6, y: 2.8, theta: th };
    const mods = swerveModules(creep > 0 && creep < 1.19 ? 1 : 0, 0, 0);
    drawSwerveRobot(ctx, F, truth, {
      modules: mods,
      label: poseBeat ? "where it is" : "",
    });
    if (poseBeat) {
      const k = easeOut(ramp(t, T.now - 0.2, 0.5));
      ctx.save();
      ctx.globalAlpha *= k;
      drawSwerveRobot(
        ctx,
        F,
        { ...logged, x: logged.x + 0.5, y: logged.y + 0.5 },
        { ghost: true, label: "Drivetrain/Pose" }
      );
      ctx.restore();
      // resetPose would move it, greyed: nothing calls it
      const kr = window_(t, T.pose + 0.2, T.now - 0.2, 0.3);
      if (kr > 0) {
        ctx.save();
        ctx.globalAlpha *= kr;
        ctx.setLineDash([8, 8]);
        const [gx, gy] = F.P(0.5, 0.5);
        const [tx, ty] = F.P(6, 2.8);
        ctx.strokeStyle = C.tx3;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(tx - 50, ty + 30);
        ctx.stroke();
        ctx.setLineDash([]);
        drawSwerveRobot(
          ctx,
          F,
          { x: 0.5, y: 0.5, theta: th },
          { ghost: true, color: C.tx3 }
        );
        text(
          ctx,
          "resetPose would move it here · nothing calls it",
          (gx + tx) / 2 + 20,
          (gy + ty) / 2 + 40,
          { font: MONO, size: 19, weight: 600, color: C.tx3 }
        );
        ctx.restore();
      }
    } else {
      // the driver's forward, drawn from the robot's centre
      const fa = forwardAt(t);
      const [cx, cy] = F.P(truth.x, truth.y);
      const len = 190;
      const lit = t > LB_AT - 0.1;
      arrow(
        ctx,
        cx,
        cy,
        cx + Math.cos(-fa) * len,
        cy + Math.sin(-fa) * len,
        lit ? C.accent : C.tx2,
        5
      );
      text(
        ctx,
        "driver forward",
        cx +
          Math.cos(-fa) * (len + 20) +
          (Math.abs(Math.cos(fa)) > 0.5 ? (Math.cos(fa) < 0 ? -10 : 10) : 12),
        cy + Math.sin(-fa) * (len + 20) + 8,
        {
          font: MONO,
          size: 22,
          weight: 600,
          align: Math.cos(fa) < -0.5 ? "right" : "left",
          color: lit ? C.accent : C.tx2,
        }
      );
      if (t > T.flips - 0.1)
        text(ctx, "red · Rotation2d.PI", cx - 210, cy + 120, {
          font: MONO,
          size: 20,
          color: C.tx2,
          a: easeOut(ramp(t, T.flips, 0.4)),
        });
    }
    // the readout and the controller
    const pr = { x: 1300, y: 600 };
    panel(ctx, { x: 1290, y: 560, w: 570, h: 130 }, C.bg2);
    drawPoseReadout(
      ctx,
      pr.x + 20,
      pr.y + 30,
      poseBeat ? logged : { x: 6, y: 2.8, theta: th },
      { title: "Drivetrain/Pose" }
    );
    const still =
      (t > T.doesnt - 0.2 && t < T.resets + 99 && !poseBeat) ||
      (t > T.either - 0.4 && !poseBeat);
    if (still)
      text(ctx, "x and y didn't move", pr.x + 20, pr.y + 106, {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.accent,
      });
    if (poseBeat && t > T.distance - 0.3)
      text(ctx, "distance since boot", pr.x + 20, pr.y + 106, {
        font: MONO,
        size: 20,
        weight: 600,
        color: C.accent,
      });
    drawController(
      ctx,
      { x: 1360, y: 250, w: 440, h: 270 },
      { lb: t > LB_AT - 0.1 && t < LB_AT + 0.8, label: false }
    );
    if (t > LB_AT - 0.1 && t < T.persp)
      text(ctx, "LB · seedFieldCentric()", 1580, 548, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.accent,
      });
    ctx.restore();
  }

  // ---- the half-degree walk ---------------------------------------------------------

  const WALK = { x: 160, y: 260, w: 1600, h: 480 };
  function offsetsBeat(ctx, t) {
    const a = window_(t, T.offsets - 0.35, gate.t0, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const d = LINE * clamp((t - T.half + 0.2) / 4.8);
    drawWalk(ctx, WALK, d, t > T.half - 0.4 ? 0.5 : 0);
    text(ctx, "the zeros came from wheels held straight by eye", 960, 200, {
      size: 32,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, T.offsets + 0.2, 0.5)),
    });
    ctx.restore();
  }

  // the scripted gate: tilt to 0.5°, then drive the line
  function scriptedGate(t) {
    const u = t - gate.t0;
    const deg = lerp(0, 0.5, easeInOut(clamp((u - 0.4) / 1.2)));
    const d = clamp((u - 2.0) * RUN_V, 0, LINE);
    return { deg, d };
  }

  // ---- recorded beats, drawn for now --------------------------------------------------

  // Camera, top down: straight edge along each side; every bevel gear faces in.
  function recEdge(ctx, t) {
    const a = beat(t, "edge", "calibrate");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const leftK = easeOut(ramp(t, T.edge + 0.6, 0.6));
    const rightOn = t > T.side - 0.6;
    const edge = {
      side: rightOn ? 1 : -1,
      k: rightOn ? easeOut(ramp(t, T.side - 0.6, 0.5)) : leftK,
    };
    const flipK = easeInOut(ramp(t, T.turn + 0.1, 0.5));
    const gearOn = t > T.bevel - 0.3;
    benchRobot(ctx, 700, 480, 520, {
      edge: gearOn ? null : edge,
      gear: [1, 1, 1, gearOn ? -1 : 1],
      flipK: gearOn ? flipK : 1,
    });
    micro(ctx, "camera · top down", 360, 150);
    const R = { x: 1160, y: 230, w: 660, h: 500 };
    panel(ctx, R, C.bg2);
    const row = (y, head, body, on, col = C.accent) => {
      micro(ctx, head, R.x + 30, y, { color: on ? col : C.tx3 });
      text(ctx, body, R.x + 30, y + 40, { size: 26, color: on ? C.tx : C.tx3 });
    };
    row(
      R.y + 60,
      "1 · straight edge",
      "flat along both wheels on a side",
      !gearOn
    );
    text(
      ctx,
      rightOn ? "then the other side" : "left side first",
      R.x + 30,
      R.y + 140,
      { font: MONO, size: 20, color: C.tx2, a: gearOn ? 0.4 : 1 }
    );
    row(
      R.y + 220,
      "2 · bevel gears",
      "every gear faces the robot's middle",
      gearOn
    );
    if (t > T.turn - 0.4) {
      text(ctx, "one faces out:", R.x + 30, R.y + 340, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.err,
      });
      text(ctx, "that module zeroes half a turn off", R.x + 30, R.y + 376, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.err,
      });
      text(
        ctx,
        flipK >= 1 ? "flip it to face in, then zero" : "",
        R.x + 30,
        R.y + 440,
        { font: MONO, size: 22, weight: 600, color: C.accent }
      );
    }
    ctx.restore();
  }

  // Tuner X Encoder Calibration ×4, Generate only TunerConstants, the offsets diff, deploy.
  function recCalibrate(ctx, t) {
    const a = beat(t, "calibrate", "steer");
    if (a <= 0) return;
    const names = ["Front Left", "Front Right", "Back Left", "Back Right"];
    const u = t - T.calib;
    const idx = clamp(Math.floor(u / 0.75), 0, 3);
    const gen = t > T.generate - 0.1;
    drawToolWindow(
      ctx,
      { x: 60, y: 90, w: 760, h: 470 },
      {
        app: "Tuner X",
        title: gen ? "Generate" : `Swerve · ${names[idx]}`,
        rows: gen
          ? [
              { label: "Project", value: "your exported project" },
              { label: "Writes", value: "TunerConstants.java" },
            ]
          : [
              { label: "Project", value: "Import Project" },
              { label: "Module", value: names[idx], hot: true },
              {
                label: "Modules calibrated",
                value: `${Math.min(4, Math.floor(u / 0.75) + 1)} / 4`,
              },
            ],
        rowH: 70,
        buttons: gen
          ? [
              {
                label: "Generate only TunerConstants",
                hot: t < T.redeploy - 0.2,
              },
            ]
          : [{ label: "Encoder Calibration", hot: true }],
        a,
      }
    );
    ctx.save();
    ctx.globalAlpha *= a;
    const R = { x: 860, y: 90, w: 1000, h: 470 };
    drawToolWindow(ctx, R, {
      app: "VS Code",
      title: "TunerConstants.java · diff",
      rows: [],
    });
    const lines = [
      ["kFrontLeftEncoderOffset", "0.15234375"],
      ["kFrontRightEncoderOffset", "-0.4873046875"],
      ["kBackLeftEncoderOffset", "-0.219482421875"],
      ["kBackRightEncoderOffset", "0.17236328125"],
    ];
    const kd = clamp((t - T.generate - 0.3) / 0.6);
    lines.forEach(([n, v], i) => {
      const y = R.y + 110 + i * 78;
      const pre = `${n} = Rotations.of(`;
      codeLine(ctx, pre, R.x + 30, y, { size: 19 });
      const vx = R.x + 30 + pre.length * 11.45;
      const sw = clamp(kd * 4 - i);
      codeLine(ctx, v + ")", vx, y, { size: 19, a: 1 - sw });
      if (sw > 0) {
        hatch(ctx, vx, y - 20, 150 * sw, 28);
        codeLine(ctx, ")", vx + 156, y, { size: 19, a: sw });
      }
      text(ctx, sw > 0.5 ? "yours" : "by eye", R.x + R.w - 30, y, {
        font: MONO,
        size: 17,
        align: "right",
        color: sw > 0.5 ? C.accent : C.tx3,
      });
    });
    text(ctx, "only these four lines change", R.x + 30, R.y + 430, {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.accent,
      a: kd,
    });
    const kp = easeOut(ramp(t, T.redeploy - 0.2, 0.4));
    if (kp > 0) {
      ctx.globalAlpha *= kp;
      rrect(ctx, 660, 640, 600, 60, 4);
      ctx.fillStyle = C.accent;
      ctx.fill();
      text(ctx, "WPILib: Deploy Robot Code", 960, 679, {
        size: 24,
        weight: 600,
        align: "center",
        color: C.accentInk,
      });
    }
    ctx.restore();
  }

  // The shipped steer gains: no gravity term, start at kS, adjust rather than zero.
  function steerBeat(ctx, t) {
    const a = beat(t, "steer", "plot");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const R = { x: 260, y: 110, w: 1400, h: 640 };
    panel(ctx, R);
    micro(
      ctx,
      "TunerConstants.java · as the generator shipped it",
      R.x + 30,
      R.y + 46
    );
    const rows = [
      ["private static final Slot0Configs steerGains =", null],
      ["    new Slot0Configs()", null],
      ["        .withKP(100)", "kP"],
      ["        .withKI(0)", null],
      ["        .withKD(0.5)", "kD"],
      ["        .withKS(0.1)", "kS"],
      ["        .withKV(1.91)", "kV"],
      ["        .withKA(0)", null],
    ];
    const hotS = t > T.staticW - 0.2;
    const shipped = t > T.shipped - 0.3;
    rows.forEach(([s, k], i) => {
      const y = R.y + 110 + i * 46;
      if (k === "kS" && hotS) {
        ctx.fillStyle = alpha(C.accent, 0.14);
        ctx.fillRect(R.x + 1, y - 30, R.w - 2, 44);
        ctx.fillStyle = C.accent;
        ctx.fillRect(R.x + 1, y - 30, 4, 44);
      }
      codeLine(ctx, s, R.x + 30, y, { size: 24 });
      if (k === "kS" && hotS)
        text(ctx, "start here", R.x + 520, y, {
          font: MONO,
          size: 22,
          weight: 600,
          color: C.accent,
        });
      if (k && shipped)
        text(ctx, "shipped · adjust, don't zero", R.x + R.w - 30, y, {
          font: MONO,
          size: 18,
          align: "right",
          color: C.tx3,
          a: easeOut(ramp(t, T.shipped - 0.3, 0.5)),
        });
    });
    // no gravity gain at all
    const kg = easeOut(ramp(t, T.gravity - 0.3, 0.5));
    if (kg > 0) {
      const y = R.y + 110 + 8 * 46 + 30;
      codeLine(ctx, "        .withKG(...)", R.x + 30, y, {
        size: 24,
        a: kg * 0.6,
      });
      ctx.strokeStyle = alpha(C.err, kg);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(R.x + 130, y - 8);
      ctx.lineTo(R.x + 130 + 230 * kg, y - 8);
      ctx.stroke();
      text(ctx, "a module steers flat: no gravity to hold up", R.x + 450, y, {
        font: MONO,
        size: 21,
        weight: 600,
        color: C.tx2,
        a: kg,
      });
    }
    ctx.restore();
  }

  // AdvantageScope: one module's commanded vs measured angle through stick flicks.
  const target = (u) => {
    // flicks: 0 → 90° → -45° → 60° → 0, each held
    const steps = [
      [0, 0],
      [0.4, 90],
      [1.6, -45],
      [2.8, 60],
      [4.0, 0],
    ];
    let v = 0;
    for (const [s, deg] of steps) if (u >= s) v = deg;
    return v;
  };
  function response(kind, n = 600, span = 5) {
    const pts = [];
    let x = 0;
    let v = 0;
    const dt = span / n;
    for (let i = 0; i <= n; i++) {
      const u = i * dt;
      const e = target(u) - x;
      // tuned: fast and settled; untuned: slow with overshoot
      const [kp, kd] = kind === "tuned" ? [900, 55] : [90, 7];
      for (let j = 0; j < 8; j++) {
        const acc = kp * (target(u) - x) - kd * v;
        v += acc * (dt / 8);
        x += v * (dt / 8);
      }
      void e;
      pts.push([u, x]);
    }
    return pts;
  }
  const untuned = response("untuned");
  const tunedPts = response("tuned");
  const targetPts = [];
  for (let i = 0; i <= 600; i++)
    targetPts.push([(i * 5) / 600, target((i * 5) / 600)]);

  function recPlot(ctx, t) {
    const a = beat(t, "plot", "close");
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    const tuned = t > T.tuned - 0.2;
    const u0 = tuned ? T.tuned - 0.2 : T.plot + 0.2;
    const u = clamp((t - u0) * (tuned ? 1.6 : 1.05), 0, 5);
    const cut = (pts) => pts.filter(([x]) => x <= u);
    const R = { x: 80, y: 90, w: 1760, h: 540 };
    micro(
      ctx,
      "AdvantageScope · line graph · front left angle",
      R.x,
      R.y - 16,
      { color: C.tx2 }
    );
    drawPlot(ctx, R, {
      title: tuned ? "tuned" : "not tuned yet",
      t0: 0,
      t1: 5,
      v0: -80,
      v1: 120,
      series: [
        { pts: cut(targetPts), color: C.tx2, dashed: true, label: "" },
        { pts: cut(tuned ? tunedPts : untuned), color: C.accent, label: "" },
      ],
      playhead: u,
    });
    text(
      ctx,
      "dashed · Drivetrain/ModuleTargets     solid · Drivetrain/ModuleStates",
      R.x + 30,
      R.y + R.h + 40,
      { font: MONO, size: 19, color: C.tx2 }
    );
    text(
      ctx,
      tuned
        ? "the two lines sit on top of each other"
        : "lags behind, overshoots",
      R.x + R.w - 30,
      R.y + 40,
      {
        font: MONO,
        size: 24,
        weight: 600,
        align: "right",
        color: tuned ? C.accent : C.tx2,
      }
    );
    drawController(
      ctx,
      { x: 1440, y: 660, w: 360, h: 220 },
      { right: { x: Math.sin(target(u) * DEG), y: 0 }, label: false }
    );
    ctx.restore();
  }

  // ---- full-screen cards ---------------------------------------------------------------

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("intro").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 5 · Swerve Calibration", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Straight Means Straight", W / 2, 560 - 30 * (1 - k), {
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
    // the same curve three runs in a row, vs a wander that changes run to run
    const box = (x, label, take, col, at, wander) => {
      const k = easeOut(ramp(t, at - 0.2, 0.6));
      ctx.save();
      ctx.globalAlpha *= k;
      panel(ctx, { x, y: 170, w: 760, h: 380 }, C.bg2);
      ctx.strokeStyle = C.tx3;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 60, 420);
      ctx.lineTo(x + 700, 420);
      ctx.stroke();
      for (let r = 0; r < 3; r++) {
        ctx.strokeStyle = alpha(col, 0.5 + 0.25 * r);
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= 64; i++) {
          const f = i / 64;
          const y = wander
            ? 420 - 40 * Math.sin(f * (3 + r) + r * 1.7) * Math.sin(f * 3.1)
            : 420 - 90 * f * f;
          i
            ? ctx.lineTo(x + 60 + 640 * f, y + r * (wander ? 0 : 2))
            : ctx.moveTo(x + 60, y);
        }
        ctx.stroke();
      }
      text(ctx, label, x + 40, 230, { font: MONO, size: 22, color: C.tx2 });
      text(ctx, take, x + 380, 520, {
        font: SERIF,
        size: 54,
        align: "center",
        color: col,
      });
      ctx.restore();
    };
    box(160, "same curve every run", "a zero", C.accent, T.close, false);
    box(1000, "comes and goes", "the gains", C.tx, T.wander, true);
    text(ctx, "Next: what the carpet says.", W / 2, 700, {
      font: SERIF,
      size: 52,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, T.wander + 1.6, 0.6)),
    });
    ctx.restore();
  }

  // ---- public ------------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    background(ctx);
    if (live) {
      drawWalk(ctx, WALK, live.d, live.deg, {
        title: "drive the line · tilt one wheel",
      });
      text(ctx, "one module's zero, a little off", 960, 200, {
        size: 30,
        align: "center",
        color: C.tx2,
      });
      vignette(ctx);
      return;
    }
    ctx.save();
    applyCamera(ctx, FULL);
    cardsRow(ctx, t);
    zeroingBeat(ctx, t);
    offsetsBeat(ctx, t);
    if (t >= gate.t0 && t < gate.t1) {
      const g = scriptedGate(t);
      drawWalk(ctx, WALK, g.d, g.deg, {
        title: "drive the line · tilt one wheel",
      });
    }
    recEdge(ctx, t);
    recCalibrate(ctx, t);
    steerBeat(ctx, t);
    recPlot(ctx, t);
    ctx.restore();
    vignette(ctx);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const s = {
      time: gate.t0,
      deg: 0,
      d: 0,
      driving: false,
      runs: 0,
      tilted: false,
    };
    let doneAt = null;
    return {
      state: s,
      prompt() {
        if (doneAt != null)
          return `${Math.abs(drift(LINE, s.deg) * 100).toFixed(1)} cm off, from ${Math.abs(s.deg).toFixed(1)}°.`;
        if (Math.abs(s.deg) < 0.05) return "Tilt the wheel with the slider.";
        if (s.d <= 0) return "Hold Space to drive the line.";
        return "Keep holding. Watch it walk.";
      },
      input(k, v) {
        if (k === "tilt") {
          s.deg = v;
          if (s.d >= LINE) s.d = 0;
        }
        if (k === "drive") {
          s.driving = v;
          if (v && s.d >= LINE) s.d = 0;
        }
      },
      step(dt) {
        s.time += dt;
        if (s.driving && s.d < LINE) s.d = Math.min(LINE, s.d + RUN_V * dt);
        if (doneAt == null && s.d >= LINE && Math.abs(s.deg) >= 0.2)
          doneAt = s.time;
        return doneAt != null && s.time - doneAt > 2.0;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    if (u < 1.8) return "Tilt one wheel half a degree.";
    if (u < 2.0 + LINE / RUN_V) return "Drive it down the line.";
    return "Half a degree: 5 cm off over 6 m.";
  }

  const gateControls = [
    {
      k: "tilt",
      label: "Wheel tilt (°)",
      kind: "range",
      min: -1,
      max: 1,
      step: 0.1,
      value: 0,
    },
    { k: "drive", label: "Drive", key: "Space", kind: "hold" },
  ];

  return { draw, gate, liveGate, gatePromptAt, gateControls };
}
