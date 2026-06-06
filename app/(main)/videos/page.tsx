import { ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { LiteYouTube } from "@/components/LiteYouTube";
import { getAllVideos, type VideoCard } from "@/lib/queries";
import { STATIC_VIDEOS, formatReleaseDate, type StaticVideo } from "@/lib/static-content";
import { jsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Videos",
  description: "Music videos, visualizers, and live takes from Akilah Mali.",
  alternates: { canonical: "/videos" },
  openGraph: {
    title: "Videos · Akilah Mali",
    description: "Music videos, visualizers, and live takes from Akilah Mali.",
    url: "/videos",
    type: "website",
    images: ["/opengraph-image"],
  },
};

export const revalidate = 60;

type DisplayVideo = {
  _id: string;
  title: string;
  youtubeId: string;
  dateDisplay: string;
  date: string;
  runtime: string;
  kindLabel: string;
  note: string;
  releaseTitle: string;
  releaseSlug: string;
  stillClass: string;
};

function kindLabel(t: VideoCard["type"]): string {
  return t === "musicVideo"
    ? "official video"
    : t === "visualizer"
      ? "visualizer"
      : "live · session";
}

function stillClassForSlug(slug: string | undefined): string {
  if (!slug) return "still-session";
  if (slug === "who-really-won") return "still-who";
  if (slug === "strange") return "still-strange";
  if (slug === "last-year") return "still-lastyear";
  return "still-session";
}

function liveToDisplay(v: VideoCard): DisplayVideo {
  return {
    _id: v._id,
    title: v.title,
    youtubeId: v.youtubeId,
    dateDisplay: formatReleaseDate(v.date, "monthYear"),
    date: v.date,
    runtime: "·",
    kindLabel: kindLabel(v.type),
    note: "",
    releaseTitle: v.release?.title ?? "·",
    releaseSlug: v.release?.slug ?? "",
    stillClass: stillClassForSlug(v.release?.slug),
  };
}

function staticToDisplay(v: StaticVideo): DisplayVideo {
  return {
    _id: v._id,
    title: v.title,
    youtubeId: v.youtubeId,
    dateDisplay: v.dateDisplay,
    date: v.date,
    runtime: v.runtime,
    kindLabel: v.kindLabel,
    note: v.note,
    releaseTitle: v.release.title,
    releaseSlug: v.release.slug,
    stillClass: stillClassForSlug(v.release.slug),
  };
}

export default async function VideosPage() {
  const live = await getAllVideos();
  const videos: DisplayVideo[] =
    live && live.length > 0
      ? live.map(liveToDisplay)
      : STATIC_VIDEOS.map(staticToDisplay);

  return (
    <>
      <VideosJsonLd videos={videos} />
      <PageHeader title="Videos" />

      {videos.length === 0 ? (
        <section className="relative mt-10 md:mt-16">
          <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
            <Reveal>
              <a
                href="https://www.youtube.com/@akilahmali"
                rel="noopener"
                className="inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-caps-md ulink text-accent"
              >
                follow on youtube <ArrowUpRight size={14} strokeWidth={1.1} aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="relative mt-10 md:mt-16" aria-labelledby="videos-heading">
          <h2 id="videos-heading" className="sr-only">All videos</h2>
          <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 list-none p-0">
              {videos.map((v, i) => (
                <Reveal as="li" delay={(i % 2) * 80} key={v._id} className="group">
                  <article>
                    <LiteYouTube
                      videoId={v.youtubeId}
                      title={`${v.title} · ${v.kindLabel}`}
                      runtime={v.runtime.includes(":") ? v.runtime : undefined}
                      burns={{
                        topLeft: v.kindLabel,
                        bottomLeft: v.note || undefined,
                        bottomRight: v.dateDisplay,
                      }}
                      className={`scan vig ${v.stillClass}`}
                    />
                    <div className="mt-4 grid grid-cols-12 gap-3 items-baseline">
                      <div className="col-span-12 md:col-span-8">
                        <h3
                          className="font-display italic leading-[0.95] tracking-mark"
                          style={{ fontSize: "clamp(28px, 2.6vw, 38px)" }}
                        >
                          {v.title}
                        </h3>
                        {v.releaseSlug ? (
                          <div className="mt-2 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                            from{" "}
                            <NextLink href={`/music/${v.releaseSlug}`} className="ulink text-ink-2">
                              {v.releaseTitle}
                            </NextLink>
                          </div>
                        ) : null}
                      </div>
                      <div className="col-span-12 md:col-span-4 md:text-right font-mono text-mono-xs uppercase tracking-caps-md tabular-nums text-ink-3">
                        {v.dateDisplay}
                        {v.runtime.includes(":") ? <> &nbsp;·&nbsp; {v.runtime}</> : null}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function VideosJsonLd({ videos }: { videos: DisplayVideo[] }) {
  const payload = {
    "@context": "https://schema.org",
    "@graph": videos.map((v) => ({
      "@type": "VideoObject",
      name: v.title,
      description: `${v.title} · ${v.kindLabel}. From the release ${v.releaseTitle}.`,
      thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
      uploadDate: v.date,
      embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
      contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
      publisher: {
        "@type": "MusicGroup",
        name: "Akilah Mali",
        url: "https://akilahmali.com",
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(payload) }}
    />
  );
}
