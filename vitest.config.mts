import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests only: the physics models behind the three playgrounds and the
// metadata helper. Nothing here renders a component, so the environment is
// plain Node and there is no DOM.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
