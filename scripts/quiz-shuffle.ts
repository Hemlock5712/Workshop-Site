import fs from "node:fs";
import path from "node:path";
import ts from "typescript-6";

/**
 * De-patterns quiz answer keys.
 *
 * Ten quizzes shipped `correctAnswer: 1` on every question, so a student could
 * score 100% by always picking option b. This rotates each question's `options`
 * array so the answer lands on a varied index.
 *
 * Rotation, not shuffle, and deliberately: it preserves every option's text and
 * their relative order, so an explanation that argues against "the claim that
 * X" still lines up, and a distractor written to sit next to another still
 * does. The only thing that changes is where the key falls.
 *
 * Target indices cycle through a fixed pattern per page, offset by the page
 * name so two pages do not end up with the same key. Deterministic: re-running
 * is a no-op once a page is already varied.
 *
 * Usage: npx tsx scripts/quiz-shuffle.ts <route> [<route> ...]
 *        npx tsx scripts/quiz-shuffle.ts --all
 */

const BASE = "src/app/(workshop)";
const PATTERN = [2, 0, 3, 1, 0, 2, 1, 3];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Locate every `options: [...]` / `correctAnswer: n` pair inside a Quiz. */
function collect(source: any, raw: string) {
  const found: any[] = [];
  const visit = (node: any): void => {
    if (ts.isObjectLiteralExpression(node)) {
      let optionsNode = null;
      let answerNode = null;
      for (const p of node.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const name = p.name.getText();
        if (name === "options" && ts.isArrayLiteralExpression(p.initializer)) {
          optionsNode = p.initializer;
        } else if (name === "correctAnswer") {
          answerNode = p.initializer;
        }
      }
      if (optionsNode && answerNode && ts.isNumericLiteral(answerNode)) {
        found.push({
          options: optionsNode,
          answer: answerNode,
          current: Number(answerNode.text),
          count: optionsNode.elements.length,
        });
      }
    }
    node.forEachChild(visit);
  };
  visit(source);
  return found;
}

function processFile(file: string, label: string) {
  let raw = fs.readFileSync(file, "utf8");
  if (!raw.includes("<Quiz")) return null;

  const source = ts.createSourceFile(
    file,
    raw,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const questions = collect(source, raw);
  if (questions.length < 3) return null;

  // Only act if the key is patterned, matching the linter's rule.
  const counts = [0, 0, 0, 0];
  for (const q of questions) if (q.current < 4) counts[q.current] += 1;
  const share = Math.max(...counts) / questions.length;
  const distinct = counts.filter((c) => c > 0).length;
  if (share < 0.6 && distinct > 2) return null;

  const offset = hash(label) % PATTERN.length;
  const edits: { start: number; end: number; text: string }[] = [];

  questions.forEach((q, i) => {
    const target = PATTERN[(i + offset) % PATTERN.length] % q.count;
    if (target === q.current) return;

    // Rotate left by (current - target) so element `current` lands at `target`.
    const shift = (q.current - target + q.count) % q.count;
    const texts = q.options.elements.map((e: ts.Expression) =>
      raw.slice(e.getStart(source), e.getEnd())
    );
    const rotated = texts.slice(shift).concat(texts.slice(0, shift));

    const open = q.options.getStart(source);
    const close = q.options.getEnd();
    const inner = rotated.join(",\n              ");
    edits.push({
      start: open,
      end: close,
      text: "[\n              " + inner + ",\n            ]",
    });
    edits.push({
      start: q.answer.getStart(source),
      end: q.answer.getEnd(),
      text: String(target),
    });
  });

  if (edits.length === 0) return null;
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits)
    raw = raw.slice(0, e.start) + e.text + raw.slice(e.end);
  fs.writeFileSync(file, raw);

  const after = collect(
    ts.createSourceFile(
      file,
      raw,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    ),
    raw
  ).map((q) => q.current);
  return {
    label,
    before: questions.map((q) => q.current).join(","),
    after: after.join(","),
  };
}

const args = process.argv.slice(2);
const routes =
  args[0] === "--all"
    ? fs
        .readdirSync(BASE, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : args.map((a) => a.replace(/^\//, ""));

for (const r of routes) {
  const file = path.join(BASE, r, "page.tsx");
  if (!fs.existsSync(file)) continue;
  const res = processFile(file, r);
  if (res) console.log(`/${res.label}: ${res.before}  ->  ${res.after}`);
}
