import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV !== "production";

/* =========================================================================
   Content-Security-Policy — restrictive, allowlists only the third-parties
   we actually call from the browser. Klaviyo + Shopify Storefront are
   server-side only (the browser never connects to them directly).
   ========================================================================= */
const csp = [
  `default-src 'self'`,
  // 'unsafe-inline' is required for JSON-LD scripts + Next.js bootstrap.
  // 'unsafe-eval' is needed in dev for HMR + Sanity Studio's runtime evaluator.
  // In prod we keep 'unsafe-eval' for the embedded /studio route; if you drop
  // the studio embed, this can be tightened to nonce-based.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://va.vercel-scripts.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  // Images: own origin + base64 SVG noise + LQIP blurs + Sanity / YouTube / Shopify CDNs.
  `img-src 'self' data: blob: https://cdn.sanity.io https://i.ytimg.com https://cdn.shopify.com https://*.myshopify.com`,
  // Fetch: own /api/*, Sanity API (studio), Plausible analytics, Vercel Analytics, Sentry ingest.
  `connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io https://plausible.io https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io`,
  // Iframes: only the YouTube nocookie embed (LiteYouTube swap-in).
  `frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com`,
  // Where forms can submit (we POST internally; Shopify checkout is a top-level redirect, not a form).
  `form-action 'self'`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  isDev ? null : `upgrade-insecure-requests`,
]
  .filter(Boolean)
  .join("; ");

const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=(self)",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "sync-xhr=()",
      "usb=()",
      "xr-spatial-tracking=()",
      "interest-cohort=()",
    ].join(", "),
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.myshopify.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

const finalConfig = withBundleAnalyzer(nextConfig);

/* =========================================================================
   Sentry — disabled at build time unless SENTRY_DSN is set. Source maps
   upload requires SENTRY_AUTH_TOKEN (org-scoped) at build time.
   ========================================================================= */
export default withSentryConfig(finalConfig, {
  org: process.env.SENTRY_ORG ?? "",
  project: process.env.SENTRY_PROJECT ?? "",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Delete client-side source maps from the build output after they're
  // uploaded to Sentry — keeps them out of the public asset tree.
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  // Tunnel browser SDK requests through our origin (CSP-friendlier; the
  // route is auto-registered at /monitoring).
  tunnelRoute: "/monitoring",
});
