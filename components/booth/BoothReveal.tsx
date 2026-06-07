"use client";

/* =========================================================================
   THE CONNECT — the full-screen reveal after you dial + CALL. There's no one on
   the other end (it's the Dead Line): the call drops into the album teaser —
   COMING SOON — with a notify/pre-save CTA. Crossfades in over the booth.
   "Hang up" returns to the booth. (Booth-3 adds the reduced-motion fallback.)
   ========================================================================= */

import { useEffect, useState } from "react";

export function BoothReveal({ dialed, onHangup }: { dialed: string; onHangup: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onHangup();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onHangup]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#080103] font-mono text-[#f4e6ea] transition-opacity duration-700"
      style={{ opacity: shown ? 1 : 0 }}
    >
      {/* crimson wash + heavy grain (a dead, staticky line) */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 50% at 50% 45%, rgba(255,40,60,0.34), transparent 70%)" }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 50% 45%, transparent 42%, rgba(8,1,3,0.9) 100%)" }} />

      <div className="relative flex flex-col items-center px-6 text-center">
        <p className="mb-3 text-[10px] uppercase tracking-[0.5em] text-[#ff7d92]/80">
          {dialed ? `dialed ${dialed}` : "no number"} · no answer
        </p>
        <h1 className="text-[15vw] leading-[0.9] sm:text-[clamp(2.5rem,8vw,6.5rem)]" style={{ fontFamily: "var(--font-display), Georgia, serif", textShadow: "0 0 30px rgba(255,40,70,0.55)" }}>
          The Line Is Dead
        </h1>
        <p className="mt-5 max-w-md text-[11px] uppercase leading-relaxed tracking-[0.3em] text-[#f4e6ea]/70">
          the new music reaches no one yet — <span className="text-[#ff7d92]">coming soon</span>
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="https://shop.akilahmali.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#ff2b3e] px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-[#0a0103] transition-colors hover:bg-[#ff4d5e]"
          >
            notify me
          </a>
          <button
            type="button"
            onClick={onHangup}
            className="rounded-full border border-[#ff2b3e]/50 px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-[#ffd9df] transition-colors hover:bg-[#ff2b3e]/15"
          >
            ◄ hang up
          </button>
        </div>
      </div>
    </div>
  );
}
