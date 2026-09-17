// The signed-out entries into the cabinet, SSR'd as plain markup (issue #197):
// the homepage HTML used to carry no href to /cabinet at all, because the only
// entry was the account chip's client-rendered CTA. Rendered by both hosts —
// the conductor's <Header> and the zone fragment (scripts/build-shell.mts) —
// so nothing here may carry React state, `motion`, or `next/link`: cabinet
// links are hard cross-zone hrefs (PATTERNS §9).
//
// Session awareness is one attribute: scripts/header-behavior.ts stamps
// `data-session` on the header root from its single /api/auth/session read,
// and the pair hides itself under `authenticated` through the same
// `group-data-[...]/header:` variants the rest of the header styles off. Until
// the script runs (or without JS) the pair is what a visitor sees — the right
// default on a marketing site, where nearly every visitor is signed out.
//
// Plain styled <a>s, not uikit `<Button asChild>`: two of those as siblings
// desync React 19 hydration (PATTERNS §7). `data-cta` is what the
// CabinetEntryTracker reads to name the click in the funnel.
import type { HeaderAuthLinks } from "./header-shared";

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-ring";

// The bar's pair. The primary stays out of the burger below `sm`; only the
// secondary folds into the drawer (HeaderMenuCta), so the smallest viewport
// still shows one way in without a tap on the menu.
export function HeaderBarCta({ links }: { links: HeaderAuthLinks }) {
  return (
    <div
      data-slot="header-cta"
      className="flex items-center gap-3 group-data-[session=authenticated]/header:hidden"
    >
      <a
        href={links.cabinet.href}
        data-cta="cabinet"
        className={`hidden h-9 shrink-0 items-center px-2 font-mono-tech text-xs tracking-wider text-ink/80 transition-colors hover:text-primary-ink focus-visible:text-primary-ink sm:inline-flex ${FOCUS}`}
      >
        {links.cabinet.label}
      </a>
      <a
        href={links.openAccount.href}
        data-cta="open_account"
        className={`inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-primary px-3 font-mono-tech text-xs tracking-wider whitespace-nowrap text-on-primary transition-colors hover:bg-primary/90 sm:px-4 ${FOCUS}`}
      >
        {links.openAccount.label}
      </a>
    </div>
  );
}

// The drawer's identity slot for a signed-out reader: the secondary entry,
// full width, where the chip sits for a signed-in one. Styled like the chip's
// former sign-in CTA so the slot reads the same in both states.
export function HeaderMenuCta({ links }: { links: HeaderAuthLinks }) {
  return (
    <a
      href={links.cabinet.href}
      data-cta="cabinet"
      data-slot="header-menu-cta"
      className={`flex h-9 w-full items-center justify-center rounded-md border border-primary-ink px-4 font-mono-tech text-xs tracking-wider text-primary-ink transition-colors hover:bg-primary hover:text-on-primary group-data-[session=authenticated]/header:hidden ${FOCUS}`}
    >
      {links.cabinet.label}
    </a>
  );
}
