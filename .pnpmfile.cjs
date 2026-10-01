// Keeps ESLint on TypeScript 6 while the project builds on TypeScript 7.
//
// typescript-eslint throws on import when it sees TS 7 (typescript-eslint#10940)
// and arrives through eslint-config-next, so without this the whole lint run
// dies before reading a file. `typescript` is a *peer* of every package in that
// chain, and pnpm resolves a peer from the root, which is TS 7. Neither
// `overrides` nor `packageExtensions` can move a peer: the first ignores peers
// and the second loses to them. Rewriting the manifest can: each package below
// gets a real dependency on TS 6 in place of the peer, so the chain loads 6 and
// `tsc` / `next build` keep 7.
//
// Delete this file when typescript-eslint supports TS 7.

const TS6 = "npm:typescript@^6.0.3";

function lintsWithTypeScript(name) {
  return (
    name === "eslint-config-next" ||
    name === "typescript-eslint" ||
    name.startsWith("@typescript-eslint/") ||
    name === "ts-api-utils" ||
    name === "eslint-import-resolver-typescript"
  );
}

function readPackage(pkg) {
  if (!lintsWithTypeScript(pkg.name)) return pkg;
  const declared =
    pkg.peerDependencies?.typescript ?? pkg.dependencies?.typescript;
  if (!declared) return pkg;
  if (pkg.peerDependencies) delete pkg.peerDependencies.typescript;
  if (pkg.peerDependenciesMeta) delete pkg.peerDependenciesMeta.typescript;
  pkg.dependencies = { ...pkg.dependencies, typescript: TS6 };
  return pkg;
}

module.exports = { hooks: { readPackage } };
