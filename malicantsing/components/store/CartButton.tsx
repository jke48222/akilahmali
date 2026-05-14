"use client";

import { useCart, useCartCount } from "./cart-context";

/**
 * Cart toggle in the store nav. Shows the live total quantity (server-set
 * initial value, then live after hydration). Always renders the badge so
 * there's no layout shift when the count flips from 0 → 1.
 */
export function CartButton() {
  const { open } = useCart();
  const count = useCartCount();
  const label = count > 0 ? `Open cart (${count} items)` : "Open cart";

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      className="ulink nav-link transition-colors duration-500 text-ink-2 hover:text-ink focus-visible:text-ink inline-flex items-baseline gap-1 font-mono text-mono-sm uppercase tracking-caps-sm"
    >
      cart{" "}
      <span className="text-ink-3 tabular-nums" aria-hidden="true">
        ({String(count).padStart(2, "0")})
      </span>
    </button>
  );
}
