import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // `videos/` is a separate Remotion workspace with its own tsconfig; the root
  // lint script only covers `src/`, so keep its rules off the video project.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "videos/**"]),
  {
    rules: {
      // Allow setState in useEffect for legitimate patterns like hydration and localStorage
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
