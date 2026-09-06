// Builds the AppShell fragment the zone proxy injects into upstream HTML
// (shared/zone-proxy.ts): renders the brand header to static markup, compiles a
// self-contained stylesheet for exactly that markup, and type-strips the vanilla
// behavior script. Everything is emitted content-hashed into public/shell/
// (immutable-cached, see next.config.ts headers()) plus a manifest the proxy
// imports. Wired into predev/prebuild and the flake's image buildPhase; all
// outputs (manifest included) are gitignored — the proxy's static import makes
// a build that skips this script fail instead of shipping dead /shell URLs.
//
// The stylesheet is the delicate part — it loads inside a zone's document, which
// runs its own Tailwind with its own cascade layers:
//   - No named @layer may leak out: an injected `@layer theme, utilities;`
//     arriving first would reorder the zone's own layer priorities.
//   - No unlayered utility may apply document-wide: an unlayered `.hidden`
//     would beat the zone's *layered* `.md:flex` on the zone's own elements.
// So every rule is wrapped in `@scope ([data-slot="header"])` — unlayered (beats
// the zone's layered rules) but confined to the header subtree. @property and
// @keyframes must stay top-level and are hoisted; duplicate registrations with
// the zone's identical ones are harmless. Theme imports are `theme(reference)`:
// color values are inlined by the tokens' `@theme inline`, and the run-time vars
// the markup still needs (--page-*, fonts) come from the zone's own tokens.css —
// both zones load it.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transformSync } from "esbuild";
import postcss, { AtRule, type ChildNode } from "postcss";
import tailwindcss from "@tailwindcss/postcss";

import { LOCALES, localePath, translator, type Locale } from "@evinvest/i18n";
import { BrandHeader } from "../application/layout/header";
import { NAV_ITEMS, localizeNav } from "../application/layout/nav-items";
import { messagesFor } from "../shared/config/i18n";
import registry from "../mfe-registry.json";
import { spanEnterScript } from "./span-enter";

const frontend = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(frontend, "public/shell");

const chip = registry.find(entry => entry.name === "cabinet.account");
if (!chip) throw new Error("cabinet.account missing from mfe-registry.json");

// Mirrors the conductor's own CTA wiring in app/layout.tsx: the bar chip hides
// below `sm`; the overlay carries the full-width variant. The raw tag is
// self-registering — the fragment appends its module script after the markup.
//
// One fragment PER LOCALE, and that is load-bearing rather than a nicety. This
// header is the only chrome a zone has, so its links are how a reader leaves the
// cabinet — and they used to be hardcoded to the unprefixed English forms (`/`,
// `/team`). A reader in `/de/cabinet` clicking the wordmark therefore landed on
// the English landing, which since `scripts/locale-cookie.ts` also rewrites the
// `ev_locale` cookie: one stray click on the logo and their language was quietly
// reset to English for the whole site. Localising the fragment is what keeps the
// cookie honest, and the translated nav labels come along for free — the same
// `localizeNav` the conductor's own <Header> uses, so the two cannot drift.
//
// The CSS, behaviour script and font are locale-independent and stay shared:
// only the markup differs, and only in link targets and text.
function fragmentFor(locale: Locale): string {
  const t = translator(messagesFor(locale), locale);
  return renderToStaticMarkup(
    createElement(BrandHeader, {
      nav: localizeNav(NAV_ITEMS, locale, t),
      homeHref: localePath(locale, "/"),
      homeLabel: t("a11y.homeLink"),
      menuLabels: {
        open: t("a11y.openMenu"),
        close: t("a11y.closeMenu"),
        menu: t("a11y.siteMenu"),
      },
      cta: createElement(chip.tag, { class: "hidden items-center sm:flex" }),
      mobileCta: createElement(chip.tag, { class: "flex w-full" }),
    })
  );
}

const fragments = Object.fromEntries(
  LOCALES.map(locale => [locale, fragmentFor(locale)])
) as Record<Locale, string>;

// The stylesheet is compiled against one locale's markup, not all five. Tailwind
// scans for class names and every fragment is the same component with the same
// classes — only text and hrefs differ — so any locale yields an identical sheet.
const headerHtml = fragments.en;

const hash = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex").slice(0, 8);

