/**
 * Simple test for gemini-3-pro-preview
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

async function test() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API key found");
    process.exit(1);
  }

  console.log("🧪 Testing gemini-3-pro-preview...\n");

  const client = new GoogleGenAI({ apiKey });

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Explain how AI works in a few words",
    });

    console.log("✅ Response:", response.text);
  } catch (error: any) {
    console.error("❌ Error:", error.message || error);
    if (error.status) {
      console.error("   Status:", error.status);
    }
  }
}

test();
