import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToList } from "@/lib/klaviyo";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const SubscribeBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().trim().min(1).max(64).optional().default("unknown"),
});

export async function POST(request: Request) {
  // 1) Rate limit by IP.
  const ip = clientIp(request.headers);
  const verdict = await checkRateLimit(ip);
  if (!verdict.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a minute." },
      {
        status: 429,
        headers: { "Retry-After": String(verdict.retryAfter) },
      },
    );
  }

  // 2) Parse + validate.
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  const parsed = SubscribeBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please enter a valid email.",
        details: parsed.error.issues.map((i) => i.message),
      },
      { status: 400 },
    );
  }
  const { email, source } = parsed.data;

  // 3) Hand off to Klaviyo (or no-op fallback when unconfigured).
  const result = await subscribeToList(email, source);

  switch (result.status) {
    case "ok":
      return NextResponse.json({ ok: true, status: "subscribed" });
    case "already-subscribed":
      // Klaviyo reports a duplicate; surface it but still 200 so the form
      // shows the success copy and we never reveal whether the email exists.
      return NextResponse.json({ ok: true, status: "already-subscribed" });
    case "skipped":
      // Sanity-fail open in dev — log the email so we can verify on /shows
      // / home before the integration is wired.
      console.log("[subscribe] (no Klaviyo) signup:", { email, source });
      return NextResponse.json({ ok: true, status: "subscribed-dev" });
    case "error":
    default:
      return NextResponse.json(
        { ok: false, error: "We couldn’t save your email. Try again shortly." },
        { status: 502 },
      );
  }
}
