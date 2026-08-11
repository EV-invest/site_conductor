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

  // ── Landing → cabinet entry ───────────────────────────────────
  // Crossing the zone boundary is a full document load (the cabinet
  // is a route-handler proxy; there is no shared React tree), so the
  // "spanning" of the bar — logo sliding out to the rail edge, chip
  // out to the right — cannot be a transition between two DOMs. It
  // is played as a one-shot entrance on the cabinet document.
  //
  // The shell CSS paints the logo and actions AT the offset from the
  // first frame (`[data-zone=cabinet] …:not([data-slide-enter])`) and
  // attaches the transition to `[data-slide-enter=run]`. All this
  // script does is flip that one attribute inside a rAF: the offset
  // is already committed, so the transition interpolates off it on
  // the compositor. Everything the previous version did by hand —
  // two WAAPI animations, inline style writes, a forced layout to
  // beat the flash — is what made the motion stutter under load.
  //
  // There is deliberately NO reverse (cabinet → landing) animation.
  // This script is deferred in both hosts, so on the landing document
  // the header has already painted at its natural position by the time
  // we could offset it; animating from an offset after that is a jump,
  // not an entrance. A hard cut reads better than a snap.
  //
  // `data-slide-enter=run` is terminal: it suppresses the offset for
  // the rest of the document's life, so intra-cabinet soft navigation
  // never replays.
  const CABINET_FLAG = "sc_from_cabinet";
  const parts = [
    header.querySelector<HTMLElement>('[data-slot="header-logo"]'),
    header.querySelector<HTMLElement>('[data-slot="header-actions"]'),
  ].filter((el): el is HTMLElement => el !== null);

  if (header.getAttribute("data-zone") === "cabinet") {
    // First entry from the conductor, or a reload/soft nav already
    // inside the cabinet? Only the former gets the entrance.
    let firstEntry = false;
    try {
      if (sessionStorage.getItem(CABINET_FLAG) !== "1") firstEntry = true;
      sessionStorage.setItem(CABINET_FLAG, "1");
    } catch {
      // storage denied / full — not critical; skip the animation
    }

    const animate =
      firstEntry &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // "done" carries no transition, so the offset is dropped in the
    // same frame with nothing to see.
    if (!animate)
      parts.forEach(el => el.setAttribute("data-slide-enter", "done"));
    else
      requestAnimationFrame(() =>
        parts.forEach(el => el.setAttribute("data-slide-enter", "run"))
      );
  } else {
    // Back on a conductor-owned page: clear the flag so the next hop
    // into the cabinet plays the entrance again.
    try {
      sessionStorage.removeItem(CABINET_FLAG);
    } catch {
      // storage denied — the flag was never set either
    }
  }
})();
