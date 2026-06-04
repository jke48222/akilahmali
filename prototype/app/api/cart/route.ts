import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  addToCart,
  createCart,
  getCart,
  isShopifyConfigured,
  removeFromCart,
  updateCartLine,
  type Cart,
} from "@/lib/shopify";
import {
  CART_COOKIE_MAX_AGE,
  CART_COOKIE_NAME,
} from "@/lib/shopify/env";

/**
 * Cart API — server boundary for all cart mutations.
 *
 *  GET  /api/cart                 → current cart (or null)
 *  POST /api/cart  body:
 *    { action: "add",    merchandiseId: string, quantity?: number }
 *    { action: "update", lineId: string,        quantity: number }
 *    { action: "remove", lineId: string }
 *
 * The Shopify cart ID lives in an httpOnly cookie so it never leaks to
 * third-party JS and survives reloads without localStorage.
 */

async function readCartId(): Promise<string | null> {
  const c = await cookies();
  return c.get(CART_COOKIE_NAME)?.value ?? null;
}

async function writeCartId(cartId: string) {
  const c = await cookies();
  c.set(CART_COOKIE_NAME, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CART_COOKIE_MAX_AGE,
    path: "/",
  });
}

async function clearCartId() {
  const c = await cookies();
  c.delete(CART_COOKIE_NAME);
}

export async function GET() {
  if (!isShopifyConfigured) {
    return NextResponse.json({ ok: true, cart: null });
  }
  const cartId = await readCartId();
  if (!cartId) return NextResponse.json({ ok: true, cart: null });
  try {
    const cart = await getCart(cartId);
    if (!cart) {
      // Stale cookie — Shopify dropped the cart. Clear it.
      await clearCartId();
      return NextResponse.json({ ok: true, cart: null });
    }
    return NextResponse.json({ ok: true, cart });
  } catch (err) {
    console.error("[cart GET]", err);
    return NextResponse.json(
      { ok: false, error: "Could not load cart." },
      { status: 502 },
    );
  }
}

const AddSchema = z.object({
  action: z.literal("add"),
  merchandiseId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
});
const UpdateSchema = z.object({
  action: z.literal("update"),
  lineId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});
const RemoveSchema = z.object({
  action: z.literal("remove"),
  lineId: z.string().min(1),
});
const ActionSchema = z.union([AddSchema, UpdateSchema, RemoveSchema]);

export async function POST(request: Request) {
  if (!isShopifyConfigured) {
    return NextResponse.json(
      { ok: false, error: "Store is unconfigured." },
      { status: 503 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  const parsed = ActionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Bad request.", details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    let cart: Cart;
    let cartId = await readCartId();

    if (parsed.data.action === "add") {
      const lines = [
        {
          merchandiseId: parsed.data.merchandiseId,
          quantity: parsed.data.quantity,
        },
      ];
      if (cartId) {
        cart = await addToCart(cartId, lines);
      } else {
        cart = await createCart(lines);
        cartId = cart.id;
        await writeCartId(cartId);
      }
    } else if (parsed.data.action === "update") {
      if (!cartId) {
        return NextResponse.json(
          { ok: false, error: "No active cart." },
          { status: 404 },
        );
      }
      cart = await updateCartLine(
        cartId,
        parsed.data.lineId,
        parsed.data.quantity,
      );
    } else {
      // remove
      if (!cartId) {
        return NextResponse.json(
          { ok: false, error: "No active cart." },
          { status: 404 },
        );
      }
      cart = await removeFromCart(cartId, [parsed.data.lineId]);
    }

    return NextResponse.json({ ok: true, cart });
  } catch (err) {
    console.error("[cart POST]", err);
    const message =
      err instanceof Error ? err.message : "Cart operation failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
