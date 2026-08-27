/**
 * Stands in for `eslint src/` while the project is on TypeScript 7.
 *
 * typescript-eslint throws on import when it sees a TypeScript major of 7 or
 * above, and it reaches us transitively through eslint-config-next, so there
 * is no partial mode — the whole lint run dies before a single file is read.
 * It cannot be worked around from here either: `typescript` is a *peer*
 * dependency of typescript-eslint, so it resolves from the root, and a pnpm
 * override cannot point it at 6 without dragging the whole project back.
 *
 * The upstream blocker is architectural rather than a missing release. tsgo is
 * asynchronous and ESLint does not support async parsers yet, so the
 * maintainers put TS 7 support "many months away" and outside the next 1-2
 * majors. See typescript-eslint#10940.
 *
 * Rather than delete the lint step and let it quietly never come back, this
 * re-runs the actual test on every `pnpm test` and says so. When the import
 * stops throwing, it tells you to switch back.
 *
 * To re-enable by hand at any time:  pnpm lint:force
 * To re-enable for good:             point the `lint` script back at
 *                                    `eslint src/` and restore `eslint --fix`
 *                                    in the lint-staged *.{ts,tsx} chain.
 */

import { spawnSync } from "node:child_process";

const BAR = "─".repeat(72);

/**
 * Test the real thing rather than a proxy for it.
 *
 * An earlier version of this just tried to `import("typescript-eslint")`, but
 * that package is not a direct dependency here — it arrives under
 * eslint-config-next — so the import failed to resolve and the check reported
 * "blocked" for the wrong reason, which would have kept saying so forever.
 * Running eslint on one real file is slower and unambiguous.
 */
const probe = spawnSync(
  "pnpm",
  ["exec", "eslint", "--no-ignore", "src/lib/buildInfo.ts"],
  { encoding: "utf8", shell: process.platform === "win32" }
);

const output = `${probe.stdout ?? ""}${probe.stderr ?? ""}`;
const stillBlocked = /does not support TS|getFilename is not a function/.test(
  output
);
const detail =
  output
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /does not support TS/.test(line)) ??
  "eslint exited non-zero for another reason — run pnpm lint:force";

const ts = (await import("typescript")).default ?? {};
const tsVersion = ts.version ?? "unknown";

if (stillBlocked) {
  console.log(BAR);
  console.log("ESLint is OFF — deliberately, not by accident.");
  console.log(BAR);
  console.log(`  TypeScript      ${tsVersion}`);
  console.log(`  Blocker         ${detail}`);
  console.log("  Tracking        typescript-eslint#10940");
  console.log("");
  console.log("  Prettier still runs on commit, and `tsc --noEmit` still");
  console.log("  type-checks everything. What is missing is the rule set:");
  console.log("  react-hooks, jsx-a11y, and next/core-web-vitals.");
  console.log("");
  console.log("  Re-check by hand:  pnpm lint:force");
  console.log(BAR);
} else {
  console.log(BAR);
  console.log("typescript-eslint now imports cleanly on TypeScript " + tsVersion + ".");
  console.log("");
  console.log("  The reason this shim exists is gone. Put linting back:");
  console.log('    - package.json  "lint": "eslint src/"');
  console.log('    - lint-staged   add "eslint --fix" to *.{ts,tsx}');
  console.log("    - CI            re-enable the Lint step in ci.yml");
  console.log("    - delete        scripts/lint-disabled.mjs and lint:force");
  console.log(BAR);
}

// Exit 0 either way. This is a notice, not a gate — failing here would just
// mean `pnpm test` can never pass, which helps nobody.
process.exit(0);
