// Starting From Anywhere. Pathfinding on swerve-pathfinding: AutoBuilder.pathfindToPose
// searches the navigation grid for a route from wherever the robot is, refines it while
// the robot drives, and stops refining inside 2 m of the goal.
//
// What is simulated, and how:
//   the grid      the branch's own deploy/pathplanner/navgrid.json (0.3 m squares, 56 x 27),
//                 copied below. The margin slider rebuilds only the band around the hub
//                 from the hub's footprint; at the shipped margin the file is used as is.
//   the search    A* on the grid (8-connected), its expansion order animated, then the
//                 route shortened by line of sight and rounded. That stands in for
//                 PathPlanner's own search; the picture (cells out from the robot, a route,
//                 refinements while driving) is the point, not the exact algorithm.
//   the follower  the route driven at the branch's PathConstraints, 2.0 m/s and 2.0 m/s².
//   canceling     sends nothing: the last request stays for a loop, until the drive's
//                 default command (the sticks, centered) takes the drivetrain and sends zero.
// Recorded beats (grid, hold) are drawn as tool-window schematics, one function each,
// to be swapped for footage later.

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
  drawController,
  drawField,
  drawSwerveRobot,
  drawTimeline,
  drawToolWindow,
  panel,
  runBar,
  swerveModules,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const FIELD = { x: 40, y: 40, w: 1060, h: 840 };
const VIEW = { x0: 0, y0: 0, x1: 9.6, y1: 8.07 };
const CODE = { x: 1140, y: 40, w: 740, h: 430 };
const LANES = { x: 1140, y: 490, w: 740, h: 190 };
const CARD = { x: 1140, y: 700, w: 520, h: 180 };
const PAD = { x: 1690, y: 720, s: 0.42 };
const CODE_SIZE = 18;
const LH = 25;

// ---- the grid ------------------------------------------------------------------------

// swerve-pathfinding: src/main/deploy/pathplanner/navgrid.json, row 0 at y = 0
const NAV = [
  "########################################################",
  "########################################################",
  "##....................................................##",
  "##..........#######..................######...........##",
  "##..........#######..................######..........###",
  "##..........#######..................######.........####",
  "##..................................................####",
  "##..................................................####",
  "##..................................................####",
  "#####.......#######..................######..........###",
  "######.....#########................########..........##",
  "######.....#########................########.......#####",
  "######.....#########................########......######",
  "######.....#########................########......######",
  "######.....#########................########......######",
  "#####......#########................########......######",
  "##.........#########................########......######",
  "##..........#######..................######........#####",
  "###...................................................##",
  "###...................................................##",
  "###...................................................##",
  "###.........#######..................######...........##",
  "##..........#######..................######...........##",
  "##..........#######..................######...........##",
  "##....................................................##",
  "########################################################",
  "########################################################",
];
const NX = 56;
const NY = 27;
const CELL = 0.3;
const HUB = { x0: 4.03, x1: 5.22, y0: 3.43, y1: 4.62 }; // the hub's footprint
const SHIPPED = 0.75; // the margin the shipped band works out to
const HALF = 0.42; // robotWidth 0.84 / 2
const START = { x: 2.0, y: 2.3, theta: 0 };
const GOAL = { x: 7.5, y: 4.0, theta: 0 };
const VMAX = 2.0;
const AMAX = 2.0;
const SQ2 = Math.SQRT2;

const inBand = (c, r) => c >= 11 && c <= 19 && r >= 9 && r <= 17;
function makeGrid(margin = SHIPPED, wall = false) {
  const g = [];
  for (let r = 0; r < NY; r++) {
    const row = [];
    for (let c = 0; c < NX; c++) {
      let b = NAV[r][c] === "#";
      if (
        Math.abs(margin - SHIPPED) > 1e-6 &&
        c >= 8 &&
        c <= 22 &&
        r >= 5 &&
        r <= 21
      ) {
        if (inBand(c, r)) b = false;
        const cx = (c + 0.5) * CELL;
        const cy = (r + 0.5) * CELL;
        if (
          cx > HUB.x0 - margin &&
          cx < HUB.x1 + margin &&
          cy > HUB.y0 - margin &&
          cy < HUB.y1 + margin
        )
          b = true;
      }
      if (wall && c >= 15 && c <= 16 && r >= 2 && r <= 8) b = true;
      row.push(b);
    }
    g.push(row);
  }
  return g;
}

const cellOf = (x, y) => [
  clamp(Math.floor(x / CELL), 0, NX - 1),
  clamp(Math.floor(y / CELL), 0, NY - 1),
];
const centerOf = (c, r) => ({ x: (c + 0.5) * CELL, y: (r + 0.5) * CELL });

