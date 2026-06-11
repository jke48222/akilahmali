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
    <div ref={el} className="cursor-cross" aria-hidden="true" style={{ marginLeft: -14, marginTop: -14 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <defs>
          {/* deep red rose body — lit crown, shadowed base */}
          <radialGradient id="rose-body" cx="0.42" cy="0.32" r="0.85">
            <stop offset="0" stopColor="#C21A18" />
            <stop offset="0.45" stopColor="#810100" />
            <stop offset="1" stopColor="#630000" />
          </radialGradient>
          <linearGradient id="rose-fold" x1="14" y1="4" x2="14" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#630000" />
            <stop offset="1" stopColor="#3A0000" />
          </linearGradient>
        </defs>
        {/* outer petal — rounded crown with a soft curl, tapering to the base */}
        <path
          d="M14 26.5C5.5 19.5 5 11 9.6 5.4 11.6 3 16.4 3 18.4 5.4 23 11 22.5 19.5 14 26.5Z"
          fill="url(#rose-body)"
          stroke="#5C0A1A"
          strokeWidth="0.5"
          strokeOpacity="0.55"
        />
        {/* inner folded petal — the rolled center of the rose */}
        <path
          d="M14 24.5C9.6 19.8 9.2 13 12 8.6 12.9 7.2 15.1 7.2 16 8.6 18.8 13 18.4 19.8 14 24.5Z"
          fill="url(#rose-fold)"
          fillOpacity="0.8"
        />
        {/* specular highlight on the upper-left lobe */}
        <path
          d="M11.4 6.6C9.6 8.6 8.8 12 9.8 15.4"
          stroke="#E36A60"
          strokeWidth="1.1"
          strokeOpacity="0.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* center crease */}
        <path d="M14 23.5C13.4 17.5 13.4 12 14 8.5" stroke="#EDEBDD" strokeWidth="0.7" strokeOpacity="0.35" fill="none" />
      </svg>
    </div>
  );
}
