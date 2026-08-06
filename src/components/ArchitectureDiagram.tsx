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
      <div className="module">
        <h3 className="text-lede font-bold text-[var(--tx)] mb-6 text-center flex items-center justify-center gap-2">
          <Map className="w-6 h-6" />
          How Command-Based Programming Works
        </h3>

        {/* Simple Flow Diagram */}
        <div className="flex flex-col gap-4">
          {/* Row 1: Input */}
          <div className="flex items-center justify-center">
            <div className="bg-[var(--bg2)] border-2 border-[var(--accent)] rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Gamepad2 className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h4 className="font-bold text-[var(--accent)] mb-1">Triggers</h4>
              <p className="text-note text-[var(--tx2)]">
                Controller buttons, sensors, or custom conditions
              </p>
              {/* Every quoted aside in this diagram is a JS string rather than
                  JSX text carrying `&quot;` / `&apos;`, and it has to stay that
                  way. As entities they hydrated with an error on every load of
                  /command-framework: the server compile emitted each string
                  with trailing spaces the browser compile did not — seven on
                  one line, twelve on another — so React discarded the subtree
                  and re-rendered it on the client. No source line has trailing
                  whitespace; the padding appears during compilation, where
                  decoding an entity shortens the text but the JSX whitespace
                  trim still measures the undecoded offsets. The count tracks
                  the entities on the line, which is why each one differed.
                  Quoting sidesteps the decode, and keeps bare quotes out of
                  JSX text where `react/no-unescaped-entities` wants them gone. */}
              <p className="text-meta text-[var(--tx2)] mt-2 italic">
                {'"When the left trigger is squeezed..."'}
              </p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="w-8 h-8 text-[var(--tx3)]" strokeWidth={3} />
          </div>

          {/* Row 2: Commands */}
          <div className="flex items-center justify-center">
            <div className="bg-[var(--bg2)] border-2 border-[var(--ok)] rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Zap className="w-8 h-8 text-[var(--ok)]" />
              </div>
              <h4 className="font-bold text-[var(--ok)] mb-1">Commands</h4>
              <p className="text-note text-[var(--ok)]">
                Actions the robot performs — most are holds
              </p>
              <p className="text-meta text-[var(--ok)] mt-2 italic">
                {"\"...run the 'runFast (hold)' command\""}
              </p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="w-8 h-8 text-[var(--tx3)]" strokeWidth={3} />
          </div>

          {/* Row 3: Subsystems */}
          <div className="flex items-center justify-center">
            <div className="bg-[var(--bg2)] border-2 border-[var(--accent)] rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Cog className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h4 className="font-bold text-[var(--accent)] mb-1">
                Mechanisms
              </h4>
              <p className="text-note text-[var(--tx2)]">
                One class per physical thing (arm, flywheel, etc.)
              </p>
              <p className="text-meta text-[var(--tx2)] mt-2 italic">
                {'"...which controls the Arm mechanism\'s motor"'}
              </p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <ArrowDown className="w-8 h-8 text-[var(--tx3)]" strokeWidth={3} />
          </div>

          {/* Row 4: Hardware */}
          <div className="flex items-center justify-center">
            <div className="bg-[var(--bg2)] border-2 border-[var(--accent)] rounded-lg p-4 text-center max-w-xs">
              <div className="flex justify-center mb-2">
                <Settings className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h4 className="font-bold text-[var(--accent)] mb-1">
                Motors & Sensors
              </h4>
              <p className="text-note text-[var(--tx2)]">
                Physical robot hardware
              </p>
              <p className="text-meta text-[var(--tx2)] mt-2 italic">
                {'"...to physically move the arm up"'}
              </p>
            </div>
          </div>

          {/* Feedback Arrow */}
          <div className="flex items-center justify-center mt-4">
            <div className="bg-[var(--bg2)] rounded-lg p-3 border border-dashed border-[var(--rule)] max-w-xs text-center">
              <div className="flex justify-center mb-2">
                <ArrowUp
                  className="w-6 h-6 text-[var(--tx3)]"
                  strokeWidth={2}
                />
              </div>
              <p className="text-meta text-[var(--tx2)]">
                <strong>Sensors provide feedback:</strong> Position, velocity,
                and status information flows back up to help Commands make
                decisions
              </p>
            </div>
          </div>
        </div>

        {/* Real Example */}
        {/* `p-pad`, and the left inset backed off by the 3px the accent bar
            adds over a 1px border — the same arithmetic as `Box`'s concept
            variant, so this heading lands on the panel text edge instead of
            two pixels off it. No background: it is `--bg2` inside a `--bg2`
            panel, so the fill never showed. */}
        <div
          className="mt-6 rounded-lg p-pad border-l-[3px] border-[var(--accent)]"
          style={{ paddingLeft: "calc(var(--spacing-pad) - 3px)" }}
        >
          <h4 className="font-bold text-[var(--accent)] mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Real Example: Raising an Arm
          </h4>
          <div className="text-note text-[var(--tx2)] space-y-1">
            <p>
              1. <strong>Trigger:</strong> the driver squeezes the left trigger
            </p>
            <p>
              2. <strong>Command:</strong> <code>arm.runFast()</code> — named{" "}
              {'"runFast (hold)"'} — starts, and takes ownership of the Arm
            </p>
            <p>
              3. <strong>Mechanism:</strong> the Arm re-sends its 6-volt request
              every tick, fifty times a second
            </p>
            <p>
              4. <strong>Hardware:</strong> the motor keeps pushing for as long
              as that command owns the arm
            </p>
            <p>
              5. <strong>Release:</strong> the binding starts{" "}
              <code>arm.stop()</code>, which takes the arm away from{" "}
              <code>runFast</code> — canceling on its own would not stop the
              motor
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant with more technical information
  return (
    <div className="module">
      <h3 className="text-lede font-bold text-[var(--tx)] mb-6 text-center flex items-center justify-center gap-2">
        <Map className="w-6 h-6" />
        Command-Based Architecture (Detailed)
      </h3>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Column 1: Triggers */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--bg2)] border-2 border-[var(--accent)] rounded-lg p-4">
            <div className="flex justify-center mb-2">
              <Gamepad2 className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <h4 className="font-bold text-[var(--accent)] mb-2 text-center">
              Triggers
            </h4>
            <div className="text-meta text-[var(--tx2)] space-y-2">
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>Button Triggers:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  controller.a().whileTrue(...)
                </p>
              </div>
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>Sensor Triggers:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  new Trigger(() → sensor.get())
                </p>
              </div>
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>State Triggers:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  Based on robot state
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Commands */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--bg2)] border-2 border-[var(--ok)] rounded-lg p-4">
            <div className="flex justify-center mb-2">
              <Zap className="w-8 h-8 text-[var(--ok)]" />
            </div>
            <h4 className="font-bold text-[var(--ok)] mb-2 text-center">
              Commands
            </h4>
            <div className="text-meta text-[var(--ok)] space-y-2">
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>Lifecycle:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  initialize() → execute() → isFinished() → end()
                </p>
              </div>
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>Requirements:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  Declares needed subsystems
                </p>
              </div>
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>Scheduling:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  Command scheduler manages execution
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Subsystems */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--bg2)] border-2 border-[var(--accent)] rounded-lg p-4">
            <div className="flex justify-center mb-2">
              <Cog className="w-8 h-8 text-[var(--accent)]" />
            </div>
            <h4 className="font-bold text-[var(--accent)] mb-2 text-center">
              Subsystems
            </h4>
            <div className="text-meta text-[var(--tx2)] space-y-2">
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>Hardware:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  Motors, sensors, pneumatics
                </p>
              </div>
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>State:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  Current position, velocity, etc.
                </p>
              </div>
              <div className="bg-[var(--bg2)] p-2 rounded">
                <strong>Methods:</strong>
                <p className="text-meta text-[var(--tx2)]">
                  Control and query functions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow */}
      <div className="mt-6 bg-[var(--bg2)] rounded-lg p-4">
        <h4 className="font-bold text-[var(--tx)] mb-3 text-center flex items-center justify-center gap-2">
          <ArrowRight className="w-5 h-5" />
          Information Flow
        </h4>
        <div className="flex items-center justify-between text-meta">
          <div className="text-center">
            <p className="font-bold text-[var(--accent)]">User Input</p>
            <p className="text-[var(--tx2)]">Controller/Sensors</p>
          </div>
          <ArrowRight className="w-6 h-6 text-[var(--tx3)]" />
          <div className="text-center">
            <p className="font-bold text-[var(--ok)]">Commands</p>
            <p className="text-[var(--tx2)]">Coordinate Actions</p>
          </div>
          <ArrowRight className="w-6 h-6 text-[var(--tx3)]" />
          <div className="text-center">
            <p className="font-bold text-[var(--accent)]">Subsystems</p>
            <p className="text-[var(--tx2)]">Control Hardware</p>
          </div>
          <ArrowRight className="w-6 h-6 text-[var(--tx3)]" />
          <div className="text-center">
            <p className="font-bold text-[var(--accent)]">Physical Action</p>
            <p className="text-[var(--tx2)]">Robot Moves</p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg2)] rounded-lg p-3 border-l-[3px] border-[var(--ok)]">
          <h5 className="font-bold text-[var(--ok)] mb-2 text-note flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Benefits
          </h5>
          <ul className="text-meta text-[var(--tx2)] space-y-1">
            <li>• Clear separation of concerns</li>
            <li>• Easy to test individual pieces</li>
            <li>• Prevents conflicting commands</li>
            <li>• Organized, maintainable code</li>
          </ul>
        </div>
        <div className="bg-[var(--bg2)] rounded-lg p-3 border-l-[3px] border-[var(--accent)]">
          <h5 className="font-bold text-[var(--accent)] mb-2 text-note flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Key Principle
          </h5>
          <p className="text-meta text-[var(--tx2)]">
            Each piece has one job: Triggers detect input, Commands coordinate
            actions, Subsystems control hardware. This separation makes complex
            robots manageable!
          </p>
        </div>
      </div>
    </div>
  );
}
