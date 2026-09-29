// A zone page whose own scripts or stylesheets fail to load renders its SSR'd
// frame with nothing inside it (the cabinet's content is client-rendered). This
// script notices: it stamps `data-zone-failed` on the header root, which shows
// the fragment's reload notice (scripts/build-shell.mts), and reports the failed
// paths once per page to /api/zone-error.
//
// Blocking in <head>, like session-stamp.ts, because an asset `error` event does
// not bubble and fires whenever the fetch fails: only a capture listener that
// exists before the zone's own <script>/<link> tags can see it.
//
// Zero imports; type-stripped and minified by scripts/build-shell.mts into a
// content-hashed file (zones forbid inline script).
(() => {
  const failed: string[] = [];
  let reported = false;
  const stamp = () =>
    document
      .querySelector('header[data-slot="header"]')
      ?.setAttribute("data-zone-failed", "");
  const report = () => {
    if (reported || failed.length === 0) return;
    reported = true;
    navigator.sendBeacon(
      "/api/zone-error",
      JSON.stringify({ page: location.pathname, assets: failed })
    );
  };
  addEventListener(
    "error",
    event => {
      const el = event.target;
      const src =
        el instanceof HTMLScriptElement
          ? el.src
          : el instanceof HTMLLinkElement && el.rel === "stylesheet"
            ? el.href
            : "";
      if (!src) return;
      const url = new URL(src);
      if (url.origin !== location.origin) return;
      failed.push(url.pathname);
      if (document.readyState === "loading")
        addEventListener("DOMContentLoaded", stamp, { once: true });
      else stamp();
      // A chunk that fails after `load` (a lazy route) is reported as it happens.
      if (document.readyState === "complete") report();
    },
    true
  );
  addEventListener("load", report);
})();
