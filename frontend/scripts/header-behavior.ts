// THE header behavior — one implementation for both hosts: injected into zone
// HTML by the proxy and loaded by the conductor's own layout (the markup in
// application/layout/header.tsx ships no state). Zero imports; built to a
// content-hashed IIFE by scripts/build-shell.mts. All it does: toggle
// `data-scrolled` / `data-menu-open` on the root.
(() => {
  const header = document.querySelector<HTMLElement>(
    'header[data-slot="header"]'
  );
  if (!header) return;

  const onScroll = () =>
    window.scrollY > 50
      ? header.setAttribute("data-scrolled", "")
      : header.removeAttribute("data-scrolled");
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // The static mobile sign-out button ships `hidden` (the markup has no
  // session awareness of its own — that lives in the AccountChip mfe); reveal
  // it only once /api/auth/session confirms a signed-in principal, so a
  // signed-out visitor on any zone never sees it.
  const signoutBtn = header.querySelector<HTMLElement>(
    '[data-action="signout"]'
  );
  if (signoutBtn) {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then((s: { authenticated?: boolean }) => {
        if (s?.authenticated) signoutBtn.hidden = false;
      })
      .catch(() => {});
  }

  // The drawer stays mounted and is hidden with `visibility`, which already
  // takes it out of the tab order and the accessibility tree — so open/close
  // needs no `inert` or `aria-hidden` bookkeeping. What CSS cannot do is move
  // focus, so that part is here: into the drawer on open, back to the trigger
  // on close, or a keyboard user is left focused on a button behind a scrim.
  const setOpen = (open: boolean) => {
    const toggle = header.querySelector<HTMLElement>(
      '[data-menu-toggle="open"]'
    );
    if (open) header.setAttribute("data-menu-open", "");
    else header.removeAttribute("data-menu-open");
    document.body.style.overflow = open ? "hidden" : "";
    toggle?.setAttribute("aria-expanded", String(open));

    if (open)
      // Next frame: the drawer is `visibility: hidden` until the style change
      // lands, and focus() on a hidden element is a no-op.
      requestAnimationFrame(() =>
        header
          .querySelector<HTMLElement>(
            '[data-slot="header-mobile-overlay"] [data-menu-toggle="close"]'
          )
          ?.focus()
      );
    else if (header.contains(document.activeElement)) toggle?.focus();
  };

  header.addEventListener("click", e => {
    const target = e.target as Element;
    const toggle = target.closest("[data-menu-toggle]");
    if (toggle)
      return setOpen(toggle.getAttribute("data-menu-toggle") === "open");
    // Sign-out handler: POSTs /api/auth/logout with the CSRF token from the
    // page's meta tag (same mechanism as the AccountChip microfrontend), then
    // navigates home. Runs before the delegated-close so the menu closes too.
    const signout = target.closest<HTMLElement>('[data-action="signout"]');
    if (signout) {
      setOpen(false);
      const csrf =
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content") ?? "";
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": csrf, "Content-Type": "application/json" },
      }).finally(() => {
        window.location.href = "/";
      });
      return;
    }
    // Delegated close: any link/button inside the open overlay dismisses it.
    if (target.closest('[data-slot="header-mobile-overlay"] :is(a, button)'))
      setOpen(false);
  });

  window.addEventListener("keydown", e => {
    // Guard on the attribute so a zone's own Escape-driven UI (dialogs owning
    // their body scroll lock) is never clobbered by our overflow reset.
    if (e.key === "Escape" && header.hasAttribute("data-menu-open"))
      setOpen(false);
  });

  // ── Spanning ⇄ narrowing, second half ─────────────────────────
  // The decision and the starting offset are already done: the head
  // script (scripts/span-enter.ts) stamped `data-span-from` on <html>
  // before the first paint, and header-span.css painted the logo and
  // chip at the OTHER zone's position on frame one. All that is left is
  // to release them, and the transition interpolates off the committed
  // offset on the compositor.
  //
  // A transition needs the offset to have been RESOLVED as a style before
  // it is replaced. If both happen inside one style resolution the browser
  // has no start value and simply jumps.
  //
  // Measured on production: the conductor, where this script loads
  // `afterInteractive` and the offset was resolved long ago, interpolated
  // across 24 frames. The cabinet, where the proxy loads it `defer` in the
  // head and it can run before the first paint, produced two values — 270
  // and 0. Identical CSS, different load timing.
  //
  // So the resolution is forced rather than waited for. Reading offsetWidth
  // makes the browser flush styles and layout with the offset in place; the
  // attribute change after it is therefore a second resolution, and the
  // transition has both ends. One forced reflow on one element, once per
  // zone crossing — unlike the per-frame layout thrash this animation used
  // to do, which is what made it stutter in the first place.
  //
  // The rAF around it is still worth keeping: it gets off the parser's task
  // so the flush measures a document that has finished building.
  //
  // `data-span-run` is terminal. Intra-zone soft navigation never replays
  // it, and a reload never sets `data-span-from` in the first place (the
  // head script compares against the zone it recorded).
  const root = document.documentElement;
  if (root.hasAttribute("data-span-from"))
    requestAnimationFrame(() => {
      void root.offsetWidth;
      root.setAttribute("data-span-run", "");
    });
})();
