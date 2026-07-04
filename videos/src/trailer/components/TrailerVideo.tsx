import { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedBackground } from "../../components/AnimatedBackground";
import { brand } from "../../lib/brand";
import {
  artifactActivationFrame,
  cameraAtFrame,
  cameraMoveFrames,
  resolveTimeline,
  type ResolvedTimeline,
} from "../lib/timeline";
import type { ArtifactDef, TrailerScript, TrailerTimeline } from "../lib/types";
import { Captions } from "./Captions";
import { CodePanel } from "./artifacts/CodePanel";
import { Diagram } from "./artifacts/Diagram";
import { EndCard } from "./artifacts/EndCard";
import { FlywheelLab } from "./artifacts/FlywheelLab";
import { ImageCard } from "./artifacts/ImageCard";
import { PidLab } from "./artifacts/PidLab";
import { TitleCard } from "./artifacts/TitleCard";

// A `type` (not `interface`) so it satisfies Remotion's Record<string, unknown>
// constraint on Composition props.
export type TrailerVideoProps = {
  script: TrailerScript;
  timeline: TrailerTimeline | null;
};

export function TrailerVideo({ script, timeline }: TrailerVideoProps) {
  if (!timeline || timeline.beats.length === 0) {
    return <PrepareSlate scriptId={script.id} />;
  }
  return <TrailerContent script={script} timeline={timeline} />;
}

function TrailerContent({
  script,
  timeline,
}: {
  script: TrailerScript;
  timeline: TrailerTimeline;
}) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const resolved = useMemo(
    () => resolveTimeline(script, timeline),
    [script, timeline]
  );
  const whooshFrames = useMemo(() => cameraMoveFrames(resolved), [resolved]);
  const camera = cameraAtFrame(resolved, frame, width, height);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: brand.colors.backgroundDeep,
        fontFamily: brand.fonts.sans,
        color: brand.colors.text,
      }}
    >
      {/* Background stays fixed to the viewport while the world moves past — cheap parallax. */}
      <AnimatedBackground accent="blue" />

      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transformOrigin: "0 0",
            transform: `translate(${width / 2 - camera.cx * camera.scale}px, ${
              height / 2 - camera.cy * camera.scale
            }px) scale(${camera.scale})`,
          }}
        >
          {script.world.map((def) => (
            <ArtifactView key={def.id} def={def} resolved={resolved} />
          ))}
        </div>
      </AbsoluteFill>

      {resolved.beats.map((beat) =>
        beat.audioFile ? (
          <Sequence
            key={beat.id}
            from={beat.startFrame}
            durationInFrames={beat.durationInFrames}
            name={`audio:${beat.id}`}
          >
            <Audio src={staticFile(beat.audioFile)} />
          </Sequence>
        ) : null
      )}

      {resolved.whooshFile &&
        whooshFrames.map((moveFrame) => (
          <Sequence
            key={`whoosh-${moveFrame}`}
            from={moveFrame}
            durationInFrames={20}
            name="whoosh"
          >
            <Audio
              src={staticFile(resolved.whooshFile as string)}
              volume={0.16}
            />
          </Sequence>
        ))}

      {resolved.musicFile && (
        <Audio
          loop
          src={staticFile(resolved.musicFile)}
          volume={(f) =>
            interpolate(
              f,
              [
                0,
                45,
                resolved.totalDurationInFrames - 60,
                resolved.totalDurationInFrames,
              ],
              [0, 0.09, 0.09, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )
          }
        />
      )}

      <Captions resolved={resolved} />
      <Footer />
      {resolved.stale && <StaleBanner scriptId={script.id} />}
    </AbsoluteFill>
  );
}

function ArtifactView({
  def,
  resolved,
}: {
  def: ArtifactDef;
  resolved: ResolvedTimeline;
}) {
  const activationFrame = useMemo(
    () => artifactActivationFrame(resolved, def.rect),
    [resolved, def.rect]
  );
  return (
    <div
      style={{
        position: "absolute",
        left: def.rect.x,
        top: def.rect.y,
        width: def.rect.width,
        height: def.rect.height,
      }}
    >
      {def.kind === "title" && <TitleCard def={def} />}
      {def.kind === "end" && (
        <EndCard def={def} activationFrame={activationFrame} />
      )}
      {def.kind === "code" && <CodePanel def={def} events={resolved.events} />}
      {def.kind === "pid-lab" && <PidLab def={def} resolved={resolved} />}
      {def.kind === "flywheel-lab" && (
        <FlywheelLab def={def} resolved={resolved} />
      )}
      {def.kind === "diagram" && <Diagram def={def} events={resolved.events} />}
      {def.kind === "image" && (
        <ImageCard def={def} activationFrame={activationFrame} />
      )}
    </div>
  );
}

function Footer() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 44,
        left: 120,
        right: 120,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: brand.colors.textMuted,
        fontSize: 22,
        letterSpacing: 1,
        opacity: 0.85,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 999,
            background: brand.colors.accent,
            boxShadow: `0 0 12px ${brand.colors.accent}`,
          }}
        />
        <span>Gray Matter Workshop</span>
      </div>
      <span style={{ fontFamily: brand.fonts.mono }}>frc5712.com</span>
    </div>
  );
}

function StaleBanner({ scriptId }: { scriptId: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "rgba(251, 191, 36, 0.15)",
          border: `1px solid ${brand.accents.amber.primary}`,
          color: brand.accents.amber.primary,
          borderRadius: 999,
          padding: "10px 26px",
          fontSize: 24,
          fontFamily: brand.fonts.mono,
        }}
      >
        Narration changed — run: pnpm trailer:audio {scriptId}
      </div>
    </div>
  );
}

function PrepareSlate({ scriptId }: { scriptId: string }) {
  return (
    <AbsoluteFill
      style={{
        background: brand.colors.backgroundDeep,
        alignItems: "center",
        justifyContent: "center",
        color: brand.colors.text,
        fontFamily: brand.fonts.sans,
        gap: 28,
      }}
    >
      <div style={{ fontSize: 52, fontWeight: 700 }}>No audio timeline yet</div>
      <div
        style={{
          fontFamily: brand.fonts.mono,
          fontSize: 32,
          color: brand.colors.textMuted,
          background: brand.code.background,
          padding: "18px 36px",
          borderRadius: 12,
          border: `1px solid ${brand.code.border}`,
        }}
      >
        pnpm --filter @gray-matter/videos trailer:audio {scriptId}
      </div>
    </AbsoluteFill>
  );
}
