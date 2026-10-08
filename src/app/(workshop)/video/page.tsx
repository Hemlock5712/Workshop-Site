import type { Metadata } from "next";

// Internal preview page for the workshop trailer videos. Intentionally NOT
// linked from the curriculum drawer, and marked noindex — videos move onto
// their topic pages once approved. MP4s are hosted as GitHub release assets so
// the repo stays free of large binaries.
//
// It lives under `(workshop)` so it renders inside the shell. It used to sit at
// `src/app/video/`, outside the group, which meant no rail, no breadcrumb and
// no way back: the page measured zero links and zero landmarks. Route groups
// add no path segment, so the URL is still `/video`.

export const metadata: Metadata = {
  title: "Workshop Trailers (Preview)",
  robots: { index: false, follow: false },
};

const RELEASE_BASE =
  "https://github.com/Hemlock5712/Workshop-Site/releases/download/video-previews";

// The October 2026 series, built in videos-next/ and hosted on its own release
// so the trailers above stay untouched until they are retired.
const SERIES_BASE =
  "https://github.com/Hemlock5712/Workshop-Site/releases/download/video-series";

interface Trailer {
  file: string;
  title: string;
  blurb: string;
  series?: boolean;
}

interface TrailerGroup {
  heading: string;
  trailers: Trailer[];
}

// One group per workshop, in course order: [id, title, blurb].
const NEXT_SERIES: [string, [string, string, string][]][] = [
  [
    "Workshop 1 · Hardware & CTRE",
    [
      [
        "hardware",
        "Three Parts and a Bus",
        "Hardware Setup: a motor, a sensor, and a bus to your laptop.",
      ],
      [
        "mechanism-setup",
        "Numbers and First Motion",
        "Motor Setup: Voltage Out moves the moment you click.",
      ],
      [
        "pid-control",
        "One Motion, Then Silence",
        "PID Tuning: feedforward holds, feedback fixes what's left.",
      ],
      [
        "motion-magic",
        "Walking the Target",
        "Motion Magic: speed up, cruise, slow down.",
      ],
    ],
  ],
  [
    "Workshop 2 · Code Foundations",
    [
      [
        "java-basics",
        "Handing Over Code",
        "Java Basics: a lambda is code handed over to run later.",
      ],
      [
        "command-framework",
        "The Scheduler",
        "The Command Framework: fifty times a second, one owner per mechanism.",
      ],
    ],
  ],
  [
    "Workshop 3 · Robot Programming",
    [
      [
        "mechanisms",
        "Configs and Requests",
        "Mechanisms: settings go in once, requests every loop.",
      ],
      [
        "adding-commands",
        "Every Command Is a Hold",
        "Writing Commands: each one runs until something takes the arm.",
      ],
      [
        "opmodes",
        "Two Edges",
        "OpModes: press and release, each with its own binding.",
      ],
      [
        "latched",
        "The Latched Request",
        "Hardware Simulation: canceling a command is not stopping a motor.",
      ],
      [
        "motion-magic-code",
        "Naming a Target",
        "Motion Magic in Code: a position request that stays holds the arm.",
      ],
    ],
  ],
  [
    "Workshop 4 · Routines",
    [
      [
        "chaining-commands",
        "Steps",
        "Command Composition: give every step an ending.",
      ],
      [
        "finish-conditions",
        "Ask Every Loop",
        "Finish Conditions: end on the sensor, back it with a timer.",
      ],
      [
        "coroutines",
        "Fork and Wait",
        "Coroutines: fork the holds, await the steps.",
      ],
      [
        "logging-implementation",
        "What Nobody Watched",
        "Logging: the file shows what nobody saw.",
      ],
      [
        "testing",
        "One Tick by Hand",
        "Testing: run the loop by hand and check both sides.",
      ],
    ],
  ],
  [
    "Workshop 5 · Swerve & Autonomous",
    [
      [
        "swerve-prerequisites",
        "Facing One Way, Driving Another",
        "How Swerve Works: field centric, and the blue-corner origin.",
      ],
      [
        "swerve-drive-project",
        "One File From Tuner X",
        "Swerve Project Generator: measure it, generate it, drive it in sim.",
      ],
      [
        "swerve-calibration",
        "Straight Means Straight",
        "Swerve Calibration: a steady curve is a zero.",
      ],
      [
        "swerve-drive-tuning",
        "What the Carpet Says",
        "Swerve Drive Tuning: radius, top speed and slip, from the floor.",
      ],
      [
        "autonomous",
        "Fifteen Seconds, No Driver",
        "Autonomous: every way out of the routine stops the robot.",
      ],
      [
        "pathplanner",
        "A Path That Knows Where It Ends",
        "PathPlanner Paths: follow the plan, correct back onto it.",
      ],
    ],
  ],
  [
    "Workshop 6 · Vision & Navigation",
    [
      [
        "vision-hardware",
        "Seeing the Field",
        "Vision Hardware: tags don't drift; never mount square.",
      ],
      [
        "vision-implementation",
        "Blending, Not Replacing",
        "Vision: weigh, rewind, replay.",
      ],
      [
        "drive-to-point",
        "Speed From Distance",
        "Drive to Point: it bolts, then creeps up short.",
      ],
      [
        "advanced-drive-to-point",
        "Plan the Trip",
        "Profiled Drive to Point: the plan drives, a correction trims.",
      ],
      [
        "dynamic-path-planning",
        "Starting From Anywhere",
        "Pathfinding: the margin is your bumper.",
      ],
      [
        "drive-to-tag-inline",
        "Every Way Out Stops",
        "Example: Drive to Tag: one loop, a stop on every exit.",
      ],
    ],
  ],
];

