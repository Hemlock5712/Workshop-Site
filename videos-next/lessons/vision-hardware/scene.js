// Seeing the Field. Why a camera that sees AprilTags fixes drift, where to mount it, and
// the camera's own web page.
//
// What is drawn, and how:
//   drift       the robot drives a loop; odometry's estimate (the ghost) adds up wheel turns,
//               so a slow creep and every skid stay in it. Tag sightings are scattered around
//               the truth by a fixed amount, however long the match has run. Noise is a hash
//               of the sighting's index, so every frame is the same every time.
//   the angle   one-pixel corner noise turned into a cloud of solved camera positions. The
//               spread across the line of sight falls off quickly as the camera moves
//               off-axis: square-on, the tag is a plain square and the answer smears.
// Recorded beats (the Limelight web page) are plain schematics, one function each, using
// the page's own names for each step, until the footage is captured.

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

// ---- the loop and the drift ------------------------------------------------------------

const LOOP = { cx: 6.2, cy: 4.0, rx: 3.4, ry: 2.3, period: 11 };
function truePose(u) {
  const a = (u / LOOP.period) * TAU;
  const x = LOOP.cx + LOOP.rx * Math.sin(a);
  const y = LOOP.cy - LOOP.ry * Math.cos(a);
  const dx = Math.cos(a) * LOOP.rx;
  const dy = Math.sin(a) * LOOP.ry;
  return {
    x,
    y,
    theta: Math.atan2(dy, dx),
    vx: (dx * TAU) / LOOP.period,
    vy: (dy * TAU) / LOOP.period,
  };
}
const SKIDS = [
  { u: 4.2, dx: 0.12, dy: -0.06 },
  { u: 9.6, dx: 0.1, dy: 0.14 },
  { u: 15.1, dx: 0.16, dy: 0.05 },
  { u: 21.0, dx: 0.06, dy: 0.18 },
  { u: 26.4, dx: 0.17, dy: 0.08 },
];
function drift(u) {
  let dx = 0.012 * u;
  let dy = 0.006 * u;
  for (const s of SKIDS) {
    const k = clamp((u - s.u) / 0.25);
    dx += s.dx * k;
    dy += s.dy * k;
  }
  return { dx, dy };
}
// sightings: now and then, scattered around the truth by the same amount all match
const SIGHTS = [];
for (let i = 0, u = 0.8; u < 40; i++) {
  u += 0.55 + 1.3 * hash(i * 3.1);
  const p = truePose(u);
  SIGHTS.push({
    u,
    x: p.x + 0.14 * gauss(i * 7.3),
    y: p.y + 0.14 * gauss(i * 5.9 + 2),
    tag: hash(i * 1.7) < 0.5 ? 0 : 1,
  });
}
const TAGS = [
  { x: 0.02, y: 5.6, id: 7 },
  { x: 16.52, y: 2.6, id: 18 },
  { x: 11.9, y: 8.05, id: 12 },
];

// ---- the angle: how wide the answer smears -------------------------------------------------

