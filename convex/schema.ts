import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chunks: defineTable({
    // Content
    content: v.string(),

    // Vector embedding (3072 dimensions for gemini-embedding-001)
    embedding: v.array(v.float64()),

    // Metadata
    pageTitle: v.string(),
    pageUrl: v.string(),
    section: v.optional(v.string()),
    contentType: v.union(
      v.literal("explanation"),
      v.literal("code"),
      v.literal("concept"),
      v.literal("example")
    ),

    // Learning sequence metadata
    sequencePosition: v.optional(v.number()),
    prerequisites: v.optional(v.array(v.string())),

    // Source tracking
    sourceType: v.union(
      v.literal("workshop"),
      v.literal("docs"),
      v.literal("code")
    ),

    // For code chunks
    language: v.optional(v.string()),
    filePath: v.optional(v.string()),
    githubUrl: v.optional(v.string()),

    // Content hash for incremental updates
    contentHash: v.string(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 3072,
      filterFields: ["sourceType", "pageUrl", "contentType"],
    })
    .index("by_page", ["pageUrl"])
    .index("by_content_hash", ["contentHash"]),
});
