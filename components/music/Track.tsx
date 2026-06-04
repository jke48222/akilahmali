"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { SpotifyIcon, AppleIcon } from "@/components/icons";

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
}: TrackProps) {
  const [open, setOpen] = useState(defaultOpen);
  const drawerId = useId();

  const titleSize =
    density === "spacious"
      ? "text-[28px] md:text-[36px] lg:text-[44px]"
      : "text-[22px] md:text-[26px]";

  const buttonPad =
    density === "spacious" ? "py-5 md:py-6" : "py-4 md:py-5";

  return (
    <li className="border-t border-rule">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={drawerId}
        className={`w-full text-left grid grid-cols-12 items-baseline gap-3 ${buttonPad} transition-colors text-ink-2 hover:text-ink track-row ${open ? "open" : ""}`}
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
            {spotify || appleMusic ? (
              <div className="mt-6 flex items-center gap-5 font-mono text-mono-xs uppercase tracking-caps-md text-ink-2">
                <span className="text-ink-3">listen</span>
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
