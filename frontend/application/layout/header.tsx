// THE header. The conductor owns it, and there is exactly one: SSR'd on
// conductor pages, and `renderToStaticMarkup` into the shell fragment injected
// over zone HTML (scripts/build-shell.mts) — zones never render chrome.
// Behavior is one implementation for both hosts:
// scripts/header-behavior.ts toggles `data-scrolled` /
// `data-menu-open` on the root, and the markup styles off them with
// `group-data-[...]/header:` variants — no React state, no hydration.
//   - The mobile overlay renders inline (a Portal renders nothing under
//     renderToStaticMarkup), gated by `data-menu-open`. `backdrop-blur` lives on
//     the inner bar div, not the root: a backdrop-filtered root would become the
//     containing block for the overlay's `fixed inset-0` and clamp it to the bar.
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
        <Container className="flex h-full items-center justify-between gap-4 group-data-[zone=cabinet]/header:max-w-none group-data-[zone=cabinet]/header:pl-[18px] group-data-[zone=cabinet]/header:pr-8">
          <L
            href="/"
            className="flex items-center gap-3 group-data-[zone=cabinet]/header:motion-safe:animate-in group-data-[zone=cabinet]/header:slide-in-from-right-6 group-data-[zone=cabinet]/header:duration-300 group-data-[zone=cabinet]/header:ease-out"
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

          <nav className="hidden items-center gap-6 font-mono-tech text-xs uppercase tracking-widest lg:flex">
            {nav.map(item => (
              <L
                key={item.href}
                href={item.href}
                className="text-main-mist/80 transition-colors hover:text-main-accent-t1"
              >
                {item.label}
              </L>
            ))}
          </nav>

          <div className="flex items-center gap-3 group-data-[zone=cabinet]/header:motion-safe:animate-in group-data-[zone=cabinet]/header:slide-in-from-left-6 group-data-[zone=cabinet]/header:duration-300 group-data-[zone=cabinet]/header:ease-out">
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

      {/* Below-`lg` navigation: a full-screen opaque overlay with its own close
          button. Any `<a>`/`<button>` click inside closes it (delegation in
          header-behavior.ts), so the app-side CTA needs no wiring. `display:
          none → flex` restarts the `animate-in` enter animation on every open.
          Layout: close bar → CTA/chip → separator → nav → flex-spacer → signout. */}
      <div
        data-slot="header-mobile-overlay"
        className="fixed inset-0 z-[70] hidden flex-col bg-main-black duration-200 animate-in fade-in group-data-[menu-open]/header:flex lg:group-data-[menu-open]/header:hidden"
      >
        <div className="flex h-20 shrink-0 items-center justify-end px-6">
          <button
            type="button"
            data-menu-toggle="close"
            aria-label="Close menu"
            className="flex size-10 items-center justify-center text-white"
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

        {(mobileCta ?? cta) && (
          <div className="px-6 pb-5 pt-1">{mobileCta ?? cta}</div>
        )}

        <div className="px-6 pb-2">
          <div className="h-px bg-border" />
        </div>

        <nav className="flex flex-col px-6 font-mono-tech text-sm uppercase tracking-widest duration-300 ease-out animate-in fade-in slide-in-from-top-4">
          {nav.map(item => (
            <L
              key={item.href}
              href={item.href}
              className="border-b border-main-mist/10 py-4 text-main-mist/80 transition-colors hover:text-main-accent-t1"
            >
              {item.label}
            </L>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="px-6 pb-10">
          <button
            type="button"
            data-action="signout"
            className="flex items-center gap-2 rounded-lg border border-destructive/20 px-3 py-2.5 text-sm font-medium text-destructive/70 transition-colors hover:bg-destructive/10"
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
      </div>
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
