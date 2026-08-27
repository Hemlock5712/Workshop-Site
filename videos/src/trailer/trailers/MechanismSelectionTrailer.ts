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
      text: "Arm, or flywheel. That's the choice, and it's the one you'll live with for the rest of the workshop, because every example from here on is written against whichever one you bolt to the table.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "arm-intro",
      text: "First option, the arm. Position control: you ask for forty degrees, the joint holds forty degrees, and gravity gets no say in it. An absolute encoder on the pivot is why it still knows where it is after a power cycle.",
      camera: { x: 2520, y: 100, width: 1480, height: 1080 },
    },
    {
      id: "arm-skills",
      text: "Build it and you'll spend an afternoon on the unglamorous stuff: which direction the encoder counts, where zero lives, how to drive to an angle and stop there. PID and Motion Magic sit right on top of that.",
      camera: { x: 2700, y: 300, width: 1160, height: 700 },
    },
    {
      id: "flywheel-intro",
      text: "Second option, the flywheel. Velocity control: get a wheel to a speed and keep it there. Two motors, one leading and one following, because one alone won't spin a heavy wheel back up fast enough between shots.",
      camera: { x: 5440, y: 200, width: 1480, height: 1080 },
    },
    {
      id: "flywheel-skills",
      text: "The whole challenge is load. A game piece goes through, the wheel dips, and whether the next shot goes in depends on how fast the controller claws that speed back.",
      camera: { x: 5620, y: 400, width: 1160, height: 700 },
    },
    {
      id: "same-hardware",
      text: "Either way the wiring is identical: one TalonFX hanging off a CANivore. Same setup, right down to the file layout. All that changes is the number you're chasing, an angle or a speed.",
      camera: { x: 2440, y: 60, width: 4560, height: 1280 },
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "Pick the one your team is actually going to build this season, not the one that sounds cooler on a whiteboard. Then go bolt it together.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
