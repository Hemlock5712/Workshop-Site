import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">
      {/* Hero Section */}
      <div className="text-center flex flex-col gap-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
          Hemlock&apos;s Gray Matter - Team 5712 - Coding Workshop
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Learn FRC&apos;s best programming practices to build a robot good
          enough to win events. Master code architecture, subsystems, PID
          tuning, libraries, and more!
        </p>
      </div>

      {/* Workshop Overview */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Target Audience
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            This workshop is designed for FRC Teams using Java and CTRE
            Hardware.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
            What You&apos;ll Learn
          </h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-left max-w-md mx-auto">
            <li>• Code architecture and best practices</li>
            <li>• Subsystems structure and organization</li>
            <li>• PID tuning techniques</li>
            <li>• Libraries and framework usage</li>
            <li>• Hardware integration</li>
          </ul>
        </div>
        <div className="flex gap-4 justify-center flex-wrap mt-6">
          <Link
            href="/introduction"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Start Workshop
          </Link>
          <Link
            href="/prerequisites"
            className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Prerequisites
          </Link>
        </div>
      </div>

      {/* Mechanisms Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 text-center">
          Mechanisms We&apos;ll Program
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="mb-4">
              <Image
                src="/images/mechanisms/arm.jpg"
                alt="Robot Arm Mechanism"
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Robot Arm
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Learn to program a robot arm with precise positioning control.
              Master PID tuning, encoder feedback, and motion profiling to achieve smooth,
              accurate movements for game piece manipulation.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="mb-4">
              <Image
                src="/images/mechanisms/flywheel.png"
                alt="Flywheel Mechanism"
                width={400}
                height={300}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Flywheel Shooter
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              Program a high-speed flywheel shooter system for consistent game piece
              launching. Explore velocity control, feedforward calculations, and
              real-time adjustments for accuracy across varying distances.
            </p>
          </div>
        </div>
      </div>

      {/* Sponsors Section */}
      <div className="bg-[var(--card)] text-[var(--foreground)] p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
          Sponsors
        </h2>
        <div className="text-center space-y-6">
          <p className="text-xl text-slate-700 dark:text-slate-300 font-semibold">
            Special thanks to:
          </p>
          
          <div className="space-y-4">
            <p className="text-lg text-slate-600 dark:text-slate-300">
              <span className="font-semibold">CTR Electronics</span> - our Co-sponsors
            </p>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                The Team:
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Joe Lockwood, Josh Bacon, Chris Bale, Alex Haltom of team 5712
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Ethan Shannon and team 5216
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-slate-600 dark:text-slate-300">
                The Lockwood STEM Center
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                MichAuto and the Office of Future Mobility and Electrification for funding High Tech Talent Workshops
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
