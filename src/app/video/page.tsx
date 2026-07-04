import type { Metadata } from "next";

// Internal preview page for the workshop trailer videos. Intentionally NOT
// linked from the sidebar or search index, and marked noindex — videos move
// onto their topic pages once approved. MP4s are hosted as GitHub release
// assets so the repo stays free of large binaries.

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
    heading: "Full Lessons — the deep dives",
    trailers: [
      {
        file: "commands-lesson.mp4",
        title: "Commands Deep Dive",
        blurb:
          "Scheduler, three command shapes, requirement conflicts, cancellation, default commands, compositions, bindings (~5 min).",
      },
      {
        file: "state-based-lesson.mp4",
        title: "State-Based Control — Full Lesson",
        blurb:
          "Why not ifs, the state graph, every transition kind, adding a state, interrupts (~4 min).",
      },
      {
        file: "pid-lesson.mp4",
        title: "PID Control — Full Lesson",
        blurb:
          "Sag, ringing, over-damped D, the I term and windup, bump recovery, the tuning procedure, tolerance (~4.5 min).",
      },
      {
        file: "feedforward-lesson.mp4",
        title: "Feedforward — Full Lesson",
        blurb:
          "The whole family: kG on the arm, kS and kV on the flywheel, rapid-fire recovery, how to characterize (~4.5 min).",
      },
      {
        file: "motion-magic-lesson.mp4",
        title: "Motion Magic — Full Lesson",
        blurb:
          "Trapezoid anatomy, choosing cruise and acceleration, the infeasible-profile failure, velocity variant (~4 min).",
      },
    ],
  },
  {
    heading: "Workshop 1 — Foundations",
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
        blurb: "Kraken X44, CANcoder, CANivore — three devices, one bus.",
      },
      {
        file: "mechanism-selection-trailer.mp4",
        title: "Mechanism Selection",
        blurb: "Arm or flywheel — pick the mechanism the workshop follows.",
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
        blurb: "Triggers, mechanisms, commands — and the scheduler.",
      },
      {
        file: "adding-commands-trailer.mp4",
        title: "Adding Commands",
        blurb: "Three command shapes: finish, park, waitUntil.",
      },
      {
        file: "triggers-trailer.mp4",
        title: "Triggers",
        blurb: "OpMode bindings: onTrue, whileTrue, automatic teardown.",
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
    heading: "Closed-Loop Control — watch in order",
    trailers: [
      {
        file: "pid-trailer.mp4",
        title: "PID Control",
        blurb: "Feedback: sag, overshoot, and the D that lands it.",
      },
      {
        file: "feedforward-trailer.mp4",
        title: "Feedforward",
        blurb: "Stop reacting — cancel gravity before the error exists.",
      },
      {
        file: "motion-magic-trailer.mp4",
        title: "Motion Magic",
        blurb: "Plan the path: a setpoint that never runs away.",
      },
    ],
  },
  {
    heading: "Workshop 2 — Swerve, Sensing, Autonomy",
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
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Workshop Trailers
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-400">
        Preview build — these are not linked from the workshop pages yet. Each
        trailer is about 90 seconds.
      </p>

      {GROUPS.map((group) => (
        <section key={group.heading} className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {group.heading}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            {group.trailers.map((trailer) => (
              <div
                key={trailer.file}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <video
                  controls
                  preload="none"
                  playsInline
                  className="aspect-video w-full rounded-lg bg-black"
                  src={`${RELEASE_BASE}/${trailer.file}`}
                />
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-gray-100">
                  {trailer.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {trailer.blurb}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
