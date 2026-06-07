"use client";

/* =========================================================================
   THE COVER — an "incoming call" intro the visitor answers to enter the booth.
   The WebGL set is already mounted underneath (see TheBooth); this is a DOM
   layer that fades as the call connects. Contract mirrors DriveCover:
   onEnter unlocks audio INSIDE the click gesture, onDone fires once it clears.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { WordmarkLogo } from "@/components/Logo";

const NAV = [
  { label: "Music", href: "/music" },
  { label: "Videos", href: "/videos" },
  { label: "About", href: "/about" },
  { label: "Shows", href: "/shows" },
  { label: "Shop", href: "https://shop.akilahmali.com", external: true },
  { label: "Contact", href: "/contact" },
];

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function BoothCover({ onEnter, onDone }: { onEnter: () => void; onDone: () => void }) {
  const [answering, setAnswering] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  function handleAnswer() {
    if (answering) return;
    onEnter(); // unlock audio + go live — inside the gesture
    setAnswering(true);
  }

  useEffect(() => {
    if (!answering) return;
    const dur = reduceMotion() ? 150 : 900;
    const id = window.setTimeout(() => onDoneRef.current(), dur);
    return () => clearTimeout(id);
  }, [answering]);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-[#080103] font-mono text-[#f4e6ea] transition-opacity duration-700"
      style={{ opacity: answering ? 0 : 1 }}
    >
      {/* crimson bokeh wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 32% at 28% 26%, rgba(255,40,60,0.45), transparent 60%)," +
            "radial-gradient(46% 40% at 70% 82%, rgba(150,15,40,0.5), transparent 60%)",
          filter: "blur(4px)",
        }}
      />
      {/* grain + vignette */}
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
        <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-[#ff5a6e]">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[#ff2b3e]" />
          incoming call
        </p>
        <h1 className="text-[16vw] leading-[0.9] sm:text-[clamp(3rem,9vw,8rem)]" style={{ fontFamily: "var(--font-display), Georgia, serif", textShadow: "0 0 28px rgba(255,40,70,0.5)" }}>
          Dead Line
        </h1>
        <p className="mt-5 max-w-md text-[11px] uppercase leading-relaxed tracking-[0.3em] text-[#f4e6ea]/70 sm:text-xs">
          the last working payphone in a dead city. answer it.
        </p>
        <button
          type="button"
          onClick={handleAnswer}
          aria-label="Pick up the phone — enter"
          className="mt-12 animate-pulse cursor-pointer rounded-full border border-[#ff2b3e]/60 bg-[#ff2b3e]/10 px-7 py-3 text-[11px] uppercase tracking-[0.4em] text-[#ffd9df] transition-colors hover:bg-[#ff2b3e]/25 sm:text-[13px]"
        >
          [ pick up ]
        </button>
      </div>
    </div>
  );
}
