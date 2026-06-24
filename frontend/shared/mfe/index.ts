/**
 * @module shared/mfe
 *
 * Microfrontend composition — the host primitives for mounting microfrontends
 * from other EV services at runtime. Two transports, never an `<iframe>`:
 *
 * - **Element remotes** (`RemoteElement`) — a self-registering ESM bundle that
 *   defines a custom element (`customElements.define("mfe-…", …)`). Identical for
 *   JS (React, …) and Rust/WASM (Dioxus, Leptos), inline widget or whole page.
 *   Mounted in **light DOM** (Tailwind v4 `@property` tokens break inside shadow
 *   roots, and the global uikit tokens must cascade in). Used by the home
 *   portfolio section (REA) and the `/apps/<name>` page route.
 * - **Document remotes** (`RemoteDocument`) — a self-contained static HTML
 *   document (the typst-built whitepaper / blog) composed into the page natively.
 *   `isolate=false` injects the `<body>` into light DOM so host typography styles
 *   it (SSR'd, indexable); `isolate=true` mounts a self-styled doc in a shadow
 *   root so its bare-tag CSS can't reach the host. Used by `/whitepaper` and
 *   `/blogs/[slug]`.
 *
 * **Public API** (client-safe): `RemoteElement`, `RemoteDocument`, and the
 * `RemoteElementProps` / `RemoteDocumentProps` / `MfeEntry` / `MfeKind` types.
 *
 * `loadRegistry` / `findMfe` read `mfe-registry.json` with `node:fs` and are
 * **server-only**; import them directly:
 * ```ts
 * import { findMfe } from "@/shared/mfe/registry";
 * ```
 *
 * **Element registry.** Logical name → `{tag, scriptUrl, kind}` lives in
 * `mfe-registry.json` at the app root (served to the browser at
 * `/api/mfe-registry`). Remotes deploy independently — add an entry, don't
 * rebuild landing. Tags are globally unique and versioned (the custom-element
 * registry is global). Document remotes are addressed by URL directly, not via
 * this registry. Producer recipes (React / Rust-WASM) live in `frontend/README.md`.
 */
export { RemoteElement } from "./remote-element";
export type { RemoteElementProps } from "./remote-element";
export { RemoteDocument } from "./remote-document";
export type { RemoteDocumentProps } from "./remote-document";
export type { MfeEntry, MfeKind } from "./types";
