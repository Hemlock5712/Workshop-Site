"""Forced alignment: when each caption word is actually spoken. Called by tools/voice.mjs.

  python align.py <jobs.json>
  jobs.json: [{ "wav": "line.wav", "words": ["Every", "motor", ...] }, ...]
  prints one JSON line: [[[t0, t1] | null, ...], ...]   seconds from the start of each wav

wav2vec2 (torchaudio's WAV2VEC2_ASR_BASE_960H) scores every 20 ms frame against
the letters of the known text, so nothing is transcribed and nothing can be
misheard. A word with no letters in it (a number written as digits) comes back
null and voice.mjs fills it in from its neighbours.
"""

import json
import re
import sys

import torch
import torchaudio
import torchaudio.functional as F

jobs = json.load(open(sys.argv[1], encoding="utf-8"))
bundle = torchaudio.pipelines.WAV2VEC2_ASR_BASE_960H
dev = "cuda" if torch.cuda.is_available() else "cpu"
model = bundle.get_model().to(dev).eval()
index = {c: i for i, c in enumerate(bundle.get_labels())}
BAR = index["|"]

out = []
for job in jobs:
    wav, sr = torchaudio.load(job["wav"])
    wav = F.resample(wav.mean(0, keepdim=True), sr, bundle.sample_rate)
    tokens = []
    owner = []  # which word each token belongs to, -1 for a word boundary
    for wi, word in enumerate(job["words"]):
        letters = [index[c] for c in re.sub(r"[^A-Z']", "", word.upper()) if c in index]
        if not letters:
            continue
        if tokens:
            tokens.append(BAR)
            owner.append(-1)
        tokens += letters
        owner += [wi] * len(letters)
    times = [None] * len(job["words"])
    try:
        with torch.inference_mode():
            emission, _ = model(wav.to(dev))
            emission = torch.log_softmax(emission, dim=-1)
        aligned, scores = F.forced_align(emission, torch.tensor([tokens], device=dev), blank=0)
        spans = F.merge_tokens(aligned[0], scores[0].exp())
        per_frame = wav.size(1) / emission.size(1) / bundle.sample_rate
        for span, wi in zip(spans, owner):
            if wi < 0:
                continue
            t0, t1 = span.start * per_frame, span.end * per_frame
            times[wi] = [t0, t1] if times[wi] is None else [times[wi][0], t1]
    except Exception as e:  # too short to align, or text longer than the audio: keep the estimate
        print(f"align: {job['wav']}: {e}", file=sys.stderr)
        times = [None] * len(job["words"])
    out.append([[round(t[0], 3), round(t[1], 3)] if t else None for t in times])

print(json.dumps(out))
