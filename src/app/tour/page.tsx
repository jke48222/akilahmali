import type { Metadata } from "next";
import { site } from "@/lib/site";
import SigTitle from "@/components/SigTitle";
import Reveal from "@/components/Reveal";
import SiteImg from "@/components/SiteImg";

export const metadata: Metadata = { title: "Tour — Akilah Mali" };

export default function TourPage() {
  return (
    <>
      {/* Banner with Tour title overlay (drop in an Akilah Mali press photo) */}
      <section className="relative h-[70svh] min-h-[420px] w-full overflow-hidden">
        <SiteImg
  src="/assets/press-1.jpg"
  alt="Akilah Mali press photo"
  className="absolute inset-0 h-full w-full object-cover object-center"
/>
        <div className="absolute inset-0 bg-gradient-to-t from-plum/70 via-transparent to-ink/30" />
        <div className="absolute inset-0 mx-auto flex max-w-[1500px] items-end px-6 pb-10 md:px-10">
          <Reveal>
            <SigTitle tone="white" as="h1" className="text-8xl md:text-9xl">
              Tour
            </SigTitle>
          </Reveal>
        </div>
      </section>

      {/* Dates removed for now */}
      <section
        className="relative overflow-hidden bg-plum bg-repeat py-24 text-center md:py-32"
        style={{ backgroundImage: `url(${site.assets.bgPlum})` }}
      >
        <div className="relative mx-auto max-w-2xl px-6">
          <Reveal>
            <p className="nav-label text-sm text-white/80">Tour dates coming soon</p>
            <p className="mt-4 text-sm text-white/55">
              Check back for upcoming shows, or subscribe below to be the first to know.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
