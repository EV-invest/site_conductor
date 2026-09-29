// Node-only, dynamically imported from instrumentation.ts: process.exit is a
// banned API in the Edge bundle at compile time, so it can't live in config.ts
// (statically imported by the edge-compiled instrumentation).
import { readFileSync } from "node:fs";
import { config } from "@/config";

// Touches every getter (recursing into `public`), so any required var missing
// in prod fails at server start — not mid-request weeks later. No-op during
// `next build`, whose env is deliberately partial.
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
    // `next dev` re-resolves rewrites from its own env: only a build can drift.
    if (config.isProduction) assertBakedZones();
  } catch (e) {
    // Next swallows instrumentation throws into per-request 500s; a server
    // missing config must die (→ CrashLoopBackOff → auto-rollback), not limp.
    console.error(e);
    process.exit(1);
  }
}

// The zone rewrites (next.config.ts) are resolved at `next build` into
// routes-manifest.json, while the HTML proxy handlers read the same URLs from
// the runtime env. Two copies of one topology: when they disagree, the page HTML
// arrives and its assets, API and auth do not. Compares the two copies of the
// configuration only — no peer is contacted.
function assertBakedZones(): void {
  const manifest = JSON.parse(readFileSync(".next/routes-manifest.json", "utf8")) as {
    rewrites: { beforeFiles: { destination: string }[] };
  };
  const origin = (url: string) => new URL(url).origin;
  const baked = new Set(
    manifest.rewrites.beforeFiles
      .map(r => r.destination)
      .filter(d => /^https?:\/\//.test(d))
      .map(origin)
  );
  const runtime = new Set(
    [config.cabinetZoneUrl, config.reaZoneUrl, config.authWebUrl]
      .filter((u): u is string => !!u)
      .map(origin)
  );
  const same = baked.size === runtime.size && [...baked].every(o => runtime.has(o));
  if (!same)
    throw new Error(
      `zone URLs baked at build (${[...baked].join(", ")}) differ from the runtime env (${[...runtime].join(", ")}): the image and its deployment disagree`
    );
}
