// The pre-paint half of the header's session awareness (issue #202).
//
// The static header ships the signed-out pair visible and the account chip
// hidden; scripts/header-behavior.ts flips them by stamping `data-session` on
// the header root once /api/auth/session answers. That script is deferred on
// both hosts, so a signed-in reader on a hard load saw the pair for the length
// of that round trip and then the chip popping in over it. This script closes
// the gap: it replays the LAST KNOWN state — the behavior script writes it to
// localStorage under `ev.session` after every read — before the first paint,
// and the fetch then confirms or corrects it. A stale "authenticated" costs one
// empty chip slot until the fetch answers; a stale "anonymous" is today's
// behaviour. Anything else in the key is ignored, not trusted.
//
// It has to be a blocking script in <head> to precede the paint, and there the
// header does not exist yet: the parser has not reached <body>. So the stamp is
// delivered by a MutationObserver — its callback is a microtask, and the event
// loop runs the microtask checkpoint before "update the rendering", so the
// attribute lands in the same task that inserted the header, ahead of any
// paint. The observer is dropped once the header is found, or at
// DOMContentLoaded if it never is (a document the proxy streamed unmodified).
//
// Zero imports; type-stripped and minified by scripts/build-shell.mts into a
// content-hashed file. Zones load it as `<script src>` (their CSP forbids
// inline code); the conductor inlines the same bytes from the manifest.
(() => {
  try {
    // Mirrors the write in header-behavior.ts; the two scripts cannot share a
    // module, so the key and its values are the contract.
    const stamp = localStorage.getItem("ev.session");
    if (stamp !== "authenticated" && stamp !== "anonymous") return;
    const apply = (): boolean => {
      const header = document.querySelector('header[data-slot="header"]');
      if (!header) return false;
      header.setAttribute("data-session", stamp);
      return true;
    };
    if (apply()) return;
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    addEventListener("DOMContentLoaded", () => observer.disconnect());
  } catch {
    // Storage access throws in some private modes; the signed-out default
    // stands, as it does without this script.
  }
})();