const GROUPS: TrailerGroup[] = [
  ...NEXT_SERIES.map(([heading, rows]) => ({
    heading: `${heading} · new series`,
    trailers: rows.map(([id, title, blurb]) => ({
      file: `${id}.mp4`,
      title,
      blurb,
      series: true,
    })),
  })),
  {
    heading: "Full lessons",
    trailers: [
      {
        file: "commands-lesson.mp4",
        title: "Commands walkthrough",
        blurb:
          "Scheduler, three command shapes, requirement conflicts, cancellation, default commands, compositions, bindings (~5 min).",
      },
      {
        file: "pid-lesson.mp4",
        title: "PID control: full lesson",
        blurb:
          "Sag, ringing, over-damped D, the I term and windup, bump recovery, the tuning procedure, tolerance (~4.5 min).",
      },
      {
        file: "feedforward-lesson.mp4",
        title: "Feedforward: full lesson",
        blurb:
          "The whole family: kG on the arm, kS and kV on the flywheel, rapid-fire recovery, how to characterize (~4.5 min).",
      },
      {
        file: "motion-magic-lesson.mp4",
        title: "Motion Magic: full lesson",
        blurb:
          "Trapezoid anatomy, choosing cruise and acceleration, the infeasible-profile failure, velocity variant (~4 min).",
      },
    ],
  },
  {
    heading: "Workshops 1-3 & 6: hardware and commands",
    trailers: [
      {
        file: "introduction-trailer.mp4",
        title: "Introduction",
        blurb: "What the workshop covers and who it's for.",
      },
      {
        file: "prerequisites-trailer.mp4",
        title: "Prerequisites",
        blurb: "The 2027 toolchain: template, WPILib alpha, SystemCore.",
      },
      {
        file: "hardware-trailer.mp4",
        title: "Hardware",
        blurb: "Kraken X44, CANcoder, and CANivore share one bus.",
      },
      {
        file: "mechanism-selection-trailer.mp4",
        title: "Mechanism Selection",
        blurb: "Pick the arm or flywheel as the mechanism to follow.",
      },
      {
        file: "project-setup-trailer.mp4",
        title: "Project Setup",
        blurb: "From a new WPILib project to a deployable one.",
      },
      {
        file: "building-mechanisms-trailer.mp4",
        title: "Building Mechanisms",
        blurb: "A Mechanism class owns one physical thing.",
      },
      {
        file: "command-framework-trailer.mp4",
        title: "Command Framework",
        blurb: "How triggers, mechanisms, and commands reach the scheduler.",
      },
      {
        file: "adding-commands-trailer.mp4",
        title: "Adding Commands",
        blurb: "Holds, the one rule, and chaining a routine.",
      },
      {
        file: "triggers-trailer.mp4",
        title: "Triggers",
        blurb: "whileTrue holds, onTrue one-shots, automatic teardown.",
      },
      {
        file: "running-program-trailer.mp4",
        title: "Running the Program",
        blurb: "Drive the mechanism in simulation before hardware exists.",
      },
    ],
  },
  {
    heading: "Workshop 1: closed-loop control",
    trailers: [
      {
        file: "pid-trailer.mp4",
        title: "PID Control",
        blurb: "Feedback: sag, overshoot, and the D that lands it.",
      },
      {
        file: "feedforward-trailer.mp4",
        title: "Feedforward",
        blurb: "Cancel gravity before it creates an error.",
      },
      {
        file: "motion-magic-trailer.mp4",
        title: "Motion Magic",
        blurb: "Plan the path: a setpoint that never runs away.",
      },
    ],
  },
  {
    heading: "Workshops 4 & 5: swerve, sensing, autonomy",
    trailers: [
      {
        file: "swerve-drive-trailer.mp4",
        title: "Swerve Drive",
        blurb: "From the CTRE generator to a driving robot.",
      },
      {
        file: "logging-options-trailer.mp4",
        title: "Logging Options",
        blurb: "DataLogManager: two lines, everything on disk.",
      },
      {
        file: "logging-implementation-trailer.mp4",
        title: "Logging Implementation",
        blurb: "Publish, capture, replay in AdvantageScope.",
      },
      {
        file: "vision-options-trailer.mp4",
        title: "Vision Options",
        blurb: "AprilTags, Limelight vs PhotonVision.",
      },
      {
        file: "vision-implementation-trailer.mp4",
        title: "Vision Implementation",
        blurb: "Filtered poses into the CTRE pose estimator.",
      },
      {
        file: "drive-to-point-trailer.mp4",
        title: "Drive to Point",
        blurb: "One button press, one exact field pose.",
      },
      {
        file: "vision-shooting-trailer.mp4",
        title: "Vision Shooting",
        blurb: "Aim and shoot from the vision-corrected pose.",
      },
      {
        file: "advanced-drive-to-point-trailer.mp4",
        title: "Advanced Drive to Point",
        blurb: "Profiled path following with feedforward.",
      },
    ],
  },
];

