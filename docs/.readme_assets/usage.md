## Local development — bring the whole stack up

Everything runs **token-free** via Nix (no GitHub auth needed for `nix`). Check the
sibling EV repos out next to `site_conductor/` so the flake can build them locally:

```
ev/
├── site_conductor/           ← this repo
├── whitepaper/               ← typst → /whitepaper           (optional)
├── blog/                     ← typst → /blogs/[slug]         (optional)
└── real_estate_allocation/   ← REA microfrontend (portfolio) (optional)
```

```sh
# Terminal 1 — REA microfrontend (the home "Premium Asset Portfolio" section).
# Serves the self-registering custom-element bundle at /mfe on :59079, with CORS.
# Optional: without it, site_conductor renders the in-repo portfolio fallback.
cd real_estate_allocation && nix run .#dev            # → http://localhost:59079

# Terminal 2 — site_conductor. `populate-docs` first builds ../whitepaper and ../blog
# (best-effort: a missing sibling just warns and that doc page degrades to a PDF link).
cd site_conductor && nix run .#frontend               # → http://localhost:58843
# …or the full backend stack (postgres + axum API + frontend):
cd site_conductor && nix run .#dev                    # → :58843 + :58844 + :5432
```

site_conductor finds the REA bundle via `NEXT_PUBLIC_REA_URL` (defaults to
`http://localhost:59079`), so once both are up the portfolio section composes the
remote automatically. Verify the wiring end-to-end (REA `/mfe` endpoints + CORS +
a headless-browser check that `<mfe-real-estate-overview>` actually mounts on the
home page):

```sh
cd real_estate_allocation && nix run .#healthcheck
```

| Port | Service | Command |
| --- | --- | --- |
| 58843 | site_conductor (Next.js) | `site_conductor`: `nix run .#frontend` / `.#dev` |
| 58844 | backend (axum API) | `site_conductor`: `nix run .#dev` / `.#backend` |
| 5432  | postgres | `site_conductor`: `nix run .#dev` / `.#db` |
| 59079 | REA microfrontend (`/mfe`) | `real_estate_allocation`: `nix run .#dev` |

---

## Microfrontends — no iframes

site_conductor composes other EV surfaces at runtime through `frontend/shared/mfe`,
**never via `<iframe>`**. Two transports, by what the remote ships (full reference:
[`frontend/PATTERNS.md` §8](../../frontend/PATTERNS.md) and
[`frontend/README.md`](../../frontend/README.md)).

### Element remotes (`RemoteElement`) — the REA portfolio

The home page's "Premium Asset Portfolio" section is **not** rendered by this
repo. It's a microfrontend: `real_estate_allocation` ships a self-registering ESM
bundle that defines the custom element `<mfe-real-estate-overview>`; the host
(`frontend/views/home/ui/portfolio/`) mounts it with `<RemoteElement>` in **light
DOM** (so the host fonts/tokens cascade in), and falls back to the in-repo React
section (`portfolio_fallback/`) when the remote is missing or fails to load.

- **Bundle URL:** `/mfe/mfe-real-estate-overview.js` (same-origin — the flake's
  `populate-docs` copies the built bundle into `frontend/public/mfe/`), resolved
  from `frontend/mfe-registry.json` (`findMfe`). `NEXT_PUBLIC_REA_URL` advertises
  the REA **backend** origin via `<meta name="rea-url">` for the bundle's own API
  calls (defaults to `http://localhost:59079`). Remotes deploy independently —
  edit the registry, don't rebuild site_conductor.
- **Contract:** CSR-only, light DOM, self-registering custom element. The tag is
  global + versioned. `scriptUrl`s are operator-controlled — treat the registry
  as code (it runs third-party JS in the site_conductor origin, no sandbox).
- **Whole-page form:** a `kind:"page"` registry entry mounts at `/apps/<name>`.

### Document remotes (`RemoteDocument`) — whitepaper + blog

The whitepaper (`/whitepaper`) and research articles (`/blogs/[slug]`) are
self-contained static HTML built by the sibling `whitepaper` / `blog` typst repos
and copied into `frontend/public/` by the flake's `populate-docs`. They're
composed into the page natively with `<RemoteDocument>`:

- **Blog** ships no styles of its own → injected into the **light DOM** and styled
  by the host reading typography (`prose`). Pure Server Component: SSR'd, indexable.
- **Whitepaper** ships its own complete styles (bare-tag selectors) → mounted in a
  **shadow root** (`isolate`) by a small client island so its CSS can't reach the
  host.
- A doc that can't be loaded renders a **PDF-link fallback**, so a missing build
  never breaks the page.
