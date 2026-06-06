"use client";

/* =========================================================================
   THE STATION FILM — the full-screen "film" for a tuned-in song, over the
   canvas. Selecting a station pushes the camera through the windshield, then
   this crossfades in (mounted ~1s before the push lands) on the song's still —
   the seamless hand-off from DriveScene.focus, the analogue of WRW's
   BlastOverlay.

   The looping 30s preview keeps playing on the single unlocked <audio> element
   (owned by TheDrive, raised in volume while a film is open — never a full
   song). prev/next tune to the adjacent station's film; "back to the drive"
   reverses the camera to the passenger seat. Scroll / ← → / Esc all work.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AppleIcon, SpotifyIcon } from "@/components/icons";
import { type Station, wrapStation } from "@/lib/drive/stations";

export function StationFilm({
  stations,
  index,
  onIndex,
  onBack,
  audioRef,
}: {
  stations: Station[];
  index: number;
  /** tune to an adjacent station's film */
  onIndex: (i: number) => void;
  /** reverse the camera back to the drive */
  onBack: () => void;
  /** the single unlocked audio element (for the sound toggle) */
  audioRef: RefObject<HTMLAudioElement | null>;
}) {
  const station = stations[index];
  const accent = station?.accent ?? "#ff3a46";
  const wheelLock = useRef(0);
  const [shown, setShown] = useState(false); // fade-in for the seamless hand-off
  const [muted, setMuted] = useState(false);

  const go = useCallback((dir: number) => onIndex(wrapStation(index + dir)), [index, onIndex]);

  // setTimeout (not rAF) so the crossfade fires even if the tab is backgrounded
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 20);
    return () => clearTimeout(id);
  }, []);

  // mute toggle — TheDrive owns volume/src; we only flip muted here
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted, audioRef]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
      else if (e.key === "Escape") onBack();
      else if (e.key.toLowerCase() === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onBack]);

  const onWheel = (e: React.WheelEvent) => {
    const now = e.timeStamp;
    if (now - wheelLock.current < 380) return;
    if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return;
    wheelLock.current = now;
    go(e.deltaY + e.deltaX > 0 ? 1 : -1);
  };

  // touch swipe (mobile)
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 45 && Math.abs(dy) < 45) return;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    go(horizontal ? (dx < 0 ? 1 : -1) : dy < 0 ? 1 : -1);
  };

  if (!station) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-[#0a0204] font-mono text-white transition-opacity duration-700 ease-out"
      style={{ opacity: shown ? 1 : 0 }}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* the song's still */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={station.id} src={station.filmSrc} alt={station.title} className="absolute inset-0 h-full w-full object-cover" />
      {/* crimson grade + scrim + grain */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(to top, ${accent}40, transparent 40%, #0a020480 100%)`, mixBlendMode: "multiply" }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/55" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-7">
        <button
          onClick={onBack}
          className="border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors hover:text-black sm:px-4 sm:text-[11px]"
          style={{ borderColor: accent }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ◄ back to the drive
        </button>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] sm:text-[11px]">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: accent }} />
            preview
          </span>
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="border border-white/50 px-2 py-1 tracking-[0.18em] transition-colors hover:border-white"
          >
            {muted ? "Muted" : "Sound"}
          </button>
        </div>
      </div>

      {/* prev / next */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous station"
        className="absolute bottom-28 left-[10%] z-10 flex h-14 w-14 items-center justify-center text-white/70 transition-all hover:scale-110 hover:text-white sm:left-[14%]"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
      >
        <Chevron dir="left" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next station"
        className="absolute bottom-28 right-[10%] z-10 flex h-14 w-14 items-center justify-center text-white/70 transition-all hover:scale-110 hover:text-white sm:right-[14%]"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
      >
        <Chevron dir="right" />
      </button>

      {/* title + hook + stream links — centred */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[10px] uppercase tracking-[0.34em] text-white/70 sm:text-[11px]">{station.artist}</span>
        <h1
          className="mt-2 leading-[0.92]"
          style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: "clamp(36px,9vw,140px)", textShadow: `0 0 40px ${accent}80` }}
        >
          {station.title}
        </h1>
        {station.isLandmark && (
          <span className="mt-3 text-[10px] uppercase tracking-[0.34em]" style={{ color: accent }}>
            ✦ the tower of roses
          </span>
        )}
        <p className="mt-5 max-w-lg font-mono text-[12px] italic leading-relaxed text-white/75">“{station.hookText}”</p>

        {/* stream the FULL song where it counts */}
        <div className="mt-8 flex items-center gap-3">
          <a
            href={station.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-[12px] font-medium backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <SpotifyIcon width="16" height="16" /> Stream on Spotify
          </a>
          <a
            href={station.apple}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-[12px] font-medium backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <AppleIcon width="15" height="15" /> Apple Music
          </a>
        </div>
      </div>

      {/* station strip footer */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/45 to-transparent px-3 py-4 backdrop-blur-[2px] sm:px-6">
        <div className="no-bar flex items-center gap-3 overflow-x-auto font-mono text-[11px] uppercase tracking-[0.16em] sm:gap-6 sm:text-[12px]" style={{ scrollbarWidth: "none" }}>
          <span className="shrink-0 text-white/40">Stations</span>
          {stations.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onIndex(i)}
              className="shrink-0 transition-opacity"
              style={i === index ? { color: s.accent } : { color: "rgba(255,255,255,0.5)" }}
            >
              {s.title}
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 text-white/35 sm:inline">scroll / ← → · esc to drive</span>
        </div>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === "left" ? <polyline points="15 5 8 12 15 19" /> : <polyline points="9 5 16 12 9 19" />}
    </svg>
  );
}
