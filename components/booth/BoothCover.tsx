"use client";

/* =========================================================================
   THE COVER — an incoming call you answer. Minimal: the header nav, an
   "Incoming Call" indicator, and a "Pick Up" button. A ringback tone rings for
   ~10 seconds and then the call auto-answers. onEnter unlocks audio INSIDE the
   click gesture; onDone fires once the cover clears.

   NOTE on autoplay: browsers only allow sound after the page has had a user
   interaction. The ring + audio play reliably once the visitor has interacted
   anywhere (clicking Pick Up always works); on a stone-cold direct load with no
   interaction, the ring may be silent until the first move/click — we resume on
   the first interaction to cover that.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { WordmarkLogo } from "@/components/Logo";
import { prefersReducedMotion as reduceMotion } from "@/lib/device";

const NAV = [
  { label: "Music", href: "/music" },
  { label: "Videos", href: "/videos" },
  { label: "About", href: "/about" },
  { label: "Shows", href: "/shows" },
  { label: "Shop", href: "https://shop.akilahmali.com", external: true },
  { label: "Contact", href: "/contact" },
];

export function BoothCover({ onEnter, onDone }: { onEnter: () => void; onDone: () => void }) {
  const [answering, setAnswering] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const ctxRef = useRef<AudioContext | null>(null);
  const ringTimer = useRef<number | null>(null);
  const ringNodes = useRef<OscillatorNode[]>([]);
  const autoTimer = useRef<number | null>(null);
  const answeredRef = useRef(false);

  // ---- ringback (440+480 Hz, 2s on / 4s off) + 10s auto-answer ----
  useEffect(() => {
    let cancelled = false;
    const AC: typeof AudioContext | undefined =
      typeof window !== "undefined"
        ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        : undefined;
    if (AC) {
      const ctx = new AC();
      ctxRef.current = ctx;
      const ring = () => {
        if (cancelled || ctx.state !== "running") return;
        const g = ctx.createGain();
        g.gain.value = 0.16;
        g.connect(ctx.destination);
        const a = ctx.createOscillator();
        const b = ctx.createOscillator();
        a.frequency.value = 440;
        b.frequency.value = 480;
        a.connect(g);
        b.connect(g);
        a.start();
        b.start();
        ringNodes.current = [a, b];
        window.setTimeout(() => {
          a.stop();
          b.stop();
        }, 2000);
      };
      const loop = () => {
        ring();
        ringTimer.current = window.setTimeout(loop, 6000);
      };
      const tryStart = () => {
        ctx.resume().then(() => {
          if (!cancelled && ringNodes.current.length === 0) loop();
        }).catch(() => {});
      };
      tryStart();
      // cold-load fallback: resume on the first interaction anywhere
      window.addEventListener("pointerdown", tryStart, { once: true });
      window.addEventListener("keydown", tryStart, { once: true });
    }
    // auto-answer after 10s of ringing
    autoTimer.current = window.setTimeout(() => answer(), 10000);
    return () => {
      cancelled = true;
      if (ringTimer.current) clearTimeout(ringTimer.current);
      if (autoTimer.current) clearTimeout(autoTimer.current);
      ringNodes.current.forEach((o) => {
        try { o.stop(); } catch { /* already stopped */ }
      });
      ctxRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function answer() {
    if (answeredRef.current) return;
    answeredRef.current = true;
    if (ringTimer.current) clearTimeout(ringTimer.current);
    if (autoTimer.current) clearTimeout(autoTimer.current);
    ringNodes.current.forEach((o) => {
      try { o.stop(); } catch { /* already stopped */ }
    });
    ctxRef.current?.close().catch(() => {});
    onEnter(); // unlock audio + go live (inside the gesture, when clicked)
    setAnswering(true);
    const dur = reduceMotion() ? 150 : 900;
    window.setTimeout(() => onDoneRef.current(), dur);
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-[#080103] font-mono text-[#f4e6ea] transition-opacity duration-700"
      style={{ opacity: answering ? 0 : 1 }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(40% 32% at 28% 26%, rgba(255,40,60,0.4), transparent 60%), radial-gradient(46% 40% at 70% 82%, rgba(150,15,40,0.46), transparent 60%)", filter: "blur(4px)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 50% 45%, transparent 46%, rgba(8,1,3,0.86) 100%)" }} />

      <nav className="pointer-events-auto absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 pt-7 text-[10px] uppercase tracking-[0.28em] text-[#f4e6ea]/70 sm:gap-x-7 sm:text-[11px]">
        <WordmarkLogo className="text-[17px]" />
        {NAV.map((n) => (
          <a key={n.href} href={n.href} {...(n.external ? { target: "_blank", rel: "noreferrer" } : {})} className="transition-opacity hover:text-white">
            {n.label}
          </a>
        ))}
      </nav>

      <div className="relative flex flex-col items-center px-6 text-center">
        <p className="mb-8 flex items-center gap-2.5 text-[11px] uppercase tracking-[0.5em] text-[#ff5a6e] sm:text-[13px]">
          <span className="inline-block h-2.5 w-2.5 animate-ping rounded-full bg-[#ff2b3e]" />
          Incoming Call
        </p>
        <button
          type="button"
          onClick={answer}
          aria-label="Pick up the phone"
          className="animate-pulse cursor-pointer rounded-full border border-[#ff2b3e]/60 bg-[#ff2b3e]/10 px-9 py-3.5 text-[12px] uppercase tracking-[0.4em] text-[#ffd9df] transition-colors hover:bg-[#ff2b3e]/25 sm:text-[14px]"
        >
          Pick Up
        </button>
      </div>
    </div>
  );
}
