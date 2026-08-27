/**
 * Puts every teaching state of Workshop-Code on disk at once, under
 * `reference/`, so a lesson can be checked against the code it embeds without
 * leaving the project.
 *
 * The problem this solves is not "there is no clone". There was one, at
 * ../Workshop-Code, parked on `2-Logging` — a branch the rewrite of July 2026
 * left behind and no page references any more. A single checkout can only ever
 * show one lesson state, so it drifts to whichever branch was needed last and
 * silently answers questions about the wrong one.
 *
 * The shape here is one bare mirror per repository plus one worktree per
 * branch. The worktrees share the mirror's object store, so fifteen states of
 * Workshop-Code cost about 12 MB of checkout and one copy of the history, and
 * `git diff` works across them:
 *
 *     git -C reference/.git-store/Workshop-Code.git diff 2-Commands 4-DynamicFlywheel
 *
 * Two details are load-bearing:
 *
 * - Worktrees are checked out DETACHED. A worktree that holds `refs/heads/X`
 *   makes git refuse to update that ref, and the teaching chain is rebased and
 *   force-pushed whenever the WPILib alpha breaks an API. Detached HEAD keeps
 *   every ref free for `--refresh` to move, and doubles as a signal that this
 *   is a reference copy and not somewhere to commit.
 *
 * - `--mirror` sets a forced refspec, so a rebased upstream fetches cleanly
 *   instead of reporting a diverged history on all fifteen branches.
 *
 * `reference/` is gitignored. That is why this script is versioned: it is the
 * only record of how the directory is built.
 *
 *   node scripts/sync-reference.mjs             create anything missing
 *   node scripts/sync-reference.mjs --refresh   fetch upstream, move worktrees
 *   node scripts/sync-reference.mjs --prune     also drop worktrees whose
 *                                               branch is gone upstream
 *
 * Nothing here is precious. Delete `reference/` and re-run to rebuild it.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REFERENCE = path.join(ROOT, "reference");
const STORE = path.join(REFERENCE, ".git-store");

/**
 * `branches: null` means every branch the remote has. Workshop-Code wants all
 * of them — including the four orphans (2-Logging, 3-PID, 4-MotionMagic,
 * 5-GettersAndSetters) that no page embeds, because deciding whether to
 * promote or delete those needs them readable. 2027-Template is ground truth
 * for API questions, not a progression, so one branch is enough.
 */
const REPOS = [
  {
    name: "Workshop-Code",
    url: "https://github.com/Hemlock5712/Workshop-Code.git",
    branches: null,
  },
  {
    name: "2027-Template",
    url: "https://github.com/Hemlock5712/2027-Template.git",
    branches: ["2027-dev"],
  },
];

const args = new Set(process.argv.slice(2));
const REFRESH = args.has("--refresh");
const PRUNE = args.has("--prune");

const git = (cwd, ...rest) =>
  execFileSync("git", ["-C", cwd, ...rest], { encoding: "utf8" }).trim();

const log = (msg) => process.stdout.write(`${msg}\n`);

let dirty = 0;

for (const repo of REPOS) {
  const mirror = path.join(STORE, `${repo.name}.git`);

  if (!existsSync(mirror)) {
    log(`\n${repo.name}: cloning mirror`);
    mkdirSync(STORE, { recursive: true });
    execFileSync("git", ["clone", "--mirror", repo.url, mirror], {
      stdio: "inherit",
    });
  } else if (REFRESH) {
    log(`\n${repo.name}: fetching`);
    git(mirror, "remote", "update", "--prune");
  } else {
    log(`\n${repo.name}: mirror present`);
  }

  const remote = git(mirror, "for-each-ref", "--format=%(refname:short)", "refs/heads")
    .split("\n")
    .filter(Boolean);
  const wanted = repo.branches
    ? remote.filter((b) => repo.branches.includes(b))
    : remote;

  for (const branch of wanted) {
    // A branch name may contain `/`; keep the checkout one level deep so the
    // directory listing reads as a flat list of lesson states.
    const dir = path.join(REFERENCE, repo.name, branch.replaceAll("/", "-"));

    if (!existsSync(dir)) {
      git(mirror, "worktree", "add", "--detach", dir, branch);
      log(`  + ${branch}`);
      continue;
    }
    if (!REFRESH) continue;

    // Refusing to clobber uncommitted work is the whole reason this is not an
    // unconditional `reset --hard`. A reference checkout is disposable, but
    // only the person who edited it knows that.
    if (git(dir, "status", "--porcelain")) {
      log(`  ! ${branch} has local changes, left alone`);
      dirty += 1;
      continue;
    }
    const before = git(dir, "rev-parse", "--short", "HEAD");
    git(dir, "checkout", "--detach", "--force", branch);
    const after = git(dir, "rev-parse", "--short", "HEAD");
    log(before === after ? `  = ${branch}` : `  ^ ${branch} ${before} -> ${after}`);
  }

  // Guarded on a non-empty ref list: a failed fetch returns nothing, and an
  // unguarded prune would read that as "every branch was deleted upstream"
  // and remove all fifteen checkouts.
  if (PRUNE && remote.length > 0) {
    const keep = new Set(wanted.map((b) => b.replaceAll("/", "-")));
    const checkouts = git(mirror, "worktree", "list", "--porcelain")
      .split(/\r?\n/)
      .filter((l) => l.startsWith("worktree "))
      .map((l) => l.slice("worktree ".length));
    for (const dir of checkouts) {
      if (path.resolve(dir) === path.resolve(mirror)) continue;
      const name = path.basename(dir);
      if (keep.has(name)) continue;
      rmSync(dir, { recursive: true, force: true });
      log(`  - ${name} (gone upstream)`);
    }
    git(mirror, "worktree", "prune");
  } else if (PRUNE) {
    log("  ! skipping prune: no branches listed (fetch may have failed)");
  }
}

if (dirty) {
  log(`\n${dirty} worktree(s) skipped for local changes. Commit, stash, or delete them.`);
}
log(`\nreference/ is gitignored. Re-run with --refresh after an upstream rebase.`);
