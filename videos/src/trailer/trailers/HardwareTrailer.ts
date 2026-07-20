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
      text: "Before you write any code, meet the hardware. Your robot needs three devices and one network. The devices come from a company called CTRE. A motor that thinks. A sensor that never forgets. And a hub that ties them all together.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "kraken-photo",
      text: "This is the Kraken X44. It's a motor with a controller built in — the TalonFX. That controller is a tiny computer. It controls the motor's power and tracks its position. Your code talks to it over one shared wire — the CAN bus.",
      camera: { x: 2520, y: 180, width: 1480, height: 1080 },
      holdAfter: 0.6,
    },
    {
      id: "canivore",
      text: "Now follow the wiring. Your code runs on a laptop or on the robot's controller. It plugs into a CANivore with a USB cable. The CANivore is a small hub with one job. It turns that USB port into a real robot network.",
      camera: { x: 5500, y: 400, width: 1500, height: 820 },
      events: [
        { type: "diagram", artifact: "bus", step: 1, at: { word: "code" } },
        { type: "diagram", artifact: "bus", step: 2, at: { word: "CANivore" } },
      ],
    },
    {
      id: "kraken-node",
      text: "On the far side, the CANivore creates its own network, called CAN FD. It's even faster than the bus built into the robot controller. The Kraken connects to this network. It sends its position and takes commands at full speed.",
      camera: { x: 6200, y: 160, width: 1480, height: 840 },
      events: [
        { type: "diagram", artifact: "bus", step: 3, at: { word: "Kraken" } },
      ],
    },
    {
      id: "cancoder-node",
      text: "Next to it sits the CANcoder. It's a sensor that reads a magnet on the spinning shaft. That's how it knows the shaft's exact position. Turn the robot off and back on. The CANcoder still knows exactly where everything is.",
      camera: { x: 6200, y: 420, width: 1480, height: 840 },
      events: [
        { type: "diagram", artifact: "bus", step: 4, at: { word: "CANcoder" } },
      ],
    },
    {
      id: "whole-bus",
      text: "That's the whole setup. Every device plugs into the CANivore. Every message rides the same fast network. And your code sees all of it. Three devices. One network. No mystery wiring.",
      camera: DIAGRAM,
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Next step: wire these three devices for real. Bring them online on your own robot. The full hardware guide, device by device, is waiting at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
