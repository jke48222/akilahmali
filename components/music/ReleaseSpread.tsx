import { ArrowRight, ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/home/SectionLabel";
import { ReleaseArtwork } from "@/components/home/ReleaseArtwork";
import { Track } from "./Track";
import { AppleIcon, SpotifyIcon } from "@/components/icons";
import type { SanityImage } from "@/lib/queries";
import type { Vibe } from "@/lib/static-content";

type SpreadTrack = {
  trackNumber: number;
  title: string;
  duration: string;
  lyrics: string;
  placeholder?: boolean;
};

export type SpreadRelease = {
  slug: string;
  title: string;
  formatLabel: string;
  year: string;
  releaseDateDisplay: string;
  artworkBy: string;
  blurb: string;
  runtime: string;
  vibe: Vibe;
  artwork?: SanityImage | null;
  tracks: SpreadTrack[];
  credits: Array<[string, string]>;
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    smartlink?: string;
  };
};

type Props = {
  index: string;          // "01", "02"
  side: "left" | "right";
  release: SpreadRelease;
};

export function ReleaseSpread({ index, side, release }: Props) {
  const artSide = side === "left" ? "md:order-1" : "md:order-2";
  const metaSide = side === "left" ? "md:order-2" : "md:order-1";
  const trackCount = release.tracks.length;

  return (
    <article id={release.slug} className="relative">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
        <Reveal>
          <SectionLabel
            index={`release ${index}`}
            label={`${release.formatLabel} · ${release.year}`}
          />
        </Reveal>

        <div className="grid grid-cols-12 gap-6 md:gap-12 lg:gap-16 mt-10 md:mt-14">
          <Reveal as="div" className={`col-span-12 md:col-span-6 ${artSide}`}>
            <NextLink href={`/music/${release.slug}`} className="block group">
              <ReleaseArtwork
                image={release.artwork ?? undefined}
                alt={`${release.title} — cover artwork`}
                vibe={release.vibe}
                variant="latest"
                className="transition-transform duration-700 group-hover:scale-[1.015]"
              />
            </NextLink>
            <div className="mt-4 flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
              <span>artwork — {release.artworkBy}</span>
              <span>{release.releaseDateDisplay}</span>
            </div>
          </Reveal>

          <Reveal as="div" delay={120} className={`col-span-12 md:col-span-6 ${metaSide} flex flex-col`}>
            <p className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
              {release.formatLabel} — {release.year}
            </p>
            <h2
              className="font-display italic mt-3 leading-[0.92] tracking-mark"
              style={{ fontSize: "clamp(56px, 7.5vw, 124px)" }}
            >
              {release.title}
            </h2>

            {release.blurb ? (
              <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.65] text-ink-2">
                {release.blurb}
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-mono-sm uppercase tracking-caps text-ink-2">
              <a
                href={release.streamingLinks?.spotify ?? "#"}
                rel="noopener"
                className="ulink inline-flex items-center gap-2"
              >
                <SpotifyIcon width="14" height="14" /> Spotify
              </a>
              <a
                href={release.streamingLinks?.appleMusic ?? "#"}
                rel="noopener"
                className="ulink inline-flex items-center gap-2"
              >
                <AppleIcon width="14" height="14" /> Apple Music
              </a>
              <a
                href={release.streamingLinks?.smartlink ?? "#"}
                rel="noopener"
                className="ulink inline-flex items-center gap-2 text-accent"
              >
                everywhere <ArrowUpRight size={12} strokeWidth={1.1} aria-hidden="true" />
              </a>
            </div>

            <div className="mt-10">
              <div className="flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                <span>tracklist</span>
                <span>
                  {trackCount} {trackCount === 1 ? "track" : "tracks"} · {release.runtime}
                </span>
              </div>
              <ul className="mt-3 border-b border-rule">
                {release.tracks.map((t) => (
                  <Track
                    key={t.trackNumber}
                    n={t.trackNumber}
                    title={t.title}
                    duration={t.duration}
                    lyrics={t.lyrics}
                    placeholder={t.placeholder}
                    density="compact"
                  />
                ))}
              </ul>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-y-1 gap-x-6 font-mono text-[11px] leading-[1.9] text-ink-3">
              {release.credits.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-ink-2">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <NextLink
                href={`/music/${release.slug}`}
                className="font-mono text-mono-sm uppercase tracking-caps-md ulink inline-flex items-center gap-2"
              >
                release page <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
              </NextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
