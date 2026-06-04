"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Cart } from "@/lib/shopify";

/* =========================================================================
   Public shape · what consumers see via useCart()
   ========================================================================= */
export type CartContextValue = {
  cart: Cart | null;
  /** True while the drawer is open. */
  isOpen: boolean;
  /** True while a mutation is in flight. */
  isPending: boolean;
  /** Last error message from a failed mutation (null until cleared). */
  error: string | null;

  open: () => void;
  close: () => void;
  toggle: () => void;

  /** Adds a variant. Opens the drawer on success. */
  addLine: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>.");
  }
  return ctx;
}

/* =========================================================================
   Provider
   The server (store) layout reads the Shopify cart from the cookie-backed
   /api/cart endpoint and passes the resolved cart as `initialCart`. After
   hydration, all mutations go back through /api/cart so the cookie + cart
   stay consistent.
   ========================================================================= */
type CartProviderProps = {
  initialCart: Cart | null;
  children: ReactNode;
};

export function CartProvider({ initialCart, children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esc-to-close behavior for the drawer.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Scroll-lock while the drawer is open. Mirrors the artifact's `.drawer-open`
  // body class hook so any global CSS can react.
  useEffect(() => {
    document.body.classList.toggle("drawer-open", isOpen);
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("drawer-open");
    };
  }, [isOpen]);

  const mutate = useCallback(
    async (body: Record<string, unknown>, opensDrawer: boolean) => {
      setIsPending(true);
      setError(null);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : `Cart request failed (${res.status})`,
          );
        }
        setCart(data.cart ?? null);
        if (opensDrawer) setIsOpen(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Cart operation failed.";
        setError(message);
        // Don't throw · components can react via `error` state.
        console.error("[cart mutate]", message);
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isOpen,
      isPending,
      error,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((o) => !o),
      addLine: (merchandiseId, quantity = 1) =>
        mutate(
          { action: "add", merchandiseId, quantity },
          /* opensDrawer */ true,
        ),
      updateLine: (lineId, quantity) =>
        mutate({ action: "update", lineId, quantity }, false),
      removeLine: (lineId) =>
        mutate({ action: "remove", lineId }, false),
    }),
    [cart, isOpen, isPending, error, mutate],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* =========================================================================
   Selectors · small read-only hooks for components that don't need actions.
   ========================================================================= */
export function useCartCount(): number {
  return useCart().cart?.totalQuantity ?? 0;
}

export function useCartLines() {
  return useCart().cart?.lines.nodes ?? [];
}
