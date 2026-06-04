/**
 * Sanity project env. Fill these in via .env.local:
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
 *   NEXT_PUBLIC_SANITY_DATASET=production
 *   NEXT_PUBLIC_SANITY_API_VERSION=2025-05-14
 *   SANITY_API_READ_TOKEN=...   # server-only; only needed for drafts/preview
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Flips to true once both env vars are set. The site is designed to render
 * with static fallbacks until then; the /studio route will not function
 * (intentionally) until projectId is populated.
 */
export const isSanityConfigured = projectId.length > 0;

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-05-14";

/** Server-only; read tokens MUST NOT be exposed to the client. */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";

/** Studio is embedded at this route. */
export const studioBasePath = "/studio";
