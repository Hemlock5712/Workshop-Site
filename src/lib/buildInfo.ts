/**
 * Facts fixed at build time.
 *
 * `cacheComponents` prerenders the lesson pages, and calling `new Date()`
 * while rendering one is an error: the result would be baked into static HTML
 * and then silently claim to be the current time for as long as that HTML is
 * served. Next flags it rather than letting it ship.
 *
 * For a copyright year the build time is genuinely the right answer — the site
 * redeploys far more often than once a year — so this is not a workaround.
 * Evaluating at module scope rather than inside a component states that: it
 * runs once when the build loads the module, not once per render.
 *
 * If something here ever needs the real current time, it belongs in a client
 * component or behind `connection()`, not in this file.
 */

/** Year the deployed bundle was built. Shown in the footer copyright. */
export const BUILD_YEAR = new Date().getFullYear();
