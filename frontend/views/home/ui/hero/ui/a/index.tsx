import { Text, Tier } from "@/shared/ui/text";
import { HeroACanvas } from "./canvas";
import { HeroACta } from "./cta";
import { HeroAStats } from "./stats";
import { HeroHeadline } from "./headline";

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

function HeroACtaAB() {
  return (
    <HeroACta
      scrollHint={
        <span className="text-[9px] font-mono-tech tracking-[0.3em] uppercase">
          Follow the money
        </span>
      }
    />
  );
}

function HeroCopy() {
  return (
    <HeroACanvas cta={<HeroACtaAB />}>
      <HeroHeadline />
      <Tier tier="main">
        <Text className="max-w-2xl mx-auto mb-12">
          Invest in Emergent Markets through Vietnam.<br />
          See why and how to invest directly.
          China+1 narrative ensures consistently increasing FDI inflows.<br />
          <strong>Edge</strong>: our visarun branch lets us keep a pulse on regional trends in foreign purchases.
        </Text>
      </Tier>
    </HeroACanvas>
  );
}
