import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RemoteElement } from "@/shared/mfe";
import { findMfe } from "@/shared/mfe/registry";

// App surfaces, not marketing pages — keep page MFEs out of the search index.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Page-level microfrontends: a service owns a whole route under /apps. The
// optional catch-all `[[...slug]]` means this also matches the bare
// `/apps/<service>` index, and the rest of the path belongs to the
// microfrontend's own internal router. Landing keeps its chrome (Header/Footer
// from the root layout); the remote owns the content region. Same custom-element
// contract as inline widgets — just mounted at a route.
//
// Scoped under /apps (not a root catch-all) so it never shadows the marketing
// routes or the real 404.
export default async function MfePage({
  params,
}: {
  params: Promise<{ service: string; slug?: string[] }>;
}) {
  const { service } = await params;
  const entry = await findMfe(service);

  // Unregistered, or registered as an inline component — fall through to the real
  // 404 rather than a soft-200 dev panel on a public marketing domain.
  if (!entry || entry.kind !== "page") notFound();

  return (
    <RemoteElement
      tag={entry.tag}
      scriptUrl={entry.scriptUrl}
      className="block min-h-[60vh]"
      fallback={
        <div className="container py-24 text-main-mist/60">Loading {entry.name}…</div>
      }
    />
  );
}
