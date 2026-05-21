/**
 * Valibot schemas for GitHub's REST v3 responses we consume.
 *
 * GitHub fields drift over time and the OpenAPI spec describes far more
 * than we use, so each schema is intentionally minimal — exactly the
 * shape the callers in src/components/GitHubPR.tsx and
 * src/components/GitHubPage.tsx actually read. Anything new must be added
 * here before the components can rely on it.
 *
 * `parseOrThrow` keeps the failure path strict: we surface schema
 * mismatches as typed errors instead of letting `undefined.foo` crash at
 * an opaque call site days later.
 */

import * as v from "valibot";

export const GitHubFileStatusSchema = v.picklist([
  "added",
  "modified",
  "removed",
  "renamed",
  "copied",
  "changed",
  "unchanged",
]);

export const GitHubFileSchema = v.object({
  filename: v.string(),
  status: GitHubFileStatusSchema,
  additions: v.number(),
  deletions: v.number(),
  patch: v.optional(v.string()),
  sha: v.string(),
  contents_url: v.string(),
});

export const GitHubFilesArraySchema = v.array(GitHubFileSchema);

export const GitHubPRDataSchema = v.object({
  number: v.number(),
  title: v.string(),
  body: v.nullish(v.string()),
  html_url: v.string(),
  state: v.picklist(["open", "closed"]),
  created_at: v.string(),
  merged_at: v.nullable(v.string()),
  user: v.object({
    login: v.string(),
    avatar_url: v.string(),
  }),
  head: v.object({
    sha: v.string(),
    ref: v.string(),
  }),
  base: v.object({
    sha: v.string(),
    ref: v.string(),
  }),
});

/**
 * Response shape for /repos/{owner}/{repo}/contents/{path}?ref=...
 * Only the fields we currently read.
 */
export const GitHubFileContentSchema = v.object({
  content: v.string(), // base64
  size: v.optional(v.number()),
});

export type GitHubFile = v.InferOutput<typeof GitHubFileSchema>;
export type GitHubPRData = v.InferOutput<typeof GitHubPRDataSchema>;
export type GitHubFileContent = v.InferOutput<typeof GitHubFileContentSchema>;
export type GitHubFileStatus = v.InferOutput<typeof GitHubFileStatusSchema>;

export class GitHubSchemaError extends Error {
  readonly endpoint: string;
  constructor(endpoint: string, issues: readonly v.BaseIssue<unknown>[]) {
    const summary = issues
      .slice(0, 3)
      .map((i) => `${i.path?.map((p) => p.key).join(".") ?? "<root>"}: ${i.message}`)
      .join("; ");
    super(
      `GitHub response from ${endpoint} did not match the expected shape — ${summary}`,
    );
    this.endpoint = endpoint;
    this.name = "GitHubSchemaError";
  }
}

export function parseGitHub<TSchema extends v.GenericSchema>(
  schema: TSchema,
  endpoint: string,
  raw: unknown,
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, raw);
  if (!result.success) {
    throw new GitHubSchemaError(endpoint, result.issues);
  }
  return result.output;
}
