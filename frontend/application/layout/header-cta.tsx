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
// uikit `Button` with `href`, not `asChild`: it renders a plain
// `<a data-slot="button">` with no Slot and no client JS, so it serialises
// under `renderToStaticMarkup` like `Container` and `Logo` already do, and the
// §7 sibling-hydration trap (a Slot thing) does not apply. `data-cta` is what
// the CabinetEntryTracker reads to name the click in the funnel.
import { Button } from "@evinvest/uikit";
import type { HeaderAuthLinks } from "./header-shared";

// The header's type — the nav beside it is mono-tech, not the button's sans —
// and the solid focus ring: the button base ships a tinted `ring-ring/50`,
// which measures ~2:1 on these surfaces and misses the 3:1 floor.
const HEADER_BUTTON =
  "font-mono-tech text-xs tracking-wider focus-visible:ring-2 focus-visible:ring-ring";

// The bar's pair. The primary stays out of the burger below `sm`; only the
// secondary folds into the drawer (HeaderMenuCta), so the smallest viewport
// still shows one way in without a tap on the menu.
export function HeaderBarCta({ links }: { links: HeaderAuthLinks }) {
  return (
    <div
      data-slot="header-cta"
      className="flex items-center gap-3 group-data-[session=authenticated]/header:hidden"
    >
      <Button
        href={links.cabinet.href}
        variant="ghost"
        size="md"
        data-cta="cabinet"
        className={`hidden text-ink-mid hover:text-primary-ink sm:inline-flex ${HEADER_BUTTON}`}
      >
        {links.cabinet.label}
      </Button>
      <Button
        href={links.openAccount.href}
        variant="primary"
        size="md"
        data-cta="open_account"
        className={HEADER_BUTTON}
      >
        {links.openAccount.label}
      </Button>
    </div>
  );
}

// The drawer's identity slot for a signed-out reader: the secondary entry,
// full width, where the chip sits for a signed-in one. The system `outline`
// variant, not a hand-rolled primary-outline — that set already drifted once
// in the cabinet's chip.
export function HeaderMenuCta({ links }: { links: HeaderAuthLinks }) {
  return (
    <Button
      href={links.cabinet.href}
      variant="outline"
      size="md"
      data-cta="cabinet"
      className={`w-full group-data-[session=authenticated]/header:hidden ${HEADER_BUTTON}`}
    >
      {links.cabinet.label}
    </Button>
  );
}