const spread = (deg) => 0.035 + 0.7 * Math.exp(-deg / 8.5); // meters, across the line of sight
const CLOUD = Array.from({ length: 70 }, (_, i) => ({
  a: gauss(i * 2.3 + 0.5),
  b: gauss(i * 4.1 + 9),
}));

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const U0 = L("intro").t0 - 0.2; // field clock starts with the narration
  const fieldU = (t) => Math.max(0, t - U0);

  const FULL = { x: 960, y: 500, z: 1 };

  // ---- beat: drift against sightings -------------------------------------------------
  function beatField(ctx, t) {
    const a = window_(t, U0 - 0.6, L("mount").t0 - 0.1, 0.5);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    const R = { x: 60, y: 90, w: 1180, h: 600 };
    micro(ctx, "the robot · and what it thinks", R.x, R.y - 20, { size: 17 });
    const F = drawField(ctx, R, {});
    const u = fieldU(t);
    const tp = truePose(u);
    const d = drift(u);
    const odo = {
      x: tp.x + d.dx,
      y: tp.y + d.dy,
      theta: tp.theta + 0.02 * u * 0.2,
    };
    // tags on the walls
    for (const tg of TAGS) drawTagMark(ctx, F, tg, tagFocus(t, tg));
    // the two trails
    trail(ctx, F, (v) => truePose(v), u, C.tx3, []);
    trail(
      ctx,
      F,
      (v) => {
        const p = truePose(v);
        const dd = drift(v);
        return { x: p.x + dd.dx, y: p.y + dd.dy };
      },
      u,
      alpha(C.accent, 0.7),
      [6, 6]
    );
    // skid marks
    for (const s of SKIDS) {
      if (u < s.u) continue;
      const p = truePose(s.u);
      const k = clamp(1 - (u - s.u) / 2.5);
      if (k > 0)
        text(ctx, "skid", F.X(p.x), F.Y(p.y) - 34, {
          font: MONO,
          size: 18,
          weight: 600,
          align: "center",
          color: C.err,
          a: k,
        });
    }
    // sightings, from the drift line on
    const showSights = t >= Wd("drift", "camera") - 0.2;
    if (showSights) {
      for (const s of SIGHTS) {
        if (
          s.u > u ||
          u - s.u > 2.4 ||
          s.u < fieldU(Wd("drift", "camera") - 0.2)
        )
          continue;
        const k = clamp(1 - (u - s.u) / 2.4);
        ctx.beginPath();
        ctx.arc(F.X(s.x), F.Y(s.y), 7, 0, TAU);
        ctx.fillStyle = alpha(C.tx, 0.85 * k);
        ctx.fill();
        if (u - s.u < 0.35) {
          const tg = TAGS[s.tag];
          ctx.strokeStyle = alpha(C.tx2, 0.5);
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          ctx.moveTo(F.X(tp.x), F.Y(tp.y));
          ctx.lineTo(F.X(tg.x), F.Y(tg.y));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    drawSwerveRobot(ctx, F, odo, { ghost: true, label: "odometry" });
    const c = Math.cos(tp.theta);
    const sn = Math.sin(tp.theta);
    drawSwerveRobot(ctx, F, tp, {
      modules: swerveModules(
        c * tp.vx + sn * tp.vy,
        -sn * tp.vx + c * tp.vy,
        0.6
      ),
    });
    drawPoseReadout(ctx, R.x, R.y + R.h + 44, odo, {
      title: "Drivetrain/Pose · odometry",
    });
    const err = Math.hypot(d.dx, d.dy);
    text(
      ctx,
      `${(err * 100).toFixed(0)} cm from the truth`,
      R.x + R.w,
      R.y + R.h + 76,
      { font: MONO, size: 24, weight: 600, align: "right", color: C.accent }
    );

    // the error plot: one grows, one stays put
    const P = { x: 1280, y: 90, w: 590, h: 420 };
    const pts = [];
    for (let v = 0; v <= u; v += 0.25) {
      const dd = drift(v);
      pts.push([v, Math.hypot(dd.dx, dd.dy)]);
    }
    const cam = SIGHTS.filter(
      (s) =>
        s.u <= u && showSights && s.u >= fieldU(Wd("drift", "camera") - 0.2)
    ).map((s) => {
      const p = truePose(s.u);
      return [s.u, Math.hypot(s.x - p.x, s.y - p.y)];
    });
    const G_ = drawPlot(ctx, P, {
      title: "error · meters",
      t0: 0,
      t1: 34,
      v0: 0,
      v1: 1.2,
      series: [{ pts, label: pts.length > 8 ? "odometry" : "" }],
      playhead: u,
    });
    for (const [v, e] of cam) {
      ctx.beginPath();
      ctx.arc(G_.X(v), G_.Y(e), 5, 0, TAU);
      ctx.fillStyle = C.tx;
      ctx.fill();
    }
    if (cam.length > 3)
      text(ctx, "tag sightings", G_.X(cam.at(-1)[0]) - 10, G_.Y(0.32), {
        font: MONO,
        size: 16,
        align: "right",
        color: C.tx,
      });
    // what each one is
    const k1 = ramp(t, Wd("drift", "drifts") - 0.2, 0.4);
    const k2 = ramp(t, Wd("drift", "noisy,") - 0.2, 0.4);
    text(
      ctx,
      "odometry · smooth, every loop, the error only grows",
      P.x,
      P.y + P.h + 50,
      { font: SANS, size: 22, color: C.tx2, a: k1 }
    );
    text(
      ctx,
      "a tag · noisy, now and then, the error doesn't grow",
      P.x,
      P.y + P.h + 88,
      { font: SANS, size: 22, color: C.tx, a: k2 }
    );
    const k3 = ramp(t, Wd("blend", "blends") - 0.3, 0.4);
    text(ctx, "next lesson: blend the two", P.x, P.y + P.h + 140, {
      font: MONO,
      size: 24,
      weight: 600,
      color: C.accent,
      a: k3,
    });
    ctx.restore();
  }

  function tagFocus(t, tg) {
    return tg.id === 7 ? window_(t, L("tag").t0 - 0.2, L("blend").t0, 0.3) : 0;
  }

  function trail(ctx, F, f, u, color, dash) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(dash);
    ctx.beginPath();
    for (let v = Math.max(0, u - 9); v <= u; v += 0.1) {
      const p = f(v);
      v === Math.max(0, u - 9)
        ? ctx.moveTo(F.X(p.x), F.Y(p.y))
        : ctx.lineTo(F.X(p.x), F.Y(p.y));
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawTagMark(ctx, F, tg, k = 0) {
    const s = 22;
    const x = F.X(tg.x);
    const y = F.Y(tg.y);
    ctx.fillStyle = k > 0 ? C.accent : C.tx;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
    ctx.fillStyle = C.bg;
    ctx.fillRect(x - s / 4, y - s / 4, s / 2, s / 2);
    const lx = tg.x < 1 ? x + 22 : tg.x > 15 ? x - 22 : x;
    const ly = tg.y > 7.5 ? y + 34 : y + 6;
    text(ctx, `tag ${tg.id}`, lx, ly, {
      font: MONO,
      size: 17,
      weight: 600,
      align: tg.x < 1 ? "left" : tg.x > 15 ? "right" : "center",
      color: k > 0 ? C.accent : C.tx2,
    });
  }

  // ---- beat: what a tag is ---------------------------------------------------------
  function beatTag(ctx, t) {
    const a = window_(t, L("tag").t0 - 0.3, L("blend").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.95);
    ctx.fillRect(0, 0, W, H);
    // the tag, big
    const T = { x: 180, y: 170, s: 420 };
    drawAprilTag(ctx, T.x, T.y, T.s, 7);
    text(ctx, "ID 7", T.x + T.s / 2, T.y - 66, {
      font: MONO,
      size: 34,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    const spot = ramp(t, Wd("tag", "spot") - 0.3, 0.4);
    rrect(ctx, T.x - 10, T.y + T.s + 40, T.s + 20, 120, 4);
    ctx.fillStyle = alpha(C.bg2, spot);
    ctx.fill();
    micro(ctx, "the field map says", T.x + 10, T.y + T.s + 76, {
      size: 16,
      a: spot,
    });
    text(ctx, "where tag 7 sits, how high,", T.x + 10, T.y + T.s + 112, {
      font: SANS,
      size: 24,
      color: C.tx,
      a: spot,
    });
    text(ctx, "and which way it faces", T.x + 10, T.y + T.s + 144, {
      font: SANS,
      size: 24,
      color: C.tx,
      a: spot,
    });
    // corners
    const cor = ramp(t, Wd("tag", "corners,") - 0.3, 0.4);
    const corners = [
      [T.x, T.y],
      [T.x + T.s, T.y],
      [T.x + T.s, T.y + T.s],
      [T.x, T.y + T.s],
    ];
    for (const [cx, cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 13, 0, TAU);
      ctx.fillStyle = alpha(C.accent, cor);
      ctx.fill();
    }
    // top down: the camera works backwards from the corners
    const R = { x: 800, y: 120, w: 1060, h: 680 };
    const F = drawField(ctx, R, {
      view: { x0: 0, y0: 2.5, x1: 6, y1: 8.07 },
      axes: false,
      labels: false,
    });
    const tag = { x: 0.02, y: 5.6, id: 7 };
    drawTagMark(ctx, F, tag, 1);
    const robot = { x: 3.4, y: 4.3, theta: Math.PI * 0.86 };
    const back = ramp(t, Wd("tag", "backwards") - 0.3, 0.9);
    if (cor > 0) {
      // rays from the corners back toward the camera
      ctx.save();
      ctx.strokeStyle = alpha(C.accent, 0.6 * cor);
      ctx.lineWidth = 2;
      for (const off of [-0.12, 0.12]) {
        ctx.beginPath();
        ctx.moveTo(F.X(tag.x), F.Y(tag.y + off));
        const k = easeInOut(back);
        ctx.lineTo(
          F.X(lerp(tag.x, robot.x, Math.max(0.15, k))),
          F.Y(lerp(tag.y + off, robot.y, Math.max(0.15, k)))
        );
        ctx.stroke();
      }
      ctx.restore();
    }
    if (back > 0.6)
      drawSwerveRobot(ctx, F, robot, { label: "where the robot must be" });
    else
      drawSwerveRobot(ctx, F, robot, {
        ghost: true,
        color: alpha(C.tx3, 0.6),
        label: "?",
      });
    ctx.restore();
  }

  function drawAprilTag(ctx, x, y, s, id) {
    ctx.fillStyle = C.tx;
    ctx.fillRect(x - s * 0.1, y - s * 0.1, s * 1.2, s * 1.2);
    ctx.fillStyle = "oklch(0.12 0.02 265)";
    ctx.fillRect(x, y, s, s);
    const n = 6;
    const c = s / (n + 2);
    ctx.fillStyle = C.tx;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (hash(id * 100 + i * 7 + j * 13) > 0.5)
          ctx.fillRect(x + c * (i + 1), y + c * (j + 1), c + 0.5, c + 0.5);
  }

  // ---- beat: mount and wire ------------------------------------------------------------
  function beatMount(ctx, t) {
    const a = window_(t, L("mount").t0 - 0.3, L("angle").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    background(ctx);
    // side view: robot, camera up high, the scoring tags in view while scoring
    const floor = 760;
    micro(ctx, "side view · lined up to score", 100, 120, { size: 17 });
    ctx.fillStyle = C.rule;
    ctx.fillRect(80, floor, 1000, 6);
    // the scoring target with its tag
    ctx.fillStyle = C.bg3;
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.fillRect(860, 300, 180, floor - 300);
    ctx.strokeRect(860, 300, 180, floor - 300);
    drawAprilTag(ctx, 880, 430, 60, 3);
    text(ctx, "scoring tag", 950, 290, {
      font: MONO,
      size: 18,
      align: "center",
      color: C.tx2,
    });
    // the robot
    ctx.fillStyle = C.bg3;
    ctx.strokeStyle = C.tx2;
    ctx.lineWidth = 3;
    rrect(ctx, 260, floor - 150, 380, 110, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.fillRect(630, floor - 130, 10, 70);
    for (const wx of [320, 580]) {
      ctx.beginPath();
      ctx.arc(wx, floor - 30, 30, 0, TAU);
      ctx.fillStyle = C.bg;
      ctx.fill();
      ctx.stroke();
    }
    // the mast and camera, tilted up at the tag
    ctx.fillStyle = C.tx3;
    ctx.fillRect(470, floor - 330, 12, 180);
    const cam = { x: 500, y: floor - 340 };
    const aim = Math.atan2(460 - cam.y, 880 - cam.x);
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.rotate(aim);
    ctx.fillStyle = alpha(C.accent, 0.12);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(420, -110);
    ctx.lineTo(420, 110);
    ctx.closePath();
    ctx.fill();
    rrect(ctx, -30, -20, 60, 40, 4);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    text(ctx, "Limelight", cam.x, cam.y - 40, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    text(ctx, "sees the scoring tags while you score", 100, floor + 60, {
      font: SANS,
      size: 24,
      color: C.tx2,
    });

    // wiring: dedicated PDH breaker, Ethernet to the radio. Nothing else.
    const k = ramp(t, Wd("mount", "breaker.") - 0.8, 0.5);
    ctx.save();
    ctx.globalAlpha *= k;
    const PDH = { x: 1220, y: 200, w: 300, h: 230 };
    panel(ctx, PDH, C.bg2);
    micro(ctx, "PDH", PDH.x + 20, PDH.y + 34, { size: 17 });
    for (let i = 0; i < 8; i++) {
      const bx = PDH.x + 22 + (i % 4) * 66;
      const by = PDH.y + 60 + Math.floor(i / 4) * 74;
      const hot = i === 5;
      rrect(ctx, bx, by, 54, 58, 3);
      ctx.fillStyle = hot ? C.accent : C.bg3;
      ctx.fill();
    }
    text(ctx, "its own breaker · 12 V", PDH.x, PDH.y + PDH.h + 40, {
      font: MONO,
      size: 21,
      weight: 600,
      color: C.accent,
    });
    const RAD = { x: 1600, y: 560, w: 240, h: 120 };
    panel(ctx, RAD, C.bg2);
    text(ctx, "radio", RAD.x + RAD.w / 2, RAD.y + 70, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
    });
    const CAM = { x: 1280, y: 560, w: 200, h: 120 };
    panel(ctx, CAM, C.bg2);
    text(ctx, "Limelight", CAM.x + CAM.w / 2, CAM.y + 70, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(PDH.x + 22 + 66 + 27, PDH.y + 60 + 74 + 58);
    ctx.lineTo(PDH.x + 115, CAM.y);
    ctx.stroke();
    ctx.strokeStyle = C.tx2;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(CAM.x + CAM.w, CAM.y + 60);
    ctx.lineTo(RAD.x, RAD.y + 60);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, "Ethernet", (CAM.x + CAM.w + RAD.x) / 2, CAM.y + 44, {
      font: MONO,
      size: 19,
      align: "center",
      color: C.tx2,
    });
    text(ctx, "not the VRM", PDH.x, PDH.y + PDH.h + 76, {
      font: MONO,
      size: 19,
      color: C.tx3,
    });
    ctx.restore();
    ctx.restore();
  }

  // ---- beat: head on vs at an angle (and the gate) -----------------------------------------

  // deg: how far off-axis the camera sits. Draws the camera's view and a top-down cloud.
  function drawAngleBench(ctx, deg, t, { title = "" } = {}) {
    const sp = spread(deg);
    // the camera's view
    const V = { x: 80, y: 110, w: 760, h: 560 };
    panel(ctx, V, "oklch(0.12 0.02 265)");
    micro(ctx, "what the camera sees", V.x + 24, V.y + 40, { size: 17 });
    const cx = V.x + V.w / 2;
    const cy = V.y + V.h / 2 + 20;
    const s = 230;
    const r = deg * (Math.PI / 180);
    // perspective: the far edge shrinks, the face narrows
    const wFace = s * Math.cos(r);
    const near = s;
    const far = s * (1 - 0.45 * Math.sin(r));
    const jit = (i) => 1.5 * Math.sin(t * 9 + i * 2.1);
    const pts = [
      [cx - wFace / 2 + jit(1), cy - near / 2 + jit(2)],
      [cx + wFace / 2 + jit(3), cy - far / 2 + jit(4)],
      [cx + wFace / 2 + jit(5), cy + far / 2 + jit(6)],
      [cx - wFace / 2 + jit(7), cy + near / 2 + jit(8)],
    ];
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = C.tx;
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    for (const [x, y] of pts) {
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, TAU);
      ctx.fillStyle = C.accent;
      ctx.fill();
    }
    text(
      ctx,
      deg < 6
        ? "a plain square"
        : "a trapezoid · its shape says where you stand",
      cx,
      V.y + V.h - 30,
      {
        font: MONO,
        size: 21,
        weight: 600,
        align: "center",
        color: deg < 6 ? C.err : C.accent,
      }
    );
    text(ctx, "corners · one pixel of noise", V.x + 24, V.y + 76, {
      font: MONO,
      size: 17,
      color: C.tx3,
    });

    // top down: the tag on the wall, the camera on an arc, the cloud of answers
    const T = { x: 900, y: 110, w: 960, h: 560 };
    panel(ctx, T, C.bg2);
    micro(ctx, "top down · solved camera positions", T.x + 24, T.y + 40, {
      size: 17,
    });
    const sc = 190; // px per meter
    const tag = { x: T.x + T.w / 2, y: T.y + 90 };
    ctx.fillStyle = C.tx;
    ctx.fillRect(tag.x - 0.17 * sc, tag.y - 8, 0.34 * sc, 16);
    text(ctx, "tag", tag.x, tag.y - 18, {
      font: MONO,
      size: 18,
      align: "center",
      color: C.tx2,
    });
    const dist = 2.0;
    const camP = {
      x: tag.x + Math.sin(r) * dist * sc,
      y: tag.y + Math.cos(r) * dist * sc,
    };
    // view line and camera
    ctx.strokeStyle = alpha(C.tx3, 0.7);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(tag.x, tag.y);
    ctx.lineTo(camP.x, camP.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();
    ctx.translate(camP.x, camP.y);
    ctx.rotate(-r);
    rrect(ctx, -26, -14, 52, 28, 4);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
    // the cloud: wide across the line of sight, thin along it
    const ux = Math.cos(r);
    const uy = -Math.sin(r);
    for (const p of CLOUD) {
      const x = camP.x + (p.a * sp * ux + p.b * 0.03 * Math.sin(r)) * sc;
      const y = camP.y + (p.a * sp * uy + p.b * 0.03 * Math.cos(r)) * sc;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, TAU);
      ctx.fillStyle = alpha(deg < 15 ? C.err : C.accent, 0.55);
      ctx.fill();
    }
    text(ctx, `off-axis ${deg.toFixed(0)}°`, camP.x, camP.y + 50, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    text(ctx, `spread ±${(sp * 100).toFixed(0)} cm`, T.x + T.w - 24, T.y + 40, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "right",
      color: deg < 15 ? C.err : C.accent,
    });
    if (title)
      text(ctx, title, W / 2, 740, {
        font: SANS,
        size: 28,
        weight: 600,
        align: "center",
        color: C.tx,
      });
    return { camP, tag, sc };
  }

  function angleDeg(t) {
    return 38 * easeInOut(ramp(t, Wd("angle", "angle,") - 0.3, 1.4));
  }

  function beatAngle(ctx, t) {
    const a = window_(t, L("angle").t0 - 0.3, gate.t1 + 0.4, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    let deg = angleDeg(t);
    if (t >= L("tryit").t0 - 0.3) deg = 0;
    if (t >= gate.t0) deg = 40 * easeInOut(ramp(t, gate.t0 + 1.0, 3.0));
    const title =
      t < L("tryit").t0 - 0.3
        ? deg < 6
          ? "head on: small errors smear the answer"
          : "at an angle: the answer tightens up"
        : "";
    drawAngleBench(ctx, deg, t, { title });
    ctx.restore();
  }

  // ---- recorded beats: the Limelight web interface -------------------------------------------

  function camImage(
    ctx,
    R,
    { exposure = 1, tag = true, overlay = false, tx = 0, label = "" } = {}
  ) {
    ctx.save();
    panel(ctx, R, `oklch(${(0.12 + 0.3 * exposure).toFixed(3)} 0.01 265)`);
    micro(ctx, label || "camera stream", R.x + 20, R.y + 34, {
      size: 16,
      color: exposure > 0.5 ? C.bg : C.tx3,
    });
    if (tag) {
      const s = R.h * 0.34;
      const x = R.x + R.w / 2 - s / 2 + tx;
      const y = R.y + R.h / 2 - s / 2 + 10;
      ctx.globalAlpha *= 0.4 + 0.6 * (1 - exposure * 0.6);
      drawAprilTag(ctx, x, y, s, 7);
      ctx.globalAlpha = 1;
      if (overlay) {
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(x - s * 0.1, y - s * 0.1, s * 1.2, s * 1.2);
        text(ctx, "7", x - s * 0.1, y - s * 0.1 - 10, {
          font: MONO,
          size: 24,
          weight: 600,
          color: C.accent,
        });
      }
    }
    ctx.restore();
  }

  // REC: field map, AprilTag pipeline, exposure down.
  function recSetup(ctx, t) {
    const a = window_(t, L("setup").t0 - 0.3, L("offsets").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    const map = ramp(t, Wd("setup", "field") - 0.2, 0.3);
    const pipe = ramp(t, Wd("setup", "apriltag") - 0.2, 0.3);
    const exp = ramp(t, Wd("setup", "exposure") - 0.2, 0.3);
    drawToolWindow(
      ctx,
      { x: 80, y: 110, w: 820, h: 620 },
      {
        app: "Limelight · web interface",
        title: "camera setup",
        rowH: 64,
        rows: [
          {
            label: "Field map",
            value: map > 0.5 ? "this season's .fmap · uploaded" : "upload",
            hot: map > 0.5 && pipe < 0.5,
          },
          {
            label: "Pipeline type",
            value: pipe > 0.5 ? "AprilTag" : "",
            hot: pipe > 0.5 && exp < 0.5,
          },
          {
            label: "Exposure",
            value: exp > 0.5 ? "low · tags still found" : "",
            hot: exp > 0.5,
          },
        ],
      }
    );
    const e = 1 - 0.85 * easeInOut(ramp(t, Wd("setup", "exposure") + 0.1, 1.2));
    camImage(
      ctx,
      { x: 960, y: 110, w: 880, h: 620 },
      { exposure: e, overlay: pipe > 0.5 }
    );
    if (exp > 0.5)
      text(ctx, "dark image, the tag still outlined", 1400, 780, {
        font: MONO,
        size: 21,
        weight: 600,
        align: "center",
        color: C.accent,
      });
    ctx.restore();
  }

  // REC: camera offsets, ChArUco calibration, the name.
  function recOffsets(ctx, t) {
    const a = window_(t, L("offsets").t0 - 0.3, L("check").t0 - 0.1, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    const off = ramp(t, L("offsets").t0, 0.3);
    const cal = ramp(t, Wd("offsets", "charuco") - 0.2, 0.3);
    const name = ramp(t, Wd("offsets", "name.") - 0.3, 0.3);
    const which = name > 0.5 ? 2 : cal > 0.5 ? 1 : off > 0.5 ? 0 : -1;
    drawToolWindow(
      ctx,
      { x: 80, y: 110, w: 820, h: 700 },
      {
        app: "Limelight · web interface",
        title: "camera in robot space",
        rowH: 58,
        rows: [
          { label: "Forward", value: "0.25 m", hot: which === 0 },
          { label: "Side", value: "0.20 m", hot: which === 0 },
          { label: "Up", value: "0.50 m", hot: which === 0 },
          { label: "Roll", value: "0°", hot: which === 0 },
          { label: "Pitch", value: "20°", hot: which === 0 },
          { label: "Yaw", value: "30°", hot: which === 0 },
          { label: "Calibration", value: "ChArUco board", hot: which === 1 },
          { label: "Name", value: "limelight", hot: which === 2 },
        ],
      }
    );
    text(ctx, "measured on your robot, not copied", 100, 860, {
      font: MONO,
      size: 19,
      color: C.tx3,
    });
    // the lens grid: bent at the edges until calibrated
    const R = { x: 960, y: 110, w: 880, h: 700 };
    panel(ctx, R, C.bg2);
    micro(ctx, "lens distortion · worst at the edges", R.x + 24, R.y + 40, {
      size: 16,
    });
    const fix = easeInOut(ramp(t, Wd("offsets", "charuco") + 0.2, 1.2));
    const bend = 0.16 * (1 - fix);
    const gx = R.x + R.w / 2;
    const gy = R.y + R.h / 2 + 20;
    const half = 300;
    const map = (u, v) => {
      const r2 = u * u + v * v;
      return [gx + u * half * (1 - bend * r2), gy + v * half * (1 - bend * r2)];
    };
    ctx.strokeStyle = fix > 0.9 ? C.accent : C.tx2;
    ctx.lineWidth = 2;
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      for (let j = -20; j <= 20; j++) {
        const [x, y] = map(i / 4, j / 20);
        j === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let j = -20; j <= 20; j++) {
        const [x, y] = map(j / 20, i / 4);
        j === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    if (name > 0) {
      ctx.save();
      ctx.globalAlpha *= name;
      rrect(ctx, R.x + 160, R.y + R.h - 120, R.w - 320, 84, 6);
      ctx.fillStyle = C.bg;
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(
        ctx,
        'name · "limelight" · write it down',
        R.x + R.w / 2,
        R.y + R.h - 66,
        { font: MONO, size: 26, weight: 600, align: "center", color: C.accent }
      );
      ctx.restore();
    }
    ctx.restore();
  }

  // REC: a printed tag at about a meter.
  function recCheck(ctx, t) {
    const a = window_(t, L("check").t0 - 0.3, L("close").t0 + 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    background(ctx);
    const u = t - L("check").t0;
    const tx = 140 * Math.sin(u * 1.1);
    camImage(
      ctx,
      { x: 80, y: 110, w: 1000, h: 680 },
      {
        exposure: 0.15,
        overlay: true,
        tx,
        label: "camera stream · tag held about 1 m away",
      }
    );
    const id = ramp(t, Wd("check", "id,") - 0.2, 0.3);
    const dist = ramp(t, Wd("check", "distance,") - 0.2, 0.3);
    const pose = ramp(t, Wd("check", "pose") - 0.2, 0.3);
    const j = (i) => 0.004 * Math.sin(u * 7 + i);
    drawToolWindow(
      ctx,
      { x: 1120, y: 110, w: 720, h: 420 },
      {
        app: "Limelight · web interface",
        title: "readouts",
        rowH: 72,
        rows: [
          {
            label: "Tag ID",
            value: id > 0.5 ? "7" : "",
            hot: id > 0.5 && dist < 0.5,
          },
          {
            label: "Distance",
            value:
              dist > 0.5
                ? `${(1.0 + 0.01 * Math.sin(u * 3)).toFixed(2)} m`
                : "",
            hot: dist > 0.5 && pose < 0.5,
            note: dist > 0.5 ? "tape measure says 1.00 m" : null,
          },
          {
            label: "botpose",
            value:
              pose > 0.5
                ? `x ${(4.21 + j(1)).toFixed(2)}  y ${(5.37 + j(2)).toFixed(2)}  θ 152°`
                : "",
            hot: pose > 0.5,
          },
        ],
      }
    );
    if (pose > 0.5)
      text(ctx, "steady while the tag moves", 1140, 590, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.accent,
      });
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
    micro(ctx, "Workshop 6 · Vision Hardware", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Seeing the Field", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Write down the camera's name.", W / 2, 400, {
      font: SERIF,
      size: 80,
      align: "center",
    });
    text(ctx, '"limelight"', W / 2, 520, {
      font: MONO,
      size: 64,
      weight: 600,
      align: "center",
      color: C.accent,
    });
    text(
      ctx,
      "Next, the code feeds these sightings into the pose.",
      W / 2,
      650,
      {
        font: SERIF,
        size: 56,
        align: "center",
        color: C.tx2,
        a: easeOut(ramp(t, Wd("close", "next,") - 0.1, 0.5)),
      }
    );
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    background(ctx);
    if (live) {
      drawAngleBench(ctx, live.deg, live.time);
      vignette(ctx);
      return;
    }
    ctx.save();
    applyCamera(ctx, FULL);
    beatField(ctx, t);
    ctx.restore();
    beatTag(ctx, t);
    beatMount(ctx, t);
    beatAngle(ctx, t);
    recSetup(ctx, t);
    recOffsets(ctx, t);
    recCheck(ctx, t);
    vignette(ctx);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate: move the camera until the cloud is tight ---------------------------------

  function liveGate() {
    const state = {
      time: gate.t0,
      deg: 0,
      tightFor: 0,
      doneAt: null,
      dragging: false,
    };
    const setFromPointer = (x, y) => {
      // the arc's centre is the tag, top centre of the top-down panel
      const tx = 900 + 960 / 2;
      const ty = 110 + 90;
      const ang = Math.atan2(x - tx, y - ty) * (180 / Math.PI);
      state.deg = clamp(Math.abs(ang), 0, 60);
    };
    return {
      state,
      prompt() {
        if (state.doneAt != null)
          return "Tight. Off to one side, the answer holds still.";
        if (state.deg < 8)
          return "Head on, the cloud is a smear. Move the camera.";
        if (state.deg < 22) return "Tighter. Keep going.";
        return "Hold it there.";
      },
      input(k, v) {
        if (k === "angle") state.deg = clamp(Number(v), 0, 60);
      },
      pointer(type, x, y) {
        if (type === "down" && x > 900) state.dragging = true;
        if (type === "up") state.dragging = false;
        if (state.dragging && (type === "move" || type === "down"))
          setFromPointer(x, y);
      },
      step(dt) {
        state.time += dt;
        if (state.doneAt == null) {
          state.tightFor = state.deg >= 22 ? state.tightFor + dt : 0;
          if (state.tightFor > 1.0) state.doneAt = state.time;
        }
        return state.doneAt != null && state.time - state.doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    const deg = 40 * easeInOut(ramp(t, gate.t0 + 1.0, 3.0));
    if (deg < 8) return "Head on, the cloud is a smear. Move the camera.";
    if (deg < 22) return "Tighter. Keep going.";
    if (t < gate.t0 + 5.2) return "Hold it there.";
    return "Tight. Off to one side, the answer holds still.";
  }

  const gateControls = [
    {
      k: "angle",
      label: "Camera off-axis",
      kind: "range",
      min: 0,
      max: 60,
      step: 1,
      value: 0,
    },
  ];

  return { draw, liveGate, gate, gatePromptAt, gateControls };
}
