import { Prism } from "prism-react-renderer";

/**
 * prism-react-renderer doesn't bundle the Java grammar, so every token in a
 * `language: "java"` block used to fall through to the plain style (all
 * white text). Registering the real grammar from prismjs — which extends
 * the bundled `clike` — turns the syntax colors on.
 *
 * The global assignment must happen before the grammar module evaluates,
 * which is why this uses require() instead of a hoisted import.
 */
(globalThis as { Prism?: typeof Prism }).Prism = Prism;
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("prismjs/components/prism-java");
