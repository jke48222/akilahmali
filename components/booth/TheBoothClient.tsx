"use client";

/* =========================================================================
   Client-only loader for THE PAYPHONE — "DEAD LINE", a post-apocalyptic
   crimson phone-booth experience (/payphone).

   Like the other immersive worlds it's ~all WebGL + imperative client
   interactivity (three.js / fiber / drei / gsap), so it's split behind
   next/dynamic with ssr:false to keep that graph out of every other route's
   bundle. The ringing cover paints while the chunk streams.

   Mirrors components/drive/TheDriveClient.tsx.
   ========================================================================= */

import dynamic from "next/dynamic";

const TheBooth = dynamic(() => import("@/components/booth/TheBooth").then((m) => m.TheBooth), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-[60] h-[100dvh] w-screen bg-[#080103]" />,
});

export function TheBoothClient() {
  return <TheBooth />;
}
