import type { Metadata, Viewport } from "next";
import { Libre_Baskerville, Space_Mono, Special_Elite, VT323 } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Intro } from "@/components/Intro";
import { CursorFX } from "@/components/CursorFX";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import { PersistentPlayer } from "@/components/player/PersistentPlayer";
import "./globals.css";

/* Brand typeface — Libre Baskerville. Drives the wordmark, all display
   headings, and body/UI text (see --font-sans / --font-display in globals.css). */
const libreBaskerville = Libre_Baskerville({
  variable: "--font-serif-src",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/* Mono for labels + captions. */
const spaceMono = Space_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

/* /payphone only — typewriter for the distress-call transcript + stamped UI. */
const specialElite = Special_Elite({
  variable: "--font-booth-src",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

/* /payphone only — terminal/LCD face for the number readout. */
const vt323 = VT323({
  variable: "--font-lcd-src",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const SITE_URL = "https://akilahmali.com";
const SITE_NAME = "Akilah Mali";
const SITE_DESCRIPTION =
  "akilah mali writes songs about people she used to know, and the rooms she left them in. atlanta, ga · est. 2025.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Akilah Mali",
    template: "%s · Akilah Mali",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Akilah Mali" }],
  creator: "Akilah Mali",
  publisher: "Akilah Mali",
  keywords: [
    "Akilah Mali",
    "akilah mali",
    "Akilah Brown-Pagan",
    "singer songwriter",
    "Atlanta musician",
    "indie pop",
    "alternative R&B",
    "Who Really Won",
    "new music",
  ],
  category: "music",
  formatDetection: { telephone: false, address: false, email: false },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Akilah Mali",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akilah Mali",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1B1717",
  width: "device-width",
  initialScale: 1,
  // render edge-to-edge into the iOS safe areas (under the Dynamic Island / home
  // indicator) so the site is truly full-screen on mobile browsers
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${spaceMono.variable} ${specialElite.variable} ${vt323.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col overflow-x-clip bg-bg text-ink font-sans">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              alternateName: "akilah mali",
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              inLanguage: "en-US",
              publisher: { "@type": "Person", name: SITE_NAME },
            }),
          }}
        />
        <a href="#main" className="skip-link">
          skip to content
        </a>
        <ScrollProgress />
        <CursorFX />
        <Intro />
        <PlayerProvider>
          {children}
          <PersistentPlayer />
        </PlayerProvider>
        {/* Vercel Analytics + Speed Insights · auto no-op in dev. */}
        <Analytics />
        <SpeedInsights />
        {/* Plausible · only injected when a real domain is configured. */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
