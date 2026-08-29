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

interface Trailer {
  file: string;
  title: string;
  blurb: string;
}

interface TrailerGroup {
  heading: string;
  trailers: Trailer[];
}

const GROUPS: TrailerGroup[] = [
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
        file: "state-based-lesson.mp4",
        title: "State-based control: full lesson",
        blurb:
          "Why not ifs, the state graph, every transition kind, adding a state, interrupts (~4 min).",
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
        blurb: "From the 2027-Template to a deployable project.",
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
      {
        file: "state-based-trailer.mp4",
        title: "State-Based Control",
        blurb: "The mechanism knows its states and moves between them.",
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
                  {/* `preload="metadata"` plus the `#t=0.1` media fragment is
                      what makes these visible at all. With `preload="none"` and
                      no poster the page was 27 empty boxes; metadata alone
                      fetches the header but paints nothing, so the fragment
                      seeks a tenth of a second in and the browser renders that
                      frame as its own poster. No poster files to keep in sync. */}
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    aria-labelledby={titleId}
                    className="aspect-video w-full rounded-lg bg-[var(--bg3)]"
                    src={`${RELEASE_BASE}/${trailer.file}#t=0.1`}
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
