"use client";

import { useState } from "react";
import * as React from "react";
import dynamic from "next/dynamic";
import { useChat } from "@ai-sdk/react";
import PageTemplate from "@/components/PageTemplate";
import Box from "@/components/Box";
import ContentCard from "@/components/ContentCard";
import CodeBlock from "@/components/CodeBlock";
import {
  Send,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Terminal,
  Bot,
  Blocks,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownCodeBlock = dynamic(
  () => import("@/components/MarkdownCodeBlock"),
  { ssr: false }
);

export default function AIAssistantPage() {
  const [input, setInput] = useState("");

  const { messages, status, error, sendMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== "ready") return;

    sendMessage({ text: input.trim() });
    setInput("");
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <PageTemplate title="AI Workshop Assistant">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div
            className="flex items-center gap-2 mb-2"
            aria-hidden="true"
            role="presentation"
          >
            <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            Ask questions about the FRC Programming Workshop. The AI assistant
            has access to all workshop content and remembers your conversation,
            so you can ask follow-up questions.
          </p>
        </div>

        <div className="card p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Start a conversation
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                Ask me anything about FRC programming, command-based
                architecture, PID tuning, or any other workshop topic. I
                remember our conversation, so feel free to ask follow-up
                questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .filter((message) => {
                  // Filter out assistant messages that only have tool calls (no text yet)
                  if (message.role === "assistant") {
                    const hasText = message.parts.some(
                      (part) => part.type === "text" && part.text.trim()
                    );
                    return hasText;
                  }
                  return true;
                })
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      <div className="break-words">
                        {message.role === "user" ? (
                          <div className="whitespace-pre-wrap">
                            {message.parts.map((part, index) => {
                              if (part.type === "text") {
                                return <span key={index}>{part.text}</span>;
                              }
                              return null;
                            })}
                          </div>
                        ) : (
                          <div className="prose prose-slate dark:prose-invert max-w-none prose-code:text-primary-600 dark:prose-code:text-primary-400">
                            {(() => {
                              const textContent = message.parts
                                .filter((part) => part.type === "text")
                                .map((part) =>
                                  part.type === "text" ? part.text : ""
                                )
                                .join("");
                              return (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({
                                      inline,
                                      className,
                                      children,
                                      ...props
                                    }: {
                                      inline?: boolean;
                                      className?: string;
                                      children?: React.ReactNode;
                                    }) {
                                      if (inline) {
                                        return (
                                          <code
                                            className="bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded text-sm font-mono"
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        );
                                      }

                                      return (
                                        <code className={className} {...props}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre({
                                      children,
                                    }: {
                                      children?: React.ReactNode;
                                    }) {
                                      const codeElement =
                                        children as React.ReactElement<{
                                          className?: string;
                                          children?: React.ReactNode;
                                        }>;
                                      return (
                                        <MarkdownCodeBlock
                                          className={
                                            codeElement?.props?.className
                                          }
                                        >
                                          {codeElement?.props?.children}
                                        </MarkdownCodeBlock>
                                      );
                                    },
                                    a({ href, children }) {
                                      return (
                                        <a
                                          href={href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                                        >
                                          {children}
                                          {href?.startsWith("http") && (
                                            <ExternalLink className="w-3 h-3" />
                                          )}
                                        </a>
                                      );
                                    },
                                  }}
                                >
                                  {textContent}
                                </ReactMarkdown>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-slate-600 dark:text-slate-300">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Error:</span>
              <span>{error.message}</span>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex gap-2"
          suppressHydrationWarning
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about subsystems, commands, PID tuning..."
            disabled={status !== "ready"}
            suppressHydrationWarning
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            suppressHydrationWarning
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>

        {/* ——— AI coding assistants on your own robot code ——— */}
        <section className="mt-16 flex flex-col gap-6">
          <h2
            className="text-2xl font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--fg)",
              letterSpacing: "-0.01em",
            }}
          >
            Using an AI Assistant on Your Own Robot Code
          </h2>

          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            The chat above answers questions about the workshop. But modern AI
            coding assistants can go further. They work directly inside your
            robot project, reading your code, writing new commands, running the
            simulator, and analyzing logs. The{" "}
            <a
              href="https://github.com/Hemlock5712/2027-Template"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              2027-Template
            </a>{" "}
            ships ready for this: it includes a <code>CLAUDE.md</code>{" "}
            instruction file and a set of <strong>Agent Skills</strong> that
            teach an assistant how this specific robot works.
          </p>

          <Box
            variant="alert-info"
            tag="WHY THIS MATTERS · COMMANDS V3"
            title="AI models don't know Commands v3 yet"
          >
            WPILib 2027 and Commands v3 are newer than most AI models&apos;
            training data. Without guidance, an assistant will confidently write{" "}
            <em>Commands v2</em> code: <code>RobotContainer</code>,{" "}
            <code>SendableChooser</code>, <code>edu.wpi.first</code> imports,
            none of which exist in this stack. The template&apos;s{" "}
            <code>CLAUDE.md</code> and skills ground the assistant in how the
            project actually works, so it writes v3 code that compiles.
          </Box>

          <h3 className="text-xl font-semibold" style={{ color: "var(--fg)" }}>
            Pick a coding assistant
          </h3>

          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            Any agentic coding tool works. These are the three we see teams use
            most. All of them can read the template&apos;s skill files.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <ContentCard tag="ASSISTANT" className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Terminal
                  className="w-5 h-5"
                  style={{ color: "var(--primary-lifted)" }}
                />
                <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                  Claude Code
                </h4>
              </div>
              <p className="text-sm flex-1" style={{ color: "var(--fg-mute)" }}>
                Anthropic&apos;s coding agent, which runs in the terminal or as
                a VS Code extension. It reads <code>CLAUDE.md</code> and
                discovers the template&apos;s skills automatically, so it works
                out of the box.
              </p>
              <a
                href="https://claude.com/claude-code"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                claude.com/claude-code
                <ExternalLink className="w-3 h-3" />
              </a>
            </ContentCard>

            <ContentCard tag="ASSISTANT" className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Blocks
                  className="w-5 h-5"
                  style={{ color: "var(--primary-lifted)" }}
                />
                <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                  GitHub Copilot
                </h4>
              </div>
              <p className="text-sm flex-1" style={{ color: "var(--fg-mute)" }}>
                Lives inside VS Code, which you already use for WPILib. Agent
                mode can edit files and run Gradle tasks. Free for verified
                students through GitHub Education.
              </p>
              <a
                href="https://github.com/features/copilot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                github.com/features/copilot
                <ExternalLink className="w-3 h-3" />
              </a>
            </ContentCard>

            <ContentCard tag="ASSISTANT" className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Bot
                  className="w-5 h-5"
                  style={{ color: "var(--primary-lifted)" }}
                />
                <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                  OpenAI Codex
                </h4>
              </div>
              <p className="text-sm flex-1" style={{ color: "var(--fg-mute)" }}>
                OpenAI&apos;s coding agent, available as a CLI and IDE
                extension. Configure it with an <code>AGENTS.md</code> file that
                points at the template&apos;s skill files.
              </p>
              <a
                href="https://openai.com/codex"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
              >
                openai.com/codex
                <ExternalLink className="w-3 h-3" />
              </a>
            </ContentCard>
          </div>
        </section>

        {/* ——— The template's Agent Skills ——— */}
        <section className="mt-12 flex flex-col gap-6">
          <h2
            className="text-2xl font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--fg)",
              letterSpacing: "-0.01em",
            }}
          >
            The Template&apos;s Agent Skills
          </h2>

          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            A <strong>skill</strong> is a folder containing a{" "}
            <code>SKILL.md</code> file: plain Markdown with a short description
            at the top that tells the assistant <em>when</em> to read it. When
            your question matches (&quot;why did my auto miss the pose?&quot;),
            the assistant loads that skill and follows it. Because skills are
            just Markdown, any assistant that can read files can use them.
          </p>

          <CodeBlock
            language="text"
            title="How the template talks to AI assistants"
            code={`2027-Template/
├── CLAUDE.md          ← entry point: project rules + pointers to the skills
├── ONBOARDING.md      ← the wiring guide (there is no RobotContainer!)
└── .claude/
    └── skills/
        ├── robot-description/SKILL.md   ← map of the code
        ├── game-info/SKILL.md           ← field + alliance conventions
        ├── run-sim/SKILL.md             ← running the simulator
        ├── log-reading/SKILL.md         ← reading .wpilog / .hoot logs
        └── teaching/SKILL.md            ← teacher mode (on by default)`}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <ContentCard tag="SKILL" className="flex flex-col gap-2">
              <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                <code>robot-description</code>
              </h4>
              <p className="text-sm" style={{ color: "var(--fg-mute)" }}>
                The map of the code: OpModes, Mechanisms, commands, and where
                everything lives. That includes the biggest surprise for anyone
                coming from Commands v2, the &quot;there is no
                RobotContainer&quot; wiring model. The skill an assistant should
                read before touching any code.
              </p>
            </ContentCard>

            <ContentCard tag="SKILL" className="flex flex-col gap-2">
              <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                <code>game-info</code>
              </h4>
              <p className="text-sm" style={{ color: "var(--fg-mute)" }}>
                Field and alliance conventions the code enforces:
                blue-alliance-origin coordinates, operator-perspective flipping,
                and AprilTag/Limelight conventions. Has TODO sections to fill in
                when the real season game drops.
              </p>
            </ContentCard>

            <ContentCard tag="SKILL" className="flex flex-col gap-2">
              <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                <code>run-sim</code>
              </h4>
              <p className="text-sm" style={{ color: "var(--fg-mute)" }}>
                How to run the robot in simulation, including a headless{" "}
                <code>simulateJavaAgent</code> Gradle task that auto-enables the
                robot, so the assistant can run your autonomous routine by
                itself and check whether it worked.
              </p>
            </ContentCard>

            <ContentCard tag="SKILL" className="flex flex-col gap-2">
              <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                <code>log-reading</code>
              </h4>
              <p className="text-sm" style={{ color: "var(--fg-mute)" }}>
                Where <code>.wpilog</code> and <code>.hoot</code> logs live,
                exactly which telemetry keys the robot publishes, and how to
                analyze a run in AdvantageScope or with a script the assistant
                writes itself.
              </p>
            </ContentCard>

            <ContentCard
              tag="SKILL"
              className="flex flex-col gap-2 md:col-span-2"
            >
              <h4 className="font-bold" style={{ color: "var(--fg)" }}>
                <code>teaching</code>
              </h4>
              <p className="text-sm" style={{ color: "var(--fg-mute)" }}>
                Teacher mode is <strong>on by default</strong>. It tells the
                assistant to explain code the way a student needs it: simple
                words, short answers, one idea at a time, with links to learn
                more. The code it writes is still real, correct code. Only the
                explanations change. A mentor doing focused development can say
                &quot;teacher mode off&quot; to drop the teaching layer for the
                session.
              </p>
            </ContentCard>
          </div>
        </section>

        {/* ——— Using the skills in your project ——— */}
        <section className="mt-12 flex flex-col gap-6">
          <h2
            className="text-2xl font-semibold leading-tight"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--fg)",
              letterSpacing: "-0.01em",
            }}
          >
            Using the Skills in Your Project
          </h2>

          <ol
            className="list-decimal pl-5 space-y-3 text-[15px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            <li>
              <strong style={{ color: "var(--fg)" }}>
                Start your robot project from the 2027-Template.
              </strong>{" "}
              The skills come along in <code>.claude/skills/</code>, no extra
              setup needed.
            </li>
            <li>
              <strong style={{ color: "var(--fg)" }}>
                Claude Code: just open the project and ask.
              </strong>{" "}
              It reads <code>CLAUDE.md</code> on startup and automatically loads
              whichever skill matches your request.
            </li>
            <li>
              <strong style={{ color: "var(--fg)" }}>
                Copilot / Codex: point them at the skill first.
              </strong>{" "}
              Ask something like &quot;Read{" "}
              <code>.claude/skills/run-sim/SKILL.md</code>, then run the
              autonomous in sim&quot;, or reference the skills folder from your{" "}
              <code>.github/copilot-instructions.md</code> or{" "}
              <code>AGENTS.md</code> so it happens automatically.
            </li>
            <li>
              <strong style={{ color: "var(--fg)" }}>
                Keep the skills up to date as your robot grows.
              </strong>{" "}
              When you add real mechanisms and season-specific poses, fill in
              the TODO sections. A skill describing last month&apos;s robot
              misleads the AI the same way a stale comment misleads a teammate.
            </li>
          </ol>

          <Box
            variant="alert-tip"
            tag="TRY IT · EXAMPLE PROMPTS"
            title="Prompts that put the skills to work"
          >
            <ul className="list-disc pl-4 space-y-1">
              <li>
                &quot;Run the autonomous routine in the simulator and tell me
                whether the robot reached its target pose.&quot;
              </li>
              <li>
                &quot;Read the newest log in <code>logs/</code> and tell me when
                the robot enabled and how fast it drove.&quot;
              </li>
              <li>&quot;Why won&apos;t the flywheel spin in the sim?&quot;</li>
              <li>
                &quot;Add a new autonomous OpMode that drives to two poses in
                sequence, and explain how it works.&quot;
              </li>
            </ul>
          </Box>

          <Box
            variant="alert-warning"
            tag="SAFETY · YOU OWN THE CODE"
            title="Review everything before it touches a real robot"
          >
            An AI assistant is a teammate, not an autopilot. Read every change
            it makes, run it in simulation first, and make sure <em>you</em> can
            explain what the code does — &quot;the AI wrote it&quot; won&apos;t
            help you debug at a competition. Remember the 2027 stack is alpha
            software, so APIs can shift between releases; when the assistant and
            the compiler disagree, trust the compiler.
          </Box>
        </section>
      </div>
    </PageTemplate>
  );
}
