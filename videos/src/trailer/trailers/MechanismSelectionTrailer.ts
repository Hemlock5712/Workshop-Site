import type { Rect, TrailerScript } from "../lib/types";

// The mechanism choice video: arm (position control) versus flywheel
// (velocity control). Camera: title → arm photo → arm close-up →
// flywheel photo → flywheel close-up → wide two-shot → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const ARM: Rect = { x: 2560, y: 140, width: 1400, height: 1000 };
const FLYWHEEL: Rect = { x: 5480, y: 240, width: 1400, height: 1000 };
const END: Rect = { x: 7900, y: 60, width: 1920, height: 1080 };

export const MechanismSelectionTrailer: TrailerScript = {
  id: "MechanismSelectionTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Pick Your Mechanism",
      subtitle: "Arm or flywheel — one choice shapes the whole workshop",
      accent: "mint",
    },
    {
      kind: "image",
      id: "arm",
      rect: ARM,
      src: "images/mechanisms/arm.png",
      title: "Arm — position control",
      caption: "Absolute encoder · target angles",
    },
    {
      kind: "image",
      id: "flywheel",
      rect: FLYWHEEL,
      src: "images/mechanisms/flywheel.png",
      title: "Flywheel — velocity control",
      caption: "Leader-follower pair · target RPM",
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Choose one and build it",
      subtitle: "Every code example from here on follows your pick",
      url: "frc5712.com/mechanism-setup",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Right now you make the one choice that shapes this entire workshop. There are two mechanisms. You will build one of them. And every code example from here to the finish line follows your pick.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "arm-intro",
      text: "Option one: the arm. This is position control. That means holding a joint at an exact angle, even against gravity. An absolute encoder sits on the pivot. That sensor always knows the arm's true angle, even at power up.",
      camera: { x: 2520, y: 100, width: 1480, height: 1080 },
    },
    {
      id: "arm-skills",
      text: "Build the arm and you learn the basics of position control. Which way the encoder counts. How to set its zero point. How to drive to a target angle. Later, PID and Motion Magic build right on top of these skills.",
      camera: { x: 2700, y: 300, width: 1160, height: 700 },
    },
    {
      id: "flywheel-intro",
      text: "Option two: the flywheel. This one is velocity control. That means spinning a wheel at an exact speed and holding it there. Two motors run as a leader and follower pair. One leads, one copies, doubling the muscle.",
      camera: { x: 5440, y: 200, width: 1480, height: 1080 },
    },
    {
      id: "flywheel-skills",
      text: "The challenge is holding that speed under load. Feed a game piece through. The wheel slows down. Velocity control fights that dip. It is how a shooter stays consistent, shot after shot.",
      camera: { x: 5620, y: 400, width: 1160, height: 700 },
    },
    {
      id: "same-hardware",
      text: "Whichever you pick, the wiring is identical. It is a TalonFX motor on a CANivore bus. Same hardware path. Same code structure. The only real difference is the thing you control: an angle or a speed.",
      camera: { x: 2440, y: 60, width: 4560, height: 1280 },
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "So, position or velocity? Pick the mechanism your team is most likely to build this season. Then follow it through the whole workshop. Make your choice at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
