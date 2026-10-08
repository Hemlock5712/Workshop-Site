// Configs and Requests. Two kinds of message go down the same CAN wire to the
// same motor: a config, once, when the arm is built, and a request, every loop.
// The config stays saved on the TalonFX; the request slot shows whatever came
// last. Then the power cycle: the motor's own rotor count starts over at zero,
// and the CANcoder still knows the real angle.
//
// What is modelled, and how (all closed form in t, no random, no carried state):
//   arm       a geared bench arm in Coast. Friction holds it wherever it is left;
//             under the 1 V request it creeps at a steady rate.
//   readouts  rotor count = angle - angle at power-on. CANcoder = the angle.
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
  codeWidth,
  drawArmBody,
  drawStand,
  panel,
  runBar,
} from "../../engine/kit.js";

// ---- layout ------------------------------------------------------------------------

const CODE = { x: 40, y: 40, w: 860, h: 825 };
const CARD = { x: 1040, y: 40, w: 430, h: 440 };
const READ = { x: 1040, y: 510, w: 430, h: 330 };
const PIVOT = { x: 1700, y: 400 };
const ARM_LEN = 190;
const ENC = { x: 1490, y: 600, w: 140, h: 64 };
const TRUNK_X = 968;
const LH = 25;
const CS = 20; // code size
const TAU = 2 * Math.PI;
const TRAVEL = 0.6; // seconds a packet takes on the wire
const START = -0.2; // where the arm sat when the robot powered on
const MOVED_TO = 0.15; // where the scripted gate drags it
const FULL = { x: 960, y: 540, z: 1 };

const CFG_IN = CARD.y + 178; // where packets enter the card
const REQ_IN = CARD.y + 368;

// Arm.java on mech-1-Mechanisms. Long builder lines are rewrapped; nothing renamed.
const ARM_CODE = [
  { s: "public class Arm implements Mechanism {", id: "cls" },
  { s: '  private final CANBus canivore = new CANBus("canivore");', id: "bus" },
  {
    s: "  private final TalonFX motor = new TalonFX(31, canivore);",
    id: "mot",
  },
  {
    s: "  private final CANcoder encoder = new CANcoder(32, canivore);",
    id: "enc",
  },
  { s: "" },
  {
    s: "  // Pushes a set voltage at the motor. No sensors involved.",
    id: "cmt",
    dim: true,
  },
  { s: "  private final VoltageOut voltageOut = new VoltageOut(0);", id: "vo" },
  { s: "" },
  { s: "  public Arm() {", id: "ctor" },
  { s: "    final TalonFXConfiguration talonFXCfg =", g: "cfg", i: 0 },
  { s: "      new TalonFXConfiguration()", g: "cfg", i: 1 },
  { s: "        .withMotorOutput(new MotorOutputConfigs()", g: "cfg", i: 2 },
  {
    s: "          .withNeutralMode(NeutralModeValue.Coast)",
    g: "cfg",
    i: 3,
    id: "neutral",
  },
  {
    s: "          .withInverted(InvertedValue.CounterClockwise_Positive))",
    g: "cfg",
    i: 4,
  },
  {
    s: "        .withMotionMagic(/* two Expo defaults, ignored */)",
    g: "cfg",
    i: 5,
    dim: true,
  },
  {
    s: "        .withFeedback(new FeedbackConfigs()",
    g: "cfg",
    i: 6,
    fb: true,
  },
  { s: "          .withFeedbackRemoteSensorID(32)", g: "cfg", i: 7, fb: true },
  { s: "          .withFeedbackSensorSource(", g: "cfg", i: 8, fb: true },
  {
    s: "            FeedbackSensorSourceValue.RemoteCANcoder));",
    g: "cfg",
    i: 9,
    fb: true,
  },
  { s: "" },
  {
    s: "    motor.getConfigurator().apply(talonFXCfg);",
    g: "cfg",
    i: 10,
    id: "apply",
  },
  { s: "  }", id: "ctorEnd" },
  { s: "" },
  { s: "  private void setVoltage(double voltage) {", id: "setv" },
  { s: "    motor.setControl(voltageOut.withOutput(voltage));", id: "send" },
  { s: "  }" },
  { s: "" },
  { s: "  private void stopMotor() {", id: "stopm" },
  { s: "    motor.stopMotor();", id: "stop" },
  { s: "  }" },
  { s: "}" },
];
{
  let y = CODE.y + 112;
  for (const ln of ARM_CODE) {
    if (!ln.s) {
      y += LH / 2;
      continue;
    }
    ln.y = y;
    y += LH;
  }
}
const LINE = Object.fromEntries(
  ARM_CODE.filter((l) => l.id).map((l) => [l.id, l])
);

// Robot.java on mech-1-Mechanisms.
const ROBOT_CODE = [
  "public class Robot extends OpModeRobot {",
  "  // The robot's mechanisms. Public so OpModes can use them.",
  "  public final Arm arm = new Arm();",
  "  public final Flywheel flywheel = new Flywheel();",
  "",
  "  public Robot() {}",
  "",
  "  @Override",
  "  public void robotPeriodic() {",
  "    Scheduler.getDefault().run();",
  "  }",
  "}",
];

// ---- small helpers -----------------------------------------------------------------

const tip = (rot, len = ARM_LEN) => ({
  x: PIVOT.x + Math.cos(rot * TAU) * len,
  y: PIVOT.y - Math.sin(rot * TAU) * len,
});

