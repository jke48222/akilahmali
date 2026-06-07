import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import { notFound, redirect } from "next/navigation";
import { WhoReallyWonClient } from "@/components/wrw/grid/WhoReallyWonClient";
import { TheDriveClient } from "@/components/drive/TheDriveClient";
import { DriveFallback } from "@/components/drive/DriveFallback";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/home/SectionLabel";
import { ReleaseArtwork } from "@/components/home/ReleaseArtwork";
import { Track } from "@/components/music/Track";
import { LiteYouTube } from "@/components/LiteYouTube";
import { NavThemeSentinel } from "@/components/NavThemeSentinel";
import {
  AppleIcon,
  SpotifyIcon,
  YouTubeIcon,
} from "@/components/icons";
import {
  getAllReleases,
  getAdjacentReleases,
  getReleaseBySlug,
  getVideoForRelease,
  type ReleaseDetail,
  type VideoCard,
} from "@/lib/queries";
import { urlForImage } from "@/lib/sanity";
import { jsonLd } from "@/lib/structured-data";
import { feedIndexForReleaseSlug } from "@/lib/wrw/grid";
import { FORCE_PORTRAIT_OG, OG_PORTRAIT } from "@/lib/og";
import {
  portableTextToCredits,
  portableTextToPlain,
} from "@/lib/portable-text";
import {
  STATIC_RELEASES,
  STATIC_VIDEOS,
  formatReleaseDate,
  releaseYear,
  staticAdjacent,
  vibeFromSlug,
  type StaticRelease,
  type StaticVideo,
} from "@/lib/static-content";

export const revalidate = 60;

/* =========================================================================
   Static params
   ========================================================================= */
export async function generateStaticParams() {
  const live = await getAllReleases();
  const slugs = live && live.length > 0
    ? live.map((r) => r.slug)
    : STATIC_RELEASES.map((r) => r.slug);
  return slugs.map((slug) => ({ slug }));
}