export default function VideoPreviewPage() {
  return (
    <div className="px-6 pb-24 pt-14 md:px-12 lg:px-[76px]">
      <header className="measure">
        <span className="micro">Internal preview · not indexed</span>
        <h1 className="display-section m-0 mt-control">Workshop Trailers</h1>
        <p className="lesson-lede m-0 mt-flow">
          Not linked from the lessons yet. The 22 trailers run a minute and a
          half to two minutes each; the five full lessons at the top run about
          five minutes.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.heading} className="mt-stack">
          {/* A mono micro-label over a hairline, not display type. These four
              headings label a list of cards rather than open a passage of
              prose, and `.display-section` above floors at 27px on a phone —
              a 25px group heading under it read as the same size. Smaller than
              the card titles is the point: it divides, it doesn't compete. */}
          <h2
            className="micro m-0 flex items-baseline justify-between gap-flow pb-tight"
            style={{
              borderBottom: "1px solid var(--rule)",
              color: "var(--tx2)",
            }}
          >
            <span>{group.heading}</span>
            <span className="tabular shrink-0" style={{ color: "var(--tx3)" }}>
              {String(group.trailers.length).padStart(2, "0")} videos
            </span>
          </h2>

          <div className="mt-step grid grid-cols-1 gap-step md:grid-cols-2">
            {group.trailers.map((trailer) => {
              // The caption is the video's accessible name, so the two cannot
              // drift apart. File names are unique, which is what makes this a
              // safe id without a client-side `useId`.
              const titleId = `${trailer.file.replace(/\.mp4$/, "")}-title`;

              return (
                <figure
                  key={trailer.file}
                  className="m-0 min-w-0 rounded-lg p-flow"
                  style={{
                    border: "1px solid var(--rule)",
                    background: "var(--bg2)",
                  }}
                >
                  {/* `preload="metadata"` plus the `#t=` media fragment is
                      what makes these visible at all. With `preload="none"` and
                      no poster the page was 27 empty boxes; metadata alone
                      fetches the header but paints nothing, so the fragment
                      seeks a tenth of a second in and the browser renders that
                      frame as its own poster. No poster files to keep in sync.
                      The new series fades its title card in, so it seeks to 2 s,
                      where the title is up. */}
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    aria-labelledby={titleId}
                    className="aspect-video w-full rounded-lg bg-[var(--bg3)]"
                    src={`${trailer.series ? SERIES_BASE : RELEASE_BASE}/${trailer.file}#t=${trailer.series ? 2 : 0.1}`}
                  />

                  <figcaption className="mt-control">
                    <h3 id={titleId} className="display m-0 text-aside">
                      {trailer.title}
                    </h3>
                    <p
                      className="m-0 mt-tight text-note"
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--tx2)",
                      }}
                    >
                      {trailer.blurb}
                    </p>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
