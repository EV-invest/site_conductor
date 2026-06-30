// A light-DOM element remote (e.g. the REA portfolio) styles itself by injecting
// its own Tailwind stylesheet into the host <head>. That sheet's `@layer
// utilities` merges with the host's and, loading last, wins — its non-responsive
// `.grid-cols-1` overrode our `lg:grid-cols-3` and collapsed grids to one column.
// We move every stylesheet the remote injects into the low-priority `reamfe`
// layer (declared first in application/styles/globals.css, below all host layers)
// so host styles always win while the remote stays fully styled. The remote is
// served from the host's own origin (`/mfe/…`), so we can't tell its sheet apart
// by origin — we key on the asset path instead.
//
// Matched by the asset directory the remote's bundle is served from (e.g. `/mfe/`),
// never the host's first-party CSS (which lives elsewhere, e.g. `/_next/`). Keying
// on path, not origin, keeps this working when the remote is proxied through the
// host's own origin — a same-origin remote still injects its own overriding sheet.
export function containRemoteStyles(scriptUrl: string): () => void {
  if (typeof document === "undefined") return () => {};
  const base = new URL(scriptUrl, window.location.href);
  const assetDir = base.href.slice(0, base.href.lastIndexOf("/") + 1);

  const demote = (link: HTMLLinkElement) => {
    const style = document.createElement("style");
    style.dataset.reamfe = "";
    style.textContent = `@import url(${JSON.stringify(link.href)}) layer(reamfe);`;
    link.replaceWith(style);
  };

  const scan = () => {
    document.head
      .querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
      .forEach((link) => {
        if (link.href.startsWith(assetDir)) demote(link);
      });
  };

  scan();
  const observer = new MutationObserver(scan);
  observer.observe(document.head, { childList: true });
  return () => observer.disconnect();
}
