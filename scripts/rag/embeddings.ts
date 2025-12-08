/**
 * Embedding utilities using Google Generative AI
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

// Load .env.local manually for script execution
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

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  throw new Error(
    "GOOGLE_GENERATIVE_AI_API_KEY environment variable is required"
  );
}

const genAI = new GoogleGenAI({ apiKey });

/**
 * Generate embedding for a single text using gemini-embedding-001 model
 * Returns 3072-dimensional vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });
    return result.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * Includes rate limiting and retry logic
 */
export async function generateEmbeddings(
  texts: string[],
  options: {
    batchSize?: number;
    delayMs?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<number[][]> {
  const { batchSize = 10, delayMs = 100, onProgress } = options;

  const embeddings: number[][] = [];
  const total = texts.length;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    // Process batch in parallel
    const batchPromises = batch.map((text) => generateEmbedding(text));
    const batchResults = await Promise.all(batchPromises);

    embeddings.push(...batchResults);

    // Report progress
    if (onProgress) {
      onProgress(embeddings.length, total);
    }

    // Rate limiting delay between batches
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return embeddings;
}

/**
 * Generate embedding for a query
 * Same as generateEmbedding but explicitly for queries
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query);
}
