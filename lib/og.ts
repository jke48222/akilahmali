/**
 * Social link-preview (Open Graph / Twitter) policy.
 *
 * While `FORCE_PORTRAIT_OG` is true, EVERY page's share card is Akilah's
 * portrait — served by the `/opengraph-image` route (see app/opengraph-image.tsx
 * and public/og-portrait.jpg). This overrides the per-page art that song-release
 * pages (cover artwork) and shop product pages (product photos) would otherwise
 * use.
 *
 * To restore per-page art later, flip this single flag to `false`. Nothing else
 * needs to change — the dynamic pages already fall back to their own images.
 */
export const FORCE_PORTRAIT_OG = true;

/** The portrait share-card URL (the /opengraph-image route renders the portrait). */
export const OG_PORTRAIT = "/opengraph-image";

/**
 * Build a per-song / per-station share-card URL (the `/song-og` route renders a
 * crimson cinematic card from these params). Ready for when `FORCE_PORTRAIT_OG`
 * flips to `false`: a per-song metadata branch can point its OG image here.
 */
export function songOgUrl(opts: {
  title: string;
  subtitle?: string;
  accent?: string;
  accent2?: string;
}): string {
  const p = new URLSearchParams({ title: opts.title });
  if (opts.subtitle) p.set("subtitle", opts.subtitle);
  if (opts.accent) p.set("accent", opts.accent);
  if (opts.accent2) p.set("accent2", opts.accent2);
  return `/song-og?${p.toString()}`;
}