// The display face, shipped with the fragment. Everything else the header needs
// comes from the zone's own tokens.css — but Playfair does not: it is conductor-
// local, bound to `--font-playfair` by next/font on *this* app's <html>. A zone
// document defines neither the variable nor the @font-face, so the restated
// `.font-serif-display` below fell through to its literal "Playfair Display"
// fallback, which no zone loads, and the wordmark rendered in Georgia — the
// landing's lockup in Playfair, the same lockup on /cabinet in a different face.
// Only the roman is shipped; the header never sets italic.
const displayFontFile = readFileSync(
  path.join(frontend, "application/styles/fonts/Playfair-Variable.woff2")
);
const displayFontName = `playfair.${hash(displayFontFile)}.woff2`;

const fragmentCss = await buildCss(headerHtml, displayFontName);
const behaviorJs = transformSync(
  readFileSync(path.join(frontend, "scripts/header-behavior.ts"), "utf8"),
  { loader: "ts", minify: true }
).code;
// The span-enter decision, emitted as a real file rather than inlined into the
// head fragment. Zones serve a strict `script-src 'self' 'nonce-…'` CSP, and an
// inline script without that per-request nonce is simply blocked — which is
// exactly what happened the first time this shipped: the CSS arrived, the script
// never ran, and the bar cut in both directions with nothing in the console
// unless you went looking. A same-origin file needs no nonce, so the conductor
// stays out of the cabinet's CSP implementation entirely.
const spanJs = spanEnterScript("cabinet");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const cssName = `header.${hash(fragmentCss)}.css`;
const jsName = `header-behavior.${hash(behaviorJs)}.js`;
const spanName = `span-enter.${hash(spanJs)}.js`;
writeFileSync(path.join(outDir, cssName), fragmentCss);
writeFileSync(path.join(outDir, jsName), behaviorJs);
writeFileSync(path.join(outDir, spanName), spanJs);
writeFileSync(path.join(outDir, displayFontName), displayFontFile);

writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      css: `/shell/${cssName}`,
      js: `/shell/${jsName}`,
      spanJs: `/shell/${spanName}`,
      font: `/shell/${displayFontName}`,
      // Keyed by locale; `shared/zone-proxy.ts` picks the one matching the URL it
      // is proxying. The chip's module script is appended to each — it is
      // self-registering and idempotent, and only one fragment is ever injected
      // into a given document.
      fragments: Object.fromEntries(
        LOCALES.map(locale => [
          locale,
          `${fragments[locale]}<script type="module" src="${chip.scriptUrl}"></script>`,
        ])
      ),
    },
    null,
    2
  )
);
console.log(
  `shell: ${cssName} (${fragmentCss.length}B), ${jsName} (${behaviorJs.length}B), ${displayFontName} (${displayFontFile.length}B), ${LOCALES.length} locale fragments`
);

