"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type LiteYouTubeProps = {
  /** 11-char YouTube ID. */
  videoId: string;
  /** Accessible title. */
  title: string;
  /** Optional caption shown as a corner-tick (e.g. runtime). */
  runtime?: string;
  /** Optional accent strings shown in the corners (designed cinema burns). */
  burns?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
  /** Aspect ratio. Defaults to 16/9. */
  aspect?: string;
  className?: string;
};

/**
 * Lite YouTube embed (zero-iframe until click). Uses YouTube's i.ytimg.com
 * thumbnail at fetch-time; only mounts the real iframe after user activation.
 *
 * - No third-party JS on first paint
 * - Lazy thumbnail
 * - Replaces itself with the autoplay iframe on click/Enter
 */
export function LiteYouTube({
  videoId,
  title,
  runtime,
  burns,
  aspect = "16 / 9",
  className = "",
}: LiteYouTubeProps) {
  const [active, setActive] = useState(false);

  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div
      className={`relative w-full field overflow-hidden ${className}`.trim()}
      style={{ aspectRatio: aspect }}
    >
      {active ? (
        <iframe
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 w-full h-full block cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            width={480}
            height={270}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.92) contrast(1.02)" }}
          />
          {/* vignette */}
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(110% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
            }}
            aria-hidden="true"
          />
          {/* burns */}
          {burns?.topLeft ? (
            <span className="absolute top-3 left-3 font-mono text-mono-xs uppercase tracking-caps-lg" style={{ color: "rgba(232,226,214,0.75)" }}>
              {burns.topLeft}
            </span>
          ) : null}
          {burns?.topRight || runtime ? (
            <span className="absolute top-3 right-3 font-mono text-mono-xs uppercase tracking-caps-lg tabular-nums" style={{ color: "rgba(232,226,214,0.75)" }}>
              {burns?.topRight ?? runtime}
            </span>
          ) : null}
          {burns?.bottomLeft ? (
            <span className="absolute bottom-3 left-3 font-mono text-mono-xs uppercase tracking-caps-lg" style={{ color: "rgba(232,226,214,0.75)" }}>
              {burns.bottomLeft}
            </span>
          ) : null}
          {burns?.bottomRight ? (
            <span className="absolute bottom-3 right-3 font-mono text-mono-xs uppercase tracking-caps-lg" style={{ color: "rgba(232,226,214,0.75)" }}>
              {burns.bottomRight}
            </span>
          ) : null}

          {/* play affordance */}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <span
              className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full transition-transform duration-500 group-hover:scale-105"
              style={{
                border: "1px solid rgba(232,226,214,0.85)",
                color: "rgba(232,226,214,0.95)",
                background: "rgba(0,0,0,0.18)",
                backdropFilter: "blur(2px)",
              }}
            >
              <Play size={18} aria-hidden="true" />
            </span>
            <span
              className="font-mono text-mono-xs uppercase tracking-caps-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ color: "rgba(232,226,214,0.85)" }}
            >
              press play
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
