/**
 * Turns the Workshop-Code branch chain into a CodeRunner lesson catalog.
 *
 * CodeRunner wants one directory per lesson, each a complete starting project,
 * plus a `modules.json` at the repo root. We have that already, but as git
 * refs rather than directories: every `mech-*` branch tip is a compiling
 * project. This script materialises them.
 *
 * The rule it exists to enforce is the one in CLAUDE.md about submodules, for
 * the same reason: the branches are the single source of truth and nothing
 * here may become a second hand-maintained copy of the teaching code. The
 * output directory is a build artifact. Delete it and re-run.
 *
 *   node scripts/generate-lesson-catalog.mjs           -> ../Workshop-Lessons
 *   node scripts/generate-lesson-catalog.mjs --out DIR
 *   node scripts/generate-lesson-catalog.mjs --check   exit 1 on any warning
 *
 * Do not point --out inside this repo. A `build.gradle` under an open editor
 * workspace gets auto-imported by the Java language server, which locks files
 * in the output and breaks the next run's cleanup.
 *
 * Requires `reference/` (run `pnpm reference:sync` first) because it reads the
 * bare mirror, not the worktrees. Reading the mirror means the export is the
 * branch tip, never a worktree someone left dirty.
 *
 * Three things are derived rather than typed:
 *
 * - **Which lesson a branch belongs to** comes from the pages themselves. A
 *   lesson embeds its branch with `branch="mech-2-Commands"`, so scanning
 *   `src/app/(workshop)` gives the mapping and it cannot drift from the site.
 * - **`order`** comes from the branch's position in the chain, in tens, with
 *   `main` at 10 so the plain-java prelude has 1 to 9 ahead of it. Chain
 *   position is what actually has to be linear; lesson
 *   order is checked against it and disagreements are reported rather than
 *   silently encoded.
 * - **What changed in a lesson** comes from `git diff --stat` against the
 *   previous branch, so the README's file list cannot go stale.
 *
 * What is NOT derived is the prose. Each module's README is a bench card, not
 * a copy of the lesson: the goal, the steps, the check. Cards live in
 * `context/lesson-cards/<branch>.md` and are stitched between a generated
 * header and footer. A branch with no card gets a stub and a warning, because
 * a silently empty lesson is worse than a loud one.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIRROR = path.join(ROOT, "reference", ".git-store", "Workshop-Code.git");
const PAGES = path.join(ROOT, "src", "app", "(workshop)");
const CARDS = path.join(ROOT, "context", "lesson-cards");
const MODULES_SRC = path.join(ROOT, "context", "lesson-modules");
const SITE = "https://frc5712.com";

const args = process.argv.slice(2);
const outArg = args.indexOf("--out");
// Default OUTSIDE the repo, and not only for tidiness. Anything with a
// `build.gradle` under an open editor workspace gets imported by the Java
// language server, which takes locks inside the output and leaves the next
// run unable to delete it. A sibling directory also matches where this ends
// up for real, as its own catalog repository.
const OUT = path.resolve(
  ROOT,
  outArg === -1 ? path.join("..", "Workshop-Lessons") : args[outArg + 1]
);
const CHECK = args.includes("--check");

const warnings = [];
const warn = (message) => {
  warnings.push(message);
  console.warn(`  warning: ${message}`);
};

const git = (...a) =>
  execFileSync("git", ["-C", MIRROR, ...a], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  }).trim();

/**
 * The mechanism chain, in order. `main` is the bare generated project and
 * sorts first; the rest carry their position in the branch name, which is the
 * whole point of the `mech-N-Topic` convention and means inserting a lesson
 * renames nothing downstream of it in this file.
 *
 * The swerve chain is deliberately excluded. It has not been rebuilt onto the
 * 2027 package layout, and it carries generated CTRE constants and a
 * calibrated module layout that no student types, so it is not a lesson you
 * can hand someone as a starting project.
 */
