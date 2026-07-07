## Local development

Everything runs via Nix, token-free:

Ports live in one place — the `ports` attrset in `flake.nix`; the runners
export them, so nothing here hardcodes a number.

| Command | What |
| --- | --- |
| `nix run .#dev` | full stack: shared postgres + backend + frontend |
| `nix run .#frontend` | Next.js site only |
| `nix run .#backend` | axum API only (ensures the shared postgres) |
| `nix run .#db` | ensure the shared ev_invest postgres is up (+ this repo's `site_conductor` db) |
| `nix run .#gen-api` | regenerate `backend/openapi.json` + the TS client (run after any DTO/handler change; commit both) |
| `nix run .#test` | frontend typecheck + Playwright visual regression |
| `nix run .#accept-test` | accept new screenshots (all, or `-- <names>`) |
| `nix run .#publish` | bump latest remote `vX.Y.Z` tag (`-- major\|minor\|patch`) + push |

Frontend runs pull docs and the REA bundle from sibling checkouts next to
`site_conductor/` — `whitepaper/`, `blog/`, `real_estate_allocation/`, all
optional. A missing sibling just warns: docs degrade to a PDF link, the
portfolio section falls back to the in-repo render. For a live REA remote
instead of the baked bundle: `cd ../real_estate_allocation && nix run .#dev`
(→ :59079, verify with `nix run .#healthcheck` there).

## Microfrontends — no iframes

Other EV surfaces compose at runtime through `frontend/shared/mfe`, never via
`<iframe>`. Full reference: [`frontend/PATTERNS.md` §8](../../frontend/PATTERNS.md)
and [`frontend/README.md`](../../frontend/README.md).

- **Element remotes (`RemoteElement`)** — the home "Premium Asset Portfolio"
  section is `real_estate_allocation`'s self-registering custom element
  `<mfe-real-estate-overview>`, mounted in light DOM and resolved from
  `frontend/mfe-registry.json`. `scriptUrl`s run third-party JS in our origin —
  treat the registry as code.
- **Document remotes (`RemoteDocument`)** — `/whitepaper` and `/blogs/[slug]`
  are static HTML from the sibling typst repos. Blog injects into light DOM
  (SSR'd, host-styled); whitepaper mounts in a shadow root (ships its own CSS).
  Unloadable doc → PDF-link fallback.
