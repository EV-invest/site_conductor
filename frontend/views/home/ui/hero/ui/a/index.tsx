import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";
import { Text } from "@/shared/ui/text";
import { HeroACanvas } from "./canvas";
import { HeroACta } from "./cta";
import { HeroAStats } from "./stats";

/**
Variant A — scroll-zoom metaphor. Server Component.
**/
export function HeroA() {
  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col justify-center items-center overflow-hidden z-10"
    >
      <HeroACopy />

      <HeroAStats />
    </section>
  );
}

/** Nested A/B — the copy inside the scroll-zoom canvas, tested on its own. */
async function HeroACopy() {
  const variant = await getVariant("hero_contents");
  return (
    <ExperimentTracker experiment="hero_contents" variant={variant}>
      {match(variant, { a: <CopyA />, b: <CopyB /> })}
    </ExperimentTracker>
  );
}

function CopyA() {
  return (
    <HeroACanvas cta={<HeroACta />}>
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif-display font-light text-white leading-tight mb-6">
        Invest in{" "}
        <span className="italic text-main-accent-t1 font-serif">Quy Nhon</span>
        <br />
        Through Institutional Vision.
      </h1>
      <Text className="sm:text-base md:text-lg max-w-2xl mx-auto mb-12">
        EV Investment bridges the gap between premium coastal real estate
        development and sophisticated investors. Experience high-yield real
        estate assets in Vietnam&apos;s fastest-growing coastal hub.
      </Text>
    </HeroACanvas>
  );
}

function CopyB() {
  return (
    <HeroACanvas cta={<HeroACta />}>
      <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif-display font-light text-white leading-tight mb-6">
        Invest in{" "}
        <span className="italic text-main-accent-t1 font-serif">Quy Nhon</span>
        <br />
        Through Institutional Vision.
      </h1>
      <Text className="sm:text-base md:text-lg max-w-2xl mx-auto mb-12">
        EV Investment bridges the gap between premium coastal real estate
        development and sophisticated investors. Experience high-yield real
        estate assets in Vietnam&apos;s fastest-growing coastal hub.
      </Text>
    </HeroACanvas>
  );
}
