import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";
import { CabinetFirstCta } from "./cabinet-first";
import { ExploreFirstCta } from "./explore-first";
import type { HeroCtaAlign } from "./row";

/**
 * Server Component — the hero's CTA row, shared by both hero variants, owning
 * its own `hero_cta` A/B decision the way {@link HeroHeadline} owns the
 * headline's. Nested inside the `hero` tracker, so the islands below emit
 * against `hero_cta` and carry *its* arm as `variant`.
 */
export async function HeroCta({ align }: { align: HeroCtaAlign }) {
  const variant = await getVariant("hero_cta");
  return (
    <ExperimentTracker experiment="hero_cta" variant={variant}>
      {match(variant, {
        a: <CabinetFirstCta align={align} />,
        b: <ExploreFirstCta align={align} />,
      })}
    </ExperimentTracker>
  );
}
