import { ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { LiteYouTube } from "@/components/LiteYouTube";
import { getAllVideos, type VideoCard } from "@/lib/queries";
import { STATIC_VIDEOS, formatReleaseDate, type StaticVideo } from "@/lib/static-content";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Music videos, visualizers, and live takes from MALI. One official video, the rest in between releases.",
  alternates: { canonical: "/videos" },
  openGraph: {
    title: "Videos — MALI",
    description:
      "Music videos, visualizers, and live takes from MALI.",
    url: "/videos",
    type: "website",
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
  /** Background still class for vibe stand-in. */
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
    runtime: "—",
    kindLabel: kindLabel(v.type),
    note: "",
    releaseTitle: v.release?.title ?? "—",
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
      <PageHeader
        index="00 / index"
        meta={`${videos.length} films · 2025`}
        title="Videos"
        subhead={
          <>
            one official video, two visualizers,
            <br />
            one live take. each one stays where it is.
          </>
        }
      />

      <section className="relative mt-20 md:mt-32" aria-labelledby="videos-heading">
        <h2 id="videos-heading" className="sr-only">
          All videos
        </h2>
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-16 list-none p-0">
            {videos.map((v, i) => (
              <Reveal as="li" delay={(i % 2) * 80} key={v._id} className="group">
                <article>
                  <LiteYouTube
                    videoId={v.youtubeId}
                    title={`${v.title} — ${v.kindLabel}`}
                    runtime={v.runtime !== "—" ? v.runtime : undefined}
                    burns={{
                      topLeft: v.kindLabel,
                      bottomLeft: v.note || undefined,
                      bottomRight: v.dateDisplay,
                    }}
                    className={`scan vig ${v.stillClass}`}
                  />

                  <div className="h-px w-full mt-5 bg-rule" />

                  <div className="mt-5 grid grid-cols-12 gap-3 items-baseline">
                    <div className="col-span-12 md:col-span-8">
                      <h3
                        className="font-display italic leading-[0.95] tracking-mark"
                        style={{ fontSize: "clamp(28px, 2.6vw, 38px)" }}
                      >
                        {v.title}
                      </h3>
                      <div className="mt-2 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                        from{" "}
                        {v.releaseSlug ? (
                          <NextLink
                            href={`/music/${v.releaseSlug}`}
                            className="ulink text-ink-2"
                          >
                            {v.releaseTitle}
                          </NextLink>
                        ) : (
                          <span className="text-ink-2">{v.releaseTitle}</span>
                        )}{" "}
                        {v.note ? <>&nbsp;·&nbsp; {v.note}</> : null}
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-4 md:text-right font-mono text-mono-xs uppercase tracking-caps-md tabular-nums text-ink-3">
                      {v.dateDisplay}
                      {v.runtime !== "—" ? <> &nbsp;·&nbsp; {v.runtime}</> : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* End note */}
      <section className="relative mt-28 md:mt-44">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
          <div className="h-px w-full bg-rule" />
          <div className="grid grid-cols-12 gap-6 md:gap-10 py-12 md:py-16">
            <Reveal as="div" className="col-span-12 md:col-span-5">
              <p className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
                end of reel — for now
              </p>
              <p
                className="mt-4 font-display italic leading-[1.15]"
                style={{ fontSize: "clamp(28px, 3.6vw, 36px)", maxWidth: "22ch" }}
              >
                more, when there&rsquo;s more.
              </p>
            </Reveal>
            <Reveal
              as="div"
              delay={120}
              className="col-span-12 md:col-span-5 md:col-start-8 md:pt-2"
            >
              <p className="text-[15px] leading-[1.65] text-ink-2">
                follow on youtube for visualizers and short loops in between releases.
                they go up quietly.
              </p>
              <a
                href="https://youtube.com/@malicantsing"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-caps-md ulink text-accent"
              >
                follow on youtube <ArrowUpRight size={14} strokeWidth={1.1} aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function VideosJsonLd({ videos }: { videos: DisplayVideo[] }) {
  const payload = {
    "@context": "https://schema.org",
    "@graph": videos.map((v) => ({
      "@type": "VideoObject",
      name: v.title,
      description: `${v.title} — ${v.kindLabel}. From the release ${v.releaseTitle}.`,
      thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
      uploadDate: v.date,
      embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
      contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
      publisher: {
        "@type": "MusicGroup",
        name: "MALI",
        url: "https://malicantsing.com",
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
