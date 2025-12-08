/**
 * Test script to verify Gemini embedding + Convex vector search pipeline
 */

import { GoogleGenAI } from "@google/genai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
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

async function testPipeline() {
  console.log("🧪 Testing Gemini → Convex Pipeline\n");

  // Check environment variables
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://grand-chihuahua-33.convex.cloud";

  if (!apiKey) {
    console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY not set");
    process.exit(1);
  }
  console.log("✅ Gemini API key found");

  if (!convexUrl) {
    console.error("❌ NEXT_PUBLIC_CONVEX_URL not set");
    process.exit(1);
  }
  console.log(`✅ Convex URL: ${convexUrl}\n`);

  // Test 1: Generate embedding with gemini-embedding-001
  console.log("📝 Test 1: Generating embedding with gemini-embedding-001...");
  const genAI = new GoogleGenAI({ apiKey });

  try {
    const result = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: "How do I set up PID control for a motor?",
    });

    const embedding = result.embeddings?.[0]?.values || [];
    console.log(`   ✅ Generated embedding with ${embedding.length} dimensions`);

    if (embedding.length !== 3072) {
      console.error(`   ⚠️  Warning: Expected 3072 dimensions, got ${embedding.length}`);
    }

    // Test 2: Query Convex vector database
    console.log("\n🔍 Test 2: Querying Convex vector database...");
    const convex = new ConvexHttpClient(convexUrl);

    const results = await convex.action(api.chunks.vectorSearch, {
      embedding,
      limit: 3,
    });

    if (results && results.length > 0) {
      console.log(`   ✅ Found ${results.length} results:\n`);
      results.forEach((result: any, i: number) => {
        console.log(`   ${i + 1}. ${result.pageTitle} (${result.pageUrl})`);
        console.log(`      Score: ${result.score?.toFixed(4)}`);
        console.log(`      Content: ${result.content?.substring(0, 100)}...\n`);
      });
    } else {
      console.log("   ⚠️  No results found. Is the database indexed?");
    }

    console.log("✅ Pipeline test complete!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testPipeline();
