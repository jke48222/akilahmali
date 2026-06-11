import type { SubscribeResult } from "./klaviyo";

/**
 * MailerLite subscriber API (free tier ≈ 1,000 subscribers).
 *
 * Plain fetch against the Connect API — no SDK dependency. POST /subscribers
 * is an idempotent upsert: 201 = created, 200 = existing profile updated.
 *
 * Setup (TODO(akilah)):
 *   1. mailerlite.com → Integrations → API → generate a token
 *   2. .env.local / Vercel: MAILERLITE_API_KEY=<token>
 *   3. (optional) MAILERLITE_GROUP_ID=<numeric group id> to file signups
 *      into a group — the id is in the URL when viewing the group.
 *
 * The signup source (?source= UTM or the form's own id) is stored as the
 * `source` subscriber field so segments can split tiktok / ig / booth / home.
 */
const API_URL = "https://connect.mailerlite.com/api/subscribers";

const apiKey = process.env.MAILERLITE_API_KEY ?? "";
const groupId = process.env.MAILERLITE_GROUP_ID ?? "";

export const isMailerLiteConfigured = apiKey.length > 0;

export async function subscribeToMailerLite(
  email: string,
  source: string,
  props?: Record<string, string>,
): Promise<SubscribeResult> {
  if (!isMailerLiteConfigured) {
    return { status: "skipped", reason: "unconfigured" };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        fields: { source, ...props },
        ...(groupId ? { groups: [groupId] } : {}),
      }),
      // Don't let a slow ESP hold the form hostage.
      signal: AbortSignal.timeout(8_000),
    });

    if (res.status === 201) return { status: "ok" };
    if (res.ok) return { status: "already-subscribed" };

    const body = await res.text().catch(() => "");
    return {
      status: "error",
      message: `MailerLite ${res.status}: ${body.slice(0, 300)}`,
      code: res.status,
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "MailerLite request failed",
    };
  }
}
