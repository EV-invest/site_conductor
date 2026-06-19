{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
    pre-commit-hooks.url = "github:cachix/git-hooks.nix";
    v_flakes.url = "github:valeratrades/v_flakes?ref=v1.6";
  };
  outputs = { self, nixpkgs, rust-overlay, flake-utils, pre-commit-hooks, v_flakes }:
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
        pre-commit-check = pre-commit-hooks.lib.${system}.run (v_flakes.files.preCommit { inherit pkgs; });
        pname = "landing";

        rs = v_flakes.rs { inherit pkgs rust; };
        github = v_flakes.github {
          inherit pkgs pname rs;
          enable = true;
          lastSupportedVersion = "nightly-2026-05-12";
          gitignore.extra = ''
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
          # No crate is published yet (the backend is a placeholder), so keep only
          # the badge that always resolves.
          badges = [ "msrv" ];
        };
        combined = v_flakes.utils.combine { inherit rust; modules = [ rs github readme ]; };

        # ── shared shims ────────────────────────────────────────────────────
        # rust-lld (wasm32 linker) embeds the wrong rpath on macOS — it looks for
        # libLLVM.dylib in bin/../lib/ but Nix puts it one level up in lib/. The
        # FALLBACK var only kicks in when normal resolution fails. Kept ready for
        # the Rust backend that grows under backend/.
        dyldFallback = ''export DYLD_FALLBACK_LIBRARY_PATH="${rust}/lib''${DYLD_FALLBACK_LIBRARY_PATH:+:$DYLD_FALLBACK_LIBRARY_PATH}"'';
        # tonic-build / prost-build shell out to protoc; point them at nixpkgs'.
        protocEnv = ''export PROTOC="${pkgs.protobuf}/bin/protoc"'';

        # ── frontend (Next.js marketing site) ───────────────────────────────
        # Standalone npm app under frontend/. `npm install` generates/updates the
        # lockfile and installs into frontend/node_modules on first run.
        runFrontend = pkgs.writeShellApplication {
          name = "run-frontend";
          runtimeInputs = with pkgs; [ nodejs git ];
          text = ''
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo/frontend"
            [ -d node_modules/next ] || npm install
            exec npm run dev
          '';
        };

        # ── backend (Axum API) ──────────────────────────────────────────────
        # Needs a Postgres (use `.#db` or `.#dev`). Every other integration
        # (SMTP, Sentry, PostHog) is a no-op until its env is set, so the bare
        # default just boots against the local trust-auth cluster.
        runBackend = pkgs.writeShellApplication {
          name = "run-backend";
          runtimeInputs = with pkgs; [ rust git ];
          text = ''
            ${dyldFallback}
            repo="$(git rev-parse --show-toplevel)"
            cd "$repo"
            export DATABASE_URL="''${DATABASE_URL:-postgres://postgres@localhost:5432/ev_landing}"
            export BIND_ADDR="''${BIND_ADDR:-0.0.0.0:8080}"
            export RUST_LOG="''${RUST_LOG:-info,backend=debug}"
            export APP_ENV="''${APP_ENV:-development}"
            exec cargo run -p backend
          '';
        };

        # ── local Postgres ──────────────────────────────────────────────────
        # Project-local dev database. Cluster data + unix sockets live under
        # .pg/ at the repo root (gitignored). First run initdb's a trust-auth
        # cluster and creates `ev_landing`; later runs just start the server.
        # Listens on 127.0.0.1:5432 — matches backend/.env.example.
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

        # ── contract codegen ────────────────────────────────────────────────
        # `nix run .#gen-api` → dump the Rust/utoipa OpenAPI spec to
        # backend/openapi.json, then regenerate the TS client from it. Run after
        # changing any DTO or handler signature; commit both the spec and client.
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
        # `nix run .#dev` → Postgres + backend + frontend. Postgres starts first;
        # the backend launches once it accepts connections. One trap tears the
        # whole tree down on Ctrl-C / exit.
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

            echo "▶ backend  (:8080)"
            ${runBackend}/bin/run-backend & pids+=($!)
            echo "▶ frontend (:3001)"
            ${runFrontend}/bin/run-frontend & pids+=($!)

            wait
          '';
        };
      in
      {
        # `nix run .#dev`      → Postgres + backend + frontend
        # `nix run .#frontend` → Next.js marketing site (:3001)
        # `nix run .#backend`  → Axum API only (:8080, needs a DB: `.#db` or `.#dev`)
        # `nix run .#db`       → local Postgres only (:5432)
        # `nix run .#gen-api`  → regenerate openapi.json + the TS client
        apps = {
          dev = { type = "app"; program = "${runDev}/bin/run-dev"; };
          frontend = { type = "app"; program = "${runFrontend}/bin/run-frontend"; };
          backend = { type = "app"; program = "${runBackend}/bin/run-backend"; };
          db = { type = "app"; program = "${runPostgres}/bin/run-postgres"; };
          gen-api = { type = "app"; program = "${runGenApi}/bin/run-gen-api"; };
        };

        devShells.default =
          with pkgs;
          mkShell {
            shellHook =
              pre-commit-check.shellHook
              + combined.shellHook
              + ''
                cp -f ${(v_flakes.files.treefmt) { inherit pkgs; }} ./.treefmt.toml

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

            # Playwright (frontend visual tests): drive the nixpkgs browsers instead
            # of the npm-downloaded ones (those dynamically link libs absent on
            # NixOS). The frontend `@playwright/test` version MUST match
            # playwright-driver's or the browser revisions won't line up.
            env.PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
            env.PLAYWRIGHT_HOST_PLATFORM_OVERRIDE = "nixos";
          };
      }
    );
}
