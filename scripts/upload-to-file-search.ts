/**
 * Upload workshop pages to the Gemini File Search store.
 *
 * Run with:
 *   npx tsx scripts/upload-to-file-search.ts            # add pages to the store
 *   npx tsx scripts/upload-to-file-search.ts --replace  # purge existing docs first
 *
 * Scans src/app/(workshop)/ for page.tsx files, extracts the human-readable
 * text content, and uploads one file per page to the File Search store.
 *
 * Uploads always ADD documents — re-running without --replace leaves the old
 * versions in the store alongside the new ones. Use --replace whenever page
 * content has changed.
 *
 * File Search handles chunking + embedding internally.
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import os from "os";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found");
  }
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, "$1");
      if (key) process.env[key] = value;
    }
  });
}

function extractTextFromTSX(tsxContent: string): string {
  let content = tsxContent;
  content = content.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");
  content = content.replace(/^export\s+(default\s+)?.*$/gm, "");

  const seen = new Set<string>();
  const out: string[] = [];

  const stringRegex = /["'`]([^"'`]+)["'`]/g;
  let m: RegExpExecArray | null;
  while ((m = stringRegex.exec(content)) !== null) {
    if (m[1].length > 20 && !seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }

  const jsxTextRegex = />([^<>{}]+)</g;
  while ((m = jsxTextRegex.exec(content)) !== null) {
    const text = m[1].trim();
    if (text.length > 10 && !text.match(/^[a-z-]+$/) && !seen.has(text)) {
      seen.add(text);
      out.push(text);
    }
  }

  const tplRegex = /`([^`]+)`/g;
  while ((m = tplRegex.exec(content)) !== null) {
    if (m[1].length > 20 && !seen.has(m[1])) {
      seen.add(m[1]);
      out.push(m[1]);
    }
  }

  return out.join("\n\n").trim();
}

function titleFromSlug(slug: string): string {
  if (slug === "") return "Home";
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function discoverWorkshopPages(): Array<{
  slug: string;
  url: string;
  title: string;
  filePath: string;
}> {
  const workshopDir = path.join(process.cwd(), "src/app/(workshop)");
  const pages: Array<{
    slug: string;
    url: string;
    title: string;
    filePath: string;
  }> = [];

  const rootPage = path.join(workshopDir, "page.tsx");
  if (fs.existsSync(rootPage)) {
    pages.push({ slug: "", url: "/", title: "Home", filePath: rootPage });
  }

  for (const entry of fs.readdirSync(workshopDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("(") || entry.name.startsWith("_")) continue;
    if (entry.name === "ai-assistant" || entry.name === "search") continue;

    const pageFile = path.join(workshopDir, entry.name, "page.tsx");
    if (fs.existsSync(pageFile)) {
      pages.push({
        slug: entry.name,
        url: `/${entry.name}`,
        title: titleFromSlug(entry.name),
        filePath: pageFile,
      });
    }
  }

  return pages;
}

async function waitForOperation(
  ai: GoogleGenAI,
  initial: Awaited<
    ReturnType<typeof ai.fileSearchStores.uploadToFileSearchStore>
  >,
  timeoutMs = 120000
): Promise<void> {
  let op = initial;
  const start = Date.now();
  while (!op.done) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Upload operation timed out");
    }
    await new Promise((r) => setTimeout(r, 2000));
    op = await ai.operations.get({ operation: op });
  }
  if (op.error) {
    throw new Error(`Upload error: ${JSON.stringify(op.error)}`);
  }
}

async function purgeStore(ai: GoogleGenAI, storeName: string): Promise<void> {
  console.log("Purging existing documents...");
  let deleted = 0;
  // Delete-and-relist until the store is empty; the list API caps pages at 20.
  for (;;) {
    const pager = await ai.fileSearchStores.documents.list({
      parent: storeName,
      config: { pageSize: 20 },
    });
    const docs = [...pager.page];
    if (docs.length === 0) break;
    for (const doc of docs) {
      if (!doc.name) continue;
      await ai.fileSearchStores.documents.delete({
        name: doc.name,
        config: { force: true },
      });
      deleted++;
      console.log(`  ✗ deleted ${doc.displayName ?? doc.name}`);
    }
  }
  console.log(`Purged ${deleted} documents.\n`);
}

async function main() {
  loadEnvLocal();

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const storeName = process.env.GEMINI_FILE_SEARCH_STORE;

  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY missing");
  if (!storeName) throw new Error("GEMINI_FILE_SEARCH_STORE missing");

  const ai = new GoogleGenAI({ apiKey });

  if (process.argv.includes("--replace")) {
    await purgeStore(ai, storeName);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "workshop-upload-"));

  const pages = discoverWorkshopPages();
  console.log(`Discovered ${pages.length} workshop pages\n`);

  let uploaded = 0;
  let failed = 0;

  for (const page of pages) {
    try {
      const tsx = fs.readFileSync(page.filePath, "utf-8");
      const text = extractTextFromTSX(tsx);

      if (text.length < 100) {
        console.log(
          `  ⊘ skipping ${page.url} (too short: ${text.length} chars)`
        );
        continue;
      }

      const fileContent = `# ${page.title}\nURL: ${page.url}\n\n${text}`;
      const tmpFile = path.join(tmpDir, `${page.slug || "home"}.txt`);
      fs.writeFileSync(tmpFile, fileContent, "utf-8");

      const op = await ai.fileSearchStores.uploadToFileSearchStore({
        file: tmpFile,
        fileSearchStoreName: storeName,
        config: {
          displayName: `${page.title} (${page.url})`,
        },
      });

      await waitForOperation(ai, op);
      uploaded++;
      console.log(
        `  ✓ ${page.url.padEnd(28)} ${text.length.toString().padStart(5)} chars`
      );
    } catch (err) {
      failed++;
      console.error(
        `  ✗ ${page.url}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(
    `\nDone. Uploaded ${uploaded}, failed ${failed}, total ${pages.length}.`
  );
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
