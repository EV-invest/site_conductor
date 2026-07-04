# site_conductor
![Minimum Supported Rust Version](https://img.shields.io/badge/nightly-1.92+-ab6000.svg)

`site_conductor` is the public site and central shell for **EV Investment** — a
real-estate advisory and investment fund specializing in premium coastal
developments in Quy Nhon, Vietnam. It conducts the other EV web apps: each runs
as a standalone service on its own subdomain, and this repo composes them into
one client-facing surface (microfrontends — custom-element remotes and routed
zones). A Next.js 16 (App Router) front end in [`frontend/`](frontend) lives
alongside a [`backend/`](backend) placeholder to grow the site's own API into.
The shared design system ships as the published `@evinvest/uikit`.
<!-- markdownlint-disable -->
<details>
<summary>
<h2>Installation</h2>
</summary>

## Deployment

Target: `${vps_addr}` (Ubuntu 22.04, 2 vCPU, 2 GiB RAM, 30 GiB disk).
IP `${vps_addr}`. Too weak to build — artifacts built locally and shipped.

### Architecture

```
                   Caddy (:80, :443)
                   /              \
        evinvest.ltd          valeratrades.com
        /    |    \                \
  frontend  |   backend          some other
  :58843    |   :58844           :61156
  (node)    |
          REA embed
          :59079
     (/nix/store binary, no container)
```

### Build & deploy

#### Frontend

```sh
cd frontend
NEXT_PUBLIC_SITE_URL=https://evinvest.ltd NEXT_PUBLIC_REA_URL="" \
  NEXT_PUBLIC_API_URL=https://evinvest.ltd \
  APP_ENV=production NEXT_PUBLIC_APP_ENV=production npm run build

cd frontend && tar czf - .next/standalone .next/static public | \
  ssh ${vps_addr} 'tar xzf - -C /opt/evinvest/app && systemctl restart evinvest-frontend'
```

#### Backend

Production deploys via tag → GHCR → Flux (see the `gitops` repo). For a manual
load, `nix build .#container` emits a `docker-archive` tarball. See `flake.nix`.

```sh
nix build .#container   # result → a docker-archive .tar.gz
skopeo copy docker-archive:result docker://ghcr.io/EV-invest/site_conductor:v0.0.1
# or load locally:
podman load < result
```

#### REA embed

Built with `nix build .#bin`, shipped as a nix closure tarball (no container).

```sh
nix build .#bin
nix-store -qR $(nix build .#bin --no-link --print-out-paths --no-warn-dirty) \
  | sort -u | xargs tar czf /tmp/rea.tar.gz
scp /tmp/rea.tar.gz ${vps_addr}:/tmp/
ssh ${vps_addr} '
  cd / && gunzip -c /tmp/rea.tar.gz | tar xf -
  systemctl restart evinvest-rea
'
```

See [real_estate_allocation repo](./docs/real_estate_allocation/) for its own
flake + config format.

### VPS layout

| Path | What |
|---|---|
| `/opt/evinvest/app` | Frontend standalone |
| `/opt/evinvest/repo` | Git clone |
| `/opt/evinvest/rea-data` | REA SQLite + properties |
| `/opt/evinvest/rea/config.toml` | REA config |
| `/etc/caddy/Caddyfile` | Caddy config |
| `/etc/systemd/system/evinvest-*.service` | Systemd units |

### Systemd

```sh
systemctl status evinvest-frontend evinvest-backend evinvest-rea caddy
journalctl -u evinvest-frontend -f
```

### Known gaps

- **A/B testing** off — `get-variant.ts` returns control, `proxy.ts` deleted.
- **REA WASM** absent — built with `cargo build`, not `dx build --release`.
  SSR works, client hydration doesn't.
- **Backend image** 2.4GB — nix closure drags build deps at runtime.

</details>
<!-- markdownlint-restore -->

## Usage
### Local development — bring the whole stack up

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

# Terminal 2 — site_conductor. `populate-docs` first builds ./docs/whitepaper and ./docs/blog
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

### Microfrontends — no iframes

site_conductor composes other EV surfaces at runtime through `frontend/shared/mfe`,
**never via `<iframe>`**. Two transports, by what the remote ships (full reference:
[`frontend/PATTERNS.md` §8](./frontend/PATTERNS.md) and
[`frontend/README.md`](./frontend/README.md)).

#### Element remotes (`RemoteElement`) — the REA portfolio

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

#### Document remotes (`RemoteDocument`) — whitepaper + blog

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



<br>

<sup>
	This repository follows <a href="https://github.com/valeratrades/.github/tree/master/best_practices">my best practices</a> and <a href="https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md">Tiger Style</a> (except "proper capitalization for acronyms": (VsrState, not VSRState) and formatting).
</sup>

#### License

<sup>
	Licensed under <a href="LICENSE">Blue Oak 1.0.0</a>
</sup>

<br>

<sub>
	Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this crate by you, as defined in the Apache-2.0 license, shall
be licensed as above, without any additional terms or conditions.
</sub>

