/**
 * Studio gets a bare layout — no Nav, no Footer, no analytics. The Studio
 * provides its own chrome. Forcing dynamic so we don't try to prerender.
 */
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
