// Server/edge Sentry bootstrap. Stays on @sentry/nextjs directly (not the
// vendor-neutral lib) so withSentryConfig's source-map frame rewriting and
// Next-aware request tracing survive.
import * as Sentry from "@sentry/nextjs";
import { defaultTracesSampleRate } from "@evinvest/error-monitoring";
import { config } from "@/config";

export function register() {
  if (config.runtime === "nodejs") {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.appEnv ?? "development",
      tracesSampleRate: defaultTracesSampleRate(config.isProduction ? "production" : undefined),
    });
    // Dev-only: the flake exports every proxy upstream whether or not that
    // plane is running, and a dead one surfaces only as Next's raw
    // "Failed to proxy …:PORT ECONNREFUSED" — decode port → plane at boot.
    if (config.isDevelopment) {
      const upstreams: [string, string, string | undefined][] = [
        ["AUTH_WEB_URL", "concierge auth web", config.authWebUrl],
        ["CABINET_ZONE_URL", "cabinet zone", config.cabinetZoneUrl],
        ["REA_ZONE_URL", "rea zone", config.reaZoneUrl],
      ];
      for (const [name, plane, url] of upstreams) {
        if (!url) continue;
        void fetch(url, { signal: AbortSignal.timeout(2000) }).catch(() =>
          console.error(
            `\x1b[31m${name}=${url} (${plane}) is unreachable — proxied requests to it will ECONNREFUSED on that port. Is that plane running?\x1b[0m`
          )
        );
      }
    }
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
