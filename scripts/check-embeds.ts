/**
 * Verifies that every live GitHub embed on the site still points at something
 * that exists.
 *
 *   pnpm check-embeds
 *
 * The site teaches against Workshop-Code, whose numbered teaching branches get
 * rewritten whenever a lesson is re-cut — the whole set was rewritten in July
 * 2026. Nothing in this repo breaks when that happens. The build passes, the
 * types pass, and the page renders its error card to a student instead of the
 * file the lesson is about. That failure is invisible to every check we run,
 * which is what this script is for.
 *
 * It resolves two shapes, because the embeds come in two:
 *
 *   1. `<GitHubContent repository= filePath= branch= pr={{ number }} />`
 *   2. `ImplementationContent` object literals — `{ repository, filePath,
 *      branch, pullRequestNumber, focusFile }` — which reach `<GitHubContent>`
 *      indirectly through `<ComparisonWithCodeWalkthrough>`.
 *
 * Both are found with the TypeScript AST rather than regexes, for the same
 * reason `generate-search-data.ts` is: a regex cannot tell a prop from a
 * string that merely looks like one, and a checker that silently matches
 * nothing is worse than no checker.
 *
 * Exits non-zero on the first broken reference so CI fails loudly.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import * as ts from "typescript-6";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

/** Branch `<GitHubContent>` assumes when the prop is omitted. */
const DEFAULT_BRANCH = "main";

interface Embed {
  repository: string;
  filePath: string;
  branch: string;
  /** PR the "GitHub Changes" tab opens, when the embed has one. */
  pr?: number;
  /** Where it was found, for the failure message. */
  origin: string;
}

/* ── collection ───────────────────────────────────────────────────────── */

const collectFiles = (dir: string, out: string[] = []): string[] => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
};

/** A string-literal prop value, or undefined if it is anything else. */
const literal = (node: ts.Node | undefined): string | undefined => {
  if (!node) return undefined;
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isJsxExpression(node) && node.expression)
    return literal(node.expression);
  return undefined;
};

const numeric = (node: ts.Node | undefined): number | undefined => {
  if (!node) return undefined;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isJsxExpression(node) && node.expression)
    return numeric(node.expression);
  return undefined;
};

const extract = (file: string): Embed[] => {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const found: Embed[] = [];

  const at = (node: ts.Node) =>
    `${rel}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;

  const visit = (node: ts.Node) => {
    // Shape 1 — the JSX element itself.
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      if (node.tagName.getText() === "GitHubContent") {
        const props = new Map<string, ts.Node>();
        for (const prop of node.attributes.properties) {
          if (ts.isJsxAttribute(prop) && prop.initializer) {
            props.set(prop.name.getText(), prop.initializer);
          }
        }

        const repository = literal(props.get("repository"));
        const filePath = literal(props.get("filePath"));

        // Dynamic props (`repository={content.repository}`) resolve to
        // undefined here; those callsites are covered by shape 2 instead.
        if (repository && filePath) {
          let pr: number | undefined;
          const prProp = props.get("pr");
          if (prProp && ts.isJsxExpression(prProp) && prProp.expression) {
            const expr = prProp.expression;
            if (ts.isObjectLiteralExpression(expr)) {
              for (const member of expr.properties) {
                if (
                  ts.isPropertyAssignment(member) &&
                  member.name.getText() === "number"
                ) {
                  pr = numeric(member.initializer);
                }
              }
            }
          }

          found.push({
            repository,
            filePath,
            branch: literal(props.get("branch")) ?? DEFAULT_BRANCH,
            pr,
            origin: at(node),
          });
        }
      }
    }

    // Shape 2 — an ImplementationContent-style object literal. Keyed on
    // having both `repository` and `filePath`, so it does not depend on the
    // interface name and keeps working if the object is inlined.
    if (ts.isObjectLiteralExpression(node)) {
      const props = new Map<string, ts.Expression>();
      for (const member of node.properties) {
        if (ts.isPropertyAssignment(member)) {
          props.set(member.name.getText(), member.initializer);
        }
      }
      const repository = literal(props.get("repository"));
      const filePath = literal(props.get("filePath"));
      if (repository && filePath) {
        found.push({
          repository,
          filePath,
          branch: literal(props.get("branch")) ?? DEFAULT_BRANCH,
          pr: numeric(props.get("pullRequestNumber")),
          origin: at(node),
        });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return found;
};

/* ── verification ─────────────────────────────────────────────────────── */

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const headers: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "User-Agent": "workshop-site-embed-check",
};
if (token) headers.Authorization = `Bearer ${token}`;

/**
 * HEAD-equivalent existence check. Uses the contents API rather than fetching
 * raw.githubusercontent.com because raw serves a CDN-cached 404 for a while
 * after a branch is rewritten, which would make this pass on a broken embed.
 */
const exists = async (url: string): Promise<number> => {
  const response = await fetch(url, { headers });
  // Drain so the socket is reused rather than left half-open across ~40 calls.
  await response.arrayBuffer().catch(() => undefined);
  return response.status;
};

const main = async () => {
  const embeds = collectFiles(SRC).flatMap(extract);

  // Same file on the same branch is embedded from several lessons; check each
  // distinct triple once.
  const unique = new Map<string, Embed>();
  for (const embed of embeds) {
    unique.set(`${embed.repository}@${embed.branch}:${embed.filePath}`, embed);
  }
  const prs = new Map<string, Embed>();
  for (const embed of embeds) {
    if (embed.pr) prs.set(`${embed.repository}#${embed.pr}`, embed);
  }

  if (unique.size === 0) {
    console.error(
      "No embeds found at all. That means this checker stopped matching, " +
        "not that the site has no embeds — fix the extractor."
    );
    process.exit(1);
  }

  console.log(
    `Checking ${unique.size} file embeds and ${prs.size} pull requests` +
      `${token ? "" : " (unauthenticated — set GITHUB_TOKEN if rate-limited)"}…`
  );

  const failures: string[] = [];

  for (const [key, embed] of unique) {
    const url =
      `https://api.github.com/repos/${embed.repository}/contents/` +
      `${embed.filePath}?ref=${encodeURIComponent(embed.branch)}`;
    const status = await exists(url);
    if (status === 200) continue;
    if (status === 403 || status === 429) {
      console.error(`Rate-limited by GitHub. Set GITHUB_TOKEN and re-run.`);
      process.exit(1);
    }
    failures.push(
      `  ${embed.origin}\n` +
        `    ${key}\n` +
        `    HTTP ${status} — branch renamed, file moved, or lesson out of date`
    );
  }

  for (const [key, embed] of prs) {
    const status = await exists(
      `https://api.github.com/repos/${embed.repository}/pulls/${embed.pr}`
    );
    if (status === 200) continue;
    failures.push(`  ${embed.origin}\n    ${key}\n    HTTP ${status}`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} broken embed(s):\n`);
    console.error(failures.join("\n\n"));
    process.exit(1);
  }

  console.log(`All ${unique.size + prs.size} references resolve.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
