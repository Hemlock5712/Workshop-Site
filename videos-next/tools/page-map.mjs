#!/usr/bin/env node
// Print what a lesson page has on it, with a selector for each block, so a cue
// file (lessons/<id>/page.json) can be written without opening the browser.
//
//   node tools/page-map.mjs /pid-control [--base http://localhost:3000]
//
// Every selector it prints matches exactly one visible element on the page as
// it is now. Paragraphs are matched by their opening words, so a later edit to
// that sentence breaks the cue loudly in `render-page.mjs --dry`, and inserting
// a paragraph above it breaks nothing.
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(HERE, "..", "..", "package.json"));
const { chromium } = require("playwright");

const argv = process.argv.slice(2);
// Git Bash rewrites a leading "/" into a Windows path, so a bare slug is fine too
const route = argv[0] && !argv[0].startsWith("--") ? "/" + argv[0].replace(/^.*[\\/]/, "") : null;
if (!route) {
  console.error("usage: node tools/page-map.mjs /route [--base http://localhost:3000]");
  process.exit(2);
}
const base = (argv.includes("--base") ? argv[argv.indexOf("--base") + 1] : "http://localhost:3000").replace(/\/$/, "");

export async function launch() {
  return chromium.launch().catch(() => {
    const root = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
    const builds = fs.existsSync(root)
      ? fs
          .readdirSync(root)
          .filter((d) => d.startsWith("chromium_headless_shell-"))
          .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
      : [];
    for (const b of builds) {
      const exe = path.join(root, b, "chrome-headless-shell-win64", "chrome-headless-shell.exe");
      if (fs.existsSync(exe)) return chromium.launch({ executablePath: exe });
    }
    throw new Error("no Chromium for Playwright: run `npx playwright install chromium`");
  });
}

