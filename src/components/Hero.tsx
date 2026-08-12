"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { site } from "@/lib/site";

/** Hero — full-bleed background video + featured-release title + LISTEN NOW. */
export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={site.assets.heroVideo}
        poster={site.assets.heroPoster}
        autoPlay
        muted
        loop
        playsInline
      />
      {/* readability vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/15 to-ink/50" />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 md:px-10">
        <motion.div
          className="max-w-3xl text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <h1
            className="sig-title grain-text grain-text-white -ml-[0.22em] whitespace-nowrap text-6xl sm:text-7xl md:text-9xl"
            // fontWeight inline: .sig-title pins 400 (unlayered CSS beats the
            // font-bold utility), and the 400-only font gets synthetic bold
            style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))", fontWeight: 700 }}
          >
            {site.release.title}
          </h1>
          <div className="mt-6">
            <Link
              href={site.release.listenUrl}
              className="nav-label inline-block border border-white/80 px-9 py-3 text-xs text-white transition hover:bg-white hover:text-ink"
            >
              Listen Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
