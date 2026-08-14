import type { Locale } from "@evinvest/i18n";

import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";
import { HeroA } from "./a";
import { HeroB } from "./b";

/**
 * Server wrapper — owns the Hero's A/B decision.
 *
 * `HomeView` renders `<Hero />` and is unaware that it's tested. The chosen
 * variant is created server-side so only its chunk reaches the client.
 * {@link ExperimentTracker} fires the exposure event and provides variant
 * context to client islands inside the chosen variant.
 */
export async function Hero({ locale }: { locale: Locale }) {
  const variant = await getVariant("hero");
  return (
    <ExperimentTracker experiment="hero" variant={variant}>
      {match(variant, {
        a: <HeroA locale={locale} />,
        b: <HeroB locale={locale} />,
      })}
    </ExperimentTracker>
  );
}
