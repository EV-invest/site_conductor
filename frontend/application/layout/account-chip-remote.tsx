import { RemoteElement } from "@/shared/mfe";
import { findMfe } from "@/shared/mfe/registry";
import { InvestorPortalButton } from "./investor-portal-button";

// Server Component that mounts the account chip where the header CTA sits. The chip is a
// cabinet-served element remote (`cabinet.account` in mfe-registry.json), reached
// same-origin through the /cabinet/* rewrite — so its own /cabinet/api/auth/* calls stay
// first-party and it owns account state, sign-out, and the signed-out CTA. Falls back to
// the Investor Portal button while the bundle upgrades, if it fails to load, or if the
// registry entry is missing, so the header never gaps. `findMfe` is server-only (node:fs),
// which is why this resolves here and is passed into the client Header as a slot — mirrors
// views/home/ui/portfolio/ui/portfolio.tsx.
export async function AccountChipRemote({
  className,
  fallbackClassName,
}: {
  className?: string;
  fallbackClassName?: string;
}) {
  const entry = await findMfe("cabinet.account");
  if (!entry) return <InvestorPortalButton className={fallbackClassName} />;
  return (
    <RemoteElement
      tag={entry.tag}
      scriptUrl={entry.scriptUrl}
      className={className}
      fallback={<InvestorPortalButton className={fallbackClassName} />}
    />
  );
}
