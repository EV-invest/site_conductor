# Deployment

Target: `${vps_addr}` (Ubuntu 22.04, 2 vCPU, 2 GiB RAM, 30 GiB disk).
IP `${vps_addr}`. Too weak to build — artifacts built locally and shipped.

## Architecture

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

## Build & deploy

### Frontend

```sh
cd frontend
NEXT_PUBLIC_SITE_URL=https://evinvest.ltd NEXT_PUBLIC_REA_URL="" \
  NEXT_PUBLIC_API_URL=https://evinvest.ltd \
  APP_ENV=production NEXT_PUBLIC_APP_ENV=production npm run build

cd frontend && tar czf - .next/standalone .next/static public | \
  ssh ${vps_addr} 'tar xzf - -C /opt/evinvest/app && systemctl restart evinvest-frontend'
```

### Backend

Production deploys via tag → GHCR → Flux (see the `gitops` repo). For a manual
load, `nix build .#container` emits a `docker-archive` tarball. See `flake.nix`.

```sh
nix build .#container   # result → a docker-archive .tar.gz
skopeo copy docker-archive:result docker://ghcr.io/EV-invest/site_conductor:v0.0.1
# or load locally:
podman load < result
```

### REA embed

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

See [real_estate_allocation repo](../real_estate_allocation/) for its own
flake + config format.

## VPS layout

| Path | What |
|---|---|
| `/opt/evinvest/app` | Frontend standalone |
| `/opt/evinvest/repo` | Git clone |
| `/opt/evinvest/rea-data` | REA SQLite + properties |
| `/opt/evinvest/rea/config.toml` | REA config |
| `/etc/caddy/Caddyfile` | Caddy config |
| `/etc/systemd/system/evinvest-*.service` | Systemd units |

## Systemd

```sh
systemctl status evinvest-frontend evinvest-backend evinvest-rea caddy
journalctl -u evinvest-frontend -f
```

## Known gaps

- **A/B testing** off — `get-variant.ts` returns control, `proxy.ts` deleted.
- **REA WASM** absent — built with `cargo build`, not `dx build --release`.
  SSR works, client hydration doesn't.
- **Backend image** 2.4GB — nix closure drags build deps at runtime.
