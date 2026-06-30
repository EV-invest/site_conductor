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
    ev_assets = { url = "github:EV-invest/assets"; flake = false; };
    # Private canonical sources, baked into the frontend image. Locally these resolve
    # with your own ssh key; the release runner reads them via per-repo deploy keys
    # (containerRelease.deployKeys), provisioned by `git_ops init-deploy-key`.
    real_estate_allocation.url = "git+ssh://git@github.com/ev-invest/real_estate_allocation";
    real_estate_allocation.inputs.nixpkgs.follows = "nixpkgs";
    real_estate_allocation.inputs.rust-overlay.follows = "rust-overlay";
    real_estate_allocation.inputs.pre-commit-hooks.follows = "pre-commit-hooks";
    blog.url = "git+ssh://git@github.com/ev-invest/blog";
    blog.inputs.nixpkgs.follows = "nixpkgs";
    blog.inputs.v-utils.inputs.nixpkgs.follows = "nixpkgs";
    blog.inputs.v-utils.inputs.rust-overlay.follows = "rust-overlay";
    whitepaper.url = "git+ssh://git@github.com/ev-invest/whitepaper";
    whitepaper.inputs.nixpkgs.follows = "nixpkgs";
    whitepaper.inputs.v_flakes.follows = "v_flakes";
  };
  outputs = { self, nixpkgs, rust-overlay, flake-utils, pre-commit-hooks, v_flakes, ev_assets, real_estate_allocation, blog, whitepaper }:
    let
      # real_estate_allocation keeps its own v_flakes (forcing `follows` swaps its API and drops `embeds`).
      # But if its pin drifts from ours, nixpkgs+rust-overlay duplicate silently — so fail loudly instead.
      lock = builtins.fromJSON (builtins.readFile ./flake.lock);
      vfRevOf = node: lock.nodes.${lock.nodes.${node}.inputs.v_flakes}.locked.rev;
      rootVf = vfRevOf lock.root;
      reaVf = vfRevOf lock.nodes.${lock.root}.inputs.real_estate_allocation;
    in
    assert nixpkgs.lib.assertMsg (rootVf == reaVf)
      "v_flakes drift (root ${builtins.substring 0 8 rootVf} vs REA ${builtins.substring 0 8 reaVf}). Fix: in real_estate_allocation run `nix flake update v_flakes` and push, then here `nix flake update real_estate_allocation`.";
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
          allowUnfree = true;
        };
        #NB: can't load rust-bin from nightly.latest, as there are week guarantees of which components will be available on each day.
        rust = pkgs.rust-bin.selectLatestNightlyWith (toolchain: toolchain.default.override {
          extensions = [ "rust-src" "rust-analyzer" "rust-docs" "rustc-codegen-cranelift-preview" ];
          targets = [ "wasm32-unknown-unknown" ];
        });
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
              entry = "${runTest}/bin/run-test";
              pass_filenames = false;
              stages = [ "pre-push" ];
            };
          };
        });
        pname = "landing";
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
          lastSupportedVersion = "nightly-2026-05-12";
          # The frontend image bakes private inputs (REA `embeds`, blog, whitepaper),
          # so the release runner needs read access to each — one read-only deploy key
          # per repo (provision: `git_ops init-deploy-key ev-invest/<repo>`).
          containerRelease = { registry = "ghcr.io/EV-invest"; deployKeys = [ "ev-invest/real_estate_allocation" "ev-invest/blog" "ev-invest/whitepaper" ]; };
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
          repo = "EV-invest/landing";
          defaults = true;
          lastSupportedVersion = "nightly-1.92";
          rootDir = ./.;
          # No crate is published yet (the backend is a placeholder), so keep only the badge that always resolves.
          badges = [ "msrv" ];
        };
        combined = v_flakes.utils.combine { inherit rust; modules = [ rs github readme ]; };

        # ── production backend: binary + OCI image ──────────────────────────
        rustPlatform = pkgs.makeRustPlatform { cargo = rust; rustc = rust; };
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
          pname = "landing-frontend";
          version = "1.0.0";
          src = ./frontend;
          npmDepsHash = "sha256-VeEqSU8km3V5JVfkN5k42/A9LtlFxYmIev04z13z9tU=";
          env = {
            NEXT_TELEMETRY_DISABLED = "1";
            NEXT_PUBLIC_BUILD_VERSION = buildVersion;
            NEXT_PUBLIC_BUILD_COMMIT = buildCommit;
            NEXT_PUBLIC_SITE_URL = "https://evinvest.ltd";
            NEXT_PUBLIC_REA_URL = "https://rea.evinvest.ltd";
            NEXT_PUBLIC_API_URL = "https://api.evinvest.ltd";
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
          };
        };

        # ── shared shims ────────────────────────────────────────────────────
        # macOS rust-lld looks for libLLVM.dylib in bin/../lib/; Nix puts it in lib/. FALLBACK only kicks in when normal resolution fails.
        dyldFallback = ''export DYLD_FALLBACK_LIBRARY_PATH="${rust}/lib''${DYLD_FALLBACK_LIBRARY_PATH:+:$DYLD_FALLBACK_LIBRARY_PATH}"'';
        protocEnv = ''export PROTOC="${pkgs.protobuf}/bin/protoc"'';

        # ── populate frontend/public/ from sibling clones (best-effort, idempotent) ──
        populateDocs = pkgs.writeShellApplication {
          name = "populate-docs";
          runtimeInputs = with pkgs; [ git nix coreutils ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            pub="$repo/frontend/public"
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
              cp -rL --no-preserve=mode "$mfe"/. "$pub/mfe/"
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
            exec npm run dev
          '';
        };

        # ── backend (Axum API) — needs a Postgres (`.#db` or `.#dev`) ───────
        runBackend = pkgs.writeShellApplication {
          name = "run-backend";
          runtimeInputs = with pkgs; [ rust git ];
          text = ''
            ${dyldFallback}
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo"
            export DATABASE_URL="''${DATABASE_URL:-postgres://postgres@localhost:5432/ev_landing}"
            export BIND_ADDR="''${BIND_ADDR:-0.0.0.0:58844}"
            export RUST_LOG="''${RUST_LOG:-info,backend=debug}"
            export APP_ENV="''${APP_ENV:-development}"
            exec cargo run -p backend
          '';
        };

        # ── local Postgres — cluster under .pg/, listens on 127.0.0.1:5432 ──
        runPostgres = pkgs.writeShellApplication {
          name = "run-postgres";
          runtimeInputs = with pkgs; [ postgresql git coreutils gnugrep ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            export PGDATA="$repo/.pg/data"
            sockets="$repo/.pg/sockets"
            port="''${PGPORT:-5432}"
            db="''${PGDATABASE:-ev_landing}"

            mkdir -p "$sockets"
            if [ ! -s "$PGDATA/PG_VERSION" ]; then
              echo "initialising postgres cluster in $PGDATA"
              initdb --username=postgres --auth=trust --pgdata="$PGDATA" >/dev/null
            fi
            # Postgres refuses to start unless PGDATA is 0700/0750 — clamp it.
            chmod 0700 "$PGDATA"

            (
              until pg_isready --host="$sockets" --port="$port" --quiet; do sleep 0.2; done
              if ! psql --host="$sockets" --port="$port" --username=postgres --dbname=postgres \
                     --tuples-only --no-align \
                     --command "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
                createdb --host="$sockets" --port="$port" --username=postgres "$db"
                echo "created database '$db'"
              fi
              echo "postgres ready on 127.0.0.1:$port (db '$db', user 'postgres', trust auth)"
            ) &

            exec postgres -D "$PGDATA" -k "$sockets" -h 127.0.0.1 -p "$port"
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

        # ── dev orchestrator: Postgres → backend → frontend, one trap tears it all down ──
        runDev = pkgs.writeShellApplication {
          name = "run-dev";
          runtimeInputs = with pkgs; [ postgresql git coreutils ];
          text = ''
            pids=()
            cleanup() {
              echo; echo "shutting down dev stack…"
              [ ''${#pids[@]} -gt 0 ] && kill "''${pids[@]}" 2>/dev/null || true
              wait 2>/dev/null || true
            }
            trap cleanup EXIT INT TERM

            echo "▶ postgres"
            ${runPostgres}/bin/run-postgres & pids+=($!)

            echo "  waiting for postgres on 127.0.0.1:''${PGPORT:-5432}…"
            until pg_isready --host=127.0.0.1 --port="''${PGPORT:-5432}" --quiet; do sleep 0.3; done

            echo "▶ backend  (:58844)"
            ${runBackend}/bin/run-backend & pids+=($!)
            echo "▶ frontend (:58843)"
            ${runFrontend}/bin/run-frontend & pids+=($!)

            wait
          '';
        };

        # ── test suite: frontend typecheck + Playwright visual regression ───
        # No Rust tests exist yet; add `cargo test --workspace` here when they do.
        runTest = pkgs.writeShellApplication {
          name = "run-test";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            ${populateDocs}/bin/populate-docs || true
            cd "$repo/frontend"
            [ -d node_modules/.bin ] || npm install

            echo "▶ typecheck (tsc --noEmit)"
            npm run check

            echo "▶ visual regression (playwright)"
            # The nixpkgs browsers — npm-downloaded ones link libs absent on NixOS.
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"
            export PLAYWRIGHT_HOST_PLATFORM_OVERRIDE="nixos"
            exec npm run test:visual
          '';
        };

        # ── accept new screenshots: `.#accept-test` (all) or with -- <names> ──
        runAcceptTest = pkgs.writeShellApplication {
          name = "accept-test";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo/frontend"
            [ -d node_modules/.bin ] || npm install
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
      in
      {
        # `nix run .#dev`      → Postgres + backend + frontend
        # `nix run .#frontend` → Next.js marketing site (:58843)
        # `nix run .#backend`  → Axum API only (:58844, needs a DB: `.#db` or `.#dev`)
        # `nix run .#db`       → local Postgres only (:5432)
        # `nix run .#gen-api`  → regenerate openapi.json + the TS client
        # `nix run .#test`     → frontend typecheck + Playwright visual regression
        # `nix run .#accept-test` → accept new screenshots (all, or `-- <names>`)
        apps = {
          dev = { type = "app"; program = "${runDev}/bin/run-dev"; };
          frontend = { type = "app"; program = "${runFrontend}/bin/run-frontend"; };
          backend = { type = "app"; program = "${runBackend}/bin/run-backend"; };
          db = { type = "app"; program = "${runPostgres}/bin/run-postgres"; };
          gen-api = { type = "app"; program = "${runGenApi}/bin/run-gen-api"; };
          test = { type = "app"; program = "${runTest}/bin/run-test"; };
          accept-test = { type = "app"; program = "${runAcceptTest}/bin/accept-test"; };
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
