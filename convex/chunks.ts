import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";

// Expected embedding dimension for gemini-embedding-001
const EXPECTED_EMBEDDING_DIM = 3072;

/**
 * Validates that an embedding is valid before DB operations
 * @param embedding - The embedding array to validate
 * @returns Error message if invalid, null if valid
 */
function isValidEmbedding(embedding: number[]): string | null {
  if (!Array.isArray(embedding)) {
    return "Embedding must be an array";
  }
  if (embedding.length !== EXPECTED_EMBEDDING_DIM) {
    return `Embedding must have ${EXPECTED_EMBEDDING_DIM} dimensions, got ${embedding.length}`;
  }
  if (!embedding.every((val) => Number.isFinite(val))) {
    return "All embedding values must be finite numbers";
  }
  return null;
}

// Internal upsert for batch operations
export const internalUpsertChunk = internalMutation({
  args: {
    content: v.string(),
    embedding: v.array(v.float64()),
    pageTitle: v.string(),
    pageUrl: v.string(),
    section: v.optional(v.string()),
    contentType: v.union(
      v.literal("explanation"),
      v.literal("code"),
      v.literal("concept"),
      v.literal("example")
    ),
    sequencePosition: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.string())),
    sourceType: v.union(
      v.literal("workshop"),
      v.literal("docs"),
      v.literal("code")
    ),
    language: v.optional(v.string()),
    filePath: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    contentHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate embedding before any DB operations
    const validationError = isValidEmbedding(args.embedding);
    if (validationError) {
      throw new Error(`Invalid embedding: ${validationError}`);
    }

    // Check if chunk already exists
    const existing = await ctx.db
      .query("chunks")
      .withIndex("by_content_hash", (q) =>
        q.eq("contentHash", args.contentHash)
      )
      .first();

    const timestamp = Date.now();

    if (existing) {
      // Update existing chunk
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: timestamp,
      });
      return { action: "updated", id: existing._id };
    } else {
      // Insert new chunk
      const id = await ctx.db.insert("chunks", {
        ...args,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return { action: "inserted", id };
    }
  },
});

// Upsert a chunk (insert or update based on contentHash)
export const upsertChunk = mutation({
  args: {
    content: v.string(),
    embedding: v.array(v.float64()),
    pageTitle: v.string(),
    pageUrl: v.string(),
    section: v.optional(v.string()),
    contentType: v.union(
      v.literal("explanation"),
      v.literal("code"),
      v.literal("concept"),
      v.literal("example")
    ),
    sequencePosition: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.string())),
    sourceType: v.union(
      v.literal("workshop"),
      v.literal("docs"),
      v.literal("code")
    ),
    language: v.optional(v.string()),
    filePath: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    contentHash: v.string(),
  },
  handler: async (ctx, args): Promise<{ action: string; id: any }> => {
    // Validate embedding before any DB operations
    const validationError = isValidEmbedding(args.embedding);
    if (validationError) {
      throw new Error(`Invalid embedding: ${validationError}`);
    }

    // Inline the upsert logic (cannot use ctx.runMutation inside a mutation)
    const existing = await ctx.db
      .query("chunks")
      .withIndex("by_content_hash", (q) =>
        q.eq("contentHash", args.contentHash)
      )
      .first();

    const timestamp = Date.now();

    if (existing) {
      // Update existing chunk
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: timestamp,
      });
      return { action: "updated", id: existing._id };
    } else {
      // Insert new chunk
      const id = await ctx.db.insert("chunks", {
        ...args,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return { action: "inserted", id };
    }
  },
});

