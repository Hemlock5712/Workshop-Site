// The series' shared pieces: every video draws the same controller, arm, motor
// card and code panel, so a student who has seen one video can read the next.
// Lifted from lessons/latched (which still carries its own copies).

import { C, MONO, SANS, alpha, micro, rrect, text } from "./core.js";

// ---- code -------------------------------------------------------------------------

const KEYWORD = /^(public|private|return|void|double|final|new)$/;

export function codeLine(ctx, s, x, y, { a = 1, size = 21 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `500 ${size}px ${MONO}`;
  let cx = x;
  for (const p of s.split(
    /("[^"]*"|\b(?:public|private|return|void|double|final|new)\b)/
  )) {
    if (!p) continue;
    ctx.fillStyle = p.startsWith('"') ? C.tx2 : KEYWORD.test(p) ? C.tx3 : C.tx;
    ctx.fillText(p, cx, y);
    cx += ctx.measureText(p).width;
  }
  ctx.restore();
  return cx;
}

export function codeWidth(ctx, s, size = 21) {
  ctx.font = `500 ${size}px ${MONO}`;
  return ctx.measureText(s).width;
}

// A highlight bar behind a running line; `pulse` 0..1 brightens it once per loop.
export function runBar(ctx, x, y, w, h, pulse = 0) {
  ctx.fillStyle = alpha(C.accent, 0.08 + 0.12 * pulse);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.accent;
  ctx.fillRect(x, y, 4, h);
}

export function panel(ctx, { x, y, w, h }, fill = "oklch(0.13 0.03 265)") {
  rrect(ctx, x, y, w, h, 6);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ---- the driver's controller ----------------------------------------------------------

export function drawController(
  ctx,
  { x, y, w = 440, h = 270 },
  {
    lt = false,
    rt = false,
    lb = false,
    rb = false,
    left = null,
    right = null,
    y: yBtn = false,
    label = true,
  } = {}
) {
  const cx = x + w / 2;
  micro(ctx, "driver · port 0", x, y - 18);
  const trig = (tx, held, name) => {
    const dy = held ? 10 : 0;
    rrect(ctx, tx, y + 8 + dy, 86, 46, 10);
    ctx.fillStyle = held ? C.accent : C.bg3;
    ctx.fill();
    ctx.strokeStyle = held ? C.accent : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, name, tx + 43, y + 38 + dy, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "center",
      color: held ? C.accentInk : C.tx3,
    });
  };
  trig(x + 58, lt, "LT");
  trig(x + w - 144, rt, "RT");
  ctx.beginPath();
  ctx.moveTo(x + 70, y + 70);
  ctx.bezierCurveTo(x + 150, y + 52, x + w - 150, y + 52, x + w - 70, y + 70);
  ctx.bezierCurveTo(
    x + w - 10,
    y + 90,
    x + w + 10,
    y + 230,
    x + w - 40,
    y + h - 6
  );
  ctx.bezierCurveTo(
    x + w - 80,
    y + h + 10,
    x + w - 120,
    y + 230,
    x + w - 150,
    y + 200
  );
  ctx.lineTo(x + 150, y + 200);
  ctx.bezierCurveTo(x + 120, y + 230, x + 80, y + h + 10, x + 40, y + h - 6);
  ctx.bezierCurveTo(x - 10, y + 230, x + 10, y + 90, x + 70, y + 70);
  ctx.closePath();
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.strokeStyle = lt || rt ? alpha(C.accent, 0.7) : C.rule;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // bumpers along the top edge of the body, drawn only while pressed
  for (const [bx, on, name] of [
    [x + 70, lb, "LB"],
    [x + w - 150, rb, "RB"],
  ]) {
    if (!on) continue;
    rrect(ctx, bx, y + 60, 80, 20, 6);
    ctx.fillStyle = C.accent;
    ctx.fill();
    text(ctx, name, bx + 40, y + 75, {
      font: MONO,
      size: 14,
      weight: 600,
      align: "center",
      color: C.accentInk,
    });
  }
  const ring = (px, py, r) => {
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  ring(x + 120, y + 120, 30);
  ring(x + w - 175, y + 175, 30);
  // stick knobs: { x, y } in -1..1, up is +y
  for (const [st, sx, sy] of [
    [left, x + 120, y + 120],
    [right, x + w - 175, y + 175],
  ]) {
    const k = st ?? { x: 0, y: 0 };
    const on = Math.hypot(k.x, k.y) > 0.05;
    ctx.beginPath();
    ctx.arc(sx + k.x * 16, sy - k.y * 16, 17, 0, Math.PI * 2);
    ctx.fillStyle = on ? C.accent : C.bg2;
    ctx.fill();
    ctx.strokeStyle = on ? C.accent : C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = C.bg3;
  ctx.fillRect(x + 160, y + 165, 50, 16);
  ctx.fillRect(x + 177, y + 148, 16, 50);
  for (const [l, dx, dy] of [
    ["Y", 0, -28],
    ["X", -28, 0],
    ["B", 28, 0],
    ["A", 0, 28],
  ]) {
    ring(x + w - 110 + dx, y + 120 + dy, 15);
    const lit = (l === "Y" && yBtn) || (l === "A" && false);
    if (lit) {
      ctx.beginPath();
      ctx.arc(x + w - 110 + dx, y + 120 + dy, 15, 0, Math.PI * 2);
      ctx.fillStyle = C.accent;
      ctx.fill();
    }
    text(ctx, l, x + w - 110 + dx, y + 126 + dy, {
      font: MONO,
      size: 15,
      weight: 600,
      align: "center",
      color: lit ? C.accentInk : C.tx3,
    });
  }
  ring(cx, y + 104, 14);
  if (label)
    text(ctx, lt ? "left trigger held" : "left trigger up", cx, y + h + 44, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: lt ? C.accent : C.tx3,
    });
}

// ---- the arm --------------------------------------------------------------------------

// Angles are the course's: rotations on the unit circle, 0 pointing right,
// counterclockwise positive, 0.25 straight up. This turns one into a canvas rotation
// for an arm drawn along +y.
export const armRotation = (rot) => -rot * 2 * Math.PI - Math.PI / 2;

export function drawStand(ctx, P, floor = 790) {
  ctx.fillStyle = C.bg3;
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(P.x - 26, P.y);
  ctx.lineTo(P.x - 70, floor);
  ctx.lineTo(P.x + 70, floor);
  ctx.lineTo(P.x + 26, P.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.rule;
  ctx.fillRect(P.x - 170, floor, 340, 10);
}

export function drawArmBody(
  ctx,
  P,
  len,
  rot,
  { ghost = false, history = [], driven = false } = {}
) {
  for (const [k, r] of history.entries()) {
    ctx.save();
    ctx.translate(P.x, P.y);
    ctx.rotate(armRotation(r));
    ctx.globalAlpha = 0.06 + k * 0.035;
    ctx.fillStyle = C.accent;
    rrect(ctx, -16, 0, 32, len, 16);
    ctx.fill();
    ctx.restore();
  }
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.rotate(armRotation(rot));
  if (ghost) {
    ctx.setLineDash([8, 7]);
    ctx.strokeStyle = alpha(C.accent, 0.75);
    ctx.lineWidth = 2.5;
    rrect(ctx, -17, -17, 34, len + 17, 17);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return;
  }
  ctx.fillStyle = C.tx2;
  rrect(ctx, -17, -17, 34, len + 17, 17);
  ctx.fill();
  ctx.fillStyle = C.bg3;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(0, (len * i) / 5, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(P.x, P.y, 44, 0, Math.PI * 2);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = driven ? C.accent : C.rule;
  ctx.stroke();
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.rotate(armRotation(rot));
  ctx.strokeStyle = C.tx3;
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
  }
  ctx.restore();
}

// A tick on the circle the arm sweeps, at `rot`, with a label.
export function drawTargetMark(ctx, P, len, rot, label, a = 1) {
  const ang = rot * 2 * Math.PI;
  const r0 = len + 30;
  const r1 = len + 62;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(P.x + Math.cos(ang) * r0, P.y - Math.sin(ang) * r0);
  ctx.lineTo(P.x + Math.cos(ang) * r1, P.y - Math.sin(ang) * r1);
  ctx.stroke();
  text(
    ctx,
    label,
    P.x + Math.cos(ang) * (r1 + 16) + 14,
    P.y - Math.sin(ang) * (r1 + 16) + 8,
    { font: MONO, size: 20, weight: 600, color: C.accent }
  );
  ctx.restore();
}

// ---- the motor controller card ------------------------------------------------------

// rows: [[microLabel, value, color?], ...] under a title; `lit` 0..1 rings it.
export function drawMotorCard(
  ctx,
  { x, y, w, h },
  {
    title = "TalonFX 31 · motor controller",
    rows = [],
    led = C.tx3,
    lit = 0,
  } = {}
) {
  rrect(ctx, x, y, w, h, 6);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.strokeStyle = lit ? alpha(C.accent, 0.35 + 0.65 * lit) : C.rule;
  ctx.lineWidth = 2 + 2 * lit;
  ctx.stroke();
  micro(ctx, title, x + 24, y + 40, { size: 16 });
  ctx.beginPath();
  ctx.arc(x + w - 30, y + 34, 9, 0, Math.PI * 2);
  ctx.fillStyle = led;
  ctx.fill();
  let ry = y + 92;
  for (const [label, value, color, size = 30] of rows) {
    micro(ctx, label, x + 24, ry);
    text(ctx, value, x + 24, ry + size + 12, {
      font: MONO,
      size,
      weight: 600,
      color: color ?? C.tx,
    });
    ry += size + 52;
  }
}

// ---- the flywheel -------------------------------------------------------------------

// A shooter wheel seen face-on. `angle` in radians (it spins); `rps` drives the blur.
export function drawFlywheel(
  ctx,
  { x, y },
  r,
  angle,
  { rps = 0, driven = false, label = "" } = {}
) {
  // axle stand
  ctx.fillStyle = C.bg3;
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 2;
  rrect(ctx, x - 18, y, 36, r + 120, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.rule;
  ctx.fillRect(x - 150, y + r + 120, 300, 10);
  // speed blur: a soft ring that grows with speed
  const blur = Math.min(1, Math.abs(rps) / 60);
  if (blur > 0.02) {
    ctx.beginPath();
    ctx.arc(x, y, r - 10, 0, Math.PI * 2);
    ctx.strokeStyle = alpha(C.accent, 0.25 * blur);
    ctx.lineWidth = 26;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = driven ? C.accent : C.tx3;
  ctx.stroke();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = alpha(C.tx2, 1 - 0.6 * blur);
  ctx.lineWidth = 8;
  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(r - 12, 0);
    ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.fillStyle = driven ? C.accent : C.bg3;
  ctx.fill();
  if (label)
    text(ctx, label, x, y + r + 160, {
      font: MONO,
      size: 22,
      weight: 600,
      align: "center",
      color: driven ? C.accent : C.tx3,
    });
}

// ---- the scheduler timeline -----------------------------------------------------------

// One lane per mechanism, commands as bars over time. Used by every video that has to
// show "who owns what, when".
//   lanes: ["Arm", "Flywheel"]
//   bars:  [{ lane: 0, start, end (null = still running), label, open (a hold: no right
//            edge, fades off to the right), dashed (waiting), state: "run" | "cancel" | "done" }]
//   view:  { t0, span } seconds shown; now = playhead time
export function drawTimeline(
  ctx,
  R,
  { lanes, bars, view, now, title = "scheduler · who owns what" }
) {
  panel(ctx, R, C.bg2);
  micro(ctx, title, R.x + 24, R.y + 36);
  const left = R.x + 170;
  const right = R.x + R.w - 24;
  const top = R.y + 60;
  const laneH = Math.min(84, (R.h - 100) / lanes.length);
  const X = (u) => left + ((u - view.t0) / view.span) * (right - left);
  // lanes
  lanes.forEach((name, i) => {
    const y = top + i * laneH;
    ctx.fillStyle = i % 2 ? alpha(C.bg, 0.25) : alpha(C.bg, 0.45);
    ctx.fillRect(left, y, right - left, laneH - 8);
    text(ctx, name, R.x + 24, y + laneH / 2 + 4, {
      font: MONO,
      size: 20,
      weight: 600,
      color: C.tx2,
    });
  });
  // seconds
  ctx.fillStyle = C.tx3;
  for (let s = Math.ceil(view.t0); s <= view.t0 + view.span; s++) {
    const x = X(s);
    ctx.fillRect(x, top + lanes.length * laneH - 6, 1, 8);
    text(
      ctx,
      `${s - Math.ceil(view.t0)} s`,
      x,
      top + lanes.length * laneH + 22,
      { font: MONO, size: 15, align: "center", color: C.tx3 }
    );
  }
  // bars
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, R.y, right - left, R.h);
  ctx.clip();
  for (const b of bars) {
    if (b.start > now) continue;
    const y = top + b.lane * laneH + 8;
    const h = laneH - 24;
    const x0 = X(b.start);
    const end = b.end == null || b.end > now ? now : b.end;
    const x1 = Math.max(x0 + 2, X(end));
    const cancel = b.state === "cancel" && b.end != null && b.end <= now;
    ctx.fillStyle = cancel
      ? alpha(C.err, 0.14)
      : b.dashed
        ? alpha(C.accent, 0.06)
        : alpha(C.accent, 0.18);
    ctx.fillRect(x0, y, x1 - x0, h);
    ctx.strokeStyle = cancel ? C.err : C.accent;
    ctx.lineWidth = 2;
    if (b.dashed) ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x0, y);
    ctx.lineTo(x0, y + h);
    ctx.lineTo(x1, y + h);
    // a closed right edge only when it really ended
    if (b.end != null && b.end <= now) ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.setLineDash([]);
    // an open hold trails off: no edge, a chevron at the playhead
    if (b.open && (b.end == null || b.end > now)) {
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.moveTo(x1 + 4, y + h / 2 - 9);
      ctx.lineTo(x1 + 16, y + h / 2);
      ctx.lineTo(x1 + 4, y + h / 2 + 9);
      ctx.fill();
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y, Math.max(0, x1 - x0) + 400, h);
    ctx.clip();
    text(ctx, b.label, x0 + 12, y + h / 2 + 7, {
      font: MONO,
      size: 18,
      weight: 600,
      color: cancel ? C.err : C.tx,
    });
    ctx.restore();
  }
  ctx.restore();
  // playhead
  if (now >= view.t0 && now <= view.t0 + view.span) {
    ctx.fillStyle = C.tx;
    ctx.fillRect(X(now) - 1, top - 6, 2, lanes.length * laneH);
  }
  return { X, laneY: (i) => top + i * laneH + 8, laneH };
}

// ---- the field, top down ------------------------------------------------------------

// The FRC field seen from above, origin at the blue corner, X down the field, Y to
// the left when standing behind the blue wall. Returns helpers that map field meters
// to canvas pixels, so everything on the field is drawn in meters.
//   R      canvas rect the field fits inside
//   size   [length, width] in meters (default 16.54 x 8.07)
//   view   optional { x0, y0, x1, y1 } meters, to zoom into part of the field
export function drawField(
  ctx,
  R,
  {
    size = [16.54, 8.07],
    view = null,
    grid = 1,
    axes = true,
    labels = true,
  } = {}
) {
  const v = view ?? { x0: 0, y0: 0, x1: size[0], y1: size[1] };
  const s = Math.min(R.w / (v.x1 - v.x0), R.h / (v.y1 - v.y0));
  const ox = R.x + (R.w - (v.x1 - v.x0) * s) / 2 - v.x0 * s;
  const oy = R.y + R.h - (R.h - (v.y1 - v.y0) * s) / 2 + v.y0 * s;
  const X = (m) => ox + m * s;
  const Y = (m) => oy - m * s;
  const P = (x, y) => [X(x), Y(y)];
  ctx.save();
  ctx.beginPath();
  ctx.rect(R.x, R.y, R.w, R.h);
  ctx.clip();
  ctx.fillStyle = C.bg2;
  ctx.fillRect(X(0), Y(size[1]), size[0] * s, size[1] * s);
  if (grid) {
    ctx.strokeStyle = alpha(C.rule, 0.45);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let m = grid; m < size[0]; m += grid) {
      ctx.moveTo(X(m), Y(0));
      ctx.lineTo(X(m), Y(size[1]));
    }
    for (let m = grid; m < size[1]; m += grid) {
      ctx.moveTo(X(0), Y(m));
      ctx.lineTo(X(size[0]), Y(m));
    }
    ctx.stroke();
  }
  ctx.strokeStyle = C.tx3;
  ctx.lineWidth = 3;
  ctx.strokeRect(X(0), Y(size[1]), size[0] * s, size[1] * s);
  ctx.strokeStyle = alpha(C.tx3, 0.5);
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(X(size[0] / 2), Y(0));
  ctx.lineTo(X(size[0] / 2), Y(size[1]));
  ctx.stroke();
  ctx.setLineDash([]);
  if (labels) {
    micro(ctx, "blue wall", X(0) + 12, Y(size[1] / 2), { size: 15 });
    micro(ctx, "red wall", X(size[0]) - 12, Y(size[1] / 2), {
      size: 15,
      align: "right",
    });
  }
  if (axes) {
    // the origin is the blue corner, always, on either alliance
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    const a = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(0) + a, Y(0));
    ctx.moveTo(X(0), Y(0));
    ctx.lineTo(X(0), Y(0) - a);
    ctx.stroke();
    text(ctx, "x", X(0) + a + 8, Y(0) - 6, {
      font: MONO,
      size: 18,
      weight: 600,
      color: C.accent,
    });
    text(ctx, "y", X(0) + 8, Y(0) - a - 6, {
      font: MONO,
      size: 18,
      weight: 600,
      color: C.accent,
    });
    text(ctx, "(0, 0)", X(0) + 8, Y(0) - 10, {
      font: MONO,
      size: 15,
      color: C.accent,
    });
  }
  ctx.restore();
  return { X, Y, P, s };
}

