import { BUILD_YEAR } from "@/lib/buildInfo";
import Link from "next/link";
import Image from "next/image";
import MechanismStrip from "@/components/home/MechanismStrip";
import { getLessonGroups, getSidebarLabel, LESSON_COUNT } from "@/data/lessons";

/**
 * Workshop landing.
 *
 * Three claims, in order: what this is, what order to read it in, and what you
 * end up having built. The syllabus is the centre of the page rather than a
 * link at the bottom — the hardest thing about a long course is believing
 * it has a shape, and the fastest way to show that is to show the shape.
 *
 * No hero image, no feature cards. The only photography is the four real
 * mechanisms, and it is full-bleed because those photos are the pitch.
 */

const SPONSORS = [
  {
    name: "CTR Electronics",
    href: "https://store.ctr-electronics.com/",
    logo: "/images/sponsors/ctre-logo.jpg",
  },
  {
    name: "MichAuto",
    href: "https://michauto.org/",
    logo: "/images/sponsors/MichAuto Logo 600x600.png",
  },
  {
    name: "Office of Future Mobility and Electrification",
    href: "https://www.michiganbusiness.org/ofme/",
    logo: "/images/sponsors/OFME-Logo.png",
  },
  {
    name: "Lockwood STEM Center",
    href: "https://lockwoodstemcenter.hemlockps.com/home",
    logo: "/images/sponsors/lockwood-stem-center-logo.png",
  },
] as const;

