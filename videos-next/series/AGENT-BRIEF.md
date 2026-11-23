# Brief for an agent building one page-driven lesson video

You are building one narrated lesson video for the Gray Matter Workshop site
(FRC robot programming lessons for ages 11 to 18), using the page-driven
process, where the real lesson page is filmed. You were given a lesson id,
written `<id>` below. Its page is `/<id>` and its source is
`../src/app/(workshop)/<id>/page.tsx`.

Run every command from `videos-next/`
(Git Bash: `cd /c/Users/joeoj/Downloads/Workshop-Site-1/videos-next`).

Follow `series/PAGE-BUILD.md` exactly. It is the whole contract: what to read,
the script format, the cue format, the checks, and what to report. Read it
first. `lessons/pid-control/page.json` with the `pid-control` entry in
`series/series.json` is a finished example.

The only files you may create or change:

- `series/drafts/<id>.json`
- `lessons/<id>/page.json`
- `lessons/<id>/script.json`, written by `node tools/series.mjs --emit-draft <id>`.
  Overwriting an existing one is expected.
- contact sheets under `out/`

Hard limits:

- Do not edit anything under `../src/`, `engine/`, `tools/`,
  `series/series.json`, `series/PAGE-BUILD.md`, or any other lesson's folder.
- Do not start, stop or restart any server. One is already running on
  http://localhost:3000 and other agents are using it, so a slow first page
  load is normal.
- Do not run `tools/voice.mjs`, do not render an MP4, do not commit.
- If a tool misbehaves, work around it and report the exact error. Do not fix
  the tool. The line `note: Playwright's own Chromium is not installed, using
chromium_headless_shell-...` is harmless.

Finish with the report PAGE-BUILD.md asks for.
