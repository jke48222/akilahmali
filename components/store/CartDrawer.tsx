"use client";

import { useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart, useCartLines } from "./cart-context";
import type { CartLine } from "@/lib/shopify";

/* =========================================================================
   CartDrawer · port of /docs/designs/cart drawer.html + cart-drawer.jsx
   Animation classes (.drawer-root, .drawer-panel, .drawer-backdrop, etc.) are
   defined in app/globals.css and `body.drawer-open` is toggled by the cart
   context.
   ========================================================================= */
export function CartDrawer() {
  const { cart, isOpen, isPending, error, close } = useCart();
  const lines = useCartLines();
  const isEmpty = lines.length === 0;
  const subtotalValue = cart?.cost.subtotalAmount;
  const totalCount = cart?.totalQuantity ?? 0;
  const checkoutUrl = cart?.checkoutUrl;

  return (
    <div
      className={`drawer-root ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={isOpen ? 0 : -1}
        onClick={close}
        className="drawer-backdrop"
      />
      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <header className="flex items-baseline justify-between px-6 md:px-7 pt-6 pb-5 border-b border-rule">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-[32px] md:text-[36px] leading-none tracking-mark">
              Cart
            </h2>
            {!isEmpty ? (
              <span className="font-mono text-mono-xs uppercase tracking-caps-md text-ink-3 tabular-nums">
                ({String(totalCount).padStart(2, "0")})
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="font-mono text-mono-xs uppercase tracking-caps-md inline-flex items-center gap-2 text-ink-2 hover:text-ink transition-colors"
          >
            close <X size={16} strokeWidth={1.4} aria-hidden="true" />
          </button>
        </header>

        {isEmpty ? (
          <EmptyState onClose={close} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 md:px-7">
              <ul className="list-none p-0">
                {lines.map((line) => (
                  <LineRow key={line.id} line={line} />
                ))}
              </ul>
              <div className="py-5 font-mono text-mono-xs uppercase tracking-caps-md flex items-center gap-3 text-ink-3">
                <span>small batch</span>
                <span className="block flex-1 h-px bg-rule" aria-hidden="true" />
                <span>when it&rsquo;s gone it&rsquo;s gone</span>
              </div>
            </div>

            <footer className="px-6 md:px-7 pt-5 pb-7 border-t border-rule bg-bg">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                  subtotal
                </span>
                <span className="font-display text-[32px] leading-none tabular-nums tracking-mark">
                  {formatMoney(subtotalValue)}
                </span>
              </div>
              <p className="mt-2 font-mono text-mono-xs uppercase tracking-caps-md text-ink-3">
                shipping calculated at checkout.
              </p>

              {error ? (
                <p
                  role="alert"
                  className="mt-3 font-mono text-mono-xs uppercase tracking-caps text-accent"
                >
                  {error}
                </p>
              ) : null}

              <a
                href={checkoutUrl ?? "#"}
                aria-disabled={!checkoutUrl}
                className={`mt-5 w-full py-[18px] px-[22px] bg-accent text-bg font-mono text-[11px] uppercase tracking-caps-md inline-flex items-center justify-between transition-colors hover:bg-accent-2 ${!checkoutUrl ? "opacity-60 pointer-events-none" : ""}`}
              >
                <span>{isPending ? "…" : "checkout"}</span>
                <span className="inline-flex items-center gap-2" aria-hidden="true">
                  · <ArrowRight size={14} strokeWidth={1.2} />
                </span>
              </a>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={close}
                  className="font-mono text-mono-xs uppercase tracking-caps-md ulink text-ink-3"
                >
                  continue shopping
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 cart-fade-up">
      <div className="text-ink-3" aria-hidden="true">
        <ShoppingBag size={36} strokeWidth={1.3} />
      </div>
      <p
        className="font-display italic mt-5 leading-[1.05] tracking-mark"
        style={{ fontSize: "clamp(38px, 5vw, 56px)" }}
      >
        your cart is empty.
      </p>
      <p className="mt-4 font-mono text-mono-xs uppercase tracking-caps-md max-w-[28ch] text-ink-3">
        the longsleeve is a good place to start.
      </p>
      <NextLink
        href="/shop"
        onClick={onClose}
        className="mt-6 inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-caps-md ulink ulink-on pb-1 text-accent"
      >
        browse the shop <ArrowRight size={14} strokeWidth={1.2} aria-hidden="true" />
      </NextLink>
      <button
        type="button"
        onClick={onClose}
        className="mt-10 font-mono text-mono-xs uppercase tracking-caps-md ulink text-ink-3"
      >
        continue shopping
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------------- */

function LineRow({ line }: { line: CartLine }) {
  const { updateLine, removeLine, isPending } = useCart();
  const [removing, setRemoving] = useState(false);

  const product = line.merchandise.product;
  const variantTitle = line.merchandise.selectedOptions
    .map((o) => `${o.value}`)
    .join(" · ");
  const image = line.merchandise.image;

  async function dec() {
    if (line.quantity <= 1) return;
    await updateLine(line.id, line.quantity - 1);
  }
  async function inc() {
    await updateLine(line.id, line.quantity + 1);
  }
  async function remove() {
    setRemoving(true);
    // Wait for the visual collapse to finish before mutating the cart so
    // the row appears to slide out cleanly (380ms matches `.li-row` CSS).
    setTimeout(() => removeLine(line.id), 380);
  }

  return (
    <li
      className={`li-row flex gap-4 py-5 border-b border-rule ${removing ? "is-removing" : ""}`}
      style={{ maxHeight: 240 }}
    >
      <div className="relative shrink-0 field" style={{ width: 64, height: 80 }}>
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product?.title ?? "Product image"}
            fill
            sizes="64px"
            className="object-cover"
            style={{ filter: "saturate(0.92) contrast(1.02)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-bg-2" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-[20px] leading-[1.05] tracking-mark truncate">
              {product?.title ?? line.merchandise.title}
            </div>
            <div className="font-mono text-mono-xs uppercase tracking-caps-md mt-1.5 text-ink-3">
              {variantTitle || line.merchandise.title}
            </div>
          </div>
          <div className="font-mono text-[13px] tabular-nums whitespace-nowrap text-ink">
            {formatMoney(line.cost.totalAmount)}
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div
            className="inline-flex items-center border border-rule h-7"
            aria-label="Quantity"
          >
            <button
              type="button"
              onClick={dec}
              disabled={line.quantity <= 1 || isPending}
              aria-label="Decrease quantity"
              className="w-[26px] h-[26px] inline-flex items-center justify-center text-ink-2 hover:text-ink disabled:text-ink-3 disabled:cursor-not-allowed transition-colors"
            >
              <Minus size={12} strokeWidth={1.4} aria-hidden="true" />
            </button>
            <span
              className="font-mono text-[12px] min-w-[24px] text-center text-ink tabular-nums"
              aria-live="polite"
            >
              {String(line.quantity).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={inc}
              disabled={isPending}
              aria-label="Increase quantity"
              className="w-[26px] h-[26px] inline-flex items-center justify-center text-ink-2 hover:text-ink disabled:text-ink-3 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={12} strokeWidth={1.4} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="font-mono text-mono-xs uppercase tracking-caps-md ulink hover:text-ink-2 transition-colors text-ink-3"
          >
            remove
          </button>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------------- */

function formatMoney(money?: { amount: string; currencyCode: string } | null) {
  if (!money) return "·";
  const amount = Number.parseFloat(money.amount);
  if (Number.isNaN(amount)) return "·";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${money.currencyCode} ${amount.toFixed(2)}`;
  }
}