/* =========================================================================
   Metadata
   ========================================================================= */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;

  // "Endless Cycle" is the immersive world (THE DRIVE), not a Sanity/static
  // release — so it needs its own metadata or a shared link would read "Release
  // not found". Crimson card when per-page art is on; portrait while forced.
  if (slug === "endless-cycle") {
    const title = "Endless Cycle";
    const description =
      "A first-person drive through a rain-soaked, neon-crimson city that never arrives — Akilah Mali's immersive world for Endless Cycle. Tune the radio, drive into each song.";
    const ogImage = FORCE_PORTRAIT_OG ? OG_PORTRAIT : "/drive-og";
    const ogAlt = FORCE_PORTRAIT_OG ? "Akilah Mali" : "Endless Cycle — The Drive";
    return {
      title,
      description,
      alternates: { canonical: "/music/endless-cycle" },
      openGraph: {
        title: `${title} · Akilah Mali`,
        description,
        url: "/music/endless-cycle",
        type: "music.album",
        images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
      },
      twitter: { card: "summary_large_image", title: `${title} · Akilah Mali`, description, images: [ogImage] },
    };
  }

  const live = await getReleaseBySlug(slug);
  const fallback = STATIC_RELEASES.find((r) => r.slug === slug);
  if (!live && !fallback) return { title: "Release not found" };

  const title = live?.title ?? fallback!.title;
  const description =
    live ? portableTextToPlain(live.description) || `Akilah Mali · ${title}` : fallback!.blurb;

  // While the portrait policy is on, every release link shares the portrait too;
  // flip FORCE_PORTRAIT_OG (lib/og.ts) to fall back to the release cover artwork.
  const ogImage = FORCE_PORTRAIT_OG
    ? OG_PORTRAIT
    : live?.artwork
      ? urlForImage(live.artwork).width(1200).height(630).fit("crop").url()
      : OG_PORTRAIT;
  const ogAlt = FORCE_PORTRAIT_OG ? "Akilah Mali" : `${title} · cover artwork`;

  return {
    title,
    description,
    alternates: { canonical: `/music/${slug}` },
    openGraph: {
      title: `${title} · Akilah Mali`,
      description,
      url: `/music/${slug}`,
      type: "music.album",
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Akilah Mali`,
      description,
      images: [ogImage],
    },
  };
}

/* =========================================================================
   Helpers
   ========================================================================= */
type DisplayRelease = {
  title: string;
  slug: string;
  releaseDate: string;
  releaseDateDisplay: string;
  format: "single" | "ep" | "album";
  formatLabel: string;
  year: string;
  blurb: string;
  runtime: string;
  catalog: string;
  upc?: string;
  label: string;
  artworkBy: string;
  subtitle?: string;
  vibe: "strange" | "who" | "lastyear";
  artwork?: ReleaseDetail["artwork"] | null;
  coverSrc?: string;
  tracks: Array<{
    n: number;
    title: string;
    duration: string;
    lyrics: string;
    placeholder?: boolean;
    spotify?: string;
    appleMusic?: string;
  }>;
  credits: Array<[string, string]>;
  streamingLinks?: ReleaseDetail["streamingLinks"];
};

function mergeWithStatic(
  live: ReleaseDetail | null,
  fallback: StaticRelease,
): DisplayRelease {
  const r = live ?? fallback;
  const slug = "slug" in r ? r.slug : (r as StaticRelease).slug;
  const tracks =
    live?.tracks && live.tracks.length > 0
      ? live.tracks.map((t) => ({
          n: t.trackNumber,
          title: t.title,
          duration: t.duration,
          lyrics: portableTextToPlain(t.lyrics),
          placeholder: false,
        }))
      : fallback.tracks.map((t) => ({
          n: t.trackNumber,
          title: t.title,
          duration: t.duration,
          lyrics: t.lyrics,
          placeholder: t.placeholder,
          spotify: t.spotify,
          appleMusic: t.appleMusic,
        }));

  const credits =
    live?.credits && live.credits.length > 0
      ? portableTextToCredits(live.credits)
      : fallback.credits;

  return {
    title: live?.title ?? fallback.title,
    slug,
    releaseDate: live?.releaseDate ?? fallback.releaseDate,
    releaseDateDisplay: live
      ? formatReleaseDate(live.releaseDate, "long")
      : fallback.releaseDateDisplay,
    format: (live?.type ?? fallback.type) as "single" | "ep" | "album",
    formatLabel: fallback.formatLabel,
    year: releaseYear(live?.releaseDate ?? fallback.releaseDate),
    blurb: live ? portableTextToPlain(live.description) || fallback.blurb : fallback.blurb,
    runtime: fallback.runtime,
    catalog: fallback.catalog ?? "",
    upc: fallback.upc,
    label: fallback.label ?? "akilah mali · self-released",
    artworkBy: fallback.artworkBy,
    subtitle: fallback.subtitle,
    vibe: vibeFromSlug(slug),
    artwork: live?.artwork ?? null,
    coverSrc: fallback.coverImage,
    tracks,
    credits,
    streamingLinks: live?.streamingLinks,
  };
}

function videoForStaticRelease(slug: string): StaticVideo | null {
  return STATIC_VIDEOS.find((v) => v.release.slug === slug) ?? null;
}

/* =========================================================================
   Page
   ========================================================================= */
export default async function ReleaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // The "Who Really Won?" release IS the immersive control-room experience.
  if (slug === "who-really-won") return <WhoReallyWonClient />;

  // The "Endless Cycle" album IS the immersive night-drive experience, THE DRIVE.
  // The <noscript> keeps it crawlable / usable without JS (the same static 2D
  // version reduced-motion visitors get).
  if (slug === "endless-cycle") {
    return (
      <>
        <TheDriveClient />
        <noscript>
          <DriveFallback />
        </noscript>
      </>
    );
  }

  // Releases that have a blast in the control room go straight into it.
  if (feedIndexForReleaseSlug(slug) !== null) {
    redirect(`/music/who-really-won?song=${slug}`);
  }

  const fallback = STATIC_RELEASES.find((r) => r.slug === slug);
  const live = await getReleaseBySlug(slug);
  if (!live && !fallback) notFound();

  const release = mergeWithStatic(live, fallback!);

  // Adjacent releases.
  const liveAdj = live ? await getAdjacentReleases(release.releaseDate) : null;
  const staticAdj = staticAdjacent(release.releaseDate);
  const prev = liveAdj?.prev
    ? {
        title: liveAdj.prev.title,
        slug: liveAdj.prev.slug,
        kind: `${liveAdj.prev.type} · ${formatReleaseDate(liveAdj.prev.releaseDate, "monthYear")}`,
        artwork: liveAdj.prev.artwork,
        vibe: vibeFromSlug(liveAdj.prev.slug),
      }
    : staticAdj.prev
      ? {
          title: staticAdj.prev.title,
          slug: staticAdj.prev.slug,
          kind: `${staticAdj.prev.formatLabel} · ${staticAdj.prev.releaseDateDisplay}`,
          artwork: null,
          coverSrc: staticAdj.prev.coverImage,
          vibe: staticAdj.prev.vibe,
        }
      : null;
  const next = liveAdj?.next
    ? {
        title: liveAdj.next.title,
        slug: liveAdj.next.slug,
        kind: `${liveAdj.next.type} · ${formatReleaseDate(liveAdj.next.releaseDate, "monthYear")}`,
        artwork: liveAdj.next.artwork,
        vibe: vibeFromSlug(liveAdj.next.slug),
      }
    : staticAdj.next
      ? {
          title: staticAdj.next.title,
          slug: staticAdj.next.slug,
          kind: `${staticAdj.next.formatLabel} · ${staticAdj.next.releaseDateDisplay}`,
          artwork: null,
          coverSrc: staticAdj.next.coverImage,
          vibe: staticAdj.next.vibe,
        }
      : null;

  // Associated video.
  const liveVideo: VideoCard | null = live
    ? await getVideoForRelease(live._id)
    : null;
  const video = liveVideo
    ? {
        title: liveVideo.title,
        youtubeId: liveVideo.youtubeId,
        kindLabel: kindLabel(liveVideo.type),
      }
    : videoForStaticRelease(slug)
      ? {
          title: videoForStaticRelease(slug)!.title,
          youtubeId: videoForStaticRelease(slug)!.youtubeId,
          kindLabel: videoForStaticRelease(slug)!.kindLabel,
        }
      : null;

  // Streaming platforms · only show those with URLs.
  const platforms = [
    { name: "Spotify", Icon: SpotifyIcon, href: release.streamingLinks?.spotify, primary: true },
    { name: "Apple Music", Icon: AppleIcon, href: release.streamingLinks?.appleMusic },
    { name: "YouTube Music", Icon: YouTubeIcon, href: release.streamingLinks?.youtubeMusic },
    { name: "Tidal", Icon: YouTubeIcon, href: release.streamingLinks?.tidal },
  ].filter((p) => p.href);

  return (
    <>
      <JsonLd release={release} />

      {/* HERO · per-release scrim */}
      <section className="relative" style={{ minHeight: "100svh" }}>
        <NavThemeSentinel height="80svh" />
        <div
          className="absolute inset-0"
          style={{
            background: release.vibe === "who"
              ? "radial-gradient(80% 70% at 50% 35%, #3b2230 0%, #2a1520 55%, #140a10 100%)"
              : release.vibe === "lastyear"
                ? "radial-gradient(80% 70% at 50% 35%, #3a2a1e 0%, #251810 55%, #100a06 100%)"
                : "radial-gradient(80% 70% at 50% 35%, #262a38 0%, #161820 55%, #0a0c14 100%)",
          }}
        />
        <div className="absolute inset-0 hero-grain pointer-events-none" />
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent, var(--color-bg))`,
          }}
        />

        {/* Breadcrumb */}
        <div className="relative z-10 pt-28 md:pt-32">
          <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
            <Reveal>
              <nav
                aria-label="Breadcrumb"
                className="flex items-baseline gap-3 font-mono text-mono-xs uppercase tracking-caps-lg"
                style={{ color: "rgba(141,131,120,0.95)" }}
              >
                <NextLink href="/" className="ulink hover:text-[color:rgba(199,189,176,1)]">
                  akilah mali
                </NextLink>
                <span aria-hidden="true">/</span>
                <NextLink href="/music" className="ulink hover:text-[color:rgba(199,189,176,1)]">
                  music
                </NextLink>
                <span aria-hidden="true">/</span>
                <span aria-current="page" style={{ color: "rgba(199,189,176,1)" }}>
                  {release.title.toLowerCase()}
                </span>
              </nav>
            </Reveal>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 pt-12 md:pt-16 pb-32 md:pb-44">
          <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
            <Reveal delay={80}>
              <div
                className="grid grid-cols-12 gap-4 font-mono text-mono-xs uppercase tracking-caps-md mb-12 md:mb-16"
                style={{ color: "rgba(141,131,120,0.95)" }}
              >
                <div className="col-span-4 md:col-span-3">
                  {release.catalog ? `cat. ${release.catalog}` : ""}
                </div>
                <div className="col-span-4 md:col-span-3">{release.formatLabel}</div>
                <div className="col-span-4 md:col-span-3">
                  runtime · {release.runtime}
                </div>
                <div className="hidden md:block md:col-span-3 text-right">
                  {release.releaseDateDisplay}
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-12 gap-6">
              <Reveal
                as="div"
                delay={140}
                className="col-span-12 md:col-start-3 md:col-span-8 lg:col-start-4 lg:col-span-6"
              >
                <div className="art-cast">
                  <ReleaseArtwork
                    image={release.artwork}
                    coverSrc={release.coverSrc}
                    alt={`${release.title} · cover`}
                    vibe={release.vibe}
                    variant="latest"
                  />
                </div>
                <div
                  className="mt-3 flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-md"
                  style={{ color: "rgba(141,131,120,0.95)" }}
                >
                  <span>artwork · {release.artworkBy}</span>
                  {release.upc ? <span>upc · {release.upc}</span> : null}
                </div>
              </Reveal>
            </div>

            <div className="mt-14 md:mt-20">
              <Reveal delay={200}>
                <h1
                  className="font-display italic leading-[0.86] tracking-display text-center md:text-left"
                  style={{
                    fontSize: "clamp(64px, 11vw, 200px)",
                    color: "var(--color-cream)",
                  }}
                >
                  {release.title}
                </h1>
              </Reveal>
              <Reveal delay={280}>
                <div className="mt-6 md:mt-8 grid grid-cols-12 gap-4 md:gap-10 items-baseline">
                  {release.subtitle ? (
                    <div
                      className="col-span-12 md:col-span-6 font-display text-[22px] md:text-[26px]"
                      style={{ color: "rgba(199,189,176,1)" }}
                    >
                      <span className="italic">{release.subtitle}.</span>
                    </div>
                  ) : null}
                  <div
                    className="col-span-12 md:col-span-6 md:text-right font-mono text-mono-sm uppercase tracking-caps-md"
                    style={{ color: "rgba(141,131,120,0.95)" }}
                  >
                    released · {release.releaseDateDisplay} &nbsp;·&nbsp; {release.label}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* STREAMING */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-md">
          <Reveal>
            <SectionLabel label="listen" />
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-8 md:mt-10 border-t border-rule">
              {(platforms.length > 0
                ? platforms
                : [
                    { name: "Spotify", Icon: SpotifyIcon, href: "#", primary: true },
                    { name: "Apple Music", Icon: AppleIcon, href: "#" },
                    { name: "YouTube Music", Icon: YouTubeIcon, href: "#" },
                  ]
              ).map((p, i) => (
                <li key={p.name} className="border-b border-rule">
                  <a
                    href={p.href ?? "#"}
                    rel="noopener"
                    className="group flex items-center justify-between py-5 md:py-6"
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="font-mono text-mono-xs uppercase tracking-caps-md pt-2 text-ink-3">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`flex items-center gap-3 ${"primary" in p && p.primary ? "text-ink" : "text-ink-2"}`}
                      >
                        <p.Icon width="20" height="20" />
                        <span
                          className="font-display italic"
                          style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
                        >
                          {p.name}
                        </span>
                        </span>
                    </span>
                    <span className="ulink font-mono text-mono-xs uppercase tracking-caps-md inline-flex items-center gap-2 text-ink-2">
                      open <ArrowUpRight size={14} strokeWidth={1.1} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          {release.streamingLinks?.smartlink ? (
            <Reveal delay={220}>
              <div className="mt-6 flex items-center justify-between font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                <span>or ·</span>
                <a
                  href={release.streamingLinks.smartlink}
                  rel="noopener"
                  className="ulink inline-flex items-center gap-2 text-accent"
                >
                  listen everywhere <ArrowUpRight size={14} strokeWidth={1.1} aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* TRACKLIST */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <Reveal>
            <SectionLabel label="tracklist"
            />
          </Reveal>
          {release.blurb ? (
            <Reveal delay={120}>
              <p
                className="mt-10 md:mt-14 font-display italic leading-[1.45] max-w-[34ch] text-ink-2"
                style={{ fontSize: "clamp(22px, 2.4vw, 28px)" }}
              >
                {release.blurb}
              </p>
            </Reveal>
          ) : null}
          <Reveal delay={200}>
            <ul className="mt-12 md:mt-16 border-b border-rule">
              {release.tracks.map((t, i) => (
                <Track
                  key={t.n}
                  n={t.n}
                  title={t.title}
                  duration={t.duration}
                  lyrics={t.lyrics}
                  placeholder={t.placeholder}
                  spotify={t.spotify}
                  appleMusic={t.appleMusic}
                  density="spacious"
                  defaultOpen={i === 0 && !t.placeholder}
                  meta={[`written by · akilah brown-pagan`, `vocals · akilah brown-pagan`]}
                />
              ))}
            </ul>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
              <span>tap any track to read.</span>
              <span>
                all lyrics © {release.year} akilah brown-pagan
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MUSIC VIDEO */}
      {video ? (
        <section className="relative">
          <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
            <Reveal>
              <SectionLabel label="video" />
            </Reveal>
            <Reveal delay={120}>
              <h2
                className="mt-8 md:mt-10 font-display italic leading-[0.95] tracking-mark whitespace-nowrap"
                style={{ fontSize: "clamp(28px, 4vw, 60px)" }}
              >
                {video.title.toLowerCase()}{" "}
                <span className="text-ink-3">· {video.kindLabel}</span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-8 md:mt-10 relative" style={{ padding: "4px", background: "var(--color-ink)" }}>
                <LiteYouTube
                  videoId={video.youtubeId}
                  title={`${video.title} · ${video.kindLabel}`}
                  burns={{
                    topLeft: `youtube · ${video.kindLabel}`,
                    topRight: "16:9 · 1080p",
                    bottomLeft: `akilah mali · ${video.title.toLowerCase()}`,
                    bottomRight: release.year,
                  }}
                />
              </div>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                <span></span>
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  rel="noopener"
                  className="ulink inline-flex items-center gap-2"
                >
                  watch on youtube <ArrowUpRight size={12} strokeWidth={1.1} aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* CREDITS */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <Reveal>
            <SectionLabel label="credits" />
          </Reveal>
          <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10 md:mt-14">
            <Reveal as="div" className="col-span-12 md:col-span-4">
              <h2
                className="font-display italic leading-[0.95] tracking-mark"
                style={{ fontSize: "clamp(48px, 5.5vw, 88px)" }}
              >
                credit roll.
              </h2>
              <p className="mt-5 max-w-[40ch] text-[15px] leading-[1.65] text-ink-2">
                written and sung by akilah brown-pagan. everyone who worked on it.
              </p>
            </Reveal>
            <Reveal as="div" delay={120} className="col-span-12 md:col-span-8">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 font-mono text-[12px] leading-[1.9]">
                {release.credits.map(([k, v]) => (
                  <div
                    key={k}
                    className="grid grid-cols-12 gap-3 py-2 border-t border-rule"
                  >
                    <dt className="col-span-5 uppercase tracking-caps-sm text-ink-3">{k}</dt>
                    <dd className="col-span-7 text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                <div>
                  <div className="text-ink-2">catalog</div>
                  <div className="mt-1">{release.catalog || "·"}</div>
                </div>
                <div>
                  <div className="text-ink-2">upc</div>
                  <div className="mt-1 tabular-nums">{release.upc ?? "·"}</div>
                </div>
                <div>
                  <div className="text-ink-2">released</div>
                  <div className="mt-1">{release.releaseDateDisplay}</div>
                </div>
                <div>
                  <div className="text-ink-2">label</div>
                  <div className="mt-1">{release.label || "Akilah Mali LLC"}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PREV / NEXT */}
      <section className="relative">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
          <div className="h-px w-full bg-rule" />
          <div className="grid grid-cols-12 gap-6 md:gap-10 py-12 md:py-16">
            <Reveal as="div" className="col-span-12 md:col-span-6">
              {prev ? (
                <NextLink href={`/music/${prev.slug}`} className="group block">
                  <div className="font-mono text-mono-xs uppercase tracking-caps-md flex items-center gap-2 text-ink-3">
                    <ArrowLeft size={14} strokeWidth={1.2} aria-hidden="true" /> previous release
                  </div>
                  <div className="mt-5 flex items-center gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0">
                      <ReleaseArtwork
                        image={prev.artwork ?? undefined}
                        coverSrc={prev.coverSrc}
                        alt={`${prev.title} · cover`}
                        vibe={prev.vibe}
                      />
                    </div>
                    <div>
                      <div
                        className="font-display italic"
                        style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 0.95 }}
                      >
                        {prev.title}
                      </div>
                      <div className="mt-2 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        {prev.kind}
                      </div>
                    </div>
                  </div>
                </NextLink>
              ) : (
                <div aria-hidden="true" />
              )}
            </Reveal>
            <Reveal as="div" delay={120} className="col-span-12 md:col-span-6 md:text-right">
              {next ? (
                <NextLink href={`/music/${next.slug}`} className="group block">
                  <div className="font-mono text-mono-xs uppercase tracking-caps-md flex items-center gap-2 md:justify-end text-ink-3">
                    next release <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
                  </div>
                  <div className="mt-5 flex items-center gap-6 md:flex-row-reverse">
                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0">
                      <ReleaseArtwork
                        image={next.artwork ?? undefined}
                        coverSrc={next.coverSrc}
                        alt={`${next.title} · cover`}
                        vibe={next.vibe}
                      />
                    </div>
                    <div>
                      <div
                        className="font-display italic"
                        style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 0.95 }}
                      >
                        {next.title}
                      </div>
                      <div className="mt-2 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        {next.kind}
                      </div>
                    </div>
                  </div>
                </NextLink>
              ) : (
                <div>
                  <div className="font-mono text-mono-xs uppercase tracking-caps-md flex items-center gap-2 md:justify-end text-ink-3">
                    next release <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
                  </div>
                  <div className="mt-5">
                    <div
                      className="font-display italic"
                      style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 0.95 }}
                    >
                      new music<br />coming soon.
                    </div>
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================================
   JSON-LD · MusicAlbum for ep/album, MusicRecording for singles
   (PRD §9.4)
   ========================================================================= */
function JsonLd({ release }: { release: DisplayRelease }) {
  const isAlbum = release.format !== "single";
  const base = {
    "@context": "https://schema.org",
    "@type": isAlbum ? "MusicAlbum" : "MusicRecording",
    name: release.title,
    byArtist: {
      "@type": "MusicGroup",
      name: "Akilah Mali",
      alternateName: "Akilah Mali",
      url: "https://akilahmali.com",
    },
    datePublished: release.releaseDate,
    inLanguage: "en",
    url: `https://akilahmali.com/music/${release.slug}`,
    ...(release.label ? { recordLabel: release.label } : {}),
  };
  const payload = isAlbum
    ? {
        ...base,
        albumProductionType: "StudioAlbum",
        albumReleaseType: release.format === "ep" ? "EPRelease" : "AlbumRelease",
        numTracks: release.tracks.length,
        track: release.tracks.map((t) => ({
          "@type": "MusicRecording",
          name: t.title,
          duration: durationToISO(t.duration),
          position: t.n,
          byArtist: { "@type": "MusicGroup", name: "Akilah Mali" },
        })),
      }
    : {
        ...base,
        duration: durationToISO(release.tracks[0]?.duration ?? release.runtime),
      };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd(payload) }}
    />
  );
}

function durationToISO(mmss: string): string {
  const m = mmss.match(/^(\d+):(\d{2})$/);
  if (!m) return "";
  return `PT${parseInt(m[1], 10)}M${parseInt(m[2], 10)}S`;
}

function kindLabel(t: "musicVideo" | "visualizer" | "bts"): string {
  return t === "musicVideo"
    ? "official video"
    : t === "visualizer"
      ? "visualizer"
      : "live · session";
}
