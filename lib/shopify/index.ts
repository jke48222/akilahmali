import "server-only";

import { getStorefrontClient, isShopifyConfigured } from "./client";
import {
  ALL_PRODUCTS_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_BY_QUERY,
} from "./queries";
import type {
  Cart,
  ProductCard,
  ProductDetail,
  StorefrontUserError,
} from "./types";

export { isShopifyConfigured };
export type { Cart, CartLine, Money, ProductCard, ProductDetail, Variant } from "./types";

/* =========================================================================
   Generic fetch helper with shaped error handling.
   ========================================================================= */
class StorefrontError extends Error {
  constructor(
    message: string,
    readonly userErrors: StorefrontUserError[] = [],
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "StorefrontError";
  }
}

async function storefrontRequest<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  if (!isShopifyConfigured) {
    throw new StorefrontError("Shopify unconfigured.");
  }
  const client = getStorefrontClient();
  const { data, errors } = await client.request<TData>(query, {
    variables,
  });
  if (errors) {
    throw new StorefrontError(
      errors.message ?? "Storefront request failed.",
      [],
      errors,
    );
  }
  if (!data) {
    throw new StorefrontError("Storefront request returned no data.");
  }
  return data;
}

function assertNoUserErrors(
  errors: StorefrontUserError[] | undefined,
  fallback: string,
) {
  if (errors && errors.length > 0) {
    throw new StorefrontError(errors[0].message || fallback, errors);
  }
}

/* =========================================================================
   Products
   ========================================================================= */
export async function getAllProducts(
  first = 24,
): Promise<ProductCard[]> {
  const data = await storefrontRequest<{
    products: { nodes: ProductCard[] };
  }>(ALL_PRODUCTS_QUERY, { first });
  return data.products.nodes;
}

export async function getProductByHandle(
  handle: string,
): Promise<ProductDetail | null> {
  const data = await storefrontRequest<{
    product: ProductDetail | null;
  }>(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data.product;
}

/** Storefront API tag filter syntax: `tag:'featured'`. */
export async function getProductsByTag(
  tag: string,
  first = 12,
): Promise<ProductCard[]> {
  const data = await storefrontRequest<{
    products: { nodes: ProductCard[] };
  }>(PRODUCTS_BY_QUERY, { first, query: `tag:'${tag.replace(/'/g, "")}'` });
  return data.products.nodes;
}

/** First product tagged `featured`, falls back to the newest product. */
export async function getFeaturedProduct(): Promise<ProductCard | null> {
  const featured = await getProductsByTag("featured", 1);
  if (featured.length > 0) return featured[0];
  const fallback = await getAllProducts(1);
  return fallback[0] ?? null;
}

/**
 * "Pairs with" candidates. Tries other products sharing the current product's
 * first tag (typically a category like `tee` / `vinyl`), excluding itself.
 * Falls back to the newest products if no tag overlap.
 */
export async function getRelatedProducts(
  product: Pick<ProductCard, "handle" | "tags">,
  limit = 3,
): Promise<ProductCard[]> {
  const primaryTag = product.tags?.find((t) => t !== "featured");
  let pool: ProductCard[] = [];
  if (primaryTag) {
    pool = await getProductsByTag(primaryTag, limit + 1);
  }
  if (pool.length < limit) {
    const newest = await getAllProducts(limit + 4);
    pool = [...pool, ...newest];
  }
  // Dedupe + drop the current product.
  const seen = new Set<string>([product.handle]);
  const out: ProductCard[] = [];
  for (const p of pool) {
    if (seen.has(p.handle)) continue;
    seen.add(p.handle);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

/* =========================================================================
   Cart
   ========================================================================= */
export type CartLineInput = { merchandiseId: string; quantity: number };

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefrontRequest<{ cart: Cart | null }>(
    CART_QUERY,
    { id: cartId },
  );
  return data.cart;
}

export async function createCart(
  lines: CartLineInput[] = [],
): Promise<Cart> {
  const data = await storefrontRequest<{
    cartCreate: { cart: Cart | null; userErrors: StorefrontUserError[] };
  }>(CART_CREATE_MUTATION, { lines });
  assertNoUserErrors(data.cartCreate.userErrors, "Could not create cart.");
  if (!data.cartCreate.cart) {
    throw new StorefrontError("cartCreate returned no cart.");
  }
  return data.cartCreate.cart;
}

export async function addToCart(
  cartId: string,
  lines: CartLineInput[],
): Promise<Cart> {
  const data = await storefrontRequest<{
    cartLinesAdd: { cart: Cart | null; userErrors: StorefrontUserError[] };
  }>(CART_LINES_ADD_MUTATION, { cartId, lines });
  assertNoUserErrors(data.cartLinesAdd.userErrors, "Could not add to cart.");
  if (!data.cartLinesAdd.cart) {
    throw new StorefrontError("cartLinesAdd returned no cart.");
  }
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const data = await storefrontRequest<{
    cartLinesUpdate: { cart: Cart | null; userErrors: StorefrontUserError[] };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  assertNoUserErrors(
    data.cartLinesUpdate.userErrors,
    "Could not update line.",
  );
  if (!data.cartLinesUpdate.cart) {
    throw new StorefrontError("cartLinesUpdate returned no cart.");
  }
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[],
): Promise<Cart> {
  const data = await storefrontRequest<{
    cartLinesRemove: { cart: Cart | null; userErrors: StorefrontUserError[] };
  }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
  assertNoUserErrors(
    data.cartLinesRemove.userErrors,
    "Could not remove line.",
  );
  if (!data.cartLinesRemove.cart) {
    throw new StorefrontError("cartLinesRemove returned no cart.");
  }
  return data.cartLinesRemove.cart;
}

export { StorefrontError };
