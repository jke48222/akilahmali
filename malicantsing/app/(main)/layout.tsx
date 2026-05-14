import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

/**
 * Main-site shell — applies to everything in the (main) route group:
 * /, /about, /music, /press, /shows, /videos, /contact.
 *
 * The store group has its own shell at app/(store)/layout.tsx.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="main" className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </>
  );
}
