"use client";

/* =========================================================================
   IN-CALL — the slim overlay shown while a dialed call is connected. Two kinds:
     • operator — an automated message plays; we show its caption (accessibility)
     • music    — a number connected to audio (e.g. dial 1 → Tower of Roses);
                  we show a now-playing readout + a reactive pulse
   The audio itself is played by TheBooth. "Hang up" ends the call. This replaces
   the old full-screen coming-soon reveal.
   ========================================================================= */

import { useEffect, useState } from "react";

export type ActiveCall = {
  kind: "operator" | "music";
  label: string;
  caption?: string;
  /** dialed number, for the readout */
  number: string;
};

export function InCall({ call, onHangup }: { call: ActiveCall; onHangup: () => void }) {
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

  const music = call.kind === "music";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-opacity duration-500"
      style={{ opacity: shown ? 1 : 0 }}
    >
      <div
        className="pointer-events-auto w-full max-w-md rounded-2xl border border-[#ff2b3e]/40 bg-[#0a0103]/85 p-6 text-center backdrop-blur-md"
        style={{ boxShadow: "0 0 50px -12px #ff2b3eaa" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-[#ff7d92]/70">
          {music ? "connected" : "automated message"} · {call.number || "—"}
        </p>

        {music ? (
          <>
            <h2 className="mt-3 text-3xl" style={{ fontFamily: "var(--font-display), Georgia, serif", textShadow: "0 0 24px rgba(255,40,70,0.5)" }}>
              {call.label}
            </h2>
            {/* reactive-ish equaliser pulse */}
            <div className="mt-4 flex items-end justify-center gap-1" aria-hidden>
              {Array.from({ length: 11 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-[#ff3a46]"
                  style={{
                    height: `${8 + Math.abs(Math.sin(i * 1.3)) * 22}px`,
                    animation: `boothEq 0.9s ease-in-out ${i * 0.07}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <style>{`@keyframes boothEq{from{transform:scaleY(0.4)}to{transform:scaleY(1)}}`}</style>
          </>
        ) : (
          <p className="mt-3 font-mono text-[13px] italic leading-relaxed text-white" aria-live="polite">
            “{call.caption}”
          </p>
        )}

        <button
          type="button"
          onClick={onHangup}
          className="mt-6 rounded-full border border-[#ff2b3e]/50 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#ffd9df] transition-colors hover:bg-[#ff2b3e]/15"
        >
          ✕ hang up
        </button>
      </div>
    </div>
  );
}
