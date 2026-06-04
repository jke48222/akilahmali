"use client";

/* =========================================================================
   THE HUD — minimal click-through DOM chrome over the control room.
   ========================================================================= */

import Link from "next/link";
import { WordmarkLogo } from "@/components/Logo";

export function GridHUD() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30 font-mono text-white">
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-4 py-3 text-[9px] uppercase tracking-[0.22em] text-white/70 sm:px-7 sm:py-5 sm:text-[11px] sm:tracking-[0.28em]">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#ff2b2b]" />
          <span className="hidden sm:inline">Rec · Live Surveillance</span>
          <span className="sm:hidden">Rec · Live</span>
        </span>
        <span className="text-white/90">Who Really Won?</span>
        <Link
          href="/"
          aria-label="Akilah Mali · home"
          className="pointer-events-auto transition-opacity hover:text-white hover:opacity-100"
        >
          <WordmarkLogo className="text-[13px] sm:text-[15px]" />
        </Link>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-4 py-2 text-center text-[8px] uppercase tracking-[0.24em] text-white/40 sm:py-3 sm:text-[10px] sm:tracking-[0.3em]">
        Akilah Mali LLC // Who Really Won EP // Click A Monitor
      </div>
    </div>
  );
}
