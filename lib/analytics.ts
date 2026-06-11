/**
 * Client-side signup helpers — UTM source resolution + conversion events.
 * Used by every email-capture form (home, booth, RSVP, notify).
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Resolve the signup source for segmentation: a `?source=` UTM-style query
 * param (e.g. links in TikTok/IG bios use ?source=tiktok / ?source=ig) wins
 * over the form's own identity. Sanitized to the /api/subscribe contract
 * (lowercase, [a-z0-9-], must start alphanumeric, ≤64 chars).
 */
export function resolveSignupSource(fallback: string): string {
  if (typeof window !== "undefined") {
    const param = new URLSearchParams(window.location.search).get("source");
    if (param) {
      const clean = param
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/^-+/, "")
        .slice(0, 64);
      if (clean) return clean;
    }
  }
  return fallback;
}

/**
 * Fire the conversion event into whatever tags are loaded — GTM's dataLayer
 * and the Meta Pixel `Lead` standard event. Both are safe no-ops when the
 * corresponding tag isn't configured.
 */
export function trackLead(source: string): void {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event: "email_signup", signup_source: source });
  window.fbq?.("track", "Lead", { content_name: source });
}
