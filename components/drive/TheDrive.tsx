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
import { RadioDial } from "@/components/drive/RadioDial";
import { STATIONS, stationIndexForSong } from "@/lib/drive/stations";

// 1-sample silent wav — played UNMUTED once on START to bless the audio element
// so the later, post-gesture play() (idle ambience / film audio, outside the
// click's gesture window) is allowed. Copied from WhoReallyWon.tsx.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function TheDrive() {
  const [entered, setEntered] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [active, setActive] = useState<number | null>(null); // open station film index
  const [tuned, setTuned] = useState(0); // currently tuned-in station
  const apiRef = useRef<DriveApi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Deep link: /music/endless-cycle?song=… (or ?station=N) tunes straight to
  // that station, and (once entered) jumps into its film — see the boot effect
  // below. Audio is unlocked on the START gesture first, so the auto-open film
  // can play. Mirrors WhoReallyWon.tsx's bootFeedRef pattern.
  const bootStationRef = useRef<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const song = params.get("song");
    const stationParam = params.get("station");
    let idx: number | null = null;
    if (song) idx = stationIndexForSong(song);
    else if (stationParam !== null) {
      const n = Number.parseInt(stationParam, 10);
      if (Number.isInteger(n) && n >= 0 && n < STATIONS.length) idx = n;
    }
    if (idx !== null) {
      setTuned(idx);
      bootStationRef.current = idx;
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

  // Idle ambience: the TUNED station's 30s preview plays low on the single
  // unlocked <audio> element while on the drive; a film raises it (M5). One
  // element, reused (no per-station elements) — swap src on tune. The analyser
  // tap for the rain/city reactivity hangs off this same element in M3.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !live) return;
    const target = STATIONS[tuned]?.preview;
    if (!target) return;
    const abs = new URL(target, window.location.href).href;
    if (a.src !== abs) {
      a.src = target;
      a.loop = true;
    }
    a.muted = false;
    a.volume = filmOpen ? 0.9 : 0.32; // a film raises the same preview (M5)
    a.play().catch(() => {});
  }, [live, tuned, filmOpen]);

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-[#0a0204] text-white">
      <DriveScene apiRef={apiRef} enabled={live && !filmOpen} rendering={entered && !filmOpen} />
      {/* CityLoop/Rain (M3), StationFilm (M5) mount here */}
      {live && !filmOpen && (
        <RadioDial stations={STATIONS} tuned={tuned} onTune={setTuned} />
      )}
      {showCover && <DriveCover onEnter={handleEnter} onDone={() => setShowCover(false)} />}
    </div>
  );
}
