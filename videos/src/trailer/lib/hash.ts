// FNV-1a 64-bit. Shared by the prepare script (cache keys) and the renderer
// (stale-timeline detection), so it must stay dependency-free and run in both
// Node and the browser bundle.

// BigInt() calls instead of literals: the site's root tsconfig (target ES2017)
// also type-checks this file, and BigInt literals require ES2020+.
const FNV_OFFSET = BigInt("0xcbf29ce484222325");
const FNV_PRIME = BigInt("0x100000001b3");
const MASK = BigInt("0xffffffffffffffff");

export function contentHash(input: string): string {
  let hash = FNV_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = (hash * FNV_PRIME) & MASK;
  }
  return hash.toString(16).padStart(16, "0");
}
