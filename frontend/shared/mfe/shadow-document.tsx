"use client";

// Client island that composes a self-styled HTML document into the page inside a
// shadow root — the no-iframe way to embed a complete document whose CSS targets
// bare tags (html/body/p/…) and would otherwise reshape the whole host. The
// shadow boundary isolates the doc's styles both ways. The doc is fetched lazily
// by URL (same network shape the old iframe had), so the host stays a light shell.
//
// Why client-side attachShadow, not SSR Declarative Shadow DOM: React 19 can
// emit a <template shadowrootmode> but cannot hydrate over it, and DSD never
// upgrades on App-Router soft navigation — attachShadow works on first load and
// soft-nav alike. See PATTERNS.md § microfrontends.
//
// Trust boundary: the doc HTML is operator-controlled (in-repo typst build,
// copied by the flake) — treat as code, the same boundary as a remote scriptUrl;
// no sanitization. If docs ever become user-sourced, sanitize here (DOMPurify).

import { useEffect, useRef, type ReactNode } from "react";

import { extractBodyInner } from "./doc-html";

export interface ShadowDocumentProps {
  /** URL of the document to mount (site-relative or absolute). */
  src: string;
  className?: string;
  /** Shown while loading and if the document can't be fetched. */
  fallback?: ReactNode;
}

export function ShadowDocument({ src, className, fallback = null }: ShadowDocumentProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((html) => {
        const host = hostRef.current;
        if (cancelled || !host) return;
        // Recreate the document's <html>/<body> via createElement so the doc's
        // own `html{}` / `body{}` / `body > x` rules still match — setting a
        // shadow root's innerHTML strips html/body tags (fragment parsing).
        const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
        const htmlEl = document.createElement("html");
        const bodyEl = document.createElement("body");
        bodyEl.innerHTML = extractBodyInner(html);
        htmlEl.appendChild(bodyEl);
        root.replaceChildren(htmlEl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  // The fallback renders in light DOM; once a shadow root is attached the browser
  // stops rendering light children (there is no <slot>), so it disappears on
  // success and stays on loading / failure — no state needed.
  return (
    <div ref={hostRef} className={className}>
      {fallback}
    </div>
  );
}
