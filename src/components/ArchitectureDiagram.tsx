"use client";

import {
  Gamepad2,
  Zap,
  Cog,
  Settings,
  Map,
  BookOpen,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

interface ArchitectureDiagramProps {
  variant?: "simple" | "detailed";
}

export default function ArchitectureDiagram({
  variant = "simple",
}: ArchitectureDiagramProps) {
  if (variant === "simple") {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center flex items-center justify-center gap-2">
          <Map className="w-6 h-6" />
          How Command-Based Programming Works
        </h3>

        {/* Simple Flow Diagram */}
        <div className="flex flex-col gap-4">
          {/* Row 1: Input */}
          <div className="flex items-center justify-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Gamepad2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                Triggers
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Controller buttons, sensors, or custom conditions
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-500 mt-2 italic">
                &quot;While button A is held...&quot;
              </p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="w-8 h-8 text-slate-400" strokeWidth={3} />
          </div>

          {/* Row 2: Commands */}
          <div className="flex items-center justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-1">
                Commands
              </h4>
              <p className="text-sm text-green-800 dark:text-green-400">
                Actions the robot performs — most are holds
              </p>
              <p className="text-xs text-green-700 dark:text-green-500 mt-2 italic">
                &quot;...run the &apos;scoring (hold)&apos; command&quot;
              </p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="w-8 h-8 text-slate-400" strokeWidth={3} />
          </div>

          {/* Row 3: Subsystems */}
          <div className="flex items-center justify-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Cog className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-1">
                Mechanisms
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-400">
                One class per physical thing (arm, flywheel, etc.)
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-500 mt-2 italic">
                &quot;...which controls the Arm mechanism&apos;s motor&quot;
              </p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="w-8 h-8 text-slate-400" strokeWidth={3} />
          </div>

          {/* Row 4: Hardware */}
          <div className="flex items-center justify-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500 rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Settings className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-1">
                Motors & Sensors
              </h4>
              <p className="text-sm text-orange-800 dark:text-orange-400">
                Physical robot hardware
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-500 mt-2 italic">
                &quot;...to physically move the arm up&quot;
              </p>
            </div>
          </div>

          {/* Feedback Arrow */}
          <div className="flex items-center justify-center mt-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-dashed border-slate-400 dark:border-slate-600 max-w-xs text-center">
              <div className="flex justify-center mb-2">
                <ArrowUp className="w-6 h-6 text-slate-400" strokeWidth={2} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Sensors provide feedback:</strong> Position, velocity,
                and status information flows back up to help Commands make
                decisions
              </p>
            </div>
          </div>
        </div>

        {/* Real Example */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-l-4 border-blue-500">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Real Example: Raising an Arm
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <p>
              1. <strong>Trigger:</strong> Driver holds button A (
              <code>whileTrue</code>)
            </p>
            <p>
              2. <strong>Command:</strong> the arm&apos;s &quot;scoring
              (hold)&quot; command starts running
            </p>
            <p>
              3. <strong>Mechanism:</strong> the Arm re-sends the scoring target
              every tick — the arm reaches it and <em>stays</em> there
            </p>
            <p>
              4. <strong>Hardware:</strong> Motor holds the angle, encoder
              measures position
            </p>
            <p>
              5. <strong>Release A:</strong> the hold is cancelled and the
              arm&apos;s default command takes back over
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant with more technical information
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center flex items-center justify-center gap-2">
        <Map className="w-6 h-6" />
        Command-Based Architecture (Detailed)
      </h3>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Column 1: Triggers */}
        <div className="flex flex-col gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
            <div className="flex justify-center mb-2">
              <Gamepad2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-center">
              Triggers
            </h4>
            <div className="text-xs text-blue-800 dark:text-blue-400 space-y-2">
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>Button Triggers:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  controller.a().whileTrue(...)
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>Sensor Triggers:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  new Trigger(() → sensor.get())
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>State Triggers:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Based on robot state
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Commands */}
        <div className="flex flex-col gap-4">
          <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-4">
            <div className="flex justify-center mb-2">
              <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-green-900 dark:text-green-300 mb-2 text-center">
              Commands
            </h4>
            <div className="text-xs text-green-800 dark:text-green-400 space-y-2">
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>Lifecycle:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  initialize() → execute() → isFinished() → end()
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>Requirements:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Declares needed subsystems
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>Scheduling:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Command scheduler manages execution
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Subsystems */}
        <div className="flex flex-col gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 rounded-lg p-4">
            <div className="flex justify-center mb-2">
              <Cog className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2 text-center">
              Subsystems
            </h4>
            <div className="text-xs text-purple-800 dark:text-purple-400 space-y-2">
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>Hardware:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Motors, sensors, pneumatics
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>State:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Current position, velocity, etc.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2 rounded">
                <strong>Methods:</strong>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Control and query functions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow */}
      <div className="mt-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 text-center flex items-center justify-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Information Flow
        </h4>
        <div className="flex items-center justify-between text-xs">
          <div className="text-center">
            <p className="font-bold text-blue-600 dark:text-blue-400">
              User Input
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Controller/Sensors
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-400" />
          <div className="text-center">
            <p className="font-bold text-green-600 dark:text-green-400">
              Commands
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Coordinate Actions
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-400" />
          <div className="text-center">
            <p className="font-bold text-purple-600 dark:text-purple-400">
              Subsystems
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Control Hardware
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-400" />
          <div className="text-center">
            <p className="font-bold text-orange-600 dark:text-orange-400">
              Physical Action
            </p>
            <p className="text-slate-600 dark:text-slate-400">Robot Moves</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border-l-4 border-green-500">
          <h5 className="font-bold text-green-900 dark:text-green-300 mb-2 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Benefits
          </h5>
          <ul className="text-xs text-green-800 dark:text-green-400 space-y-1">
            <li>• Clear separation of concerns</li>
            <li>• Easy to test individual pieces</li>
            <li>• Prevents conflicting commands</li>
            <li>• Organized, maintainable code</li>
          </ul>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border-l-4 border-blue-500">
          <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Key Principle
          </h5>
          <p className="text-xs text-blue-800 dark:text-blue-400">
            Each piece has one job: Triggers detect input, Commands coordinate
            actions, Subsystems control hardware. This separation makes complex
            robots manageable!
          </p>
        </div>
      </div>
    </div>
  );
}