const browser = await launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, colorScheme: "dark" });
  const res = await page.goto(base + route, { waitUntil: "load", timeout: 180000 });
  if (!res.ok()) throw new Error(`${base + route} answered ${res.status()}`);
  await page.waitForFunction(() => Object.keys(document.querySelector("#main-content") ?? {}).some((k) => k.startsWith("__react")), null, { timeout: 120000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page.waitForFunction(() => !/loading [a-z ]+…/i.test(document.querySelector("#main-content").textContent), null, { timeout: 20000 }).catch(() => {});
  const out = await page.evaluate(() => {
    // a <Mech> wrapper is display: contents, so it has no box of its own: ask its children
    const vis = (el) => (getComputedStyle(el).display === "contents" ? [...el.children].some(vis) : visBox(el));
    const visBox = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== "hidden";
    const clean = (s) => s.replace(/\s+/g, " ").trim();
    const q = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    // the opening words of a block, short enough to stay stable, long enough to be unique in its section
    const opening = (el, scope, tag) => {
      const words = clean(el.textContent).split(" ");
      for (let n = 4; n <= Math.min(12, words.length); n++) {
        const head = words.slice(0, n).join(" ");
        const same = [...scope.querySelectorAll(`:scope > ${tag}`)].filter((o) => vis(o) && clean(o.textContent).includes(head));
        if (same.length === 1) return head;
      }
      return words.slice(0, 12).join(" ");
    };
    const controls = (el) =>
      [...el.querySelectorAll("button, input, select, [role=slider], [role=tab]")]
        .filter(vis)
        .map((c) => {
          const tag = c.tagName.toLowerCase();
          const name = c.getAttribute("aria-label") || clean(c.textContent).slice(0, 40) || c.getAttribute("name") || c.id || "";
          if (tag === "button" || c.getAttribute("role") === "tab") return `button "${name}"${c.hasAttribute("aria-pressed") ? " [aria-pressed]" : ""}`;
          if (tag === "select") return `select "${name}" (${[...c.options].map((o) => o.value).join(" | ")})`;
          const lab = c.getAttribute("aria-label") || c.closest("label")?.textContent || name;
          return `input[type=${c.type}] "${clean(lab).slice(0, 40)}"${c.type === "range" ? ` ${c.min}..${c.max} step ${c.step}, now ${c.value}` : ""}`;
        });
    const lines = [];
    const head = document.querySelector("#main-content header:has(h1)");
    if (head) {
      lines.push(`TITLE   "${clean(head.querySelector("h1")?.textContent ?? "")}"    #main-content header:has(h1) h1`);
      lines.push(`LEDE    "${clean(head.querySelector(".lesson-lede")?.textContent ?? "").slice(0, 110)}"    #main-content header:has(h1) .lesson-lede`);
      lines.push(`HEADER  the title, lede and "You'll need" list together    #main-content header:has(h1)`);
    }
    for (const sec of document.querySelectorAll("[data-sec]")) {
      const id = sec.id;
      lines.push("", `SECTION #${id}  "${sec.getAttribute("data-sec-label")}"`, `  heading    #${id} > div:first-child`, `  whole      #${id}`);
      const stack = sec.querySelector(":scope > .lesson-stack");
      if (!stack) continue;
      const S = `#${id} > .lesson-stack`;
      for (const el of stack.children) {
        if (!vis(el)) continue;
        const tag = el.tagName.toLowerCase();
        const text = clean(el.textContent);
        const card = el.matches(".code-card") ? el : el.querySelector(".code-card");
        const fig = el.matches("figure, section.module, .module") ? el : el.querySelector("figure, section.module, .module");
        const img = el.matches("img") ? el : el.querySelector("img");
        if (card) {
          const rows = card.querySelectorAll("pre code > div").length;
          const title = clean(card.querySelector("pre")?.previousElementSibling?.textContent ?? "").replace(/Copy code$/, "").trim();
          const first = clean(card.querySelector("pre code > div")?.textContent ?? "").slice(0, 50);
          const sel = title ? `#${id} .code-card:has-text("${q(title.slice(0, 60))}")` : `#${id} .code-card:has-text("${q(first)}")`;
          lines.push(`  CODE  ${rows} lines  "${title || first}"    ${sel}`);
          const body = [...card.querySelectorAll("pre code > div")].map((r, i) => `      ${String(i + 1).padStart(3)}  ${r.textContent.replace(/^\s*\d+/, "").trimEnd().slice(0, 110)}`);
          lines.push(...body.slice(0, 60), ...(body.length > 60 ? [`      ... ${body.length - 60} more lines`] : []));
        } else if (fig) {
          const tagName = clean(fig.querySelector(".module-tag, .micro")?.textContent ?? "");
          const kindSel = fig.matches("figure") ? "figure" : fig.tagName.toLowerCase() + ".module";
          const peers = [...sec.querySelectorAll(kindSel)].filter(vis);
          const capText = clean(fig.querySelector("figcaption")?.textContent ?? "").split(" ").slice(0, 5).join(" ");
          const figSel = peers.length === 1 ? `#${id} ${kindSel}` : capText ? `#${id} ${kindSel}:has-text("${q(capText)}")` : `#${id} ${kindSel} >> nth=${peers.indexOf(fig)}`;
          lines.push(`  INTERACTIVE/FIGURE  "${tagName}"  ${Math.round(fig.getBoundingClientRect().width)}x${Math.round(fig.getBoundingClientRect().height)}    ${figSel}`);
          for (const c of controls(fig)) lines.push(`      control: ${c}`);
          const cap = fig.querySelector("figcaption");
          if (cap) lines.push(`      caption: "${clean(cap.textContent).slice(0, 90)}"`);
        } else if (img && img.alt) {
          lines.push(`  IMAGE  alt "${img.alt.slice(0, 80)}"    #${id} img[alt="${q(img.alt)}"]`);
        } else if (tag === "ol" || tag === "ul") {
          lines.push(`  LIST (${tag}, ${el.children.length} items)    ${S} > ${tag}:has-text("${q(opening(el, stack, tag))}")`);
          [...el.children].filter(vis).forEach((li, i) => lines.push(`      ${i + 1}. "${clean(li.textContent).slice(0, 100)}"    <list selector> > li:has-text("${q(clean(li.textContent).split(" ").slice(0, 4).join(" "))}")`));
        } else if (tag === "table" || el.querySelector("table")) {
          lines.push(`  TABLE  "${text.slice(0, 80)}"    #${id} table`);
        } else if (tag === "p") {
          lines.push(`  P  "${text.slice(0, 150)}${text.length > 150 ? "..." : ""}"    ${S} > p:has-text("${q(opening(el, stack, "p"))}")`);
        } else {
          const kind = el.matches(".split") ? "P+NOTE" : el.getAttribute("role") === "alert" || /alert|watch|note|box/i.test(el.className) ? "ASIDE" : tag.toUpperCase();
          lines.push(`  ${kind}  "${text.slice(0, 130)}${text.length > 130 ? "..." : ""}"    ${S} > ${tag}:has-text("${q(opening(el, stack, tag))}")`);
          const cs = controls(el);
          for (const c of cs.slice(0, 12)) lines.push(`      control: ${c}`);
        }
      }
    }
    return lines.join("\n");
  });
  console.log(`${route}\n${out}`);
} finally {
  await browser.close();
}
