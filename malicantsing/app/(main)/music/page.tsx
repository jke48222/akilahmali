import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import {
  ReleaseSpread,
  type SpreadRelease,
} from "@/components/music/ReleaseSpread";
import { getAllReleases } from "@/lib/queries";
import { portableTextToCredits } from "@/lib/portable-text";
import {
  STATIC_RELEASES,
  releaseYear,
  vibeFromSlug,
  formatReleaseDate,
} from "@/lib/static-content";

export const metadata: Metadata = {
  title: "Music",
  description:
    "Everything MALI has put out — in reverse order of release. EP, singles, lyrics, credits.",
  alternates: { canonical: "/music" },
  openGraph: {
    title: "Music — MALI",
    description: "Everything MALI has put out — EP, singles, lyrics, credits.",
    url: "/music",
    type: "website",
  },
};

export const revalidate = 60;

/**
 * Sanity returns ReleaseCard (no tracks/credits). For the editorial spread we
 * need the full shape; until /lib/queries grows a "music index spread" query
 * with tracks inlined, we hydrate from the static lyrics/credits keyed by slug.
 */
function mergeStatic(slug: string): Omit<SpreadRelease, "artwork"> {
  const fallback = STATIC_RELEASES.find((r) => r.slug === slug) ?? STATIC_RELEASES[0];
  return {
    slug: fallback.slug,
    title: fallback.title,
    formatLabel: fallback.formatLabel,
    year: releaseYear(fallback.releaseDate),
    releaseDateDisplay: fallback.releaseDateDisplay,
    artworkBy: fallback.artworkBy,
    blurb: fallback.blurb,
    runtime: fallback.runtime,
    vibe: fallback.vibe,
    tracks: fallback.tracks.map((t) => ({
      trackNumber: t.trackNumber,
      title: t.title,
      duration: t.duration,
      lyrics: t.lyrics,
      placeholder: t.placeholder,
    })),
    credits: fallback.credits,
    streamingLinks: fallback.streamingLinks,
  };
}

export default async function MusicIndexPage() {
  const sanityReleases = await getAllReleases();

  const releases: SpreadRelease[] = sanityReleases
    ? sanityReleases.map((r) => ({
        ...mergeStatic(r.slug),
        slug: r.slug,
        title: r.title,
        formatLabel:
          r.type === "ep" ? "ep" : r.type === "album" ? "album" : "single",
        year: releaseYear(r.releaseDate),
        releaseDateDisplay: formatReleaseDate(r.releaseDate, "monthYear"),
        vibe: vibeFromSlug(r.slug),
        artwork: r.artwork,
      }))
    : STATIC_RELEASES.map((r) => ({
        ...mergeStatic(r.slug),
        artwork: null,
      }));

  return (
    <>
      <PageHeader
        index="00 / index"
        meta={`${releases.length} releases · 2025`}
        title="Music"
        subhead={
          <>
            everything mali has put out, in reverse order of release.
            <br />
            click a track to read it.
          </>
        }
      />

      {/* Jump links */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
          <Reveal delay={200}>
            <nav
              aria-label="Jump to release"
              className="mt-10 md:mt-14 flex flex-wrap items-baseline gap-x-8 gap-y-3 pt-5 pb-1 border-t border-rule"
            >
              <span className="font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                jump —
              </span>
              {releases.map((r) => (
                <a
                  key={r.slug}
                  href={`#${r.slug}`}
                  className="ulink font-display italic text-[20px] md:text-[22px] leading-none"
                >
                  {r.title}
                  <span className="ml-2 font-mono not-italic text-mono-xs uppercase tracking-caps text-ink-3 align-middle">
                    · {r.year}
                  </span>
                </a>
              ))}
            </nav>
          </Reveal>
        </div>
      </section>

      <div className="mt-24 md:mt-36 lg:mt-44">
        {releases.map((r, i) => (
          <div key={r.slug} className={i > 0 ? "mt-32 md:mt-44 lg:mt-56" : ""}>
            <ReleaseSpread
              index={String(i + 1).padStart(2, "0")}
              side={i % 2 === 0 ? "left" : "right"}
              release={r}
            />
          </div>
        ))}
      </div>

      {/* End-of-list note */}
      <section className="mt-32 md:mt-44">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
          <div className="h-px w-full bg-rule" />
          <div className="grid grid-cols-12 gap-6 md:gap-10 py-12 md:py-16">
            <div className="col-span-12 md:col-span-5">
              <p className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
                end of catalogue — for now
              </p>
              <p
                className="mt-4 font-display italic leading-[1.15]"
                style={{ fontSize: "clamp(28px, 3.6vw, 36px)", maxWidth: "20ch" }}
              >
                the next one is being written.
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 md:col-start-8 md:pt-2">
              <p className="text-[15px] leading-[1.65] text-ink-2">
                drop an email and you&rsquo;ll hear it before the rest of the
                internet does. one note, when it&rsquo;s out.
              </p>
              <NextLink
                href="/#next"
                className="mt-5 inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-caps-md ulink text-accent"
              >
                for the next one{" "}
                <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
              </NextLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
