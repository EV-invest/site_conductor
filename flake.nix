{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    rust-overlay.inputs.nixpkgs.follows = "nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks.url = "github:cachix/git-hooks.nix";
    pre-commit-hooks.inputs.nixpkgs.follows = "nixpkgs";
    v_flakes.url = "github:valeratrades/v_flakes?ref=v1.6";
    v_flakes.inputs.nixpkgs.follows = "nixpkgs";
    v_flakes.inputs.rust-overlay.follows = "rust-overlay";
    ev_assets = { url = "github:ev-invest/assets"; flake = false; };
  };
  outputs = { self, nixpkgs, rust-overlay, flake-utils, pre-commit-hooks, v_flakes, ev_assets }:
    let
      # Private canonical sources baked into the frontend image. Deliberately NOT
      # flake inputs: as impure getFlake refs they carry no flake.lock entry and no
      # narHash, so they can never drift or fail a hash check — every build just
      # takes latest `main`. Costs `--impure`. Fetched over ssh (your key locally;
      # per-repo deploy keys on the release runner — see github.containerRelease).
      real_estate_allocation = builtins.getFlake "git+ssh://git@github.com/ev-invest/real_estate_allocation?ref=refs/heads/main";
      blog = builtins.getFlake "git+ssh://git@github.com/ev-invest/blog?ref=refs/heads/main";
      whitepaper = builtins.getFlake "git+ssh://git@github.com/ev-invest/whitepaper?ref=refs/heads/main";
    in
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
          allowUnfree = true;
        };
        # Canonical toolchain pinned in v_flakes — byte-identical across repos, so
        # the nix store dedups it and sccache cross-references compilations.
        rust = v_flakes.rs.default_nightly system;
        # Lean toolchain for the production backend image: rustc + cargo + std only.
        # Drops ~1.2 GB of dev tooling (rust-analyzer/docs/clippy/rustfmt/src) the
        # container build never touches. CI builds only the containers, so this keeps
        # the fat `rust` above out of the release closure entirely.
        rustBuild = pkgs.rust-bin.selectLatestNightlyWith (toolchain: toolchain.minimal);
        # v_flakes ships the treefmt hook; we extend it with the same `.#test`
        # derivation (typecheck + Playwright visual regression). Kept on pre-push,
        # not pre-commit — a full visual run per commit is too slow; flip `stages`
        # to ["pre-commit"] if you want it on every commit.
        preCommitBase = v_flakes.files.preCommit { inherit pkgs; };
        pre-commit-check = pre-commit-hooks.lib.${system}.run (preCommitBase // {
          hooks = preCommitBase.hooks // {
            test = {
              enable = true;
              name = "nix run .#test (typecheck + visual regression)";
              entry = "${runTestHook}/bin/run-test-hook";
              pass_filenames = false;
              stages = [ "pre-push" ];
            };
          };
        });
        pname = "site_conductor";
        # ── ev_invest dev topology (single source of truth for ports) ───────
        # ONE shared postgres serves every sibling repo (banking/concierge mirror
        # these values). Postgres database name == app name. Web UIs cluster on
        # 5006x. CABINET_FRONTEND_PORT is banking's cabinet and REA_PORT is
        # real_estate_allocation's dev server, referenced by CABINET_ZONE_URL /
        # REA_ZONE_URL for the multi-zone mounts.
        ports = {
          POSTGRES_PORT = "5432";
          SITE_CONDUCTOR_FRONTEND_PORT = "58843";
          SITE_CONDUCTOR_BACKEND_PORT = "58844";
          CABINET_FRONTEND_PORT = "50061";
          REA_PORT = "59079";
          # Concierge's auth web surface — /api/auth/* + /api/callback/auth/*
          # rewrite there (AUTH_WEB_URL); auth is shell-owned, zones never run OAuth.
          CONCIERGE_WEB_PORT = "55671";
        };
        # DEFAULTS, not overrides: anything already set in the environment (or a
        # sourced `.env`) wins — machines with non-standard ports stay working.
        portEnv = pkgs.lib.concatStrings (pkgs.lib.mapAttrsToList (n: v: "export ${n}=\"\${${n}:-${v}}\"\n") ports);
        backendCargo = (builtins.fromTOML (builtins.readFile ./backend/Cargo.toml)).package;
        # Deployed version, shown in the footer. CI passes the release tag via
        # BUILD_VERSION (needs --impure); pure builds fall back to the commit rev.
        buildVersion = let tag = builtins.getEnv "BUILD_VERSION"; in
          if tag != "" then tag else self.shortRev or self.dirtyShortRev or "dev";
        # Full commit the footer link points at — kept separate so the display
        # version can be a human tag without the link losing the exact rev.
        buildCommit = self.rev or self.dirtyRev or "";

        logoSrc = "${ev_assets}/logo/logo.svg";

        rs = v_flakes.rs { inherit pkgs rust; };
        github = v_flakes.github {
          inherit pkgs pname rs;
          enable = true;
          # Public repo → public Cachix (`ev-invest`); pull deps + push built paths.
          # Pushing needs the CACHIX_AUTH_TOKEN secret. See v_flakes cache.nix.
          cache = { cachix = "ev-invest"; };
          lastSupportedVersion = "nightly-2026-05-12";
          # The frontend image bakes private inputs (REA `embeds`, blog, whitepaper),
          # so the release runner needs read access to each — one read-only deploy key
          # per repo (provision: `git_ops init-deploy-key ev-invest/<repo>`).
          # refresh: private sources are getFlake "?ref=main" refs (off flake.lock); refresh
          # implies --impure AND --refresh so each release re-resolves them fresh (a warm nix
          # cache would otherwise bake a stale main). buildTiming: per-component build bar chart.
          containerRelease = { registry = "ghcr.io/ev-invest"; deployKeys = [ "ev-invest/real_estate_allocation" "ev-invest/blog" "ev-invest/whitepaper" ]; refresh = true; buildTiming = true; };
          gitignore.extra = ''
            ## generated by populate-docs; source imagery lives in frontend/assets/
            frontend/public/
            ## Node / Next.js
            node_modules/
            .next/
            .turbo/
            out/
            *.tsbuildinfo
            ## Env
            .env
            .env.local
            ## Playwright
            test-results/
            playwright-report/
            ## Local DB (nix run .#db / .#dev)
            .pg/
            ## LLMs
            AGENTS.md
            CLAUDE.md
            .claude/
            .pre-commit-config.yaml
          '';
          jobs = {
            warnings.augment = [ "tokei" "code-duplication" ];
            other.augment = [ "loc-badge" ];
          };
          lfs = true;
        };
        readme = v_flakes.readme-fw {
          inherit pkgs pname;
          repo = "ev-invest/site_conductor";
          defaults = true;
          lastSupportedVersion = "nightly-1.92";
          rootDir = ./.;
          # No crate is published yet (the backend is a placeholder), so keep only the badge that always resolves.
          badges = [ "msrv" ];
        };
        combined = v_flakes.utils.combine { inherit rust; modules = [ rs github readme ]; };

        # ── production backend: binary + OCI image ──────────────────────────
        rustPlatform = pkgs.makeRustPlatform { cargo = rustBuild; rustc = rustBuild; };
        backendSrc = pkgs.lib.cleanSourceWith {
          src = ./.;
          # .cargo holds dev-only accelerators (sccache rustc-wrapper, cranelift) that
          # the hermetic sandbox lacks — let nix's vendor config drive the build instead.
          filter = path: _type:
            ! builtins.elem (baseNameOf path) [ "target" "node_modules" ".pg" ".direnv" ".next" ".git" ".cargo" "frontend" "tmp" "docs" "result" ];
        };
        backendBin = rustPlatform.buildRustPackage {
          pname = backendCargo.name;
          version = backendCargo.version;
          src = backendSrc;
          cargoLock.lockFile = ./Cargo.lock;
          cargoBuildFlags = [ "-p" "backend" "--bin" "backend" ];
          # swagger feature fetches its UI bundle over the network, which the sandbox forbids.
          buildNoDefaultFeatures = true;
          # cmake/perl/bindgen → aws-lc-sys; openssl/pkg-config → sentry's native-tls.
          nativeBuildInputs = with pkgs; [ pkg-config cmake perl mold pkgs.rustPlatform.bindgenHook ];
          buildInputs = with pkgs; [ openssl ];
          doCheck = false;
        };
        # ── frontend production image (Next.js standalone) ──────────────────
        frontendApp = pkgs.buildNpmPackage {
          pname = "site_conductor-frontend";
          version = "1.0.0";
          src = ./frontend;
          # build node_modules straight from package-lock.json — no FOD hash to drift on release builds.
          npmDeps = pkgs.importNpmLock { npmRoot = ./frontend; };
          npmConfigHook = pkgs.importNpmLock.npmConfigHook;
          env = {
            NEXT_TELEMETRY_DISABLED = "1";
            NEXT_PUBLIC_BUILD_VERSION = buildVersion;
            NEXT_PUBLIC_BUILD_COMMIT = buildCommit;
            NEXT_PUBLIC_SITE_URL = "https://evinvest.ltd";
            NEXT_PUBLIC_REA_URL = "https://rea.evinvest.ltd";
            NEXT_PUBLIC_API_URL = "https://api.evinvest.ltd";
            # Zone/auth topology must be present at `next build`: rewrites() resolves
            # into routes-manifest.json here and is never re-evaluated at runtime, so
            # runtime-only env cannot enable the asset/API/auth rewrites (the /rea and
            # /cabinet HTML proxy handlers DO read env per request — the contract env
            # below feeds those). In-cluster service DNS, non-secret.
            CABINET_ZONE_URL = "http://ev-banking-cabinet:50061";
            REA_ZONE_URL = "http://real-estate-allocation:59079";
            AUTH_WEB_URL = "http://concierge:55671";
          };
          # call next build directly (npm run build chains stylelint, a CI gate that shouldn't fail the image).
          buildPhase = ''
            runHook preBuild
            mkdir -p public/assets public/mfe public/blogs
            cp -rL --no-preserve=mode assets/. public/assets/
            cp -f --no-preserve=mode ${logoSrc} public/assets/logo.svg
            cp -rL --no-preserve=mode ${real_estate_allocation.packages.${system}.embeds}/. public/mfe/
            wp=${whitepaper.packages.${system}.default}
            cp -f --no-preserve=mode "$wp/whitepaper.pdf" "$wp/whitepaper.light.html" "$wp/whitepaper.dark.html" public/
            for dir in ${blog.packages.${system}.default}/*/; do
              slug="$(basename "$dir")"
              cp -f --no-preserve=mode "$dir/main.pdf"        "public/blogs/$slug.pdf"
              cp -f --no-preserve=mode "$dir/main.light.html" "public/blogs/$slug.light.html"
              cp -f --no-preserve=mode "$dir/main.dark.html"  "public/blogs/$slug.dark.html"
            done
            # The AppShell (THE header — the only one; zones are chromeless and the
            # proxy injects this over their HTML) is generated, never committed:
            # skipping this step must fail `next build` at the manifest import.
            node_modules/.bin/tsx scripts/build-shell.mts
            node_modules/.bin/next build
            runHook postBuild
          '';
          installPhase = ''
            runHook preInstall
            mkdir -p $out
            cp -r .next/standalone/. $out/
            cp -r .next/static $out/.next/static
            cp -r public $out/public
            runHook postInstall
          '';
          dontNpmInstall = true;
        };

        # Separate containers so each rolls out independently — a frontend deploy never touches the API. DATABASE_URL comes from the k8s Secret, not baked in.
        containerStd = v_flakes.container.implement {
          inherit pkgs pname;
          containers.backend = {
            port = 58844;
            healthPath = "/api/v1/health";
            criticality = "high";
            entrypoint = [ "/bin/backend" ];
            contents = [ backendBin ];
            imageEnv = [ "BIND_ADDR=0.0.0.0:58844" "APP_ENV=production" ];
          };
          containers.frontend = {
            port = 58843;
            healthPath = "/";
            criticality = "high";
            entrypoint = [ "${pkgs.nodejs}/bin/node" "${frontendApp}/server.js" ];
            contents = [ pkgs.nodejs frontendApp ];
            workingDir = "${frontendApp}";
            imageEnv = [ "PORT=58843" "HOSTNAME=0.0.0.0" "NODE_ENV=production" ];
            # Runtime halves of the zone mounts (the HTML proxy handlers read these
            # per request); the build-time copies above own the baked rewrites.
            env = {
              CABINET_ZONE_URL = "http://ev-banking-cabinet:50061";
              REA_ZONE_URL = "http://real-estate-allocation:59079";
              AUTH_WEB_URL = "http://concierge:55671";
              # config.ts reads env dynamically (process.env[name]), so nothing is
              # inlined server-side: every dynamic render (ISR revalidate, RSC nav,
              # cookied request) needs these at RUNTIME too — build-time env only
              # covers the prerender. Missing ⇒ module-eval throw ⇒ 500.
              NEXT_PUBLIC_API_URL = "https://api.evinvest.ltd";
              NEXT_PUBLIC_SITE_URL = "https://evinvest.ltd";
              NEXT_PUBLIC_REA_URL = "https://rea.evinvest.ltd";
              # Server Component fetches stay in-cluster instead of hairpinning
              # through the Cloudflare tunnel.
              API_URL_INTERNAL = "http://site-conductor-backend:58844";
            };
          };
        };

        # ── shared shims ────────────────────────────────────────────────────
        # macOS rust-lld looks for libLLVM.dylib in bin/../lib/; Nix puts it in lib/. FALLBACK only kicks in when normal resolution fails.
        dyldFallback = ''export DYLD_FALLBACK_LIBRARY_PATH="${rust}/lib''${DYLD_FALLBACK_LIBRARY_PATH:+:$DYLD_FALLBACK_LIBRARY_PATH}"'';
        protocEnv = ''export PROTOC="${pkgs.protobuf}/bin/protoc"'';

        # ── populate frontend/public/ from sibling clones (best-effort, idempotent) ──
        populateDocs = pkgs.writeShellApplication {
          name = "populate-docs";
          runtimeInputs = with pkgs; [ git nix coreutils flock ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            # shellHook, run-frontend and run-test all invoke this; two instances
            # racing in public/ mid rm/cp swap fail with EEXIST/EACCES — serialize.
            exec 9>"$repo/.git/populate-docs.lock"
            flock 9
            pub="$repo/frontend/public"
            # Sources live in the read-only nix store; a prior copy leaves 0444 files
            # and 0555 dirs behind. Heal write bits before touching anything so rm/cp
            # can overwrite — otherwise cp fails with "Permission denied"/"File exists".
            chmod -R u+w "$pub" 2>/dev/null || true
            mkdir -p "$pub/assets" "$pub/blogs"
            cp -rL --no-preserve=mode "$repo/frontend/assets/." "$pub/assets/"
            cp -f --no-preserve=mode ${logoSrc} "$pub/assets/logo.svg"

            wp=""
            if [ -d "$repo/../whitepaper" ]; then
              wp="$(nix build "$repo/../whitepaper" --no-link --print-out-paths 2>/dev/null || true)"
              [ -n "$wp" ] || echo "warn: whitepaper build failed — /whitepaper will degrade" >&2
            else
              echo "warn: ../whitepaper not checked out — /whitepaper will degrade" >&2
            fi
            if [ -n "$wp" ]; then
              [ -e "$wp/whitepaper.pdf" ]        && cp -f --no-preserve=mode "$wp/whitepaper.pdf"        "$pub/whitepaper.pdf"
              [ -e "$wp/whitepaper.light.html" ] && cp -f --no-preserve=mode "$wp/whitepaper.light.html" "$pub/whitepaper.light.html"
              [ -e "$wp/whitepaper.dark.html" ]  && cp -f --no-preserve=mode "$wp/whitepaper.dark.html"  "$pub/whitepaper.dark.html"
            fi

            bl=""
            if [ -d "$repo/../blog" ]; then
              bl="$(nix build "$repo/../blog" --no-link --print-out-paths 2>/dev/null || true)"
              [ -n "$bl" ] || echo "warn: blog build failed — /blogs will degrade" >&2
            else
              echo "warn: ../blog not checked out — /blogs will degrade" >&2
            fi
            if [ -n "$bl" ]; then
              for dir in "$bl"/*/; do
                [ -d "$dir" ] || continue
                slug="$(basename "$dir")"
                [ -e "$dir/main.pdf" ]        && cp -f --no-preserve=mode "$dir/main.pdf"        "$pub/blogs/''${slug}.pdf"
                [ -e "$dir/main.light.html" ] && cp -f --no-preserve=mode "$dir/main.light.html" "$pub/blogs/''${slug}.light.html"
                [ -e "$dir/main.dark.html" ]  && cp -f --no-preserve=mode "$dir/main.dark.html"  "$pub/blogs/''${slug}.dark.html"
              done
            fi

            # Real-estate MFE — served same-origin at /mfe by the host.
            mfe=""
            if [ -d "$repo/../real_estate_allocation" ]; then
              mfe="$(nix build "$repo/../real_estate_allocation#embeds" --no-link --print-out-paths 2>/dev/null || true)"
              [ -n "$mfe" ] || echo "warn: real-estate embed build failed — portfolio MFE will degrade" >&2
            else
              echo "warn: ../real_estate_allocation not checked out — portfolio MFE will degrade" >&2
            fi
            if [ -n "$mfe" ]; then
              # chmod heals any read-only tree a pre-fix copy left, so rm can clear it.
              chmod -R u+w "$pub/mfe" 2>/dev/null || true; rm -rf "$pub/mfe"; mkdir -p "$pub/mfe"
              cp -rfL --no-preserve=mode "$mfe"/. "$pub/mfe/"
            fi
          '';
        };

        # ── frontend (Next.js marketing site) ───────────────────────────────
        runFrontend = pkgs.writeShellApplication {
          name = "run-frontend";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            ${populateDocs}/bin/populate-docs || true
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo/frontend"
            [ -d node_modules/next ] || npm install
            ${portEnv}
            export NEXT_PUBLIC_API_URL="''${NEXT_PUBLIC_API_URL:-http://localhost:$SITE_CONDUCTOR_BACKEND_PORT}"
            export CABINET_ZONE_URL="''${CABINET_ZONE_URL:-http://localhost:$CABINET_FRONTEND_PORT}"
            export REA_ZONE_URL="''${REA_ZONE_URL:-http://localhost:$REA_PORT}"
            export AUTH_WEB_URL="''${AUTH_WEB_URL:-http://localhost:$CONCIERGE_WEB_PORT}"
            exec npm run dev -- --port "$SITE_CONDUCTOR_FRONTEND_PORT"
          '';
        };

        # ── backend (Axum API) ──────────────────────────────────────────────
        # Ensures the shared Postgres is up, then boots. Topology defaults come
        # from the flake; anything already set in the environment or backend/.env wins.
        runBackend = pkgs.writeShellApplication {
          name = "run-backend";
          runtimeInputs = with pkgs; [ rust git ];
          text = ''
            ${dyldFallback}
            ${runPostgres}/bin/run-postgres
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo"

            set -a
            if [ -f backend/.env ]; then
              # shellcheck disable=SC1091
              . backend/.env
            fi
            set +a

            ${portEnv}
            export DATABASE_URL="''${DATABASE_URL:-postgres://postgres@localhost:$POSTGRES_PORT/site_conductor}"
            export BIND_ADDR="''${BIND_ADDR:-0.0.0.0:$SITE_CONDUCTOR_BACKEND_PORT}"
            export RUST_LOG="''${RUST_LOG:-info,backend=debug}"
            export APP_ENV="''${APP_ENV:-development}"
            exec cargo run -p backend
          '';
        };

        # ── shared Postgres (ensure-running) ────────────────────────────────
        # ONE trust-auth cluster for all ev_invest repos, under the user state dir —
        # NOT the repo. Started detached so no repo's dev-stack exit yanks it out from
        # under the siblings; each repo's runner only ensures its own databases exist
        # (database name == app name). Stop: pg_ctl -D ~/.local/state/ev_invest/pg/data stop
        runPostgres = pkgs.writeShellApplication {
          name = "run-postgres";
          runtimeInputs = with pkgs; [ postgresql coreutils gnugrep util-linux ];
          text = ''
            ${portEnv}
            state="''${XDG_STATE_HOME:-$HOME/.local/state}/ev_invest"
            export PGDATA="$state/pg/data"
            sockets="$state/pg/sockets"
            dbs="''${PGDATABASES:-site_conductor}"
            mkdir -p "$sockets"

            # Serialize sibling repos racing to first-boot the shared cluster.
            exec 9>"$state/pg.lock"
            flock 9

            if ! pg_isready --host="$sockets" --port="$POSTGRES_PORT" --quiet; then
              # TCP answering while our socket is silent = some OTHER cluster owns
              # the port — refuse rather than silently use the wrong database.
              if pg_isready --host=127.0.0.1 --port="$POSTGRES_PORT" --quiet; then
                echo "error: 127.0.0.1:$POSTGRES_PORT serves a postgres that is not the shared ev_invest cluster" >&2
                exit 1
              fi
              if [ ! -s "$PGDATA/PG_VERSION" ]; then
                echo "initialising shared postgres cluster in $PGDATA"
                initdb --username=postgres --auth=trust --pgdata="$PGDATA" >/dev/null
              fi
              chmod 0700 "$PGDATA"
              # 9>&- : the daemon must NOT inherit the lock fd, or it holds the
              # flock for its lifetime and every later ensure-run blocks forever.
              pg_ctl -D "$PGDATA" -l "$state/pg/log" -o "-k $sockets -h 127.0.0.1 -p $POSTGRES_PORT" start 9>&-
            fi
            exec 9>&-

            for db in $dbs; do
              if ! psql --host="$sockets" --port="$POSTGRES_PORT" --username=postgres --dbname=postgres \
                     --tuples-only --no-align \
                     --command "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
                createdb --host="$sockets" --port="$POSTGRES_PORT" --username=postgres "$db"
                echo "created database '$db'"
              fi
            done
            echo "postgres ready on 127.0.0.1:$POSTGRES_PORT (databases ensured: $dbs)"
          '';
        };

        # ── dev refresh from prod ───────────────────────────────────────────
        # `nix run .#pull-prod-db` → replace the local site_conductor database
        # with prod's (the `evinvest` db on rpi5's host Postgres, reached over
        # tailscale). Prod is authoritative; dev only pulls. Trust auth on both
        # ends, so no passwords; local pg_restore (17.10) ≥ remote pg_dump (17.9)
        # keeps the custom-format stream compatible.
        runPullProdDb = pkgs.writeShellApplication {
          name = "pull-prod-db";
          runtimeInputs = with pkgs; [ postgresql openssh ];
          text = ''
            ${portEnv}
            ${runPostgres}/bin/run-postgres
            rpi5="''${RPI5_SSH:-rpi5-ts}"
            echo "▶ pg_dump on $rpi5 → pg_restore into local site_conductor"
            ssh "$rpi5" "pg_dump -Fc -h 127.0.0.1 -U evinvest evinvest" \
              | pg_restore --clean --if-exists --no-owner --no-privileges \
                  -h 127.0.0.1 -p "$POSTGRES_PORT" -U postgres -d site_conductor
            echo "✓ local site_conductor now mirrors prod"
          '';
        };

        # ── contract codegen: openapi.json + TS client. Run after any DTO/handler change; commit both. ──
        runGenApi = pkgs.writeShellApplication {
          name = "run-gen-api";
          runtimeInputs = with pkgs; [ rust nodejs git ];
          text = ''
            ${dyldFallback}
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo"
            echo "▶ dumping OpenAPI spec → backend/openapi.json"
            cargo run --quiet --bin gen_openapi > backend/openapi.json
            echo "▶ generating TS client → frontend/shared/api/generated"
            cd frontend
            [ -d node_modules/.bin ] || npm install
            npm run gen:api
          '';
        };

        # ── dev orchestrator ────────────────────────────────────────────────
        # Ensures the SHARED postgres (detached, survives this stack), then owns
        # backend + frontend; a single trap tears the owned tree down on exit.
        runDev = pkgs.writeShellApplication {
          name = "run-dev";
          runtimeInputs = with pkgs; [ coreutils ];
          text = ''
            ${portEnv}
            pids=()
            cleanup() {
              echo; echo "shutting down dev stack…"
              [ ''${#pids[@]} -gt 0 ] && kill "''${pids[@]}" 2>/dev/null || true
              wait 2>/dev/null || true
            }
            trap cleanup EXIT INT TERM

            echo "▶ postgres (shared)"
            ${runPostgres}/bin/run-postgres

            echo "▶ backend  (:$SITE_CONDUCTOR_BACKEND_PORT)"
            ${runBackend}/bin/run-backend & pids+=($!)
            echo "▶ frontend (:$SITE_CONDUCTOR_FRONTEND_PORT)"
            ${runFrontend}/bin/run-frontend & pids+=($!)

            wait
          '';
        };

        # ── zone-shell manifest regen (pre-commit hook) ─────────────────────
        # ── test suite: frontend typecheck + Playwright visual regression ───
        # No Rust tests exist yet; add `cargo test --workspace` here when they do.
        runTest = pkgs.writeShellApplication {
          name = "run-test";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            ${populateDocs}/bin/populate-docs || true
            cd "$repo/frontend"
            [ -d node_modules/.bin ] || npm ci

            # tsc resolves the (gitignored) generated manifest import.
            npx tsx scripts/build-shell.mts

            echo "▶ typecheck (tsc --noEmit)"
            npm run check

            echo "▶ visual regression (playwright)"
            ${portEnv}
            export NEXT_PUBLIC_API_URL="''${NEXT_PUBLIC_API_URL:-http://localhost:$SITE_CONDUCTOR_BACKEND_PORT}"
            # The nixpkgs browsers — npm-downloaded ones link libs absent on NixOS.
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"
            export PLAYWRIGHT_HOST_PLATFORM_OVERRIDE="nixos"
            exec npm run test:visual
          '';
        };

        # pre-push wrapper: run the (slow) visual suite only when pushing a protected
        # ref / tag, and skip even then if the pushed tip's tree matches the remote's
        # (a squash/reword that leaves content identical can't change a screenshot).
        # pre-commit sets REMOTE_BRANCH/FROM_REF/TO_REF on pre-push.
        runTestHook = pkgs.writeShellApplication {
          name = "run-test-hook";
          runtimeInputs = with pkgs; [ git ];
          text = ''
            # Only gate the protected refs / releases; feature-branch pushes run nothing.
            case "''${PRE_COMMIT_REMOTE_BRANCH:-}" in
              refs/heads/main|refs/heads/dev|refs/heads/release|refs/tags/*) ;;
              *) echo "not a protected ref / tag — skipping visual regression"; exit 0 ;;
            esac

            from="''${PRE_COMMIT_FROM_REF:-}"
            to="''${PRE_COMMIT_TO_REF:-}"
            # Missing refs (new branch / refs unavailable) → don't skip; run the suite.
            if [ -n "$from" ] && [ -n "$to" ] && git rev-parse -q --verify "$from^{tree}" >/dev/null 2>&1; then
              if [ "$(git rev-parse "$from^{tree}")" = "$(git rev-parse "$to^{tree}")" ]; then
                echo "tip tree unchanged since remote — skipping visual regression"
                exit 0
              fi
            fi
            exec ${runTest}/bin/run-test
          '';
        };

        # ── accept new screenshots: `.#accept-test` (all) or with -- <names> ──
        runAcceptTest = pkgs.writeShellApplication {
          name = "accept-test";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo/frontend"
            [ -d node_modules/.bin ] || npm ci
            ${portEnv}
            export NEXT_PUBLIC_API_URL="''${NEXT_PUBLIC_API_URL:-http://localhost:$SITE_CONDUCTOR_BACKEND_PORT}"
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"
            export PLAYWRIGHT_HOST_PLATFORM_OVERRIDE="nixos"
            if [ "$#" -eq 0 ]; then
              exec npm run test:visual:update
            fi
            # playwright -g takes one regex; alternate the names so multiple match.
            exec npm run test:visual:update -- -g "$(IFS='|'; echo "$*")"
          '';
        };

        # ── bump latest remote vX.Y.Z tag and push: `.#publish major|minor|patch` ──
        runPublish = pkgs.writeShellApplication {
          name = "publish";
          runtimeInputs = with pkgs; [ git ];
          text = ''
                        part="''${1:-}"
                        case "$part" in major|minor|patch) ;; *) echo "usage: nix run .#publish -- major|minor|patch" >&2; exit 1 ;; esac
                        [ -z "$(git status --porcelain)" ] || { echo "uncommitted changes — commit or stash first" >&2; exit 1; }

                        git fetch --tags --force origin >/dev/null 2>&1
                        last="$(git tag -l 'v*' --sort=-v:refname | head -n1)"
                        ver="''${last#v}"; [ -n "$ver" ] || ver="0.0.0"
                        IFS=. read -r ma mi pa <<EOF
            $ver
            EOF
                        case "$part" in
                          major) ma=$((ma+1)); mi=0; pa=0 ;;
                          minor) mi=$((mi+1)); pa=0 ;;
                          patch) pa=$((pa+1)) ;;
                        esac
                        next="v$ma.$mi.$pa"
                        echo "$last → $next"
                        git tag "$next"
                        git push origin "$next"
          '';
        };
      in
      {
        # `nix run .#dev`      → ensures shared Postgres, then backend + frontend
        # `nix run .#frontend` → Next.js marketing site (:$SITE_CONDUCTOR_FRONTEND_PORT)
        # `nix run .#backend`  → Axum API only (:$SITE_CONDUCTOR_BACKEND_PORT; ensures the shared DB)
        # `nix run .#db`       → ensure the SHARED ev_invest Postgres is up (+ this repo's databases)
        # `nix run .#gen-api`  → regenerate openapi.json + the TS client
        # `nix run .#test`     → frontend typecheck + Playwright visual regression
        # `nix run .#accept-test` → accept new screenshots (all, or `-- <names>`)
        # `nix run .#publish`  → bump latest remote vX.Y.Z tag (major|minor|patch) + push
        # `nix run .#pull-prod-db` → replace the local site_conductor db with prod's (rpi5)
        apps = {
          dev = { type = "app"; program = "${runDev}/bin/run-dev"; };
          frontend = { type = "app"; program = "${runFrontend}/bin/run-frontend"; };
          backend = { type = "app"; program = "${runBackend}/bin/run-backend"; };
          db = { type = "app"; program = "${runPostgres}/bin/run-postgres"; };
          pull-prod-db = { type = "app"; program = "${runPullProdDb}/bin/pull-prod-db"; };
          gen-api = { type = "app"; program = "${runGenApi}/bin/run-gen-api"; };
          test = { type = "app"; program = "${runTest}/bin/run-test"; };
          accept-test = { type = "app"; program = "${runAcceptTest}/bin/accept-test"; };
          publish = { type = "app"; program = "${runPublish}/bin/publish"; };
        };

        packages = {
          default = backendBin;
          backend = backendBin;
        } // containerStd.packages;

        containers = containerStd.containers;

        devShells.default =
          with pkgs;
          mkShell {
            shellHook =
              ''
                if [ "$(nix config show lazy-trees 2>/dev/null)" != true ]; then
                  printf '%s\n' \
                    "✘ This repo requires Determinate Nix with lazy-trees=true." \
                    "  Stock nix produces flake.lock NAR hashes that diverge from CI (private inputs fail to verify)." \
                    "  Install: https://determinate.systems/nix   NixOS: nix.settings.lazy-trees = true" >&2
                  exit 1
                fi
              ''
              + pre-commit-check.shellHook
              + combined.shellHook
              + ''
                cp -f ${(v_flakes.files.treefmt) { inherit pkgs; }} ./.treefmt.toml
                ${populateDocs}/bin/populate-docs || true

                ${dyldFallback}
                ${protocEnv}
              '';

            packages = [
              nodejs
              openssl
              pkg-config
              protobuf
              clang-tools
              rust
              mold
              postgresql
              playwright-driver.browsers
            ] ++ pre-commit-check.enabledPackages ++ combined.enabledPackages;

            env.RUST_BACKTRACE = 1;
            env.RUST_LIB_BACKTRACE = 0;

            # Drive the nixpkgs browsers (npm-downloaded ones link libs absent on NixOS). @playwright/test version MUST match playwright-driver's.
            env.PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
            env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE = "nixos";
          };
      }
    );
}
