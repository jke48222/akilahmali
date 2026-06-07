"use client";

/* =========================================================================
   ACT 1 — THE DISTRESS CALL. The booth fills the screen (canvas behind) and a
   LIVE TRANSCRIPT of the incoming call types itself out, synced to
   mali-call.mp3: Akilah Mali, frantic, fighting a failing line — then the line
   is severed and the automated operator cuts in. When the audio ends, onDone
   advances the experience into the booth (the keypad).

   We have no per-line timestamps yet, so each caption is revealed proportionally
   to its length against the real audio duration (auto-syncs to the file, and is
   trivially overridable with explicit `t` seconds once timestamps exist).
   ========================================================================= */

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

type Seg = { who: "mali" | "operator"; text: string; t?: number };

// spoken lines only (stage directions stripped); order matches mali-call.mp3
const SEGMENTS: Seg[] = [
  { who: "mali", text: "Hello?" },
  { who: "mali", text: "Hello? Can you hear me?" },
  { who: "mali", text: "Okay. Okay — the line's holding. Please, please don't hang up." },
  { who: "mali", text: "I don't know how long I've got, and they're tracing this line." },
  { who: "mali", text: "I didn't think anyone would pick up. I wasn't even sure this number still rang." },
  { who: "mali", text: "If you can hear me… then it worked." },
  { who: "mali", text: "It's Akilah Mali." },
  { who: "mali", text: "They're trying to shut the whole thing down before the album gets out." },
  { who: "mali", text: "I hid the master tracks, but I can't stay here." },
  { who: "mali", text: "I keep losing things. Days, names… the same night over and over, like the tape won't move forward." },
  { who: "mali", text: "Every time I get close to remembering, the line cuts." },
  { who: "mali", text: "Listen to me. I need you to remember something, because I can't." },
  { who: "mali", text: "October seventeenth." },
  { who: "mali", text: "Don't write it down — they'll see it. Just hold it." },
  { who: "mali", text: "October seventeenth — the line will be open again. Promise me you'll call back." },
  { who: "mali", text: "Have you ever heard a place before you've seen it?" },
  { who: "mali", text: "There's a tower. I don't know what city. But I hear it every night." },
  { who: "mali", text: "Roses all the way up the side of it, and it's singing. Like it's calling me home." },
  { who: "mali", text: "I wasn't supposed to be the one who answered. That's what scares me." },
  { who: "mali", text: "Because if I'm on this end of the line… then someone else is on the other." },
  { who: "mali", text: "Wait. Did you hear that?" },
  { who: "mali", text: "No. No, no, no — they found the booth. I'm not ready—" },
  { who: "mali", text: "If the seventeenth comes and I haven't made it back—" },
  { who: "mali", text: "Hello?! HELLO?!" },
  { who: "mali", text: "Please don't let the line—" },
  { who: "operator", text: "We're sorry. The number you have reached is not available. Please call back later. Goodbye." },
];

export function CallTranscript({
  audioRef,
  onDone,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  onDone: () => void;
}) {
  const [count, setCount] = useState(0); // how many segments revealed
  const [ended, setEnded] = useState(false);
  const startsRef = useRef<number[]>([]);
  const advanced = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  function finish() {
    if (advanced.current) return;
    advanced.current = true;
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    doneRef.current();
  }

  // cumulative character fractions → reveal schedule (filled once duration known)
  const fracs = useMemo(() => {
    const lens = SEGMENTS.map((s) => s.text.length + 8); // +8 ≈ inter-line breath
    const total = lens.reduce((a, b) => a + b, 0);
    let acc = 0;
    return lens.map((l) => {
      const f = acc / total;
      acc += l;
      return f;
    });
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = "/booth-assets/audio/mali-call.mp3";
    a.loop = false;
    a.muted = false;
    a.volume = 1;
    a.currentTime = 0;

    const buildStarts = () => {
      const d = a.duration && Number.isFinite(a.duration) ? a.duration : 103;
      startsRef.current = SEGMENTS.map((s, i) => (typeof s.t === "number" ? s.t : fracs[i] * d));
    };
    const onTime = () => {
      const now = a.currentTime;
      let n = 0;
      for (let i = 0; i < startsRef.current.length; i++) if (now >= startsRef.current[i]) n = i + 1;
      setCount((c) => (n > c ? n : c));
    };
    const onEnd = () => {
      setCount(SEGMENTS.length);
      setEnded(true);
      // let the operator line + dead air sit, then move inside the booth
      window.setTimeout(finish, 2600);
    };

    a.addEventListener("loadedmetadata", buildStarts);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    buildStarts();
    a.play().catch(() => {});

    return () => {
      a.removeEventListener("loadedmetadata", buildStarts);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, [audioRef, fracs]);

  function skip() {
    finish();
  }

  const visible = SEGMENTS.slice(0, count);
  const current = visible.length > 0 ? visible[visible.length - 1] : null;
  const lastIsOperator = current?.who === "operator";

  return (
    <div className="pointer-events-none fixed inset-0 z-30 font-mono text-[#f4e6ea]">
      {/* live indicator (top of the booth box) */}
      <div className="absolute left-1/2 top-7 flex -translate-x-1/2 items-center gap-2 text-[10px] uppercase tracking-[0.4em]" style={{ color: lastIsOperator ? "#a8202c" : "#cf2233" }}>
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#ff2b3e]" />
        {lastIsOperator ? "line lost" : "incoming · tracing"}
      </div>

      {/* CAPTION STRIP — bottom box: only the current line, all dark red */}
      <div className="absolute inset-x-0 bottom-0 flex h-[16vh] min-h-[110px] items-center justify-center px-6 text-center" aria-live="polite">
        {/* faint scrim so captions read over the booth */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,1,3,0.9), transparent)" }} />
        {current && (
          <p
            key={count}
            className="relative leading-snug transition-opacity duration-300"
            style={{
              color: current.who === "operator" ? "#a8202c" : "#cf2233",
              fontFamily: current.who === "operator" ? undefined : "var(--font-display), Georgia, serif",
              fontSize: current.who === "operator" ? "14px" : "clamp(20px, 3vw, 34px)",
              letterSpacing: current.who === "operator" ? "0.24em" : "normal",
              textTransform: current.who === "operator" ? "uppercase" : "none",
              textShadow: "0 0 24px rgba(180,18,30,0.55)",
              maxWidth: "44rem",
            }}
          >
            {current.who === "operator" ? current.text : `“${current.text}”`}
          </p>
        )}
      </div>

      {/* skip */}
      <button
        type="button"
        onClick={skip}
        className="pointer-events-auto absolute bottom-7 right-7 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-[#cf2233]/70 transition-colors hover:text-[#ff5566]"
      >
        {ended ? "enter the booth ▸" : "skip ▸"}
      </button>
    </div>
  );
}
