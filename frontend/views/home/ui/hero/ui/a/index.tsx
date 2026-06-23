import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";
import { Text } from "@/shared/ui/text";
import { HeroACanvas } from "./canvas";
import { HeroACta, ScrollTextA, ScrollTextB } from "./cta";
import { HeroAStats } from "./stats";

/**
 * Variant A — scroll-zoom metaphor. Server Component.
 */
export function HeroA() {
  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col justify-center items-center overflow-hidden z-10"
    >
      <HeroCopy />

      <HeroAStats />
    </section>
  );
}

/**
 * Server-resolved scroll hint — `getVariant` reads a cookie, so the variant is
 * picked here and the chosen node handed to the client {@link HeroACta} as a prop.
 */
async function HeroACtaAB() {
  const variant = await getVariant("scroll_down_text");
  return (
    <HeroACta
      scrollHint={
        <ExperimentTracker experiment="scroll_down_text" variant={variant}>
          {match(variant, { a: <ScrollTextA />, b: <ScrollTextB /> })}
        </ExperimentTracker>
      }
    />
  );
}

function HeroCopy() {
  return (
    <HeroACanvas cta={<HeroACtaAB />}>
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif-display font-light text-white leading-tight mb-6">
        Invest in{" "}
        <span className="italic text-main-accent-t1 font-serif">Vietnam</span>
        <br />
        Through Institutional Vision.
      </h1>
      <Text className="sm:text-base md:text-lg max-w-2xl mx-auto mb-12">
        Invest in Emergent Markets through Vietnam.<br />
        See why and how to invest directly.
        China+1 narrative ensures consistently increasing FDI inflows.<br />
        <strong>Edge</strong>: our visarun branch lets us keep a pulse on regional trends in foreign purchases.
      </Text>
    </HeroACanvas>
  );
}
