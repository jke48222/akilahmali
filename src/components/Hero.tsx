"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { site } from "@/lib/site";
import WhoReallyWon from "./WhoReallyWon";

/** Hero — full-bleed background video + animated "Who Really Won?" title + LISTEN NOW. */
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
          className="max-w-2xl text-white"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <WhoReallyWon className="w-[22rem] max-w-full md:w-[34rem]" />
          <div className="mt-8">
            <Link
              href={site.listenUrl}
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
