import { RemoteElement } from "@/shared/mfe";
import { findMfe } from "@/shared/mfe/registry";

// The REA microfrontend owns the portfolio section. `id="portfolio"` is the
// hero CTA's scroll target and the /#portfolio nav anchor, held by the host
// wrapper so it lands whether or not the remote has upgraded yet.
export async function Portfolio() {
  const entry = await findMfe("real-estate.overview");
  // The registry is in-repo static data; a missing entry is a broken build.
  if (!entry) throw new Error("real-estate.overview missing from mfe-registry.json");
  return (
    <div id="portfolio">
      <RemoteElement tag={entry.tag} scriptUrl={entry.scriptUrl} />
    </div>
  );
}