// Robot-relative chassis velocities -> four module states (FL, FR, BL, BR).
// vx forward, vy left (m/s), omega counterclockwise (rad/s). Returns
// [{ angle (rad, robot frame), speed (m/s) }]. No angle optimisation, on purpose:
// the course never teaches it.
export function swerveModules(vx, vy, omega, halfL = 0.29, halfW = 0.29) {
  return [
    [halfL, halfW],
    [halfL, -halfW],
    [-halfL, halfW],
    [-halfL, -halfW],
  ].map(([mx, my]) => {
    const wx = vx - omega * my;
    const wy = vy + omega * mx;
    return { angle: Math.atan2(wy, wx), speed: Math.hypot(wx, wy) };
  });
}

// A swerve robot at pose { x, y, theta } (meters, radians, field frame) on a field
// from drawField. modules from swerveModules. ghost = dashed outline only, for an
// estimate, a setpoint or a goal.
export function drawSwerveRobot(
  ctx,
  F,
  pose,
  {
    modules = null,
    size = 0.84,
    ghost = false,
    color = null,
    label = "",
    maxSpeed = 4.5,
  } = {}
) {
  const [cx, cy] = F.P(pose.x, pose.y);
  const half = (size / 2) * F.s;
  const ink = color ?? (ghost ? C.accent : C.tx2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-pose.theta);
  if (ghost) {
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-half, -half, half * 2, half * 2);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(half - 2, -half * 0.5);
    ctx.lineTo(half - 2, half * 0.5);
    ctx.stroke();
    ctx.restore();
    if (label)
      text(ctx, label, cx, cy - half - 12, {
        font: MONO,
        size: 16,
        align: "center",
        color: ink,
      });
    return;
  }
  ctx.fillStyle = C.bg3;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  rrect(ctx, -half, -half, half * 2, half * 2, 4);
  ctx.fill();
  ctx.stroke();
  // the front: an accent bar on the front bumper
  ctx.fillStyle = C.accent;
  ctx.fillRect(half - 7, -half * 0.6, 7, half * 1.2);
  // modules: each wheel along its angle, an arrow for its speed (reversed when negative)
  const ms = modules ?? [0, 0, 0, 0].map(() => ({ angle: 0, speed: 0 }));
  const at = [
    [half * 0.55, -half * 0.55],
    [half * 0.55, half * 0.55],
    [-half * 0.55, -half * 0.55],
    [-half * 0.55, half * 0.55],
  ];
  ms.forEach((m, i) => {
    const [mx, my] = at[i];
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(-m.angle);
    ctx.fillStyle = C.bg;
    rrect(ctx, -half * 0.22, -half * 0.09, half * 0.44, half * 0.18, 3);
    ctx.fill();
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const len = (m.speed / maxSpeed) * half * 0.9;
    if (Math.abs(len) > 2) {
      ctx.strokeStyle = C.accent;
      ctx.fillStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();
      const d = Math.sign(len);
      ctx.beginPath();
      ctx.moveTo(len + d * 8, 0);
      ctx.lineTo(len - d * 2, -6);
      ctx.lineTo(len - d * 2, 6);
      ctx.fill();
    }
    ctx.restore();
  });
  ctx.restore();
  if (label)
    text(ctx, label, cx, cy - half - 12, {
      font: MONO,
      size: 16,
      align: "center",
      color: C.tx2,
    });
}

