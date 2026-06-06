"use client";

/* =========================================================================
   THE RADIO DIAL — the menu, as the car's radio (DOM HUD overlay).

   Shows the now-playing readout for the tuned station, the dial itself (a strip
   of station ticks with an analog frequency readout), prev/next tuning, and the
   "stream the full song" Spotify/Apple links (reused from the orb's transport
   panel — same hard rule: the site only previews, the real stream is off-site).

   M2 scope: render + arrow-key/prev-next tuning + stream links. The richer
   drag/scroll tuning with analog static + the per-station city re-skin land in
   M4; selecting (the through-windshield push into the film) lands in M5.

   Analogue of components/wrw/grid/GridHUD.tsx.
   ========================================================================= */

import { useEffect, useRef, useState } from "react";
import { AppleIcon, SpotifyIcon } from "@/components/icons";
import { type Station, wrapStation } from "@/lib/drive/stations";

/* A faux FM frequency per station so the dial reads like a real radio. */
const freqFor = (i: number, total: number) => (88.1 + (i / Math.max(1, total - 1)) * 19.8).toFixed(1);

export function RadioDial({
  stations,
  tuned,
  onTune,
  onSelect,
}: {
  stations: Station[];
  tuned: number;
  /** tune to an absolute (already-wrapped) station index */
  onTune: (index: number) => void;
  /** select the tuned station → push through the windshield into its film (M5) */
  onSelect?: (index: number) => void;
}) {
  const station = stations[tuned];

  // Keyboard: ←/→ tune between stations, Enter selects.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onTune(wrapStation(tuned - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onTune(wrapStation(tuned + 1));
      } else if (e.key === "Enter") {
        onSelect?.(tuned);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tuned, onTune, onSelect]);

  // A brief static flicker on the readout whenever the station changes (analog
  // tuning feel — pairs with the noise burst played in TheDrive).
  const [flick, setFlick] = useState(false);
  useEffect(() => {
    setFlick(true);
    const t = window.setTimeout(() => setFlick(false), 220);
    return () => clearTimeout(t);
  }, [tuned]);

  // Scroll to tune: accumulate wheel delta, fire a step past a threshold.
  const wheelAcc = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    wheelAcc.current += e.deltaY;
    if (Math.abs(wheelAcc.current) >= 60) {
      onTune(wrapStation(tuned + (wheelAcc.current > 0 ? 1 : -1)));
      wheelAcc.current = 0;
    }
  };

  // Drag to tune: ~46px of horizontal travel = one station from where the drag
  // began. Window listeners (no pointer capture) so the per-tick click handlers
  // still fire on a plain tap. Works for mouse + touch.
  const onPointerDown = (e: React.PointerEvent) => {
    const startX = e.clientX;
    const startTuned = tuned;
    let last = tuned;
    const move = (ev: PointerEvent) => {
      const steps = Math.round((ev.clientX - startX) / 46);
      const next = wrapStation(startTuned + steps);
      if (next !== last) {
        last = next;
        onTune(next);
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!station) return null;
  const accent = station.accent;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div
        onWheel={onWheel}
        className="pointer-events-auto relative w-full max-w-xl overflow-hidden rounded-2xl border bg-[#0a0204]/70 p-4 backdrop-blur-md sm:p-5"
        style={{ borderColor: `${accent}59`, boxShadow: `0 0 40px -12px ${accent}99` }}
      >
        {/* analog static flicker on tune */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
          style={{
            opacity: flick ? 0.5 : 0,
            mixBlendMode: "screen",
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23s)' opacity='0.7'/></svg>\")",
          }}
        />
        {/* ---- now-playing readout ---- */}
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-white/45">
              now tuned · {freqFor(tuned, stations.length)} fm
            </p>
            <h2
              className="truncate text-2xl leading-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif", color: "#fff" }}
            >
              {station.title}
              {station.isLandmark && (
                <span className="ml-2 align-middle text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
                  ✦ landmark
                </span>
              )}
            </h2>
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
              {station.artist}
            </p>
          </div>
          <span
            className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {String(tuned + 1).padStart(2, "0")} / {String(stations.length).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="line-clamp-2 flex-1 font-mono text-[11px] italic leading-relaxed text-white/65">
            “{station.hookText}”
          </p>
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(tuned)}
              className="shrink-0 rounded-full border px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors"
              style={{ borderColor: accent, color: accent }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accent;
                e.currentTarget.style.color = "#0a0204";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = accent;
              }}
            >
              ▶ drive in
            </button>
          )}
        </div>

        {/* ---- the dial: prev / ticks / next ---- */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous station"
            onClick={() => onTune(wrapStation(tuned - 1))}
            className="shrink-0 rounded-full border border-white/15 px-3 py-1 font-mono text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            ‹
          </button>
          <div
            className="flex flex-1 cursor-ew-resize touch-none items-center justify-between gap-1"
            role="radiogroup"
            aria-label="Radio stations — scroll or drag to tune"
            onPointerDown={onPointerDown}
          >
            {stations.map((s, i) => {
              const isTuned = i === tuned;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={isTuned}
                  aria-label={`Tune to ${s.title}`}
                  onClick={() => onTune(i)}
                  className="group relative flex-1 py-2"
                >
                  <span
                    className="block h-[3px] w-full rounded-full transition-all"
                    style={{
                      background: isTuned ? accent : "rgba(255,255,255,0.18)",
                      boxShadow: isTuned ? `0 0 10px ${accent}` : "none",
                      transform: isTuned ? "scaleY(2)" : "scaleY(1)",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label="Next station"
            onClick={() => onTune(wrapStation(tuned + 1))}
            className="shrink-0 rounded-full border border-white/15 px-3 py-1 font-mono text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            ›
          </button>
        </div>

        {/* ---- stream the FULL song where it counts (site only previews) ---- */}
        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="mb-2 text-center font-mono text-[8px] uppercase tracking-[0.24em] text-white/40">
            stream the full song
          </p>
          <div className="flex items-center gap-2">
            <a
              href={station.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-[11px] font-medium transition-colors hover:bg-white/20"
            >
              <SpotifyIcon width="14" height="14" /> Spotify
            </a>
            <a
              href={station.apple}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-[11px] font-medium transition-colors hover:bg-white/20"
            >
              <AppleIcon width="13" height="13" /> Apple Music
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
