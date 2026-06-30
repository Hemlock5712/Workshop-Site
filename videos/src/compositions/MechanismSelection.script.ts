import type { VideoScript } from "../lib/types";

export const MechanismSelectionScript: VideoScript = {
  id: "MechanismSelection",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "Before you write a single line of code, you need to pick a mechanism. The Gray Matter workshop is built around two physical platforms, and the one you choose shapes every example, every exercise, and every PID tune you'll do from here on.",
      slide: {
        kind: "title",
        title: "Pick Your Mechanism",
        subtitle: "Arm or flywheel — the workshop follows your choice",
        accent: "blue",
      },
    },
    {
      id: "two-options",
      text: "Your two options are an arm and a flywheel. The arm is a position-controlled mechanism with a CANcoder, so you'll learn encoder direction, zeroing, and holding a target angle. The flywheel is a velocity-controlled leader-follower pair, so you'll focus on spinning two motors together at a target speed.",
      slide: {
        kind: "bullets",
        title: "The two workshop mechanisms",
        accent: "blue",
        bullets: [
          "Arm — position control with an absolute encoder",
          "Flywheel — velocity control with leader and follower",
          "Both share the same TalonFX and CANivore hardware path",
        ],
      },
    },
    {
      id: "arm-pick",
      text: "Pick the arm if you want to learn position control end to end. You'll verify that counterclockwise rotation increases the encoder, zero the mechanism at a known angle, and then drive it to specific positions with PID and Motion Magic later in the workshop.",
      slide: {
        kind: "image",
        src: "images/mechanisms/arm.png",
        title: "Choose the arm for position control",
        caption: "Encoder direction, zeroing, then PID to a target angle.",
      },
    },
    {
      id: "flywheel-pick",
      text: "Pick the flywheel if you'd rather focus on velocity control. You'll verify both motors spin together in a leader-follower setup, then tune a velocity loop so the wheels reach a target RPM quickly and hold it under load — the same pattern a real shooter uses.",
      slide: {
        kind: "image",
        src: "images/mechanisms/flywheel.png",
        title: "Choose the flywheel for velocity control",
        caption:
          "Leader-follower verification, then velocity PID to a target RPM.",
      },
    },
    {
      id: "outro",
      text: "Either choice teaches the full command-based stack — subsystems, commands, triggers, and tuning. Lock in your mechanism now, finish the hardware setup steps for it, and the rest of the workshop will use your pick in every code example.",
      slide: {
        kind: "title",
        title: "Lock it in and move on",
        subtitle: "Your mechanism choice drives every example that follows",
        accent: "teal",
      },
    },
  ],
};
