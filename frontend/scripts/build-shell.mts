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

import { BrandHeader } from "../application/layout/header";
import { NAV_ITEMS } from "../application/layout/nav-items";
import registry from "../mfe-registry.json";

const frontend = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(frontend, "public/shell");

const chip = registry.find(entry => entry.name === "cabinet.account");
if (!chip) throw new Error("cabinet.account missing from mfe-registry.json");

// Mirrors the conductor's own CTA wiring in app/layout.tsx: the bar chip hides
// below `sm`; the overlay carries the full-width variant. The raw tag is
// self-registering — the fragment appends its module script after the markup.
const headerHtml = renderToStaticMarkup(
  createElement(BrandHeader, {
    nav: NAV_ITEMS,
    cta: createElement(chip.tag, { class: "hidden items-center sm:flex" }),
    mobileCta: createElement(chip.tag, { class: "flex w-full" }),
  })
);

const fragmentCss = await buildCss(headerHtml);
const behaviorJs = transformSync(
  readFileSync(path.join(frontend, "scripts/header-behavior.ts"), "utf8"),
  { loader: "ts", minify: true }
).code;

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const hash = (s: string) =>
  createHash("sha256").update(s).digest("hex").slice(0, 8);
const cssName = `header.${hash(fragmentCss)}.css`;
const jsName = `header-behavior.${hash(behaviorJs)}.js`;
writeFileSync(path.join(outDir, cssName), fragmentCss);
writeFileSync(path.join(outDir, jsName), behaviorJs);

writeFileSync(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      css: `/shell/${cssName}`,
      js: `/shell/${jsName}`,
      fragment: `${headerHtml}<script type="module" src="${chip.scriptUrl}"></script>`,
    },
    null,
    2
  )
);
console.log(
  `shell: ${cssName} (${fragmentCss.length}B), ${jsName} (${behaviorJs.length}B)`
);

async function buildCss(markup: string): Promise<string> {
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
   need not define them. */
.font-serif-display {
  font-family: var(--font-playfair, "Playfair Display"), ui-serif, Georgia, serif;
  letter-spacing: -0.02em;
}
.font-mono-tech {
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
