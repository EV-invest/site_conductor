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

  const setOpen = (open: boolean) => {
    if (open) header.setAttribute("data-menu-open", "");
    else header.removeAttribute("data-menu-open");
    document.body.style.overflow = open ? "hidden" : "";
    header
      .querySelector('[data-menu-toggle="open"]')
      ?.setAttribute("aria-expanded", String(open));
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

  // ── Cabinet ↔ landing transition ──────────────────────────────
  // Forward (landing → cabinet): the CSS group-data-[zone=cabinet]
  // variants on the logo / actions trigger animate-in on mount.
  // Reverse (cabinet → landing): the page fully reloads (the cabinet
  // is a route-handler zone — no shared React tree), so CSS
  // transitions can't bridge the two DOMs.  We detect the direction
  // with a sessionStorage flag set while on a cabinet page + a
  // document.referrer fallback, then play a one-shot slide-in on the
  // landing render that mirrors the forward animation in reverse.
  const CABINET_FLAG = "sc_from_cabinet";

  if (header.getAttribute("data-zone") === "cabinet") {
    // We're on a cabinet zone page.  Plant the flag so the next
    // non-zone landing knows where we came from.
    try {
      sessionStorage.setItem(CABINET_FLAG, "1");
    } catch {
      // storage denied / full — not critical
    }
  } else {
    // We're on a conductor-owned page.  Only animate when returning
    // from cabinet — never on a cold load or internal landing nav.
    let fromCabinet = false;
    try {
      if (sessionStorage.getItem(CABINET_FLAG) === "1") {
        sessionStorage.removeItem(CABINET_FLAG);
        fromCabinet = true;
      }
    } catch {
      // storage denied — try referrer below
    }
    if (!fromCabinet) {
      try {
        const ref = new URL(document.referrer);
        if (ref.pathname.startsWith("/cabinet")) fromCabinet = true;
      } catch {
        // no / malformed referrer
      }
    }

    if (
      fromCabinet &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const logo = header.querySelector<HTMLElement>(
        '[data-slot="header-logo"]'
      );
      const actions = header.querySelector<HTMLElement>(
        '[data-slot="header-actions"]'
      );
      // Easing that matches the forward animate-in ease-out feel.
      const ease = "cubic-bezier(0,0,0.2,1)";

      if (logo) {
        // Logo slides in from the left (the cabinet position was
        // further left — the element appears to glide rightward).
        logo.animate(
          [
            { transform: "translateX(-1.5rem)", opacity: "0.5" },
            { transform: "translateX(0)", opacity: "1" },
          ],
          { duration: 300, easing: ease, fill: "backwards" }
        );
      }

      if (actions) {
        // Actions slide in from the right (the cabinet position was
        // further right — the element appears to glide leftward).
        actions.animate(
          [
            { transform: "translateX(1.5rem)", opacity: "0.5" },
            { transform: "translateX(0)", opacity: "1" },
          ],
          { duration: 300, easing: ease, fill: "backwards" }
        );
      }
    }
  }
})();
