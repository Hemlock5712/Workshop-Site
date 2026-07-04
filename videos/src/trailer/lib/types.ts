import type { AccentColor } from "../../lib/types";

// ---------------------------------------------------------------------------
// Authoring types — what a trailer script file declares.
//
// A trailer is ONE continuous world: artifacts placed on a large canvas, and
// a camera that moves between them. Narration is split into short "beats";
// each beat frames a region of the world and can fire events (gain changes,
// code edits, target moves) anchored to a spoken word.
// ---------------------------------------------------------------------------

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * When during a beat an event fires.
 * - `{ word: "crank" }` — the frame the narrator says that word
 *   (matched case/punctuation-insensitively; `occurrence` picks repeats)
 * - `{ progress: 0.5 }` — a fraction of the beat's narration duration
 * Omitted entirely → fires right at the start of the beat.
 */
export type EventAnchor =
  | { word: string; occurrence?: number }
  | { progress: number };

export type TrailerEvent =
  | { type: "gains"; kP: number; kD: number; kG?: number; at?: EventAnchor }
  | { type: "target"; deg: number; at?: EventAnchor }
  | {
      type: "profile";
      cruiseDegPerSec: number;
      accelDegPerSec2: number;
      at?: EventAnchor;
    }
  | { type: "code-state"; artifact: string; state: number; at?: EventAnchor }
  | { type: "diagram"; artifact: string; step: number; at?: EventAnchor };

export interface Beat {
  id: string;
  /** Narration for this beat. Displayed in captions; pronunciations applied for TTS only. */
  text: string;
  /** World rect the camera should frame while this beat plays. */
  camera: Rect;
  events?: TrailerEvent[];
  /** Seconds of hold after the narration ends (default 0.4). */
  holdAfter?: number;
}

export interface TitleArtifact {
  kind: "title";
  id: string;
  rect: Rect;
  title: string;
  subtitle?: string;
  accent?: AccentColor;
}

export interface EndArtifact {
  kind: "end";
  id: string;
  rect: Rect;
  title: string;
  url: string;
  subtitle?: string;
}

export interface CodeArtifact {
  kind: "code";
  id: string;
  rect: Rect;
  fileName: string;
  language: string;
  /** Successive code states. `code-state` events animate between them (typed diffs). */
  states: string[];
}

export type PidLabChip = "kP" | "kD" | "kG" | "target";

export interface PidLabArtifact {
  kind: "pid-lab";
  id: string;
  rect: Rect;
  /** Where the arm rests before any control is applied (usually the hard stop). */
  startDeg: number;
  hardStopDeg: number;
  /** HUD chips to show (default: kP, kD, target). */
  chips?: PidLabChip[];
}

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  /** Position within the artifact rect. */
  x: number;
  y: number;
  width: number;
  height: number;
  accent?: AccentColor;
  /** Diagram step at which this node appears (default 0 = always visible). */
  step?: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  /** Appears once both endpoints are visible AND step >= this (default 0). */
  step?: number;
}

export interface DiagramArtifact {
  kind: "diagram";
  id: string;
  rect: Rect;
  title?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface ImageArtifact {
  kind: "image";
  id: string;
  rect: Rect;
  /** Path under videos/public, e.g. "images/mechanisms/arm.png". */
  src: string;
  title?: string;
  caption?: string;
}

export type ArtifactDef =
  | TitleArtifact
  | EndArtifact
  | CodeArtifact
  | PidLabArtifact
  | DiagramArtifact
  | ImageArtifact;

export interface TrailerScript {
  id: string;
  voice: string;
  world: ArtifactDef[];
  beats: Beat[];
}

// ---------------------------------------------------------------------------
// Timeline types — what `pnpm trailer:audio` emits to
// public/trailer-audio/<id>.timeline.json. All frames relative to beat start.
// ---------------------------------------------------------------------------

export interface TimedWord {
  text: string;
  startFrame: number;
  endFrame: number;
}

export interface TimelineBeat {
  id: string;
  /** Hash of the display text — used to detect a stale timeline in Studio. */
  textHash: string;
  /** Path under public/, e.g. "trailer-audio/cache/<hash>.wav". */
  audioFile: string;
  audioFrames: number;
  /** audioFrames + holdAfter padding. */
  durationInFrames: number;
  words: TimedWord[];
  /** true when word timings came from whisper alignment, not estimation. */
  refined: boolean;
}

export interface TrailerTimeline {
  id: string;
  fps: number;
  beats: TimelineBeat[];
  totalDurationInFrames: number;
  musicFile: string | null;
  whooshFile: string | null;
}
