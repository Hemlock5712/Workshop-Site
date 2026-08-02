import type { Rect, TrailerScript } from "../lib/types";

// The hardware video: three CTRE devices and the bus that ties them together.
// Camera: title → Kraken X44 photo → bus diagram (code → CANivore → devices,
// revealed node by node) → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const KRAKEN: Rect = { x: 2560, y: 220, width: 1400, height: 1000 };
const DIAGRAM: Rect = { x: 5480, y: 120, width: 2200, height: 1100 };
const END: Rect = { x: 7920, y: 40, width: 1920, height: 1080 };

export const HardwareTrailer: TrailerScript = {
  id: "HardwareTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "The CTRE Hardware Stack",
      subtitle: "Kraken X44 · CANcoder · CANivore",
      accent: "amber",
    },
    {
      kind: "image",
      id: "kraken-photo",
      rect: KRAKEN,
      src: "images/hardware/Kraken44x.png",
      title: "Kraken X44",
      caption: "A motor with a TalonFX controller onboard",
    },
    {
      kind: "diagram",
      id: "bus",
      rect: DIAGRAM,
      title: "One dedicated network",
      nodes: [
        {
          id: "code",
          label: "Your Code",
          sublabel: "PC or robot controller",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "canivore",
          label: "CANivore",
          sublabel: "USB-to-CAN-FD hub",
          x: 880,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 2,
        },
        {
          id: "kraken",
          label: "Kraken X44",
          sublabel: "motor + TalonFX onboard",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 3,
        },
        {
          id: "cancoder",
          label: "CANcoder",
          sublabel: "absolute position sensor",
          x: 1680,
          y: 730,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "code", to: "canivore", label: "USB", step: 2 },
        { from: "canivore", to: "kraken", label: "CAN FD", step: 3 },
        { from: "canivore", to: "cancoder", label: "CAN FD", step: 4 },
      ],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Three devices, one bus",
      subtitle: "The full wiring and setup guide, device by device",
      url: "frc5712.com/hardware",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Three CTRE devices and one wire. That's it. Every weird problem you'll chase later, from a motor that won't respond to an arm that has forgotten where it is, traces back to something in this picture being wrong.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "kraken-photo",
      text: "The TalonFX inside is the part that matters. It runs its own control loop on the motor, a thousand times a second, while your robot code checks in fifty. So you stop sending raw voltage down the CAN bus and start sending targets.",
      camera: { x: 2520, y: 180, width: 1480, height: 1080 },
      holdAfter: 0.6,
    },
    {
      id: "canivore",
      text: "Your code lives on a laptop, or on the robot. Either way it hands everything to the CANivore over a plain USB cable, and that hub turns one USB port into a CAN FD bus you can run from a workbench.",
      camera: { x: 5500, y: 400, width: 1500, height: 820 },
      events: [
        { type: "diagram", artifact: "bus", step: 1, at: { word: "code" } },
        { type: "diagram", artifact: "bus", step: 2, at: { word: "CANivore" } },
      ],
    },
    {
      id: "kraken-node",
      text: "CAN FD is why this half of the wiring is worth the trouble. It carries several times the traffic of the bus on the robot controller, so the Kraken can stream position fast enough to close a loop on.",
      camera: { x: 6200, y: 160, width: 1480, height: 840 },
      events: [
        { type: "diagram", artifact: "bus", step: 3, at: { word: "Kraken" } },
      ],
    },
    {
      id: "cancoder-node",
      text: "A magnet on the shaft, read absolutely, so the CANcoder doesn't care that you power-cycled the robot between matches. No homing routine. No driving the arm into a hard stop to find zero. It wakes up knowing.",
      camera: { x: 6200, y: 420, width: 1480, height: 840 },
      events: [
        { type: "diagram", artifact: "bus", step: 4, at: { word: "CANcoder" } },
      ],
    },
    {
      id: "whole-bus",
      text: "One hub, one bus, every device addressable from your code. Which sounds obvious until you've spent a Friday night chasing one loose CAN wire through a robot with the bumpers already on.",
      camera: DIAGRAM,
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Wire it for real next. Device IDs, bus order, and the Tuner X check that catches a bad crimp before it costs you a match.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