function along(pts, k) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    seg.push(d);
    total += d;
  }
  let r = clamp(k) * total;
  for (let i = 0; i < seg.length; i++) {
    if (r <= seg[i] || i === seg.length - 1) {
      const u = seg[i] ? clamp(r / seg[i]) : 0;
      return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * u,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * u,
      };
    }
    r -= seg[i];
  }
  return pts.at(-1);
}

function packetPath(from, to) {
  const y0 = LINE[from].y - 7;
  const y1 = to === "cfg" ? CFG_IN : REQ_IN;
  return [
    { x: CODE.x + CODE.w, y: y0 },
    { x: TRUNK_X, y: y0 },
    { x: TRUNK_X, y: y1 },
    { x: CARD.x, y: y1 },
  ];
}

const fmt = (v) => `${v < -0.0005 ? "-" : " "}${Math.abs(v).toFixed(3)} rot`;

// ---- the scene ----------------------------------------------------------------------

export function createScene(VOICE) {
  const { L, W: Wd, G } = cues(VOICE);
  const gate = G("try");
  const T = {
    paste: Wd("callback", "here") + 0.25,
    cfgSend: Wd("config", "sends"),
    reqStart: Wd("request", "now") - 0.2,
    reqLast: Wd("sticks", "arrives"),
    stopSend: L("sticks").t1 - 0.1,
    dragA: gate.t0 + 0.6,
    dragB: gate.t0 + 2.4,
    power: gate.t0 + 3.2,
    restore: gate.t0 + 3.9,
  };
  T.cfgArr = T.cfgSend + TRAVEL;
  const reqSends = [];
  for (let u = T.reqStart; u <= T.reqLast + 1e-6; u += 0.5) reqSends.push(u);
  T.firstArr = reqSends[0] + TRAVEL;
  T.lastArr = reqSends.at(-1) + TRAVEL;
  T.stopArr = T.stopSend + TRAVEL;
  const CREEP = -START / (T.stopArr - T.firstArr); // rot/s under the 1 V request

  // every packet in the scripted timeline
  const PACKETS = [
    { kind: "cfg", from: "apply", t0: T.cfgSend },
    ...reqSends.map((t0) => ({
      kind: "req",
      from: "send",
      t0,
      label: "1.0 V",
    })),
    { kind: "req", from: "stop", t0: T.stopSend, label: "neutral" },
    { kind: "cfg", from: "apply", t0: T.restore + 0.3 },
  ];

  // The bench at time t, as the video scripts it.
  function scripted(t) {
    let rot;
    if (t < T.firstArr) rot = START;
    else if (t < T.stopArr) rot = START + CREEP * (t - T.firstArr);
    else if (t < T.dragA) rot = 0;
    else rot = MOVED_TO * easeInOut(ramp(t, T.dragA, T.dragB - T.dragA));
    let req = null;
    let reqAt = -1;
    if (t >= T.firstArr && t < T.stopArr) {
      req = { name: "VoltageOut", val: "1.0 V" };
      reqAt = Math.max(
        ...reqSends.map((u) => u + TRAVEL).filter((u) => u <= t)
      );
    } else if (t >= T.stopArr && t < T.power) {
      req = { name: "NeutralOut", val: "from stopMotor()" };
      reqAt = T.stopArr;
    }
    const hand =
      t >= T.dragA - 0.5 && t < T.dragB + 0.6
        ? {
            ...tip(rot, ARM_LEN - 20),
            a: window_(t, T.dragA - 0.5, T.dragB + 0.6, 0.3),
            grip: t >= T.dragA && t < T.dragB,
          }
        : null;
    return {
      time: t,
      rot,
      p0: t < T.restore ? START : MOVED_TO,
      req,
      reqAt,
      cfgAt: t >= T.cfgArr ? T.cfgArr : null,
      packets: PACKETS.filter((p) => t >= p.t0 && t < p.t0 + TRAVEL),
      powerAt: t >= T.power ? T.power : null,
      restoreAt: t >= T.restore ? T.restore : null,
      hand,
      sending: t >= reqSends[0] && t < T.reqLast + 0.4,
    };
  }

  // ---- camera ------------------------------------------------------------------
  const shots = [
    { t: 0, ...FULL, d: 0.01 },
    { t: L("fields").t0 - 0.3, x: 780, y: 430, z: 1.25, d: 1.1 },
    { t: Wd("fields", "CANcoder") - 0.5, ...FULL, d: 0.9 },
    { t: L("config").t0 - 0.2, x: 830, y: 440, z: 1.22, d: 1.1 },
    { t: Wd("request", "code") - 0.6, ...FULL, d: 1.1 },
    { t: L("count").t0 - 0.2, x: 1180, y: 560, z: 1.3, d: 1.2 },
    { t: L("tryit").t0, ...FULL, d: 1.0 },
    { t: L("feedback").t0 - 0.2, x: 800, y: 520, z: 1.15, d: 1.1 },
    { t: L("robot").t0 - 0.3, x: 800, y: 420, z: 1.2, d: 1.1 },
  ];

  // code highlights: [line ids or a predicate, t0, t1, loop]
  const marks = [
    [["cls"], Wd("intro", "class") - 0.1, L("callback").t0 + 0.2],
    [
      (l) => l.g === "cfg" || l.id === "ctor" || l.id === "ctorEnd",
      Wd("callback", "constructor") - 0.1,
      L("callback").t1 + 0.4,
    ],
    [["bus"], Wd("fields", "CAN") - 0.1, L("fields").t1 + 0.4],
    [["mot"], Wd("fields", "motor") - 0.1, L("fields").t1 + 0.4],
    [["enc"], Wd("fields", "CANcoder") - 0.1, L("fields").t1 + 0.4],
    [
      (l) => l.g === "cfg" || l.id === "ctor" || l.id === "ctorEnd",
      Wd("config", "constructor") - 0.1,
      T.cfgSend,
    ],
    [["apply"], T.cfgSend - 0.1, T.cfgSend + 0.9],
    [["vo", "setv", "send"], T.reqStart - 0.1, T.reqLast + 0.4, true],
    [["stopm", "stop"], T.stopSend - 0.15, T.stopSend + 0.9],
    [(l) => l.fb, Wd("feedback", "These") - 0.1, L("feedback").t1 + 0.4],
  ];

  // ---- pieces --------------------------------------------------------------------

  function drawCode(ctx, S, vt, live) {
    panel(ctx, CODE);
    micro(ctx, "Arm.java · first/robot/mechanisms", CODE.x + 28, CODE.y + 44);
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const pulse = 0.5 + 0.5 * Math.cos(((S.time % 0.5) / 0.5) * TAU);
    const pasted = live ? 1e9 : vt;
    // before the paste: a dashed slot where it will land
    const slotA = live ? 0 : window_(vt, 0, T.paste + 0.4, 0.3);
    if (slotA > 0) {
      const y0 = LINE.ctor.y + 8;
      const y1 = LINE.apply.y + 10;
      ctx.save();
      ctx.globalAlpha = slotA;
      ctx.setLineDash([8, 7]);
      ctx.strokeStyle = alpha(C.accent, 0.7);
      ctx.lineWidth = 2;
      rrect(ctx, CODE.x + 56, y0, CODE.w - 100, y1 - y0, 4);
      ctx.stroke();
      ctx.setLineDash([]);
      text(
        ctx,
        "the Generate Code paste goes here",
        CODE.x + CODE.w / 2,
        (y0 + y1) / 2 + 8,
        { font: MONO, size: 22, weight: 600, align: "center", color: C.accent }
      );
      ctx.restore();
    }
    for (const ln of ARM_CODE) {
      if (!ln.s) continue;
      let a = 1;
      if (ln.g === "cfg") a = clamp((pasted - T.paste - ln.i * 0.07) / 0.3);
      if (a <= 0) continue;
      if (!live) {
        for (const [who, t0, t1, loop] of marks) {
          const hit = typeof who === "function" ? who(ln) : who.includes(ln.id);
          if (!hit) continue;
          const k = window_(vt, t0, t1, 0.25);
          if (k <= 0) continue;
          ctx.save();
          ctx.globalAlpha = k;
          runBar(ctx, CODE.x + 1, ln.y - 19, CODE.w - 2, LH, loop ? pulse : 0);
          ctx.restore();
        }
      }
      codeLine(ctx, ln.s, CODE.x + 28, ln.y, {
        a: a * (ln.dim ? 0.6 : 1),
        size: CS,
      });
    }
    if (live) return;
    // what each field is, on the bench, as the narration names it
    const tag = (id, s, t0) => {
      const k = window_(vt, t0, L("fields").t1 + 0.4, 0.3);
      if (k > 0)
        text(ctx, s, CODE.x + CODE.w - 24, LINE[id].y - 30 + 4, {
          font: MONO,
          size: 17,
          weight: 600,
          align: "right",
          color: C.accent,
          a: k,
        });
    };
    tag("bus", "the wire", Wd("fields", "CAN"));
    // the send line says where its packets go
    if (S.sending)
      text(ctx, "→ every loop", CODE.x + CODE.w - 24, LINE.send.y - 26, {
        font: MONO,
        size: 17,
        weight: 600,
        align: "right",
        color: C.accent,
      });
    const sa = window_(vt, Wd("config", "sends") - 0.1, L("config").t1, 0.3);
    if (sa > 0)
      text(ctx, "→ once", CODE.x + CODE.w - 24, LINE.apply.y - 26, {
        font: MONO,
        size: 17,
        weight: 600,
        align: "right",
        color: C.accent,
        a: sa,
      });
    const st = window_(vt, Wd("sticks", "last") - 0.1, T.stopSend - 0.2, 0.3);
    if (st > 0)
      text(ctx, "stopped sending", CODE.x + CODE.w - 24, LINE.send.y - 26, {
        font: MONO,
        size: 17,
        weight: 600,
        align: "right",
        color: C.tx2,
        a: st,
      });
  }

  function drawWires(ctx, S, vt, live) {
    const busLit = live
      ? 0
      : window_(vt, Wd("fields", "CAN") - 0.1, L("fields").t1 + 0.4, 0.3);
    const col = busLit > 0 ? alpha(C.accent, 0.4 + 0.6 * busLit) : C.rule;
    ctx.strokeStyle = col;
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (const id of ["apply", "send", "stop"]) {
      ctx.moveTo(CODE.x + CODE.w, LINE[id].y - 7);
      ctx.lineTo(TRUNK_X, LINE[id].y - 7);
    }
    ctx.moveTo(TRUNK_X, CFG_IN);
    ctx.lineTo(TRUNK_X, LINE.stop.y - 7);
    ctx.moveTo(TRUNK_X, CFG_IN);
    ctx.lineTo(CARD.x, CFG_IN);
    ctx.moveTo(TRUNK_X, REQ_IN);
    ctx.lineTo(CARD.x, REQ_IN);
    // on down the chain to the CANcoder
    ctx.moveTo(CARD.x + CARD.w, CARD.y + CARD.h - 50);
    ctx.bezierCurveTo(
      CARD.x + CARD.w + 40,
      CARD.y + CARD.h - 50,
      ENC.x + 40,
      ENC.y - 80,
      ENC.x + 40,
      ENC.y
    );
    ctx.stroke();
    text(ctx, "CAN · canivore", TRUNK_X, LINE.stop.y + 28, {
      font: MONO,
      size: 17,
      weight: 600,
      align: "center",
      color: busLit > 0 ? C.accent : C.tx3,
    });
    // power lead to the motor at the pivot
    const driven = S.req && S.req.name === "VoltageOut" && !blackout(S);
    ctx.strokeStyle = driven ? alpha(C.accent, 0.85) : C.rule;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(CARD.x + CARD.w, CARD.y + 90);
    ctx.bezierCurveTo(
      CARD.x + CARD.w + 120,
      CARD.y + 90,
      PIVOT.x - 60,
      PIVOT.y - 200,
      PIVOT.x - 30,
      PIVOT.y - 34
    );
    ctx.stroke();
  }

  function drawPackets(ctx, S) {
    for (const p of S.packets) {
      if (S.time < p.t0) continue;
      const k = easeInOut(clamp((S.time - p.t0) / TRAVEL));
      const pos = along(packetPath(p.from, p.kind), k);
      if (p.kind === "cfg") {
        rrect(ctx, pos.x - 56, pos.y - 22, 112, 44, 4);
        ctx.fillStyle = C.bg;
        ctx.fill();
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 3;
        ctx.stroke();
        text(ctx, "config", pos.x, pos.y + 7, {
          font: MONO,
          size: 19,
          weight: 700,
          align: "center",
          color: C.accent,
        });
      } else {
        rrect(ctx, pos.x - 42, pos.y - 15, 84, 30, 15);
        ctx.fillStyle = C.accent;
        ctx.fill();
        text(ctx, p.label, pos.x, pos.y + 6, {
          font: MONO,
          size: 16,
          weight: 700,
          align: "center",
          color: C.accentInk,
        });
      }
    }
  }

  const blackout = (S) =>
    S.powerAt != null && (S.restoreAt == null || S.time < S.restoreAt) ? 1 : 0;

  function drawCard(ctx, S, vt, live) {
    const lit = live
      ? 0
      : Math.max(
          window_(vt, Wd("fields", "motor") - 0.1, L("fields").t1 + 0.4, 0.3),
          window_(vt, Wd("config", "saves") - 0.1, L("config").t1 + 0.4, 0.3)
        );
    rrect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = lit ? alpha(C.accent, 0.35 + 0.65 * lit) : C.rule;
    ctx.lineWidth = 2 + 2 * lit;
    ctx.stroke();
    micro(ctx, "TalonFX 31 · motor controller", CARD.x + 24, CARD.y + 40, {
      size: 16,
    });
    ctx.beginPath();
    ctx.arc(CARD.x + CARD.w - 30, CARD.y + 34, 9, 0, TAU);
    ctx.fillStyle = blackout(S) ? C.bg3 : S.req ? C.accent : C.tx3;
    ctx.fill();

    // zone 1: config, saved on the device
    const Z1 = { x: CARD.x + 14, y: CARD.y + 62, w: CARD.w - 28, h: 232 };
    rrect(ctx, Z1.x, Z1.y, Z1.w, Z1.h, 4);
    ctx.fillStyle = alpha(C.bg, 0.5);
    ctx.fill();
    micro(ctx, "config", Z1.x + 14, Z1.y + 30, {
      size: 16,
      color: S.cfgAt != null ? C.tx2 : C.tx3,
    });
    const rows = [
      ["neutral mode", "Coast"],
      ["inverted", "CounterClockwise_Positive"],
      ["feedback", "RemoteCANcoder · 32"],
    ];
    rows.forEach(([label, value], i) => {
      const ry = Z1.y + 66 + i * 58;
      micro(ctx, label, Z1.x + 14, ry, { size: 16 });
      const k =
        S.cfgAt == null ? 0 : clamp((S.time - S.cfgAt - i * 0.18) / 0.3);
      if (k <= 0) {
        text(ctx, "–", Z1.x + 14, ry + 28, {
          font: MONO,
          size: 22,
          weight: 600,
          color: C.tx3,
        });
        return;
      }
      text(ctx, value, Z1.x + 14, ry + 28, {
        font: MONO,
        size: 22,
        weight: 600,
        color: C.tx,
        a: easeOut(k),
      });
    });
    // "saved" stamp, and "still saved" after a power cycle
    const savedA = live
      ? 0
      : window_(vt, Wd("config", "saves") - 0.1, L("request").t0, 0.3);
    if (savedA > 0)
      text(ctx, "saved · stays", Z1.x + Z1.w - 14, Z1.y + 30, {
        font: MONO,
        size: 17,
        weight: 700,
        align: "right",
        color: C.accent,
        a: savedA,
      });
    if (S.restoreAt != null) {
      const k = window_(S.time, S.restoreAt, S.restoreAt + 3.5, 0.3);
      if (k > 0)
        text(ctx, "still saved", Z1.x + Z1.w - 14, Z1.y + 30, {
          font: MONO,
          size: 17,
          weight: 700,
          align: "right",
          color: C.accent,
          a: k,
        });
    }

    // zone 2: the current request, whatever arrived last
    const Z2 = { x: CARD.x + 14, y: CARD.y + 308, w: CARD.w - 28, h: 118 };
    const flash =
      S.req && S.reqAt >= 0 ? 1 - clamp((S.time - S.reqAt) / 0.35) : 0;
    rrect(ctx, Z2.x, Z2.y, Z2.w, Z2.h, 4);
    ctx.fillStyle =
      flash > 0 ? alpha(C.accent, 0.06 + 0.14 * flash) : alpha(C.bg, 0.5);
    ctx.fill();
    if (S.req) {
      ctx.strokeStyle = alpha(C.accent, 0.5 + 0.5 * flash);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    micro(ctx, "current request", Z2.x + 14, Z2.y + 30, {
      size: 16,
      color: S.req ? C.tx2 : C.tx3,
    });
    if (S.req) {
      text(ctx, S.req.name, Z2.x + 14, Z2.y + 72, {
        font: MONO,
        size: 28,
        weight: 700,
        color: C.accent,
      });
      text(
        ctx,
        S.req.val,
        Z2.x + 14 + codeWidth(ctx, S.req.name, 28) + 16,
        Z2.y + 72,
        { font: MONO, size: 22, weight: 600, color: C.tx }
      );
    } else
      text(ctx, "none", Z2.x + 14, Z2.y + 72, {
        font: MONO,
        size: 28,
        weight: 600,
        color: C.tx3,
      });
    // the one line about latching; the latched video demos it
    let sub = S.req ? "replaced by the next one" : "nothing sent yet";
    let subCol = C.tx3;
    if (
      !live &&
      vt >= Wd("request", "every") - 0.2 &&
      vt < Wd("sticks", "last") - 0.1 &&
      S.req
    )
      sub = "a new one every loop (drawn slower)";
    if (!live && vt >= Wd("sticks", "last") - 0.1 && vt < T.stopSend) {
      sub = "last one in · still being applied";
      subCol = C.accent;
    }
    if (S.restoreAt != null && !S.req) sub = "power cycle cleared it";
    text(ctx, sub, Z2.x + 14, Z2.y + 102, {
      font: MONO,
      size: 17,
      weight: 600,
      color: subCol,
    });
  }

  function drawReadouts(ctx, S, vt, live) {
    const k = live ? 1 : easeOut(ramp(vt, L("count").t0 - 0.2, 0.6));
    if (k <= 0) return;
    ctx.save();
    ctx.globalAlpha = k;
    panel(ctx, READ, C.bg2);
    micro(ctx, "position readouts", READ.x + 24, READ.y + 38, { size: 16 });
    const off = blackout(S);
    const rotorHot =
      !live &&
      window_(vt, Wd("count", "counts") - 0.1, L("count").t1 + 0.3, 0.3);
    const row = (y, label, value, hot, sub) => {
      if (hot > 0) {
        ctx.fillStyle = alpha(C.accent, 0.12 * hot);
        ctx.fillRect(READ.x + 2, y - 30, READ.w - 4, 80);
        ctx.fillStyle = alpha(C.accent, hot);
        ctx.fillRect(READ.x + 2, y - 30, 4, 80);
      }
      micro(ctx, label, READ.x + 24, y - 6, { size: 16 });
      text(ctx, off ? "–" : value, READ.x + 24, y + 26, {
        font: MONO,
        size: 28,
        weight: 700,
        color: off ? C.tx3 : C.tx,
      });
      if (sub)
        text(ctx, sub, READ.x + READ.w - 24, y + 26, {
          font: MONO,
          size: 17,
          weight: 600,
          align: "right",
          color: C.tx3,
        });
    };
    const justPowered =
      S.restoreAt != null
        ? window_(S.time, S.restoreAt, S.restoreAt + 4, 0.3)
        : 0;
    row(
      READ.y + 94,
      "rotor count · the motor's own",
      fmt(S.rot - S.p0),
      Math.max(rotorHot || 0, justPowered),
      "0 = power-on spot"
    );
    const encHot =
      !live &&
      window_(vt, L("feedback").t0 - 0.1, Wd("feedback", "These") - 0.1, 0.3);
    row(
      READ.y + 184,
      "CANcoder 32 · absolute",
      fmt(S.rot),
      Math.max(encHot || 0, justPowered),
      "the real angle"
    );
    // the motor's position once withFeedback points it at the CANcoder
    const fk = live
      ? 0
      : easeOut(ramp(vt, Wd("feedback", "source") - 0.2, 0.5));
    if (fk > 0) {
      ctx.save();
      ctx.globalAlpha *= fk;
      row(
        READ.y + 274,
        "motor position · via withFeedback",
        fmt(S.rot),
        window_(
          vt,
          Wd("feedback", "source") - 0.2,
          L("feedback").t1 + 0.4,
          0.3
        ),
        "= CANcoder"
      );
      ctx.restore();
    }
    ctx.restore();
  }

  function drawBench(ctx, S, vt, live) {
    drawStand(ctx, PIVOT);
    // where the count's zero is: the spot the robot powered on at
    const ghostK = live ? 1 : easeOut(ramp(vt, Wd("count", "zero") - 0.2, 0.5));
    if (ghostK > 0 && Math.abs(S.rot - S.p0) > 0.01 && !blackout(S)) {
      ctx.save();
      ctx.globalAlpha *= ghostK;
      drawArmBody(ctx, PIVOT, ARM_LEN, S.p0, { ghost: true });
      const g = tip(S.p0, ARM_LEN + 34);
      text(
        ctx,
        "zero here",
        g.x + (Math.cos(S.p0 * TAU) >= 0 ? 10 : -110),
        g.y + 8,
        { font: MONO, size: 18, weight: 600, color: C.accent }
      );
      ctx.restore();
    }
    drawArmBody(ctx, PIVOT, ARM_LEN, S.rot, {
      driven: S.req?.name === "VoltageOut",
    });
    // the CANcoder, on the arm's shaft
    const encLit = live
      ? 0
      : window_(vt, Wd("fields", "CANcoder") - 0.1, L("fields").t1 + 0.4, 0.3);
    ctx.setLineDash([5, 6]);
    ctx.strokeStyle = C.tx3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ENC.x + ENC.w, ENC.y + 20);
    ctx.lineTo(PIVOT.x - 40, PIVOT.y + 16);
    ctx.stroke();
    ctx.setLineDash([]);
    rrect(ctx, ENC.x, ENC.y, ENC.w, ENC.h, 5);
    ctx.fillStyle = C.bg3;
    ctx.fill();
    ctx.strokeStyle = encLit ? alpha(C.accent, 0.4 + 0.6 * encLit) : C.rule;
    ctx.lineWidth = 2 + 2 * encLit;
    ctx.stroke();
    text(ctx, "CANcoder", ENC.x + ENC.w / 2, ENC.y + 28, {
      font: MONO,
      size: 18,
      weight: 700,
      align: "center",
      color: encLit ? C.accent : C.tx2,
    });
    text(ctx, "32", ENC.x + ENC.w / 2, ENC.y + 52, {
      font: MONO,
      size: 18,
      weight: 600,
      align: "center",
      color: C.tx3,
    });
    // intro: this arm is that class
    const ia = live
      ? 0
      : window_(vt, Wd("intro", "arm") - 0.1, L("callback").t0 + 0.4, 0.3);
    if (ia > 0) {
      text(ctx, "class Arm", PIVOT.x, PIVOT.y - 90, {
        font: MONO,
        size: 24,
        weight: 700,
        align: "center",
        color: C.accent,
        a: ia,
      });
    }
    // a hand on the arm while it is dragged
    const h = S.hand;
    if (h) {
      ctx.save();
      ctx.globalAlpha *= h.a;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.grip ? 22 : 28, 0, TAU);
      ctx.strokeStyle = C.tx;
      ctx.lineWidth = 3;
      ctx.stroke();
      if (h.grip) {
        ctx.fillStyle = alpha(C.tx, 0.25);
        ctx.fill();
      }
      text(ctx, h.grip ? "by hand" : "drag", h.x + 34, h.y - 22, {
        font: MONO,
        size: 18,
        weight: 600,
        color: C.tx,
      });
      ctx.restore();
    }
  }

  // Tuner X, Workshop 1: the config panel, three dots, Generate Code, and the copy.
  function drawTuner(ctx, t) {
    const a = window_(t, L("callback").t0 - 0.2, T.paste + 0.5, 0.4);
    if (a <= 0) return;
    const R = { x: 990, y: 60, w: 890, h: 560 };
    ctx.save();
    ctx.globalAlpha = a;
    rrect(ctx, R.x, R.y, R.w, R.h, 6);
    ctx.fillStyle = C.bg2;
    ctx.fill();
    ctx.strokeStyle = C.rule;
    ctx.lineWidth = 2;
    ctx.stroke();
    micro(
      ctx,
      "Tuner X · TalonFX 31 · Config · Workshop 1",
      R.x + 30,
      R.y + 44
    );
    ctx.fillStyle = C.rule;
    ctx.fillRect(R.x, R.y + 68, R.w, 1);
    // three dots
    const dotsHot = t >= Wd("callback", "Generate") - 0.4;
    rrect(ctx, R.x + R.w - 84, R.y + 14, 60, 40, 4);
    ctx.fillStyle = dotsHot ? alpha(C.accent, 0.2) : C.bg3;
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(R.x + R.w - 54 + (i - 1) * 12, R.y + 34, 3.5, 0, TAU);
      ctx.fillStyle = dotsHot ? C.accent : C.tx2;
      ctx.fill();
    }
    const groups = [
      [
        "Motor Output",
        [
          ["Neutral Mode", "Coast"],
          ["Inverted", "CounterClockwise_Positive"],
        ],
      ],
      [
        "Feedback",
        [
          ["Feedback Remote Sensor ID", "32"],
          ["Feedback Sensor Source", "RemoteCANcoder"],
        ],
      ],
    ];
    let y = R.y + 120;
    let n = 0;
    for (const [g, rows] of groups) {
      text(ctx, g, R.x + 30, y, { size: 26, weight: 600 });
      y += 48;
      for (const [k, v] of rows) {
        const ka = easeOut(ramp(t, Wd("callback", "set") + n * 0.3, 0.4));
        n++;
        text(ctx, k, R.x + 50, y, { size: 22, color: C.tx2, a: ka });
        text(ctx, v, R.x + R.w - 40, y, {
          font: MONO,
          size: 22,
          weight: 600,
          align: "right",
          a: ka,
        });
        y += 44;
      }
      y += 26;
    }
    // the menu
    const ma = window_(
      t,
      Wd("callback", "Generate") - 0.2,
      Wd("callback", "That") + 0.2,
      0.25
    );
    if (ma > 0) {
      ctx.save();
      ctx.globalAlpha *= ma;
      const M = { x: R.x + R.w - 300, y: R.y + 60, w: 280, h: 56 };
      rrect(ctx, M.x, M.y, M.w, M.h, 4);
      ctx.fillStyle = C.bg3;
      ctx.fill();
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, "Generate Code", M.x + 22, M.y + 37, {
        size: 24,
        weight: 600,
        color: C.accent,
      });
      ctx.restore();
    }
    ctx.restore();
    // the copy: a chip that flies to the constructor
    const c0 = Wd("callback", "copy");
    const f0 = Wd("callback", "goes");
    const f1 = T.paste;
    const ca = window_(t, c0 - 0.1, f1 + 0.15, 0.2);
    if (ca > 0) {
      const k = easeInOut(ramp(t, f0, f1 - f0));
      const x = R.x + 440 + (CODE.x + 360 - (R.x + 440)) * k;
      const y2 = R.y + R.h - 50 + (LINE.ctor.y + 150 - (R.y + R.h - 50)) * k;
      ctx.save();
      ctx.globalAlpha = ca;
      rrect(ctx, x - 190, y2 - 26, 380, 52, 4);
      ctx.fillStyle = C.accent;
      ctx.fill();
      text(ctx, "TalonFXConfiguration · copied", x, y2 + 7, {
        font: MONO,
        size: 19,
        weight: 700,
        align: "center",
        color: C.accentInk,
      });
      ctx.restore();
    }
  }

  // Robot.java builds the arm once, and every OpMode gets that same arm.
  function drawRobot(ctx, t) {
    const a =
      easeInOut(ramp(t, L("robot").t0 - 0.3, 0.6)) *
      (1 - easeInOut(ramp(t, L("close").t0 + 0.2, 0.6)));
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    panel(ctx, CODE);
    micro(ctx, "Robot.java · first/robot", CODE.x + 28, CODE.y + 44);
    ctx.fillStyle = C.rule;
    ctx.fillRect(CODE.x, CODE.y + 66, CODE.w, 1);
    const built = Wd("robot", "builds") - 0.1;
    const once = Wd("robot", "once");
    let y = CODE.y + 112;
    const ys = [];
    ROBOT_CODE.forEach((s, i) => {
      if (!s) {
        y += LH / 2;
        return;
      }
      ys[i] = y;
      if (i === 2) {
        const k = window_(t, built, L("close").t0 + 1, 0.3);
        ctx.save();
        ctx.globalAlpha *= k;
        runBar(ctx, CODE.x + 1, y - 19, CODE.w - 2, LH);
        ctx.restore();
      }
      codeLine(ctx, s, CODE.x + 28, y, { size: CS, a: i === 1 ? 0.6 : 1 });
      y += LH;
    });
    // built once, at startup
    const ok = easeOut(ramp(t, once - 0.15, 0.4));
    text(
      ctx,
      "← built once, at startup",
      CODE.x +
        28 +
        codeWidth(ctx, "  public final Arm arm = new Arm();", CS) +
        20,
      ys[2] - 2,
      { font: MONO, size: 17, weight: 700, color: C.accent, a: ok }
    );
    // every mode reaches the same arm
    const modes = [
      ["@Teleop", "MyTeleop(Robot robot)", CODE.x + 40],
      ["@Autonomous", "MyAuto(Robot robot)", CODE.x + 450],
    ];
    const mk = Wd("robot", "mode");
    modes.forEach(([ann, ctor, x], i) => {
      const k = easeOut(ramp(t, mk - 0.3 + i * 0.25, 0.5));
      if (k <= 0) return;
      ctx.save();
      ctx.globalAlpha *= k;
      const B = { x, y: CODE.y + 420, w: 370, h: 130 };
      rrect(ctx, B.x, B.y, B.w, B.h, 5);
      ctx.fillStyle = C.bg2;
      ctx.fill();
      ctx.strokeStyle = C.rule;
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, ann, B.x + 22, B.y + 38, {
        font: MONO,
        size: 19,
        weight: 600,
        color: C.tx3,
      });
      text(ctx, ctor, B.x + 22, B.y + 74, {
        font: MONO,
        size: 20,
        weight: 600,
      });
      text(ctx, "→ robot.arm", B.x + 22, B.y + 110, {
        font: MONO,
        size: 20,
        weight: 700,
        color: C.accent,
      });
      // arrow round the code to the one arm field
      const tipX =
        CODE.x +
        28 +
        codeWidth(ctx, "  public final Arm arm = new Arm();", CS) +
        270;
      const pts = [
        { x: B.x + B.w / 2, y: B.y },
        { x: B.x + B.w / 2, y: B.y - 22 },
        { x: CODE.x + 760, y: B.y - 22 },
        { x: CODE.x + 760, y: ys[2] - 7 },
        { x: tipX, y: ys[2] - 7 },
      ];
      const dk = easeInOut(ramp(t, mk + i * 0.25, 0.7));
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let u = 0; u <= dk + 1e-6; u += 0.02) {
        const q = along(pts, u);
        ctx.lineTo(q.x, q.y);
      }
      ctx.stroke();
      if (dk >= 1) {
        ctx.fillStyle = C.accent;
        ctx.beginPath();
        ctx.moveTo(tipX - 4, ys[2] - 7);
        ctx.lineTo(tipX + 10, ys[2] - 15);
        ctx.lineTo(tipX + 10, ys[2] + 1);
        ctx.fill();
      }
      ctx.restore();
    });
    const sa = easeOut(ramp(t, Wd("robot", "same") - 0.15, 0.5));
    text(ctx, "two modes, one arm", CODE.x + CODE.w / 2, CODE.y + 600, {
      font: MONO,
      size: 22,
      weight: 700,
      align: "center",
      color: C.accent,
      a: sa,
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
    micro(ctx, "Workshop 3 · Mechanisms", W / 2, 440 - 20 * (1 - k), {
      align: "center",
      a: k,
      color: C.accent,
    });
    text(ctx, "Configs and Requests", W / 2, 560 - 30 * (1 - k), {
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
    text(ctx, "Settings go in once.", W / 2, 420, {
      font: SERIF,
      size: 84,
      align: "center",
    });
    text(ctx, "Requests go every loop,", W / 2, 528, {
      font: SERIF,
      size: 84,
      align: "center",
      a: easeOut(ramp(t, Wd("close", "Requests") - 0.1, 0.5)),
    });
    text(ctx, "and the last one sticks.", W / 2, 636, {
      font: SERIF,
      size: 84,
      align: "center",
      color: C.accent,
      a: easeOut(ramp(t, Wd("close", "and") - 0.1, 0.5)),
    });
    ctx.restore();
  }

  function drawBlackout(ctx, S) {
    if (S.powerAt == null) return;
    const end = S.restoreAt ?? S.powerAt + 0.7;
    const k = window_(S.time, S.powerAt, end + 0.15, 0.12);
    if (k <= 0) return;
    ctx.save();
    ctx.fillStyle = `rgba(2, 3, 8, ${0.86 * k})`;
    ctx.fillRect(0, 0, W, H);
    micro(ctx, "power cycle", W / 2, 470, {
      align: "center",
      color: C.accent,
      a: k,
      size: 24,
    });
    ctx.restore();
  }

  // ---- public --------------------------------------------------------------------

  function draw(ctx, t, live = null) {
    const S = live ? live : scripted(t);
    const vt = live ? gate.t0 + 0.5 : t; // narration cues; frozen while a student drives
    background(ctx);
    ctx.save();
    applyCamera(ctx, live ? FULL : camera(shots, t));
    drawWires(ctx, S, vt, !!live);
    drawCode(ctx, S, vt, !!live);
    drawCard(ctx, S, vt, !!live);
    drawReadouts(ctx, S, vt, !!live);
    drawBench(ctx, S, vt, !!live);
    drawPackets(ctx, S);
    if (!live) {
      drawTuner(ctx, t);
      drawRobot(ctx, t);
    }
    ctx.restore();
    vignette(ctx);
    drawBlackout(ctx, S);
    if (live) return;
    titleCard(ctx, t);
    closeCard(ctx, t);
  }

  function liveGate() {
    const start = scripted(gate.t0);
    const s = {
      ...start,
      time: gate.t0,
      packets: [],
      hand: { ...tip(start.rot, ARM_LEN - 20), a: 1, grip: false },
      powerAt: null,
      restoreAt: null,
      sending: false,
    };
    const startRot = s.rot;
    let moved = false;
    let validPower = false;
    let powerNoMove = false;
    let dragging = false;
    let doneAt = null;
    return {
      state: s,
      prompt() {
        if (s.powerAt != null && s.restoreAt == null)
          return "Power off… and back on.";
        if (validPower) return "Rotor count: zero. CANcoder: the real angle.";
        if (powerNoMove && !moved)
          return "Move the arm first, then power cycle.";
        if (!moved) return "Drag the arm to any angle.";
        return "Now press Power cycle.";
      },
      input(name, down) {
        if (name !== "power" || !down) return;
        if (s.powerAt != null && s.restoreAt == null) return;
        s.powerAt = s.time;
        s.restoreAt = null;
        if (moved) validPower = true;
        else powerNoMove = true;
      },
      pointer(type, x, y) {
        if (type === "down") {
          if (Math.hypot(x - PIVOT.x, y - PIVOT.y) < ARM_LEN + 90)
            dragging = true;
          else return;
        }
        if (type === "up") {
          dragging = false;
          s.hand = null;
          return;
        }
        if (!dragging) return;
        let r = Math.atan2(-(y - PIVOT.y), x - PIVOT.x) / TAU;
        r += Math.round(s.rot - r); // unwrap to the nearest turn
        s.rot = r;
        s.hand = { ...tip(r, ARM_LEN - 20), a: 1, grip: true };
        if (Math.abs(s.rot - startRot) > 0.03) moved = true;
      },
      step(dt) {
        s.time += dt;
        if (
          s.powerAt != null &&
          s.restoreAt == null &&
          s.time >= s.powerAt + 0.7
        ) {
          s.restoreAt = s.time;
          s.p0 = s.rot;
          s.req = null;
          s.packets.push({ kind: "cfg", from: "apply", t0: s.time + 0.3 });
          if (validPower && doneAt == null) doneAt = s.time + 1.8;
        }
        s.packets = s.packets.filter(
          (p) => s.time < p.t0 + TRAVEL && s.time >= p.t0 - 1
        );
        // a packet scheduled for later is not on the wire yet
        return doneAt !== null && s.time >= doneAt;
      },
    };
  }

  function gatePromptAt(t) {
    if (t < gate.t0 || t >= gate.t1) return null;
    if (t < T.dragB) return "Drag the arm to any angle.";
    if (t < T.power) return "Now press Power cycle.";
    if (t < T.restore) return "Power off… and back on.";
    return "Rotor count: zero. CANcoder: the real angle.";
  }

  return {
    draw,
    gate,
    liveGate,
    gatePromptAt,
    gateControls: [
      { k: "power", label: "Power cycle", key: "KeyP", kind: "press" },
    ],
  };
}