export default function Home() {
  const groups = getLessonGroups();
  const firstLesson = groups[0]?.lessons[0];

  return (
    <div>
      {/* ── Masthead + statement ──────────────────────────────────── */}
      <section
        className="px-6 pt-11 md:px-12 lg:px-[76px]"
        style={{ borderBottom: "1px solid var(--rule)" }}
      >
        <div
          className="flex items-center gap-3.5 pb-[22px]"
          style={{ borderBottom: "1px solid var(--rule-soft)" }}
        >
          <Image
            src="/images/gray-matter-logo.jpg"
            alt="Gray Matter Coding"
            width={42}
            height={42}
            quality={95}
            priority
            className="h-[42px] w-[42px] shrink-0 rounded-[9px]"
          />
          <div style={{ lineHeight: 1.25 }}>
            <div
              className="text-ui font-semibold"
              style={{ letterSpacing: "-0.005em", color: "var(--tx)" }}
            >
              Gray Matter Coding Workshop
            </div>
            <div
              className="mono mt-[3px]"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              FRC 5712 · Hemlock, Michigan
            </div>
          </div>
          <span
            aria-hidden="true"
            className="h-px min-w-5 flex-1"
            style={{ background: "var(--rule-soft)" }}
          />
          <span className="micro hidden whitespace-nowrap sm:inline">
            WPILib 2027 · Commands v3
          </span>
        </div>

        {/* The headline is the name of the thing, not a pitch for it. It read
            "Programming a robot, taught the way it's actually learned" and
            said nothing a student could use: not who runs the workshop, not
            what it covers, not whether they are in the right place. A person
            who lands here already wants to program a robot. Tell them whose
            course this is and get out of the way. */}
        <h1
          className="display mt-14 max-w-[1180px]"
          style={{
            fontSize: "clamp(44px, 8.2vw, 124px)",
            lineHeight: 0.9,
            letterSpacing: "-0.035em",
            textWrap: "balance",
          }}
        >
          FRC Team 5712
          <br />
          Coding Workshops
        </h1>

        <p
          className="mt-[52px] max-w-[640px]"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-lede)",
            lineHeight: 1.62,
            color: "var(--tx2)",
          }}
        >
          {LESSON_COUNT} lessons on programming an FRC robot, from spinning a
          motor in Tuner X to a swerve drive that finds itself with a camera.
          Every lesson runs on real hardware.
        </p>

        <div className="mt-[34px] flex flex-wrap items-center gap-[22px] pb-16">
          {firstLesson && (
            <Link
              href={firstLesson.slug}
              className="inline-flex items-center gap-2.5 whitespace-nowrap px-[26px] py-[15px] text-note font-semibold transition-opacity hover:opacity-90"
              style={{
                borderRadius: 2,
                background: "var(--accent)",
                color: "var(--accent-ink)",
              }}
            >
              Start with Lesson {firstLesson.num}
              <span aria-hidden="true">→</span>
            </Link>
          )}
          <a
            href="#syllabus"
            className="mono whitespace-nowrap pb-[3px] transition-colors hover:text-[var(--accent)]"
            style={{
              fontSize: "var(--text-meta)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--tx2)",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            See the syllabus
          </a>
        </div>
      </section>

      {/* What you'll program comes before the syllabus on purpose: four
          photographs answer "what do I get out of this?" faster than a long
          lesson titles, and they give the syllabus something to be a plan
          *for*. */}
      <MechanismStrip />

      {/* ── Syllabus ──────────────────────────────────────────────── */}
      <section
        id="syllabus"
        className="scroll-mt-16 px-6 pb-10 pt-[88px] md:px-12 lg:px-[76px]"
      >
        <div
          className="mb-11 flex flex-col items-start justify-between gap-6 pb-[18px] lg:flex-row lg:items-end lg:gap-10"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <h2
            className="display m-0"
            style={{
              fontSize: "clamp(34px, 4vw, 52px)",
              lineHeight: 1,
              letterSpacing: "-0.015em",
            }}
          >
            The syllabus
          </h2>
          <p
            className="m-0 max-w-[400px]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-aside)",
              lineHeight: 1.6,
              color: "var(--tx3)",
            }}
          >
            Read it in order. Each lesson leaves the code in a state the next
            one starts from.
          </p>
        </div>

        {groups.map((group) => (
          <div
            key={group.id}
            className="grid gap-x-9 gap-y-[18px] py-[26px] lg:grid-cols-[110px_minmax(0,300px)_1fr] lg:items-start"
            style={{ borderBottom: "1px solid var(--rule-soft)" }}
          >
            <div
              className="mono pt-1.5"
              style={{
                fontSize: "var(--text-meta)",
                letterSpacing: "0.12em",
                color: "var(--accent)",
              }}
            >
              {group.num}
            </div>
            <div>
              <div
                className="display mb-1.5"
                style={{ fontSize: 29, lineHeight: 1.1 }}
              >
                {group.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-ui)",
                  lineHeight: 1.55,
                  color: "var(--tx3)",
                }}
              >
                {group.blurb}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-[7px] gap-y-[7px] pt-[5px]">
              {group.lessons.map((lesson) => (
                <Link
                  key={lesson.slug}
                  href={lesson.slug}
                  className="whitespace-nowrap rounded-full px-3 py-[5px] text-meta transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{
                    border: "1px solid var(--rule)",
                    color: "var(--tx3)",
                  }}
                >
                  {getSidebarLabel(lesson)}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <p
          className="mono pt-5"
          style={{
            fontSize: "var(--text-micro)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--tx3)",
          }}
        >
          {LESSON_COUNT} lessons · five workshops · one code repository
        </p>
      </section>

      {/* The syllabus ends on a wall of 29 lesson names, which is the point at
          which a reader has decided to start and has to scroll back up to do
          it. Repeat the hero's call to action here so the decision and the
          link are in the same place. */}
      {firstLesson && (
        <section className="px-6 pt-12 md:px-12 lg:px-[76px]">
          <Link
            href={firstLesson.slug}
            className="inline-flex items-center gap-2.5 whitespace-nowrap px-[26px] py-[15px] text-note font-semibold transition-opacity hover:opacity-90"
            style={{
              borderRadius: 2,
              background: "var(--accent)",
              color: "var(--accent-ink)",
            }}
          >
            Get started
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

      {/* ── Sponsors ──────────────────────────────────────────────── */}
      <section className="px-6 pt-14 md:px-12 lg:px-[76px]">
        <div
          className="pb-10"
          style={{ borderBottom: "1px solid var(--rule-soft)" }}
        >
          <div className="micro mb-[26px]">Powered by</div>
          <div className="grid grid-cols-2 items-center gap-5 lg:grid-cols-4">
            {SPONSORS.map((sponsor) => (
              <a
                key={sponsor.name}
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                title={sponsor.name}
                className="group flex h-28 items-center justify-center px-6 py-[18px] transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg3)]"
                style={{
                  border: "1px solid var(--rule-soft)",
                  borderRadius: 3,
                  background: "var(--bg2)",
                }}
              >
                {/* `style` height/width auto alongside the CSS max-height:
                    next/image warns when one dimension is constrained by CSS
                    and the other isn't, because the aspect ratio silently
                    distorts. The logos are all different shapes. */}
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={180}
                  height={72}
                  style={{ width: "auto", height: "auto" }}
                  className="max-h-[72px] max-w-full object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Colophon ──────────────────────────────────────────────── */}
      <footer className="grid grid-cols-1 items-start gap-10 px-6 pb-16 pt-11 sm:grid-cols-3 md:px-12 lg:px-[76px]">
        <div>
          <div className="micro mb-2.5">Written by</div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-aside)",
              lineHeight: 1.7,
              color: "var(--tx2)",
            }}
          >
            Joe Lockwood · Josh Bacon
            <br />
            Chris Bale · Alex Haltom
            <br />
            <span style={{ color: "var(--tx3)" }}>Team 5712, Hemlock</span>
          </div>
        </div>
        <div>
          <div className="micro mb-2.5">With</div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-aside)",
              lineHeight: 1.7,
              color: "var(--tx2)",
            }}
          >
            Ethan Shannon
            <br />
            <span style={{ color: "var(--tx3)" }}>Team 5216</span>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="micro mb-2.5">frc5712.com</div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-aside)",
              lineHeight: 1.7,
              color: "var(--tx3)",
            }}
          >
            © {BUILD_YEAR} Hemlock&rsquo;s Gray Matter
            <br />
            <Link href="/privacy" style={{ color: "var(--accent)" }}>
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
