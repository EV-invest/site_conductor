// Below-`lg` navigation: the scrim and the drawer it dims for, both gated by
// `data-menu-open` on the header root. They stay rendered inline in the header
// subtree — never moved into a Portal, which renders nothing under
// `renderToStaticMarkup` and would silently empty the zone shell fragment
// (scripts/build-shell.mts). All motion is CSS transitions off that attribute,
// never `motion`: no React runtime exists to hydrate this markup on a zone.
import type { ElementType, ReactNode } from "react";
import {
  MENU_ENTER_DELAY,
  MENU_STEP,
  type HeaderMenuLabels,
  type HeaderNavItem,
} from "./header-shared";
import { HeaderSignOut } from "./header-sign-out";

interface HeaderMobileMenuProps {
  nav: readonly HeaderNavItem[];
  /** The bar's call-to-action, re-rendered at the top of the drawer. */
  cta?: ReactNode;
  /** Overlay-specific CTA (e.g. full-width variant); falls back to `cta`. */
  mobileCta?: ReactNode;
  linkComponent: ElementType;
  menuLabels: HeaderMenuLabels;
}

export function HeaderMobileMenu({
  nav,
  cta,
  mobileCta,
  linkComponent: L,
  menuLabels,
}: HeaderMobileMenuProps) {
  return (
    <>
      {/* Scrim. Clicking it closes — `data-menu-toggle` is matched by the
          delegated handler, so no listener of its own. Kept below the panel and
          above everything else the page can paint. */}
      <div
        data-slot="header-scrim"
        data-menu-toggle="close"
        aria-hidden
        className="invisible fixed inset-0 z-[65] bg-main-black/70 opacity-0 backdrop-blur-xs transition-[opacity,visibility] duration-300 ease-out group-data-[menu-open]/header:visible group-data-[menu-open]/header:opacity-100 lg:hidden"
      />

      {/* An aside drawer, not a full-screen takeover. It stays mounted and
          slides on one composited property, so open/close reverses mid-flight
          instead of restarting.
          The property is `translate`, NOT `transform`: Tailwind v4 compiles
          `translate-x-*` to the standalone `translate` property, so a
          transition list naming `transform` matches nothing and the panel
          teleports. Same trap on the rows below.
          `visibility` is in the transition list on purpose: it is discretely
          animated, so it flips to visible instantly on open and waits for the
          slide-out to finish on close — which is also what keeps the closed
          drawer out of the tab order and the accessibility tree, with no JS.
          Any `<a>`/`<button>` click inside closes it (delegation in
          header-behavior.ts), so the app-side CTA needs no wiring. */}
      <aside
        data-slot="header-mobile-overlay"
        aria-label={menuLabels.menu}
        className="invisible fixed top-0 right-0 z-[70] flex h-dvh w-80 max-w-[calc(100vw-3rem)] translate-x-full flex-col border-l border-main-mist/10 bg-main-black shadow-2xl shadow-main-black/60 transition-[translate,visibility] duration-300 ease-out group-data-[menu-open]/header:visible group-data-[menu-open]/header:translate-x-0 lg:hidden"
      >
        {/* The chip, not a "MENU" label. The label named the panel you were
            already looking at; the chip says who you are signed in as, which is
            the one thing this panel could tell you and didn't. It arrives on the
            same cascade as the rows but ahead of them — identity first, then
            destinations. `min-w-0` so a long address truncates inside the chip
            rather than pushing the close button off the edge. */}
        <div className="flex h-20 shrink-0 items-center justify-between gap-3 px-6">
          <div
            style={{ transitionDelay: `${MENU_ENTER_DELAY}ms` }}
            className="min-w-0 flex-1 translate-x-4 opacity-0 transition-[opacity,translate] duration-300 ease-out group-data-[menu-open]/header:translate-x-0 group-data-[menu-open]/header:opacity-100"
          >
            {mobileCta ?? cta}
          </div>
          <button
            type="button"
            data-menu-toggle="close"
            aria-label={menuLabels.close}
            className="-mr-2 flex size-10 items-center justify-center rounded-lg text-white transition-colors outline-none hover:bg-main-mist/10 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col px-6 font-mono-tech text-sm uppercase tracking-widest">
          {nav.map((item, i) => (
            <L
              key={item.href}
              href={item.href}
              // The rows arrive a beat behind the panel, one after another. The
              // delay is inline because it differs per row; on close it plays
              // in reverse, unseen, behind the drawer already sliding away.
              style={{
                transitionDelay: `${MENU_ENTER_DELAY + i * MENU_STEP}ms`,
              }}
              className="translate-x-4 border-b border-main-mist/10 py-4 text-main-mist/80 opacity-0 transition-[opacity,translate,color] duration-300 ease-out outline-none hover:text-main-accent-t1 focus-visible:text-main-accent-t1 group-data-[menu-open]/header:translate-x-0 group-data-[menu-open]/header:opacity-100"
            >
              {item.label}
            </L>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Shares the last row's beat — see HeaderSignOut for why it still
            enters on a different vector. */}
        <HeaderSignOut
          enterDelayMs={MENU_ENTER_DELAY + (nav.length - 1) * MENU_STEP}
        />
      </aside>
    </>
  );
}
