import type { Metadata } from "next";

// Internal preview page for the lesson video series, one video per lesson,
// built in videos-next/. Intentionally NOT linked from the curriculum drawer or
// any lesson, and marked noindex: the videos stay here until the owner says
// otherwise. MP4s are GitHub release assets on `video-series`, so the repo
// stays free of large binaries.
//
// It lives under `(workshop)` so it renders inside the shell. Route groups
// add no path segment, so the URL is still `/video`.

export const metadata: Metadata = {
  title: "Lesson Videos (Preview)",
  robots: { index: false, follow: false },
};

const SERIES_BASE =
  "https://github.com/Hemlock5712/Workshop-Site/releases/download/video-series";

interface Video {
  file: string;
  title: string;
  blurb: string;
}

interface VideoGroup {
  heading: string;
  videos: Video[];
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

const GROUPS: VideoGroup[] = NEXT_SERIES.map(([heading, rows]) => ({
  heading,
  videos: rows.map(([id, title, blurb]) => ({
    file: `${id}.mp4`,
    title,
    blurb,
  })),
}));
const VIDEO_COUNT = GROUPS.reduce((n, g) => n + g.videos.length, 0);

export default function VideoPreviewPage() {
  return (
    <div className="px-6 pb-24 pt-14 md:px-12 lg:px-[76px]">
      <header className="measure">
        <span className="micro">Internal preview · not indexed</span>
        <h1 className="display-section m-0 mt-control">Lesson Videos</h1>
        <p className="lesson-lede m-0 mt-flow">
          Not linked from the lessons yet. One video per lesson, {VIDEO_COUNT}{" "}
          in all, each a few minutes long.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.heading} className="mt-stack">
          {/* A mono micro-label over a hairline, not display type. These
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
              {String(group.videos.length).padStart(2, "0")} videos
            </span>
          </h2>

          <div className="mt-step grid grid-cols-1 gap-step md:grid-cols-2">
            {group.videos.map((video) => {
              // The caption is the video's accessible name, so the two cannot
              // drift apart. File names are unique, which is what makes this a
              // safe id without a client-side `useId`.
              const titleId = `${video.file.replace(/\.mp4$/, "")}-title`;

              return (
                <figure
                  key={video.file}
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
                      seeks in and the browser renders that
                      frame as its own poster. No poster files to keep in sync.
                      The videos fade their title card in, so it
                      seeks to 2 s, where the title is up. */}
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    aria-labelledby={titleId}
                    className="aspect-video w-full rounded-lg bg-[var(--bg3)]"
                    src={`${SERIES_BASE}/${video.file}#t=2`}
                  />

                  <figcaption className="mt-control">
                    <h3 id={titleId} className="display m-0 text-aside">
                      {video.title}
                    </h3>
                    <p
                      className="m-0 mt-tight text-note"
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--tx2)",
                      }}
                    >
                      {video.blurb}
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
