import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "./SectionLabel";
import { CuratorFeed } from "@/components/CuratorFeed";
import { InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/icons";
import { SOCIAL_PROFILES } from "@/lib/social";

const LINKS = [
  { label: "@akilah.mali", href: SOCIAL_PROFILES.instagram, Icon: InstagramIcon },
  { label: "@akilahmali", href: SOCIAL_PROFILES.tiktok, Icon: TikTokIcon },
  { label: "youtube", href: SOCIAL_PROFILES.youtube, Icon: YouTubeIcon },
];

export function SocialFeed() {
  return (
    <section className="relative" aria-labelledby="feed-heading">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
        <div className="flex items-end justify-between gap-6">
          <SectionLabel label="follow along" />
          <div className="hidden md:flex items-center gap-6 font-mono text-mono-sm uppercase tracking-caps text-ink-2">
            {LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                rel="noopener"
                target="_blank"
                data-cursor="hover"
                className="ulink inline-flex items-center gap-2"
              >
                <Icon width="14" height="14" /> {label}
              </a>
            ))}
          </div>
        </div>

        <h2 id="feed-heading" className="sr-only">
          Social feed
        </h2>

        <Reveal>
          <div className="mt-10 md:mt-14">
            <CuratorFeed />
          </div>
        </Reveal>

        {/* Mobile profile links */}
        <div className="md:hidden mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-mono-sm uppercase tracking-caps text-ink-2">
          {LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              rel="noopener"
              target="_blank"
              className="ulink inline-flex items-center gap-2"
            >
              <Icon width="14" height="14" /> {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
