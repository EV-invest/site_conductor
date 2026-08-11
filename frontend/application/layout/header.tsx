// THE header. The conductor owns it, and there is exactly one: SSR'd on
// conductor pages, and `renderToStaticMarkup` into the shell fragment injected
// over zone HTML (scripts/build-shell.mts) — zones never render chrome.
// Behavior is one implementation for both hosts:
// scripts/header-behavior.ts toggles `data-scrolled` /
// `data-menu-open` on the root, and the markup styles off them with
// `group-data-[...]/header:` variants — no React state, no hydration.
//   - The mobile drawer + scrim render inline (a Portal renders nothing under
//     renderToStaticMarkup), gated by `data-menu-open`. `backdrop-blur` lives on
//     the inner bar div, not the root: a backdrop-filtered root would become the
//     containing block for their `fixed` boxes and clamp them to the bar.
//   - All motion here is CSS transitions off those data attributes, never
//     `motion` — this markup is also stringified into the zone shell, where no
//     React runtime exists to hydrate it.
//   - The bar is `fixed` and takes no layout space; the shell CSS pads the zone
//     document below it via the `--ev-shell-offset` token (build-shell.mts).
import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { Container, Logo } from "@evinvest/uikit";
import { HeaderActions } from "@/shared/ui/header-actions";
import { NAV_ITEMS } from "./nav-items";

export interface HeaderNavItem {
  label: string;
  href: string;
}

/** Milliseconds before the first drawer row moves — the panel leads, rows follow. */
const MENU_ENTER_DELAY = 90;
/** Milliseconds between drawer rows. */
const MENU_STEP = 45;

export interface BrandHeaderProps {
  nav: readonly HeaderNavItem[];
  /** Right-side call-to-action slot; also re-rendered at the mobile menu's bottom. */
  cta?: ReactNode;
  /** Overlay-specific CTA (e.g. full-width variant); falls back to `cta`. */
  mobileCta?: ReactNode;
  linkComponent?: ElementType;
}

export function BrandHeader({
  nav,
  cta,
  mobileCta,
  linkComponent,
}: BrandHeaderProps) {
  const L = linkComponent ?? "a";

  return (
    <header
      data-slot="header"
      className="group/header fixed top-0 left-0 z-[60] w-full"
    >
      <div className="border-b border-transparent bg-transparent py-6 transition-all duration-500 group-data-[scrolled]/header:border-main-mist/10 group-data-[scrolled]/header:bg-main-black/90 group-data-[scrolled]/header:py-4 group-data-[scrolled]/header:backdrop-blur-md group-data-[zone=cabinet]/header:border-main-mist/10 group-data-[zone=cabinet]/header:bg-main-black group-data-[zone=cabinet]/header:h-[calc(5.5rem+1px)] group-data-[zone=cabinet]/header:py-0">
        <Container className="flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-full items-center gap-4 group-data-[zone=cabinet]/header:max-w-none group-data-[zone=cabinet]/header:pl-[18px] group-data-[zone=cabinet]/header:pr-8">
          <L
            href="/"
            className="flex items-center gap-3"
            data-slot="header-logo"
            aria-label="EV Investment — home"
          >
            <Logo src="/assets/logo.svg" className="h-10 w-10 text-white" />
            <div className="flex flex-col">
              <span className="font-serif-display text-lg font-bold tracking-wider text-white">
                EV INVESTMENT
              </span>
              <span className="font-mono-tech text-[9px] uppercase tracking-[0.3em] text-main-accent-t1">
                Quy Nhon Fund
              </span>
            </div>
          </L>

          {/* The underline is a scaled pseudo-element, not a border: scaling a
              composited transform costs no layout, and `origin-left` makes it
              wipe in from the start of the word rather than grow from centre. */}
          <nav className="hidden items-center gap-6 font-mono-tech text-xs uppercase tracking-widest lg:flex">
            {nav.map(item => (
              <L
                key={item.href}
                href={item.href}
                className="relative text-main-mist/80 transition-colors outline-none after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-main-accent-t1 after:transition-transform after:duration-300 after:ease-out hover:text-main-accent-t1 hover:after:scale-x-100 focus-visible:text-main-accent-t1 focus-visible:after:scale-x-100"
              >
                {item.label}
              </L>
            ))}
          </nav>

          <div
            data-slot="header-actions"
            className="flex items-center gap-3 lg:justify-self-end"
          >
            {cta}
            <button
              type="button"
              data-menu-toggle="open"
              aria-label="Open menu"
              aria-expanded="false"
              aria-haspopup="menu"
              className="flex size-10 items-center justify-center text-white lg:hidden"
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
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </Container>
      </div>

      {/* Scrim. Clicking it closes — `data-menu-toggle` is matched by the
          delegated handler, so no listener of its own. Kept below the panel and
          above everything else the page can paint. */}
      <div
        data-slot="header-scrim"
        data-menu-toggle="close"
        aria-hidden
        className="invisible fixed inset-0 z-[65] bg-main-black/70 opacity-0 backdrop-blur-xs transition-[opacity,visibility] duration-300 ease-out group-data-[menu-open]/header:visible group-data-[menu-open]/header:opacity-100 lg:hidden"
      />

      {/* Below-`lg` navigation: an aside drawer, not a full-screen takeover.
          It stays mounted and slides on one composited property, so open/close
          reverses mid-flight instead of restarting.
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
        aria-label="Site menu"
        className="invisible fixed top-0 right-0 z-[70] flex h-dvh w-80 max-w-[calc(100vw-3rem)] translate-x-full flex-col border-l border-main-mist/10 bg-main-black shadow-2xl shadow-main-black/60 transition-[translate,visibility] duration-300 ease-out group-data-[menu-open]/header:visible group-data-[menu-open]/header:translate-x-0 lg:hidden"
      >
        <div className="flex h-20 shrink-0 items-center justify-between px-6">
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.3em] text-main-accent-t1">
            Menu
          </span>
          <button
            type="button"
            data-menu-toggle="close"
            aria-label="Close menu"
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

        {(mobileCta ?? cta) && (
          <div className="px-6 pt-6">{mobileCta ?? cta}</div>
        )}

        <div className="flex-1" />

        <div className="px-6 pb-10">
          <button
            type="button"
            data-action="signout"
            // Starts hidden — the static markup has no session awareness of its
            // own; header-behavior.ts reveals it only once /api/auth/session
            // confirms a signed-in principal.
            hidden
            className="flex items-center gap-2 rounded-lg border border-destructive/20 px-3 py-2.5 text-sm font-medium text-destructive/70 transition-colors outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </header>
  );
}

// The conductor's wired header: nav items, `next/link`, and the CTA cluster. The
// account chip is a cabinet element remote resolved server-side in
// `app/layout.tsx` and threaded down as `accountSlot`; route-owned actions
// (`HeaderActions`) slot in left of the chip.
export function Header({
  accountSlot,
  mobileAccountSlot,
}: {
  accountSlot?: ReactNode;
  mobileAccountSlot?: ReactNode;
}) {
  return (
    <BrandHeader
      nav={NAV_ITEMS}
      linkComponent={Link}
      cta={
        <>
          <HeaderActions />
          {accountSlot}
        </>
      }
      mobileCta={mobileAccountSlot}
    />
  );
}
