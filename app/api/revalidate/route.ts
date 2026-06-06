import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

/**
 * Sanity webhook → on-demand ISR.
 *
 *   POST /api/revalidate
 *   Header: sanity-webhook-signature: <hmac>
 *   Body:   { _type: "release", slug: "strange" }   // etc.
 *
 * Configure in Sanity: Project → API → Webhooks. Set HTTP method POST, URL to
 * https://akilahmali.com/api/revalidate, set the secret to SANITY_REVALIDATE_SECRET,
 * and the projection so the body contains exactly: { _type, slug } (or whatever
 * each document type needs).
 */
const SECRET = process.env.SANITY_REVALIDATE_SECRET ?? "";

type SanityWebhookBody = {
  _type?: string;
  slug?: string | { current?: string };
};

function slugOf(body: SanityWebhookBody): string | null {
  if (!body.slug) return null;
  if (typeof body.slug === "string") return body.slug;
  return body.slug.current ?? null;
}

/** Map a Sanity document type to the paths that depend on it. */
function pathsFor(body: SanityWebhookBody): string[] {
  const slug = slugOf(body);
  switch (body._type) {
    case "release":
      return ["/", "/music", ...(slug ? [`/music/${slug}`] : [])];
    case "track":
      // Tracks are referenced by releases; without a back-ref, revalidate all.
      return ["/music"];
    case "video":
      return ["/videos"];
    case "show":
      return ["/shows"];
    case "press":
      return ["/press"];
    case "page":
      return slug ? [`/${slug}`] : [];
    case "settings":
      // Settings touch about/contact/press/footer; cheaper to refresh the lot.
      return ["/", "/about", "/contact", "/press"];
    // `lookbook` previously drove the in-app /shop, which now lives on the hosted
    // Shopify storefront (separate origin) — nothing on this site to revalidate.
    default:
      return [];
  }
}

export async function POST(request: Request) {
  if (!SECRET) {
    return NextResponse.json(
      { ok: false, error: "Revalidate secret is unconfigured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const rawBody = await request.text();

  if (!signature || !(await isValidSignature(rawBody, signature, SECRET))) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 401 },
    );
  }

  let body: SanityWebhookBody;
  try {
    body = JSON.parse(rawBody) as SanityWebhookBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const paths = pathsFor(body);
  for (const path of paths) {
    revalidatePath(path);
  }

  console.log("[revalidate]", { type: body._type, paths });
  return NextResponse.json({ ok: true, revalidated: paths });
}
