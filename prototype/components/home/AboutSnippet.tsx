import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "./SectionLabel";

export function AboutSnippet() {
  return (
    <section id="about" className="relative">
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <div className="col-span-12 md:col-span-3">
            <Reveal>
              <SectionLabel index="03 / about" label="brooklyn, n.y." />
            </Reveal>
          </div>
          <Reveal
            as="div"
            delay={120}
            className="col-span-12 md:col-span-8 md:col-start-5"
          >
            <p
              className="font-display leading-[1.15] tracking-mark"
              style={{
                maxWidth: "22ch",
                fontSize: "var(--text-display-2xs)",
              }}
            >
              mali writes songs about{" "}
              <span className="italic">people she used to know</span>, and the
              rooms she left them in.
            </p>
            <p className="mt-6 md:mt-8 text-[15px] md:text-[16px] leading-[1.7] max-w-[58ch] text-ink-2">
              raised between baltimore and brooklyn. self-released since
              february. the name is a wink — she can sing. the irony is the
              point.
            </p>
            <div className="mt-8">
              <NextLink
                href="/about"
                className="font-mono text-mono-sm uppercase tracking-caps-md ulink inline-flex items-center gap-2"
              >
                read more{" "}
                <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
              </NextLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
