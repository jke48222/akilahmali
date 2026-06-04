import NextLink from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import {
  ReleaseSpread,
  type SpreadRelease,
} from "@/components/music/ReleaseSpread";
import { getAllReleases } from "@/lib/queries";
import {
  STATIC_RELEASES,
  releaseYear,
  vibeFromSlug,
  formatReleaseDate,
} from "@/lib/static-content";

export const metadata: Metadata = {
  title: "Music",
  description: "All releases from Akilah Mali.",
  alternates: { canonical: "/music" },
  openGraph: {
    title: "Music · Akilah Mali",
    description: "All releases from Akilah Mali.",
    url: "/music",
    type: "website",
  },
};

export const revalidate = 60;

function mergeStatic(slug: string): Omit<SpreadRelease, "artwork"> {
  const fallback = STATIC_RELEASES.find((r) => r.slug === slug) ?? STATIC_RELEASES[0];
  return {
    slug: fallback.slug,
    title: fallback.title,
    formatLabel: fallback.formatLabel,
    year: releaseYear(fallback.releaseDate),
    releaseDateDisplay: fallback.releaseDateDisplay,
    artworkBy: fallback.artworkBy,
    coverSrc: fallback.coverImage,
    blurb: fallback.blurb,
    runtime: fallback.runtime,
    vibe: fallback.vibe,
    tracks: fallback.tracks.map((t) => ({
      trackNumber: t.trackNumber,
      title: t.title,
      duration: t.duration,
      lyrics: t.lyrics,
      placeholder: t.placeholder,
      spotify: t.spotify,
      appleMusic: t.appleMusic,
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
      <PageHeader title="Music" />

      {/* Jump links */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
          <Reveal delay={120}>
            <nav
              aria-label="Jump to release"
              className="mt-6 md:mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3 pt-4 pb-1 border-t border-rule"
            >
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

      <div className="mt-16 md:mt-24">
        {releases.map((r, i) => (
          <div key={r.slug} className={i > 0 ? "mt-24 md:mt-36" : ""}>
            <ReleaseSpread
              index={String(i + 1).padStart(2, "0")}
              side={i % 2 === 0 ? "left" : "right"}
              release={r}
            />
          </div>
        ))}
      </div>
    </>
  );
}
