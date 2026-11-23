import type { Metadata } from "next";
import { LESSONS, SECTIONS } from "@/data/lessons";

// Internal preview page for the lesson video series, one video per lesson,
// built in videos-next/. Intentionally NOT linked from the curriculum drawer or
// any lesson, and marked noindex: the videos stay here until the owner says
// otherwise. MP4s are GitHub release assets on `video-series`, so the repo
// stays free of large binaries. They play through `/api/video`, not from
// GitHub directly: GitHub serves a release download as a file to save, and
// iPhones will not play that. The route's header has the details.
//
// It lives under `(workshop)` so it renders inside the shell. Route groups
// add no path segment, so the URL is still `/video`.

export const metadata: Metadata = {
  title: "Lesson Videos (Preview)",
  robots: { index: false, follow: false },
};

const SERIES_BASE = "/api/video";

interface Video {
  file: string;
  title: string;
}

interface VideoGroup {
  heading: string;
  videos: Video[];
}

// One video per lesson, named for its slug, grouped the way the course is.
// Derived from `lessons.ts`, so adding or renaming a lesson needs no edit
// here: its video is `videos-next/out/<slug>.mp4`, uploaded to the release.
const GROUPS: VideoGroup[] = SECTIONS.map((section) => ({
  // "00" (Getting Started) and "EX" (Extras) are not numbered workshops.
  heading:
    Number(section.num) > 0
      ? `Workshop ${Number(section.num)} · ${section.title}`
      : section.title,
  videos: LESSONS.filter((lesson) => lesson.section === section.id).map(
    (lesson) => ({
      file: `${lesson.slug.slice(1)}.mp4`,
      title: lesson.title,
    })
  ),
})).filter((group) => group.videos.length > 0);
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
                      The videos open on a title card, so it
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
