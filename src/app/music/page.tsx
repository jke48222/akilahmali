import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import SigTitle from "@/components/SigTitle";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "Music — Akilah Mali" };

export default function MusicPage() {
  return (
    <section
      className="bg-lavender bg-repeat bg-blend-multiply pt-28 pb-24 md:pt-36"
      style={{ backgroundImage: `url(${site.assets.bgLavender})` }}
    >
      <div className="mx-auto max-w-[1380px] px-6 md:px-10">
        <Reveal>
          <SigTitle tone="white" className="text-center text-7xl md:text-8xl">
            Listen Now
          </SigTitle>
        </Reveal>

        <Reveal className="mt-3 text-center">
          <Link
            href="/music/who-really-won"
            className="nav-label text-[0.7rem] text-cream/80 underline-offset-4 transition hover:text-cream hover:underline"
          >
            Explore the “Who Really Won?” EP →
          </Link>
        </Reveal>

        <Reveal variant="stagger" className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {site.musicGrid.map((cell, i) => (
            <Reveal as="div" key={i}>
              <SpotifyEmbed type={cell.type} id={cell.id} height={cell.height} />
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
