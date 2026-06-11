import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToList } from "@/lib/klaviyo";
import { isMailerLiteConfigured, subscribeToMailerLite } from "@/lib/mailerlite";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { honeypotFields, isBotSubmission } from "@/lib/honeypot";

// Optional context properties forwarded to Klaviyo as profile properties for
// segmentation (e.g. a show RSVP sends rsvp_show_id / rsvp_show_city). Tightly
// bounded so a form can't stuff arbitrary data onto a profile: snake_case keys,
// short string values, at most 8 pairs.
const SubscribeMeta = z
  .record(
    z.string().regex(/^[a-z][a-z0-9_]{0,39}$/),
    z.string().trim().min(1).max(120),
  )
  .refine((o) => Object.keys(o).length <= 8, {
    message: "Too many properties.",
  });

const SubscribeBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Invalid source.")
    .optional()
    .default("unknown"),
  meta: SubscribeMeta.optional(),
  ...honeypotFields,
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
  // Silent bot drop — fake success so scripts get no signal to tune against.
  if (isBotSubmission(parsed.data)) {
    return NextResponse.json({ ok: true, status: "subscribed" });
  }

  const { email, source, meta } = parsed.data;

  // 3) Hand off to the ESP — MailerLite when configured (the active list),
  //    else Klaviyo (legacy), else the no-op dev fallback inside either lib.
  const result = isMailerLiteConfigured
    ? await subscribeToMailerLite(email, source, meta)
    : await subscribeToList(email, source, meta);

  switch (result.status) {
    case "ok":
      return NextResponse.json({ ok: true, status: "subscribed" });
    case "already-subscribed":
      // Klaviyo reports a duplicate; surface it but still 200 so the form
      // shows the success copy and we never reveal whether the email exists.
      return NextResponse.json({ ok: true, status: "already-subscribed" });
    case "skipped":
      // No ESP configured (dev / partial deploy). Don't log the email (PII);
      // record only a non-identifying breadcrumb with the form source.
      console.log("[subscribe] (no ESP) signup from source:", source);
      return NextResponse.json({ ok: true, status: "subscribed-dev" });
    case "error":
    default:
      return NextResponse.json(
        { ok: false, error: "We couldn’t save your email. Try again shortly." },
        { status: 502 },
      );
  }
}
