import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-8">
      {/* Hero Section */}
      <div className="text-center flex flex-col gap-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 text-center">
          <div>Hemlock&apos;s Gray Matter - Team 5712</div>
          <div>Coding Workshop</div>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Learn FRC&apos;s best programming practices to build a robot good
          enough to win events. Master code architecture, subsystems, PID
          tuning, libraries, and more!
        </p>
      </div>

      {/* Get Started Section */}
      <div className="max-w-lg mx-auto text-center">
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
          Ready to build competition-winning robot code?
        </p>
        <Link
          href="/introduction"
          className="inline-block bg-primary-600 text-white px-12 py-5 rounded-xl text-2xl font-bold hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Start Workshop
        </Link>
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

      {/* Special Thanks Section */}
      <div className="bg-[var(--card)] text-[var(--foreground)] p-8 rounded-lg">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">
          Special thanks to:
        </h2>
        <div className="text-center space-y-6">
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center">
              <a 
                href="https://store.ctr-electronics.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-48 h-32 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <Image
                  src="/images/sponsers/ctre-logo.jpg"
                  alt="CTR Electronics Logo"
                  width={220}
                  height={120}
                  className="max-w-full max-h-full object-contain"
                />
              </a>
              <a 
                href="https://michauto.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-48 h-32 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <Image
                  src="/images/sponsers/MichAuto Logo 600x600.png"
                  alt="MichAuto Logo"
                  width={220}
                  height={120}
                  className="max-w-full max-h-full object-contain"
                />
              </a>
              <a 
                href="https://www.michiganbusiness.org/ofme/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-48 h-32 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <Image
                  src="/images/sponsers/OFME-Logo.png"
                  alt="Michigan Office of Future Mobility and Electrification Logo"
                  width={220}
                  height={120}
                  className="max-w-full max-h-full object-contain"
                />
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                The Team:
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Joe Lockwood, Josh Bacon, Chris Bale, Alex Haltom, and Team 5712
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Ethan Shannon and Team 5216
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
