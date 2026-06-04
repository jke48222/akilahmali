import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { LatestRelease } from "@/components/home/LatestRelease";
import { ThreeUp } from "@/components/home/ThreeUp";
import { AboutSnippet } from "@/components/home/AboutSnippet";
import { EmailCapture } from "@/components/home/EmailCapture";
import { sanityFetch } from "@/lib/sanity";
import {
  latestReleaseQuery,
  threeUpReleasesQuery,
  type LatestRelease as LatestReleaseData,
  type ReleaseCard,
} from "@/lib/queries";

export const metadata: Metadata = {
  title: "MALI — malicantsing",
  description:
    "mali writes songs about people she used to know, and the rooms she left them in. brooklyn, n.y. — est. 2025.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MALI — malicantsing",
    description:
      "mali writes songs about people she used to know, and the rooms she left them in.",
    url: "/",
    type: "website",
  },
};

export default async function Home() {
  // Parallelize the two CMS reads. Both return null gracefully when Sanity
  // isn't configured — section components fall back to static content.
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
      <EmailCapture />
    </>
  );
}

function HomeJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "MALI",
    alternateName: "Akilah Mali",
    url: "https://malicantsing.com",
    image: "https://malicantsing.com/og-default.jpg",
    genre: ["Alternative R&B", "Indie pop"],
    foundingDate: "2025",
    sameAs: [
      "https://instagram.com/malicantsing",
      "https://tiktok.com/@malicantsing",
      "https://youtube.com/@malicantsing",
    ],
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
