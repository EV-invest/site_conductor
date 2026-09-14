import type { Locale } from "@evinvest/i18n";

import { RemoteElement, ShadowDocument } from "@/shared/mfe";
import { Reveal } from "@/shared/ui/motion";
import { findMfe } from "@/shared/mfe/registry";
import { loadDocHtml } from "@/shared/mfe/doc-source";

// Baked into public/mfe/ by REA's own `nix build` (§ component-MFE snapshot contract):
// a static HTML render of the SAME view components the live bundle mounts, so it can't
// drift. Shown until/unless the remote upgrades — and permanently if it never does.
//
// One file per locale, for exactly that reason: the snapshot is not a flash, it is what
// a reader with JS off or a 404'd bundle sees for good, so a single `<html lang="en">`
// on /ru would be English forever. The live bundle resolves the same locale itself, off
// the page's `lang` (ev_lib::mfe::host_locale).
const snapshot = (locale: Locale) => `/mfe/portfolio.${locale}.html`;

// The REA microfrontend owns the portfolio section. `id="portfolio"` is the hero CTA's
// scroll target and the /#portfolio nav anchor, held by the host wrapper so it lands
// whether or not the remote has upgraded yet.
export async function Portfolio({ locale }: { locale: Locale }) {
  const entry = await findMfe("real-estate.overview");
  // The registry is in-repo static data; a missing entry is a broken build.
  if (!entry)
    throw new Error("real-estate.overview missing from mfe-registry.json");
  const SNAPSHOT = snapshot(locale);
  // Assert the snapshot exists at BUILD time — a missing snapshot is a broken build, not
  // a runtime degradation. `loadDocHtml` (node:fs) throws if it's absent. A locale REA's
  // flake forgot to emit therefore breaks this build rather than serving English.
  await loadDocHtml(SNAPSHOT);
  return (
    <div id="portfolio">
      {/* `from="none"` on purpose: a transform here would make this element the
          containing block for any `position: fixed` the remote paints, so the
          section fades in without moving. */}
      <Reveal from="none">
        <RemoteElement
          tag={entry.tag}
          scriptUrl={entry.scriptUrl}
          fallback={<ShadowDocument src={SNAPSHOT} />}
        />
      </Reveal>
    </div>
  );
}
