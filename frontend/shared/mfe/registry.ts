// Server-side reader for the microfrontend registry (uses node:fs — server-only).
//
// The registry maps logical names to {tag, scriptUrl, kind}. Independent deploys
// land by editing this file (or, in production, a per-env config) — never by
// rebuilding landing. Served openly to the browser via /api/mfe-registry, so its
// scriptUrls are operator-controlled and public — treat registry edits as code.

import { promises as fs } from "node:fs";
import path from "node:path";

import type { MfeEntry } from "./types";

// Per-env REA origin, substituted into `${REA_URL}` scriptUrls so the registry
// file stays env-agnostic (no rebuild to repoint). Defaults to the dev `dx serve`
// port.
const REA_URL = process.env.NEXT_PUBLIC_REA_URL ?? "http://localhost:59079";

export async function loadRegistry(): Promise<MfeEntry[]> {
  const file = path.join(process.cwd(), "mfe-registry.json");
  const raw = await fs.readFile(file, "utf8");
  const registry = JSON.parse(raw) as MfeEntry[];
  return registry.map((entry) => ({
    ...entry,
    scriptUrl: entry.scriptUrl.replaceAll("${REA_URL}", REA_URL),
  }));
}

export async function findMfe(name: string): Promise<MfeEntry | undefined> {
  const registry = await loadRegistry();
  return registry.find((entry) => entry.name === name);
}
