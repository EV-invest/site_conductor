## `real_estate_allocation` embed contract

The home page's "Premium Asset Portfolio" section is **not** rendered by this
repo. It is a microfrontend: an `<iframe>` onto the `real_estate_allocation`
app, which serves a shell-less marketing surface at `/embed/overview`. The host
(`frontend/views/home/ui/real_estate_allocation/`) only frames it; the in-repo
React section (`portfolio_fallback/`) is kept solely as the offline fallback.

### Endpoint

- **URL:** `${NEXT_PUBLIC_REA_URL}/embed/overview` — defaults to
  `http://localhost:59079` when the env var is unset.
- **Surface:** standalone, no app shell, no auth, no Maps script. Static content
  plus one self-contained ROI calculator tile.

### Who owns what

| Concern | Owner |
| --- | --- |
| Section content, copy, calculator logic | `real_estate_allocation` (embed) |
| Width box, height, availability, page anchor | `landing` (host) |

The host caps the iframe at the page `Container` width
(`max-w-[var(--page-max,90rem)]`) and adds **no** horizontal padding — the
embed's own `Container` supplies it. So the embed must render its content inside
a `Container` and must **not** add an outer max-width of its own, or the box
won't line up.

### Invariants the embed must hold

- **Framing allowed:** no `X-Frame-Options: DENY`; in prod its CSP
  `frame-ancestors` must include the landing origin.
- **Fills the width it's given:** the host decides the box; the embed lays out
  fluidly within it (see width note above).
- **Stable route:** `/embed/overview` is the contract path. Renaming it breaks
  the host.

### Host-side behavior

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

### Local dev

```
real_estate_allocation:  dx serve   # → http://localhost:59079
landing:                 pnpm dev   # → http://localhost:3000
```

Set `NEXT_PUBLIC_REA_URL` to point at a non-default embed origin.
