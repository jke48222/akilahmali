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
    return { allowed: true, remaining: Infinity, reset: 0, skipped: true };
  }
  const { success, remaining, reset } = await getLimiter().limit(identifier);
  if (success) return { allowed: true, remaining, reset };
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return { allowed: false, remaining, reset, retryAfter };
}

/** Best-effort client IP extraction from standard proxy headers. */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "unknown"
  );
}
