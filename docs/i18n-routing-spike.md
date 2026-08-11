# i18n routing spike — result

**Question.** Can we serve the default locale at unprefixed paths (`/team`) and
every other locale under a prefix (`/ru/team`), with every page living under
`app/[locale]/`, using only `next.config.ts` — no `proxy.ts`/middleware?

**Answer: yes — but not the way it was planned.** The mechanism had to change,
and one page-level export turned out to be load-bearing.

Verified against Next 16.2.9 in **both** `next dev` and a production
`next build` + `next start`, on branch `fen/i18n-routing-spike`.

---

## The correction: `fallback`, not `afterFiles`

The plan specified an `afterFiles` rewrite. That does not work, and the failure is
silent in the sense that the English half looks fine.

Next's routing order is:

```
headers → redirects → beforeFiles → filesystem → afterFiles → DYNAMIC ROUTES → fallback
```

`afterFiles` runs after the *filesystem* (static files, non-dynamic pages) but
**before dynamic routes**. The whole `app/[locale]/` tree is a dynamic route, so
an `afterFiles` rule fires before `[locale]` is ever tried:

| URL | with `afterFiles` | why |
| --- | --- | --- |
| `/spike` | 200 (en) | rewritten to `/en/spike`, which then matches — looks correct |
| `/ru/spike` | **404** | rewritten to `/en/ru/spike` before `[locale]` gets a chance |

Moving the identical rule to `fallback` — which runs *after* dynamic routes —
fixes it, because that is the semantics actually wanted: "no real route matched,
so this must be an unprefixed default-locale page".

```ts
// next.config.ts
async rewrites() {
  return {
    beforeFiles: [...zoneRewrites],
    afterFiles: [],
    fallback: [{ source: "/:path*", destination: "/en/:path*" }],
  };
}
async redirects() {
  return [
    { source: "/en/:path*", destination: "/:path*", permanent: true },
    { source: "/en", destination: "/", permanent: true },
  ];
}
```

## `dynamicParams = false` is load-bearing, not hygiene

The plan treated it as a nicety for 404 correctness. It is what makes the whole
scheme work.

In the real end state `app/[locale]/page.tsx` is the homepage, so `[locale]`
matches any single segment — which makes a one-segment English URL like `/team`
ambiguous with it. The question is whether `/team` gets captured as
`locale="team"` (and 404s) or declines and falls through to the rewrite.

With `dynamicParams = false` plus `generateStaticParams` returning only the five
locales, `[locale]` **declines** the unknown segment and the request reaches the
`fallback` rewrite. Confirmed: `/spike2` → 200 rendering `app/[locale]/spike2`
with `locale=en`, while `app/[locale]/page.tsx` exists beside it.

Without it, `/team` would resolve as the homepage with `locale="team"`.

## Verified matrix

| URL | Result | What it proves |
| --- | --- | --- |
| `/spike2` | 200, `locale=en` | unprefixed English resolves via `fallback` |
| `/ru/spike2` | 200, `locale=ru` | prefixed locale matches the filesystem route first |
| `/ru` | 200 | locale root works |
| `/en/spike2` | 308 → `/spike2` | canonical collapse works; **no redirect loop** |
| `/vn/spike2` | 404 | the `vn` trap is rejected — only real locales match |
| `/team`, `/contact`, `/hiring` | 200 | existing static routes untouched |
| `/sitemap.xml` | 200 | metadata routes untouched |
| `/cabinet/x` | 404 (zone disabled) | zone mounts reached, **not** swallowed by the rewrite |
| `/nonsense` | 404 | unknown paths still 404 |

The redirect/rewrite pair does not loop: the redirect is external and evaluated
against the incoming request, while the rewrite is internal and never re-enters
the redirect pipeline. Every redirect source is itself `/en`-prefixed, so an
unprefixed path can never match one.

## Confirmed against a production build

`dynamicParams = false` was the one behaviour where dev and build could
plausibly diverge, so the matrix was re-run against a real `next build` +
`next start`. **It does not diverge** — the scheme behaves identically.

site_conductor itself cannot build in a fresh worktree (see the unrelated
breakage below), so the production run used an isolated minimal app reproducing
only the routing shape: `app/[locale]/layout.tsx` (with `dynamicParams = false`
and `generateStaticParams`), `app/[locale]/page.tsx`, `app/[locale]/spike2/page.tsx`,
and the same `rewrites()`/`redirects()` config.

Every locale route prerendered as static SSG — no route fell back to dynamic
rendering, which is what the weak VPS needs:

```
● /[locale]          → /en  /ru  /vi  /fr  /de
● /[locale]/spike2   → /en/spike2  /ru/spike2  /vi/spike2  /fr/spike2  /de/spike2
```

| URL | Production result |
| --- | --- |
| `/spike2` | 200, `locale=en` — the ambiguous one-segment case resolves as English |
| `/ru/spike2` · `/vi/spike2` | 200, `locale=ru` / `vi` |
| `/` | 200, `locale=en` |
| `/ru` | 200, `locale=ru` |
| `/en/spike2` · `/en` | 308 to the unprefixed form |
| `/vn/spike2` · `/nonsense` | 404 |

## Remaining caveat

**Turbopack untested.** Turbopack refused this worktree's symlinked
`node_modules` ("points out of the filesystem root"), so `--webpack` was used for
both dev and build. Rewrite/redirect resolution is handled by the Next server
rather than the bundler, so this is very unlikely to differ — but it is untested,
and the real builds run Turbopack.

## Unrelated breakage found on `origin/main`

Neither is caused by i18n; both were hit while running the matrix.

1. **`/publications` returns 500.** A Tailwind class-conflict assertion throws in
   `views/publications/ui/filter-chips.tsx:41` —
   `hover:border-main-mist/40` is overridden by a later `hover:border-main-mist/16`
   on the disabled chip. Reproduces on a clean checkout of `origin/main`.
2. **`/` returns 500 in a fresh worktree.** `views/home/ui/portfolio` asserts
   `public/mfe/portfolio.html` exists, and that snapshot is a gitignored flake
   build output. Working as designed per PATTERNS §8 ("a missing snapshot at
   build time is a broken build") — noted only because it makes any fresh
   worktree unable to build until the REA snapshot is produced.

## Files in this spike

Throwaway, delete when P2 lands the real migration:

- `frontend/app/[locale]/layout.tsx` — owns the param, `dynamicParams = false`
- `frontend/app/[locale]/page.tsx` — homepage stand-in that creates the ambiguity
- `frontend/app/[locale]/spike/page.tsx`, `spike2/page.tsx` — the probes
- the `rewrites()`/`redirects()` blocks in `frontend/next.config.ts` — these are
  **keepers**, and are what P2 should land
