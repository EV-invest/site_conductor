import { RemoteElement } from "@/shared/mfe";
import { findMfe } from "@/shared/mfe/registry";

// Server Component that mounts the account chip where the header CTA sits. The chip is a
// cabinet-served element remote (`cabinet.account` in mfe-registry.json), reached
// same-origin through the /cabinet/* zone mount — so its own /cabinet/api/auth/* calls stay
// first-party and it owns account state, sign-out, and the signed-out CTA. `findMfe` is
// server-only (node:fs), which is why this resolves here and is passed into the client
// Header as a slot — mirrors views/home/ui/portfolio/ui/portfolio.tsx.
export async function AccountChipRemote({ className }: { className?: string }) {
  const entry = await findMfe("cabinet.account");
  // The registry is in-repo static data; a missing entry is a broken build.
  if (!entry) throw new Error("cabinet.account missing from mfe-registry.json");
  return (
    <RemoteElement
      tag={entry.tag}
      scriptUrl={entry.scriptUrl}
      className={className}
    />
  );
}
