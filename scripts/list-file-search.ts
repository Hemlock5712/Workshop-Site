/**
 * List the documents currently in the Gemini File Search store.
 *
 * Run with:
 *   npx tsx scripts/list-file-search.ts
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

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

async function main() {
  loadEnvLocal();

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const storeName = process.env.GEMINI_FILE_SEARCH_STORE;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY missing");
  if (!storeName) throw new Error("GEMINI_FILE_SEARCH_STORE missing");

  const ai = new GoogleGenAI({ apiKey });

  let count = 0;
  const pager = await ai.fileSearchStores.documents.list({
    parent: storeName,
    config: { pageSize: 20 },
  });
  let page = [...pager.page];
  for (;;) {
    for (const doc of page) {
      count++;
      console.log(
        `${(doc.displayName ?? "<no name>").padEnd(50)} created=${doc.createTime ?? "?"} state=${doc.state ?? "?"}`
      );
    }
    if (!pager.hasNextPage()) break;
    page = await pager.nextPage();
  }
  console.log(`\n${count} documents in ${storeName}`);
}

main().catch((err) => {
  console.error("List failed:", err);
  process.exit(1);
});
