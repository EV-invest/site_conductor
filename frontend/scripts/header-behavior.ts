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
})();
