# Deployment

Target: `${vps_addr}` (Ubuntu 22.04, 2 vCPU, 2 GiB RAM, 30 GiB disk).
Too weak to build — images built by CI and shipped.

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

## Deploy

```sh
nix run .#publish -- major|minor|patch
```

That bumps the latest remote `vX.Y.Z` tag and pushes it. The tag triggers the
release workflow (`containerRelease` in `flake.nix`): CI builds the `frontend`
and `backend` OCI images — re-resolving the private inputs (REA embeds, blog,
whitepaper) to fresh `main` — pushes them to `ghcr.io/ev-invest`, and Flux
rolls them out (see the `gitops` repo). Frontend and backend are separate
images, so each rolls out independently.
