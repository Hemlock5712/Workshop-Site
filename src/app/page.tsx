import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden selection:bg-primary-200 selection:text-primary-900">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col gap-24 md:gap-32">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-8 md:gap-10 animate-fade-in-up">
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary-800 to-primary-500 dark:from-primary-200 dark:to-primary-500">
                Hemlock&apos;s Gray Matter Coding Workshops
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Master the art of robot code. Build competition-winning robots with industry-standard architecture,
              advanced PID control, and motion profiling.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/introduction"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary-600 px-8 font-medium text-white transition-all duration-300 hover:bg-primary-700 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            >
              <span className="mr-2">Start Learning</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <a
              href="https://github.com/Hemlock5712/Workshop-Code"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 font-medium text-slate-700 dark:text-slate-200 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">
              What We&apos;re Building
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Master universal programming concepts through two fundamental FRC mechanisms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Card 1 */}
            <div className="group relative bg-white dark:bg-slate-800/50 rounded-3xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 hover:border-primary-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image
                  src="/images/mechanisms/arm.png"
                  alt="Robot Arm"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Arm Position Control</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Program precise arm positioning using PID control, encoder feedback, and Motion Magic for smooth, controlled movements.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white dark:bg-slate-800/50 rounded-3xl p-2 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 hover:border-green-500/20 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                <Image
                  src="/images/mechanisms/flywheel.png"
                  alt="Flywheel Shooter"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Flywheel Velocity Control</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Master velocity control for consistent shooting performance using feedforward control and velocity PID.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-16 md:pt-24">
          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-12">
            Powered by Industry Leaders
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center opacity-75 hover:opacity-100 transition-opacity duration-500">
            {[
              { href: "https://store.ctr-electronics.com/", src: "/images/sponsors/ctre-logo.jpg", alt: "CTR Electronics" },
              { href: "https://michauto.org/", src: "/images/sponsors/MichAuto Logo 600x600.png", alt: "MichAuto" },
              { href: "https://www.michiganbusiness.org/ofme/", src: "/images/sponsors/OFME-Logo.png", alt: "OFME" },
              { href: "https://lockwoodstemcenter.hemlockps.com/home", src: "/images/sponsors/lockwood-stem-center-logo.png", alt: "Lockwood STEM Center" },
            ].map((sponsor) => (
              <a
                key={sponsor.alt}
                href={sponsor.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full max-w-[180px] aspect-[3/2] flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={sponsor.src}
                  alt={sponsor.alt}
                  fill
                  className="object-contain"
                />
              </a>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Workshop Team
              </h3>
              <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400">
                <p>Joe Lockwood, Josh Bacon, Chris Bale, Alex Haltom (Team 5712)</p>
                <p>Ethan Shannon (Team 5216)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

