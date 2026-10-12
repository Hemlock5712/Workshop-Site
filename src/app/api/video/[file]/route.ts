import type { NextRequest } from "next/server";

/**
 * Serves the lesson videos from the `video-series` release as playable video.
 *
 * `/video` used to point each `<video>` straight at the release download URL.
 * That played on a desktop and not on an iPhone, because the release download
 * is not a video response. GitHub answers it with a 302 to a signed blob URL,
 * and the signature pins two headers on the blob's answer:
 *
 *   Content-Type: application/octet-stream
 *   Content-Disposition: attachment; filename=hardware.mp4
 *
 * The asset was uploaded as `video/mp4` and GitHub's API still says so; the
 * download rewrites it regardless. Chrome sniffs the bytes and plays an MP4
 * whatever the header says. Safari's player goes by the declared type, and
 * the redirect target has no `.mp4` on its path to fall back on. Every iOS
 * browser is Safari underneath, so none of them played it. The headers are
 * part of the signed URL, so there is no way to ask GitHub for different ones.
 *
 * This route fetches the same asset server side and answers with the type
 * Safari needs. It forwards `Range` and passes the `206` and its byte headers
 * back, because Safari will not play a video from a server that cannot answer
 * a range request. Each request follows GitHub's redirect afresh, so the
 * short-lived signed URL never reaches the browser and never goes stale under
 * a paused video.
 *
 * The cost is that every video byte now passes through a Vercel Function
 * rather than going browser-to-GitHub. That is fine while `/video` is an
 * unlinked preview. When the videos go on the lesson pages, move them to a
 * host that serves `video/mp4` itself, such as Vercel Blob, and delete this.
 *
 * Like `api/github`, this is not a general proxy: one release, `.mp4` names
 * only, nothing else.
 */

const SERIES =
  "https://github.com/Hemlock5712/Workshop-Site/releases/download/video-series";

/** Lesson ids are kebab-case, so this also rules out `..` and `/`. */
const FILE = /^[a-z0-9-]+\.mp4$/;

/** The byte-range headers a player needs back. Everything else from the blob
 *  store, its own Content-Type and Content-Disposition above all, is dropped. */
const PASS_THROUGH = ["content-length", "content-range", "accept-ranges"];

async function serve(
  req: NextRequest,
  params: Promise<{ file: string }>,
  method: "GET" | "HEAD"
) {
  const { file } = await params;
  if (!FILE.test(file)) {
    return new Response(null, { status: 404 });
  }

  const headers: Record<string, string> = {
    "User-Agent": "Workshop-Site",
    // A compressed body would no longer match Content-Length or the range.
    "Accept-Encoding": "identity",
  };
  const range = req.headers.get("range");
  if (range) headers.Range = range;

  let upstream: Response;
  try {
    // Always GET. The signed blob URL answers HEAD with 401, so a HEAD here
    // asks for the body and drops it below.
    upstream = await fetch(`${SERIES}/${file}`, {
      headers,
      cache: "no-store",
      // A player cancels a range request as soon as it has buffered enough.
      // Passing the signal on stops the upstream download at the same time.
      signal: req.signal,
    });
  } catch (error) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    console.error("Video proxy error:", file, error);
    return new Response(null, { status: 502 });
  }

  // 416 is a range past the end. It carries `Content-Range: bytes */size`,
  // which is how a player learns the length, so it passes through too.
  if (![200, 206, 416].includes(upstream.status)) {
    await upstream.body?.cancel();
    return new Response(null, {
      status: upstream.status === 404 ? 404 : 502,
    });
  }

  const out = new Headers({
    "Content-Type": "video/mp4",
    "Content-Disposition": `inline; filename="${file}"`,
    // Not cached anywhere. The CDN would key a 206 on the URL alone and hand
    // one viewer's byte range to the next, and a browser stitching cached
    // ranges together needs If-Range, which the blob store ignores. A video
    // re-uploaded with `--clobber` would then play half old, half new.
    "Cache-Control": "no-store",
  });
  for (const name of PASS_THROUGH) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }

  if (method === "HEAD" || upstream.status === 416) {
    await upstream.body?.cancel();
    if (upstream.status === 416) out.delete("content-length");
    return new Response(null, { status: upstream.status, headers: out });
  }
  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  return serve(req, params, "GET");
}

export function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  return serve(req, params, "HEAD");
}
