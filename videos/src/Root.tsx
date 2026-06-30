import { Composition } from "remotion";
import { ScriptedVideo } from "./compositions/ScriptedVideo";
import { IntroductionScript } from "./compositions/Introduction.script";
import { PrerequisitesScript } from "./compositions/Prerequisites.script";
import { HardwareScript } from "./compositions/Hardware.script";
import { MechanismSelectionScript } from "./compositions/MechanismSelection.script";
import { LoggingScript } from "./compositions/Logging.script";
import { VisionScript } from "./compositions/Vision.script";
import { CommandFrameworkScript } from "./compositions/CommandFramework.script";
import { AddingCommandsScript } from "./compositions/AddingCommands.script";
import { LoggingImplementationScript } from "./compositions/LoggingImplementation.script";
import { VisionImplementationScript } from "./compositions/VisionImplementation.script";
import { brand } from "./lib/brand";
import { loadManifest } from "./lib/loadManifest";
import type { VideoScript } from "./lib/types";

const ALL_SCRIPTS: VideoScript[] = [
  IntroductionScript,
  PrerequisitesScript,
  HardwareScript,
  MechanismSelectionScript,
  LoggingScript,
  VisionScript,
  CommandFrameworkScript,
  AddingCommandsScript,
  LoggingImplementationScript,
  VisionImplementationScript,
];

export const RemotionRoot = () => {
  return (
    <>
      {ALL_SCRIPTS.map((script) => {
        const manifest = loadManifest(script.id);
        return (
          <Composition
            key={script.id}
            id={script.id}
            component={ScriptedVideo}
            durationInFrames={manifest.totalDurationInFrames}
            fps={brand.fps}
            width={brand.width}
            height={brand.height}
            defaultProps={{ script, manifest }}
          />
        );
      })}
    </>
  );
};
