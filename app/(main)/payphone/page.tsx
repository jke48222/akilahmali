import type { Metadata } from "next";
import { TheBoothClient } from "@/components/booth/TheBoothClient";

/* =========================================================================
   /payphone — "DEAD LINE", the post-apocalyptic phone-booth experience.
   The whole page IS the immersive WebGL world (client-only, code-split).
   ========================================================================= */

export const metadata: Metadata = {
  title: "Dead Line",
  description:
    "The last working payphone in a dead, neon-crimson city — an immersive experience from Akilah Mali. Answer the call and dial.",
  alternates: { canonical: "/payphone" },
  openGraph: {
    title: "Dead Line · Akilah Mali",
    description:
      "The last working payphone in a dead, neon-crimson city. Answer the call and dial.",
    url: "/payphone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead Line · Akilah Mali",
    description: "The last working payphone in a dead, neon-crimson city. Answer the call and dial.",
  },
};

export default function PayphonePage() {
  return <TheBoothClient />;
}
