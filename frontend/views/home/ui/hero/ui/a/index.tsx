import { preload } from "react-dom";
import type { Locale } from "@evinvest/i18n";

import { Text, Tier } from "@/shared/ui/text";
import { Reveal } from "@/shared/ui/motion";
import { ASSETS } from "@/shared/config/assets";
import { HeroACanvas } from "./canvas";
import { HeroACta } from "./cta";
import { HeroAStats } from "./stats";
import { HeroHeadline } from "./headline";
import { translate } from "@/shared/config/i18n";

/**
 * Variant A — scroll-zoom metaphor. Server Component.
 */
export function HeroA({ locale }: { locale: Locale }) {
  // The canvas paints this as a CSS `background-image`, which the preload
  // scanner cannot see — it is only discovered once styles resolve, well after
  // the font preloads have claimed the connection. Hoisting a real preload link
  // into <head> puts the above-the-fold art back at the front of the queue.
  preload(ASSETS.quynhon_future, { as: "image", fetchPriority: "high" });

  return (
    <section
      id="hero"
      className="relative h-screen flex flex-col justify-center items-center overflow-hidden z-10"
    >
      <HeroCopy locale={locale} />

      <HeroAStats locale={locale} />
    </section>
  );
}

// The hero's opening sequence, in beats: headline assembles (word stagger,
// ~0.4s), then the sub-copy, then the CTAs. Each delay starts a little before
// the previous beat ends so the sequence overlaps rather than marching.
const COPY_DELAY = 0.35;
const CTA_DELAY = 0.55;

function HeroACtaAB({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <Reveal
      onMount
      delay={CTA_DELAY}
      className="flex flex-col items-center gap-4"
    >
      <HeroACta
        scrollHint={
          <span className="text-[9px] font-mono-tech tracking-[0.3em] uppercase">
            {t("home.hero.scrollHint", "Follow the money")}
          </span>
        }
      />
    </Reveal>
  );
}

function HeroCopy({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <HeroACanvas cta={<HeroACtaAB locale={locale} />}>
      <HeroHeadline locale={locale} />
      <Reveal onMount delay={COPY_DELAY}>
        <Tier tier="main">
          <Text className="max-w-2xl mx-auto mb-12">
            {t(
              "home.hero.copy.line1",
              "Invest in Emergent Markets through Vietnam."
            )}
            <br />
            {t(
              "home.hero.copy.line2",
              "See why and how to invest directly. China+1 narrative ensures consistently increasing FDI inflows."
            )}
            <br />
            <strong>{t("home.hero.copy.edgeLabel", "Edge")}</strong>:{" "}
            {t(
              "home.hero.copy.edge",
              "our visarun branch lets us keep a pulse on regional trends in foreign purchases."
            )}
          </Text>
        </Tier>
      </Reveal>
    </HeroACanvas>
  );
}
