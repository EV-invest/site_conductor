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
Too weak to build — images built by CI and shipped.

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

### Deploy

```sh
nix run .#publish -- major|minor|patch
```

That bumps the latest remote `vX.Y.Z` tag and pushes it. The tag triggers the
release workflow (`containerRelease` in `flake.nix`): CI builds the `frontend`
and `backend` OCI images — re-resolving the private inputs (REA embeds, blog,
whitepaper) to fresh `main` — pushes them to `ghcr.io/ev-invest`, and Flux
rolls them out (see the `gitops` repo). Frontend and backend are separate
images, so each rolls out independently.

</details>
<!-- markdownlint-restore -->

## Usage
### Local development

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
instead of the baked bundle: `cd ./docs/real_estate_allocation && nix run .#dev`
(→ :59079, verify with `nix run .#healthcheck` there).

### Microfrontends — no iframes

Other EV surfaces compose at runtime through `frontend/shared/mfe`, never via
`<iframe>`. Full reference: [`frontend/PATTERNS.md` §8](./frontend/PATTERNS.md)
and [`frontend/README.md`](./frontend/README.md).

- **Element remotes (`RemoteElement`)** — the home "Premium Asset Portfolio"
  section is `real_estate_allocation`'s self-registering custom element
  `<mfe-real-estate-overview>`, mounted in light DOM and resolved from
  `frontend/mfe-registry.json`. `scriptUrl`s run third-party JS in our origin —
  treat the registry as code.
- **Document remotes (`RemoteDocument`)** — `/whitepaper` and `/blogs/[slug]`
  are static HTML from the sibling typst repos. Blog injects into light DOM
  (SSR'd, host-styled); whitepaper mounts in a shadow root (ships its own CSS).
  Unloadable doc → PDF-link fallback.



<br>

<sup>
	This repository follows <a href="https://github.com/valeratrades/.github/tree/master/best_practices">my best practices</a> and <a href="https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md">Tiger Style</a> (except "proper capitalization for acronyms": (VsrState, not VSRState) and formatting). For project's architecture, see <a href="./docs/ARCHITECTURE.md">ARCHITECTURE.md</a>.
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

