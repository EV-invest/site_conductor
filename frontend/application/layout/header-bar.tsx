// The bar itself: brand lockup, desktop nav, and the actions cluster that
// carries the CTA and the below-`lg` menu toggle. Styling reacts to
// `data-scrolled` / `data-zone` on the header root through
// `group-data-[...]/header:` variants — no React state, no hydration, since
// this markup is also stringified into the zone shell (scripts/build-shell.mts).
// `backdrop-blur` belongs on this inner div and never on the root: a
// backdrop-filtered root would become the containing block for the drawer and
// scrim's `fixed` boxes and clamp them to the bar.
import type { ElementType, ReactNode } from "react";
import { Container, Logo } from "@evinvest/uikit";
import type { HeaderMenuLabels, HeaderNavItem } from "./header-shared";

interface HeaderBarProps {
  nav: readonly HeaderNavItem[];
  cta?: ReactNode;
  linkComponent: ElementType;
  homeHref: string;
  homeLabel: string;
  menuLabels: HeaderMenuLabels;
}

export function HeaderBar({
  nav,
  cta,
  linkComponent: L,
  homeHref,
  homeLabel,
  menuLabels,
}: HeaderBarProps) {
  return (
    <div className="border-b border-transparent bg-transparent py-6 transition-all duration-500 group-data-[scrolled]/header:border-main-mist/10 group-data-[scrolled]/header:bg-main-black/90 group-data-[scrolled]/header:py-4 group-data-[scrolled]/header:backdrop-blur-md group-data-[zone=cabinet]/header:border-main-mist/10 group-data-[zone=cabinet]/header:bg-main-black group-data-[zone=cabinet]/header:h-[calc(5.5rem+1px)] group-data-[zone=cabinet]/header:py-0">
      <Container className="flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-full items-center gap-4 group-data-[zone=cabinet]/header:max-w-none group-data-[zone=cabinet]/header:pl-[18px] group-data-[zone=cabinet]/header:pr-8">
        <L
          href={homeHref}
          className="flex items-center gap-3"
          data-slot="header-logo"
          aria-label={homeLabel}
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
            aria-label={menuLabels.open}
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
  );
}
