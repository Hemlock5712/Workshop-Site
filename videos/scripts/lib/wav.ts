// Minimal WAV helpers for the trailer pipeline: PCM16 mono encode (whoosh SFX,
// whisper temp files) and linear resampling (Kokoro's 24 kHz → whisper's 16 kHz).

export function encodePcm16Wav(
  samples: Float32Array,
  sampleRate: number
): Buffer {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

/** Decode a mono PCM16 WAV produced by encodePcm16Wav (44-byte canonical header). */
export function decodePcm16Wav(buffer: Buffer): {
  samples: Float32Array;
  sampleRate: number;
} {
  const sampleRate = buffer.readUInt32LE(24);
  const dataBytes = buffer.readUInt32LE(40);
  const count = Math.min(dataBytes, buffer.length - 44) / 2;
  const samples = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    samples[i] = buffer.readInt16LE(44 + i * 2) / 32767;
  }
  return { samples, sampleRate };
}

export function linearResample(
  samples: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) return samples;
  const outLength = Math.floor((samples.length * toRate) / fromRate);
  const out = new Float32Array(outLength);
  const ratio = fromRate / toRate;
  for (let i = 0; i < outLength; i++) {
    const pos = i * ratio;
    const left = Math.floor(pos);
    const right = Math.min(left + 1, samples.length - 1);
    const frac = pos - left;
    out[i] = samples[left] * (1 - frac) + samples[right] * frac;
  }
  return out;
}

/**
 * A short filtered-noise whoosh for camera moves: white noise through a
 * one-pole lowpass whose cutoff sweeps down, under a sine-shaped envelope.
 */
export function synthWhoosh(
  sampleRate = 24000,
  durationSec = 0.55
): Float32Array {
  const length = Math.round(sampleRate * durationSec);
  const out = new Float32Array(length);
  let lowpassed = 0;
  // Deterministic noise so re-running prepare doesn't dirty the file.
  let seed = 0x2545f491;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff - 0.5;
  };

  let peak = 0;
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const cutoff = 2400 * Math.pow(0.1, t) + 140;
    const alpha = 1 - Math.exp((-2 * Math.PI * cutoff) / sampleRate);
    lowpassed += alpha * (rand() * 2 - lowpassed);
    const envelope = Math.pow(Math.sin(Math.PI * t), 1.6);
    out[i] = lowpassed * envelope;
    peak = Math.max(peak, Math.abs(out[i]));
  }
  if (peak > 0) {
    const gain = 0.45 / peak;
    for (let i = 0; i < length; i++) out[i] *= gain;
  }
  return out;
}
