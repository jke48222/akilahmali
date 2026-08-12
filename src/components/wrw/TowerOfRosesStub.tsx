"use client";

/* =========================================================================
   /music/tower-of-roses — the "Tower of Roses" release stub, standalone.
   Renders the SAME blast overlay the control room opens from the desk's blue
   button, so the single has a shareable page designed exactly like the
   Who Really Won feed blasts. Cycling feeds works here too (the blast is
   self-contained DOM); "Back to Feed" leads into the control room.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BlastOverlay } from "@/components/wrw/grid/BlastOverlay";
import { ALL_FEEDS, TOWER_FEED_INDEX } from "@/lib/wrw/grid";

export function TowerOfRosesStub() {
  const router = useRouter();
  const [index, setIndex] = useState(TOWER_FEED_INDEX);

  // The blast plays audio through a shared <audio> element. In the control
  // room that element is unlocked by the ENTER click; here there's no gesture
  // yet, so create it lazily before the blast mounts (render-time init — child
  // effects run before ours) and kick playback on the first gesture below.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (typeof window !== "undefined" && audioRef.current === null) {
    audioRef.current = new Audio();
  }

  // autoplay with sound is usually blocked on a fresh navigation — start the
  // audio on the first pointer / touch / key gesture, then stop listening
  // (same trick the old turntable page used).
  useEffect(() => {
    const kick = () => {
      const a = audioRef.current;
      if (!a || !a.src) return;
      a.play()
        .then(() => detach())
        .catch(() => {});
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

  // the control room's surveillance-reticle cursor + near-black browser chrome,
  // so the stub feels like the same world (see globals.css)
  useEffect(() => {
    document.body.classList.add("wrw-cursor");
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const original = meta?.content;
    if (meta) meta.content = "#05070b";
    return () => {
      document.body.classList.remove("wrw-cursor", "wrw-target");
      if (meta && original !== undefined) meta.content = original;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] bg-black">
      <BlastOverlay
        feeds={ALL_FEEDS}
        index={index}
        onIndex={setIndex}
        audioRef={audioRef}
        onBack={() => router.push("/music/who-really-won")}
      />
    </div>
  );
}
