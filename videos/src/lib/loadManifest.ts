import type { AudioManifest } from "./types";
import { manifest as introManifest } from "../manifests/Introduction.manifest";
import { manifest as prereqManifest } from "../manifests/Prerequisites.manifest";
import { manifest as hardwareManifest } from "../manifests/Hardware.manifest";
import { manifest as mechanismManifest } from "../manifests/MechanismSelection.manifest";
import { manifest as loggingManifest } from "../manifests/Logging.manifest";
import { manifest as visionManifest } from "../manifests/Vision.manifest";
import { manifest as commandFrameworkManifest } from "../manifests/CommandFramework.manifest";
import { manifest as addingCommandsManifest } from "../manifests/AddingCommands.manifest";
import { manifest as loggingImplementationManifest } from "../manifests/LoggingImplementation.manifest";
import { manifest as visionImplementationManifest } from "../manifests/VisionImplementation.manifest";

const manifests: Record<string, AudioManifest> = {
  Introduction: introManifest,
  Prerequisites: prereqManifest,
  Hardware: hardwareManifest,
  MechanismSelection: mechanismManifest,
  Logging: loggingManifest,
  Vision: visionManifest,
  CommandFramework: commandFrameworkManifest,
  AddingCommands: addingCommandsManifest,
  LoggingImplementation: loggingImplementationManifest,
  VisionImplementation: visionImplementationManifest,
};

export function loadManifest(id: string): AudioManifest {
  const manifest = manifests[id];
  if (!manifest) {
    throw new Error(
      `No audio manifest registered for "${id}". Add it to videos/src/lib/loadManifest.ts.`
    );
  }
  if (manifest.totalDurationInFrames === 0) {
    throw new Error(
      `Manifest "${id}" has zero duration. Run "pnpm tts ${id}" to generate audio first.`
    );
  }
  return manifest;
}
