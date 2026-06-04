"use client";

import { usePathname } from "next/navigation";
import { isImmersive } from "@/lib/immersive";

/**
 * Wraps the main-site shell. On immersive release routes it drops the nav,
 * footer, and page padding so the experience renders edge-to-edge; everywhere
 * else it renders the normal chrome.
 */
export function ChromeGate({
  nav,
  footer,
  children,
}: {
  nav: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const immersive = isImmersive(usePathname());

  if (immersive) return <>{children}</>;

  return (
    <>
      {nav}
      <main id="main" className="flex-1 w-full">
        {children}
      </main>
      {footer}
    </>
  );
}
