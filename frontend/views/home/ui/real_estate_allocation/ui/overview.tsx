"use client";

import { useEffect, useState } from "react";
import { Portfolio as PortfolioFallback } from "../../portfolio_fallback";

// Portfolio section served as a microfrontend: the standalone Dioxus/WASM port
// at `/embed/overview` (real_estate_allocation), embedded via <iframe>. If the
// embed origin is unreachable we degrade to the in-repo React section. Both keep
// `id="portfolio"` so the hero CTAs' getElementById scroll still lands here.
export function Overview() {
  const base = process.env.NEXT_PUBLIC_REA_URL ?? "http://localhost:59079";
  const src = `${base}/embed/overview`;
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // no-cors: success is opaque (unreadable but resolved); a network failure
    // (embed down / connection refused) rejects — that's our "unavailable" signal.
    fetch(src, { method: "HEAD", mode: "no-cors" }).catch(() => {
      if (cancelled) return;
      console.warn(`[real_estate_allocation] embed unreachable at ${src} — using fallback`);
      setAvailable(false);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!available) return <PortfolioFallback />;

  return (
    <section id="portfolio" className="relative">
      <iframe
        src={src}
        title="Premium Asset Portfolio"
        // Cap at the page Container width so the embed isn't full-bleed; the
        // embed's own Container supplies horizontal padding, so add none here.
        className="mx-auto block w-full max-w-(--page-max,90rem) border-0"
        // ponytail: fixed height — iframes don't auto-size to content. Wire a
        // postMessage(scrollHeight) handshake in embed.rs if it clips on mobile.
        style={{ height: 1600 }}
        loading="lazy"
      />
    </section>
  );
}
