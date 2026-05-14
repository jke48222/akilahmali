"use client";

import { useEffect, useRef } from "react";

/**
 * Render at the top of a page that has a dark hero. Toggles a body class
 * (`nav-on-dark`) while the sentinel is in view, so Nav can flip its colors.
 * CSS-only fallback for prefers-reduced-motion.
 */
export function NavThemeSentinel({ height = "100svh" }: { height?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle(
          "nav-on-dark",
          entry.isIntersecting && entry.intersectionRatio > 0.35,
        );
      },
      { threshold: [0, 0.35, 0.7, 1] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      document.body.classList.remove("nav-on-dark");
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        height,
        pointerEvents: "none",
      }}
    />
  );
}
