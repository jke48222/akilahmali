import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { LatestRelease } from "@/components/home/LatestRelease";
import { ThreeUp } from "@/components/home/ThreeUp";
import { AboutSnippet } from "@/components/home/AboutSnippet";
import { SocialFeed } from "@/components/home/SocialFeed";
import { EmailCapture } from "@/components/home/EmailCapture";
import { sanityFetch } from "@/lib/sanity";
import { artistJsonLd, jsonLd } from "@/lib/structured-data";
import {
  latestReleaseQuery,
  threeUpReleasesQuery,
  type LatestRelease as LatestReleaseData,
  type ReleaseCard,
} from "@/lib/queries";

export const metadata: Metadata = {
  // `absolute` opts out of the root layout's "%s · Akilah Mali" template so the
  // home tab/search title is just "Akilah Mali", not "Akilah Mali · Akilah Mali".
  title: { absolute: "Akilah Mali" },
  description:
    "akilah mali writes songs about people she used to know, and the rooms she left them in. atlanta, ga · est. 2025.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Akilah Mali",
    description:
      "akilah mali writes songs about people she used to know, and the rooms she left them in.",
    url: "/",
    type: "website",
    images: ["/opengraph-image"],
  },
};

export default async function Home() {
  // Parallelize the two CMS reads. Both return null gracefully when Sanity
  // isn't configured · section components fall back to static content.
  const [latest, threeUp] = await Promise.all([
    sanityFetch<LatestReleaseData>(latestReleaseQuery),
    sanityFetch<ReleaseCard[]>(threeUpReleasesQuery),
  ]);

  return (
    <>
      <HomeJsonLd />
      <Hero />
      <Ticker />
      <LatestRelease release={latest} />
      <ThreeUp releases={threeUp} />
      <AboutSnippet />
      <SocialFeed />
      <EmailCapture />
    </>
  );
}

function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd(artistJsonLd()) }}
    />
  );
}