// A*, 8-connected, no corner cutting. Returns { order: [[c, r]], path: [{x, y}] | null }.
function astar(g, from, to) {
  const [sc, sr] = cellOf(from.x, from.y);
  const [gc, gr] = cellOf(to.x, to.y);
  const key = (c, r) => r * NX + c;
  const gs = new Map([[key(sc, sr), 0]]);
  const prev = new Map();
  const closed = new Set();
  const h = (c, r) => {
    const dx = Math.abs(c - gc);
    const dy = Math.abs(r - gr);
    return Math.max(dx, dy) + (SQ2 - 1) * Math.min(dx, dy);
  };
  let open = [[h(sc, sr), 0, sc, sr]];
  const order = [];
  let seq = 0;
  while (open.length) {
    open.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const [, , c, r] = open.shift();
    const k = key(c, r);
    if (closed.has(k)) continue;
    closed.add(k);
    order.push([c, r]);
    if (c === gc && r === gr) {
      const cells = [[c, r]];
      let cur = k;
      while (prev.has(cur)) {
        cur = prev.get(cur);
        cells.unshift([cur % NX, Math.floor(cur / NX)]);
      }
      const path = cells.map(([cc, rr]) => centerOf(cc, rr));
      path[0] = { x: from.x, y: from.y };
      path[path.length - 1] = { x: to.x, y: to.y };
      return { order, path };
    }
    for (let dc = -1; dc <= 1; dc++)
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const nc = c + dc;
        const nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= NX || nr >= NY || g[nr][nc]) continue;
        if (dc && dr && (g[r][nc] || g[nr][c])) continue;
        const ng = gs.get(k) + (dc && dr ? SQ2 : 1);
        const nk = key(nc, nr);
        if (gs.has(nk) && gs.get(nk) <= ng) continue;
        gs.set(nk, ng);
        prev.set(nk, k);
        open.push([ng + h(nc, nr), ++seq, nc, nr]);
      }
  }
  return { order, path: null };
}

function sight(g, a, b) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.04);
  for (let i = 0; i <= n; i++) {
    const [c, r] = cellOf(lerp(a.x, b.x, i / n), lerp(a.y, b.y, i / n));
    if (g[r][c]) return false;
  }
  return true;
}
function shorten(g, pts) {
  const out = [pts[0]];
  let i = 0;
  while (i < pts.length - 1) {
    let j = pts.length - 1;
    while (j > i + 1 && !sight(g, pts[i], pts[j])) j--;
    out.push(pts[j]);
    i = j;
  }
  return out;
}
function round(pts, n = 3, cut = 0.25) {
  let p = pts;
  for (let k = 0; k < n; k++) {
    const q = [p[0]];
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i];
      const b = p[i + 1];
      q.push(
        { x: lerp(a.x, b.x, cut), y: lerp(a.y, b.y, cut) },
        { x: lerp(a.x, b.x, 1 - cut), y: lerp(a.y, b.y, 1 - cut) }
      );
    }
    q.push(p.at(-1));
    p = q;
  }
  return p;
}
const lengthOf = (pts) =>
  pts.reduce(
    (s, p, i) =>
      i ? s + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0,
    0
  );
function pointAt(pts, d) {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (d <= seg || i === pts.length - 1) {
      const k = seg > 0 ? clamp(d / seg) : 0;
      return {
        x: lerp(pts[i - 1].x, pts[i].x, k),
        y: lerp(pts[i - 1].y, pts[i].y, k),
        ux: seg ? (pts[i].x - pts[i - 1].x) / seg : 1,
        uy: seg ? (pts[i].y - pts[i - 1].y) / seg : 0,
      };
    }
    d -= seg;
  }
  return { ...pts.at(-1), ux: 1, uy: 0 };
}

function plan(g, from, to) {
  const { order, path } = astar(g, from, to);
  if (!path) return { order, raw: null };
  const r1 = shorten(g, path);
  // round the corners, but never across a blocked square
  const clear = (pts) => pts.every((p, i) => !i || sight(g, pts[i - 1], p));
  const r2 =
    [round(r1, 3, 0.25), round(r1, 3, 0.12), round(r1, 2, 0.05)].find(clear) ??
    r1;
  return { order, raw: path, r1, r2, len: lengthOf(r2) };
}

// distance along a route under the trapezoid, from rest
function along(len, t) {
  const ta = VMAX / AMAX;
  const da = 0.5 * AMAX * ta * ta;
  let vp = VMAX;
  let tc = 0;
  if (len >= 2 * da) tc = (len - 2 * da) / VMAX;
  else vp = Math.sqrt(AMAX * len);
  const t1 = vp / AMAX;
  const T = 2 * t1 + tc;
  if (t <= 0) return { d: 0, v: 0, T };
  if (t < t1) return { d: 0.5 * AMAX * t * t, v: AMAX * t, T };
  const d1 = 0.5 * AMAX * t1 * t1;
  if (t < t1 + tc) return { d: d1 + vp * (t - t1), v: vp, T };
  if (t < T) {
    const u = t - t1 - tc;
    return {
      d: d1 + vp * tc + vp * u - 0.5 * AMAX * u * u,
      v: vp - AMAX * u,
      T,
    };
  }
  return { d: len, v: 0, T };
}

const hits = (p) =>
  p.x + HALF > HUB.x0 &&
  p.x - HALF < HUB.x1 &&
  p.y + HALF > HUB.y0 &&
  p.y - HALF < HUB.y1;

