import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { honeypotFields, isBotSubmission } from "@/lib/honeypot";

const ContactBody = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(1).max(5000),
  ...honeypotFields,
});

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const verdict = await checkRateLimit(ip);
  if (!verdict.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(verdict.retryAfter) } },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = ContactBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 422 },
    );
  }

  // Silent bot drop — fake success so scripts get no signal to tune against.
  if (isBotSubmission(parsed.data)) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, message } = parsed.data;

  const to = process.env.CONTACT_EMAIL ?? "realmalimusic@gmail.com";
  const replyTo = `${name} <${email}>`;

  if (process.env.KLAVIYO_PRIVATE_API_KEY) {
    try {
      const { subscribeToList } = await import("@/lib/klaviyo");
      await subscribeToList(email, "contact");
    } catch {
      /* best-effort */
    }
  }

  // Durable delivery of the actual message. If this doesn't succeed the message
  // is lost (a missed booking/fan email is a real business cost), so we fail the
  // request rather than show a false "sent" — never silently swallow.
  let delivered = false;
  if (process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: "noreply@akilahmali.com", name: "Mali Contact Form" },
          reply_to: { email, name },
          subject: `Contact from ${name}`,
          content: [
            {
              type: "text/plain",
              value: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            },
          ],
        }),
      });
      delivered = res.ok;
      if (!res.ok) {
        console.error("[contact] sendgrid rejected", res.status);
      }
    } catch (err) {
      console.error("[contact] sendgrid threw", err instanceof Error ? err.message : err);
    }
  } else {
    console.error("[contact] SENDGRID_API_KEY unset — cannot deliver contact messages");
  }

  if (!delivered) {
    return NextResponse.json(
      {
        ok: false,
        error: "Couldn't send right now — please try again in a moment.",
      },
      { status: 502 },
    );
  }

  // No PII in logs — the message is delivered via email; logs keep only a
  // non-identifying breadcrumb.
  console.log("[contact] delivered");

  return NextResponse.json({ ok: true });
}
