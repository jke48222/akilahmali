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
      preload="auto"
      aria-hidden="true"
    >
      <source src="/video/who-really-won.mp4" type="video/mp4" />
    </video>
  );
}
