import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Allow setState in useEffect for legitimate patterns like hydration and localStorage
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
