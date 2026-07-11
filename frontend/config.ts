// The single point where this app reads its environment. Every other module
// imports from `config` instead of touching `process.env`, so the app's env
// surface is one typed object (and an ESLint rule bans process.env elsewhere).
//
// Access is lazy: `next build` evaluates next.config.ts (and imports its module
// graph) with the deploy env absent, so eager reads/throws would break the
// build. Each field is a getter that reads on first use, so a required var
// throws — naming itself — only when actually consumed.
//
// The client/server split is physical: NEXT_PUBLIC_* are the only vars Next
// inlines into browser bundles, so they live under `config.public` and are the
// only fields a Client Component may read. Everything else is server-only.
//
// NEXT_PUBLIC_* are read via STATIC member access on purpose: Next only inlines
// literal `process.env.NEXT_PUBLIC_X` references into the client bundle, so the
// getters below spell each name out rather than routing through a helper.

// `next build` evaluates with a deliberately partial env; only a running prod
// server must have these.
const isProdRuntime = () =>
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";

function prodRequired(name: string): string | undefined {
  const value = process.env[name];
  if (!value && isProdRuntime()) throw new Error(`missing required env var ${name}`);
  return value || undefined;
}

function optional(value: string | undefined): string | undefined {
  return value || undefined;
}

// Touches every getter (recursing into `public`), so any required var missing
// in prod fails at server start — not mid-request weeks later. Called from
// instrumentation.ts `register()`; no-op during `next build`, whose env is
// deliberately partial.
export function assertConfig(): void {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const touch = (obj: object): void => {
    for (const key of Object.keys(obj)) {
      const v = (obj as Record<string, unknown>)[key];
      if (v && typeof v === "object") touch(v);
    }
  };
  try {
    touch(config);
  } catch (e) {
    // Next swallows instrumentation throws into per-request 500s; a server
    // missing config must die (→ CrashLoopBackOff → auto-rollback), not limp.
    console.error(e);
    process.exit(1);
  }
}

export const config = {
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  },
  get isCi(): boolean {
    return !!process.env.CI;
  },
  get runtime(): string | undefined {
    return optional(process.env.NEXT_RUNTIME);
  },
  // Server-only override for Server Component fetches (internal/cluster origin).
  // Not NEXT_PUBLIC_, so never inlined into the browser bundle; the runtime
  // client falls back to the public API URL when unset — a dev-only state.
  get apiUrlInternal(): string | undefined {
    return prodRequired("API_URL_INTERNAL");
  },
  // Zone origins (multi-zone mounts; see PATTERNS.md §9). Unset ⇒ no rewrites
  // and the HTML proxy 404s instead of half-proxying — tolerable only in dev,
  // so prod asserts presence at boot.
  get cabinetZoneUrl(): string | undefined {
    return prodRequired("CABINET_ZONE_URL");
  },
  get reaZoneUrl(): string | undefined {
    return prodRequired("REA_ZONE_URL");
  },
  // The concierge plane's auth web surface. Auth is shell-owned: /api/auth/* and
  // /api/callback/auth/* on THIS origin rewrite there, so session cookies land
  // first-party for every zone. Unset ⇒ no rewrites ⇒ auth disabled (dev-only).
  get authWebUrl(): string | undefined {
    return prodRequired("AUTH_WEB_URL");
  },
  // Server/edge Sentry environment tag (instrumentation.ts).
  get appEnv(): string | undefined {
    return optional(process.env.APP_ENV);
  },
  get sentryDsn(): string | undefined {
    return optional(process.env.SENTRY_DSN);
  },
  get sentryOrg(): string | undefined {
    return optional(process.env.SENTRY_ORG);
  },
  get sentryProject(): string | undefined {
    return optional(process.env.SENTRY_PROJECT);
  },
  get sentryAuthToken(): string | undefined {
    return optional(process.env.SENTRY_AUTH_TOKEN);
  },
  // Browser-visible env (NEXT_PUBLIC_*): the only fields Client Components may
  // read, inlined at build time.
  public: {
    // Public API origin. Topology owned by flake.nix, which always exports it
    // (dev run and container build alike) — a missing value is a broken launch.
    // Static member access is load-bearing here (see header): routed through a
    // `process.env[name]` helper, the browser bundle keeps the dynamic lookup,
    // finds an empty env shim, and throws on hydration.
    get apiUrl(): string {
      if (!process.env.NEXT_PUBLIC_API_URL)
        throw new Error("missing required env var NEXT_PUBLIC_API_URL");
      return process.env.NEXT_PUBLIC_API_URL;
    },
    // Canonical production origin. The dev launch omits it (metadataBase
    // tolerates a relative base); the prod server refuses to boot without it.
    get siteUrl(): string | undefined {
      if (!process.env.NEXT_PUBLIC_SITE_URL && isProdRuntime())
        throw new Error("missing required env var NEXT_PUBLIC_SITE_URL");
      return optional(process.env.NEXT_PUBLIC_SITE_URL);
    },
    // REA backend origin advertised to the MFE bundle. Same prod contract.
    get reaUrl(): string | undefined {
      if (!process.env.NEXT_PUBLIC_REA_URL && isProdRuntime())
        throw new Error("missing required env var NEXT_PUBLIC_REA_URL");
      return optional(process.env.NEXT_PUBLIC_REA_URL);
    },
    get buildVersion(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_BUILD_VERSION);
    },
    get buildCommit(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_BUILD_COMMIT);
    },
    get analyticsEndpoint(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT);
    },
    get analyticsWebsiteId(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID);
    },
  },
} as const;
