"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Link2, Pause, Play, Plus } from "lucide-react";
import { SpotifyIcon, AppleIcon } from "@/components/icons";
import { usePlayer } from "@/components/player/PlayerProvider";
import { trackById } from "@/lib/player/catalog";

type Density = "compact" | "spacious";

type TrackProps = {
  n: number;
  title: string;
  duration: string;
  /** Plain text lyrics; line breaks preserved. Empty string means placeholder. */
  lyrics: string;
  placeholder?: boolean;
  /** Spacious = release-detail density (larger type); compact = music-index. */
  density?: Density;
  /** Per-track credit lines shown beside the lyrics on the detail page. */
  meta?: string[];
  defaultOpen?: boolean;
  /** Per-track streaming links shown in the open lyrics drawer. */
  spotify?: string;
  appleMusic?: string;
  /** Catalog id for the persistent player; enables the inline play button. */
  playableId?: string;
  /** Release slug + per-song slug → enables the per-song deep link / share. When
   *  the page loads with ?song=<songSlug> (or #<songSlug>) this track auto-opens
   *  and scrolls into view, and a "copy link" control appears in the drawer. */
  releaseSlug?: string;
  songSlug?: string;
};

export function Track({
  n,
  title,
  duration,
  lyrics,
  placeholder = false,
  density = "compact",
  meta,
  defaultOpen = false,
  spotify,
  appleMusic,
  playableId,
  releaseSlug,
  songSlug,
}: TrackProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);
  const drawerId = useId();
  const player = usePlayer();

  // Deep link: open + scroll this track when the URL targets it (?song= or #).
  useEffect(() => {
    if (!songSlug) return;
    const params = new URLSearchParams(window.location.search);
    const target = params.get("song") || window.location.hash.replace(/^#/, "");
    if (target && target === songSlug) {
      // Defer to a tick so opening + scrolling happen off the synchronous effect
      // body (and after first paint, so the drawer expansion is visible).
      const id = window.setTimeout(() => {
        setOpen(true);
        liRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
      return () => window.clearTimeout(id);
    }
  }, [songSlug]);

  async function copyLink(e: React.MouseEvent) {
    e.stopPropagation();
    if (!releaseSlug || !songSlug) return;
    const url = `${window.location.origin}/music/${releaseSlug}?song=${songSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op; the anchor id still makes the URL shareable */
    }
  }
  const playable = playableId ? trackById(playableId) : null;
  const isCurrent = !!playable && player.current?.id === playable.id;
  const isThisPlaying = isCurrent && player.isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playable) return;
    if (isCurrent) player.toggle();
    else player.play(playable);
  };

  const titleSize =
    density === "spacious"
      ? "text-[28px] md:text-[36px] lg:text-[44px]"
      : "text-[22px] md:text-[26px]";

  const buttonPad =
    density === "spacious" ? "py-5 md:py-6" : "py-4 md:py-5";

  return (
    <li ref={liRef} id={songSlug} className="border-t border-rule scroll-mt-24">
      <div className="relative">
        {playable ? (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={isThisPlaying ? `Pause ${title}` : `Play ${title}`}
            data-cursor="hover"
            className="absolute left-0 top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-rule text-ink-2 transition-colors hover:text-ink"
            style={isCurrent ? { color: playable.accent, borderColor: playable.accent } : undefined}
          >
            {isThisPlaying ? <Pause size={13} strokeWidth={1.6} /> : <Play size={13} strokeWidth={1.6} />}
          </button>
        ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={drawerId}
        className={`w-full text-left grid grid-cols-12 items-baseline gap-3 ${buttonPad} ${playable ? "pl-10" : ""} transition-colors text-ink-2 hover:text-ink track-row ${open ? "open" : ""}`}
      >
        <span className="col-span-1 font-mono text-[11px] tracking-[0.12em] text-ink-3 pt-1">
          {String(n).padStart(2, "0")}
        </span>
        <span
          className={`col-span-8 md:col-span-9 font-display italic leading-tight ${titleSize} ${placeholder ? "text-ink-3" : "text-ink"}`}
        >
          {title}
        </span>
        <span className="col-span-2 md:col-span-1 font-mono text-[11px] text-right md:text-left tracking-[0.06em] tabular-nums text-ink-3 pt-2">
          {duration}
        </span>
        <span className="col-span-1 flex justify-end pt-2 text-ink-3">
          <span className="track-chev inline-block" aria-hidden="true">
            <Plus size={density === "spacious" ? 18 : 16} strokeWidth={1.2} />
          </span>
        </span>
      </button>
      </div>
      <div id={drawerId} className={`lyrics-drawer ${open ? "open" : ""}`}>
        <div className="grid grid-cols-12 gap-3 pb-8 md:pb-12">
          <div
            className={
              density === "spacious"
                ? "col-span-12 md:col-start-2 md:col-span-7 lg:col-start-2 lg:col-span-6"
                : "col-span-12 md:col-start-2 md:col-span-9"
            }
          >
            {placeholder || !lyrics ? (
              <p className="font-mono text-[11px] uppercase tracking-caps-md text-ink-3">
                lyrics · t.b.a.
              </p>
            ) : (
              <pre
                className="font-display whitespace-pre-wrap leading-[1.7] text-ink-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize:
                    density === "spacious"
                      ? "clamp(13px, 1vw, 15px)"
                      : "14px",
                }}
              >
                {lyrics}
              </pre>
            )}
            {spotify || appleMusic || (releaseSlug && songSlug) ? (
              <div className="mt-6 flex flex-wrap items-center gap-5 font-mono text-mono-xs uppercase tracking-caps-md text-ink-2">
                {spotify || appleMusic ? (
                  <span className="text-ink-3">listen</span>
                ) : null}
                {spotify ? (
                  <a href={spotify} rel="noopener" target="_blank" data-cursor="hover" className="ulink inline-flex items-center gap-2">
                    <SpotifyIcon width="13" height="13" /> spotify
                  </a>
                ) : null}
                {appleMusic ? (
                  <a href={appleMusic} rel="noopener" target="_blank" data-cursor="hover" className="ulink inline-flex items-center gap-2">
                    <AppleIcon width="13" height="13" /> apple music
                  </a>
                ) : null}
                {releaseSlug && songSlug ? (
                  <button
                    type="button"
                    onClick={copyLink}
                    data-cursor="hover"
                    className="ulink inline-flex items-center gap-2 text-ink-3 hover:text-ink-2"
                    aria-label={`Copy link to ${title}`}
                  >
                    {copied ? (
                      <><Check width={13} height={13} strokeWidth={1.6} /> copied</>
                    ) : (
                      <><Link2 width={13} height={13} strokeWidth={1.4} /> copy link</>
                    )}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          {meta && density === "spacious" ? (
            <div className="col-span-12 md:col-span-3 md:col-start-10 mt-4 md:mt-0 font-mono text-mono-xs uppercase tracking-caps-md leading-[1.9] text-ink-3">
              {meta.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
