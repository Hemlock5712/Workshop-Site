import { Composition, staticFile } from "remotion";
import {
  TrailerVideo,
  type TrailerVideoProps,
} from "./trailer/components/TrailerVideo";
import { TRAILERS } from "./trailer/registry";
import { brand } from "./lib/brand";
import type { TrailerTimeline } from "./trailer/lib/types";

export const RemotionRoot = () => {
  return (
    <>
      {TRAILERS.map((script) => (
        <Composition
          key={script.id}
          id={script.id}
          component={TrailerVideo}
          durationInFrames={300}
          fps={brand.fps}
          width={brand.width}
          height={brand.height}
          defaultProps={{ script, timeline: null as TrailerTimeline | null }}
          calculateMetadata={async ({
            props,
          }: {
            props: TrailerVideoProps;
          }) => {
            // Duration comes straight from the generated timeline — no
            // checked-in manifest files to go stale.
            try {
              const res = await fetch(
                staticFile(`trailer-audio/${props.script.id}.timeline.json`)
              );
              if (!res.ok) throw new Error(`${res.status}`);
              const timeline = (await res.json()) as TrailerTimeline;
              return {
                durationInFrames: Math.max(1, timeline.totalDurationInFrames),
                props: { ...props, timeline },
              };
            } catch {
              // No timeline yet — TrailerVideo renders a "run trailer:audio" slate.
              return { durationInFrames: 300, props };
            }
          }}
        />
      ))}
    </>
  );
};
