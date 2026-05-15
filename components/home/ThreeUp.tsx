import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "./SectionLabel";
import { ReleaseArtwork } from "./ReleaseArtwork";
import {
  STATIC_RELEASES,
  releaseTypeLabel,
  releaseYear,
  type StaticRelease,
} from "@/lib/static-content";
import type { ReleaseCard } from "@/lib/queries";

type Props = {
  releases: ReleaseCard[] | null;
};

type TileData = {
  _id: string;
  title: string;
  slug: string;
  year: string;
  kind: string;
  artwork?: ReleaseCard["artwork"] | null;
  vibe: StaticRelease["vibe"];
};

function toTile(r: ReleaseCard): TileData {
  return {
    _id: r._id,
    title: r.title,
    slug: r.slug,
    year: releaseYear(r.releaseDate),
    kind: releaseTypeLabel({ type: r.type }),
    artwork: r.artwork,
    // Fall back to a deterministic vibe by slug so swaps stay stable.
    vibe:
      r.slug === "who-really-won"
        ? "who"
        : r.slug === "last-year"
          ? "lastyear"
          : "strange",
  };
}

function fromStatic(r: StaticRelease): TileData {
  return {
    _id: r._id,
    title: r.title,
    slug: r.slug,
    year: releaseYear(r.releaseDate),
    kind: releaseTypeLabel({ type: r.type, trackCount: r.type === "ep" ? 5 : undefined }),
    artwork: null,
    vibe: r.vibe,
  };
}

export function ThreeUp({ releases }: Props) {
  const tiles: TileData[] =
    releases && releases.length > 0
      ? releases.map(toTile)
      : STATIC_RELEASES.map(fromStatic);

  return (
    <section className="relative" aria-labelledby="catalogue-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
        <div className="flex items-end justify-between gap-6">
          <SectionLabel
            index="02 / catalogue"
            label={`${tiles.length} releases — 2025`}
          />
          <NextLink
            href="/music"
            className="hidden md:inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-caps text-ink-2 ulink"
          >
            all music{" "}
            <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
          </NextLink>
        </div>

        <h2 id="catalogue-heading" className="sr-only">
          Catalogue
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-14 list-none p-0">
          {tiles.map((t, i) => (
            <Reveal as="li" delay={i * 80} key={t._id}>
              <NextLink href={`/music/${t.slug}`} className="group block">
                <div className="relative">
                  <ReleaseArtwork
                    image={t.artwork ?? undefined}
                    alt={`${t.title} — cover artwork`}
                    vibe={t.vibe}
                    variant="tile"
                    className="transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                    style={{ color: "var(--color-cream)" }}
                    aria-hidden="true"
                  >
                    <div className="font-display italic text-[28px] leading-none">
                      {t.title}
                    </div>
                    <div className="mt-1 font-mono text-mono-xs uppercase tracking-caps-lg opacity-80">
                      {t.kind} — {t.year}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-display text-[20px] md:text-[22px] leading-none">
                    {t.title}
                  </span>
                  <span className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
                    {t.kind} · {t.year}
                  </span>
                </div>
              </NextLink>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
