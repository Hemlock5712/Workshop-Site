/**
 * Test multiple Gemini models
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// Load .env.local manually
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["'](.*)["']$/, "$1");
        process.env[key] = value;
      }
    });
  }
}

loadEnvLocal();

const models = [
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
];

async function testModel(client: GoogleGenAI, model: string) {
  try {
    const response = await client.models.generateContent({
      model,
      contents: "Say 'hello' and nothing else",
    });
    console.log(`✅ ${model}: ${response.text?.trim()}`);
    return true;
  } catch (error: any) {
    console.log(`❌ ${model}: ${error.message?.substring(0, 60) || error}`);
    return false;
  }
}

async function test() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API key found");
    process.exit(1);
  }

  console.log("🧪 Testing Gemini models...\n");

  const client = new GoogleGenAI({ apiKey });

  for (const model of models) {
    await testModel(client, model);
  }
}

test();
