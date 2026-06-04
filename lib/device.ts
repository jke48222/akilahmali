/**
 * Client-only device heuristics used to tune effects for smoothness. Each is
 * memoized after the first read (the result doesn't meaningfully change within a
 * session) and guards `window`/`matchMedia` so it's safe to call before mount.
 */

let _coarse: boolean | null = null;

/** True on touch-first devices (phones/tablets) — used to dial back expensive
 *  GPU work (antialiasing, device-pixel-ratio, texture anisotropy). */
export function isCoarsePointer(): boolean {
  if (_coarse === null) {
    _coarse =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
  }
  return _coarse;
}
