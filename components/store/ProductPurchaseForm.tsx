"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type { ProductDetail, Variant } from "@/lib/shopify";
import { formatMoney } from "@/lib/shopify/format";
import { useCart } from "./cart-context";

type Props = {
  product: ProductDetail;
};

/**
 * Variant picker + qty stepper + Add-to-Cart for product detail pages.
 *
 * - Color swatches are rendered for the option named "Color".
 * - Size pills are rendered for the option named "Size".
 * - Other options are rendered as labeled pill groups generically.
 * - Selecting options resolves to the matching variant from product.variants.
 * - "Add" calls useCart().addLine(variantId, qty), which opens the drawer.
 */
export function ProductPurchaseForm({ product }: Props) {
  const variants = product.variants.nodes;
  const initial = useMemo(() => {
    const firstAvailable = variants.find((v) => v.availableForSale);
    return firstAvailable ?? variants[0] ?? null;
  }, [variants]);

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    initial?.selectedOptions.forEach((o) => {
      m[o.name] = o.value;
    });
    return m;
  });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const activeVariant: Variant | null = useMemo(() => {
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => selected[o.name] === o.value),
      ) ?? null
    );
  }, [variants, selected]);

  const { addLine, isPending, error } = useCart();

  async function onAdd() {
    if (!activeVariant || !activeVariant.availableForSale || isPending) return;
    await addLine(activeVariant.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const colorOption = product.options.find((o) => /color/i.test(o.name));
  const sizeOption = product.options.find((o) => /size/i.test(o.name));
  const otherOptions = product.options.filter(
    (o) => o !== colorOption && o !== sizeOption,
  );

  const buttonPrice = activeVariant?.price
    ? formatMoney(activeVariant.price)
    : formatMoney(product.priceRange.minVariantPrice);

  return (
    <div>
      {/* Price + scarcity */}
      <div className="mt-6 flex items-baseline gap-5">
        <div className="font-mono text-[22px] tabular-nums text-ink">
          {formatMoney(activeVariant?.price ?? product.priceRange.minVariantPrice)}
        </div>
        <div className="font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
          {activeVariant?.price.currencyCode ?? "USD"} · ships worldwide
        </div>
      </div>

      {product.description ? (
        <p className="mt-6 text-[15px] leading-[1.7] max-w-[44ch] text-ink-2">
          {product.description}
        </p>
      ) : null}

      {typeof activeVariant?.quantityAvailable === "number" &&
      activeVariant.quantityAvailable > 0 &&
      activeVariant.quantityAvailable < 100 ? (
        <ScarcityBar
          remaining={activeVariant.quantityAvailable}
          /* No reliable upstream "total made" · use remaining-only display. */
          total={Math.max(activeVariant.quantityAvailable, 60)}
        />
      ) : null}

      {/* Color */}
      {colorOption ? (
        <fieldset className="mt-9">
          <div className="flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
            <legend>{colorOption.name.toLowerCase()}</legend>
            <span className="text-ink-2">
              {selected[colorOption.name]?.toLowerCase() ?? ""}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {colorOption.values.map((v) => (
              <button
                key={v}
                type="button"
                aria-label={v}
                onClick={() => setSelected((s) => ({ ...s, [colorOption.name]: v }))}
                className={`swatch ${selected[colorOption.name] === v ? "is-on" : ""}`}
                style={{ background: colorSwatch(v) }}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Size */}
      {sizeOption ? (
        <fieldset className="mt-7">
          <div className="flex items-baseline justify-between font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
            <legend>{sizeOption.name.toLowerCase()}</legend>
            <a href="#sizing" className="ulink hover:text-ink-2 transition-colors">
              size guide
            </a>
          </div>
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            {sizeOption.values.map((v) => {
              const isSelected = selected[sizeOption.name] === v;
              const variantForValue = variants.find((variant) =>
                variant.selectedOptions.some(
                  (o) => o.name === sizeOption.name && o.value === v,
                ),
              );
              const inStock = variantForValue?.availableForSale ?? false;
              return (
                <button
                  key={v}
                  type="button"
                  disabled={!inStock}
                  onClick={() =>
                    inStock &&
                    setSelected((s) => ({ ...s, [sizeOption.name]: v }))
                  }
                  className={`size-btn ${isSelected ? "is-on" : ""} ${inStock ? "" : "is-out"}`}
                >
                  {v.toLowerCase()}
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
            {activeVariant?.availableForSale ? "in stock" : "sold out"}
          </p>
        </fieldset>
      ) : null}

      {otherOptions.map((opt) => (
        <fieldset key={opt.name} className="mt-7">
          <div className="font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
            <legend>{opt.name.toLowerCase()}</legend>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {opt.values.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelected((s) => ({ ...s, [opt.name]: v }))}
                className={`size-btn ${selected[opt.name] === v ? "is-on" : ""}`}
              >
                {v.toLowerCase()}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      {/* Qty + add to cart */}
      <div className="mt-8 flex items-stretch gap-4">
        <div
          className="flex items-center justify-between border border-ink px-2"
          style={{ minWidth: 110 }}
          aria-label="Quantity"
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="w-7 h-7 inline-flex items-center justify-center text-ink-2 hover:text-ink disabled:text-ink-3 disabled:cursor-not-allowed transition-colors"
          >
            <Minus size={14} strokeWidth={1.2} aria-hidden="true" />
          </button>
          <span
            className="font-mono text-[14px] tabular-nums"
            style={{ minWidth: 24, textAlign: "center" }}
            aria-live="polite"
          >
            {String(qty).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(6, q + 1))}
            disabled={qty >= 6}
            aria-label="Increase quantity"
            className="w-7 h-7 inline-flex items-center justify-center text-ink-2 hover:text-ink disabled:text-ink-3 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={14} strokeWidth={1.2} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={
            !activeVariant || !activeVariant.availableForSale || isPending
          }
          className={`atc ${added ? "is-added" : ""}`}
        >
          {added ? (
            <>
              <span className="inline-flex items-center gap-2">
                <Check size={14} strokeWidth={1.4} aria-hidden="true" /> added
              </span>
              <span aria-hidden="true">·</span>
            </>
          ) : isPending ? (
            <>
              <span>adding…</span>
              <span aria-hidden="true">·</span>
            </>
          ) : !activeVariant?.availableForSale ? (
            <>
              <span>sold out</span>
              <span aria-hidden="true">·</span>
            </>
          ) : (
            <>
              <span>add to cart</span>
              <span>{buttonPrice}</span>
            </>
          )}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-accent"
        >
          {error}
        </p>
      ) : null}

      <p className="mt-4 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
        ships within 5 business days · atlanta, ga
      </p>
    </div>
  );
}

function ScarcityBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  return (
    <div className="mt-7 font-mono text-mono-xs uppercase tracking-caps-md flex items-center gap-3 text-ink-3">
      <span>{remaining} of {total} remain</span>
      <span
        className="block flex-1 h-px relative overflow-hidden bg-rule"
        aria-hidden="true"
      >
        <span
          className="absolute left-0 top-0 bottom-0 bg-accent"
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}

/** Map common color names to a CSS color for the swatch background. */
function colorSwatch(value: string): string {
  const map: Record<string, string> = {
    bone: "#E6DFD0",
    cream: "#EFE6D6",
    black: "#15161A",
    plum: "#7A4E5E",
    rust: "#8a614a",
    sand: "#c4b59c",
    slate: "#3b4150",
    white: "#F4F2EE",
    natural: "#E6DFD0",
  };
  return map[value.toLowerCase()] ?? "#C7BDB0";
}