function chain() {
  const refs = git("for-each-ref", "--format=%(refname:short)", "refs/heads")
    .split("\n")
    .filter(Boolean);

  const mech = refs
    .filter((r) => /^mech-\d+-/.test(r))
    .map((r) => ({ branch: r, n: Number(r.match(/^mech-(\d+)-/)[1]) }))
    .sort((a, b) => a.n - b.n);

  if (!refs.includes("main")) {
    throw new Error("Workshop-Code has no `main`; the mirror is wrong.");
  }

  const gaps = mech.filter((m, i) => m.n !== i + 1);
  if (gaps.length > 0) {
    warn(
      `mech branch numbering is not 1..${mech.length}: ${mech
        .map((m) => m.branch)
        .join(", ")}. The chain still exports in this order.`
    );
  }

  return [{ branch: "main", n: 0 }, ...mech];
}

/**
 * Branches whose lesson cannot be read off a `branch=` prop.
 *
 * `/project-setup` walks a student through generating this exact project, so
 * `main` is its starting state, but the page has nothing to embed: the whole
 * lesson is the generator wizard. Anything added here is a claim the pages
 * cannot check, so keep it to cases like that one.
 */
const LESSON_OVERRIDES = { main: "/project-setup" };

/** Which lesson embeds which branch, read off the pages. */
function branchToLessons() {
  const map = new Map();
  for (const entry of readdirSync(PAGES, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const page = path.join(PAGES, entry.name, "page.tsx");
    if (!existsSync(page)) continue;
    const source = readFileSync(page, "utf8");
    for (const m of source.matchAll(/branch=\{?"([^"]+)"/g)) {
      if (!map.has(m[1])) map.set(m[1], []);
      if (!map.get(m[1]).includes(entry.name)) map.get(m[1]).push(entry.name);
    }
  }
  return map;
}

/** Lesson slugs in course order, plus their titles, straight out of lessons.ts. */
function lessons() {
  const source = readFileSync(
    path.join(ROOT, "src", "data", "lessons.ts"),
    "utf8"
  );
  const body = source.slice(source.indexOf("export const LESSONS"));
  const out = [];
  for (const m of body.matchAll(
    /slug:\s*"(\/[^"]+)"\s*,\s*\n?\s*title:\s*"([^"]+)"/g
  )) {
    out.push({ slug: m[1], title: m[2] });
  }
  if (out.length === 0) {
    throw new Error("Could not parse LESSONS out of lessons.ts.");
  }
  return out;
}

/**
 * Container tuning, layered over whatever the branch ships. These are
 * CodeRunner's numbers, not the project's: a student workspace is a
 * memory-capped container sharing one host.
 */
const GRADLE_PROPERTIES = `# Written by scripts/generate-lesson-catalog.mjs. Do not edit here.
#
# Container tuning for CodeRunner. A student workspace is memory-capped and
# shares a host, so the build must not assume a laptop's worth of RAM or cores.
org.gradle.jvmargs=-Xms64m -Xmx768m -XX:MaxMetaspaceSize=384m -XX:ReservedCodeCacheSize=96m -XX:+HeapDumpOnOutOfMemoryError -XX:ActiveProcessorCount=2
org.gradle.daemon=false
org.gradle.parallel=false
org.gradle.workers.max=2
# Native file watchers do not attach to bind-mounted host paths under Docker
# Desktop or WSL2, and the failure surfaces as DaemonDisappearedException at
# sync time rather than as anything about watching files.
org.gradle.vfs.watch=false
`;

const EDITOR_OVERRIDES = {
  "java.jdt.ls.vmargs":
    "-XX:+UseParallelGC -XX:GCTimeRatio=4 -XX:AdaptiveSizePolicyWeight=90 " +
    "-Dsun.zip.disableMemoryMapping=true -Xms64m -Xmx768m " +
    "-XX:ReservedCodeCacheSize=96m -Xlog:disable",
  "java.gradle.buildServer.enabled": "off",
  "gradle.autoDetect": "off",
  "java.import.gradle.jvmArguments":
    "-Xms64m -Xmx768m -XX:MaxMetaspaceSize=384m -XX:ReservedCodeCacheSize=96m " +
    "-XX:+HeapDumpOnOutOfMemoryError -XX:ActiveProcessorCount=2 -Dfile.encoding=UTF-8",
  "java.import.gradle.arguments": "--no-daemon --no-watch-fs --max-workers=2",
  "wpilib.autoStartRioLog": false,
  "wpilib.skipSelectSimulateExtension": true,
};

/** Export a branch tip into `dir`, straight out of the mirror. */
function exportBranch(branch, dir) {
  mkdirSync(dir, { recursive: true });
  const tar = execFileSync("git", ["-C", MIRROR, "archive", branch], {
    maxBuffer: 256 * 1024 * 1024,
  });
  // `cwd` rather than `tar -C dir`: on Windows the shipped tar is an MSYS
  // build that reads `C:\...` as a remote host spec and dies on the colon.
  execFileSync("tar", ["-x"], { input: tar, cwd: dir });
}

function applyOverlay(dir) {
  writeFileSync(path.join(dir, "gradle.properties"), GRADLE_PROPERTIES);

  const settingsPath = path.join(dir, ".vscode", "settings.json");
  let settings = {};
  if (existsSync(settingsPath)) {
    // The WPILib generator writes JSONC with trailing commas.
    const raw = readFileSync(settingsPath, "utf8").replace(
      /,(\s*[}\]])/g,
      "$1"
    );
    try {
      settings = JSON.parse(raw);
    } catch {
      warn(
        `${path.basename(dir)}: .vscode/settings.json did not parse; replacing it.`
      );
    }
  }
  mkdirSync(path.dirname(settingsPath), { recursive: true });
  writeFileSync(
    settingsPath,
    `${JSON.stringify({ ...settings, ...EDITOR_OVERRIDES }, null, 2)}\n`
  );
}

