import type { VideoScript } from "../lib/types";

export const HardwareScript: VideoScript = {
  id: "Hardware",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "Before we write any robot code, let's meet the hardware. This workshop uses three CTRE devices working together: a smart motor, an absolute position sensor, and a high-speed communication hub that ties them all to your computer.",
      slide: {
        kind: "title",
        title: "Hardware Setup",
        subtitle: "Kraken X44, CANcoder, and CANivore",
        accent: "blue",
      },
    },
    {
      id: "kraken",
      text: "First, the Kraken X44 brushless motor. What makes it special is the Talon FX motor controller built right inside. Instead of needing a separate controller box, the Kraken handles its own voltage, position sensing, and PID control, and talks to your code over the CAN bus.",
      slide: {
        kind: "image",
        src: "images/hardware/Kraken44x.png",
        title: "Kraken X44 brushless motor",
        caption:
          "Motor and Talon FX controller in one package — wired over CAN.",
      },
    },
    {
      id: "cancoder",
      text: "Next, the CANcoder. The encoder built into a motor resets to zero every time you power on, which is a problem if your arm doesn't start in the same spot. The CANcoder uses a magnet to remember its absolute position even when the robot is off — so your mechanism always knows exactly where it is.",
      slide: {
        kind: "bullets",
        title: "CANcoder — absolute position",
        accent: "mint",
        bullets: [
          "Absolute — remembers position when powered off",
          "Mounts directly on the rotating shaft",
          "Connects over the same CAN bus as the Kraken",
        ],
      },
    },
    {
      id: "canivore",
      text: "Finally, the CANivore. It plugs into your computer over USB and creates a dedicated high-speed CAN FD network for all your motors and sensors. It's faster than running everything through the roboRIO, which matters a lot once you get to swerve drive with eight motors and four CANcoders fighting for bandwidth.",
      slide: {
        kind: "bullets",
        title: "CANivore — USB to CAN FD",
        accent: "purple",
        bullets: [
          "USB link from your PC to the CAN FD bus",
          "Faster bus utilization than the roboRIO alone",
          "Every Kraken and CANcoder plugs into it",
        ],
      },
    },
    {
      id: "outro",
      text: 'Connect the CANivore, open Phoenix Tuner, set Team number to localhost, and name the CANivore "canivore". Update firmware until every device card is green, and you\'re ready to spin some motors.',
      slide: {
        kind: "title",
        title: "Plug in, update, spin motors",
        subtitle: "Phoenix Tuner — localhost, green cards, go",
        accent: "teal",
      },
    },
  ],
};
