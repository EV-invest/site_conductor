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
// The parts sit beside this file, composed by BrandHeader and imported below.
import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { HeaderActions } from "@/shared/ui/header-actions";
import { localePath, translator, type Locale } from "@evinvest/i18n";
import { messagesFor } from "@/shared/config/i18n";
import { HeaderBar } from "./header-bar";
import { HeaderMobileMenu } from "./header-mobile-menu";
import {
  DEFAULT_MENU_LABELS,
  type HeaderMenuLabels,
  type HeaderNavItem,
} from "./header-shared";
import { NAV_ITEMS, localizeNav } from "./nav-items";

export type { HeaderNavItem, HeaderMenuLabels };

export interface BrandHeaderProps {
  nav: readonly HeaderNavItem[];
  /** Right-side call-to-action slot; also re-rendered at the mobile menu's bottom. */
  cta?: ReactNode;
  /** Overlay-specific CTA (e.g. full-width variant); falls back to `cta`. */
  mobileCta?: ReactNode;
  linkComponent?: ElementType;
  /**
   * Brand-logo target and its accessible name. Defaulted for the zone fragment,
   * which renders this header un-localised (scripts/build-shell.mts).
   */
  homeHref?: string;
  homeLabel?: string;
  menuLabels?: HeaderMenuLabels;
}

export function BrandHeader({
  nav,
  cta,
  mobileCta,
  linkComponent,
  homeHref = "/",
  homeLabel = "EV Investment — home",
  menuLabels = DEFAULT_MENU_LABELS,
}: BrandHeaderProps) {
  const L = linkComponent ?? "a";

  return (
    <header
      data-slot="header"
      className="group/header fixed top-0 left-0 z-[60] w-full"
    >
      <HeaderBar
        nav={nav}
        cta={cta}
        linkComponent={L}
        homeHref={homeHref}
        homeLabel={homeLabel}
        menuLabels={menuLabels}
      />
      <HeaderMobileMenu
        nav={nav}
        cta={cta}
        mobileCta={mobileCta}
        linkComponent={L}
        menuLabels={menuLabels}
      />
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
  locale,
}: {
  accountSlot?: ReactNode;
  mobileAccountSlot?: ReactNode;
  locale: Locale;
}) {
  // Server-side translation: this is a Server Component, so it reads the
  // catalogue directly rather than going through the client-side provider.
  const t = translator(messagesFor(locale), locale);
  return (
    <BrandHeader
      nav={localizeNav(NAV_ITEMS, locale, t)}
      homeHref={localePath(locale, "/")}
      homeLabel={t("a11y.homeLink")}
      menuLabels={{
        open: t("a11y.openMenu"),
        close: t("a11y.closeMenu"),
        menu: t("a11y.siteMenu"),
      }}
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
