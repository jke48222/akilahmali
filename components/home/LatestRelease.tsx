import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "./SectionLabel";
import { ReleaseArtwork } from "./ReleaseArtwork";
import { AppleIcon, SpotifyIcon } from "@/components/icons";
import {
  STATIC_LATEST,
  formatReleaseDate,
  vibeFromSlug,
} from "@/lib/static-content";
import { portableTextToPlain } from "@/lib/portable-text";
import type { LatestRelease as LatestReleaseData } from "@/lib/queries";

type Props = {
  /** Resolved from Sanity (null when the dataset is empty or unconfigured). */
  release: LatestReleaseData | null;
};

type DisplayData = {
  title: string;
  releaseDate: string;
  type: "single" | "ep" | "album";
  description: string;
  credits: Array<[string, string]>;
  streamingLinks?: LatestReleaseData["streamingLinks"];
  coverSrc?: string;
  vibe: "strange" | "who" | "lastyear";
};

function toDisplay(release: LatestReleaseData | null): DisplayData {
  if (!release) {
    return {
      title: STATIC_LATEST.title,
      releaseDate: STATIC_LATEST.releaseDate,
      type: STATIC_LATEST.type,
      description: STATIC_LATEST.blurb,
      credits: STATIC_LATEST.credits,
      streamingLinks: STATIC_LATEST.streamingLinks,
      coverSrc: STATIC_LATEST.coverImage,
      vibe: STATIC_LATEST.vibe,
    };
  }
  return {
    title: release.title,
    releaseDate: release.releaseDate,
    type: release.type,
    description: portableTextToPlain(release.description),
    // Sanity stores credits as portable text; we collapse to a single labelled row.
    credits: release.credits
      ? [["credits", portableTextToPlain(release.credits)]]
      : [],
    streamingLinks: release.streamingLinks,
    coverSrc: undefined,
    vibe: vibeFromSlug(release.slug),
  };
}

export function LatestRelease({ release }: Props) {
  const data = toDisplay(release);
  const releasedLabel = `new · released ${formatReleaseDate(data.releaseDate, "monthYear")}`;

  const links = [
    {
      label: "Spotify",
      href: data.streamingLinks?.spotify ?? "#",
      Icon: SpotifyIcon,
      italic: false,
    },
    {
      label: "Apple Music",
      href: data.streamingLinks?.appleMusic ?? "#",
      Icon: AppleIcon,
      italic: false,
    },
    {
      label: "everywhere else",
      href: data.streamingLinks?.smartlink ?? "#",
      Icon: null,
      italic: true,
    },
  ];

  return (
    <section id="music" className="relative">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-md lg:pt-section-lg">
        <SectionLabel label="latest release" />

        <div className="grid grid-cols-12 gap-6 md:gap-10 mt-10 md:mt-14">
          <Reveal as="div" className="col-span-12 md:col-span-7 lg:col-span-7">
            <ReleaseArtwork
              image={release?.artwork}
              coverSrc={data.coverSrc}
              alt={`${data.title} · cover artwork`}
              vibe={data.vibe}
              variant="latest"
            />
          </Reveal>

          <Reveal
            as="div"
            delay={120}
            className="col-span-12 md:col-span-5 lg:col-span-5 flex flex-col"
          >
            <p className="font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
              {releasedLabel}
            </p>
            <h2
              className="font-display italic mt-3 leading-[0.95] tracking-mark"
              style={{ fontSize: "var(--text-display-m)" }}
            >
              {data.title.toLowerCase()}
            </h2>
            {data.description ? (
              <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.65] text-ink-2">
                {data.description}
              </p>
            ) : null}

            <div className="mt-8 md:mt-10">
              <p className="font-mono text-mono-xs uppercase tracking-caps-lg mb-3 text-ink-3">
                listen
              </p>
              <ul className="border-t border-b border-rule divide-y divide-rule">
                {links.map(({ label, href, Icon, italic }) => (
                  <li key={label}>
                    <a
                      href={href}
                      rel="noopener"
                      className="group flex items-center justify-between py-4 ulink ulink-on"
                    >
                      <span className="flex items-center gap-3">
                        {Icon ? (
                          <Icon width="16" height="16" />
                        ) : (
                          <span
                            className="inline-block w-4 h-4 rounded-full border border-current"
                            aria-hidden="true"
                          />
                        )}
                        <span
                          className={`font-display text-[24px] md:text-[26px] ${italic ? "italic" : ""}`}
                        >
                          {label}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1.1}
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </Reveal>
        </div>
      </div>
    </section>
  );
}
