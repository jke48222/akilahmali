/**
 * Next.js instrumentation entrypoint — runs once per runtime startup.
 * Loads the appropriate Sentry config based on which runtime we're in.
 * No-op when SENTRY_DSN is unset.
 */
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
