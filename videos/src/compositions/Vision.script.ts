import type { VideoScript } from "../lib/types";

export const VisionScript: VideoScript = {
  id: "Vision",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "Vision turns your robot from a blind machine into a field-aware system. With a camera and AprilTags, it can correct odometry drift, track targets, and detect game pieces — all critical for competitive FRC autonomous and teleop assistance.",
      slide: {
        kind: "title",
        title: "Computer Vision",
        subtitle: "See the field, know your pose",
        accent: "teal",
      },
    },
    {
      id: "options",
      text: "FRC teams have two main vision options. Limelight is a dedicated, plug-and-play camera with integrated processing, LEDs, and NetworkTables built in. PhotonVision is free, open-source software that runs on a coprocessor like a Raspberry Pi with any USB camera attached.",
      slide: {
        kind: "bullets",
        title: "Two main options",
        accent: "teal",
        bullets: [
          "Limelight — integrated hardware, ~$400 to $500",
          "PhotonVision — open source on a coprocessor, ~$100 to $150",
          "Both support AprilTags and pose estimation",
        ],
      },
    },
    {
      id: "limelight",
      text: "Limelight is what we use in this workshop. It's a single unit you power from the PDH, connect to the radio over ethernet, and configure through a web interface. Mount it so the camera can see scoring AprilTags, and offset it from tag height so it looks slightly up or down.",
      slide: {
        kind: "image",
        src: "images/mechanisms/limelight.png",
        title: "Limelight — our workshop choice",
        caption:
          "Integrated processing, LED ring, and NetworkTables out of the box.",
      },
    },
    {
      id: "apriltags",
      text: "AprilTags are fiducial markers placed at known field locations. The camera detects a tag, calculates its relative pose, and because the tag's field position is known, the robot's absolute position can be computed. Two tags or more make the pose unique. With only one tag visible, though, the math is ambiguous. There are two equally valid robot poses that fit what the camera sees. Limelight gives you two strategies for handling that, called MegaTag1 and MegaTag2.",
      slide: {
        kind: "bullets",
        title: "How AprilTags localize the robot",
        accent: "mint",
        bullets: [
          "Each tag has a unique ID and known field pose",
          "Camera measures the relative pose to the tag",
          "Robot pose is computed from the tag's known location",
          "Two or more tags = unique pose; one tag = ambiguous",
        ],
      },
    },
    {
      id: "megatag",
      text: "MegaTag1 is the straightforward approach. The camera looks at every visible tag, runs perspective-n-point on the corners, and returns a pose. With two or more tags it's unambiguous, and you get a clean heading correction too. The problem comes with a single tag. The math allows two equally valid solutions, and MegaTag1 just picks one. It might pick wrong. That is where MegaTag2 helps. You push the robot's current gyro heading to the Limelight every cycle, and Limelight uses that heading to pick the correct single-tag solution. The trade-off is that MegaTag2's heading is just the gyro reading bounced back, so it cannot correct your gyro drift. The rule we follow is simple. Use MegaTag1 when two or more tags are visible. Fall back to MegaTag2 when only one tag is in frame.",
      slide: {
        kind: "bullets",
        title: "MegaTag1 vs MegaTag2 — Limelight-only",
        accent: "purple",
        bullets: [
          "MT1: straight PnP on visible tags — ambiguous with one tag",
          "MT2: feeds your gyro into Limelight to disambiguate one tag",
          "MT2 borrows heading from the gyro — won't fix gyro drift",
          "Workshop rule: MT1 for multi-tag, MT2 for single-tag",
        ],
      },
    },
    {
      id: "filtering",
      text: "Even with MegaTag2, vision can lie. A glancing-angle tag, a tag fifty feet away, or the robot spinning fast enough to motion-blur the image. Any of these can produce a pose that looks valid but is wildly wrong. Bad measurements that reach odometry will warp it, even with a huge standard deviation, so we reject them before they ever get there. We filter on five things. The first filter is ambiguity. Limelight tells us how confident the solve is, and we drop anything over zero point three. The second filter is distance. Beyond five and a half meters the tags are too few pixels to trust. The third filter is angular velocity. Spinning fast smears the image, and MegaTag2 has a tighter cap than MegaTag1 because it depends on a synchronized gyro reading. The fourth filter is field bounds. If the computed pose is outside the field rectangle, it is obviously wrong. The fifth and final piece is standard deviation scaling. Measurements that survive do not get equal weight. They are scaled by distance and tag count so the Kalman filter knows how much to trust each one.",
      slide: {
        kind: "bullets",
        title: "Five filters before vision touches odometry",
        accent: "teal",
        bullets: [
          "Ambiguity — drop if Limelight isn't confident in the solve",
          "Distance — drop beyond ~5.5 m, too few pixels to trust",
          "Angular velocity — drop when spinning blurs the image",
          "Field bounds — drop poses outside the field rectangle",
          "Std-dev scaling — survivors weighted by distance and tag count",
        ],
      },
    },
    {
      id: "outro",
      text: "Next, we'll wire all of this into the swerve drivetrain. You'll read vision data through LimelightHelpers, switch between MegaTag1 and MegaTag2 based on tag count, run every estimate through those five filters, and feed the survivors into the CTRE pose estimator with the right amount of trust.",
      slide: {
        kind: "title",
        title: "Next: implementing vision",
        subtitle: "MT1, MT2, the five filters, and the pose estimator",
        accent: "teal",
      },
    },
  ],
};
