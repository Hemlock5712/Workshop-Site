/**
 * External documentation indexer
 * Scrapes and indexes external docs referenced in workshop
 */

import { ConvexHttpClient } from "convex/browser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { scrapeAllExternalDocs } from "./external-docs-scraper";
import { chunkWorkshopPage, generateContentHash } from "./chunker";
import { generateEmbeddings } from "./embeddings";
import { api } from "../../convex/_generated/api";
import { ALL_EXTERNAL_URLS, getVendorFromUrl } from "./external-docs-urls";

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

interface IndexingOptions {
  convexUrl: string;
  verbose?: boolean;
}

async function indexExternalDocs(options: IndexingOptions) {
  const { convexUrl, verbose = true } = options;

  if (verbose) {
    console.log("🌐 Starting external documentation indexing...\n");
    console.log(`🔗 Convex URL: ${convexUrl}`);
    console.log(`📄 URLs to scrape: ${ALL_EXTERNAL_URLS.length}\n`);
  }

  // Initialize Convex client
  const convex = new ConvexHttpClient(convexUrl);

  try {
    // Step 1: Scrape all external documentation pages
    if (verbose) console.log("🕷️  Step 1: Scraping external documentation...");

    const scrapedPages = await scrapeAllExternalDocs(
      (completed, total, vendor) => {
        if (verbose) {
          process.stdout.write(
            `\r   Progress: ${completed}/${total} (${Math.round((completed / total) * 100)}%) - Current: ${vendor}`
          );
        }
      }
    );

    if (verbose) console.log(`\n   ✓ Scraped ${scrapedPages.length} pages\n`);

    if (scrapedPages.length === 0) {
      console.warn("⚠️  No pages were scraped successfully");
      return { success: false, pagesIndexed: 0, chunksCreated: 0 };
    }

    // Step 2: Chunk the content
    if (verbose) console.log("✂️  Step 2: Chunking content...");
    const allChunks: Array<{
      content: string;
      pageTitle: string;
      pageUrl: string;
      section?: string;
      contentHash: string;
      hasCode: boolean;
      codeLanguage?: string;
      vendor: string;
    }> = [];

    for (const page of scrapedPages) {
      const chunks = chunkWorkshopPage(
        page.content,
        {
          title: page.title,
          url: page.url,
        },
        {
          maxTokens: 800,
          overlap: 100,
          preserveCode: true,
        }
      );

      for (const chunk of chunks) {
        allChunks.push({
          content: chunk.content,
          pageTitle: chunk.pageTitle,
          pageUrl: chunk.pageUrl,
          section: chunk.section || page.section,
          contentHash: generateContentHash(chunk.content),
          hasCode: chunk.metadata.hasCode,
          codeLanguage: chunk.metadata.codeLanguage,
          vendor: getVendorFromUrl(page.url),
        });
      }
    }

    if (verbose) {
      console.log(`   ✓ Created ${allChunks.length} chunks\n`);
      console.log("   Chunks by vendor:");
      const chunksByVendor = allChunks.reduce(
        (acc, chunk) => {
          acc[chunk.vendor] = (acc[chunk.vendor] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      for (const [vendor, count] of Object.entries(chunksByVendor)) {
        console.log(`     ${vendor}: ${count} chunks`);
      }
      console.log();
    }

    // Step 3: Generate embeddings (in batches to avoid rate limits)
    if (verbose) console.log("🧠 Step 3: Generating embeddings...");
    const texts = allChunks.map((chunk) => chunk.content);

    const embeddings = await generateEmbeddings(texts, {
      batchSize: 10,
      delayMs: 200, // Paid tier has much higher limits
      onProgress: (completed, total) => {
        if (verbose) {
          process.stdout.write(
            `\r   Progress: ${completed}/${total} (${Math.round((completed / total) * 100)}%)`
          );
        }
      },
    });

    if (verbose) console.log("\n   ✓ Generated embeddings\n");

    // Step 4: Upload to Convex
    if (verbose) console.log("☁️  Step 4: Uploading to Convex...");

    const chunksWithEmbeddings = allChunks.map((chunk, i) => ({
      content: chunk.content,
      embedding: embeddings[i],
      pageTitle: chunk.pageTitle,
      pageUrl: chunk.pageUrl,
      section: chunk.section,
      contentType: chunk.hasCode ? ("code" as const) : ("explanation" as const),
      sourceType: "docs" as const, // External docs
      language: chunk.codeLanguage,
      contentHash: chunk.contentHash,
    }));

    // Upload in batches of 25 (Convex limitation)
    const BATCH_SIZE = 25;
    let uploaded = 0;

    for (let i = 0; i < chunksWithEmbeddings.length; i += BATCH_SIZE) {
      const batch = chunksWithEmbeddings.slice(i, i + BATCH_SIZE);

      await convex.mutation(api.chunks.upsertChunks, {
        chunks: batch,
      });

      uploaded += batch.length;

      if (verbose) {
        process.stdout.write(
          `\r   Progress: ${uploaded}/${chunksWithEmbeddings.length} chunks`
        );
      }
    }

    if (verbose) console.log("\n   ✓ Upload complete\n");

    // Step 5: Get stats
    const stats = await convex.query(api.chunks.getStats, {});
    if (verbose) {
      console.log("📊 Step 5: Database Stats:");
      console.log(`   Total chunks in database: ${stats.totalChunks}`);
      console.log(`   Unique pages: ${stats.uniquePages}`);
      console.log(`   By source type:`, stats.bySourceType);
      console.log(`   By content type:`, stats.byContentType);
      console.log();
    }

    if (verbose) {
      console.log("✨ External documentation indexing complete!");
      console.log(
        `\n🎯 Indexed ${scrapedPages.length} pages with ${allChunks.length} chunks`
      );
      console.log(
        `📍 View in Convex Dashboard: https://dashboard.convex.dev/d/useful-boar-291\n`
      );
    }

    return {
      success: true,
      pagesIndexed: scrapedPages.length,
      chunksCreated: allChunks.length,
      stats,
    };
  } catch (error) {
    console.error("❌ Error during indexing:", error);
    throw error;
  }
}

// Run if called directly (ESM-compatible check)
const __filename = fileURLToPath(import.meta.url);
const isMainModule =
  process.argv[1] &&
  (__filename === process.argv[1] ||
    __filename === process.argv[1].replace(/\\/g, "/") ||
    import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`);

if (isMainModule) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    console.error("❌ NEXT_PUBLIC_CONVEX_URL environment variable is required");
    process.exit(1);
  }

  indexExternalDocs({
    convexUrl,
    verbose: true,
  }).catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { indexExternalDocs };
