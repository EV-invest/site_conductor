# landing

Public marketing site for the EV Investment fund — Next.js 16 (App Router) +
React 19, laid out with Feature-Sliced Design, styled with Tailwind v4. Serves on
`:3000`.

## Layout

```
app/          routing + root layout (Server Components by default)
views/        page composition (HomeView), agnostic of A/B
features/     behaviour slices: analytics, ab-variant, investment-calculator
entities/     domain data (team, …)
shared/       app-agnostic ui/, lib/, config/, hooks/, mfe/ (microfrontend host)
application/  styles/globals.css → imports ../public/tokens.css
public/       static assets
tests/        per-section Playwright visual baselines
proxy.ts      Next 16 proxy — sticky weighted A/B cookie assignment
mfe-registry.json  microfrontend registry (name → tag/scriptUrl/kind)
```

FSD import order `app → views → features → entities → shared`; import from a
slice's `index.ts`, never deep paths. Conventions live in [`PATTERNS.md`](./PATTERNS.md).

## Run only landing

```sh
nix run .#landing            # → http://localhost:3000
```
Or inside the dev shell (`.envrc` + direnv):
```sh
cd landing && npm install && npm run dev
```
Tailwind builds automatically inside Next via the `@tailwindcss/postcss` plugin —
no separate step. It imports the shared tokens from
[`../public/tokens.css`](../public/tokens.css) through `application/styles/globals.css`;
edit the tokens there and Next hot-reloads.

## Checks

```sh
npm run lint                 # eslint
npm run check                # tsc --noEmit
```

## Visual-regression tests

Per-section Playwright screenshots in [`tests/`](./tests) — one baseline per
addressable section (`#hero`, `#portfolio`, `#calculator`, `#research`, `#team`,
plus header/footer). Browsers come from nixpkgs, pinned to the `@playwright/test`
revision via the flake, so screenshots are reproducible.
```sh
npm run test:visual          # compare against committed baselines
npm run test:visual:update   # regenerate baselines after an intentional UI change
```
> Linux-only via nix; skip locally on macOS.

> The landing is a static marketing site — it does not call the hub backend, so
> there is no API client here.

## Microfrontends

Landing can compose microfrontends from other EV services at runtime — inline
widgets or whole pages, JS bundles (React, …) or Rust/WASM (Dioxus, Leptos).

**Universal contract — a custom element.** Every microfrontend ships one
self-registering ESM bundle that calls `customElements.define("mfe-<service>-<name>", …)`.
The host mounts it with [`<RemoteElement>`](./shared/mfe/remote-element.tsx): load
the bundle by URL → `customElements.whenDefined(tag)` → render `<tag>`, mapping
props to attributes and CustomEvents to callbacks. The boundary is identical for
every framework. **Light DOM only** — Tailwind v4 `@property` tokens break inside
shadow roots, and the global uikit tokens must cascade in.

- **Registry.** A logical name resolves to `{tag, scriptUrl, kind}` from
  [`mfe-registry.json`](./mfe-registry.json) (served to the browser at
  `/api/mfe-registry`). Remotes deploy independently — add an entry, don't rebuild
  landing. Tags are globally unique and versioned. Registry reads
  (`shared/mfe/registry.ts`) use `node:fs` and are **server-only**; the client-safe
  `RemoteElement` is the public API from `@/shared/mfe`. `scriptUrl`s are
  operator-controlled and served openly at `/api/mfe-registry` — **treat registry
  edits as code** (they execute third-party JS in the landing origin); gate them
  against an origin allowlist if the registry ever becomes user-/dynamically-sourced.

  ```jsonc
  // mfe-registry.json — kind:"page" names must be a single URL segment (no dots)
  [{ "name": "calculator.yield", "tag": "mfe-calculator-yield",
     "scriptUrl": "https://cdn.example.com/yield.js", "kind": "component" }]
  ```

- **Inline widget** — render `<RemoteElement>` anywhere (resolve the entry server-side
  with `findMfe` from `@/shared/mfe/registry`, or pass `tag`/`scriptUrl` directly):

  ```tsx
  <RemoteElement tag="mfe-calculator-yield" scriptUrl="…"
    fallback={<p>loading…</p>} />
  ```

- **Whole page** — register an entry with `"kind": "page"`; it mounts at
  `/apps/<name>/…` ([`app/apps/[service]/[[...slug]]`](./app/apps)) and owns the
  content region while landing keeps its chrome. Scoped under `/apps` (not a root
  catch-all) so it never shadows the marketing routes or the real 404.

**Producing a microfrontend** (other repos — landing ships no producer SDK). The
canonical, fuller recipe lives in the hub's
[`docs/ARCHITECTURE.md` § Microfrontends](../../banking/docs/ARCHITECTURE.md); the
contract is shared with `cabinet`, so keep this in sync with it.

- **React** — wrap a component as a custom element with
  [`@r2wc/react-to-web-component`](https://github.com/bitovi/react-to-web-component);
  ship it as one ESM bundle that self-registers. _Optional_ for React-to-React
  widgets: Module Federation 2.0 **runtime** (`@module-federation/runtime` +
  `bridge-react`) to share one React instance — never `@module-federation/nextjs-mf`.
- **Rust/WASM** — Dioxus 0.7 mounts via `dioxus-web` `Config::rootelement(Element)`
  into the custom element; Leptos via `mount_to(HtmlElement, …)`. CSR-only, light
  DOM, `wasm-bindgen =0.2.118`. Don't use `dioxus-web-component` yet (it pins Dioxus
  0.6). _Open item:_ prove multiple independent Dioxus instances per page before
  relying on it.

## Design system (Figma)

The visual language is mirrored in a Figma file
([`Landing`](https://www.figma.com/design/e0V2P1cQpEFRuXTeNtEMh6/Landing)), kept
**code-first**: [`application/styles/globals.css`](./application/styles/globals.css)
plus the shared [`../public/tokens.css`](../public/tokens.css) are the source of
truth; the Figma side is conformed to them, never the reverse.

- **Tokens → Figma Variables.** Three collections mirror the CSS tokens 1:1, each
  with `var(--token)` code syntax so Dev Mode round-trips cleanly: `ev/color`
  (brand primitives `main-*` + neutrals), `ev/semantic` (shadcn roles aliased onto
  the primitives), `ev/radius` (the `--radius` scale).
- **Components.** The shadcn `bricks` are rebuilt as Figma variant-sets bound to
  those Variables (Button, Badge, Input/Field, Checkbox, Switch, Card, Select,
  Tabs, Accordion, Tooltip), on a dark navy surface. Fonts: Inter (sans) +
  Playfair (display).

> Code Connect (the design↔code mapping) is intentionally **not** wired up: it
> requires a Figma Organization/Enterprise plan and the file is on Pro. Tokens and
> variant-sets work regardless.
