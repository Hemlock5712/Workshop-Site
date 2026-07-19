import Link from "next/link";
import Image from "next/image";

/**
 * Workshop landing. Rebuilt on the "engineering instrument panel"
 * aesthetic — serif hero, mono micro-labels, workshop banners with the
 * primary/accent corner chips, mechanism cards with color-stripe
 * mapping (per design: arm=red, flywheel=green, swerve=blue,
 * vision=magenta), sponsors grid with the team list panel below.
 *
 * Real imagery, links, and team data are preserved from the previous
 * landing — only the visual structure changes.
 */

interface MechanismCardProps {
  tag: string;
  title: string;
  description: string;
  /** OKLCH color string for the bottom image-stripe + bullet markers. */
  color: string;
  image: { src: string; alt: string };
  items: string[];
}

function MechanismCard({
  tag,
  title,
  description,
  color,
  image,
  items,
}: MechanismCardProps) {
  return (
    <article
      className="flex flex-col overflow-hidden rounded-md"
      style={{
        background: "var(--bg-elev)",
        border: "1px solid var(--line)",
      }}
    >
      {/* Image slot — real photo with mechanism-coloured bottom stripe */}
      <div
        className="relative"
        style={{
          aspectRatio: "16/9",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(min-width: 900px) 50vw, 100vw"
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: color,
          }}
        />
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-5 pt-4">
        <div
          className="font-mono"
          style={{
            fontSize: 10.5,
            color,
            letterSpacing: "0.08em",
            fontWeight: 500,
          }}
        >
          {tag}
        </div>
        <h3
          className="text-lg font-semibold leading-tight"
          style={{ letterSpacing: "-0.01em" }}
        >
          {title}
        </h3>
        <p
          className="text-[13.5px] leading-relaxed"
          style={{ color: "var(--fg-mute)", margin: 0 }}
        >
          {description}
        </p>
        <ul
          className="m-0 flex list-none flex-col gap-1 p-0"
          style={{ marginTop: 4 }}
        >
          {items.map((item) => (
            <li
              key={item}
              className="flex items-baseline gap-2 text-xs"
              style={{ color: "var(--fg-mute)" }}
            >
              <span style={{ color }}>→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

interface WorkshopBannerProps {
  number: string;
  description: string;
  tone: "primary" | "accent";
}

function WorkshopBanner({ number, description, tone }: WorkshopBannerProps) {
  const stripe = tone === "primary" ? "var(--primary-lifted)" : "var(--accent)";
  const bg = tone === "primary" ? "var(--primary-soft)" : "var(--accent-soft)";
  return (
    <div className="mb-3.5 flex items-center gap-3.5">
      <span
        className="font-mono"
        style={{
          fontSize: 11,
          padding: "4px 10px",
          background: bg,
          border: `1px solid ${stripe}`,
          color: stripe,
          borderRadius: 3,
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        WORKSHOP {number}
      </span>
      <span className="text-[13.5px]" style={{ color: "var(--fg-mute)" }}>
        {description}
      </span>
      <span
        aria-hidden
        className="flex-1"
        style={{ height: 1, background: "var(--line-soft)" }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-8 md:px-12 md:pb-32">
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section
        className="grid-bg relative px-0 py-14 md:py-16"
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="max-w-[820px]">
          {/* Brand logo + name */}
          <div className="mb-7 flex items-center gap-5">
            <Image
              src="/images/gray-matter-logo.jpg"
              alt="Gray Matter Coding logo"
              width={112}
              height={112}
              quality={95}
              className="shrink-0 rounded-lg"
              priority
              style={{
                border: "1px solid var(--line)",
                background: "var(--bg-elev)",
              }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <div className="text-xl font-semibold tracking-tight">
                Gray Matter Coding Workshop
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: "var(--fg-dim)",
                  letterSpacing: "0.08em",
                  marginTop: 2,
                }}
              >
                BY HEMLOCK 5712 · FRC PROGRAMMING CURRICULUM
              </div>
            </div>
          </div>

          <h1
            className="mb-5 font-semibold"
            style={{
              fontSize: "clamp(38px, 5vw, 60px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-serif)",
              textWrap: "balance",
            }}
          >
            FRC programming,
            <br />
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>
              taught hands-on.
            </span>
          </h1>

          <p
            className="mb-7 max-w-[640px] text-lg leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            A curriculum covering command-based architecture, PID and motion
            profiling, swerve drive, vision, and logging. Built around a
            companion GitHub repository so every concept maps to real, runnable
            code.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/introduction"
              className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold no-underline transition"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                border: "1px solid var(--accent)",
              }}
            >
              Start Learning
              <span aria-hidden style={{ marginLeft: 2 }}>
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── MECHANISMS ─────────────────────────────────────────────── */}
      <section id="mechanisms" className="mb-16 mt-14">
        <div className="mb-7">
          <div className="micro">WHAT YOU&rsquo;LL PROGRAM</div>
          <h2
            className="font-semibold"
            style={{
              fontSize: 30,
              letterSpacing: "-0.01em",
              marginTop: 8,
              fontFamily: "var(--font-serif)",
            }}
          >
            Four mechanisms. Two workshops.
          </h2>
        </div>

        <WorkshopBanner
          number="01"
          description="Control fundamentals: single-motor mechanisms"
          tone="primary"
        />
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <MechanismCard
            tag="ARM · POSITION CONTROL"
            title="Robot Arm"
            color="oklch(0.78 0.16 25)"
            description="Move a single-jointed arm to specific angles using closed-loop position control with gravity compensation."
            image={{ src: "/images/mechanisms/arm.png", alt: "Robot Arm" }}
            items={[
              "TalonFX + integrated encoder",
              "PID with gravity feedforward (kG)",
              "Motion Magic for smooth profiling",
            ]}
          />
          <MechanismCard
            tag="FLYWHEEL · VELOCITY CONTROL"
            title="Shooter Flywheel"
            color="oklch(0.78 0.16 145)"
            description="Hold a target RPM precisely for consistent shooting, using velocity PID + velocity feedforward."
            image={{
              src: "/images/mechanisms/flywheel.png",
              alt: "Flywheel Shooter",
            }}
            items={[
              "Dual TalonFX, no encoder slip",
              "Velocity PID with kV feedforward",
              "Spin-up & at-speed detection",
            ]}
          />
        </div>

        <WorkshopBanner
          number="02"
          description="Drive & perception: full-robot autonomy"
          tone="accent"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <MechanismCard
            tag="SWERVE · HOLONOMIC DRIVE"
            title="CTR Swerve Drive"
            color="oklch(0.78 0.14 235)"
            description="Holonomic drive with field-oriented control, real-time odometry, and trajectory following."
            image={{
              src: "/images/mechanisms/swerve.png",
              alt: "CTR Swerve Drive",
            }}
            items={[
              "8 TalonFX motors + 4 CANcoders",
              "DriveToPose / LinearPath path following",
              "Pigeon 2 IMU for heading fusion",
            ]}
          />
          <MechanismCard
            tag="LIMELIGHT · VISION"
            title="AprilTag Vision"
            color="oklch(0.72 0.2 320)"
            description="Detect AprilTags, fuse vision pose with odometry, and drive autonomously to scoring positions."
            image={{
              src: "/images/mechanisms/limelight.png",
              alt: "Limelight Vision System",
            }}
            items={[
              "Limelight 4 with MegaTag2",
              "Pose estimator with vision standard deviations",
              "Drive-to-point autonomous routine",
            ]}
          />
        </div>
      </section>

      {/* ── SPONSORS ───────────────────────────────────────────────── */}
      <section className="mb-8 mt-16">
        <div
          className="micro mb-6 text-center"
          style={{ color: "var(--fg-mute)" }}
        >
          POWERED BY
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              full: "CTR Electronics",
              short: "Phoenix 6 motor controllers, CANivore",
              href: "https://store.ctr-electronics.com/",
              logo: "/images/sponsors/ctre-logo.jpg",
            },
            {
              full: "MichAuto",
              short: "Michigan automotive industry",
              href: "https://michauto.org/",
              logo: "/images/sponsors/MichAuto Logo 600x600.png",
            },
            {
              full: "Office of Future Mobility & Electrification",
              short: "State of Michigan",
              href: "https://www.michiganbusiness.org/ofme/",
              logo: "/images/sponsors/OFME-Logo.png",
            },
            {
              full: "Lockwood STEM Center",
              short: "Hemlock Public Schools",
              href: "https://lockwoodstemcenter.hemlockps.com/home",
              logo: "/images/sponsors/lockwood-stem-center-logo.png",
            },
          ].map((s) => (
            <a
              key={s.full}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-sm p-4 no-underline transition-colors"
              style={{
                border: "1px solid var(--line)",
                background: "var(--bg-elev)",
                color: "var(--fg)",
              }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  height: 96,
                  background: "var(--bg)",
                  border: "1px solid var(--line-soft)",
                  borderRadius: 3,
                }}
              >
                <Image
                  src={s.logo}
                  alt={s.full}
                  width={180}
                  height={80}
                  className="max-h-[80px] w-auto object-contain grayscale opacity-80 transition duration-200 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>
              <div>
                <div
                  className="text-[13.5px] font-semibold"
                  style={{
                    lineHeight: 1.25,
                    textWrap: "balance",
                  }}
                >
                  {s.full}
                </div>
                <div
                  className="text-[11.5px]"
                  style={{
                    color: "var(--fg-mute)",
                    marginTop: 4,
                    lineHeight: 1.4,
                  }}
                >
                  {s.short}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── WORKSHOP TEAM ──────────────────────────────────────────── */}
      <section className="mb-4">
        <div
          className="grid gap-6 rounded-sm p-6 md:grid-cols-2"
          style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
          }}
        >
          <div>
            <div className="micro mb-2.5">TEAM 5712 · HEMLOCK</div>
            <div
              className="text-sm"
              style={{ color: "var(--fg)", lineHeight: 1.65 }}
            >
              Joe Lockwood
              <br />
              Josh Bacon
              <br />
              Chris Bale
              <br />
              Alex Haltom
            </div>
          </div>
          <div>
            <div className="micro mb-2.5">TEAM 5216</div>
            <div
              className="text-sm"
              style={{ color: "var(--fg)", lineHeight: 1.65 }}
            >
              Ethan Shannon
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
