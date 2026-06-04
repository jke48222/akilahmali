"use client";

import { useEffect, useRef } from "react";

/**
 * Self-hosted background film (the Who Really Won? video, audio stripped). A
 * plain muted/looped <video> means no player chrome, no bot checks, and an
 * instant autoplay. We force muted + play() on mount to satisfy autoplay
 * policies across browsers.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // Respect Save-Data / reduced-data: on metered or low-bandwidth (mobile)
    // connections, don't pull the multi-MB film — the scrimmed dark hero stands
    // in fine. Otherwise force the muted autoplay across browsers.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const saveData =
      conn?.saveData === true ||
      window.matchMedia?.("(prefers-reduced-data: reduce)").matches === true;
    if (saveData) {
      v.preload = "none";
      v.removeAttribute("autoplay");
      v.pause();
      return;
    }
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      className="vhero-video"
      autoPlay
      muted
      loop
      playsInline
      // metadata (not auto) so the heavy film doesn't block first paint / other
      // critical resources; autoplay still buffers & starts a beat later.
      preload="metadata"
      aria-hidden="true"
    >
      <source src="/video/who-really-won.mp4" type="video/mp4" />
    </video>
  );
}
