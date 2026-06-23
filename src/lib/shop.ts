/**
 * Shop feature flag.
 *
 * shop.akilahmali.com is not built (DNS doesn't even resolve), so every
 * "shop" nav/footer/cover link is hidden until a real storefront URL exists.
 *
 * TODO(akilah): set NEXT_PUBLIC_SHOP_URL in .env.local / Vercel once the
 * Bandcamp (or other) store page is live, e.g.
 *   NEXT_PUBLIC_SHOP_URL=https://akilahmali.bandcamp.com
 * Every shop link sitewide re-enables itself from this one value.
 */
export const SHOP_URL: string | null =
  process.env.NEXT_PUBLIC_SHOP_URL || null;
