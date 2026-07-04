import { contentHash } from "./hash";
import type {
  Beat,
  EventAnchor,
  Rect,
  TimelineBeat,
  TrailerEvent,
  TrailerScript,
  TrailerTimeline,
} from "./types";

// ---------------------------------------------------------------------------
// Resolving: join the authored script with the generated audio timeline into
// absolute frame numbers for beats, events, and camera keyframes.
// ---------------------------------------------------------------------------

export interface ResolvedBeat extends TimelineBeat {
  index: number;
  startFrame: number;
  scriptBeat: Beat;
  /** Narration text changed since the audio was generated. */
  stale: boolean;
}

export interface ResolvedEvent {
  frame: number;
  event: TrailerEvent;
}

export interface ResolvedTimeline {
  fps: number;
  totalDurationInFrames: number;
  beats: ResolvedBeat[];
  events: ResolvedEvent[];
  stale: boolean;
  musicFile: string | null;
  whooshFile: string | null;
}

/** Placeholder length for a beat whose audio hasn't been generated yet. */
const FALLBACK_BEAT_FRAMES = 90;

export function resolveTimeline(
  script: TrailerScript,
  timeline: TrailerTimeline
): ResolvedTimeline {
  const byId = new Map(timeline.beats.map((b) => [b.id, b]));
  let cursor = 0;
  let stale = false;

  const beats: ResolvedBeat[] = script.beats.map((scriptBeat, index) => {
    const timed = byId.get(scriptBeat.id);
    const beatStale = !timed || timed.textHash !== contentHash(scriptBeat.text);
    if (beatStale) stale = true;

    const base: TimelineBeat = timed ?? {
      id: scriptBeat.id,
      textHash: "",
      audioFile: "",
      audioFrames: FALLBACK_BEAT_FRAMES,
      durationInFrames: FALLBACK_BEAT_FRAMES,
      words: [],
      refined: false,
    };
    const resolved: ResolvedBeat = {
      ...base,
      index,
      startFrame: cursor,
      scriptBeat,
      stale: beatStale,
    };
    cursor += base.durationInFrames;
    return resolved;
  });

  const events: ResolvedEvent[] = [];
  for (const beat of beats) {
    for (const event of beat.scriptBeat.events ?? []) {
      events.push({ frame: anchorFrame(beat, event.at), event });
    }
  }
  events.sort((a, b) => a.frame - b.frame);

  return {
    fps: timeline.fps,
    totalDurationInFrames: cursor,
    beats,
    events,
    stale,
    musicFile: timeline.musicFile,
    whooshFile: timeline.whooshFile,
  };
}

const normalizeWord = (word: string) =>
  word.toLowerCase().replace(/[^a-z0-9]/g, "");

function anchorFrame(beat: ResolvedBeat, at?: EventAnchor): number {
  if (!at) return beat.startFrame + 2;
  if ("progress" in at) {
    return beat.startFrame + Math.round(at.progress * beat.audioFrames);
  }
  const target = normalizeWord(at.word);
  let remaining = at.occurrence ?? 1;
  for (const word of beat.words) {
    if (normalizeWord(word.text) === target && --remaining === 0) {
      return beat.startFrame + word.startFrame;
    }
  }
  if (beat.words.length > 0) {
    console.warn(
      `[trailer] Beat "${beat.id}": anchor word "${at.word}" not found in narration — firing at 30%.`
    );
  }
  return beat.startFrame + Math.round(0.3 * beat.audioFrames);
}

// ---------------------------------------------------------------------------
// Camera: one keyframe per beat, eased moves between them, and a slow
// drift-zoom while holding so the frame never sits completely still.
// ---------------------------------------------------------------------------

export interface CameraState {
  cx: number;
  cy: number;
  scale: number;
}

/** Extra world-space padding around the rect a beat asks the camera to frame. */
const CAMERA_PADDING = 0.06;
/** Scale multiplier gained per held frame (~3.6% zoom over a 10s hold). */
const DRIFT_RATE = 0.00012;
const INTRO_FRAMES = 40;
const INTRO_SCALE = 0.94;

