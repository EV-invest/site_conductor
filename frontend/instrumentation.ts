// Server/edge Sentry bootstrap. Stays on @sentry/nextjs directly (not the
// vendor-neutral lib) so withSentryConfig's source-map frame rewriting and
// Next-aware request tracing survive.
import * as Sentry from "@sentry/nextjs";
import { defaultTracesSampleRate } from "@evinvest/error-monitoring";
import { assertConfig, config } from "@/config";

export function register() {
  if (config.runtime === "nodejs") {
    // Fail the boot, not the request: any required var missing in prod throws
    // here, before the server accepts traffic. (Node only — the edge sandbox
    // can't read dynamically-named env vars, so it would false-throw there.)
    assertConfig();
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.appEnv ?? "development",
      tracesSampleRate: defaultTracesSampleRate(config.isProduction ? "production" : undefined),
    });
  }
  if (config.runtime === "edge") {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.appEnv ?? "development",
      tracesSampleRate: 0,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
