"use client";

/* =========================================================================
   WHO REALLY WON? — THE SECURITY GRID
   The immersive release experience for /music/who-really-won. Orchestrates the
   layers: the paper-tear DOM intro, the R3F control room (canvas), the in-grid
   HUD, and the DOM blast overlay. The canvas mounts underneath from the start
   so the room is fully loaded behind the cover and is revealed the instant the
   paper tears.

   State:
     entered      → audio unlocked, scene live (set on the ENTER click)
     showLanding  → the paper cover is still mounted (until the tear finishes)
     active       → index of the live song feed in the blast (null = grid)
   The camera is driven imperatively through `apiRef` (see GridScene).
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GridScene, type GridApi } from "@/components/wrw/grid/GridScene";
import { BlastOverlay } from "@/components/wrw/grid/BlastOverlay";
import { GridHUD } from "@/components/wrw/grid/GridHUD";
import { Landing } from "@/components/wrw/grid/Landing";
import { WrwCRT } from "@/components/wrw/WrwCRT";
import { FEEDS } from "@/lib/wrw/grid";

// 1-sample silent wav — played once on ENTER to unlock the audio element so
// the later, post-zoom play() (outside the click's gesture window) is allowed.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function WhoReallyWon() {
  const [entered, setEntered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [active, setActive] = useState<number | null>(null); // active song feed index
  const apiRef = useRef<GridApi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

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

  // surveillance-reticle cursor, themed to the control room (see globals.css)
  useEffect(() => {
    document.body.classList.add("wrw-cursor");
    return () => {
      document.body.classList.remove("wrw-cursor", "wrw-target");
    };
  }, []);

  // the blue desk button → the bare vinyl loop page
  function handleButton() {
    router.push("/music/who-really-won/turntable");
  }

  // called inside the ENTER click gesture: unlock audio + go live
  function handleEnter() {
    const a = new Audio();
    a.loop = true;
    a.preload = "auto";
    a.muted = true;
    a.src = SILENT;
    a.play()
      .then(() => {
        a.pause();
        a.muted = false;
        a.currentTime = 0;
      })
      .catch(() => {});
    audioRef.current = a;
    setEntered(true);
  }

  // GridScene zooms into the clicked monitor, then calls this with the feed index
  function handleSelect(feedIndex: number) {
    setActive(feedIndex);
  }

  function handleBack() {
    setActive(null); // unmount overlay (its cleanup stops the audio)
    apiRef.current?.reset(); // reverse the camera to the wide shot
  }

  const live = entered && !showLanding;
  const blastOpen = active !== null;

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-black text-white">
      <GridScene
        apiRef={apiRef}
        enabled={live && !blastOpen}
        rendering={entered && !blastOpen}
        onSelect={handleSelect}
        onButton={handleButton}
      />
      {live && !blastOpen && <GridHUD />}
      {showLanding && <Landing onEnter={handleEnter} onDone={() => setShowLanding(false)} />}
      {active !== null && (
        <BlastOverlay
          feeds={FEEDS}
          index={active}
          onIndex={setActive}
          audioRef={audioRef}
          onBack={handleBack}
        />
      )}
      <WrwCRT />
    </div>
  );
}
