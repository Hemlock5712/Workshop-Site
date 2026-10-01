import { ArrowUpRight } from "lucide-react";
import { codespacesUrl } from "@/data/codespaces";

/**
 * "Open in Codespaces" for the lesson's Workshop-Code branch: a browser VS Code
 * with JDK 25, WPILib and the simulation GUI already installed, so a student on
 * a school Chromebook can build and simulate the lesson's code.
 *
 * Renders nothing for a branch that has no dev container, see
 * `src/data/codespaces.ts`. Outlined like `DocumentationButton`, because it is
 * a side road: the lesson's own procedure is still the main one.
 *
 * The Codespace is created in the student's own GitHub account and billed to
 * its free monthly allowance, not to the team's.
 */
export default function OpenInCodespaces({ branch }: { branch?: string }) {
  const href = codespacesUrl(branch);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-flow inline-flex max-w-full flex-wrap items-center gap-2.5 px-[18px] py-2.5 text-note font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 2,
        background: "var(--bg2)",
        color: "var(--tx2)",
      }}
    >
      Open {branch} in Codespaces
      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}
