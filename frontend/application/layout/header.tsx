"use client";

// The EV brand chrome header, absorbed from @evinvest/uikit@0.6.0: with zones
// chromeless, the conductor is its only consumer. One markup serves two hosts —
// hydrated React on conductor pages, and `renderToStaticMarkup` into the shell
// fragment injected over zone HTML (scripts/build-shell.mts). That dual life
// dictates the shape:
//   - State is expressed as data attributes on the root (`data-scrolled`,
//     `data-menu-open`) with `group-data-[...]/header:` Tailwind variants, so
//     the rendered class set is identical either way and the static markup is
//     style-complete. React toggles the attributes; in zones a ~30-line vanilla
//     script (scripts/header-behavior.ts) does, via the `data-menu-toggle`
//     markers — no React in zones.
//   - The mobile overlay renders inline (a Portal renders nothing under
//     renderToStaticMarkup), gated by `data-menu-open`. `backdrop-blur` lives on
//     the inner bar div, not the root: a backdrop-filtered root would become the
//     containing block for the overlay's `fixed inset-0` and clamp it to the bar.
//   - `compact` is sticky, not fixed: it takes layout space, so zones need zero
//     knowledge of the header's height beyond the `--ev-shell-offset` token.
import { useEffect, useState, type ElementType, type ReactNode } from "react";
import Link from "next/link";
import { cn, Container, Logo } from "@evinvest/uikit";
import { HeaderActions } from "@/shared/ui/header-actions";
import { NAV_ITEMS } from "./nav-items";

export interface HeaderNavItem {
  label: string;
  href: string;
}

/** Chrome density preset — see the `variant` prop on {@link BrandHeaderProps}. */
export type HeaderVariant = "marketing" | "compact";

export interface BrandHeaderProps {
  nav: readonly HeaderNavItem[];
  /** Right-side call-to-action slot; also re-rendered at the mobile menu's bottom. */
  cta?: ReactNode;
  /** Overlay-specific CTA (e.g. full-width variant); falls back to `cta`. */
  mobileCta?: ReactNode;
  tagline?: string;
  homeHref?: string;
  className?: string;
  linkComponent?: ElementType;
  /**
   * Chrome density, per host surface.
   * - `"marketing"` (default): the scroll-aware bar — tall and transparent over a
   *   hero, condensing to an opaque blurred bar past 50px.
   * - `"compact"`: a sticky short, opaque bar for zone surfaces — it takes layout
   *   space, so zone content flows beneath it with no padding knowledge.
   */
  variant?: HeaderVariant;
  /** Drop the primary nav — the desktop row and the mobile menu — keeping only the
   *  lockup and CTA. The lockup still links home. */
  hideNav?: boolean;
}

export function BrandHeader({
  nav,
  cta,
  mobileCta,
  tagline = "Quy Nhon Fund",
  homeHref = "/",
  className,
  linkComponent,
  variant = "marketing",
  hideNav = false,
}: BrandHeaderProps) {
  const L = linkComponent ?? "a";
  const compact = variant === "compact";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Compact keeps a fixed height, so it never needs the scroll position.
    if (compact) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [compact]);

  // Lock body scroll while the mobile menu is open and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header
      data-slot="header"
      data-variant={variant}
      data-scrolled={scrolled ? "" : undefined}
      data-menu-open={menuOpen ? "" : undefined}
      className={cn(
        "group/header top-0 left-0 z-[60] w-full",
        compact ? "sticky" : "fixed",
        className
      )}
    >
      <div
        className={cn(
          "border-b",
          compact
            ? // A 4rem bar (py-3 + the 40px lockup): opaque by default so zone
              // content beneath it never bleeds through.
              "h-16 border-main-mist/10 bg-main-black/90 backdrop-blur-md"
            : cn(
                "border-transparent bg-transparent py-6 transition-all duration-500",
                "group-data-[scrolled]/header:border-main-mist/10 group-data-[scrolled]/header:bg-main-black/90 group-data-[scrolled]/header:py-4 group-data-[scrolled]/header:backdrop-blur-md"
              )
        )}
      >
        <Container className="flex h-full items-center justify-between gap-4">
          <L
            href={homeHref}
            className="flex items-center gap-3"
            aria-label="EV Investment — home"
          >
            <Logo className="h-10 w-10 text-white" />
            <div className="flex flex-col">
              <span className="font-serif-display text-lg font-bold tracking-wider text-white">
                EV INVESTMENT
              </span>
              <span className="font-mono-tech text-[9px] uppercase tracking-[0.3em] text-main-accent-t1">
                {tagline}
              </span>
            </div>
          </L>

          {!hideNav && (
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
          )}

          <div className="flex items-center gap-3">
            {cta}
            {!hideNav && (
              <button
                type="button"
                data-menu-toggle="open"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen(true)}
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
            )}
          </div>
        </Container>
      </div>

      {/* Below-`lg` navigation: a full-screen opaque overlay with its own close
          button. Any `<a>`/`<button>` click inside closes it (delegation), so
          the app-side CTA needs no wiring. `display: none → flex` restarts the
          `animate-in` enter animation on every open. */}
      {!hideNav && (
        <div
          data-slot="header-mobile-overlay"
          onClick={e => {
            if ((e.target as Element).closest("a, button")) setMenuOpen(false);
          }}
          className="fixed inset-0 z-[70] hidden flex-col bg-main-black px-6 pb-10 duration-200 animate-in fade-in group-data-[menu-open]/header:flex lg:group-data-[menu-open]/header:hidden"
        >
          <div className="flex h-20 shrink-0 items-center justify-end">
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
          <nav className="flex flex-col font-mono-tech text-sm uppercase tracking-widest duration-300 ease-out animate-in fade-in slide-in-from-top-4">
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
          {(mobileCta ?? cta) && (
            <div className="mt-8 block w-full">{mobileCta ?? cta}</div>
          )}
        </div>
      )}
    </header>
  );
}

// The conductor's wired header: nav items, `next/link` (client boundary on
// purpose — a function prop cannot cross the server→client boundary), and the
// CTA cluster. The account chip is a cabinet element remote resolved
// server-side in `app/layout.tsx` and threaded down as `accountSlot`;
// route-owned actions (`HeaderActions`) slot in left of the chip.
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
