import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const ContactBody = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email().max(254),
  message: z.string().trim().min(1).max(5000),
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

  if (process.env.SENDGRID_API_KEY) {
    try {
      await fetch("https://api.sendgrid.com/v3/mail/send", {
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
    } catch {
      /* best-effort */
    }
  }

  console.log(`[contact] from=${email} name=${name} message=${message.slice(0, 80)}`);

  return NextResponse.json({ ok: true });
}
