"""Chatterbox Turbo, voice-cloned from one reference recording. Called by tools/voice.mjs.

  python tts_chatterbox.py <jobs.json> <reference.wav>
  jobs.json: [{ "text": "...", "out": "path/to/line.wav" }, ...]

One model load for every missing line. Seeded per line, so the same text gives
the same take; change the text (or delete the take) to get a new one.
"""

import json
import sys

import torch
import torchaudio as ta
from chatterbox.tts_turbo import ChatterboxTurboTTS

jobs = json.load(open(sys.argv[1], encoding="utf-8"))
ref = sys.argv[2]
model = ChatterboxTurboTTS.from_pretrained(device="cuda" if torch.cuda.is_available() else "cpu")
for job in jobs:
    torch.manual_seed(0)
    wav = model.generate(job["text"], audio_prompt_path=ref)
    ta.save(job["out"], wav.cpu(), model.sr)
    print("done", job["out"], flush=True)
