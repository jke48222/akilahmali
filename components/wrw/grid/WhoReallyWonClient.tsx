"use client";

/* =========================================================================
   Client-only loader for the WHO REALLY WON control-room experience.

   The experience is ~all WebGL + imperative client interactivity (three.js,
   @react-three/fiber, @react-three/drei, gsap), so server-rendering it produces
   nothing useful. Importing it statically from the /music/[slug] Server
   Component pulled that entire ~three.js graph into the first-load bundle of
   EVERY release page — including text-only releases that merely render and
   redirect. Splitting it behind next/dynamic with `ssr: false`:
     • removes three/drei/fiber/gsap from every other release route's bundle,
     • code-splits it into its own chunk that streams only when WRW mounts, so
       the page shell + paper-tear landing can paint while it loads.
   ========================================================================= */

import dynamic from "next/dynamic";

const WhoReallyWon = dynamic(
  () => import("@/components/wrw/grid/WhoReallyWon").then((m) => m.WhoReallyWon),
  {
    ssr: false,
    // The Landing paper-cover is the first thing on screen anyway; a matching
    // cream full-bleed fill avoids any black flash before the chunk arrives.
    loading: () => <div className="fixed inset-0 z-[60] h-[100dvh] w-screen bg-[#e9e3d6]" />,
  },
);

export function WhoReallyWonClient() {
  return <WhoReallyWon />;
}
