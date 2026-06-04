"use client";

/* =========================================================================
   THE BLAST — full-screen feed over the canvas. Clicking a monitor zooms all
   the way into it, then this fades in on the MATCHING photo (seamless). Scroll
   between feeds with the wheel, ← →, the ‹ › arrows, or the strip. Audio plays
   per feed with a mute toggle. "Back to Feed" returns to the room.
   ========================================================================= */

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Feed } from "@/lib/wrw/grid";

export function BlastOverlay({
  feeds,
  index,
  onIndex,
  audioRef,
  onBack,
}: {
  feeds: Feed[];
  index: number;
  onIndex: (i: number) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  onBack: () => void;
}) {
  const feed = feeds[index];
  const accent = feed.accent;
  const n = feeds.length;
  const wheelLock = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [shown, setShown] = useState(false); // fade-in for a seamless hand-off

  const go = useCallback((dir: number) => onIndex((index + dir + n) % n), [index, n, onIndex]);

  useEffect(() => {
    // setTimeout (not rAF) so the fade-in fires even if the tab is backgrounded
    const id = window.setTimeout(() => setShown(true), 20);
    return () => clearTimeout(id);
  }, []);

  // every feed's audio plays through the unlocked <audio> element (reliable);
  // the music-video feed also runs its <video> muted as the visual.
  useEffect(() => {
    const a = audioRef.current;
    if (feed.audio && a) {
      a.src = feed.audio;
      a.loop = true;
      a.muted = muted;
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    if (feed.kind === "video" && videoRef.current) {
      videoRef.current.muted = true; // its audio comes from the <audio> element
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    };
  }, [feed, audioRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep mute in sync without restarting playback
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted, audioRef]);

  // fully detach audio on unmount (leaving the blast)
  useEffect(() => {
    const a = audioRef.current;
    return () => {
      if (a) {
        a.pause();
        a.removeAttribute("src");
        a.load();
      }
    };
  }, [audioRef]);

  // keyboard nav
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black font-mono text-white transition-opacity duration-700 ease-out"
      style={{ opacity: shown ? 1 : 0 }}
      onWheel={onWheel}
    >
      {/* the matching feed — photo, or the music video */}
      {feed.kind === "video" ? (
        <video ref={videoRef} key={feed.n} src={feed.src} className="absolute inset-0 h-full w-full object-cover" autoPlay loop muted playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={feed.n} src={feed.src} alt={feed.title} className="absolute inset-0 h-full w-full object-cover" />
      )}
      {/* scrim + faint scanlines */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/55" />
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)" }} />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 sm:p-7">
        <button
          onClick={onBack}
          className="border px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors hover:text-black sm:px-4 sm:text-[11px] sm:tracking-[0.24em]"
          style={{ borderColor: accent }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          ◄ Back to Feed
        </button>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] sm:gap-4 sm:text-[11px]">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#ff2b2b]" />
            Rec
          </span>
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="border border-white/50 px-2 py-1 tracking-[0.18em] transition-colors hover:border-white"
          >
            {muted ? "Muted" : "Sound"}
          </button>
        </div>
        <a
          href="/shop"
          className="border border-white/70 px-3 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors hover:border-white hover:bg-white hover:text-black sm:px-4 sm:text-[11px] sm:tracking-[0.24em]"
        >
          Merch ↗
        </a>
      </div>

      {/* prev / next — chevron icons only */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous feed"
        className="absolute bottom-24 left-[14%] z-10 flex h-14 w-14 items-center justify-center text-white/70 transition-all hover:scale-110 hover:text-white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
      >
        <Chevron dir="left" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next feed"
        className="absolute bottom-24 right-[14%] z-10 flex h-14 w-14 items-center justify-center text-white/70 transition-all hover:scale-110 hover:text-white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
      >
        <Chevron dir="right" />
      </button>

      {/* title — centred. NB: no z-index here, so the difference-blended h1
         composites against the photo/scrim backdrop (not an isolated layer). */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[10px] uppercase tracking-[0.34em] text-white/70 sm:text-[11px]">Akilah Mali</span>
        {/* fill is the literal per-pixel inverse of the background behind it
           (white × mix-blend difference = 255 − backdrop). */}
        <h1
          className="mt-2 whitespace-nowrap font-sans font-black uppercase leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(26px,8.5vw,135px)", color: "#ffffff", mixBlendMode: "difference" }}
        >
          {feed.titleLines
            ? feed.titleLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))
            : feed.title}
        </h1>
        {feed.tag && (
          <span className="mt-3 text-[10px] uppercase tracking-[0.34em] text-white/70 sm:text-[11px]">
            {feed.tag}
          </span>
        )}
        {/* streaming links — icons only */}
        <div className="mt-7 flex items-center justify-center gap-5">
          {feed.spotify && (
            <a href={feed.spotify} target="_blank" rel="noopener" aria-label="Listen on Spotify" className="text-white/80 transition-colors hover:text-white" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}>
              <SpotifyIcon />
            </a>
          )}
          {feed.apple && (
            <a href={feed.apple} target="_blank" rel="noopener" aria-label="Listen on Apple Music" className="text-white/80 transition-colors hover:text-white" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}>
              <AppleIcon />
            </a>
          )}
          {feed.youtube && (
            <a href={feed.youtube} target="_blank" rel="noopener" aria-label="Watch on YouTube" className="text-white/80 transition-colors hover:text-white" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}>
              <YouTubeIcon />
            </a>
          )}
        </div>
      </div>

      {/* feed strip / footer — translucent (no solid bar), mono font */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/45 to-transparent px-3 py-4 backdrop-blur-[2px] sm:px-6">
        <div
          className="no-bar flex items-center gap-3 overflow-x-auto font-mono text-[11px] uppercase tracking-[0.16em] sm:gap-6 sm:text-[12px]"
          style={{ scrollbarWidth: "none" }}
        >
          <span className="shrink-0 text-white/40">Feeds</span>
          {feeds.map((f, i) => (
            <button
              key={f.n}
              onClick={() => onIndex(i)}
              className="shrink-0 transition-opacity"
              style={i === index ? { color: f.accent } : { color: "rgba(255,255,255,0.5)" }}
            >
              {f.title}
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 text-white/35 sm:inline">scroll / ← → to change feed</span>
        </div>
      </div>
    </div>
  );
}

/* prev/next chevron */
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "left" ? <polyline points="15 5 8 12 15 19" /> : <polyline points="9 5 16 12 9 19" />}
    </svg>
  );
}

/* brand glyphs (icons only) */
function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.72-.66 13.44 1.62.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.561.3z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 1.99.83 3.35.81 1.38-.03 2.26-1.27 3.11-2.53.98-1.45 1.38-2.85 1.4-2.92-.03-.01-2.69-1.03-2.72-4.08zM14.6 4.59c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}
