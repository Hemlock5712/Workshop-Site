import { contentHash } from "./hash";
import type {
  Beat,
  Drift,
  EventAnchor,
  MoveKind,
  Rect,
  Shot,
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
// Camera: a flat track of shots in absolute frames. Each beat contributes one
// shot (from `beat.camera`) or several (from `beat.shots`), with per-shot move
// curves and per-shot residual drift.
//
// The model this replaced had exactly one keyframe per beat. Because
// `transitionFrames` clamped to 34 and no authored beat is shorter than 85
// frames, every camera move in the library was the identical 34-frame ease
// followed by a 10-25 second hold whose only motion was 0.115 px/frame — which
// is why it read as a slide show. And it could not be fixed by turning the
// drift up: holding perceptible motion (~1 px/frame) across a 460-frame beat
// needs a 48% zoom. Multiple shots per beat is the only way out.
// ---------------------------------------------------------------------------

export interface CameraState {
  cx: number;
  cy: number;
  scale: number;
}

export interface CameraFrame extends CameraState {
  /**
   * Screen-space px/frame of apparent motion, combining pan and dolly. A pure
   * zoom moves no pixels at the frame centre but plenty at the edges, so this
   * adds the edge displacement a scale change produces — otherwise a dolly
   * reads as perfectly still and anything keyed off velocity (motion blur, SFX
   * loudness, caption opacity) misses it entirely.
   */
  velocity: number;
  /** True on the single frame a hard cut lands. */
  isCut: boolean;
}

/** Extra world-space padding around the rect a shot asks the camera to frame. */
const CAMERA_PADDING = 0.06;
const INTRO_FRAMES = 40;
const INTRO_SCALE = 0.94;

/**
 * Legacy per-second dolly, applied when a shot declares no drift of its own.
 * This is the old global DRIFT_RATE (0.00012/frame at 30fps) expressed per
 * second, so a script that has not been re-authored looks exactly as it did.
 * Re-authored shots should ask for ~0.03 (3%/s), which is roughly where drift
 * crosses from "several-second creep" into readable camera movement.
 */
const DEFAULT_DOLLY_PER_SEC = 0.0036;

/**
 * Quantum for the composed scale while a shot is held. A distinct non-integral
 * device scale on every frame makes Chromium re-rasterize every glyph from
 * outlines instead of blitting its atlas, and no raster tile survives to the
 * next frame. 1/2048 steps are ~0.05% (sub-pixel across 1920) so the drift
 * still reads as smooth, while consecutive frames share a transform often
 * enough to hit the caches. Moves are left unquantized — stepping is visible
 * there, and a move is only ~10-32 frames.
 */
const HELD_SCALE_STEPS = 2048;

const MOVE_DEFAULT_FRAMES: Record<MoveKind, number> = {
  cut: 0,
  snap: 10,
  smooth: 20,
  settle: 32,
  glide: 24,
};

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CURVES: Record<MoveKind, (t: number) => number> = {
  cut: () => 1,
  // Hard decelerate — arrives fast then plants.
  snap: (t) => 1 - Math.pow(1 - t, 4),
  smooth: easeInOutCubic,
  // Long tail, for settling onto a subject.
  settle: (t) => 1 - Math.pow(1 - t, 5),
  glide: (t) => t,
};

export function rectToCamera(rect: Rect, vw: number, vh: number): CameraState {
  const w = rect.width * (1 + CAMERA_PADDING * 2);
  const h = rect.height * (1 + CAMERA_PADDING * 2);
  return {
    cx: rect.x + rect.width / 2,
    cy: rect.y + rect.height / 2,
    scale: Math.min(vw / w, vh / h),
  };
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

export interface ResolvedShot {
  /** Absolute frame this shot takes over. */
  startFrame: number;
  /** Absolute frame the next shot takes over (exclusive). */
  endFrame: number;
  rect: Rect;
  kind: MoveKind;
  /** Transition length, already clamped to the shot's own duration. */
  moveFrames: number;
  drift: Drift;
  beatIndex: number;
  beatId: string;
}

/**
 * Flatten every beat's shots into one absolute-frame track. Shot boundaries use
 * the same word/progress anchoring as events, so a cut can land on a spoken
 * word.
 */
export function buildCameraTrack(resolved: ResolvedTimeline): ResolvedShot[] {
  const track: ResolvedShot[] = [];

  resolved.beats.forEach((beat, beatIndex) => {
    const legacy = !beat.scriptBeat.shots?.length;
    const authored: Shot[] = beat.scriptBeat.shots?.length
      ? beat.scriptBeat.shots
      : beat.scriptBeat.camera
        ? [{ rect: beat.scriptBeat.camera }]
        : [];
    if (authored.length === 0) {
      throw new Error(
        `[trailer] Beat "${beat.id}" declares neither \`camera\` nor \`shots\`.`
      );
    }

    authored.forEach((shot, i) => {
      // The first shot owns the start of the beat regardless of any anchor.
      const startFrame = i === 0 ? beat.startFrame : anchorFrame(beat, shot.at);
      const kind = shot.move?.kind ?? "smooth";
      // A beat still using the single-`camera` sugar keeps the exact transition
      // length the old one-keyframe-per-beat model gave it, so this refactor is
      // a visual no-op until a script is deliberately re-authored into shots.
      const legacyFrames = Math.min(
        34,
        Math.max(12, Math.round(beat.durationInFrames * 0.4))
      );
      track.push({
        startFrame,
        endFrame: beat.startFrame + beat.durationInFrames,
        rect: shot.rect,
        kind,
        moveFrames:
          shot.move?.frames ??
          (legacy ? legacyFrames : MOVE_DEFAULT_FRAMES[kind]),
        drift: shot.drift ?? {},
        beatIndex,
        beatId: beat.id,
      });
    });
  });

  track.sort((a, b) => a.startFrame - b.startFrame);

  // Each shot runs until the next one starts. Clamp the transition so a shot is
  // never still mid-move at its own end frame — that keeps `cameraAtShotEnd`
  // non-recursive.
  for (let i = 0; i < track.length; i++) {
    if (i + 1 < track.length) track[i].endFrame = track[i + 1].startFrame;
    const duration = Math.max(1, track[i].endFrame - track[i].startFrame);
    track[i].moveFrames = Math.min(track[i].moveFrames, duration);
  }
  return track.filter((shot) => shot.endFrame > shot.startFrame);
}

function applyDrift(
  cam: CameraState,
  heldFrames: number,
  fps: number,
  drift: Drift
): CameraState {
  const seconds = Math.max(0, heldFrames) / fps;
  const dolly = drift.dolly ?? DEFAULT_DOLLY_PER_SEC;
  return {
    cx: cam.cx + (drift.panX ?? 0) * seconds,
    cy: cam.cy + (drift.panY ?? 0) * seconds,
    scale: cam.scale * (1 + dolly * seconds),
  };
}

/** Camera at a shot's final frame: base framing plus its accumulated drift. */
function cameraAtShotEnd(
  shot: ResolvedShot,
  fps: number,
  vw: number,
  vh: number
): CameraState {
  const base = rectToCamera(shot.rect, vw, vh);
  const held = shot.endFrame - shot.startFrame - shot.moveFrames;
  return applyDrift(base, held, fps, shot.drift);
}

function cameraAt(
  track: ResolvedShot[],
  frame: number,
  fps: number,
  vw: number,
  vh: number
): CameraState {
  if (track.length === 0) return { cx: vw / 2, cy: vh / 2, scale: 1 };

  let index = track.length - 1;
  for (let i = 0; i < track.length; i++) {
    if (frame < track[i].endFrame) {
      index = i;
      break;
    }
  }
  const shot = track[index];
  const local = frame - shot.startFrame;
  const base = rectToCamera(shot.rect, vw, vh);

  if (index === 0) {
    // Slow push-in to open the video, then drift.
    if (local < INTRO_FRAMES) {
      const t = easeInOutCubic(local / INTRO_FRAMES);
      return lerpCamera({ ...base, scale: base.scale * INTRO_SCALE }, base, t);
    }
    return applyDrift(base, local - INTRO_FRAMES, fps, shot.drift);
  }

  if (shot.kind !== "cut" && shot.moveFrames > 0 && local < shot.moveFrames) {
    const from = cameraAtShotEnd(track[index - 1], fps, vw, vh);
    const t = CURVES[shot.kind](local / shot.moveFrames);
    return lerpCamera(from, base, t);
  }

  const held = applyDrift(base, local - shot.moveFrames, fps, shot.drift);
  // Quantize only while held; see HELD_SCALE_STEPS.
  return {
    cx: held.cx,
    cy: held.cy,
    scale: Math.round(held.scale * HELD_SCALE_STEPS) / HELD_SCALE_STEPS,
  };
}

/**
 * Camera for a frame, plus how fast it is moving. Velocity is what lets
 * downstream code key motion blur, SFX loudness, or caption opacity off the
 * camera instead of guessing.
 */
export function cameraAtFrame(
  track: ResolvedShot[],
  frame: number,
  fps: number,
  vw: number,
  vh: number
): CameraFrame {
  const cur = cameraAt(track, frame, fps, vw, vh);
  const prev = frame > 0 ? cameraAt(track, frame - 1, fps, vw, vh) : cur;

  // A cut is a discontinuity, not motion. Reporting its enormous frame-to-frame
  // delta as velocity would smear a blur across the one frame that must stay
  // sharp, so flag it and report zero.
  const isCut = track.some(
    (shot) => shot.kind === "cut" && shot.startFrame === frame
  );
  if (isCut) return { ...cur, velocity: 0, isCut: true };

  const dx = (cur.cx - prev.cx) * cur.scale;
  const dy = (cur.cy - prev.cy) * cur.scale;
  const pan = Math.hypot(dx, dy);
  // Edge displacement from the scale change, measured at the corner.
  const zoom = (Math.hypot(vw, vh) / 2) * Math.abs(cur.scale / prev.scale - 1);
  return { ...cur, velocity: pan + zoom, isCut: false };
}

export interface CameraMove {
  frame: number;
  kind: MoveKind;
  /** Screen-space px travelled, for scaling SFX to the size of the move. */
  travel: number;
}

/**
 * Shot boundaries that are real moves — used to place whoosh SFX. Cuts are
 * excluded: a whoosh over an instant transition reads as a mistimed sting.
 */
export function cameraMoves(
  track: ResolvedShot[],
  fps: number,
  vw: number,
  vh: number
): CameraMove[] {
  const moves: CameraMove[] = [];
  for (let i = 1; i < track.length; i++) {
    const shot = track[i];
    if (shot.kind === "cut") continue;
    const from = cameraAtShotEnd(track[i - 1], fps, vw, vh);
    const to = rectToCamera(shot.rect, vw, vh);
    const travel = Math.hypot(
      (to.cx - from.cx) * to.scale,
      (to.cy - from.cy) * to.scale
    );
    const zoomed = Math.abs(Math.log(to.scale / from.scale)) > 0.04;
    if (travel > 40 || zoomed) {
      moves.push({ frame: shot.startFrame, kind: shot.kind, travel });
    }
  }
  return moves;
}

/**
 * The frame an artifact first comes into frame — entrance animations key off
 * this so a card doesn't play its intro long before the camera arrives. Cuts
 * get a short pre-roll: the camera lands instantly, so an entrance spring that
 * started on the same frame would visibly pop after the cut.
 */
const CUT_PREROLL_FRAMES = 10;

export function artifactActivationFrame(
  track: ResolvedShot[],
  rect: Rect
): number {
  for (const shot of track) {
    const cam = shot.rect;
    const overlaps =
      cam.x < rect.x + rect.width &&
      cam.x + cam.width > rect.x &&
      cam.y < rect.y + rect.height &&
      cam.y + cam.height > rect.y;
    if (overlaps) {
      return shot.kind === "cut"
        ? Math.max(0, shot.startFrame - CUT_PREROLL_FRAMES)
        : shot.startFrame;
    }
  }
  return 0;
}
