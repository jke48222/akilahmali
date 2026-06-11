import NextLink from "next/link";
import { ArrowDown } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { NavThemeSentinel } from "@/components/NavThemeSentinel";
import { Wordmark } from "@/components/Logo";
import { HeroVideo } from "./HeroVideo";
import { SpinBadge } from "./SpinBadge";

/**
 * Cinematic full-bleed hero. A muted, looped YouTube film (via the IFrame API,
 * no player chrome) sits edge to edge behind a dark scrim and grain; the
 * wordmark and a single call to listen sit on top.
 */
export function Hero() {
  return (
    <section id="top" className="vhero grain-fixed" aria-label="Akilah Mali">
      {/* Keep the nav light while the dark hero film fills the viewport. */}
      <NavThemeSentinel />
      <HeroVideo />

      <div className="vhero-scrim" />

      {/* Top meta */}
      <div className="absolute top-24 md:top-28 right-gutter md:right-gutter-md lg:right-gutter-lg text-right z-10">
        <p
          className="font-mono text-mono-xs uppercase tracking-caps-lg"
          style={{ color: "rgba(241,233,220,0.6)" }}
        >
          <span className="block">akilah mali</span>
          <span className="block mt-1">atlanta, ga</span>
        </p>
      </div>

      {/* Rotating "out now" badge — desktop only, off the video's focal centre */}
      <div className="absolute top-1/2 -translate-y-1/2 right-gutter md:right-gutter-md lg:right-gutter-lg z-10 hidden lg:block">
        <SpinBadge />
      </div>

      {/* Wordmark + listen */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg pb-10 md:pb-14 lg:pb-16">
          <Reveal as="h1">
            <span
              className="block select-none"
              style={{
                fontSize: "clamp(40px, 11vw, 200px)",
                color: "var(--color-cream)",
                filter: "drop-shadow(0 2px 30px rgba(0,0,0,0.45))",
              }}
            >
              <Wordmark />
            </span>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-5 md:mt-6 flex flex-wrap items-end justify-between gap-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <span
                  className="font-mono text-mono-xs uppercase tracking-caps-lg"
                  style={{ color: "rgba(241,233,220,0.62)" }}
                >
                  who really won? out now
                </span>
                <NextLink
                  href="/music"
                  className="font-mono text-mono-sm uppercase tracking-caps-md ulink ulink-on text-accent hover:text-accent-2"
                >
                  listen
                </NextLink>
              </div>
              <a
                href="#music"
                className="hidden md:inline-flex items-center gap-2 font-mono text-mono-xs uppercase tracking-caps-lg pb-1"
                style={{ color: "rgba(241,233,220,0.6)" }}
              >
                scroll
                <ArrowDown size={14} strokeWidth={1.2} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
