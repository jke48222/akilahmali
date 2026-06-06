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
import { StationFilm } from "@/components/drive/StationFilm";
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

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

  // Release the unlocked audio element + audio graph on unmount.
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load();
      }
      audioCtxRef.current?.close().catch(() => {});
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

    // Build the Web Audio graph INSIDE the gesture (createMediaElementSource +
    // resume both require it) so the rain/city can react to the live frequency
    // data. One source per element; the element's output now routes through the
    // analyser to the speakers. Mirrors PlayerProvider.ensureGraph.
    try {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        const source = ctx.createMediaElementSource(a);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        if (ctx.state === "suspended") void ctx.resume();
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
      }
    } catch {
      /* analyser is a progressive enhancement — the drive still runs without it */
    }

    setEntered(true);
  }

  // Analog static between stations: a short band-passed white-noise burst on the
  // shared AudioContext, masking the ambience src swap — the radio "tuning" sound.
  function playStatic() {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const dur = 0.22;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1700;
    bp.Q.value = 0.5;
    const g = ctx.createGain();
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(now);
    src.stop(now + dur);
  }

  function handleTune(next: number) {
    if (next === tuned) return;
    playStatic();
    setTuned(next);
  }

  // Select the tuned station → push the camera through the windshield, then
  // mount its film as the push lands (seamless hand-off, like GridScene.focus).
  function openStation(i: number) {
    setTuned(i);
    apiRef.current?.focus(i, () => setActive(i));
  }

  // Inside a film, prev/next tunes to the adjacent station's film.
  function handleFilmIndex(i: number) {
    if (i !== tuned) playStatic();
    setTuned(i);
    setActive(i);
  }

  // Back to the drive: unmount the film (its audio keeps looping as ambience)
  // and reverse the camera to the passenger seat.
  function handleBack() {
    setActive(null);
    apiRef.current?.reset();
  }

  const live = entered && !showCover;
  const filmOpen = active !== null;

  // Deep link: once live, if a ?song=/?station= target was set, drive straight
  // into its film — consuming it so "back to the drive" returns normally.
  useEffect(() => {
    if (live && bootStationRef.current !== null && active === null) {
      const i = bootStationRef.current;
      bootStationRef.current = null;
      openStation(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, active]);

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

  const skin = STATIONS[tuned] ?? STATIONS[0];

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-[#0a0204] text-white">
      <DriveScene
        apiRef={apiRef}
        enabled={live && !filmOpen}
        rendering={entered && !filmOpen}
        analyserRef={analyserRef}
        accent={skin.accent}
        accent2={skin.accent2}
        skyColor={skin.skyColor}
      />
      {/* CityLoop/Rain (M3), StationFilm (M5) mount here */}
      {live && !filmOpen && (
        <RadioDial stations={STATIONS} tuned={tuned} onTune={handleTune} onSelect={openStation} />
      )}
      {filmOpen && (
        <StationFilm
          stations={STATIONS}
          index={active}
          onIndex={handleFilmIndex}
          onBack={handleBack}
          audioRef={audioRef}
        />
      )}
      {showCover && <DriveCover onEnter={handleEnter} onDone={() => setShowCover(false)} />}
    </div>
  );
}
