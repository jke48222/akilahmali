import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Accept either the native Upstash names or the KV_* names that Vercel's
// Upstash/KV integration auto-injects. Use the read-write token (NOT the
// read-only one) — the sliding-window limiter writes counters.
const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

export const isRateLimitConfigured = url.length > 0 && token.length > 0;

let _limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit {
  if (!_limiter) {
    _limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      // 5 signups per IP per minute, sliding window.
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: false,
      prefix: "mali:subscribe",
    });
  }
  return _limiter;
}

export type RateLimitVerdict =
  | { allowed: true; remaining: number; reset: number; skipped?: boolean }
  | { allowed: false; remaining: number; reset: number; retryAfter: number };

/**
 * Check rate limit for an identifier (use the request IP). When Upstash env
 * vars are unset, returns `allowed: true` with `skipped: true` — for local dev
 * and so a partial deploy doesn't break signups.
 */
export async function checkRateLimit(
  identifier: string,
): Promise<RateLimitVerdict> {
  if (!isRateLimitConfigured) {
    // Deliberate fail-open so a partial deploy / local dev never blocks signups.
    // But in production an unconfigured limiter means abuse protection is OFF —
    // surface that loudly so it's caught by log monitoring rather than silently.
    if (process.env.VERCEL_ENV === "production") {
      console.error(
        "[rate-limit] UNCONFIGURED IN PRODUCTION — abuse protection is disabled. " +
          "Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (or KV_*).",
      );
    }
    return { allowed: true, remaining: Infinity, reset: 0, skipped: true };
  }
  const { success, remaining, reset } = await getLimiter().limit(identifier);
  if (success) return { allowed: true, remaining, reset };
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { allowed: false, remaining, reset, retryAfter };
}

/**
 * Client IP extraction for rate-limit keying.
 *
 * SECURITY: the LEFTMOST `x-forwarded-for` entry is client-controllable — a
 * caller can prepend a forged value and rotate it to defeat per-IP limits. On
 * Vercel, `x-real-ip` is set by the platform edge to the true connecting IP and
 * cannot be spoofed, so prefer it. As a fallback we take the RIGHTMOST xff hop
 * (the one added by the closest trusted proxy), never the leftmost.
 */
export function clientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return "unknown";
}
