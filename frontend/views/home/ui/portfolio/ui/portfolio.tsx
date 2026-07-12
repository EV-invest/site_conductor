import { RemoteElement, ShadowDocument } from "@/shared/mfe";
import { findMfe } from "@/shared/mfe/registry";
import { loadDocHtml } from "@/shared/mfe/doc-source";

// Baked into public/mfe/ by REA's own `nix build` (§ component-MFE snapshot contract):
// a static HTML render of the SAME view components the live bundle mounts, so it can't
// drift. Shown until/unless the remote upgrades — and permanently if it never does.
const SNAPSHOT = "/mfe/portfolio.html";

// The REA microfrontend owns the portfolio section. `id="portfolio"` is the hero CTA's
// scroll target and the /#portfolio nav anchor, held by the host wrapper so it lands
// whether or not the remote has upgraded yet.
export async function Portfolio() {
  const entry = await findMfe("real-estate.overview");
  // The registry is in-repo static data; a missing entry is a broken build.
  if (!entry) throw new Error("real-estate.overview missing from mfe-registry.json");
  // Assert the snapshot exists at BUILD time — a missing snapshot is a broken build, not
  // a runtime degradation. `loadDocHtml` (node:fs) throws if it's absent.
  await loadDocHtml(SNAPSHOT);
  return (
    <div id="portfolio">
      <RemoteElement
        tag={entry.tag}
        scriptUrl={entry.scriptUrl}
        fallback={<ShadowDocument src={SNAPSHOT} />}
      />
    </div>
  );
}