/** Files a branch changed relative to the one before it. */
function changedFiles(prev, branch) {
  if (!prev) return [];
  return git("diff", "--name-status", prev, branch)
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split("\t");
      return { status: status[0], file: rest.join("\t") };
    })
    .filter(({ file }) => file.startsWith("src/") || file.endsWith(".json"));
}

function readme({ branch, title, pages, prev, changes }) {
  const lines = [`# ${title}`, ""];

  if (pages.length > 0) {
    const links = pages.map((p) => `<${SITE}/${p}>`).join(" and ");
    lines.push(`Full lesson: ${links}`, "");
  } else {
    lines.push(
      "This module has no lesson page on the site yet. The code is complete;",
      "the walkthrough is not.",
      ""
    );
  }

  const card = path.join(CARDS, `${branch}.md`);
  if (existsSync(card)) {
    lines.push(readFileSync(card, "utf8").trim(), "");
  } else {
    warn(
      `${branch}: no card at context/lesson-cards/${branch}.md, so its README is a stub.`
    );
    lines.push(
      "## Steps",
      "",
      "_This card has not been written yet._ Open the lesson linked above and",
      "follow it against the code here.",
      ""
    );
  }

  if (prev && changes.length > 0) {
    lines.push(
      `## What changed since ${prev}`,
      "",
      "Generated from the branch diff, so it cannot go stale.",
      "",
      "```",
      ...changes.map(
        ({ status, file }) =>
          `${{ A: "added   ", M: "modified", D: "deleted " }[status] ?? status} ${file}`
      ),
      "```",
      ""
    );
  }

  lines.push(
    "---",
    "",
    `Generated from Workshop-Code \`${branch}\` by`,
    "`scripts/generate-lesson-catalog.mjs`. Edits here are overwritten; change",
    "the branch or the card instead.",
    ""
  );
  return lines.join("\n");
}

/**
 * Hand-written modules, which is every module that is not a branch tip.
 *
 * `plain-java` lessons have no robot project to export, so there is no branch
 * for them and nothing to derive. They live in `context/lesson-modules/<id>/`
 * with a `module.json` beside the sources, and they are copied verbatim.
 */
function handWritten() {
  if (!existsSync(MODULES_SRC)) return [];
  return readdirSync(MODULES_SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dir = path.join(MODULES_SRC, e.name);
      const manifestPath = path.join(dir, "module.json");
      if (!existsSync(manifestPath)) {
        warn(`context/lesson-modules/${e.name} has no module.json; skipped.`);
        return null;
      }
      return { dir, manifest: JSON.parse(readFileSync(manifestPath, "utf8")) };
    })
    .filter(Boolean);
}

/** Copy a directory tree, minus the manifest the generator consumes. */
function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (entry.name === "module.json") continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyTree(src, dst);
    else writeFileSync(dst, readFileSync(src));
  }
}

/**
 * Remove the previous output. Retried because a Gradle daemon or language
 * server that imported the last run holds locks for a few seconds after it
 * lets go, and a half-deleted catalog is worse than a clear failure.
 */
