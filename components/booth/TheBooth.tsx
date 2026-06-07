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
import { KeypadHUD } from "@/components/booth/KeypadHUD";
import { BoothReveal } from "@/components/booth/BoothReveal";
import { makeToneEngine, type ToneEngine } from "@/lib/booth/tones";

// 1-sample silent wav — bless the audio element on the gesture for later
// programmatic playback (ring / dial tone / DTMF), copied from TheDrive.
const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function TheBooth() {
  const [entered, setEntered] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [connected, setConnected] = useState(false); // the dialed-number reveal is open
  const [dialed, setDialed] = useState("");
  const [status, setStatus] = useState("dial tone");
  const apiRef = useRef<BoothApi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toneRef = useRef<ToneEngine | null>(null);
  const callTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load();
      }
      toneRef.current?.stopAll();
      if (callTimer.current) clearTimeout(callTimer.current);
      audioCtxRef.current?.close().catch(() => {});
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

    // build the telephone tone engine inside the gesture (AudioContext needs it)
    try {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        if (ctx.state === "suspended") void ctx.resume();
        audioCtxRef.current = ctx;
        toneRef.current = makeToneEngine(ctx);
      }
    } catch {
      /* tones are a progressive enhancement */
    }

    setEntered(true);
  }

  const live = entered && !showCover;

  // Once the call connects (cover gone), lean into the keypad + dial tone.
  useEffect(() => {
    if (!live || connected) return;
    apiRef.current?.lean();
    toneRef.current?.dialTone(true);
    setStatus("dial tone");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  function handleDigit(d: string) {
    if (connected || dialed.length >= 12) return;
    toneRef.current?.dtmf(d);
    if (dialed.length === 0) toneRef.current?.dialTone(false);
    setDialed((s) => s + d);
    setStatus("dialing");
  }

  function handleClear() {
    setDialed((s) => s.slice(0, -1));
  }

  function handleCall() {
    if (connected) return;
    if (!dialed) {
      setStatus("not in service");
      void toneRef.current?.intercept();
      return;
    }
    toneRef.current?.dialTone(false);
    toneRef.current?.ringback(true);
    setStatus("calling…");
    if (callTimer.current) clearTimeout(callTimer.current);
    callTimer.current = window.setTimeout(() => {
      toneRef.current?.ringback(false);
      setConnected(true);
    }, 3400);
  }

  // back to the booth from the keypad (✕) or the reveal: fresh dead line
  function handleHangup() {
    if (callTimer.current) clearTimeout(callTimer.current);
    toneRef.current?.stopAll();
    setConnected(false);
    setDialed("");
    setStatus("dial tone");
    apiRef.current?.lean();
    toneRef.current?.dialTone(true);
  }

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-[#080103] text-white">
      <BoothScene apiRef={apiRef} enabled={live && !connected} rendering={entered && !connected} />
      {live && !connected && (
        <KeypadHUD
          dialed={dialed}
          status={status}
          onDigit={handleDigit}
          onCall={handleCall}
          onClear={handleClear}
          onHangup={handleHangup}
        />
      )}
      {connected && <BoothReveal dialed={dialed} onHangup={handleHangup} />}
      {showCover && <BoothCover onEnter={handleEnter} onDone={() => setShowCover(false)} />}
    </div>
  );
}
