import type { Metadata, Viewport } from "next";
import { Fraunces, Space_Grotesk, Space_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Intro } from "@/components/Intro";
import { CursorFX } from "@/components/CursorFX";
import { ScrollProgress } from "@/components/ScrollProgress";
import "./globals.css";

/* Editorial display serif (variable weight + optical sizing + soft/wonky axes). */
const fraunces = Fraunces({
  variable: "--font-display-src",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

/* Modern grotesque for UI + body. */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/* Mono for labels + captions. */
const spaceMono = Space_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const SITE_URL = "https://malicantsing.com";
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
  themeColor: "#EDE8F2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${fraunces.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col overflow-x-clip bg-bg text-ink font-sans">
        <a href="#main" className="skip-link">
          skip to content
        </a>
        <ScrollProgress />
        <CursorFX />
        <Intro />
        {children}
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