// ---- the code on screen ---------------------------------------------------------------

const PAGES = {
  code: {
    file: "subsystems/DriveMechanism.java · swerve-pathfinding",
    lines: [
      "public DriveMechanism() {",
      "  Pathfinding.ensureInitialized();",
      "  // ...",
      "  AutoBuilder.configure(/* ... */);",
      "}",
      "",
      "public Command pathfindTo(Pose2d goal) {",
      "  return AutoBuilder.pathfindToPose(",
      "      goal,",
      "      new PathConstraints(",
      "          2.0, 2.0,",
      "          Math.toRadians(270), Math.toRadians(360), 12.0));",
      "}",
    ],
  },
  bind: {
    file: "opmodes/TeleopOpMode.java",
    lines: [
      "drivetrain.setDefaultCommand(",
      "    drivetrain.applyRequest(",
      "        () ->",
      "            drive",
      "                .withVelocityX(-driver.getLeftY() * maxSpeed)",
      "                .withVelocityY(-driver.getLeftX() * maxSpeed)",
      "                .withRotationalRate(",
      "                    -driver.getRightX() * maxAngularRate)));",
      "",
      "driver.a().whileTrue(",
      "    drivetrain.pathfindTo(",
      "        new Pose2d(7.5, 4.0, Rotation2d.ZERO)));",
    ],
  },
};

// ---- drawing helpers ------------------------------------------------------------------

function drawGrid(ctx, F, g, { a = 1, lit = null } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  const px = CELL * F.s;
  for (let r = 0; r < NY; r++)
    for (let c = 0; c < NX; c++) {
      const [x, y] = F.P(c * CELL, (r + 1) * CELL);
      if (g[r][c]) {
        ctx.fillStyle = alpha(C.tx3, 0.2);
        ctx.fillRect(x, y, px, px);
        ctx.strokeStyle = alpha(C.tx3, 0.32);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + px);
        ctx.lineTo(x + px, y);
        ctx.stroke();
      }
    }
  ctx.strokeStyle = alpha(C.rule, 0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= NX; c++) {
    ctx.moveTo(...F.P(c * CELL, 0));
    ctx.lineTo(...F.P(c * CELL, NY * CELL));
  }
  for (let r = 0; r <= NY; r++) {
    ctx.moveTo(...F.P(0, r * CELL));
    ctx.lineTo(...F.P(NX * CELL, r * CELL));
  }
  ctx.stroke();
  if (lit) {
    ctx.fillStyle = alpha(C.accent, 0.16);
    for (const [c, r] of lit) {
      const [x, y] = F.P(c * CELL, (r + 1) * CELL);
      ctx.fillRect(x + 1, y + 1, px - 2, px - 2);
    }
  }
  ctx.restore();
}

function drawHub(ctx, F) {
  const [x0, y0] = F.P(HUB.x0, HUB.y1);
  const [x1, y1] = F.P(HUB.x1, HUB.y0);
  ctx.fillStyle = C.bg3;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  ctx.strokeStyle = C.tx2;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  text(ctx, "hub", (x0 + x1) / 2, (y0 + y1) / 2 + 7, {
    font: MONO,
    size: 20,
    weight: 600,
    align: "center",
    color: C.tx2,
  });
}

function drawRoute(
  ctx,
  F,
  pts,
  { color = C.accent, width = 4, dash = null, a = 1 } = {}
) {
  if (!pts) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach((p, i) =>
    i ? ctx.lineTo(...F.P(p.x, p.y)) : ctx.moveTo(...F.P(p.x, p.y))
  );
  ctx.stroke();
  ctx.restore();
}

function ring(ctx, F, p, rad, label, color = C.tx3) {
  const [x, y] = F.P(p.x, p.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(x, y, rad * F.s, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.setLineDash([]);
  if (label)
    text(ctx, label, x, y - rad * F.s - 10, {
      font: MONO,
      size: 17,
      align: "center",
      color,
    });
}

// the robot as the grid sees it: a center dot, and the bumper riding around it
function drawBot(
  ctx,
  F,
  p,
  { vx = 0, vy = 0, bumper = true, dot = false, contact = false } = {}
) {
  if (bumper)
    drawSwerveRobot(
      ctx,
      F,
      { x: p.x, y: p.y, theta: 0 },
      { modules: swerveModules(vx, vy, 0), maxSpeed: 2.5 }
    );
  if (contact) {
    const [x, y] = F.P(p.x, p.y);
    const h = HALF * F.s;
    ctx.strokeStyle = C.err;
    ctx.lineWidth = 5;
    ctx.strokeRect(x - h - 4, y - h - 4, 2 * h + 8, 2 * h + 8);
    text(ctx, "contact", x, y + h + 30, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "center",
      color: C.err,
    });
  }
  if (dot) {
    const [x, y] = F.P(p.x, p.y);
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, 2 * Math.PI);
    ctx.fillStyle = C.accent;
    ctx.fill();
  }
}

