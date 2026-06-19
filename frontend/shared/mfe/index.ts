/**
 * @module shared/mfe
 *
 * Microfrontend composition — the host primitives for mounting microfrontends
 * from other EV services at runtime. A microfrontend is a self-registering ESM
 * bundle that defines a custom element (`customElements.define("mfe-…", …)`); the
 * boundary is identical for JS (React, …) and Rust/WASM (Dioxus, Leptos) remotes,
 * inline widget or whole page.
 *
 * **Public API** (client-safe)
 * - `RemoteElement` — the client island: loads a remote's bundle by URL, waits
 *   for its custom element to upgrade, mounts `<tag>` into a host node, and maps
 *   props → attributes / CustomEvents → callbacks. Render it anywhere to embed an
 *   inline component microfrontend.
 * - `MfeEntry`, `MfeKind`, `RemoteElementProps` — the registry/primitive types.
 *
 * `loadRegistry` / `findMfe` read `mfe-registry.json` with `node:fs` and are
 * **server-only**; import them directly:
 * ```ts
 * import { findMfe } from "@/shared/mfe/registry";
 * ```
 *
 * **Registry.** Logical name → `{tag, scriptUrl, kind}` lives in
 * `mfe-registry.json` at the app root (served to the browser at
 * `/api/mfe-registry`). Remotes deploy independently — add an entry, don't
 * rebuild landing. Tags are globally unique and versioned (the custom-element
 * registry is global). **Light DOM only** — Tailwind v4 `@property` tokens break
 * inside shadow roots, and the global uikit tokens must cascade in.
 *
 * Page-level microfrontends mount at `/apps/<name>/…`
 * (`app/apps/[service]/[[...slug]]`); inline ones render `<RemoteElement>` in a
 * section. Producer recipes (React / Rust-WASM) live in `frontend/README.md`.
 */
export { RemoteElement } from "./remote-element";
export type { RemoteElementProps } from "./remote-element";
export type { MfeEntry, MfeKind } from "./types";
