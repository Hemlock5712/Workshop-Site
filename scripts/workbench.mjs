/**
 * A writable clone of Workshop-Code, for changing the teaching code from
 * inside this project.
 *
 * `reference/Workshop-Code/` is read-only on purpose: its worktrees are
 * detached so `pnpm reference:refresh` can move every ref after a force-push.
 * Committing there fights that. This is the other half: one ordinary clone,
 * every branch tracked locally, where a lesson's code can be edited, the
 * chain rebased, and `./gradlew build` run before anything is pushed.
 *
 *   node scripts/workbench.mjs          clone if missing, else fetch
 *   node scripts/workbench.mjs --track  also create a local branch for every
 *                                       remote branch that lacks one
 *
 * It lives at `reference/work/Workshop-Code`, inside the gitignored
 * `reference/`, so nothing here is ever committed to the site.
 *
 * Editing the mechanism chain means rebasing it, because it is linear, one
 * commit per lesson:
 *
 *     git checkout mech-5-Coroutines   # make the change, commit
 *     git checkout mech-6-StateBased && git rebase mech-5-Coroutines
 *     git push --force-with-lease origin mech-5-Coroutines mech-6-StateBased
 *
 * Push only after `./gradlew build` passes on every branch you moved, then
 * run `pnpm reference:refresh` so the reference copies follow.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORK = path.join(ROOT, "reference", "work");
const DIR = path.join(WORK, "Workshop-Code");
const URL = "https://github.com/Hemlock5712/Workshop-Code.git";

const git = (cwd, ...args) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" }).trim();

if (!existsSync(DIR)) {
  mkdirSync(WORK, { recursive: true });
  console.log(`cloning ${URL} -> reference/work/Workshop-Code`);
  git(WORK, "clone", URL, "Workshop-Code");
} else {
  console.log("fetching Workshop-Code");
  git(DIR, "fetch", "--prune", "origin");
}

if (process.argv.includes("--track")) {
  const local = new Set(
    git(DIR, "for-each-ref", "--format=%(refname:short)", "refs/heads").split(
      "\n"
    )
  );
  const remote = git(
    DIR,
    "for-each-ref",
    "--format=%(refname:short)",
    "refs/remotes/origin"
  )
    .split("\n")
    .map((ref) => ref.replace(/^origin\//, ""))
    .filter((name) => name && name !== "HEAD" && name !== "origin");
  for (const name of remote) {
    if (local.has(name)) continue;
    git(DIR, "branch", "--track", name, `origin/${name}`);
    console.log(`tracking ${name}`);
  }
}

console.log(git(DIR, "status", "--short", "--branch"));
