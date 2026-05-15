import { cookies } from "next/headers";
import type { Metadata } from "next";
import { CART_COOKIE_NAME } from "@/lib/shopify/env";
import { getCart, isShopifyConfigured, type Cart } from "@/lib/shopify";
import { CartProvider } from "@/components/store/cart-context";
import { CartDrawer } from "@/components/store/CartDrawer";
import { StoreNav } from "@/components/store/StoreNav";
import { StoreFooter } from "@/components/store/StoreFooter";

export const metadata: Metadata = {
  title: {
    default: "Shop — MALI",
    template: "%s — MALI / shop",
  },
  description: "Small-batch merch from MALI. When it's gone it's gone.",
};

/**
 * Store shell — swaps in StoreNav + StoreFooter (replacing the main-site shell)
 * and mounts the CartProvider + CartDrawer for any /shop/* page.
 *
 * Cart hydration: read the cart cookie server-side, load the cart from Shopify
 * once on first render, and pass it to the client provider as initialCart. All
 * subsequent mutations go through /api/cart which keeps cookie + cart in sync.
 */
async function loadInitialCart(): Promise<Cart | null> {
  if (!isShopifyConfigured) return null;
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) return null;
  try {
    return await getCart(cartId);
  } catch (err) {
    console.error("[store layout] cart hydration failed", err);
    return null;
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialCart = await loadInitialCart();
  return (
    <CartProvider initialCart={initialCart}>
      <div className="bg-page flex flex-col flex-1 min-h-screen">
        <StoreNav />
        <main id="main" className="flex-1 w-full">
          {children}
        </main>
        <StoreFooter />
      </div>
      <CartDrawer />
    </CartProvider>
  );
}
