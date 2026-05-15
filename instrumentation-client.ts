/**
 * Sentry browser SDK init. Picked up automatically by @sentry/nextjs.
 * No-op when NEXT_PUBLIC_SENTRY_DSN is unset, so local dev + preview builds
 * stay quiet.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    tracesSampleRate:
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? 0.1 : 1.0,
    // Replay only in prod; low rate so it doesn't blow through quota.
    replaysSessionSampleRate:
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? 0.01 : 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
    debug: false,
  });
}

// Required export so Next.js doesn't tree-shake the file.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
