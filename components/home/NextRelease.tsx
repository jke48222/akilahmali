import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "./SectionLabel";

/**
 * Teaser for the next era. No titles or dates yet — just an invitation to join
 * the list and be first to hear the new music.
 */
export function NextRelease() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="next-heading">
      {/* Soft crimson glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 70% at 80% 30%, rgba(224,32,58,0.08), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pt-section md:pt-section-xl">
        <Reveal>
          <SectionLabel label="new music" />
        </Reveal>

        <div className="mt-8 md:mt-12 grid grid-cols-12 gap-6 md:gap-10 items-end">
          <Reveal as="div" className="col-span-12 md:col-span-8">
            <h2
              id="next-heading"
              className="font-display leading-[0.98] tracking-mark"
              style={{ fontSize: "var(--text-display-m)", color: "var(--color-ink)" }}
            >
              more on the way.
            </h2>
            <p className="mt-6 max-w-[46ch] text-[16px] leading-[1.7] text-ink-2">
              new songs are coming. join the list and you&rsquo;ll be the first
              to hear them — no spam, just the music.
            </p>
          </Reveal>

          <Reveal as="div" delay={140} className="col-span-12 md:col-span-4 md:text-right">
            <NextLink
              href="/#next"
              data-cursor="hover"
              className="font-mono text-mono-sm uppercase tracking-caps-md ulink inline-flex items-center gap-2 text-accent hover:text-accent-2"
            >
              join the list
              <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
            </NextLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
