import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // The root lint script covers `src/` and `scripts/**/*.ts`; `videos-next/` is
  // plain browser and Node JavaScript outside both. Plain `.mjs` / `.mts` files
  // are not linted: Next's config
  // parses them with its bundled Babel parser, whose scope manager predates
  // ESLint 10 and throws `scopeManager.addGlobals is not a function`.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Allow setState in useEffect for legitimate patterns like hydration and localStorage
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
