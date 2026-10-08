// Blending, Not Replacing. The camera's sightings folded into the pose, a little at a time.
//
// What is simulated, and how:
//   the world    a robot facing a tag on the blue wall. The estimate (ghost) follows odometry;
//                a push scrubs the wheels, so odometry sees only part of it. Camera frames
//                arrive on their own uneven clock (40 to 70 ms apart, from a hash, so every
//                run is the same). Each frame is gated (rejection flags, 4 m) and weighed by
//                the page's formula, xyStdDev = 0.333 * d^1.2 / tags^2; the estimate moves
//                toward it by a fraction that falls with that standard deviation. That
//                fraction stands in for the estimator's Kalman gain.
//   the code     the page's Vision class (LimelightLib 2, class Vision), reflowed to fit.
// The live gate steps the same world; the scripted gate is one precomputed run of it.

import {
  C,
  MONO,
  SANS,
  SERIF,
  W,
  H,
  alpha,
  background,
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
  drawPlot,
  drawPoseReadout,
  drawSwerveRobot,
  drawToolWindow,
  panel,
  swerveModules,
} from "../../engine/kit.js";

const TAU = Math.PI * 2;
const hash = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const gauss = (i) => (hash(i) + hash(i + 0.37) + hash(i + 0.71) - 1.5) * 1.2;

// ---- layout ------------------------------------------------------------------------

const FIELD = { x: 50, y: 90, w: 930, h: 740 };
const VIEW = { x0: -0.2, y0: 2.0, x1: 5.0, y1: 7.0 };
const CODE = { x: 1010, y: 90, w: 870 };
const TAG = { x: 0.0, y: 5.0, id: 7 };
const Y0 = 4.0;

// ---- the world -------------------------------------------------------------------------

const sigmaFor = (d, n) => (0.333 * Math.pow(d, 1.2)) / (n * n);
const gainFor = (s) => clamp(0.15 * (0.19 / s) ** 2, 0.004, 0.3);

function newWorld(d = 2.0, tags = 2) {
  return {
    u: 0,
    d,
    tags,
    tx: d,
    ty: Y0,
    ex: d,
    ey: Y0,
    covered: false,
    push: 0,
    n: 0,
    next: 0.05,
    frames: [],
  };
}

function stepWorld(w, dt) {
  w.u += dt;
  // a push: one meter sideways over 0.8 s; the scrubbing wheels report only some of it
  if (w.push > 0) {
    const v = 1.25;
    const m = Math.min(w.push, v * dt);
    w.push -= m;
    w.ty += m;
    w.ey += 0.25 * m;
  }
  while (w.u >= w.next) {
    w.n += 1;
    w.next += 0.04 + 0.03 * hash(w.n * 1.31);
    if (w.covered) continue;
    const s = sigmaFor(w.d, w.tags);
    const sx = w.tx + 0.04 * gauss(w.n * 3.7) * Math.min(1, w.d / 2);
    const sy = w.ty + 0.04 * gauss(w.n * 5.3) * Math.min(1, w.d / 2);
    const far = w.d > 4.0;
    w.frames.push({
      u: w.u,
      x: sx,
      y: sy,
      s,
      rejected: far,
      reason: far ? "too far" : "",
    });
    if (!far) {
      const g = gainFor(s);
      w.ex += g * (sx - w.ex);
      w.ey += g * (sy - w.ey);
    }
  }
  w.frames = w.frames.filter((f) => w.u - f.u < 1.0);
}

const snap = (w) => ({
  u: w.u,
  d: w.d,
  tags: w.tags,
  tx: w.tx,
  ty: w.ty,
  ex: w.ex,
  ey: w.ey,
  covered: w.covered,
  frames: w.frames.map((f) => ({ ...f })),
});

// scripted runs: a list of [u, fn(world)] events
function simulate(events, dur, d = 2.0, tags = 2) {
  const w = newWorld(d, tags);
  const out = [];
  const ev = [...events].sort((a, b) => a[0] - b[0]);
  const SR = 60;
  for (let i = 0; i <= dur * SR; i++) {
    while (ev.length && ev[0][0] <= w.u + 1e-9) ev.shift()[1](w);
    out.push(snap(w));
    for (let k = 0; k < 4; k++) stepWorld(w, 1 / (SR * 4));
  }
  return { out, at: (u) => out[clamp(Math.floor(u * SR), 0, out.length - 1)] };
}

// ---- the code, per beat ----------------------------------------------------------------

