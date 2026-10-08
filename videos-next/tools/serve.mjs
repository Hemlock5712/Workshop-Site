#!/usr/bin/env node
// Static server for videos-next/. ES modules do not load over file://.
//   node tools/serve.mjs [port]      then open http://localhost:<port>/lessons/latched/
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".png": "image/png" };

export function serve(port = 0) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    const stat = fs.statSync(file);
    const type = TYPES[path.extname(file)] ?? "application/octet-stream";
    // range requests, so <audio> can seek
    const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = Number(range[1] || 0);
      const end = range[2] ? Number(range[2]) : stat.size - 1;
      res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size, "Accept-Ranges": "bytes", "Cache-Control": "no-store" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(port, "127.0.0.1", () => r(server)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const s = await serve(Number(process.argv[2] ?? 5180));
  console.log(`videos-next on http://localhost:${s.address().port}/lessons/`);
}
