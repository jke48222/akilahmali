/**
 * Newsletter signup → Akilah Mali's Laylo list.
 *
 * The subscribe footer POSTs an email here; we forward it to Laylo's
 * `subscribeToUser` mutation. The Laylo API key is a secret, so it lives only
 * here (server side) in `LAYLO_API_KEY` — generate one in Laylo →
 * Settings → Integrations and set it in your env (e.g. Vercel project vars).
 * https://docs.laylo.com/en/articles/6520155-apis-and-integrations
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const token = process.env.LAYLO_API_KEY;
  if (!token) {
    // Not wired up yet — surface a clear message instead of pretending success.
    return Response.json(
      { error: "Signups aren’t connected yet. Set LAYLO_API_KEY to enable them." },
      { status: 503 },
    );
  }

  try {
    const res = await fetch("https://laylo.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query:
          "mutation($email: String, $phoneNumber: String) { subscribeToUser(email: $email, phoneNumber: $phoneNumber) }",
        variables: { email },
      }),
    });

    const data = (await res.json().catch(() => null)) as { errors?: unknown } | null;

    if (!res.ok || (data && data.errors)) {
      return Response.json({ error: "Couldn’t subscribe right now. Try again later." }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Couldn’t reach the mailing list. Try again later." }, { status: 502 });
  }
}
