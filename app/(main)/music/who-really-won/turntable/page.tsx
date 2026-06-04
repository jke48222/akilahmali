"use client";

/* =========================================================================
   /music/who-really-won/turntable — a bare loop. Just the vinyl video + the
   track, nothing else. Reached from the blue button on the control-room desk.
   ========================================================================= */

import { useEffect, useRef } from "react";

export default function TurntablePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    const a = audioRef.current;
    const start = () => {
      v?.play().catch(() => {});
      if (a) {
        a.loop = true;
        a.play().catch(() => {});
      }
    };
    start();
    // audio autoplay can be blocked on a fresh navigation — start it on the
    // first user gesture (click / tap / key), then stop listening once it runs.
    const kick = () => {
      start();
      if (a && !a.paused) detach();
    };
    const detach = () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("keydown", kick);
    };
    window.addEventListener("pointerdown", kick);
    window.addEventListener("touchstart", kick);
    window.addEventListener("keydown", kick);
    return detach;
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      <video
        ref={videoRef}
        src="/wrw-assets/turntable/vinyl.mp4"
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
      <audio ref={audioRef} src="/wrw-assets/turntable/tower-of-roses.mp3" loop preload="auto" />
    </div>
  );
}