// x, y, heading as the robot reports it.
export function drawPoseReadout(
  ctx,
  x,
  y,
  pose,
  { title = "pose", color = C.tx } = {}
) {
  micro(ctx, title, x, y);
  const deg = (((((pose.theta * 180) / Math.PI) % 360) + 540) % 360) - 180;
  text(
    ctx,
    `x ${pose.x.toFixed(2)} m   y ${pose.y.toFixed(2)} m   θ ${deg.toFixed(0)}°`,
    x,
    y + 32,
    { font: MONO, size: 22, weight: 600, color }
  );
}

// ---- a desktop tool, drawn ---------------------------------------------------------

// A plain schematic of a tool's panel (Tuner X, PathPlanner, the Limelight page,
// AdvantageScope). It stands in for recorded footage until that is captured, so it
// uses the tool's real control names and nothing else: no logos, no invented chrome.
//   rows:    [{ label, value, hot, note }]   hot = the control being used right now
//   buttons: [{ label, hot }] along the bottom
export function drawToolWindow(
  ctx,
  R,
  {
    app = "Tuner X",
    title = "",
    rows = [],
    buttons = [],
    rowH = 52,
    a = 1,
  } = {}
) {
  ctx.save();
  ctx.globalAlpha *= a;
  rrect(ctx, R.x, R.y, R.w, R.h, 6);
  ctx.fillStyle = "oklch(0.18 0.012 265)";
  ctx.fill();
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "oklch(0.215 0.012 265)";
  ctx.fillRect(R.x + 1, R.y + 1, R.w - 2, 46);
  micro(ctx, app, R.x + 22, R.y + 30, { size: 15 });
  text(ctx, title, R.x + R.w - 22, R.y + 31, {
    font: SANS,
    size: 20,
    weight: 600,
    align: "right",
    color: C.tx,
  });
  let y = R.y + 70;
  for (const r of rows) {
    if (r.hot) {
      ctx.fillStyle = alpha(C.accent, 0.12);
      ctx.fillRect(R.x + 1, y - 4, R.w - 2, rowH - 6);
      ctx.fillStyle = C.accent;
      ctx.fillRect(R.x + 1, y - 4, 4, rowH - 6);
    }
    text(ctx, r.label, R.x + 26, y + rowH / 2 - 2, {
      font: SANS,
      size: 21,
      color: r.hot ? C.tx : C.tx2,
    });
    if (r.value != null)
      text(ctx, r.value, R.x + R.w - 26, y + rowH / 2 - 2, {
        font: MONO,
        size: 21,
        weight: 600,
        align: "right",
        color: r.hot ? C.accent : C.tx,
      });
    if (r.note)
      text(ctx, r.note, R.x + 26, y + rowH / 2 + 20, {
        font: MONO,
        size: 15,
        color: C.tx3,
      });
    y += rowH;
  }
  let bx = R.x + 22;
  for (const b of buttons) {
    ctx.font = `600 18px ${SANS}`;
    const bw = ctx.measureText(b.label).width + 36;
    rrect(ctx, bx, R.y + R.h - 62, bw, 42, 4);
    ctx.fillStyle = b.hot ? C.accent : C.bg3;
    ctx.fill();
    text(ctx, b.label, bx + bw / 2, R.y + R.h - 35, {
      font: SANS,
      size: 18,
      weight: 600,
      align: "center",
      color: b.hot ? C.accentInk : C.tx,
    });
    bx += bw + 12;
  }
  ctx.restore();
}