// Batch upsert multiple chunks
export const upsertChunks = mutation({
  args: {
    chunks: v.array(
      v.object({
        content: v.string(),
        embedding: v.array(v.float64()),
        pageTitle: v.string(),
        pageUrl: v.string(),
        section: v.optional(v.string()),
        contentType: v.union(
          v.literal("explanation"),
          v.literal("code"),
          v.literal("concept"),
          v.literal("example")
        ),
        sequencePosition: v.optional(v.number()),
        prerequisites: v.optional(v.array(v.string())),
        sourceType: v.union(
          v.literal("workshop"),
          v.literal("docs"),
          v.literal("code")
        ),
        language: v.optional(v.string()),
        filePath: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        contentHash: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: Array<{ action: string; id: any }> = [];
    for (const chunk of args.chunks) {
      // Validate embedding before any DB operations
      const validationError = isValidEmbedding(chunk.embedding);
      if (validationError) {
        throw new Error(`Invalid embedding in batch: ${validationError}`);
      }

      // Inline the upsert logic (cannot use ctx.runMutation inside a mutation)
      const existing = await ctx.db
        .query("chunks")
        .withIndex("by_content_hash", (q) =>
          q.eq("contentHash", chunk.contentHash)
        )
        .first();

      const timestamp = Date.now();

      if (existing) {
        // Update existing chunk
        await ctx.db.patch(existing._id, {
          ...chunk,
          updatedAt: timestamp,
        });
        results.push({ action: "updated", id: existing._id });
      } else {
        // Insert new chunk
        const id = await ctx.db.insert("chunks", {
          ...chunk,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        results.push({ action: "inserted", id });
      }
    }
    return results;
  },
});

// Internal query to fetch full documents by IDs
export const fetchChunksByIds = internalQuery({
  args: { ids: v.array(v.id("chunks")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc !== null) {
        results.push(doc);
      }
    }
    return results;
  },
});

// Vector search action (must be an action, not a query)
export const vectorSearch = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
    sourceType: v.optional(
      v.union(v.literal("workshop"), v.literal("docs"), v.literal("code"))
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Perform vector search
    const searchResults = await ctx.vectorSearch("chunks", "by_embedding", {
      vector: args.embedding,
      limit: limit,
      ...(args.sourceType && {
        filter: (q) => q.eq("sourceType", args.sourceType!),
      }),
    });

    // Fetch full documents
    const chunks: Array<any> = await ctx.runQuery(
      internal.chunks.fetchChunksByIds,
      {
        ids: searchResults.map((result) => result._id),
      }
    );

    // Build ID-based lookup to avoid index misalignment
    const chunkMap = new Map(chunks.map((chunk: any) => [chunk._id, chunk]));

    // Combine with scores using ID lookup
    return searchResults
      .map((result) => {
        const chunk = chunkMap.get(result._id);
        if (!chunk) return null; // Skip missing chunks
        return {
          _id: chunk._id,
          content: chunk.content,
          pageTitle: chunk.pageTitle,
          pageUrl: chunk.pageUrl,
          section: chunk.section,
          contentType: chunk.contentType,
          sourceType: chunk.sourceType,
          language: chunk.language,
          filePath: chunk.filePath,
          githubUrl: chunk.githubUrl,
          score: result._score,
        };
      })
      .filter((item) => item !== null); // Remove nulls from missing chunks
  },
});

// Get chunk by page URL
export const getChunksByPage = query({
  args: {
    pageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chunks")
      .withIndex("by_page", (q) => q.eq("pageUrl", args.pageUrl))
      .collect();
  },
});

// Get stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allChunks = await ctx.db.query("chunks").collect();

    const bySourceType = allChunks.reduce(
      (acc, chunk) => {
        acc[chunk.sourceType] = (acc[chunk.sourceType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byContentType = allChunks.reduce(
      (acc, chunk) => {
        acc[chunk.contentType] = (acc[chunk.contentType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalChunks: allChunks.length,
      bySourceType,
      byContentType,
      uniquePages: new Set(allChunks.map((c) => c.pageUrl)).size,
    };
  },
});

// Clear all chunks (internal only - use with caution - for re-indexing)
export const clearAllChunks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allChunks = await ctx.db.query("chunks").collect();
    let deletedCount = 0;

    for (const chunk of allChunks) {
      await ctx.db.delete(chunk._id);
      deletedCount++;
    }

    return {
      message: `Deleted ${deletedCount} chunks`,
      deletedCount,
    };
  },
});
