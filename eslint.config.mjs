import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // `videos/` is a separate Remotion workspace with its own tsconfig; the root
  // lint script covers `src/` and `scripts/**/*.ts`, so keep its rules off the
  // video project. Plain `.mjs` / `.mts` files are not linted: Next's config
  // parses them with its bundled Babel parser, whose scope manager predates
  // ESLint 10 and throws `scopeManager.addGlobals is not a function`.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "videos/**"]),
  {
    rules: {
      // Allow setState in useEffect for legitimate patterns like hydration and localStorage
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
