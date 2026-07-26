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
  // Both directions use the Web Animation API — the page fully
  // reloads across the zone boundary (cabinet is a route-handler
  // proxy; no shared React tree), so CSS transitions can't bridge
  // the two DOMs.  A sessionStorage flag tracks direction:
  //
  //   Forward (landing → cabinet): the shell CSS presets the logo
  //   and actions at their animation-offset positions
  //   ([data-zone=cabinet] …), so the first paint already shows
  //   them offset — no flash of the natural position.  The WAAPI
  //   transitions them to translateX(0) / opacity 1, then sets
  //   data-slide-enter="done" to suppress the CSS offset.
  //
  //   Reverse (cabinet → landing): the landing page has no
  //   data-zone to key CSS off, so we set the offset via inline
  //   style + forced layout, then animate to natural.  The forced
  //   layout collapses the flash window to at most one frame.
  //
  // Falls back to document.referrer when storage is denied.
  // Respects prefers-reduced-motion: reduce.
  const CABINET_FLAG = "sc_from_cabinet";

  if (header.getAttribute("data-zone") === "cabinet") {
    // We're on a cabinet zone page.  Determine whether this is the
    // first entry from the conductor (landing) — in which case we
    // play a one-shot slide-in — or a client-side intra-cabinet
    // navigation where the header already sits in its cabinet state.
    let firstEntry = false;
    try {
      if (sessionStorage.getItem(CABINET_FLAG) !== "1") firstEntry = true;
      // Plant the flag so the next non-zone landing knows where we
      // came from AND so intra-cabinet SPA navigations don't
      // re-trigger the forward animation.
      sessionStorage.setItem(CABINET_FLAG, "1");
    } catch {
      // storage denied / full — not critical; skip the animation
    }

    const logo = header.querySelector<HTMLElement>(
      '[data-slot="header-logo"]'
    );
    const actions = header.querySelector<HTMLElement>(
      '[data-slot="header-actions"]'
    );

    if (
      firstEntry &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // The shell CSS already positions the elements at their
      // offset via [data-zone=cabinet] rules — no flash, no
      // fill:backwards snap.  Animate from that offset to natural.
      const ease = "cubic-bezier(0,0,0.2,1)";

      if (logo) {
        const anim = logo.animate(
          [
            { transform: "translateX(1.5rem)", opacity: "0.5" },
            { transform: "translateX(0)", opacity: "1" },
          ],
          { duration: 300, easing: ease, fill: "none" }
        );
        anim.onfinish = () => {
          anim.cancel();
          logo.setAttribute("data-slide-enter", "done");
        };
      }

      if (actions) {
        const anim = actions.animate(
          [
            { transform: "translateX(-1.5rem)", opacity: "0.5" },
            { transform: "translateX(0)", opacity: "1" },
          ],
          { duration: 300, easing: ease, fill: "none" }
        );
        anim.onfinish = () => {
          anim.cancel();
          actions.setAttribute("data-slide-enter", "done");
        };
      }
    } else {
      // Skip animation (repeat load or reduced motion) — suppress
      // the CSS offset immediately so elements sit at their natural
      // cabinet positions.
      logo?.setAttribute("data-slide-enter", "done");
      actions?.setAttribute("data-slide-enter", "done");
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
      const ease = "cubic-bezier(0,0,0.2,1)";

      // Set offset via inline style first, then force layout so the
      // browser commits the offset before WAAPI interpolation starts.
      // This prevents the elements from flashing at their natural
      // landing positions before the slide-in begins.
      if (logo) {
        logo.style.transform = "translateX(-1.5rem)";
        logo.style.opacity = "0.5";
      }
      if (actions) {
        actions.style.transform = "translateX(1.5rem)";
        actions.style.opacity = "0.5";
      }

      // Force the inline styles to be resolved before animation.
      void header.offsetHeight;

      if (logo) {
        const anim = logo.animate(
          [
            { transform: "translateX(-1.5rem)", opacity: "0.5" },
            { transform: "translateX(0)", opacity: "1" },
          ],
          { duration: 300, easing: ease, fill: "none" }
        );
        anim.onfinish = () => {
          anim.cancel();
          logo.style.transform = "";
          logo.style.opacity = "";
        };
      }

      if (actions) {
        const anim = actions.animate(
          [
            { transform: "translateX(1.5rem)", opacity: "0.5" },
            { transform: "translateX(0)", opacity: "1" },
          ],
          { duration: 300, easing: ease, fill: "none" }
        );
        anim.onfinish = () => {
          anim.cancel();
          actions.style.transform = "";
          actions.style.opacity = "";
        };
      }
    }
  }
})();
