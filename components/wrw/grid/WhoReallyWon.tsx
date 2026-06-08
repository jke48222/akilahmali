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
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { GridApi } from "@/components/wrw/grid/GridScene";
import { BlastOverlay } from "@/components/wrw/grid/BlastOverlay";
import { GridHUD } from "@/components/wrw/grid/GridHUD";
import { Landing, INK_DRAW_MS } from "@/components/wrw/grid/Landing";
import { WrwCRT } from "@/components/wrw/WrwCRT";
import { FEEDS, feedIndexForReleaseSlug } from "@/lib/wrw/grid";
import { prefersReducedMotion } from "@/lib/device";

// The WebGL room (three.js + drei + fiber + gsap, ~1.5MB) is split into its OWN
// chunk and lazy-loaded so it NEVER blocks the paper cover. The cover/ink mark
// paints the instant this lightweight component's chunk arrives, while the room
// streams in behind it (it's fully occluded by the cover anyway until the tear).
const GridScene = dynamic(
  () => import("@/components/wrw/grid/GridScene").then((m) => m.GridScene),
  { ssr: false },
);

// 1-sample silent wav — played once on ENTER to unlock the audio element so
// the later, post-zoom play() (outside the click's gesture window) is allowed.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function WhoReallyWon() {
  const [entered, setEntered] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [active, setActive] = useState<number | null>(null); // active song feed index
  // Defer mounting the WebGL scene until the browser is idle, so parsing ~1MB of
  // three.js doesn't jank the cover's draw-on ink animation. It's still ready
  // well before the visitor finishes reading the cover and clicks ENTER (and we
  // also force-mount the instant they enter, in case they're fast).
  const [sceneReady, setSceneReady] = useState(false);
  const apiRef = useRef<GridApi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Mount the WebGL scene only AFTER the ink finishes drawing. The draw-on
    // animates stroke-dashoffset on the MAIN thread, so parsing ~1MB of three.js
    // mid-draw janks it (a hitch wherever the parse lands). Once drawn, the cover
    // sits static while the visitor reads — the safe window to parse three. The
    // later paper tear is a CSS transform on the COMPOSITOR, so the parse can't
    // jank it. (We also force-mount the instant they ENTER, below, via the gate.)
    const reduced = prefersReducedMotion();
    const delay = reduced ? 150 : INK_DRAW_MS + 250;
    const id = window.setTimeout(() => setSceneReady(true), delay);
    return () => window.clearTimeout(id);
  }, []);

  // Deep link: /music/who-really-won?song=last-year (or ?feed=N) opens straight
  // into that blast once the visitor has entered (so audio is unlocked first).
  const bootFeedRef = useRef<number | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const song = params.get("song");
    const feedParam = params.get("feed");
    let idx: number | null = null;
    if (song) idx = feedIndexForReleaseSlug(song);
    else if (feedParam !== null) {
      const n = Number.parseInt(feedParam, 10);
      if (Number.isInteger(n) && n >= 0 && n < FEEDS.length) idx = n;
    }
    bootFeedRef.current = idx;
  }, []);

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

  // Match the mobile browser chrome (iOS status bar + toolbar) to this page so it
  // reads full-screen: cream while the paper cover is up, the room's near-black
  // once it's torn away. Restore the site's default on leave.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) return;
    const original = meta.content;
    meta.content = showLanding ? "#e9e3d6" : "#05070b";
    return () => {
      meta.content = original;
    };
  }, [showLanding]);

  // the blue desk button → the bare vinyl loop page
  function handleButton() {
    router.push("/music/who-really-won/turntable");
  }

  // called inside the ENTER click gesture: unlock audio + go live.
  // Play the silent clip UNMUTED within the gesture so the element is blessed
  // for later unmuted programmatic playback (when a feed is zoomed/scrolled to,
  // outside a direct gesture). A muted unlock only permits muted autoplay, which
  // is why the songs were coming up silent.
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

  // Once live (tear finished, audio unlocked), jump straight to the deep-linked
  // blast — consuming it so "Back to Feed" returns to the grid as normal.
  useEffect(() => {
    if (live && bootFeedRef.current !== null && active === null) {
      setActive(bootFeedRef.current);
      bootFeedRef.current = null;
    }
  }, [live, active]);

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-black text-white">
      {(sceneReady || entered) && (
        <GridScene
          apiRef={apiRef}
          enabled={live && !blastOpen}
          rendering={entered && !blastOpen}
          onSelect={handleSelect}
          onButton={handleButton}
        />
      )}
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