async function buildCss(
  markup: string,
  displayFontName: string
): Promise<string> {
  // Tailwind resolves @source relative to the input file; a scratch dir inside
  // the project keeps node_modules import resolution intact.
  const scratch = path.join(frontend, "node_modules/.cache/build-shell");
  mkdirSync(scratch, { recursive: true });
  writeFileSync(path.join(scratch, "fragment.html"), markup);
  const input = `
@import "tailwindcss/theme.css" theme(reference);
@import "@evinvest/uikit/styles/tokens.css";
@import "tw-animate-css";
@import "tailwindcss/utilities.css" source(none);
@source "./fragment.html";

/* Conductor-global classes the header markup uses (application/styles/
   globals.css) — restated with the tokens' concrete stacks since a zone's CSS
   need not define them.

   Wrapped in :where() to hold them at zero specificity. In globals.css these
   live in a base layer, so a utility on the same element wins; here the layer
   is flattened (see the layer unwrap below) and the block is appended last,
   which made it beat the utilities instead. The header wordmark carries both
   font-serif-display and tracking-wider, so on zones the -0.02em below was
   overriding the +0.05em it should have had — the landing tracked the lockup
   out to 0.9px, /cabinet pulled it in to -0.36px, from one flattened layer. */
:where(.font-serif-display) {
  font-family: var(--font-playfair, "EV Shell Playfair"), Georgia, ui-serif, serif;
  letter-spacing: -0.02em;
}
:where(.font-mono-tech) {
  font-family: var(--font-inter, "Inter"), ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
`;
  const inputPath = path.join(scratch, "input.css");
  writeFileSync(inputPath, input);
  const compiled = await postcss([tailwindcss()]).process(input, {
    from: inputPath,
    map: false,
  });

  const root = compiled.root;
  root.walkAtRules("layer", at => {
    if (at.nodes?.length) at.replaceWith(...at.nodes);
    else at.remove();
  });
  const hoisted: ChildNode[] = [];
  root.walkAtRules(/^(property|keyframes)$/, at => {
    // toast keyframes: tokens.css ships the toast lifecycle at its tail; no
    // toast ever renders inside the header subtree.
    if (!at.params.startsWith("ev-toast")) hoisted.push(at.clone());
    at.remove();
  });
  // The zone provides :root tokens / font-faces via its own tokens.css; ours
  // must not restate them document-wide.
  root.walkRules(rule => {
    if (/:root|:host|toaster/.test(rule.selector)) rule.remove();
  });
  root.walkAtRules("font-face", at => {
    at.remove();
  });
  // …with one exception, added back after the sweep rather than spared by it:
  // the display face. The rule above is right about Inter — uikit's tokens.css
  // ships it and every zone loads it — but Playfair reaches this app through
  // next/font, not tokens.css, so stripping every face left zones with a
  // font-family naming a font nobody serves.
  //
  // `src` is relative to THIS STYLESHEET, not the document: the fragment is a
  // `<link href="/shell/header.…css">`, so `./playfair.…woff2` resolves next to
  // it whatever path the zone document lives at (`/cabinet`, `/rea/...`).
  // `swap`, not the `optional` next/font uses on the conductor — `optional`
  // commits to one face for the whole page view, so a cold visit would keep the
  // Georgia fallback and reopen exactly the mismatch this fixes. The reasoning
  // for `optional` was a 96px hero reflowing; this is an 18px wordmark, and the
  // preload beside the stylesheet makes the swap window very short anyway.
  hoisted.push(
    postcss
      .parse(
        `@font-face {
  font-family: "EV Shell Playfair";
  src: url("./${displayFontName}") format("woff2-variations");
  font-weight: 300 900;
  font-style: normal;
  font-display: swap;
}`
      )
      .first!.clone()
  );
  root.walkAtRules(/^(media|supports)$/, at => {
    if (!at.nodes?.length) at.remove();
  });

  const scope = new AtRule({ name: "scope", params: '([data-slot="header"])' });
  scope.append(...root.nodes);
  // Plain selectors inside @scope match only descendants, never the scoping
  // root itself — so the root's own utilities (`fixed top-0 left-0 z-[60]
  // w-full`) are dead on zones and must be restated on `:scope`, which does
  // match the root. Without this the zone's later-in-DOM fixed elements paint
  // over the bar (z-index never applied).
  scope.prepend(
    postcss.parse(
      ":scope { position: fixed; top: 0; left: 0; z-index: 60; width: 100%; }"
    )
  );
  root.removeAll();
  root.append(...hoisted, scope);
  // The spanning ⇄ narrowing motion, appended OUTSIDE the @scope wrapper and
  // deliberately so. @scope prepends an implicit `:scope ` to every selector it
  // contains, so a rule whose ancestor condition is the header itself — or, as
  // here, <html> — can never match: it would be asking for that ancestor to sit
  // *inside* the header. The previous version of this animation lived inside the
  // scope and was dead code in every zone document for exactly that reason.
  //
  // Living outside the scope is safe for these specific rules because every
  // selector is anchored to a `data-slot` the header owns, so nothing here can
  // reach a zone's own elements — which is the property @scope exists to
  // guarantee for the bulk of the sheet.
  root.append(
    postcss.parse(
      readFileSync(
        path.join(frontend, "application/styles/header-span.css"),
        "utf8"
      )
    )
  );
  // !important: this link is injected before the zone's own stylesheet, whose
  // `--ev-shell-offset: 0px` standalone default would otherwise win on order.
  // The bar is `fixed` (no layout space), so the zone document is padded by its
  // height — which the zone-tagged bar pins to exactly this value (header.tsx
  // `h-[calc(5.5rem+1px)]`), so the bar's bottom border lands flush where the
  // zone's chrome (e.g. the cabinet's fixed rail) begins. Zones keep sizing
  // viewport-bound surfaces with calc(100dvh - offset), unchanged.
  root.append(
    postcss.parse(
      ":root { --ev-shell-offset: calc(5.5rem + 1px) !important; } body { padding-top: var(--ev-shell-offset); }"
    )
  );
  return transformSync(root.toResult().css, { loader: "css", minify: true })
    .code;
}
