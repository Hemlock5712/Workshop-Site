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
      text: "Before a single line of code, your robot is three CTRE devices and one network. A motor that thinks, a sensor that never forgets, and a hub that ties them together — meet the hardware.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "kraken-photo",
      text: "This is the Kraken X44 — a motor with a TalonFX controller built right in. Voltage control, position sensing, and PID all run onboard the motor, and it talks to your code over the CAN bus.",
      camera: { x: 2520, y: 180, width: 1480, height: 1080 },
      holdAfter: 0.6,
    },
    {
      id: "canivore",
      text: "Now follow the wiring. Your code — on a laptop or the robot controller — plugs into a CANivore over USB. It's a small hub with one job: turn that USB port into a real robot network.",
      camera: { x: 5500, y: 400, width: 1500, height: 820 },
      events: [
        { type: "diagram", artifact: "bus", step: 1, at: { word: "code" } },
        { type: "diagram", artifact: "bus", step: 2, at: { word: "CANivore" } },
      ],
    },
    {
      id: "kraken-node",
      text: "On the far side, the CANivore creates a dedicated CAN FD network — faster than the robot controller's built-in bus. The Kraken hangs off it, streaming position and taking commands at full speed.",
      camera: { x: 6200, y: 160, width: 1480, height: 840 },
      events: [
        { type: "diagram", artifact: "bus", step: 3, at: { word: "Kraken" } },
      ],
    },
    {
      id: "cancoder-node",
      text: "Next to it sits the CANcoder — an absolute position sensor that reads a magnet on the rotating shaft. Power the robot off, power it back on, and it still knows exactly where the mechanism is.",
      camera: { x: 6200, y: 420, width: 1480, height: 840 },
      events: [
        { type: "diagram", artifact: "bus", step: 4, at: { word: "CANcoder" } },
      ],
    },
    {
      id: "whole-bus",
      text: "That's the whole stack. Every device connects to the CANivore, every message rides the same high-speed bus, and your code sees all of it. Three devices, one network, zero mystery wiring.",
      camera: DIAGRAM,
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Next step: wire these three devices for real and bring them online on your own robot. The full hardware walkthrough, device by device, is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
