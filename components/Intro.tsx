"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isImmersive } from "@/lib/immersive";
import { Wordmark } from "@/components/Logo";

const SESSION_KEY = "mali-intro-seen";

export function Intro() {
  const pathname = usePathname();
  const suppressed = isImmersive(pathname);
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (suppressed) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }
    if (!seen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [suppressed]);

  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setLeaving(true);
    // Unlock scroll right away — the overlay still covers the page while it
    // animates out, so the page no longer feels frozen for the full second.
    document.body.style.overflow = "";
    window.setTimeout(() => setShow(false), 1000);
  }

  function onAura(e: React.PointerEvent) {
    const root = rootRef.current;
    if (!root) return;
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    root.style.setProperty("--ax", `${x}%`);
    root.style.setProperty("--ay", `${y}%`);
    if (markRef.current) {
      const dx = (e.clientX / window.innerWidth - 0.5) * 22;
      const dy = (e.clientY / window.innerHeight - 0.5) * 14;
      markRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") dismiss();
  }

  if (!show || suppressed) return null;

  return (
    <div
      ref={rootRef}
      className={`intro ${leaving ? "is-leaving" : ""}`}
      role="dialog"
      aria-label="Enter the site"
      onPointerMove={onAura}
      onKeyDown={onKey}
    >
      <div className="intro-aura" aria-hidden="true" />
      <div className="relative px-gutter text-center">
        <div ref={markRef} className="intro-mark" style={{ transition: "transform 300ms ease-out" }}>
          <span
            className="block select-none"
            style={{ fontSize: "clamp(40px, 12vw, 180px)", color: "var(--color-ink)" }}
          >
            <Wordmark />
          </span>
        </div>

        <div className="intro-enter mt-10 flex flex-col items-center">
          <button
            type="button"
            aria-label="Enter the site"
            data-cursor="hover"
            onClick={dismiss}
            className="font-mono text-mono-sm uppercase tracking-caps-md text-ink-2 hover:text-accent transition-colors"
          >
            enter
          </button>
          <div className="intro-rule mt-3" style={{ width: 60 }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
