"use client";

/* =========================================================================
   Client-only loader for THE DRIVE — the immersive world for the next album
   (/music/endless-cycle).

   Like the WHO REALLY WON control room, this experience is ~all WebGL +
   imperative client interactivity (three.js, @react-three/fiber,
   @react-three/drei, gsap), so server-rendering it produces nothing useful.
   Splitting it behind next/dynamic with `ssr: false`:
     • keeps three/drei/fiber/gsap out of every OTHER release route's bundle,
     • code-splits it into its own chunk that streams only when The Drive
       mounts, so the rain-on-glass cover can paint while the chunk loads.

   Mirrors components/wrw/grid/WhoReallyWonClient.tsx.
   ========================================================================= */

import dynamic from "next/dynamic";

const TheDrive = dynamic(
  () => import("@/components/drive/TheDrive").then((m) => m.TheDrive),
  {
    ssr: false,
    // The rain-on-glass cover is the first thing on screen anyway; a matching
    // deep-crimson full-bleed fill avoids any flash before the chunk arrives.
    loading: () => <div className="fixed inset-0 z-[60] h-[100dvh] w-screen bg-[#0a0204]" />,
  },
);

export function TheDriveClient() {
  return <TheDrive />;
}
