import type { Locale } from "@evinvest/i18n";
import { RemoteElement } from "@/shared/mfe";
import { findMfe } from "@/shared/mfe/registry";
import { translate } from "@/shared/config/i18n";
import { CabinetEntryTracker } from "./cabinet-entry-tracker";
import { HeaderBarCta, HeaderMenuCta } from "./header-cta";
import {
  CHIP_ATTRIBUTES,
  CHIP_BAR_CLASS,
  CHIP_MENU_CLASS,
} from "./header-shared";
import { authLinks } from "./nav-items";

// Server Component that mounts the account chip where the header CTA sits. The chip is a
// cabinet-served element remote (`cabinet.account` in mfe-registry.json), reached
// same-origin through the /cabinet/* zone mount — so its own /cabinet/api/auth/* calls stay
// first-party and it owns account state and sign-out. `findMfe` is server-only (node:fs),
// which is why this resolves here and is passed into the client Header as a slot —
// mirrors views/home/ui/portfolio/ui/portfolio.tsx.
export async function AccountChipRemote({ className }: { className?: string }) {
  const entry = await findMfe("cabinet.account");
  // The registry is in-repo static data; a missing entry is a broken build.
  if (!entry) throw new Error("cabinet.account missing from mfe-registry.json");
  return (
    <RemoteElement
      tag={entry.tag}
      scriptUrl={entry.scriptUrl}
      attributes={CHIP_ATTRIBUTES}
      className={className}
    />
  );
}

// The two placements of the cabinet entries in the shell, each wrapped in the
// entry tracker with its funnel `location`. Kept here, next to the remote, so
// the document only composes them and the header/menu split lives in one place.
export function HeaderAccountSlot({ locale }: { locale: Locale }) {
  return (
    <CabinetEntryTracker location="header">
      <HeaderBarCta links={authLinks(locale, translate(locale))} />
      <AccountChipRemote className={CHIP_BAR_CLASS} />
    </CabinetEntryTracker>
  );
}

export function MenuAccountSlot({ locale }: { locale: Locale }) {
  return (
    <CabinetEntryTracker location="menu">
      <HeaderMenuCta links={authLinks(locale, translate(locale))} />
      <AccountChipRemote className={CHIP_MENU_CLASS} />
    </CabinetEntryTracker>
  );
}
