import { RemoteElement } from "@/shared/mfe";
import { findMfe } from "@/shared/mfe/registry";
import { Portfolio as PortfolioFallback } from "../../portfolio_fallback";

// Portfolio section as a real microfrontend: the landing host composes REA's
// self-registering `<mfe-real-estate-overview>` (Dioxus/WASM) directly into the
// page in light DOM, so the host's fonts/tokens/preflight cascade in. Server
// component — it resolves the registry entry and renders the client `RemoteElement`
// island, degrading to the in-repo React section if the entry is missing or the
// remote fails to load. `Overview` and the fallback each carry `id="portfolio"` and
// only one renders at a time, so the hero CTA's getElementById scroll always lands —
// hence no extra id wrapper here.
export async function Portfolio() {
  const entry = await findMfe("real-estate.overview");
  if (!entry) return <PortfolioFallback />;
  return (
    <RemoteElement
      tag={entry.tag}
      scriptUrl={entry.scriptUrl}
      fallback={<PortfolioFallback />}
    />
  );
}
