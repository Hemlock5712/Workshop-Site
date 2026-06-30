export type Slide =
  | { kind: "title"; title: string; subtitle?: string; accent?: AccentColor }
  | { kind: "bullets"; title: string; bullets: string[]; accent?: AccentColor }
  | {
      kind: "code";
      title?: string;
      language: "java" | "kotlin" | "typescript" | "javascript" | "python";
      code: string;
      highlightLines?: number[];
      caption?: string;
    }
  | {
      kind: "image";
      src: string;
      caption?: string;
      title?: string;
    };

export type AccentColor = "blue" | "amber" | "mint" | "purple" | "teal";

export interface Segment {
  id: string;
  text: string;
  slide: Slide;
}

export interface VideoScript {
  id: string;
  voice: string;
  segments: Segment[];
}

export interface RenderedSegment {
  id: string;
  audioFile: string;
  durationInSeconds: number;
  durationInFrames: number;
}

export interface AudioManifest {
  id: string;
  fps: number;
  segments: RenderedSegment[];
  totalDurationInFrames: number;
}
