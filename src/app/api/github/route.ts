import { NextRequest, NextResponse } from "next/server";

/**
 * The one path between this site and the GitHub API.
 *
 * Every code embed used to call `api.github.com` straight from the browser.
 * GitHub's anonymous limit is 60 requests an hour **per IP**, and this site's
 * actual usage scene is twenty students in one room behind one school NAT,
 * walking eighteen lesson pages that carry twenty-four embeds between them —
 * with the PR embeds issuing two more requests per changed file. The quota was
 * gone before the first lesson finished, and every embed on every laptop then
 * rendered the rate-limit error card. The failure landed precisely on the day
 * the workshop was being run.
 *
 * Routing through the server fixes it twice over:
 *
 *   - One shared cache. `s-maxage` means the whole room is one upstream
 *     request per file per hour rather than one per student per page view.
 *   - One place to put a token. `GITHUB_TOKEN` lifts the ceiling from 60/hr to
 *     5,000/hr; the route works without it, just with less headroom.
 *
 * This is deliberately not a general proxy. Three named resources, one
 * allowlisted repository, and everything else is a 400 — an `?url=` passthrough
 * would let anyone use this deployment as an anonymous relay for the whole
 * GitHub API, on our IP and with our token attached.
 */

/** The only repository any embed on this site is allowed to read. */
const ALLOWED_REPOS = new Set(["Hemlock5712/Workshop-Code"]);

/** An hour on the CDN, then a day of stale-while-revalidate. The teaching
 *  branches are rewritten a few times a year, so an hour is conservative. */
const MAX_AGE = 3600;
const SWR = 86400;

const GITHUB = "https://api.github.com";

function upstreamHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Workshop-Site",
  };
  // Optional. Set it in Vercel to raise the shared ceiling; without it the
  // route still works, and the cache above is what actually does the work.
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Builds the upstream URL for one of the three shapes an embed can ask for.
 * Returns null for anything else, which is how the allowlist is enforced.
 */
function resolveUpstream(params: URLSearchParams): string | null {
  const repo = params.get("repo");
  if (!repo || !ALLOWED_REPOS.has(repo)) return null;

  switch (params.get("resource")) {
    case "file": {
      const path = params.get("path");
      const ref = params.get("ref");
      // No `..` and no leading slash: the repo is fixed, but a traversal would
      // still let a caller walk out of `contents/` into another API surface.
      if (!path || !ref || path.includes("..") || path.startsWith("/")) {
        return null;
      }
      const encoded = path.split("/").map(encodeURIComponent).join("/");
      return `${GITHUB}/repos/${repo}/contents/${encoded}?ref=${encodeURIComponent(ref)}`;
    }
    case "pr": {
      const number = params.get("number");
      if (!number || !/^\d+$/.test(number)) return null;
      return `${GITHUB}/repos/${repo}/pulls/${number}`;
    }
    case "pr-files": {
      const number = params.get("number");
      if (!number || !/^\d+$/.test(number)) return null;
      return `${GITHUB}/repos/${repo}/pulls/${number}/files?per_page=100`;
    }
    default:
      return null;
  }
}

export async function GET(req: NextRequest) {
  const upstream = resolveUpstream(req.nextUrl.searchParams);
  if (!upstream) {
    return bad("Unsupported resource, repository, or parameters.");
  }

  try {
    const response = await fetch(upstream, {
      headers: upstreamHeaders(),
      next: { revalidate: MAX_AGE },
    });

    if (!response.ok) {
      // Pass the status through so the client can tell "not found" (a bad path
      // in a lesson, which is our bug) from 403 (rate limited, which clears).
      return NextResponse.json(
        { error: `GitHub returned ${response.status} ${response.statusText}` },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    return NextResponse.json(await response.json(), {
      headers: {
        "Cache-Control": `public, s-maxage=${MAX_AGE}, stale-while-revalidate=${SWR}`,
      },
    });
  } catch (error) {
    console.error("GitHub proxy error:", upstream, error);
    return NextResponse.json(
      { error: "Could not reach GitHub." },
      { status: 502 }
    );
  }
}
