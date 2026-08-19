"use client";

/**
 * What you'll program — the four mechanisms, grouped by the workshop phase
 * that introduces them.
 *
 * Grouping by workshop rather than running all four in one row is the point:
 * it answers "what do I get out of each evening?" before the syllabus asks
 * anyone to read the full syllabus. Workshop #1 is two bench mechanisms;
 * Workshops #3 and #4 add the drivetrain and camera.
 *
 * Each photo starts desaturated under an accent wash and resolves to full
 * colour as it scrolls into view, staggered left to right. The effect is the
 * argument: these are real objects that get built, not feature cards. It is
 * also why the strips are full-bleed with no gaps — a grid of bordered cards
 * with an icon on each is the look this design set out to avoid.
 *
 * Reveal is one-way and idempotent. Scrolling back up does not re-hide, and
 * `prefers-reduced-motion` drops the transitions via the global rule in
 * globals.css, leaving the resolved state.
 *
 * The hidden state lives in CSS (`.reveal` in globals.css) and not in an
 * inline style, and that is not a tidying preference. Inline `opacity: 0`
 * shipped in the server HTML, so on any page where JS did not arrive — blocked,
 * a chunk that 404'd, a phone that gave up — all four figures and their
 * captions stayed invisible permanently. The CSS form only hides under
 * `html.js`, a class set by a blocking inline script in the root layout, so
 * the hidden state cannot exist unless something is running that can undo it.
 * Doing the same flip in an effect was the other option and is worse: it
 * paints visible, then hides, then animates back in — a flash for everyone, to
 * fix a case that affects almost no one.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface Mechanism {
  src: string;
  alt: string;
  kicker: string;
  title: string;
  blurb: string;
}

interface MechanismGroup {
  num: string;
  title: string;
  blurb: string;
  mechanisms: ReadonlyArray<Mechanism>;
}

const GROUPS: ReadonlyArray<MechanismGroup> = [
  {
    num: "01",
    title: "Hardware & CTRE",
    blurb: "Bench mechanisms tuned in Tuner X before robot code begins.",
    mechanisms: [
      {
        src: "/images/mechanisms/arm.png",
        alt: "The single-jointed arm on its bench mount",
        kicker: "Position control",
        title: "Robot Arm",
        blurb: "Hold an exact angle while gravity pulls against you.",
      },
      {
        src: "/images/mechanisms/flywheel.png",
        alt: "The two-motor shooter flywheel",
        kicker: "Velocity control",
        title: "Shooter Flywheel",
        blurb: "Keep one speed under load, shot after shot.",
      },
    ],
  },
  {
    num: "03–04",
    title: "Swerve & Vision",
    blurb: "The whole robot: calibrated motion, field pose, and perception.",
    mechanisms: [
      {
        src: "/images/mechanisms/swerve.png",
        alt: "A CTR swerve drive module",
        kicker: "Holonomic drive",
        title: "CTR Swerve",
        blurb: "Eight motors, four encoders, one heading you trust.",
      },
      {
        src: "/images/mechanisms/limelight.png",
        alt: "A Limelight camera mounted on the robot",
        kicker: "Perception",
        title: "AprilTag Vision",
        blurb: "Let the camera correct what the wheels got wrong.",
      },
    ],
  },
];

export default function MechanismStrip() {
  const rootRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const root = rootRef.current;
    const keys = GROUPS.flatMap((g, gi) =>
      g.mechanisms.map((_, i) => `${gi}-${i}`)
    );

    if (!root || typeof IntersectionObserver === "undefined") {
      // No observer (old browser, JSDOM): show everything rather than
      // leaving four invisible figures on the page.
      setRevealed(new Set(keys));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hits = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.getAttribute("data-reveal"))
          .filter((v): v is string => Boolean(v));
        if (!hits.length) return;
        setRevealed((prev) => {
          const next = new Set(prev);
          hits.forEach((h) => next.add(h));
          return next.size === prev.size ? prev : next;
        });
      },
      { threshold: 0.28 }
    );

    root
      .querySelectorAll("[data-reveal]")
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={rootRef} className="pt-14">
      <div className="px-6 md:px-12 lg:px-[76px]">
        <div className="flex items-baseline gap-4 pb-[18px]">
          <span className="micro whitespace-nowrap">
            What you&rsquo;ll program
          </span>
          <span
            aria-hidden="true"
            className="h-px flex-1"
            style={{ background: "var(--rule-soft)" }}
          />
        </div>
        <h2
          className="display m-0 pb-9"
          style={{
            fontSize: "clamp(30px, 4vw, 52px)",
            lineHeight: 1,
            letterSpacing: "-0.015em",
          }}
        >
          Four mechanisms. Five workshops.
        </h2>
      </div>

      {GROUPS.map((group, gi) => (
        <div key={group.num} className={gi > 0 ? "pt-12" : undefined}>
          <div className="flex flex-col gap-2 px-6 pb-[18px] md:flex-row md:items-baseline md:gap-4 md:px-12 lg:px-[76px]">
            <span
              className="mono shrink-0"
              style={{
                fontSize: "var(--text-meta)",
                letterSpacing: "0.12em",
                color: "var(--accent)",
              }}
            >
              {group.num}
            </span>
            <span
              className="display shrink-0"
              style={{ fontSize: "var(--text-title)", lineHeight: 1.1 }}
            >
              {group.title}
            </span>
            <span
              className="min-w-0"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--text-ui)",
                lineHeight: 1.5,
                color: "var(--tx3)",
              }}
            >
              {group.blurb}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 md:block"
              style={{ background: "var(--rule-soft)" }}
            />
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2"
            style={{
              borderTop: "1px solid var(--rule)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {group.mechanisms.map((mech, i) => {
              const key = `${gi}-${i}`;
              const on = revealed.has(key);
              return (
                <figure
                  key={mech.title}
                  data-reveal={key}
                  data-revealed={on ? "true" : "false"}
                  className="reveal m-0"
                  style={{
                    borderRight:
                      i < group.mechanisms.length - 1
                        ? "1px solid var(--rule-soft)"
                        : undefined,
                    ["--reveal-delay" as string]: `${i * 0.09}s`,
                  }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{
                      aspectRatio: "16 / 10",
                      background: "oklch(0.13 0.04 265)",
                    }}
                  >
                    <Image
                      src={mech.src}
                      alt={mech.alt}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="reveal-img object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="reveal-wash pointer-events-none absolute inset-0"
                      style={{
                        background: "var(--accent)",
                        mixBlendMode: "overlay",
                      }}
                    />
                  </div>
                  <figcaption className="px-[22px] pb-6 pt-[18px]">
                    <div
                      className="mono mb-2"
                      style={{
                        fontSize: "var(--text-micro)",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                      }}
                    >
                      {mech.kicker}
                    </div>
                    <div
                      className="display mb-[7px]"
                      style={{
                        fontSize: "var(--text-title)",
                        lineHeight: 1.08,
                      }}
                    >
                      {mech.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "var(--text-ui)",
                        lineHeight: 1.55,
                        color: "var(--tx3)",
                      }}
                    >
                      {mech.blurb}
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
