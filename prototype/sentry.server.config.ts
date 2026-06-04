import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  // Trace 10% of requests in prod, 100% in preview/dev (sample rate is per-event).
  tracesSampleRate: process.env.VERCEL_ENV === "production" ? 0.1 : 1.0,
  // Server runtime never needs replay/profiling integrations.
  enabled: Boolean(process.env.SENTRY_DSN),
  // Don't ship Sentry's verbose debug logs in production.
  debug: false,
});
