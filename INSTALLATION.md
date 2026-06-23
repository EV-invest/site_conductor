# Deployment

Target: `inferno_vps_tokyo` (Ubuntu 22.04, 2 vCPU, 2 GiB RAM, 30 GiB disk).
IP `176.97.73.24`. Too weak to build — all artifacts are built locally and
shipped.

## Architecture

```
                   Caddy (:80, :443)
                   /              \
        evinvest.ltd          valeratrades.com
        /         \                \
  frontend      backend          some other
  :58843        :58844           :61156
  (node)        (podman)
```

- **Frontend**: Next.js 16 standalone (`output: "standalone"`), served by
  Node on `localhost:58843`.
- **Backend**: Axum API, built into an OCI image via
  [`nix2container`](https://github.com/nlewo/nix2container), run by podman on
  `localhost:58844`.
- **Database**: PostgreSQL 14, `ev_landing` DB, role `evinvest`
  (password `evinvest_local` — internal-only, loopback bind).
- **TLS**: Caddy auto-provisions Let's Encrypt certificates.

## Build & deploy

Everything is in the flake:

```sh
# Frontend (manual — Node toolchain, not yet Nix-ified)
cd frontend
NEXT_PUBLIC_SITE_URL=https://evinvest.ltd NEXT_PUBLIC_API_URL=https://evinvest.ltd \
  APP_ENV=production NEXT_PUBLIC_APP_ENV=production npm run build

# Backend OCI image
nix build .#backend-image

# Export to tarball for podman
nix run .#backend-image.copyTo -- docker-archive:/tmp/backend-image.tar:evinvest-backend:latest

# Ship frontend
cd frontend && tar czf - .next/standalone .next/static public | \
  ssh inferno_vps_tokyo 'tar xzf - -C /opt/evinvest/app && systemctl restart evinvest-frontend'

# Ship backend
scp /tmp/backend-image.tar inferno_vps_tokyo:/tmp/
ssh inferno_vps_tokyo 'podman load < /tmp/backend-image.tar && systemctl restart evinvest-backend'
```

See `flake.nix` for the Nix-side derivation, output hashes, and feature
gating.

## VPS layout

| Path | What |
|---|---|
| `/opt/evinvest/app` | Frontend standalone (server.js + node_modules + public + .next/static) |
| `/opt/evinvest/repo` | Git clone (for `git pull` to update `public/` without full redeploy) |
| `/etc/caddy/Caddyfile` | Caddy config (both domains) |
| `/etc/systemd/system/evinvest-*.service` | Systemd units |

## Systemd

```sh
systemctl status evinvest-frontend evinvest-backend caddy   # check all
systemctl restart evinvest-frontend                         # redeploy frontend
systemctl restart evinvest-backend                          # redeploy backend
journalctl -u evinvest-frontend -f                          # tail logs
```

## DNS

Both `evinvest.ltd` and `valeratrades.com` point to `176.97.73.24`.
Managed wherever the domains are registered (Squarespace for evinvest.ltd).

## What's not deployed

- **real_estate_allocation** — the "Premium Asset Portfolio" embed lives in
  a separate repo (`/home/v/s/ev_invest/real_estate_allocation`), served by
  its own process. Caddy is **not** routing it; the landing site iframes it
  from `${NEXT_PUBLIC_REA_URL}/embed/overview` (default `http://localhost:59079`).
  See `README.md` for the embed contract.
- **A/B testing** — disabled for the production launch (`get-variant.ts`
  always returns the control variant; `proxy.ts` is deleted). Re-enable
  instructions are in `features/ab-variant/get-variant.ts`.

## Rebuild checklist

1. `nix build .#backend-image`
2. Export → scp → `podman load` → `systemctl restart evinvest-backend`
3. Rebuild frontend with prod env vars → tar → ssh → `systemctl restart evinvest-frontend`
4. If `public/` assets (logo, whitepaper) changed: `git pull` in
   `/opt/evinvest/repo` → copy into `/opt/evinvest/app/public/`
