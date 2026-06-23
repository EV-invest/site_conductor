# landing
![Minimum Supported Rust Version](https://img.shields.io/badge/nightly-1.92+-ab6000.svg)

`landing` is the public marketing site for **EV Investment** — a real-estate
advisory and investment fund specializing in premium coastal developments in Quy
Nhon, Vietnam. A Next.js 16 (App Router) front end in [`frontend/`](frontend)
lives alongside a [`backend/`](backend) placeholder to grow the site's own API
into. The shared design system ships as the published `@evinvest/uikit`.
<!-- markdownlint-disable -->
<details>
<summary>
<h2>Installation</h2>
</summary>

## Deployment

Target: `inferno_vps_tokyo` (Ubuntu 22.04, 2 vCPU, 2 GiB RAM, 30 GiB disk).
IP `176.97.73.24`. Too weak to build — artifacts built locally and shipped.

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
  ssh inferno_vps_tokyo 'tar xzf - -C /opt/evinvest/app && systemctl restart evinvest-frontend'
```

#### Backend

`nix build .#backend-image` then export + ship + load. See `flake.nix`.

```sh
nix build .#backend-image
nix run .#backend-image.copyTo -- oci-archive:/tmp/backend.tar:evinvest-backend:latest
scp /tmp/backend.tar inferno_vps_tokyo:/tmp/
ssh inferno_vps_tokyo 'podman load < /tmp/backend.tar && systemctl restart evinvest-backend'
```

#### REA embed

Built with `nix build .#bin`, shipped as a nix closure tarball (no container).

```sh
nix build .#bin
nix-store -qR $(nix build .#bin --no-link --print-out-paths --no-warn-dirty) \
  | sort -u | xargs tar czf /tmp/rea.tar.gz
scp /tmp/rea.tar.gz inferno_vps_tokyo:/tmp/
ssh inferno_vps_tokyo '
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
### `real_estate_allocation` embed contract

The home page's "Premium Asset Portfolio" section is **not** rendered by this
repo. It is a microfrontend: an `<iframe>` onto the `real_estate_allocation`
app, which serves a shell-less marketing surface at `/embed/overview`. The host
(`frontend/views/home/ui/real_estate_allocation/`) only frames it; the in-repo
React section (`portfolio_fallback/`) is kept solely as the offline fallback.

#### Endpoint

- **URL:** `${NEXT_PUBLIC_REA_URL}/embed/overview` — defaults to
  `http://localhost:59079` when the env var is unset.
- **Surface:** standalone, no app shell, no auth, no Maps script. Static content
  plus one self-contained ROI calculator tile.

#### Who owns what

| Concern | Owner |
| --- | --- |
| Section content, copy, calculator logic | `real_estate_allocation` (embed) |
| Width box, height, availability, page anchor | `landing` (host) |

The host caps the iframe at the page `Container` width
(`max-w-[var(--page-max,90rem)]`) and adds **no** horizontal padding — the
embed's own `Container` supplies it. So the embed must render its content inside
a `Container` and must **not** add an outer max-width of its own, or the box
won't line up.

#### Invariants the embed must hold

- **Framing allowed:** no `X-Frame-Options: DENY`; in prod its CSP
  `frame-ancestors` must include the landing origin.
- **Fills the width it's given:** the host decides the box; the embed lays out
  fluidly within it (see width note above).
- **Stable route:** `/embed/overview` is the contract path. Renaming it breaks
  the host.

#### Host-side behavior

- **Availability probe:** on mount the host does `fetch(src, {method:"HEAD",
  mode:"no-cors"})`. A network rejection (embed down) ⇒ `console.warn` (silent
  to users) and render `portfolio_fallback` instead. Opaque success ⇒ iframe.
  A reachable-but-5xx embed is **not** detected (no-cors can't read status).
- **Height:** fixed at `1600px`. Iframes don't auto-size. If the embed's content
  height changes, it must `postMessage(scrollHeight)` and the host must listen —
  not wired yet.
- **Anchor:** the host wrapper keeps `id="portfolio"` so the hero CTAs'
  `getElementById("portfolio").scrollIntoView()` still lands here; the embed's
  internal anchor is invisible to the parent document.

#### Local dev

```
real_estate_allocation:  dx serve   # → http://localhost:59079
landing:                 pnpm dev   # → http://localhost:3000
```

Set `NEXT_PUBLIC_REA_URL` to point at a non-default embed origin.



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

