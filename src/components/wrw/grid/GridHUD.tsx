"use client";

/* =========================================================================
   THE HUD — minimal click-through DOM chrome over the control room.
   ========================================================================= */

import Link from "next/link";
import { site } from "@/lib/site";
import SiteImg from "@/components/SiteImg";

export function GridHUD() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 font-mono text-white">
      {/* top row: REC (left) + wordmark (right) */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3 text-[9px] uppercase tracking-[0.22em] text-white/70 sm:px-7 sm:py-5 sm:text-[11px] sm:tracking-[0.28em]">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#ff2b2b]" />
          <span className="hidden sm:inline">Rec · Live Surveillance</span>
          <span className="sm:hidden">Rec · Live</span>
        </span>
        <Link
          href="/"
          aria-label="Akilah Mali · home"
          className="pointer-events-auto transition-opacity hover:opacity-80"
        >
          <SiteImg src={site.assets.wordmarkWhite} alt={site.artist} className="h-4 w-auto sm:h-5" />
        </Link>
      </div>

      {/* title — absolutely centered so it stays dead-centre regardless of the
          side elements' widths */}
      <span className="absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.22em] text-white/90 sm:top-[1.4rem] sm:text-[11px] sm:tracking-[0.28em]">
        Who Really Won?
      </span>

      <div className="absolute inset-x-0 bottom-0 px-4 py-2 text-center text-[8px] uppercase tracking-[0.24em] text-white/40 sm:py-3 sm:text-[10px] sm:tracking-[0.3em]">
        Akilah Mali LLC // Who Really Won EP // Click A Monitor
      </div>
    </div>
  );
}