function clean(dir) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 5 });
      return;
    } catch (error) {
      if (attempt === 4) {
        throw new Error(
          `Could not clear ${dir}: ${error.message}
` +
            "Something is holding files open in it, usually a Java language " +
            "server that imported the generated projects. Close it, or pass " +
            "--out somewhere outside any open editor workspace."
        );
      }
      execFileSync(process.execPath, ["-e", "setTimeout(()=>{},600)"]);
    }
  }
}

function main() {
  if (!existsSync(MIRROR)) {
    console.error(
      `No mirror at ${path.relative(ROOT, MIRROR)}.\nRun \`pnpm reference:sync\` first.`
    );
    process.exit(1);
  }

  const links = branchToLessons();
  const courseOrder = lessons();
  const slugIndex = new Map(courseOrder.map((l, i) => [l.slug, i]));
  const titleOf = new Map(courseOrder.map((l) => [l.slug, l.title]));

  clean(OUT);
  mkdirSync(path.join(OUT, "modules"), { recursive: true });

  const modules = [];

  for (const { dir, manifest } of handWritten()) {
    const { id, title, kind, order, lesson, description } = manifest;
    const out = path.join(OUT, "modules", id);
    console.log(
      `  ${String(order).padStart(3)}  ${id}  (hand-written, ${kind})`
    );
    copyTree(dir, out);
    writeFileSync(
      path.join(out, "README.md"),
      readme({
        branch: id,
        title,
        pages: lesson ? [lesson.replace(/^\//, "")] : [],
        prev: null,
        changes: [],
      })
    );
    modules.push({
      id,
      title,
      description:
        description ?? (lesson ? `Full lesson at ${SITE}${lesson}.` : ""),
      subdir: `modules/${id}`,
      kind,
      order,
    });
  }

  let lastLessonIndex = -1;
  let prev = null;

  for (const { branch, n } of chain()) {
    const id = branch.toLowerCase();
    const dir = path.join(OUT, "modules", id);
    const override = LESSON_OVERRIDES[branch];
    const pages = links.get(branch) ?? (override ? [override.slice(1)] : []);
    const slugs = pages.map((p) => `/${p}`);

    // A branch's title is its lesson's title. Two branches never share a
    // lesson, but one branch is embedded by several pages, so take the
    // earliest in course order and treat that as the lesson it belongs to.
    const owning = slugs
      .filter((s) => slugIndex.has(s))
      .sort((a, b) => slugIndex.get(a) - slugIndex.get(b))[0];

    const title = owning
      ? titleOf.get(owning)
      : branch === "main"
        ? "Robot Starter"
        : branch.replace(/^mech-\d+-/, "").replace(/([a-z])([A-Z])/g, "$1 $2");

    if (owning) {
      const idx = slugIndex.get(owning);
      if (idx < lastLessonIndex) {
        warn(
          `${branch} maps to ${owning}, which comes earlier in lessons.ts than the ` +
            "previous branch's lesson. The branch chain and the course order disagree."
        );
      }
      lastLessonIndex = Math.max(lastLessonIndex, idx);
    } else if (branch !== "main") {
      warn(
        `${branch} is embedded by no page. It ships as a module with no lesson.`
      );
    }

    console.log(`  ${String((n + 1) * 10).padStart(3)}  ${id}`);
    exportBranch(branch, dir);
    applyOverlay(dir);
    writeFileSync(
      path.join(dir, "README.md"),
      readme({
        branch,
        title,
        pages,
        prev,
        changes: changedFiles(prev, branch),
      })
    );

    modules.push({
      id,
      title,
      description: owning
        ? `Workshop-Code ${branch}. Full lesson at ${SITE}${owning}.`
        : `Workshop-Code ${branch}.`,
      subdir: `modules/${id}`,
      kind: "robot",
      order: (n + 1) * 10,
    });

    prev = branch;
  }

  writeFileSync(
    path.join(OUT, "modules.json"),
    `${JSON.stringify({ schemaVersion: 1, modules }, null, 2)}\n`
  );

  console.log(`\n${modules.length} modules -> ${path.relative(ROOT, OUT)}`);
  if (warnings.length > 0) {
    console.log(`${warnings.length} warning(s).`);
    if (CHECK) process.exit(1);
  }
}

main();
