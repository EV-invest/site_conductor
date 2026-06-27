// A light-DOM element remote (e.g. the REA portfolio) styles itself by injecting
// its own Tailwind stylesheet into the host <head>. That sheet's `@layer
// utilities` merges with the host's and, loading last, wins — its non-responsive
// `.grid-cols-1` overrode our `lg:grid-cols-3` and collapsed grids to one column.
// We move every stylesheet the remote injects into the low-priority `reamfe`
// layer (declared first in application/styles/globals.css, below all host layers)
// so host styles always win while the remote stays fully styled.
//
// Only sheets served from the remote's own (cross-)origin are touched — never the
// host's first-party CSS, so a same-origin remote is left alone.
export function containRemoteStyles(remoteOrigin: string): () => void {
  if (typeof document === "undefined" || remoteOrigin === window.location.origin) {
    return () => {};
  }

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
        if (link.href.startsWith(remoteOrigin)) demote(link);
      });
  };

  scan();
  const observer = new MutationObserver(scan);
  observer.observe(document.head, { childList: true });
  return () => observer.disconnect();
}