function drawPad(ctx, a) {
  ctx.save();
  ctx.translate(PAD.x, PAD.y);
  ctx.scale(PAD.s, PAD.s);
  drawController(ctx, { x: 0, y: 0, w: 440, h: 270 }, { label: false });
  if (a) {
    const bx = 440 - 110;
    ctx.beginPath();
    ctx.arc(bx, 148, 15, 0, 2 * Math.PI);
    ctx.fillStyle = C.accent;
    ctx.fill();
    text(ctx, "A", bx, 154, {
      font: MONO,
      size: 15,
      weight: 600,
      align: "center",
      color: C.accentInk,
    });
  }
  ctx.restore();
  text(ctx, a ? "A held" : "A up", PAD.x + 92, PAD.y + 150, {
    font: MONO,
    size: 18,
    weight: 600,
    align: "center",
    color: a ? C.accent : C.tx3,
  });
}

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");

  const GRID = makeGrid();
  const MAIN = plan(GRID, START, GOAL);
  const THIN_GRID = makeGrid(0.15);
  const THIN = plan(THIN_GRID, START, GOAL);
  const WALL_GRID = makeGrid(SHIPPED, true);
  const WALL = plan(WALL_GRID, START, GOAL);

  // robot time on a run: A down at PRESS, the search runs to FOUND, then it drives
  const PRESS = 0.3;
  const FOUND = 0.65;
  const R1 = 0.95;
  const R2 = 1.5;
  const MT = along(MAIN.len, 0).T;
  const RELEASE = FOUND + MT * 0.5;

  // where a run is at robot time u: { p, vx, vy, route, phase }
  function runAt(P, u, { release = null, refine = true } = {}) {
    const route = !P.raw
      ? null
      : !refine
        ? P.r2
        : u < R1
          ? P.raw
          : u < R2
            ? P.r1
            : P.r2;
    if (u < FOUND || !P.raw)
      return {
        p: START,
        vx: 0,
        vy: 0,
        route: u >= FOUND ? route : null,
        phase: u < PRESS ? "idle" : "search",
        held: u >= PRESS,
      };
    const tt = u - FOUND;
    if (release != null && u > release) {
      // no stop from the pathfind: one loop on the last request, then the default sends zero
      const tr = release - FOUND;
      const a = along(P.len, tr);
      const q = pointAt(P.r2, a.d);
      const vx = q.ux * a.v;
      const vy = q.uy * a.v;
      const dt = u - release;
      const coast = Math.min(dt, 0.02);
      const k = dt > 0.02 ? Math.exp(-(dt - 0.02) / 0.1) : 1;
      const dd = coast + (dt > 0.02 ? 0.1 * (1 - k) : 0);
      return {
        p: { x: q.x + vx * dd, y: q.y + vy * dd },
        vx: vx * k,
        vy: vy * k,
        route: null,
        phase: dt > 0.02 ? "default" : "latched",
        held: false,
      };
    }
    const a = along(P.len, tt);
    const q = pointAt(P.r2, a.d);
    const near = Math.hypot(GOAL.x - q.x, GOAL.y - q.y) < 2;
    return {
      p: q,
      vx: q.ux * a.v,
      vy: q.uy * a.v,
      route,
      phase: tt >= a.T ? "arrived" : near ? "near" : "drive",
      held: true,
    };
  }

  // narration -> robot time
  function mapKeys(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [ta, ua] = keys[i - 1];
      const [tb, ub] = keys[i];
      if (t <= tb) return ua + ((ub - ua) * (t - ta)) / (tb - ta);
    }
    return keys.at(-1)[1];
  }
  const g0 = gate?.t0 ?? 1e9;
  const g1 = gate?.t1 ?? 1e9;
  const GSPLIT = g0 + 4.0;
  const segs = [
    {
      t0: 0,
      t1: L("margin").t0 - 0.2,
      P: MAIN,
      keys: [
        [L("intro").t0 + 0.6, PRESS],
        [L("intro").t1, FOUND + MT + 0.3],
      ],
      refine: false,
    },
    {
      t0: L("margin").t0 - 0.2,
      t1: L("search").t0 - 0.2,
      P: MAIN,
      keys: [
        [L("margin").t0, FOUND + MT * 0.18],
        [L("margin").t1, FOUND + MT * 0.5],
      ],
      refine: false,
      margin: true,
    },
    {
      t0: L("search").t0 - 0.2,
      t1: L("code").t0 - 0.2,
      P: MAIN,
      keys: [
        [L("search").t0, PRESS],
        [Wd("search", "route,") + 0.2, FOUND],
        [Wd("search", "close"), FOUND + MT * 0.62],
        [L("search").t1 + 0.4, FOUND + MT + 0.2],
      ],
    },
    {
      t0: L("code").t0 - 0.2,
      t1: L("letgo").t0 - 0.2,
      P: MAIN,
      keys: [
        [L("hold").t0, 0],
        [L("hold").t1, FOUND + MT + 0.3],
      ],
    },
    {
      t0: L("letgo").t0 - 0.2,
      t1: L("tryit").t0,
      P: MAIN,
      release: true,
      keys: [
        [L("letgo").t0, FOUND + 0.2],
        [Wd("letgo", "halfway.") + 0.1, RELEASE - 0.01],
        [Wd("letgo", "path") + 0.2, RELEASE + 0.03],
        [L("letgo").t1, RELEASE + 0.5],
      ],
    },
    { t0: L("tryit").t0, t1: g0, P: MAIN, keys: [[0, 0]] },
    {
      t0: g0,
      t1: GSPLIT,
      P: THIN,
      keys: [
        [g0 + 0.5, FOUND],
        [GSPLIT - 0.3, FOUND + along(THIN.len, 0).T],
      ],
      refine: false,
      grid: THIN_GRID,
      label: "margin 0.15 m",
    },
    {
      t0: GSPLIT,
      t1: g1,
      P: WALL,
      keys: [
        [GSPLIT + 0.4, FOUND],
        [g1 - 0.2, FOUND + along(WALL.len, 0).T],
      ],
      refine: false,
      grid: WALL_GRID,
      label: "walled off",
    },
    {
      t0: g1,
      t1: L("close").t0,
      P: THIN,
      keys: [
        [L("shapes").t0, FOUND + along(THIN.len, 0).T * 0.25],
        [L("shapes").t1, FOUND + along(THIN.len, 0).T * 0.55],
      ],
      refine: false,
      grid: THIN_GRID,
      label: "margin 0.15 m",
      shapes: true,
    },
    {
      t0: L("close").t0,
      t1: VOICE.duration + 1,
      P: MAIN,
      keys: [[0, FOUND + MT + 0.3]],
      refine: false,
    },
  ];
  function viewAt(t) {
    const seg = segs.find((g) => t >= g.t0 && t < g.t1) ?? segs[0];
    const u = mapKeys(seg.keys, t);
    const r = runAt(seg.P, u, {
      release: seg.release ? RELEASE : null,
      refine: seg.refine !== false,
    });
    return { ...r, u, seg, grid: seg.grid ?? GRID, P: seg.P };
  }

  // ---- camera ------------------------------------------------------------------
  const FULL = { x: 960, y: 470, z: 1.0 };
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("margin").t0 - 0.2, x: 560, y: 620, z: 1.55, d: 1.2 },
    { t: L("search").t0 - 0.3, ...FULL, d: 1.0 },
    { t: L("code").t0 - 0.2, x: 1500, y: 250, z: 1.5, d: 1.2 },
    { t: L("hold").t0 - 0.2, ...FULL, d: 0.8 },
    { t: L("letgo").t0 - 0.2, x: 1100, y: 520, z: 1.1, d: 1.0 },
    { t: L("tryit").t0 - 0.2, ...FULL, d: 1.0 },
    { t: L("shapes").t0 - 0.2, x: 560, y: 560, z: 1.45, d: 1.2 },
    { t: L("close").t0 - 0.4, ...FULL, d: 0.8 },
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawFieldPanel(ctx, t, V, live) {
    const F = drawField(ctx, FIELD, { view: VIEW, grid: 0, labels: false });
    ctx.save();
    ctx.beginPath();
    ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h);
    ctx.clip();
    const g = live ? live.grid : V.grid;
    // the search, cell by cell from the robot outward
    let lit = null;
    if (!live && V.phase === "search" && V.P.order) {
      const k = clamp((V.u - PRESS) / (FOUND - PRESS));
      lit = V.P.order.slice(0, Math.floor(k * V.P.order.length));
    } else if (!live && V.seg === segs[2] && V.u >= FOUND && V.u < R1)
      lit = V.P.order;
    drawGrid(ctx, F, g, { lit });
    drawHub(ctx, F);
    drawSwerveRobot(ctx, F, GOAL, {
      ghost: true,
      label: "goal (7.5, 4.0, 0°)",
    });
    const showRings =
      live || (t >= Wd("search", "refining") - 0.3 && t < L("code").t0);
    if (showRings) ring(ctx, F, GOAL, 2, "2 m · refining stops", C.tx3);
    const route = live ? live.route : V.route;
    const s = live ?? V;
    // trail
    if (!live && V.u > FOUND && V.P.raw) {
      ctx.fillStyle = alpha(C.accent, 0.45);
      for (let u = FOUND; u < V.u; u += 0.05) {
        const q = runAt(V.P, u, {
          release: V.seg.release ? RELEASE : null,
          refine: false,
        }).p;
        const [px, py] = F.P(q.x, q.y);
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }
    if (route) {
      const fresh =
        !live &&
        ((V.u >= R1 && V.u < R1 + 0.15) || (V.u >= R2 && V.u < R2 + 0.15)) &&
        V.seg.refine !== false;
      drawRoute(ctx, F, route, { width: fresh ? 6 : 4 });
    }
    const contact = hits(s.p);
    const marginOn = !live && V.seg.margin;
    drawBot(ctx, F, s.p, {
      vx: s.vx,
      vy: s.vy,
      dot: marginOn || (!live && V.seg.shapes) || (live && live.margin < 0.4),
      contact,
    });
    if (marginOn) {
      const [x, y] = F.P(s.p.x, s.p.y);
      text(ctx, "center: open squares only", x, y - 70, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: C.accent,
      });
      text(ctx, "bumper clears the hub", x, y + 76, {
        font: MONO,
        size: 18,
        weight: 600,
        align: "center",
        color: C.tx,
      });
    }
    // labels for the search line
    if (!live && V.seg === segs[2]) {
      const msg =
        V.phase === "search"
          ? "searching…"
          : V.u < R1
            ? "first route"
            : V.u < R2
              ? "refined"
              : V.phase === "near" || V.phase === "arrived"
                ? "inside 2 m · route frozen"
                : "refined again";
      text(ctx, msg, FIELD.x + 30, FIELD.y + 120, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.accent,
      });
    }
    if (!live && V.seg.label)
      text(ctx, V.seg.label, FIELD.x + 30, FIELD.y + 120, {
        font: MONO,
        size: 22,
        weight: 600,
        color: V.seg.P === THIN ? C.err : C.accent,
      });
    if (live) {
      text(
        ctx,
        `margin ${live.margin.toFixed(2)} m${live.wall ? " · walled off" : ""}`,
        FIELD.x + 30,
        FIELD.y + 120,
        {
          font: MONO,
          size: 22,
          weight: 600,
          color: live.margin < HALF ? C.err : C.accent,
        }
      );
      if (!live.route)
        text(
          ctx,
          "no route · it sends nothing and holds the drivetrain",
          FIELD.x + 30,
          FIELD.y + 156,
          { font: MONO, size: 20, weight: 600, color: C.err }
        );
    }
    ctx.restore();
    // a note beside the shapes replay
    if (!live && V.seg.shapes) {
      const k = easeOut(ramp(t, Wd("shapes", "size") - 0.3, 0.5));
      rrect(ctx, FIELD.x + 30, FIELD.y + 150, 560, 96, 4);
      ctx.fillStyle = alpha(C.bg, 0.9 * k);
      ctx.fill();
      text(
        ctx,
        "margin 0.15 m < half the robot (0.42 m)",
        FIELD.x + 50,
        FIELD.y + 186,
        {
          font: MONO,
          size: 19,
          color: C.tx,
          a: easeOut(ramp(t, L("shapes").t0, 0.4)),
        }
      );
      text(
        ctx,
        'settings.json  "robotWidth": 0.84',
        FIELD.x + 50,
        FIELD.y + 224,
        { font: MONO, size: 19, weight: 600, color: C.accent, a: k }
      );
    }
    return F;
  }

  function codeState(t) {
    if (t < L("code").t0 - 0.2) return { page: "code", hot: [] };
    if (t < L("hold").t0 - 0.2)
      return {
        page: "code",
        hot: t < Wd("code", "then") ? [1] : [6, 7, 8, 9, 10, 11],
      };
    if (t < L("letgo").t0 - 0.2) return { page: "bind", hot: [9, 10, 11] };
    return {
      page: "bind",
      hot:
        t >= Wd("letgo", "default") - 0.2
          ? [0, 1, 2, 3, 4, 5, 6, 7]
          : [9, 10, 11],
    };
  }

  function drawCode(ctx, t) {
    panel(ctx, CODE);
    const st = codeState(t);
    const pg = PAGES[st.page];
    micro(ctx, pg.file, CODE.x + 24, CODE.y + 38, { size: 16 });
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 56, CODE.w, 1);
    let y = CODE.y + 90;
    pg.lines.forEach((ln, i) => {
      if (!ln) {
        y += LH / 2;
        return;
      }
      if (st.hot.includes(i))
        runBar(ctx, CODE.x + 1, y - 19, CODE.w - 2, LH, 0);
      codeLine(ctx, ln, CODE.x + 24, y, {
        size: CODE_SIZE,
        a: st.hot.length && !st.hot.includes(i) ? 0.55 : 1,
      });
      y += LH;
    });
  }

  // who owns the drivetrain, in robot time
  function drawLanes(ctx, V, live) {
    const u = live ? live.u : V.u;
    const bars = [];
    const press = live ? live.pressAt : PRESS;
    const rel = live ? null : V.seg.release ? RELEASE : null;
    const end = live ? null : V.P.raw ? FOUND + along(V.P.len, 0).T : null;
    bars.push({
      lane: 0,
      start: -3,
      end: press,
      label: "default",
      state: "done",
    });
    if (rel != null) {
      bars.push({
        lane: 0,
        start: press,
        end: rel,
        label: "pathfindTo",
        state: "cancel",
      });
      bars.push({
        lane: 0,
        start: rel + 0.02,
        end: null,
        label: "default · sticks → 0",
        open: true,
      });
    } else {
      bars.push({
        lane: 0,
        start: press,
        end: end,
        label: "pathfindTo",
        open: true,
        state: "done",
      });
      if (end != null && u > end)
        bars.push({
          lane: 0,
          start: end,
          end: null,
          label: "default",
          open: true,
        });
    }
    const span = 5;
    drawTimeline(ctx, LANES, {
      lanes: ["Drivetrain"],
      bars,
      view: { t0: Math.max(-1.6, u - span + 1), span },
      now: u,
      title: "scheduler · robot clock",
    });
  }

  function drawCard(ctx, t, V, live) {
    panel(ctx, CARD, C.bg2);
    const s = live ?? V;
    micro(ctx, "drivetrain · this loop", CARD.x + 22, CARD.y + 34);
    let req = "nothing new";
    let col = C.tx3;
    let note = "";
    if (live) {
      req = live.route ? "ApplyRobotVelocity" : "nothing · no route";
      col = live.route ? C.accent : C.err;
      note = live.route
        ? `${Math.hypot(live.vx, live.vy).toFixed(2)} m/s along the route`
        : "the last request stays on";
    } else if (V.phase === "drive" || V.phase === "near") {
      req = "ApplyRobotVelocity";
      col = C.accent;
      note = `${Math.hypot(s.vx, s.vy).toFixed(2)} m/s along the route`;
    } else if (V.phase === "arrived") {
      req = "ApplyRobotVelocity · zero";
      col = C.accent;
      note = "finished at the goal";
    } else if (V.phase === "latched") {
      req = "nothing · canceled";
      col = C.err;
      note = "last request still on the modules";
    } else if (V.phase === "default") {
      req = "default · sticks centered";
      col = C.accent;
      note = "sends zero";
    } else if (V.phase === "search") {
      req = "nothing yet · searching";
      note = "";
    }
    text(ctx, req, CARD.x + 22, CARD.y + 86, {
      font: MONO,
      size: 26,
      weight: 600,
      color: col,
    });
    text(ctx, note, CARD.x + 22, CARD.y + 128, {
      font: MONO,
      size: 20,
      color: C.tx2,
    });
  }

  // recorded beat: PathPlanner's Navigation Grid page, and navgrid.json in VS Code
  function recGrid(ctx, t) {
    const a = window_(t, L("grid").t0 - 0.3, L("margin").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.94);
    ctx.fillRect(0, 0, W, H);
    const R = { x: 120, y: 60, w: 1180, h: 820 };
    drawToolWindow(ctx, R, { app: "PathPlanner", title: "Navigation Grid" });
    const F = drawField(
      ctx,
      { x: R.x + 20, y: R.y + 70, w: R.w - 40, h: R.h - 90 },
      {
        view: { x0: 0.6, y0: 0.6, x1: 9.0, y1: 7.5 },
        grid: 0,
        axes: false,
        labels: false,
      }
    );
    ctx.save();
    ctx.beginPath();
    ctx.rect(R.x + 20, R.y + 70, R.w - 40, R.h - 90);
    ctx.clip();
    drawGrid(ctx, F, GRID);
    drawHub(ctx, F);
    // hover one blocked square at the band's edge
    if (t >= Wd("grid", "marks") - 0.1) {
      const [x, y] = F.P(11 * CELL, 13 * CELL);
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, CELL * F.s, CELL * F.s);
      text(ctx, "blocked", x - 10, y - 12, {
        font: MONO,
        size: 20,
        weight: 600,
        align: "right",
        color: C.accent,
      });
    }
    ctx.restore();
    const k = easeOut(ramp(t, Wd("grid", "thirty") - 0.4, 0.5));
    drawToolWindow(
      ctx,
      { x: 1340, y: 200, w: 480, h: 190 },
      {
        app: "VS Code",
        title: "navgrid.json",
        rows: [
          { label: '"field_size"', value: "16.54 × 8.07" },
          {
            label: '"nodeSizeMeters"',
            value: "0.3",
            hot: t >= Wd("grid", "thirty") - 0.2,
          },
        ],
        a: k,
      }
    );
    ctx.restore();
  }

  // recorded beat: AdvantageScope 2D Field with Drivetrain/Pose, holding A
  function recHold(ctx, t, V) {
    const a = window_(t, L("hold").t0 - 0.3, L("letgo").t0 - 0.2, 0.4);
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = alpha(C.bg, 0.94);
    ctx.fillRect(0, 0, W, H);
    const R = { x: 160, y: 60, w: 1600, h: 820 };
    drawToolWindow(ctx, R, {
      app: "AdvantageScope",
      title: "2D Field · Drivetrain/Pose",
    });
    const F = drawField(
      ctx,
      { x: R.x + 20, y: R.y + 70, w: R.w - 40, h: R.h - 90 },
      { labels: false, grid: 0 }
    );
    drawHub(ctx, F);
    ctx.fillStyle = alpha(C.accent, 0.8);
    for (let u = FOUND; u < V.u; u += 0.03) {
      const q = runAt(MAIN, u, { refine: false }).p;
      const [px, py] = F.P(q.x, q.y);
      ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
    }
    drawSwerveRobot(ctx, F, { ...V.p, theta: 0 }, {});
    text(ctx, "Teleop · enabled · A held", R.x + R.w - 30, R.y + R.h - 26, {
      font: MONO,
      size: 20,
      weight: 600,
      align: "right",
      color: C.accent,
    });
    ctx.restore();
  }

  function titleCard(ctx, t) {
    const a = 1 - easeInOut(ramp(t, L("intro").t0 - 0.6, 0.6));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    const k = easeOut(ramp(t, 0.15, 0.9));
    micro(ctx, "Workshop 6 · Pathfinding", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Starting From Anywhere", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Pathfinding crosses the field.", W / 2, 450, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "The last few centimeters", W / 2, 556, {
      font: SERIF,
      size: 84,
      align: "center",
      color: C.accent,
    });
    text(ctx, "belong to a command built for them.", W / 2, 660, {
      size: 34,
      align: "center",
      color: C.tx2,
      a: easeOut(ramp(t, Wd("close", "belong") - 0.1, 0.6)),
    });
    ctx.restore();
  }

  function draw(ctx, t, live = null) {
    const V = live ? null : viewAt(t);
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawFieldPanel(ctx, t, V, live);
    drawCode(ctx, live ? L("hold").t0 : t);
    drawLanes(ctx, V, live);
    drawCard(ctx, t, V, live);
    drawPad(ctx, live ? true : V.held);
    ctx.restore();
    vignette(ctx);
    if (live) return;
    recGrid(ctx, t);
    recHold(ctx, t, V);
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  // ---- the gate ---------------------------------------------------------------------

  function liveGate() {
    const s = {
      time: gate.t0,
      u: 0,
      margin: SHIPPED,
      wall: false,
      grid: GRID,
      route: MAIN.r2,
      len: MAIN.len,
      d: 0,
      v: 0,
      p: { ...START },
      vx: 0,
      vy: 0,
      pressAt: 0,
      changed: false,
      arrivedAt: null,
      changedAt: null,
    };
    let doneAt = null;
    const replan = () => {
      // after it has arrived, a new grid starts a new run from the start
      if (s.arrivedAt != null) {
        s.p = { ...START };
        s.v = 0;
      }
      s.grid = makeGrid(s.margin, s.wall);
      const P = plan(s.grid, s.p, GOAL);
      s.route = P.raw ? P.r2 : null;
      s.len = P.raw ? P.len : 0;
      s.d = 0;
      s.changed = true;
      s.changedAt = s.time;
      s.arrivedAt = null;
    };
    return {
      state: s,
      prompt: () => {
        if (doneAt != null)
          return hits(s.p) || s.hit
            ? "Too thin: the center fit, the bumper didn't."
            : "It found its own way to the goal.";
        if (!s.changed)
          return "Widen or narrow the margin, or wall off the short way (W).";
        if (!s.route) return "No route: it sits on its last request.";
        return s.margin < HALF
          ? "Thinner than the robot: watch the bumper."
          : "It re-plans from where it is.";
      },
      input(k, v) {
        if (k === "margin") {
          s.margin = v;
          replan();
        }
        if (k === "wall" && v) {
          s.wall = !s.wall;
          replan();
        }
      },
      step(dt) {
        s.time += dt;
        s.u += dt;
        // A goes down when they change something, or after three seconds
        const go = s.changed || s.time - gate.t0 > 3;
        if (s.route && go) {
          const rem = s.len - s.d;
          s.v = Math.min(
            s.v + AMAX * dt,
            VMAX,
            Math.sqrt(Math.max(0, 2 * AMAX * rem))
          );
          s.d = Math.min(s.len, s.d + s.v * dt);
          const q = pointAt(s.route, s.d);
          s.p = { x: q.x, y: q.y };
          s.vx = q.ux * s.v;
          s.vy = q.uy * s.v;
          if (hits(s.p)) s.hit = true;
          if (rem < 0.005 && s.arrivedAt == null) s.arrivedAt = s.time;
        }
        // after it arrives, start again from the start so the student can try another grid
        if (
          s.arrivedAt != null &&
          s.time - s.arrivedAt > 1.2 &&
          doneAt == null
        ) {
          if (s.changed) doneAt = s.time;
          else {
            s.p = { ...START };
            s.d = 0;
            s.v = 0;
            s.arrivedAt = null;
          }
        }
        if (
          !s.route &&
          s.changed &&
          s.time - s.changedAt > 2.5 &&
          doneAt == null
        )
          doneAt = s.time;
        return doneAt !== null && s.time - doneAt > 1.8;
      },
    };
  }

  function gatePromptAt(t) {
    if (!gate || t < gate.t0 || t >= gate.t1) return null;
    if (t < g0 + 0.5) return "Narrow the margin, or wall off the short way.";
    if (t < GSPLIT) return "0.15 m: the center fits, the bumper hits the hub.";
    return "Walled off: it finds the long way round.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      {
        k: "margin",
        label: "Margin (m)",
        kind: "range",
        min: 0.15,
        max: 1.05,
        step: 0.3,
        value: SHIPPED,
      },
      { k: "wall", label: "Wall off", key: "KeyW", kind: "press" },
    ],
  };
}
