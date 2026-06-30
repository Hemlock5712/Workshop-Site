import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./src/index.ts");
Config.setTimeoutInMilliseconds(120000);
Config.setConcurrency(2);
