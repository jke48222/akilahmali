"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isImmersive } from "@/lib/immersive";

/** Thin top bar that fills as the page scrolls. */
export function ScrollProgress() {
  const pathname = usePathname();
  const suppressed = isImmersive(pathname);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suppressed) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [suppressed]);

  if (suppressed) return null;
  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