const SNIP = {
  solvers: [
    "PoseEstimate estimate =",
    "    camera.getPoseEstimate(frame, PoseEstimateType.MT1_WPIBLUE);",
    "if (estimate.fieldedTagCount < MIN_TAGS_FOR_MEGATAG1) {",
    "  estimate =",
    "      camera.getPoseEstimate(frame, PoseEstimateType.MT2_WPIBLUE);",
    "}",
  ],
  heading: [
    "public static void registerAll(",
    "    DriveMechanism drivetrain, String... cameraNames) {",
    "  Scheduler.getDefault()",
    "      .addPeriodic(",
    "          () ->",
    "              Limelight.setSharedRobotOrientation(",
    "                  drivetrain.getPose().getRotation().getDegrees()));",
    "",
    "  for (String name : cameraNames) {",
    "    Vision vision = new Vision(name, drivetrain);",
    "    Scheduler.getDefault().addPeriodic(() -> vision.update());",
    "  }",
    "}",
  ],
  queue: [
    "for (LimelightResults frame : camera.readResultsQueue()) {",
    "  ...",
    "}",
  ],
  gates: [
    "if (estimate.rejectionFlags != 0",
    "    || estimate.avgTagDistanceMeters > MAX_TAG_DISTANCE_METERS) {",
    "  continue;",
    "}",
  ],
  trust: [
    "double distanceFactor =",
    "    Math.pow(estimate.avgTagDistanceMeters, 1.2);",
    "double tagFactor =",
    "    estimate.fieldedTagCount * estimate.fieldedTagCount;",
    "double xyStdDev =",
    "    XY_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;",
    "double headingStdDev =",
    "    estimate.isMT2()",
    "        ? IGNORE_VISION_HEADING",
    "        : ROTATION_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;",
  ],
  rewind: [
    "drivetrain.addVisionMeasurement(",
    "    estimate.pose,",
    "    estimate.timestampSeconds,",
    "    VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev));",
  ],
};
const SNIP_TITLE = {
  solvers: "Vision.update() · pick the solver",
  heading: "Vision.registerAll · heading first, every loop",
  queue: "Vision.update() · every frame since last time",
  gates: "Vision.update() · throw some out",
  trust: "Vision.update() · weigh the rest",
  rewind: "Vision.update() · when the picture was taken",
};

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  // the scripted gate: cover, push a meter, uncover
  const gCover = 0.5;
  const gPush = 1.1;
  const gUncover = 3.0;
  const GATE = simulate(
    [
      [gCover, (w) => (w.covered = true)],
      [gPush, (w) => (w.push = 1.0)],
      [gUncover, (w) => (w.covered = false)],
    ],
    gate.t1 - gate.t0 + 0.5
  );
  // walk: the same walk home twice, a good sighting and a poor one
  const walkRun = (d, tags) =>
    simulate(
      [
        [0, (w) => (w.covered = true)],
        [0.05, (w) => (w.push = 1.0)],
        [1.2, (w) => (w.covered = false)],
      ],
      7,
      d,
      tags
    );
  const GOOD = walkRun(2.0, 2);
  const POOR = walkRun(3.0, 1);

  // which code snippet is up at time t
  const snipBeats = ["solvers", "heading", "queue", "gates", "trust", "rewind"];
  const beatOf = (t) => {
    for (let i = snipBeats.length - 1; i >= 0; i--)
      if (t >= L(snipBeats[i]).t0 - 0.3) return snipBeats[i];
    return null;
  };

  // ---- pieces --------------------------------------------------------------------

  function cone(ctx, F, s, covered) {
    const [rx, ry] = F.P(s.tx, s.ty);
    const [tx, ty] = F.P(TAG.x, TAG.y);
    const ang = Math.atan2(ty - ry, tx - rx);
    const len = Math.hypot(tx - rx, ty - ry) + 40;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(ang);
    ctx.fillStyle = covered ? alpha(C.err, 0.08) : alpha(C.accent, 0.08);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, -len * 0.38);
    ctx.lineTo(len, len * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (covered)
      text(ctx, "camera covered", rx, ry + 70, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: C.err,
      });
  }

  function tagMark(ctx, F) {
    const x = F.X(TAG.x);
    const y = F.Y(TAG.y);
    ctx.fillStyle = C.tx;
    ctx.fillRect(x - 6, y - 18, 12, 36);
    text(ctx, `tag ${TAG.id}`, x + 16, y - 24, {
      font: MONO,
      size: 18,
      weight: 600,
      color: C.tx2,
    });
  }

  // the field: truth, estimate, sightings
  function drawWorld(
    ctx,
    s,
    { circles = true, listen = true, label = "" } = {}
  ) {
    micro(
      ctx,
      label || "the robot · and its estimated pose",
      FIELD.x,
      FIELD.y - 20,
      { size: 17 }
    );
    const F = drawField(ctx, FIELD, { view: VIEW, axes: false, labels: false });
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    tagMark(ctx, F);
    cone(ctx, F, s, s.covered);
    const th = Math.atan2(TAG.y - s.ty, TAG.x - s.tx);
    drawSwerveRobot(
      ctx,
      F,
      { x: s.ex, y: s.ey, theta: th },
      { ghost: true, label: listen ? "estimate" : "estimate · not listening" }
    );
    drawSwerveRobot(
      ctx,
      F,
      { x: s.tx, y: s.ty, theta: th },
      { modules: swerveModules(0, 0, 0) }
    );
    for (const f of s.frames) {
      const k = clamp(1 - (s.u - f.u) / 1.0);
      const [x, y] = F.P(f.x, f.y);
      if (circles && !f.rejected) {
        ctx.beginPath();
        ctx.arc(x, y, Math.min(f.s * F.s, 400), 0, TAU);
        ctx.strokeStyle = alpha(C.tx2, 0.35 * k);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, TAU);
      ctx.fillStyle = f.rejected ? alpha(C.tx3, 0.6 * k) : alpha(C.tx, 0.9 * k);
      ctx.fill();
      if (f.rejected && s.u - f.u < 0.5)
        text(ctx, f.reason, x + 12, y - 12, {
          font: MONO,
          size: 17,
          color: C.tx3,
        });
    }
    ctx.restore();
    const err = Math.hypot(s.ex - s.tx, s.ey - s.ty);
    drawPoseReadout(
      ctx,
      FIELD.x,
      FIELD.y + FIELD.h + 44,
      { x: s.ex, y: s.ey, theta: th },
      { title: "Drivetrain/Pose · estimate" }
    );
    text(
      ctx,
      `${(err * 100).toFixed(0)} cm off`,
      FIELD.x + FIELD.w,
      FIELD.y + FIELD.h + 76,
      {
        font: MONO,
        size: 24,
        weight: 600,
        align: "right",
        color: err > 0.05 ? C.accent : C.ok,
      }
    );
    return F;
  }

  function snippet(ctx, which, t, lit = () => 0) {
    const lines = SNIP[which];
    const lh = 30;
    const R = { x: CODE.x, y: CODE.y, w: CODE.w, h: 70 + lines.length * lh };
    panel(ctx, R);
    micro(ctx, SNIP_TITLE[which], R.x + 24, R.y + 38, { size: 16 });
    lines.forEach((s, i) => {
      const y = R.y + 74 + i * lh;
      const k = lit(i);
      if (k > 0) {
        ctx.fillStyle = alpha(C.accent, 0.14 * k);
        ctx.fillRect(R.x + 8, y - 22, R.w - 16, lh);
        ctx.fillStyle = alpha(C.accent, k);
        ctx.fillRect(R.x + 8, y - 22, 4, lh);
      }
      codeLine(ctx, s, R.x + 24, y, { size: 20 });
    });
    return R.y + R.h;
  }

  // a steady world for the concept beats: the robot on its mark, the estimate already home
  const STILL = simulate([], 40, 2.0, 2);
  const stillAt = (t, base) => {
    const s = STILL.at(clamp(t - base, 0, 39));
    return s;
  };

  // ---- beats ----------------------------------------------------------------------

  // intro: sightings arrive, and the estimate ignores them
  function beatIntro(ctx, t) {
    const a = window_(t, L("intro").t0 - 0.6, L("install").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const s = {
      ...stillAt(t, L("intro").t0 - 2),
      ex: 2.0 + 0.45,
      ey: Y0 - 0.3,
    };
    drawWorld(ctx, s, { circles: false, listen: false });
    const R = { x: CODE.x, y: CODE.y, w: CODE.w, h: 300 };
    panel(ctx, R, C.bg2);
    micro(ctx, "from the last lesson", R.x + 28, R.y + 44);
    text(ctx, 'camera name · "limelight"', R.x + 28, R.y + 100, {
      font: MONO,
      size: 26,
      weight: 600,
      color: C.accent,
    });
    text(ctx, "it sees tag 7 and solves a pose", R.x + 28, R.y + 150, {
      font: SANS,
      size: 24,
      color: C.tx2,
    });
    text(ctx, "the estimate doesn't move yet", R.x + 28, R.y + 196, {
      font: SANS,
      size: 24,
      color: C.tx,
      a: ramp(t, Wd("intro", "listen.") - 0.3, 0.4),
    });
    ctx.restore();
  }

  // REC: the vendordep, installed from its URL.
  function recInstall(ctx, t) {
    const a = window_(t, L("install").t0 - 0.3, L("solvers").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    const paste = ramp(t, Wd("install", "vendor") - 0.2, 0.3);
    const done = ramp(t, Wd("install", "address") - 0.2, 0.3);
    drawToolWindow(
      ctx,
      { x: 160, y: 150, w: 1600, h: 470 },
      {
        app: "VS Code",
        title: "WPILib Vendor Dependencies",
        rowH: 70,
        rows: [
          {
            label: "INSTALL FROM URL",
            value: null,
            hot: paste > 0.5 && done < 0.5,
          },
          {
            label: "",
            value:
              paste > 0.5
                ? "https://limelightvision.github.io/limelightlib-public/LimelightLib-alpha7.json"
                : "",
            hot: paste > 0.5 && done < 0.5,
          },
          {
            label: "INSTALLED DEPENDENCIES",
            value: done > 0.5 ? "LimelightLib 2.0.0-beta9-alpha7" : "",
            hot: done > 0.5,
          },
        ],
        buttons: [{ label: "Install", hot: paste > 0.5 && done < 0.5 }],
      }
    );
    const k = ramp(t, Wd("install", "pinned") - 0.2, 0.4);
    text(
      ctx,
      "LimelightLib-alpha7.json · pinned to the WPILib alpha · copy it exactly",
      W / 2,
      700,
      {
        font: MONO,
        size: 26,
        weight: 600,
        align: "center",
        color: C.accent,
        a: k,
      }
    );
    text(
      ctx,
      "then build once, and delete any old LimelightHelpers.java",
      W / 2,
      750,
      { font: SANS, size: 24, align: "center", color: C.tx2, a: k }
    );
    ctx.restore();
  }

  // the concept beats share one frame: the world on the left, the code and a picture on the right
  function beatConcepts(ctx, t) {
    const a = window_(t, L("solvers").t0 - 0.4, L("tryit").t0 - 0.1, 0.4);
    if (a <= 0) return;
    const which = beatOf(t);
    if (!which) return;
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    if (which === "rewind") drawRewindField(ctx, t);
    else
      drawWorld(ctx, gatedWorld(t, which), {
        circles: which === "trust" || which === "gates",
      });
    const k = easeOut(ramp(t, L(which).t0 - 0.3, 0.4));
    ctx.globalAlpha = a * k;
    const lit = litFor(which, t);
    const bottom = snippet(ctx, which, t, lit);
    const R = { x: CODE.x, y: bottom + 24, w: CODE.w, h: 830 - bottom - 24 };
    if (which === "solvers") picSolvers(ctx, R, t);
    if (which === "heading") picHeading(ctx, R, t);
    if (which === "queue")
      picQueue(ctx, { x: CODE.x, y: bottom + 24, w: CODE.w, h: 560 }, t);
    if (which === "gates") picGates(ctx, R, t);
    if (which === "trust") picTrust(ctx, R, t);
    if (which === "rewind") picRewind(ctx, R, t);
    ctx.restore();
  }

  function litFor(which, t) {
    if (which === "solvers") {
      const mt2 = t >= Wd("solvers", "borrows") - 0.2;
      return (i) =>
        mt2
          ? i >= 2 && i <= 4
            ? 1
            : 0
          : t >= Wd("solvers", "one") - 0.2 && i <= 1
            ? 1
            : 0;
    }
    if (which === "heading") return (i) => (i >= 2 && i <= 6 ? 1 : 0);
    if (which === "queue")
      return (i) => (i === 0 && t >= Wd("queue", "reading") - 0.2 ? 1 : 0);
    if (which === "gates")
      return (i) =>
        t >= Wd("gates", "flags,") - 0.3 && i === 0
          ? 1
          : t >= Wd("gates", "four") - 0.3 && i === 1
            ? 1
            : 0;
    if (which === "trust") {
      if (t >= Wd("trust", "second") - 0.3)
        return (i) => (i === 2 || i === 3 ? 1 : 0);
      if (t >= Wd("trust", "far") - 0.3) return (i) => (i <= 1 ? 1 : 0);
      return () => 0;
    }
    if (which === "rewind") return (i) => (i === 2 ? 1 : 0);
    return () => 0;
  }

  // the world during the concept beats: the robot home, sightings flowing; gates shows a far run
  function gatedWorld(t, which) {
    const s = stillAt(t, L("solvers").t0 - 1);
    if (which !== "gates") return s;
    // the far half of the gates beat: back the robot off past 4 m
    const far = ramp(t, Wd("gates", "four") - 0.6, 0.8);
    if (far <= 0) return withFlagged(s, t);
    const d = lerp(2.0, 4.5, easeInOut(far));
    return {
      ...s,
      tx: d,
      ex: d + 0.02,
      frames: s.frames.map((f) => ({
        ...f,
        x: f.x + (d - 2.0),
        rejected: d > 4.0,
        reason: "too far",
      })),
    };
  }
  // one frame in five carries a library flag
  function withFlagged(s, t) {
    if (t < Wd("gates", "flags,") - 0.3) return s;
    return {
      ...s,
      frames: s.frames.map((f, i) =>
        Math.round(f.u * 100) % 5 === 0
          ? {
              ...f,
              rejected: true,
              reason: "flagged",
              x: f.x + 0.35,
              y: f.y - 0.25,
            }
          : f
      ),
    };
  }

  function card(ctx, x, y, w, h, on) {
    rrect(ctx, x, y, w, h, 5);
    ctx.fillStyle = on ? alpha(C.accent, 0.12) : C.bg2;
    ctx.fill();
    ctx.strokeStyle = on ? C.accent : C.rule;
    ctx.lineWidth = on ? 2.5 : 1.5;
    ctx.stroke();
  }

  // MT1 solves heading from the tags (shaky on one); MT2 borrows the gyro
  function picSolvers(ctx, R, t) {
    const w2 = (R.w - 20) / 2;
    const mt2 = t >= Wd("solvers", "borrows") - 0.2;
    const one = t >= Wd("solvers", "trust") - 0.3;
    card(ctx, R.x, R.y, w2, 330, !mt2);
    card(ctx, R.x + w2 + 20, R.y, w2, 330, mt2);
    micro(ctx, "MegaTag1", R.x + 22, R.y + 38, {
      size: 17,
      color: !mt2 ? C.accent : C.tx3,
    });
    micro(ctx, "MegaTag2", R.x + w2 + 42, R.y + 38, {
      size: 17,
      color: mt2 ? C.accent : C.tx3,
    });
    text(ctx, "heading from the tags", R.x + 22, R.y + 74, {
      font: SANS,
      size: 21,
      color: C.tx2,
    });
    text(ctx, "heading from the robot", R.x + w2 + 42, R.y + 74, {
      font: SANS,
      size: 21,
      color: C.tx2,
    });
    // one tag: MT1's heading wobbles, MT2's holds
    const robot = (cx, cy, th, ghost) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-th);
      ctx.strokeStyle = ghost ? C.accent : C.tx2;
      ctx.lineWidth = 2.5;
      ctx.setLineDash(ghost ? [7, 5] : []);
      ctx.strokeRect(-36, -36, 72, 72);
      ctx.setLineDash([]);
      ctx.fillStyle = C.accent;
      ctx.fillRect(30, -20, 6, 40);
      ctx.restore();
    };
    const wob = 0.32 * Math.sin(t * 5.3) + 0.12 * Math.sin(t * 11.1);
    robot(R.x + w2 / 2, R.y + 200, Math.PI * 0.95 + wob, true);
    robot(R.x + w2 + 20 + w2 / 2, R.y + 200, Math.PI * 0.95, true);
    text(ctx, "one tag: the heading swings", R.x + 22, R.y + 300, {
      font: MONO,
      size: 18,
      color: C.err,
    });
    text(ctx, "gyro heading in", R.x + w2 + 42, R.y + 300, {
      font: MONO,
      size: 18,
      color: C.accent,
    });
    if (one)
      text(ctx, "one tag in view → trust MegaTag2", R.x, R.y + 380, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.accent,
      });
  }

  // the shared heading: written once, read by every camera
  function picHeading(ctx, R, t) {
    const k = ramp(t, Wd("heading", "first.") - 0.4, 0.4);
    const boxes = [
      ["gyro heading", R.x, C.tx],
      ["shared orientation", R.x + 300, C.accent],
      ["each camera", R.x + 600, C.tx],
    ];
    boxes.forEach(([l, x, c]) => {
      card(ctx, x, R.y + 20, 260, 90, c === C.accent);
      text(ctx, l, x + 130, R.y + 74, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "center",
        color: c,
      });
    });
    ctx.fillStyle = C.accent;
    for (const x of [R.x + 262, R.x + 562]) {
      ctx.fillRect(x, R.y + 63, 34, 4);
      ctx.beginPath();
      ctx.moveTo(x + 38, R.y + 65);
      ctx.lineTo(x + 26, R.y + 57);
      ctx.lineTo(x + 26, R.y + 73);
      ctx.fill();
    }
    text(ctx, "every loop, before any camera is read", R.x, R.y + 160, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.accent,
      a: k,
    });
    text(
      ctx,
      'Robot(): Vision.registerAll(drivetrain, "limelight");',
      R.x,
      R.y + 210,
      { font: MONO, size: 19, color: C.tx2, a: k }
    );
  }

  // two clocks: even robot loops, uneven camera frames; the queue takes exactly what arrived
  const FRAMES = (() => {
    const f = [];
    let u = 0.013;
    for (let i = 0; u < 0.4; i++) {
      f.push(u);
      u += 0.022 + 0.03 * hash(i * 2.9 + 1);
    }
    return f;
  })();
  function picQueue(ctx, R, t) {
    const span = 0.4;
    const u =
      clamp(
        (t - L("queue").t0 - 0.3) / (L("queue").t1 - L("queue").t0 - 0.5),
        0,
        1
      ) * span;
    const x0 = R.x + 200;
    const x1 = R.x + R.w - 20;
    const X = (v) => x0 + (v / span) * (x1 - x0);
    const rows = {
      loop: R.y + 40,
      cam: R.y + 110,
      latest: R.y + 200,
      queue: R.y + 270,
    };
    text(ctx, "robot loops", R.x, rows.loop + 6, {
      font: MONO,
      size: 18,
      color: C.tx2,
    });
    text(ctx, "camera frames", R.x, rows.cam + 6, {
      font: MONO,
      size: 18,
      color: C.tx2,
    });
    text(ctx, "read latest", R.x, rows.latest + 6, {
      font: MONO,
      size: 18,
      color: C.err,
    });
    text(ctx, "read queue", R.x, rows.queue + 6, {
      font: MONO,
      size: 18,
      color: C.accent,
    });
    let prev = 0;
    for (let v = 0.02; v <= span + 1e-9; v += 0.02) {
      const x = X(v);
      const on = v <= u;
      ctx.fillStyle = on ? C.tx : alpha(C.tx3, 0.4);
      ctx.fillRect(x - 1, rows.loop - 14, 2, 28);
      if (on) {
        const n = FRAMES.filter((f) => f > prev && f <= v).length;
        // latest: one value every loop, whatever arrived
        text(
          ctx,
          n === 0 ? "dup" : n > 1 ? `${n - 1} lost` : "1",
          x - 10,
          rows.latest + 6,
          {
            font: MONO,
            size: 15,
            weight: 600,
            align: "center",
            color: n === 1 ? C.tx2 : C.err,
          }
        );
        text(ctx, String(n), x - 10, rows.queue + 6, {
          font: MONO,
          size: 17,
          weight: 600,
          align: "center",
          color: C.accent,
        });
      }
      prev = v;
    }
    for (const f of FRAMES) {
      ctx.beginPath();
      ctx.arc(X(f), rows.cam, 7, 0, TAU);
      ctx.fillStyle = f <= u ? C.tx : alpha(C.tx3, 0.4);
      ctx.fill();
    }
    text(ctx, "no frame skipped, none fused twice", R.x, rows.queue + 70, {
      font: SANS,
      size: 22,
      color: C.tx,
      a: ramp(t, Wd("queue", "exactly") - 0.3, 0.4),
    });
  }

  function picGates(ctx, R, t) {
    const k1 = ramp(t, Wd("gates", "flags,") - 0.3, 0.3);
    const k2 = ramp(t, Wd("gates", "four") - 0.3, 0.3);
    card(ctx, R.x, R.y, R.w, 100, k1 > 0.5 && k2 < 0.5);
    text(ctx, "rejectionFlags != 0", R.x + 24, R.y + 44, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.tx,
      a: 0.4 + 0.6 * k1,
    });
    text(
      ctx,
      "the library's own verdict: grey, thrown out",
      R.x + 24,
      R.y + 80,
      { font: SANS, size: 20, color: C.tx2, a: k1 }
    );
    card(ctx, R.x, R.y + 120, R.w, 100, k2 > 0.5);
    text(ctx, "avgTagDistanceMeters > 4.0", R.x + 24, R.y + 164, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.tx,
      a: 0.4 + 0.6 * k2,
    });
    text(ctx, "past four meters: every frame grey", R.x + 24, R.y + 200, {
      font: SANS,
      size: 20,
      color: C.tx2,
      a: k2,
    });
  }

  function picTrust(ctx, R, t) {
    const far = ramp(t, Wd("trust", "far") - 0.3, 1.6);
    const two = ramp(t, Wd("trust", "second") - 0.3, 0.8);
    const d = lerp(1.2, 3.0, easeInOut(far));
    const s1 = sigmaFor(d, 1);
    const s2 = sigmaFor(d, 2);
    const sc = 85;
    const cy = R.y + 190;
    const box = (x, label, s, on) => {
      ctx.beginPath();
      ctx.arc(x, cy, s * sc, 0, TAU);
      ctx.strokeStyle = on ? C.accent : C.tx2;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, cy, 6, 0, TAU);
      ctx.fillStyle = C.tx;
      ctx.fill();
      text(ctx, label, x, R.y + 30, {
        font: MONO,
        size: 19,
        weight: 600,
        align: "center",
        color: on ? C.accent : C.tx2,
      });
      text(ctx, `±${s.toFixed(2)} m`, x, R.y + 62, {
        font: MONO,
        size: 21,
        weight: 600,
        align: "center",
        color: on ? C.accent : C.tx,
      });
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(R.x, R.y, R.w, R.h);
    ctx.clip();
    box(R.x + R.w * 0.3, `one tag · ${d.toFixed(1)} m`, s1, two < 0.5);
    ctx.globalAlpha *= two;
    box(R.x + R.w * 0.75, `two tags · ${d.toFixed(1)} m`, s2, true);
    ctx.restore();
    if (two > 0.5)
      text(
        ctx,
        "a quarter: tagFactor is the count squared",
        R.x,
        R.y + R.h - 20,
        { font: MONO, size: 20, weight: 600, color: C.accent }
      );
  }

  // the rewind: a sighting taken a moment ago is folded in at that moment
  const RW = { y0: 2.8, v: 0.55, lag: 0.45, bias: 0.35 };
  function rewindPhase(t) {
    const t0 = L("rewind").t0;
    const tArr = Wd("rewind", "moment") - 0.2;
    const tBack = Wd("rewind", "rewinds") - 0.1;
    const tFold = Wd("rewind", "folds") - 0.1;
    const tPlay = Wd("rewind", "replays") - 0.1;
    return { t0, tArr, tBack, tFold, tPlay, u: t - t0 };
  }
  function drawRewindField(ctx, t) {
    const P = rewindPhase(t);
    const F = drawField(ctx, FIELD, { view: VIEW, axes: false, labels: false });
    micro(
      ctx,
      "the robot · moving while the camera works",
      FIELD.x,
      FIELD.y - 20,
      { size: 17 }
    );
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    tagMark(ctx, F);
    // robot drives up the field slowly; robot time stops advancing while we rewind
    const live =
      Math.min(t, P.tArr) - P.t0 + Math.max(0, t - P.tPlay - 1.2) * 0.4;
    const uNow = clamp(live, 0, 8);
    const truthAt = (u) => ({ x: 2.0, y: RW.y0 + RW.v * u });
    const fixed = t >= P.tFold;
    const uShot = uNow - RW.lag;
    // the estimate trail: off by a bias until the fold, corrected from the shot onward after it
    const replay = fixed ? clamp((t - P.tPlay) / 1.0, 0, 1) : 0;
    const estAt = (u) => {
      const tr = truthAt(u);
      const corrected =
        fixed && u >= uShot && u <= uShot + replay * RW.lag + 1e-6;
      const k = corrected ? 0.4 : 0;
      return { x: tr.x + RW.bias * (1 - k), y: tr.y };
    };
    ctx.strokeStyle = alpha(C.accent, 0.6);
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    for (let u = 0; u <= uNow; u += 0.02) {
      const e = estAt(u);
      u === 0 ? ctx.moveTo(...F.P(e.x, e.y)) : ctx.lineTo(...F.P(e.x, e.y));
    }
    ctx.stroke();
    ctx.setLineDash([]);
    // the rewind marker walks back along the trail, then forward again
    if (t >= P.tArr) {
      const back = easeInOut(ramp(t, P.tBack, 0.8));
      const fwd = replay;
      const um = uNow - RW.lag * back + RW.lag * fwd;
      const e = estAt(um);
      const [mx, my] = F.P(e.x, e.y);
      ctx.beginPath();
      ctx.arc(mx, my, 14, 0, TAU);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.stroke();
      // the sighting, drawn where the robot was when the picture was taken
      const sh = truthAt(uShot);
      const [sx, sy] = F.P(sh.x + 0.02, sh.y);
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, TAU);
      ctx.fillStyle = C.tx;
      ctx.fill();
      text(ctx, `picture taken ${RW.lag.toFixed(2)} s ago`, sx - 30, sy + 6, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "right",
        color: C.tx,
      });
    }
    const tr = truthAt(uNow);
    const e = estAt(uNow);
    const done = fixed && replay >= 1;
    drawSwerveRobot(
      ctx,
      F,
      { x: done ? tr.x + RW.bias * 0.6 : e.x, y: e.y, theta: Math.PI / 2 },
      { ghost: true, label: "estimate" }
    );
    drawSwerveRobot(
      ctx,
      F,
      { x: tr.x, y: tr.y, theta: Math.PI / 2 },
      {
        modules: swerveModules(
          t < P.tArr || t > P.tPlay + 1.2 ? RW.v : 0,
          0,
          0
        ),
        maxSpeed: 1.2,
      }
    );
    ctx.restore();
  }
  function picRewind(ctx, R, t) {
    const P = rewindPhase(t);
    const steps = [
      ["rewind to the moment it was taken", P.tBack],
      ["fold the sighting in there", P.tFold],
      ["replay forward to now", P.tPlay],
    ];
    steps.forEach(([l, ts], i) => {
      const on = t >= ts;
      const cur = on && (i === 2 || t < steps[i + 1][1]);
      card(ctx, R.x, R.y + i * 92, R.w, 76, cur);
      text(ctx, `${i + 1}`, R.x + 30, R.y + i * 92 + 48, {
        font: MONO,
        size: 24,
        weight: 600,
        color: on ? C.accent : C.tx3,
      });
      text(ctx, l, R.x + 70, R.y + i * 92 + 48, {
        font: SANS,
        size: 24,
        color: on ? C.tx : C.tx3,
      });
    });
  }

  // after the gate: the walk home, a good sighting against a poor one
  function beatWalk(ctx, t) {
    const a = window_(t, L("walk").t0 - 0.3, L("close").t0 + 0.4, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    const u = clamp(0.9 + (t - L("walk").t0) * 0.55, 0, 6.8);
    drawWorld(ctx, GOOD.at(u), {
      label: "covered, pushed, uncovered · two tags at 2 m",
    });
    const P = { x: CODE.x, y: CODE.y, w: CODE.w, h: 470 };
    const pts = (run) =>
      run.out
        .filter((_, i) => i % 3 === 0)
        .map((s) => [s.u, Math.hypot(s.ex - s.tx, s.ey - s.ty)])
        .filter(([v]) => v <= u);
    drawPlot(ctx, P, {
      title: "how far off the estimate is · meters",
      t0: 0,
      t1: 7,
      v0: 0,
      v1: 1.0,
      series: [
        {
          pts: pts(POOR),
          color: C.tx2,
          dashed: true,
          label: u > 2.4 ? "one tag · 3 m" : "",
        },
        { pts: pts(GOOD), label: u > 2.4 ? "two tags · 2 m" : "" },
      ],
      playhead: u,
    });
    text(ctx, "uncovered at 1.2 s · no jump, a walk", P.x, P.y + P.h + 50, {
      font: MONO,
      size: 22,
      weight: 600,
      color: C.accent,
    });
    text(
      ctx,
      "about a second with a good sighting, longer with a poor one",
      P.x,
      P.y + P.h + 90,
      {
        font: SANS,
        size: 22,
        color: C.tx2,
        a: ramp(t, Wd("walk", "faster") - 0.3, 0.4),
      }
    );
    ctx.restore();
  }

  // ---- cards ----------------------------------------------------------------------

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("intro").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 6 · Vision", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Blending, Not Replacing", W / 2, 560 - 30 * (1 - k), {
      font: SERIF,
      size: 116,
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
    text(ctx, "Blend the camera into the pose.", W / 2, 440, {
      font: SERIF,
      size: 80,
      align: "center",
    });
    text(ctx, "Don't replace the pose with the camera.", W / 2, 560, {
      font: SERIF,
      size: 72,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "don't") - 0.1, 0.5)),
    });
    ctx.restore();
  }

  // ---- the gate ------------------------------------------------------------------------

  function drawGateFrame(ctx, s, extra) {
    drawWorld(ctx, s, {});
    const R = { x: CODE.x, y: CODE.y, w: CODE.w, h: 420 };
    panel(ctx, R, C.bg2);
    micro(ctx, "camera", R.x + 28, R.y + 44);
    text(
      ctx,
      s.covered
        ? "covered · no frames"
        : `frames arriving · ${s.tags} tag${s.tags > 1 ? "s" : ""} at ${s.d.toFixed(1)} m`,
      R.x + 28,
      R.y + 96,
      { font: MONO, size: 24, weight: 600, color: s.covered ? C.err : C.tx }
    );
    const sg = sigmaFor(s.d, s.tags);
    text(
      ctx,
      s.d > 4
        ? "past 4 m · every frame thrown out"
        : `xyStdDev ±${sg.toFixed(2)} m`,
      R.x + 28,
      R.y + 150,
      { font: MONO, size: 24, weight: 600, color: s.d > 4 ? C.tx3 : C.accent }
    );
    text(
      ctx,
      "each frame pulls the estimate part of the way",
      R.x + 28,
      R.y + 210,
      { font: SANS, size: 22, color: C.tx2 }
    );
    if (extra) extra(ctx, R);
  }

  function liveGate() {
    const w = newWorld(2.0, 2);
    // start home
    w.ex = w.tx;
    w.ey = w.ty;
    const state = {
      time: gate.t0,
      w,
      pushed: false,
      uncoveredAfterPush: false,
      doneAt: null,
    };
    return {
      state,
      prompt() {
        const err = Math.hypot(w.ex - w.tx, w.ey - w.ty);
        if (state.doneAt != null)
          return "It walked home. Blended, not replaced.";
        if (!state.pushed)
          return w.covered
            ? "Covered. Now push the robot."
            : "Cover the camera (hold C), then push the robot (P).";
        if (w.covered)
          return "The estimate followed the wheels, and they slipped. Uncover it.";
        if (w.d > 4)
          return "Past 4 m nothing gets in. Bring the distance down.";
        return err > 0.05
          ? "Uncovered: watch the estimate walk back."
          : "Home.";
      },
      input(k, v) {
        if (k === "cover") w.covered = !!v;
        if (k === "push" && v && w.push <= 0) {
          w.push = 1.0;
          state.pushed = true;
        }
        if (k === "dist") {
          const dd = Number(v) - w.d;
          w.d = Number(v);
          w.tx += dd;
          w.ex += dd;
        }
        if (k === "tags") w.tags = Number(v);
      },
      step(dt) {
        state.time += dt;
        stepWorld(w, dt);
        const err = Math.hypot(w.ex - w.tx, w.ey - w.ty);
        if (
          state.pushed &&
          !w.covered &&
          w.push <= 0 &&
          err < 0.04 &&
          state.doneAt == null
        )
          state.doneAt = state.time;
        return state.doneAt != null && state.time - state.doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const u = t - gate.t0;
    const s = GATE.at(u);
    if (u < gCover)
      return "Cover the camera (hold C), then push the robot (P).";
    if (u < gPush) return "Covered. Now push the robot.";
    if (u < gUncover)
      return "The estimate followed the wheels, and they slipped. Uncover it.";
    return Math.hypot(s.ex - s.tx, s.ey - s.ty) > 0.04
      ? "Uncovered: watch the estimate walk back."
      : "It walked home. Blended, not replaced.";
  }

  const gateControls = [
    { k: "cover", label: "Cover camera", key: "KeyC", kind: "hold" },
    { k: "push", label: "Push robot", key: "KeyP", kind: "press" },
    {
      k: "dist",
      label: "Tag distance (m)",
      kind: "range",
      min: 1,
      max: 5,
      step: 0.1,
      value: 2,
    },
    {
      k: "tags",
      label: "Tags in view",
      kind: "range",
      min: 1,
      max: 2,
      step: 1,
      value: 2,
    },
  ];

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    background(ctx);
    if (live) {
      drawGateFrame(ctx, snap(live.w));
      vignette(ctx);
      return;
    }
    // the gate's scripted run, and the tryit line leading into it
    if (t >= L("tryit").t0 - 0.3 && t < gate.t1 + 0.1) {
      const s =
        t < gate.t0 ? { ...GATE.at(0), ex: 2.0, ey: Y0 } : GATE.at(t - gate.t0);
      const home = t < gate.t0;
      drawGateFrame(ctx, home ? { ...s, ex: s.tx, ey: s.ty } : s);
    }
    beatIntro(ctx, t);
    recInstall(ctx, t);
    beatConcepts(ctx, t);
    beatWalk(ctx, t);
    vignette(ctx);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
