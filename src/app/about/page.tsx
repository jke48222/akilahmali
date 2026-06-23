import type { Metadata } from "next";
import { site } from "@/lib/site";
import SiteImg from "@/components/SiteImg";
import SigTitle from "@/components/SigTitle";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "About — Akilah Mali" };

export default function AboutPage() {
  return (
    <section
      className="relative overflow-hidden bg-lavender bg-repeat pt-28 pb-24 md:pt-36"
      style={{ backgroundImage: `url(${site.assets.bgLavender})` }}
    >
      <SiteImg
        src={site.assets.pixieMermaid}
        className="pointer-events-none absolute -right-2 top-24 w-24 opacity-60 sm:right-2 sm:top-28 sm:w-32 sm:opacity-90 lg:w-48"
      />
      <SiteImg
        src={site.assets.pix4}
        className="pointer-events-none absolute -left-3 bottom-16 w-24 opacity-60 sm:-left-4 sm:bottom-24 sm:w-32 sm:opacity-90 lg:w-44 z-20"
      />
      <div className="relative mx-auto max-w-[1300px] px-6 md:px-10">
        <Reveal>
          <SigTitle tone="plum" as="h1" className="text-7xl md:text-8xl">
            About
          </SigTitle>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr]">
          <Reveal variant="stagger" className="space-y-5 text-[0.95rem] leading-relaxed text-plum/90">
            {site.bio.map((para, i) => (
              <Reveal as="div" key={i}>
                <p>{para}</p>
              </Reveal>
            ))}
          </Reveal>

          <Reveal className="relative">
            <SiteImg
              src="/assets/press-2.jpg"
              alt="Akilah Mali press photo"
              className="aspect-[2/3] w-full max-w-md rounded-sm object-cover"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
