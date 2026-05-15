"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/shopify/types";

type ProductGalleryProps = {
  images: ProductImage[];
  productTitle: string;
};

const VIEW_LABELS = ["on body", "flat", "detail", "alt", "alt", "alt"];

/**
 * Product image carousel — main image + thumbnail strip. Keyboard switching
 * via `aria-controls` on each thumbnail. Falls back to a single empty .field
 * if the product has no images yet (Shopify product with no media).
 */
export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const safeImages =
    images.length > 0
      ? images
      : [];

  const [active, setActive] = useState(0);
  const total = safeImages.length;
  const current = safeImages[active];

  if (total === 0) {
    return (
      <div
        className="relative w-full field ls-onbody"
        style={{ aspectRatio: "4/5" }}
        aria-label="No imagery yet"
      />
    );
  }

  return (
    <div>
      <div className="relative w-full field" style={{ aspectRatio: "4/5" }}>
        <Image
          src={current.url}
          alt={current.altText ?? `${productTitle} — view ${active + 1}`}
          fill
          sizes="(min-width: 1024px) 58vw, (min-width: 768px) 60vw, 100vw"
          priority={active === 0}
          className="object-cover"
          style={{ filter: "saturate(0.92) contrast(1.02)" }}
        />
        <span
          className="absolute top-5 right-5 text-right font-mono text-mono-xs uppercase tracking-caps-lg"
          style={{ color: "rgba(239,230,214,0.6)" }}
          aria-hidden="true"
        >
          <span className="block">fig. {String.fromCharCode(97 + active)}</span>
          <span className="block mt-1 tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </span>
      </div>

      {total > 1 ? (
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-3 md:mt-4">
          {safeImages.slice(0, 3).map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${VIEW_LABELS[i] ?? `image ${i + 1}`}`}
              aria-pressed={active === i}
              className={`thumb relative w-full ${active === i ? "is-on" : ""}`}
              style={{ aspectRatio: "4/5" }}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 20vw, 33vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-lg text-ink-3">
        <span>{VIEW_LABELS[active] ?? "view"}</span>
        <span className="tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
