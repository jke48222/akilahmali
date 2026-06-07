"use client";

/* =========================================================================
   THE PAYPHONE — "DEAD LINE". The immersive experience at /payphone.

   A post-apocalyptic crimson phone booth: answer the incoming call, then (in
   Booth-2) pick up the receiver and dial. The canvas mounts under the cover
   from the start so the set is warmed up and revealed the instant the call
   connects. The camera is driven imperatively through apiRef (see BoothScene).

   State machine mirrors TheDrive:
     entered    → audio unlocked, set live (on the PICK UP gesture)
     showCover  → the incoming-call cover is still mounted
     connected  → a dialed number's reveal is open (Booth-2/3)
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { BoothScene, type BoothApi } from "@/components/booth/BoothScene";
import { BoothCover } from "@/components/booth/BoothCover";

// 1-sample silent wav — bless the audio element on the gesture for later
// programmatic playback (ring / dial tone / DTMF), copied from TheDrive.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function TheBooth() {
  const [entered, setEntered] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [connected] = useState(false); // a dialed-number reveal is open (Booth-2/3)
  const apiRef = useRef<BoothApi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load();
      }
    };
  }, []);

  // crimson reticle cursor (reuse the drive cursor styles)
  useEffect(() => {
    document.body.classList.add("drive-cursor");
    return () => document.body.classList.remove("drive-cursor", "drive-target");
  }, []);

  // theme-color → the booth's near-black crimson
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) return;
    const original = meta.content;
    meta.content = "#080103";
    return () => {
      meta.content = original;
    };
  }, []);

  function handleEnter() {
    const a = new Audio();
    a.loop = false;
    a.preload = "auto";
    a.muted = false;
    a.src = SILENT;
    a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
    audioRef.current = a;
    setEntered(true);
  }

  const live = entered && !showCover;

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-[#080103] text-white">
      <BoothScene apiRef={apiRef} enabled={live && !connected} rendering={entered && !connected} />
      {/* receiver pickup + keypad HUD (Booth-2) and the connect reveal (Booth-3)
          mount here once live */}
      {showCover && <BoothCover onEnter={handleEnter} onDone={() => setShowCover(false)} />}
    </div>
  );
}
