import type { MetadataRoute } from "next";

const SITE_URL = "https://malicantsing.com";

/**
 * Production allows all crawlers; preview and development disallow everything.
 * `VERCEL_ENV` is set automatically by Vercel: 'production' | 'preview' | 'development'.
 */
export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";

  if (!isProd) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      // No sitemap on non-prod — we don't want preview URLs in search.
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/cart and /api/subscribe are mutation endpoints — keep them out.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
