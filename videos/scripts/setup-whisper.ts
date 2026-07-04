// One-time, optional: install whisper.cpp + the base.en model into
// videos/.whisper so `pnpm trailer:audio` can refine word timings to true
// word-level accuracy. Everything still works without this — timings fall
// back to sentence-anchored estimates.
//
//   pnpm --filter @gray-matter/videos whisper:setup

import { join, resolve } from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
} from "@remotion/install-whisper-cpp";
import {
  WHISPER_DIR_NAME,
  WHISPER_MODEL,
  WHISPER_VERSION,
} from "./lib/whisper";

const WHISPER_DIR = join(resolve(__dirname, ".."), WHISPER_DIR_NAME);

async function main() {
  console.log(
    `Installing whisper.cpp ${WHISPER_VERSION} into ${WHISPER_DIR}...`
  );
  await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION });
  console.log(`Downloading model "${WHISPER_MODEL}" (~150MB, cached)...`);
  await downloadWhisperModel({ folder: WHISPER_DIR, model: WHISPER_MODEL });
  console.log(
    "Done. Re-run `pnpm trailer:audio` to regenerate with word-level timings."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
