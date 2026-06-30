import { Audio, Sequence, staticFile } from "remotion";
import { Slide } from "../components/Slide";
import type { AudioManifest, VideoScript } from "../lib/types";

export function ScriptedVideo({
  script,
  manifest,
}: {
  script: VideoScript;
  manifest: AudioManifest;
}) {
  let start = 0;
  return (
    <>
      {script.segments.map((segment, i) => {
        const rendered = manifest.segments[i];
        const from = start;
        start += rendered.durationInFrames;
        return (
          <Sequence
            key={segment.id}
            from={from}
            durationInFrames={rendered.durationInFrames}
            name={segment.id}
          >
            <Slide slide={segment.slide} />
            <Audio src={staticFile(`audio/${rendered.audioFile}`)} />
          </Sequence>
        );
      })}
    </>
  );
}
