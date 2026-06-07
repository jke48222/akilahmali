/* =========================================================================
   THE DRIVE — 2D fallback (no WebGL).

   Two jobs, one component (pure + presentational, so it renders on the server
   AND the client):
     1. prefers-reduced-motion: visitors who opt out of motion get this static
        crimson rainy hero + the station list instead of the animated drive +
        camera push (TheDrive swaps to it).
     2. crawlable/SSR fallback: rendered in a <noscript> on the release page so
        the experience isn't an empty URL to bots / no-JS clients.

   Every station still surfaces its real Spotify + Apple Music links (the hard
   rule); fully keyboard-navigable; no canvas, no animation beyond a CSS pulse.
   ========================================================================= */

import { AppleIcon, SpotifyIcon } from "@/components/icons";
import { STATIONS, type Station } from "@/lib/drive/stations";

function StationRow({ s }: { s: Station }) {
  return (
    <li
      className="flex flex-col gap-3 border-t border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderImage: `linear-gradient(to right, ${s.accent}55, transparent) 1` }}
    >
      <div className="min-w-0">
        <h3 className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          {s.title}
          {s.isLandmark && (
            <span className="ml-2 align-middle text-[10px] uppercase tracking-[0.2em]" style={{ color: s.accent }}>
              ✦ the tower of roses
            </span>
          )}
        </h3>
        <p className="mt-1 font-mono text-[11px] italic leading-relaxed text-white/55">“{s.hookText}”</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={s.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-medium transition-colors hover:bg-white/20"
        >
          <SpotifyIcon width="14" height="14" /> Spotify
        </a>
        <a
          href={s.apple}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-medium transition-colors hover:bg-white/20"
        >
          <AppleIcon width="13" height="13" /> Apple Music
        </a>
      </div>
    </li>
  );
}

export function DriveFallback() {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0204] font-mono text-[#f4e6ea]">
      {/* static neon-bokeh wash + grain (no animation) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 30% at 22% 18%, rgba(255,60,80,0.4), transparent 60%)," +
            "radial-gradient(30% 24% at 78% 12%, rgba(255,140,60,0.3), transparent 60%)," +
            "radial-gradient(50% 40% at 60% 90%, rgba(180,20,50,0.32), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      <main className="relative mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#ff7d92]">Akilah Mali presents</p>
        <h1
          className="mt-4 text-[18vw] leading-[0.9] sm:text-[clamp(3rem,9vw,7rem)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif", textShadow: "0 0 28px rgba(255,40,70,0.4)" }}
        >
          Endless Cycle
        </h1>
        <p className="mt-5 max-w-md text-[11px] uppercase leading-relaxed tracking-[0.28em] text-white/65">
          a first-person drive through a rain-soaked, neon-crimson city — that never arrives. tune a
          station below and listen.
        </p>

        <ul className="mt-12">
          {STATIONS.map((s) => (
            <StationRow key={s.id} s={s} />
          ))}
        </ul>

        <p className="mt-10 text-[10px] uppercase tracking-[0.24em] text-white/40">
          the full, animated drive plays for visitors who allow motion.
        </p>
      </main>
    </div>
  );
}
