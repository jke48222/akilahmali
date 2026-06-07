"use client";

/* =========================================================================
   THE PAYPHONE — "DEAD LINE". /payphone.

   Flow:
     1. cover      — incoming call, you answer
     2. call       — the booth fills the screen + a live transcript of Akilah
                     Mali's frantic distress call (mali-call.mp3); the line is
                     severed and the operator cuts in
     3. dialing    — the camera moves INSIDE the booth to the phone + keypad;
                     you dial out. 1 → the Tower of Roses instrumental; any other
                     number → the operator ("this line is not available");
                     an empty dial → "no longer in service".
   Audio is unlocked on the ANSWER gesture; the camera is driven via apiRef.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { BoothScene, type BoothApi } from "@/components/booth/BoothScene";
import { BoothCover } from "@/components/booth/BoothCover";
import { CallTranscript } from "@/components/booth/CallTranscript";
import { RotaryDial } from "@/components/booth/RotaryDial";
import { InCall, type ActiveCall } from "@/components/booth/InCall";
import { BoothSignup } from "@/components/booth/BoothSignup";
import { BoothFallback } from "@/components/booth/BoothFallback";
import { makeToneEngine, type ToneEngine } from "@/lib/booth/tones";

const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

type CallTarget = { kind: "operator" | "music"; label: string; src: string; caption?: string };

// numbers you can dial → what answers. More real numbers/audio land here later.
const NUMBERS: Record<string, CallTarget> = {
  "1": { kind: "music", label: "Tower of Roses", src: "/booth-assets/audio/tower-of-roses.m4a" },
};
const DEFAULT_CALL: CallTarget = {
  kind: "operator",
  label: "Operator",
  src: "/booth-assets/audio/operator-default.mp3",
  caption: "I'm sorry. This line is not available. Goodbye.",
};
const INVALID_CALL: CallTarget = {
  kind: "operator",
  label: "Operator",
  src: "/booth-assets/audio/operator-invalid.mp3",
  caption: "The number you have dialed is no longer in service. Please check the number and dial again.",
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function TheBooth() {
  const [entered, setEntered] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [reduced] = useState(prefersReducedMotion);
  const [phase, setPhase] = useState<"call" | "dialing">("call");
  const [dialed, setDialed] = useState("");
  const [status, setStatus] = useState("dial tone");
  const [active, setActive] = useState<ActiveCall | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [phoneReady, setPhoneReady] = useState(false); // camera is inside; waiting for the phone click
  const apiRef = useRef<BoothApi | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // unlock + the Mali call
  const voiceRef = useRef<HTMLAudioElement | null>(null); // operator / tower beat
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toneRef = useRef<ToneEngine | null>(null);
  const callTimer = useRef<number | null>(null);
  const dialToneTimer = useRef<number | null>(null);
  const connecting = useRef(false); // true while a call is ringing out → connecting

  // a dial tone that politely stops itself after a few seconds (not forever)
  function startDialTone() {
    if (dialToneTimer.current) clearTimeout(dialToneTimer.current);
    toneRef.current?.dialTone(true);
    dialToneTimer.current = window.setTimeout(() => toneRef.current?.dialTone(false), 4000);
  }
  function stopDialTone() {
    if (dialToneTimer.current) clearTimeout(dialToneTimer.current);
    toneRef.current?.dialTone(false);
  }

  useEffect(() => {
    return () => {
      for (const a of [audioRef.current, voiceRef.current]) {
        if (a) {
          a.pause();
          a.removeAttribute("src");
          a.load();
        }
      }
      toneRef.current?.stopAll();
      if (callTimer.current) clearTimeout(callTimer.current);
      if (dialToneTimer.current) clearTimeout(dialToneTimer.current);
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("booth-cursor", "booth-type");
    return () => document.body.classList.remove("booth-cursor", "booth-target", "booth-type");
  }, []);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) return;
    const original = meta.content;
    meta.content = "#080103";
    return () => {
      meta.content = original;
    };
  }, []);

  function playVoice(src: string) {
    const v = voiceRef.current;
    if (!v) return;
    v.src = src;
    v.currentTime = 0;
    v.volume = 0.95;
    v.play().catch(() => {});
  }

  function handleEnter() {
    const a = new Audio();
    a.preload = "auto";
    a.muted = false;
    a.src = SILENT;
    a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {});
    audioRef.current = a;

    const v = new Audio();
    v.preload = "auto";
    v.muted = false;
    voiceRef.current = v;

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

  // Act 1 ended → move inside the booth. The keypad stays hidden until the
  // visitor actually clicks the phone (handlePhoneClick).
  function enterBooth() {
    setPhase("dialing");
    apiRef.current?.enter(() => setPhoneReady(true));
    setStatus("pick up the phone");
  }

  // clicking the phone in the booth → reveal the keypad + start a dial tone.
  function handlePhoneClick() {
    if (showKeypad || active) return;
    setPhoneReady(false);
    setShowKeypad(true);
    startDialTone();
    setStatus("dial tone");
  }

  function handleDigit(d: string) {
    if (active || dialed.length >= 12) return;
    toneRef.current?.dtmf(d);
    if (dialed.length === 0) stopDialTone();
    setDialed((s) => s + d);
    setStatus("dialing");
  }

  function handleClear() {
    setDialed((s) => s.slice(0, -1));
  }

  function handleCall() {
    if (active || connecting.current) return;
    stopDialTone();

    // empty dial → the "no longer in service" intercept
    if (!dialed) {
      setStatus("not in service");
      const tone = toneRef.current;
      if (tone) tone.intercept().then(() => playVoice(INVALID_CALL.src));
      else playVoice(INVALID_CALL.src);
      setActive({ kind: "operator", label: INVALID_CALL.label, caption: INVALID_CALL.caption, number: dialed });
      return;
    }

    const target = NUMBERS[dialed] ?? DEFAULT_CALL;
    setStatus("calling…");
    connecting.current = true;
    toneRef.current?.ringback(true);
    if (callTimer.current) clearTimeout(callTimer.current);
    callTimer.current = window.setTimeout(() => {
      callTimer.current = null;
      connecting.current = false;
      toneRef.current?.ringback(false);
      playVoice(target.src);
      setActive({ kind: target.kind, label: target.label, caption: target.caption, number: dialed });
    }, 1700);
  }

  // end the active call, back to a fresh dial tone (still inside the booth)
  function handleHangup() {
    if (callTimer.current) {
      clearTimeout(callTimer.current);
      callTimer.current = null;
    }
    connecting.current = false;
    toneRef.current?.stopAll();
    const v = voiceRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setActive(null);
    setDialed("");
    setStatus("dial tone");
    startDialTone();
    setShowKeypad(true);
  }

  if (reduced) {
    return (
      <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-y-auto">
        <BoothFallback />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] h-[100dvh] w-screen overflow-hidden bg-[#080103] text-white">
      <BoothScene
        apiRef={apiRef}
        enabled={phase === "dialing" && !active}
        rendering={entered}
        interactive={phase === "dialing" && phoneReady && !showKeypad && !active}
        onPhoneClick={handlePhoneClick}
        sway={live && phase === "call"}
      />

      {live && phase === "call" && <CallTranscript audioRef={audioRef} onDone={enterBooth} />}

      {/* before the keypad: a prompt to click the phone in the booth */}
      {live && phase === "dialing" && phoneReady && !showKeypad && !active && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <p
            className="animate-pulse font-mono text-[11px] uppercase tracking-[0.32em] text-[#ffd9df]"
            style={{ textShadow: "0 0 14px #ff2b3e99" }}
          >
            pick up the phone
          </p>
        </div>
      )}

      {live && phase === "dialing" && !active && showKeypad && (
        <RotaryDial
          dialed={dialed}
          status={status}
          onDigit={handleDigit}
          onCall={handleCall}
          onClear={handleClear}
          onHangup={handleHangup}
        />
      )}
      {active && <InCall call={active} onHangup={handleHangup} />}

      {/* leave-your-number (email → mailing list); auto-offered once on entry */}
      {live && phase === "dialing" && !signupOpen && (
        <button
          type="button"
          onClick={() => setSignupOpen(true)}
          className="fixed right-5 top-5 z-20 rounded-full border border-[#ff2b3e]/40 bg-[#0a0103]/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[#ffd9df] backdrop-blur-md transition-colors hover:bg-[#ff2b3e]/20"
        >
          ✉ leave your number
        </button>
      )}
      {signupOpen && <BoothSignup onClose={() => setSignupOpen(false)} />}

      {showCover && <BoothCover onEnter={handleEnter} onDone={() => setShowCover(false)} />}
    </div>
  );
}
