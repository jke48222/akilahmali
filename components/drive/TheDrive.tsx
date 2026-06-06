"use client";

/* =========================================================================
   THE DRIVE — the immersive release experience for /music/endless-cycle.

   A first-person endless night drive through a rain-soaked, neon-crimson city.
   The car never arrives — it loops the same on-ramp forever (the album's
   "Endless Cycle"). Each song is a station on the car radio; tuning re-skins
   the city, selecting pushes the camera through the windshield into that song's
   full-screen film.

   This orchestrator owns the layer state machine and mirrors
   components/wrw/grid/WhoReallyWon.tsx:
     entered       → audio unlocked, scene live (set on the START gesture)
     showCover     → the rain-on-glass cover is still mounted (until it wipes)
     activeStation → index of the open station film (null = on the drive)
   The canvas mounts underneath from the start so the world is fully loaded
   behind the cover and is revealed the instant the wiper sweeps it away.
   The camera is driven imperatively through `apiRef` (see DriveScene).
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { DriveScene, type DriveApi } from "@/components/drive/DriveScene";
import { DriveCover } from "@/components/drive/DriveCover";

// 1-sample silent wav — played UNMUTED once on START to bless the audio element
// so the later, post-gesture play() (idle ambience / film audio, outside the
// click's gesture window) is allowed. Copied from WhoReallyWon.tsx.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function TheDrive() {
  const [entered, setEntered] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [active, setActive] = useState<number | null>(null); // open station film index
  const apiRef = useRef<DriveApi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Deep link: /music/endless-cycle?song=… (or ?station=N) jumps straight into
  // that station's film once entered (so audio is unlocked first). The ?song →
  // index mapping lands with stations.ts in M2; for now we honour ?station=N.
  const bootStationRef = useRef<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stationParam = params.get("station");
    if (stationParam !== null) {
      const n = Number.parseInt(stationParam, 10);
      if (Number.isInteger(n) && n >= 0) bootStationRef.current = n;
    }
  }, []);

  // Release the unlocked audio element on unmount.
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

  // Crimson driving cursor, themed to the wet-night world (see globals.css).
  useEffect(() => {
    document.body.classList.add("drive-cursor");
    return () => {
      document.body.classList.remove("drive-cursor", "drive-target");
    };
  }, []);

  // Match the mobile browser chrome to the world so it reads full-screen: the
  // deep wet-night crimson for the whole experience. Restore on leave.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) return;
    const original = meta.content;
    meta.content = "#0a0204";
    return () => {
      meta.content = original;
    };
  }, []);

  // Called INSIDE the START click gesture: unlock audio + go live. Play the
  // silent clip UNMUTED within the gesture so the element is blessed for later
  // unmuted programmatic playback (idle ambience / film audio).
  function handleEnter() {
    const a = new Audio();
    a.loop = true;
    a.preload = "auto";
    a.muted = false;
    a.src = SILENT;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
      })
      .catch(() => {});
    audioRef.current = a;
    setEntered(true);
  }

  const live = entered && !showCover;
  const filmOpen = active !== null;

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-[#0a0204] text-white">
      <DriveScene apiRef={apiRef} enabled={live && !filmOpen} rendering={entered && !filmOpen} />
      {/* RadioDial HUD (M2), CityLoop/Rain (M3), StationFilm (M5) mount here */}
      {showCover && <DriveCover onEnter={handleEnter} onDone={() => setShowCover(false)} />}
    </div>
  );
}
