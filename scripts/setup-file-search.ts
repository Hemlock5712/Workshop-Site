/**
 * One-time setup: create a Gemini File Search store for the workshop.
 *
 * Run with:
 *   npx tsx scripts/setup-file-search.ts
 *
 * Reads GOOGLE_GENERATIVE_AI_API_KEY from .env.local.
 * Prints the store name to add to .env.local as GEMINI_FILE_SEARCH_STORE.
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
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not set in .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  const displayName = "gray-matter-workshop";

  console.log(`Creating File Search store: ${displayName}...`);

  const store = await ai.fileSearchStores.create({
    config: {
      displayName,
    },
  });

  console.log("\nStore created:");
  console.log(`  name:        ${store.name}`);
  console.log(`  displayName: ${store.displayName}`);

  console.log("\nAdd this to .env.local:");
  console.log(`  GEMINI_FILE_SEARCH_STORE=${store.name}\n`);
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
