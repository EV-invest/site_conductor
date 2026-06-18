/**
 * Next.js instrumentation hook — runs once per server process on startup.
 *
 * Initialises `@sentry/nextjs` for the active runtime so it pairs with the
 * build-time `withSentryConfig` integration in `next.config.ts`:
 * - `nodejs` → server init (API routes, RSC, SSR), traces 0.1 prod / 1.0 else
 * - `edge`   → edge init (`proxy.ts`), tracing disabled
 *
 * The vendor-neutral pieces (the `ErrorSink`, `ErrorBoundary`, and browser
 * provider) come from `@evinvest/error-monitoring`; only this Next-specific
 * server/edge bootstrap stays on `@sentry/nextjs` directly. The lib's
 * `register` initialises via `@sentry/node`, which would drop the Next.js
 * source-map frame rewriting (readable server stack traces) and Next-aware
 * request tracing that `withSentryConfig` wires up — the same
 * Next/Sentry-integration-seam exception already applied to `next.config.ts`.
 * The sample-rate default is still the lib's `defaultTracesSampleRate`.
 *
 * `onRequestError` wires Sentry into Next.js's built-in server-error hook so
 * unhandled Server Component / Route Handler errors are captured automatically.
 */
import * as Sentry from "@sentry/nextjs";
import { defaultTracesSampleRate } from "@evinvest/error-monitoring";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.APP_ENV ?? "development",
      tracesSampleRate: defaultTracesSampleRate(process.env.NODE_ENV),
    });
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.APP_ENV ?? "development",
      tracesSampleRate: 0,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
