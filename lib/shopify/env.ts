/**
 * Shopify Storefront API env.
 *
 * `SHOPIFY_STORE_DOMAIN` — e.g. `mali-shop.myshopify.com` (NOT the public domain).
 * `SHOPIFY_STOREFRONT_API_TOKEN` — public Storefront API token from Shopify admin.
 *   This is a public token by design; safe to use from server components.
 *   We still keep it server-side here to control where it gets sent.
 * `SHOPIFY_STOREFRONT_API_VERSION` — pin to a known release, e.g. `2026-01`.
 */
export const storeDomain = process.env.SHOPIFY_STORE_DOMAIN ?? "";
export const storefrontToken = process.env.SHOPIFY_STOREFRONT_API_TOKEN ?? "";
export const apiVersion =
  process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2026-01";

export const isShopifyConfigured =
  storeDomain.length > 0 && storefrontToken.length > 0;

/** Cookie name used to persist the Shopify cart ID across visits. */
export const CART_COOKIE_NAME = "mali_cart_id";
/** 30 days. Cart IDs are long-lived in Shopify. */
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
