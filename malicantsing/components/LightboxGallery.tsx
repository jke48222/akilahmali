"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X, Maximize2 } from "lucide-react";
import { Reveal } from "./Reveal";

export type GalleryItem = {
  kind: "photo" | "field";
  /** Photo URL when kind === 'photo'. */
  src?: string;
  /** CSS class on a `.field` div when kind === 'field'. */
  fieldClass?: string;
  label: string;
  caption: string;
  pos?: string;
};

type Props = {
  items: GalleryItem[];
};

export function LightboxGallery({ items }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (active === null) return;
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      else if (e.key === "ArrowRight")
        setActive((a) => (a === null ? a : (a + 1) % items.length));
      else if (e.key === "ArrowLeft")
        setActive((a) =>
          a === null ? a : (a - 1 + items.length) % items.length,
        );
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, items.length]);

  useEffect(() => {
    if (active === null) setMounted(false);
  }, [active]);

  return (
    <>
      <ul className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6 list-none p-0">
        {items.map((g, i) => (
          <Reveal as="li" delay={(i % 3) * 80} key={`${g.label}-${i}`}>
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group block w-full text-left"
              aria-label={`Expand ${g.label}`}
            >
              <div className="relative aspect-square field overflow-hidden">
                {g.kind === "photo" && g.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.src}
                    alt={g.label}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    style={{
                      objectPosition: g.pos ?? "50% 50%",
                      filter: "saturate(0.9) contrast(1.02)",
                    }}
                  />
                ) : (
                  <div
                    className={`absolute inset-0 ${g.fieldClass ?? ""} transition-transform duration-700 group-hover:scale-[1.02]`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 inline-flex items-center justify-center w-7 h-7 rounded-full"
                  style={{
                    background: "rgba(15,10,12,0.55)",
                    color: "rgba(232,226,214,0.95)",
                  }}
                  aria-hidden="true"
                >
                  <Maximize2 size={12} strokeWidth={1.2} />
                </span>
                <span
                  className="absolute bottom-3 left-3 font-mono text-mono-xs uppercase tracking-caps-lg"
                  style={{ color: "rgba(232,226,214,0.78)" }}
                >
                  {String(i + 1).padStart(2, "0")} · {g.label}
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </ul>

      {active !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={items[active].caption}
          className={`fixed inset-0 z-[100] lb-back lb-anim ${mounted ? "in" : ""}`}
          onClick={() => setActive(null)}
        >
          <div
            className="absolute inset-0 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-gutter md:px-gutter-md lg:px-gutter-lg pt-5 md:pt-7 pb-4">
              <div
                className="font-mono text-mono-xs uppercase tracking-caps-lg"
                style={{ color: "rgba(232,226,214,0.7)" }}
              >
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")} &nbsp;·&nbsp;{" "}
                {items[active].caption}
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close lightbox"
                className="font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-center gap-2 ulink"
                style={{ color: "rgba(232,226,214,0.85)" }}
              >
                close <X size={14} strokeWidth={1.4} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center px-gutter md:px-gutter-md pb-10">
              <div className="relative w-full h-full flex items-center justify-center">
                {items[active].kind === "photo" && items[active].src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={items[active].src}
                    alt={items[active].label}
                    className="max-w-full object-contain"
                    style={{
                      maxHeight: "78vh",
                      filter: "saturate(0.92) contrast(1.02)",
                      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
                    }}
                  />
                ) : (
                  <div
                    className={`field ${items[active].fieldClass ?? ""}`}
                    style={{
                      width: "min(78vh, 92vw)",
                      height: "min(78vh, 92vw)",
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-gutter md:px-gutter-md lg:px-gutter-lg pb-6">
              <button
                type="button"
                onClick={() =>
                  setActive((a) =>
                    a === null ? a : (a - 1 + items.length) % items.length,
                  )
                }
                className="font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-center gap-2 ulink"
                style={{ color: "rgba(232,226,214,0.85)" }}
              >
                <ArrowLeft size={14} strokeWidth={1.2} aria-hidden="true" /> prev
              </button>
              <div
                className="font-mono text-mono-xs uppercase tracking-caps-md"
                style={{ color: "rgba(232,226,214,0.55)" }}
              >
                esc to close &nbsp;·&nbsp; ← → to flip
              </div>
              <button
                type="button"
                onClick={() =>
                  setActive((a) => (a === null ? a : (a + 1) % items.length))
                }
                className="font-mono text-mono-sm uppercase tracking-caps-md inline-flex items-center gap-2 ulink"
                style={{ color: "rgba(232,226,214,0.85)" }}
              >
                next <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
