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

import { useEffect } from "react";
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

  // Keyboard: ←/→ tune between stations, Enter selects. (Drag/scroll + analog
  // static arrive in M4; richer focus handling rides along there too.)
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

  if (!station) return null;
  const accent = station.accent;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div
        className="pointer-events-auto w-full max-w-xl rounded-2xl border bg-[#0a0204]/70 p-4 backdrop-blur-md sm:p-5"
        style={{ borderColor: `${accent}59`, boxShadow: `0 0 40px -12px ${accent}99` }}
      >
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

        <p className="mt-2 line-clamp-2 font-mono text-[11px] italic leading-relaxed text-white/65">
          “{station.hookText}”
        </p>

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
          <div className="flex flex-1 items-center justify-between gap-1" role="radiogroup" aria-label="Radio stations">
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