export function rectToCamera(rect: Rect, vw: number, vh: number): CameraState {
  const w = rect.width * (1 + CAMERA_PADDING * 2);
  const h = rect.height * (1 + CAMERA_PADDING * 2);
  return {
    cx: rect.x + rect.width / 2,
    cy: rect.y + rect.height / 2,
    scale: Math.min(vw / w, vh / h),
  };
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function transitionFrames(beat: ResolvedBeat): number {
  return Math.min(34, Math.max(12, Math.round(beat.durationInFrames * 0.4)));
}

function lerpCamera(a: CameraState, b: CameraState, t: number): CameraState {
  return {
    cx: a.cx + (b.cx - a.cx) * t,
    cy: a.cy + (b.cy - a.cy) * t,
    // Zoom feels linear in log space, not scale space.
    scale: Math.exp(
      Math.log(a.scale) + (Math.log(b.scale) - Math.log(a.scale)) * t
    ),
  };
}

const applyDrift = (cam: CameraState, heldFrames: number): CameraState => ({
  ...cam,
  scale: cam.scale * (1 + DRIFT_RATE * Math.max(0, heldFrames)),
});

/** Camera state at the final frame of a beat (base framing + accumulated drift). */
function cameraAtBeatEnd(
  resolved: ResolvedTimeline,
  index: number,
  vw: number,
  vh: number
): CameraState {
  const beat = resolved.beats[index];
  const base = rectToCamera(beat.scriptBeat.camera, vw, vh);
  return applyDrift(base, beat.durationInFrames - transitionFrames(beat));
}

export function cameraAtFrame(
  resolved: ResolvedTimeline,
  frame: number,
  vw: number,
  vh: number
): CameraState {
  const beats = resolved.beats;
  if (beats.length === 0) return { cx: vw / 2, cy: vh / 2, scale: 1 };

  let index = beats.length - 1;
  for (let i = 0; i < beats.length; i++) {
    if (frame < beats[i].startFrame + beats[i].durationInFrames) {
      index = i;
      break;
    }
  }
  const beat = beats[index];
  const local = frame - beat.startFrame;
  const base = rectToCamera(beat.scriptBeat.camera, vw, vh);

  if (index === 0) {
    // Slow push-in to open the video, then drift.
    if (local < INTRO_FRAMES) {
      const t = easeInOutCubic(local / INTRO_FRAMES);
      return lerpCamera({ ...base, scale: base.scale * INTRO_SCALE }, base, t);
    }
    return applyDrift(base, local - INTRO_FRAMES);
  }

  const trans = transitionFrames(beat);
  if (local < trans) {
    const from = cameraAtBeatEnd(resolved, index - 1, vw, vh);
    return lerpCamera(from, base, easeInOutCubic(local / trans));
  }
  return applyDrift(base, local - trans);
}

/** Frames where the camera starts a real move — used to place whoosh SFX. */
export function cameraMoveFrames(resolved: ResolvedTimeline): number[] {
  const frames: number[] = [];
  for (let i = 1; i < resolved.beats.length; i++) {
    const prev = resolved.beats[i - 1].scriptBeat.camera;
    const cur = resolved.beats[i].scriptBeat.camera;
    const moved =
      Math.abs(prev.x - cur.x) > 40 ||
      Math.abs(prev.y - cur.y) > 40 ||
      Math.abs(prev.width - cur.width) > 40;
    if (moved) frames.push(resolved.beats[i].startFrame);
  }
  return frames;
}

/**
 * The frame an artifact first comes into frame — entrance animations key off
 * this so a card doesn't play its intro long before the camera arrives.
 */
export function artifactActivationFrame(
  resolved: ResolvedTimeline,
  rect: Rect
): number {
  for (const beat of resolved.beats) {
    const cam = beat.scriptBeat.camera;
    const overlaps =
      cam.x < rect.x + rect.width &&
      cam.x + cam.width > rect.x &&
      cam.y < rect.y + rect.height &&
      cam.y + cam.height > rect.y;
    if (overlaps) return beat.startFrame;
  }
  return 0;
}
