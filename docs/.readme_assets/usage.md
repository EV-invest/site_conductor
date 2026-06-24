## Local development — bring the whole stack up

Everything runs **token-free** via Nix (no GitHub auth needed for `nix`). Check the
sibling EV repos out next to `landing/` so the flake can build them locally:

```
ev/
├── landing/                  ← this repo
├── whitepaper/               ← typst → /whitepaper           (optional)
├── blog/                     ← typst → /blogs/[slug]         (optional)
└── real_estate_allocation/   ← REA microfrontend (portfolio) (optional)
```

```sh
# Terminal 1 — REA microfrontend (the home "Premium Asset Portfolio" section).
# Serves the self-registering custom-element bundle at /mfe on :59079, with CORS.
# Optional: without it, landing renders the in-repo portfolio fallback.
cd real_estate_allocation && nix run .#dev            # → http://localhost:59079

# Terminal 2 — landing. `populate-docs` first builds ../whitepaper and ../blog
# (best-effort: a missing sibling just warns and that doc page degrades to a PDF link).
cd landing && nix run .#frontend                      # → http://localhost:58843
# …or the full backend stack (postgres + axum API + frontend):
cd landing && nix run .#dev                           # → :58843 + :58844 + :5432
```

Landing finds the REA bundle via `NEXT_PUBLIC_REA_URL` (defaults to
`http://localhost:59079`), so once both are up the portfolio section composes the
remote automatically. Verify the wiring end-to-end (REA `/mfe` endpoints + CORS +
a headless-browser check that `<mfe-real-estate-overview>` actually mounts on the
landing page):

```sh
cd real_estate_allocation && nix run .#healthcheck
```

| Port | Service | Command |
| --- | --- | --- |
| 58843 | landing (Next.js) | `landing`: `nix run .#frontend` / `.#dev` |
| 58844 | backend (axum API) | `landing`: `nix run .#dev` / `.#backend` |
| 5432  | postgres | `landing`: `nix run .#dev` / `.#db` |
| 59079 | REA microfrontend (`/mfe`) | `real_estate_allocation`: `nix run .#dev` |

---

## Microfrontends — no iframes

Landing composes other EV surfaces at runtime through `frontend/shared/mfe`,
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

- **Bundle URL:** `${NEXT_PUBLIC_REA_URL}/mfe/mfe-real-estate-overview.js` —
  defaults to `http://localhost:59079` when the env var is unset. Resolved from
  `frontend/mfe-registry.json` (`findMfe`), so the remote deploys independently —
  edit the registry, don't rebuild landing.
- **Contract:** CSR-only, light DOM, self-registering custom element. The tag is
  global + versioned. `scriptUrl`s are operator-controlled — treat the registry
  as code (it runs third-party JS in the landing origin, no sandbox).
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
