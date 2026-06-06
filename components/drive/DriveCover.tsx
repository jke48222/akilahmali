"use client";

/* =========================================================================
   THE COVER — a rain-on-glass intro the visitor wipes open to reveal the live
   night drive beneath. The WebGL canvas is already mounted underneath from the
   start (see TheDrive), so the city is fully warmed up; the cover is purely a
   DOM layer that dissolves with a windshield-WIPER swipe.

   This is The Drive's analogue of components/wrw/grid/Landing.tsx — same
   contract (onEnter unlocks audio INSIDE the click gesture, onDone fires once
   the reveal finishes), same deterministic CSS-transition + setTimeout
   sequencing (no rAF, so it still runs if the tab is backgrounded), but a
   wiper-swipe reveal instead of a paper tear.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { WordmarkLogo } from "@/components/Logo";

const NAV = [
  { label: "Music", href: "/music" },
  { label: "Videos", href: "/videos" },
  { label: "About", href: "/about" },
  { label: "Shows", href: "/shows" },
  { label: "Shop", href: "https://shop.akilahmali.com", external: true },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
];

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function DriveCover({ onEnter, onDone }: { onEnter: () => void; onDone: () => void }) {
  const [wiping, setWiping] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  function handleStart() {
    if (wiping) return;
    onEnter(); // unlock audio + go live — INSIDE the click gesture
    setWiping(true);
  }

  // Once the wipe starts, reveal then unmount. setTimeout (not rAF) so it fires
  // even if the tab is backgrounded — mirrors Landing's deterministic sequence.
  useEffect(() => {
    if (!wiping) return;
    const dur = reduceMotion() ? 200 : 1300;
    const done = window.setTimeout(() => onDoneRef.current(), dur);
    return () => clearTimeout(done);
  }, [wiping]);

  // The glass clears left→right as the wiper sweeps across it.
  const glassWipe = {
    clipPath: wiping ? "inset(0 0 0 100%)" : "inset(0 0 0 0)",
    transition: reduceMotion() ? "opacity 0.2s linear" : "clip-path 1.1s cubic-bezier(0.5,0,0.2,1) 0.1s",
    opacity: wiping && reduceMotion() ? 0 : 1,
  } as const;

  // A wiper blade sweeps across in front of the clearing glass.
  const wiperSweep = {
    transform: wiping ? "translateX(108vw) rotate(8deg)" : "translateX(-30vw) rotate(8deg)",
    transition: reduceMotion() ? "none" : "transform 1.1s cubic-bezier(0.5,0,0.2,1) 0.1s",
    opacity: reduceMotion() ? 0 : 1,
  } as const;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden font-mono text-[#f4e6ea] select-none">
      {/* ---- the rain-on-glass pane (clears as the wiper sweeps) ---- */}
      <div className="absolute inset-0" style={glassWipe}>
        {/* deep wet-night crimson base */}
        <div className="absolute inset-0 bg-[#0a0204]" />
        {/* blurred neon city-light bokeh seen THROUGH the wet glass */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 30% at 22% 30%, rgba(255,60,80,0.55), transparent 60%)," +
              "radial-gradient(30% 24% at 74% 26%, rgba(255,140,60,0.42), transparent 60%)," +
              "radial-gradient(46% 40% at 60% 78%, rgba(180,20,50,0.5), transparent 60%)," +
              "radial-gradient(28% 22% at 38% 66%, rgba(90,40,255,0.28), transparent 60%)",
            filter: "blur(6px)",
          }}
        />
        {/* rain streaks running down the glass (vertical soft lines) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.5] mix-blend-screen"
          style={{
            backgroundImage:
              "repeating-linear-gradient(98deg, transparent 0 7px, rgba(255,210,220,0.05) 7px 8px, transparent 8px 15px)",
          }}
        />
        {/* beaded droplets via fractal-noise displacement-ish speckle */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35] mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='d'><feTurbulence type='turbulence' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.8  0 0 0 0 0.85  0 0 0 18 -7'/></filter><rect width='100%25' height='100%25' filter='url(%23d)'/></svg>\")",
          }}
        />
        {/* film grain + vignette */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.4] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 120% at 50% 42%, transparent 48%, rgba(8,2,4,0.82) 100%)" }}
        />

        {/* ---- title + entry affordance ---- */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 text-[10px] uppercase tracking-[0.5em] text-[#ff7d92] sm:text-[11px]">
            Akilah Mali presents
          </p>
          <h1
            className="text-[15vw] leading-[0.92] tracking-tight sm:text-[clamp(3rem,9vw,8rem)]"
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              textShadow: "0 0 28px rgba(255,40,70,0.45), 0 2px 0 rgba(0,0,0,0.4)",
            }}
          >
            Endless Cycle
          </h1>
          <p className="mt-5 max-w-md text-[11px] uppercase leading-relaxed tracking-[0.3em] text-[#f4e6ea]/70 sm:text-xs">
            a first-person drive through a rain-soaked, neon-crimson city — that never arrives
          </p>
          <button
            type="button"
            onClick={handleStart}
            aria-label="Start the engine — enter The Drive"
            className="mt-12 animate-pulse cursor-pointer border border-[#ff3a46]/50 bg-[#ff3a46]/10 px-6 py-3 text-[11px] uppercase tracking-[0.4em] text-[#ffd9df] transition-colors hover:bg-[#ff3a46]/20 sm:text-[13px]"
          >
            [ start the engine ]
          </button>
        </div>

        {/* nav chrome */}
        <nav className="pointer-events-auto absolute inset-x-0 top-0 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 pt-7 text-[10px] uppercase tracking-[0.28em] text-[#f4e6ea]/70 sm:gap-x-7 sm:text-[11px]">
          <WordmarkLogo className="text-[17px]" />
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              {...(n.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="transition-opacity hover:opacity-100 hover:text-white"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </div>

      {/* ---- the wiper blade (decorative sweep over the clearing glass) ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10vw] top-[-12vh] h-[130vh] w-[8px] origin-bottom rounded-full bg-gradient-to-b from-transparent via-black/70 to-black"
        style={{ ...wiperSweep, boxShadow: "0 0 22px 6px rgba(0,0,0,0.35)" }}
      />
    </div>
  );
}
