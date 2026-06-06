import NextLink from "next/link";
import { Wordmark } from "./Logo";
import {
  AppleIcon,
  ArrowDiagIcon,
  InstagramIcon,
  LinkedInIcon,
  SpotifyIcon,
  TikTokIcon,
  YouTubeIcon,
} from "./icons";

const YEAR = new Date().getFullYear();

const LISTEN = [
  { label: "Spotify", href: "https://open.spotify.com/artist/13CrflPMkTb5mmizdGYL2i", Icon: SpotifyIcon },
  { label: "Apple Music", href: "https://music.apple.com/us/artist/mali/1815283080", Icon: AppleIcon },
  { label: "YouTube Music", href: "https://music.youtube.com/channel/UCQVqXv4_mcRLIE0Wy1WUSHw", Icon: YouTubeIcon },
];

const FOLLOW = [
  { label: "Instagram", href: "https://www.instagram.com/akilah.mali", Icon: InstagramIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@akilahmali", Icon: TikTokIcon },
  { label: "YouTube", href: "https://www.youtube.com/@akilahmali", Icon: YouTubeIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/akilah-brown-069b24341/", Icon: LinkedInIcon },
];

const SITE = [
  { label: "home", href: "/" },
  { label: "music", href: "/music" },
  { label: "videos", href: "/videos" },
  { label: "about", href: "/about" },
  { label: "shows", href: "/shows" },
  { label: "press", href: "/press" },
  { label: "contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="relative mt-section md:mt-section-lg" aria-label="Site footer">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
        <div className="h-px w-full bg-rule" />
        <div className="grid grid-cols-12 gap-6 md:gap-10 py-10 md:py-14">
          <div className="col-span-12 md:col-span-4">
            <Wordmark fit className="w-full max-w-[260px] text-ink" title="Akilah Mali" />
            <p className="mt-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
              akilah mali · b. 2005 · est. 2025
            </p>
          </div>

          <FooterCol title="listen" className="col-span-6 md:col-span-2">
            <ul className="space-y-2 text-[14px]">
              {LISTEN.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    rel="noopener"
                    className="ulink inline-flex items-center gap-2"
                  >
                    <Icon width="14" height="14" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterCol>

          <FooterCol title="follow" className="col-span-6 md:col-span-2">
            <ul className="space-y-2 text-[14px]">
              {FOLLOW.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    rel="noopener"
                    className="ulink inline-flex items-center gap-2"
                  >
                    <Icon width="14" height="14" /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </FooterCol>

          <FooterCol title="site" className="col-span-6 md:col-span-2">
            <ul className="space-y-2 text-[14px]">
              {SITE.map(({ label, href }) => (
                <li key={label}>
                  <NextLink href={href} className="ulink">
                    {label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </FooterCol>

          <FooterCol title="store" className="col-span-6 md:col-span-2">
            <ul className="space-y-2 text-[14px]">
              <li>
                <a
                  href="https://shop.akilahmali.com"
                  rel="noopener"
                  className="ulink inline-flex items-center gap-1"
                >
                  shop <ArrowDiagIcon width="12" height="12" />
                </a>
              </li>
            </ul>
          </FooterCol>
        </div>

        <div className="h-px w-full bg-rule" />
        <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
          <div>© {YEAR} akilah brown-pagan · all songs &amp; images</div>
          <div>atlanta, ga</div>
          <div>
            press &amp; sync &nbsp;·&nbsp;{" "}
            <a className="ulink" href="mailto:realmalimusic@gmail.com">
              realmalimusic@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="font-mono text-mono-xs uppercase tracking-caps-md mb-3 text-ink-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
