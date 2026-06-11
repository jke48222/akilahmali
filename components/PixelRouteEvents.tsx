"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Meta Pixel SPA page views. The base code (components/Tags.tsx) fires
 * PageView once on the initial document load; this fires it again on every
 * client-side route change so App Router navigations are counted. Safe no-op
 * when the pixel isn't configured. (GTM tracks SPA views via its own
 * History Change trigger — configure that in the GTM container.)
 */
export function PixelRouteEvents() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
