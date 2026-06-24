# Frontend patterns

Conventions for this Next.js 16 (App Router) + FSD codebase. Keep them — they're
what makes the app fast (small client bundle, SSR/streaming) and the code easy to
reason about.

Reference: Next.js — [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

---

## 1. Server by default, `"use client"` at the leaf

**Server Components are the default. Add `"use client"` only to the smallest
piece that actually needs the client — never to a whole section "to be safe".**

A file needs `"use client"` only for:

- state / event handlers (`useState`, `onClick`, `onChange`)
- lifecycle (`useEffect`) or custom hooks
- browser-only APIs (`window`, `document`, `localStorage`)

Everything else stays a Server Component (zero JS shipped, server-rendered).

> `"use client"` marks a **boundary**: once a file has it, every module it imports
> and every component it _renders directly_ is pulled into the client bundle. So
> putting it high in the tree drags huge static subtrees client-side. Push it down.

### Server wraps client islands

The server is always the wrapper; client bits are **islands** inside it. Two ways
to keep server-rendered UI inside a client component (neither pulls the server
code into the client bundle):

- **`children` / props slot** — a Client Component renders `{children}`; the
  Server Component passes server-rendered elements in.
  Example: `ExperimentTracker` (client) wraps server `<TeamA/>` / `<TeamB/>`.
- **Extract the interactive leaf** — pull just the handler into a tiny client
  component and render it from the server parent.
  Examples: `hero/ui/hero-b-cta.tsx` (the only client bit of `HeroB`),
  `team/ui/team-placeholders.tsx` (the only client bit of `TeamA`/`TeamB`).

**Litmus test:** if a section is static except for one button, the section is a
Server Component and the button is the client island — not the other way around.

The exception is a component that is interactive _throughout_ (e.g. `HeroA`'s
scroll-zoom drives the whole visual from state) — that legitimately is one Client
Component. Even then, pass static sub-sections as `ReactNode` props from the
server wrapper so they stay out of the client bundle. Example: `HeroA` accepts
`stats={<HeroAStats />}` — the ribbon is SSR'd, the zoom shell is client-only.

### Context providers

React context needs a Client Component. Put `"use client"` on the provider, have
it accept `children`, and render it from a Server Component as deep as possible.
Server-Component children rendered _inside_ the provider's subtree still reach
client consumers nested below (see `TeamTracker` → `TeamPlaceholders`).

---

## 2. A/B testing — sections own it, pages don't

**A page must not know its sections are tested.** It renders `<Hero/>`,
`<Team/>` uniformly. Each section resolves its own variant.

Flow:

1. `proxy.ts` (root, Next 16 — nodejs runtime) assigns a sticky weighted cookie
   `ab_<key>` on first visit, per `shared/config/experiments.ts`. `Math.random`
   per-device, no user-id hashing.
2. A section's **Server** entry calls `await getVariant("<key>")`
   (`features/ab-variant`) — reads the cookie, returns a typed variant.
3. It picks the variant **element on the server**
   (`variant === "b" ? <X/> : <Y/>`), so only the served variant's chunk ships.
4. It wraps the chosen element in `<ExperimentTracker experiment="..." variant={v}>` —
   the thin client island that fires `${experiment}_exposed` on mount and provides
   variant context to all interactive islands in the subtree.

Add an experiment: add a key to `experiments`, build a server wrapper for the
section that branches on `getVariant` and wraps with `<ExperimentTracker>`, done.
The dev overlay (`DevAbPanel`) picks it up automatically.

> Reading the cookie makes the route dynamic — inherent to cookie-based A/B.

---

## 3. Analytics — one feature, event sink only

All instrumentation goes through `features/analytics` and `features/ab-variant`:

- `<PostHogProvider>` — mount once in the root layout.
- `<ExperimentTracker experiment="..." variant={v}>` — wraps a section's server
  wrapper; fires `${experiment}_exposed` on mount and provides context.
- `useExperimentEvent()` — inside any client island in the section, returns a
  `track(action, props?, handler?)` function that emits `${experiment}_${action}`:
  ```tsx
  // fire directly
  track("cta_clicked", { cta: "explore" })

  // fire + run a side effect; handler controls order
  track("cta_clicked", { cta: "explore" }, (fire) => {
    fire();
    doSomethingElse();
  })
  ```
- `useCapture()` / `useAnalytics()` — hooks returning `capture(event, props)` for
  one-off events unrelated to an experiment (`useAnalytics` no-ops without a provider).

Rules:

- **Never import `posthog-js` directly.** `@evinvest/analytics` (re-exported by
  `features/analytics`) owns init/consent in one place.
- Analytics **records**, it never **decides** what to render (bucketing is owned
  by `proxy.ts` + cookies).
- Call only from Client Components — never from Server Components / `next/headers`.
- Event names are `snake_case`, scoped `<surface>_<thing>_<action>`, and stable
  (they're the dashboard contract). Props are primitive and non-PII.

See `@evinvest/analytics`'s GUIDE (event taxonomy + recipes) for how to add an event.

---

## 4. Component size — 100–120 line cap

**A component file should not exceed 120 lines.** When it does, split it.

The cap forces the right decomposition: long components are almost always mixing
static layout with interactive logic, or cramming two distinct visual concerns
into one file. Splitting reveals the structure and usually also reduces the client
bundle (the static part becomes a Server Component).

Practical split strategies:

| Symptom | Split |
|---|---|
| Static block inside a client component | Extract as a Server Component, pass as `ReactNode` prop |
| Two independent visual regions | One file per region, compose in the parent |
| Reusable card / row layout | Move to `ui/` shared or a `*-shared.tsx` sibling |
| Complex hook logic | Extract to a `use*.ts` hook file |

> The 120-line budget includes imports and blank lines. JSDoc counts too.

---

## 5. FSD layering (where things go)

- `app/` — routing, root layout. Server by default.
- `views/` — page composition (e.g. `HomeView`). Agnostic of A/B.
- `features/` — behaviour slices: `analytics`, `ab-variant`, `investment-calculator`.
- `entities/` — domain data (`team`, …).
- `shared/` — reusable, app-agnostic: `ui/`, `lib/`, `config/`, `hooks/`.

Each slice exposes a public API via its `index.ts`; import from the slice root,
not deep paths.

---

## 6. Backend data — generated client behind entities

The Rust backend owns the HTTP contract. The flow is one-directional:

```
backend (utoipa) → backend/openapi.json → @hey-api/openapi-ts → shared/api/generated → entities/* → views/features
```

- **Never hand-edit `shared/api/generated/`** — regenerate with `nix run .#gen-api`
  (dumps `openapi.json`, then runs `npm run gen:api`). Commit both.
- **Consume via `@/shared/api`**, never reach into `generated/`. `shared/api/runtime.ts`
  injects `baseUrl` from `NEXT_PUBLIC_API_URL` and is the only file codegen won't overwrite.
- **Entities wrap the transport in domain names** — `entities/vacancy` re-exports
  `listVacancies`/`getVacancy` + types; features/views depend on the entity, not `shared/api`.
- **Fetch in Server Components**, `export const dynamic = "force-dynamic"`, and degrade
  gracefully (try/catch → empty state) so the build never needs the backend reachable.
  The hey-api client returns `{ data, error }` (no throw by default) — branch on it.

---

## 7. Gotcha — no two sibling `<Button asChild>`

Two sibling `@evinvest/uikit` `<Button asChild>` (Radix Slot → `<Link>`) **desync
hydration** under React 19 and one silently drops from the client DOM. For nav CTAs
(which are just links), render a plain styled `<Link className={…}>` or a plain
`<button onClick>` instead — see `views/status/ui/buttons.tsx`. A single `Button
asChild`, or a non-`asChild` `<Button onClick>`, is fine.

---

## 8. Microfrontends — never `<iframe>`

**Do not use `<iframe>` to embed another EV surface.** Iframes don't auto-size
(fixed-height hacks), trap their own scroll, can't share the host's tokens/fonts,
and bury their content in a separate document Google associates only weakly with
the page. Compose other surfaces **natively** through `@/shared/mfe` instead. Two
transports, picked by what the remote ships:

- **Element remote — `RemoteElement`.** The remote is a self-registering ESM
  bundle that defines a custom element (`customElements.define("mfe-<svc>-<name>",
  …)`); identical for JS (React via `@r2wc/react-to-web-component`) and Rust/WASM
  (Dioxus/Leptos). Mounted in **light DOM** — Tailwind v4 `@property` tokens break
  inside shadow roots and the global uikit tokens must cascade in. Resolved from
  `mfe-registry.json` (`findMfe`, server-only) so remotes deploy independently.
  Inline anywhere, or as a whole page at `/apps/<name>` (the home portfolio/REA
  section is the live example).
- **Document remote — `RemoteDocument`.** The remote is a self-contained static
  HTML document (the typst-built whitepaper / blog). `isolate={false}` (default)
  injects its `<body>` into the **light DOM** so host typography (`prose`) styles
  it — a pure Server Component, SSR'd and indexable (use for unstyled docs, e.g.
  research articles). `isolate` mounts a **self-styled** doc (its own CSS targets
  bare tags) in a **shadow root** via a small client island, so its styles can't
  reach the host (use for the whitepaper). `/whitepaper` and `/blogs/[slug]` are
  the live examples.

Notes that bite:
- **Shadow remotes are client-only.** React 19 can emit Declarative Shadow DOM
  (`<template shadowrootmode>`) but **cannot hydrate over it**, and DSD never
  upgrades on App-Router soft navigation — so `RemoteDocument isolate` uses
  client-side `attachShadow`, and a self-styled doc's `html{}`/`body{}` rules are
  preserved by recreating those elements with `createElement` (setting a shadow
  root's `innerHTML` strips html/body tags). One consequence: `rem` inside the
  shadow resolves against the **host** root font-size, not the doc's nested
  `<html>` — a self-styled doc that sets its own rem base should size with `em`
  (the whitepaper's typst CSS has a minor outer-margin drift from this; the fix is
  `rem`→`em` in that build's source).
- **Shadow content isn't SSR'd → not a good indexable target.** `isolate` mounts
  the body client-side, so it's absent from the server HTML — keep such pages out
  of the sitemap (see `shared/config/site.ts`). Only the `isolate={false}`
  light-DOM path is SSR'd and indexable.
- **Trust boundary = treat as code.** Element `scriptUrl`s and document HTML are
  operator-controlled (in-repo registry / typst build), injected with no sandbox
  and **no sanitization** — registry edits and doc sources are code. If either ever
  becomes user-/dynamically-sourced, gate it (origin allowlist / DOMPurify).
- Degrade gracefully: a `RemoteDocument` whose source can't be loaded renders its
  `fallback` (a PDF link), so a missing doc build never breaks the page.
