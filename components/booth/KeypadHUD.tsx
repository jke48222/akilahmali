"use client";

/* =========================================================================
   THE KEYPAD — the dialing interface (DOM overlay over the booth canvas).

   The phone GLB is a single mesh, so its buttons aren't separable; an overlay
   keypad is the reliable, accessible way to dial (mouse + full keyboard + touch
   + screen-reader), styled as the booth's cracked crimson panel. Each press
   fires a DTMF tone (TheBooth) and lights the key; a worn LCD shows the number.
   CALL connects, the back key clears, HANG UP resets.

   Keyboard: 0-9 * # dial · Enter = call · Backspace = clear · Esc = hang up.
   ========================================================================= */

import { useEffect } from "react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export function KeypadHUD({
  dialed,
  status,
  onDigit,
  onCall,
  onClear,
  onHangup,
}: {
  dialed: string;
  status: string;
  onDigit: (d: string) => void;
  onCall: () => void;
  onClear: () => void;
  onHangup: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9*#]$/.test(e.key)) {
        e.preventDefault();
        onDigit(e.key);
      } else if (e.key === "Enter") {
        onCall();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onClear();
      } else if (e.key === "Escape") {
        onHangup();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDigit, onCall, onClear, onHangup]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-end px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div
        className="pointer-events-auto w-full max-w-[16rem] rounded-2xl border border-[#ff2b3e]/40 bg-[#0a0103]/80 p-4 backdrop-blur-md sm:p-5"
        style={{ boxShadow: "0 0 44px -10px #ff2b3eaa" }}
      >
        {/* worn LCD readout */}
        <div className="mb-4 rounded-md border border-[#ff2b3e]/30 bg-[#1a0306]/70 px-3 py-2">
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#ff7d92]/70">{status}</p>
          <p
            className="min-h-[1.4em] truncate font-mono text-2xl tracking-[0.18em] text-[#ff5566]"
            style={{ textShadow: "0 0 10px #ff2b3e99" }}
          >
            {dialed || "—"}
          </p>
        </div>

        {/* 3×4 keypad */}
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onDigit(k)}
              aria-label={`Dial ${k}`}
              className="aspect-[5/4] rounded-md border border-white/10 bg-white/[0.04] font-mono text-xl text-[#f4e6ea] transition-all hover:border-[#ff2b3e]/70 hover:bg-[#ff2b3e]/15 active:scale-95 active:bg-[#ff2b3e]/30"
            >
              {k}
            </button>
          ))}
        </div>

        {/* actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear last digit"
            className="rounded-full border border-white/15 px-3 py-2 font-mono text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={onCall}
            className="flex-1 rounded-full bg-[#ff2b3e] py-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.28em] text-[#0a0103] transition-colors hover:bg-[#ff4d5e]"
          >
            ☎ call
          </button>
          <button
            type="button"
            onClick={onHangup}
            aria-label="Hang up"
            className="rounded-full border border-white/15 px-3 py-2 font-mono text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
