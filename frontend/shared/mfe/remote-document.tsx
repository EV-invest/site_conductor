// Public host primitive for *document* microfrontends — the sibling of
// <RemoteElement> for remotes that are a self-contained HTML document (the
// typst-built whitepaper / blog) rather than a custom-element JS bundle. It
// composes the document into the page natively — no iframe: the host keeps its
// chrome (Header/Footer) and scroll, and the content lives in the page.
//
// - isolate=false (default): the document has no styles of its own (or styles
//   meant to inherit the host's) — inject its <body> into the LIGHT DOM so host
//   typography (prose) styles it. Pure Server Component: SSR'd, zero JS, indexable.
// - isolate=true: the document ships its own complete styles targeting bare tags —
//   mount it in a shadow root (client island) so its CSS can't leak into the host.
//
// Server Components by default; the shadow path is the only client island.

import { type ReactNode } from "react";

import { extractBodyInner } from "./doc-html";
import { loadDocHtml } from "./doc-source";
import { ShadowDocument } from "./shadow-document";

export interface RemoteDocumentProps {
  /** Document URL — site-relative (read from public/) or absolute (a doc service). */
  src: string;
  /** Shadow-isolate a self-styled doc. Default false (light DOM + host styles). */
  isolate?: boolean;
  className?: string;
  /** Shown while an isolated doc loads / if a doc can't be loaded. */
  fallback?: ReactNode;
}

export async function RemoteDocument({
  src,
  isolate = false,
  className,
  fallback = null,
}: RemoteDocumentProps) {
  if (isolate) {
    return <ShadowDocument src={src} className={className} fallback={fallback} />;
  }
  // Light DOM, SSR. Trusted operator content (see ShadowDocument trust note).
  let inner: string;
  try {
    inner = extractBodyInner(await loadDocHtml(src));
  } catch {
    return <>{fallback}</>;
  }
  return <div className={className} dangerouslySetInnerHTML={{ __html: inner }} />;
}
