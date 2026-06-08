/**
 * Client-only device heuristics used to tune effects for smoothness. Each
 * guards `window`/`matchMedia` so it's safe to call before mount.
 */

import { useSyncExternalStore } from "react";

let _coarse: boolean | null = null;

/** True on touch-first devices (phones/tablets) — used to dial back expensive
 *  GPU work (antialiasing, device-pixel-ratio, texture anisotropy). Memoized:
 *  pointer type doesn't change within a session. */
export function isCoarsePointer(): boolean {
  if (_coarse === null) {
    _coarse =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
  }
  return _coarse;
}

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

/** True when the visitor has asked the OS to minimize motion. NOT memoized —
 *  the setting can change mid-session, and reading matchMedia is cheap. Safe to
 *  call on the server (returns false). Single source of truth for every
 *  immersive experience + the persistent player. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCE_MOTION).matches
  );
}

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia(REDUCE_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Reactive `prefers-reduced-motion`. SSR-safe (false on the server), then syncs
 *  and live-updates if the visitor flips the OS setting. Backed by
 *  `useSyncExternalStore` so there's no effect/setState churn. For one-shot
 *  reads at mount use `prefersReducedMotion()` directly. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false,
  );
}
