"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isImmersive } from "@/lib/immersive";

export function CursorFX() {
  const pathname = usePathname();
  const suppressed = isImmersive(pathname);
  const [enabled, setEnabled] = useState(false);
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suppressed) return;
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let raf = 0;

    // The follow loop only runs while the dot is catching up to the pointer;
    // once it settles it stops itself and the next pointer move wakes it again,
    // so an idle desktop isn't burning a rAF every frame for nothing.
    const tick = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      if (el.current) el.current.style.transform = `translate(${cx}px, ${cy}px)`;
      if (Math.abs(mx - cx) < 0.1 && Math.abs(my - cy) < 0.1) {
        raf = 0; // settled — sleep until the pointer moves again
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      wake();
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest(
        'a, button, [role="button"], input, textarea, summary, [data-cursor="hover"]',
      );
      el.current?.classList.toggle("is-hover", Boolean(interactive));
    };
    const onDown = () => el.current?.classList.add("is-down");
    const onUp = () => el.current?.classList.remove("is-down");

    wake();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [suppressed]);

  if (!enabled || suppressed) return null;
  return (
    <div ref={el} className="cursor-cross" aria-hidden="true" style={{ marginLeft: -12, marginTop: -12 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <line x1="12" y1="4" x2="12" y2="20" stroke="var(--color-accent)" strokeWidth="1" />
        <line x1="4" y1="12" x2="20" y2="12" stroke="var(--color-accent)" strokeWidth="1" />
      </svg>
    </div>
  );
}
