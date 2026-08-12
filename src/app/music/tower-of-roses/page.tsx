import type { Metadata } from "next";
import { TowerOfRosesStub } from "@/components/wrw/TowerOfRosesStub";

export const metadata: Metadata = {
  title: "Tower of Roses — Akilah Mali",
  description:
    "Tower of Roses — the new single from Akilah Mali, out now. Watch the reel and listen on Spotify or Apple Music.",
  alternates: { canonical: "/music/tower-of-roses" },
};

export default function TowerOfRosesPage() {
  return <TowerOfRosesStub />;
}