// A time plot. series: [{ pts: [[t, v]], color, dashed, label, width }].
// Returns { X, Y } mapping time and value to canvas pixels.
export function drawPlot(
  ctx,
  R,
  {
    series = [],
    t0 = 0,
    t1 = 5,
    v0 = 0,
    v1 = 1,
    title = "",
    playhead = null,
  } = {}
) {
  panel(ctx, R, C.bg2);
  if (title) micro(ctx, title, R.x + 22, R.y + 34);
  const L = R.x + 50;
  const B = R.y + R.h - 34;
  const T = R.y + 52;
  const Rt = R.x + R.w - 24;
  const X = (t) => L + ((t - t0) / (t1 - t0)) * (Rt - L);
  const Y = (v) => B - ((v - v0) / (v1 - v0)) * (B - T);
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(L, T);
  ctx.lineTo(L, B);
  ctx.lineTo(Rt, B);
  ctx.stroke();
  for (const sr of series) {
    if (!sr.pts.length) continue;
    ctx.strokeStyle = sr.color ?? C.accent;
    ctx.lineWidth = sr.width ?? 3.5;
    if (sr.dashed) ctx.setLineDash([9, 7]);
    ctx.beginPath();
    sr.pts.forEach(([t, v], i) =>
      i ? ctx.lineTo(X(t), Y(v)) : ctx.moveTo(X(t), Y(v))
    );
    ctx.stroke();
    ctx.setLineDash([]);
    if (sr.label) {
      const [t, v] = sr.pts.at(-1);
      text(ctx, sr.label, Math.min(X(t) + 10, Rt - 120), Y(v) - 10, {
        font: MONO,
        size: 16,
        color: sr.color ?? C.accent,
      });
    }
  }
  if (playhead != null) {
    ctx.fillStyle = C.tx;
    ctx.fillRect(X(playhead) - 1, T, 2, B - T);
  }
  return { X, Y };
}
