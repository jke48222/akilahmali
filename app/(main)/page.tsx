import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { LatestRelease } from "@/components/home/LatestRelease";
import { ThreeUp } from "@/components/home/ThreeUp";
import { AboutSnippet } from "@/components/home/AboutSnippet";
import { SocialFeed } from "@/components/home/SocialFeed";
import { EmailCapture } from "@/components/home/EmailCapture";
import { sanityFetch } from "@/lib/sanity";
import { jsonLd } from "@/lib/structured-data";
import {
  latestReleaseQuery,
  threeUpReleasesQuery,
  type LatestRelease as LatestReleaseData,
  type ReleaseCard,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "Akilah Mali",
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
      <LatestRelease release={latest} />
      <ThreeUp releases={threeUp} />
      <AboutSnippet />
      <SocialFeed />
      <EmailCapture />
    </>
  );
}

function HomeJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "Akilah Mali",
    alternateName: "Akilah Brown-Pagan",
    url: "https://akilahmali.com",
    image: "https://akilahmali.com/images/mali-portrait.jpg",
    genre: ["Pop", "Alternative R&B"],
    foundingDate: "2025",
    sameAs: [
      "https://www.instagram.com/akilah.mali",
      "https://www.tiktok.com/@akilahmali",
      "https://www.youtube.com/@akilahmali",
      "https://open.spotify.com/artist/13CrflPMkTb5mmizdGYL2i",
      "https://music.apple.com/us/artist/mali/1815283080",
    ],
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd(payload) }}
    />
  );
}
