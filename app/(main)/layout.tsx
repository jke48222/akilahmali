import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ChromeGate } from "@/components/ChromeGate";

/**
 * Main-site shell · applies to everything in the (main) route group:
 * /, /about, /music, /press, /shows, /videos, /contact.
 *
 * ChromeGate drops the nav/footer on immersive release routes
 * (e.g. /music/who-really-won) so the experience owns the viewport.
 *
 * The store group has its own shell at app/(store)/layout.tsx.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChromeGate nav={<Nav />} footer={<Footer />}>
      {children}
    </ChromeGate>
  );
}
