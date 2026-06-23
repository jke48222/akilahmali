import type { Metadata } from "next";
import { WhoReallyWonClient } from "@/components/wrw/grid/WhoReallyWonClient";

export const metadata: Metadata = {
  title: "Who Really Won? — Akilah Mali",
  description:
    "Step into the control room — Akilah Mali's immersive experience for the Who Really Won? EP. Click a monitor to play.",
  alternates: { canonical: "/music/who-really-won" },
};

export default function WhoReallyWonPage() {
  return <WhoReallyWonClient />;
}
