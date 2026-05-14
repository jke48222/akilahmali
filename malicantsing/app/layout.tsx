import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://malicantsing.com";
const SITE_NAME = "MALI";
const SITE_DESCRIPTION =
  "mali writes songs about people she used to know, and the rooms she left them in. brooklyn, n.y. — est. 2025.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MALI — malicantsing",
    template: "%s — malicantsing",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Akilah Mali" }],
  creator: "Akilah Mali",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "MALI — malicantsing",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MALI — malicantsing",
    description: SITE_DESCRIPTION,
    creator: "@malicantsing",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#F4F2EE",
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
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col overflow-x-clip bg-bg text-ink font-sans">
        <a href="#main" className="skip-link">
          skip to content
        </a>
        {children}
        {/* Vercel Analytics + Speed Insights — auto no-op in dev. */}
        <Analytics />
        <SpeedInsights />
        {/* Plausible — only injected when a real domain is configured. */}
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
