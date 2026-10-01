/**
 * Which lesson branches open in GitHub Codespaces, and at which ref.
 *
 * A Codespace takes its container from the `.devcontainer/` in the ref it is
 * opened on. A branch without one boots GitHub's default image, which has no
 * JDK 25 and no WPILib, so a button that links there fails on the first
 * `./gradlew build`. That is why this is a list rather than every `branch`.
 *
 * The dev container is one commit, `devcontainer` on Workshop-Code. Today it
 * sits on `mech-3-MotionMagic-devcontainer` as well, which is
 * `mech-3-MotionMagic` plus that commit. When the mech chain is rebased onto
 * it, each entry becomes `branch: branch` and this map can go.
 */
const CODESPACE_REFS: Readonly<Record<string, string>> = {
  "mech-3-MotionMagic": "mech-3-MotionMagic-devcontainer",
};

const REPO = "Hemlock5712/Workshop-Code";

/**
 * The codespaces.new link for a lesson branch, or null when that branch has
 * no dev container yet. `quickstart=1` reopens the student's existing
 * Codespace for the ref instead of building a second one.
 */
export function codespacesUrl(branch: string | undefined): string | null {
  if (!branch) return null;
  const ref = CODESPACE_REFS[branch];
  if (!ref) return null;
  return `https://codespaces.new/${REPO}/tree/${encodeURIComponent(ref)}?quickstart=1`;
}
