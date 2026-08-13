import { preload } from "react-dom";
import { translator, type Locale } from "@evinvest/i18n";

import { Text, Tier } from "@/shared/ui/text";
import { Reveal } from "@/shared/ui/motion";
import { ASSETS } from "@/shared/config/assets";
import { HeroACanvas } from "./canvas";
import { HeroACta } from "./cta";
import { HeroAStats } from "./stats";
import { HeroHeadline } from "./headline";
import { messagesFor } from "@/shared/config/i18n";

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
  const t = translator(messagesFor(locale), locale);
  return (
    <Reveal
      onMount
      delay={CTA_DELAY}
      className="flex flex-col items-center gap-4"
    >
      <HeroACta
        scrollHint={
          <span className="text-[9px] font-mono-tech tracking-[0.3em] uppercase">
            {t("home.hero.scrollHint")}
          </span>
        }
      />
    </Reveal>
  );
}

function HeroCopy({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <HeroACanvas cta={<HeroACtaAB locale={locale} />}>
      <HeroHeadline locale={locale} />
      <Reveal onMount delay={COPY_DELAY}>
        <Tier tier="main">
          <Text className="max-w-2xl mx-auto mb-12">
            {t("home.hero.copy.line1")}
            <br />
            {t("home.hero.copy.line2")}
            <br />
            <strong>{t("home.hero.copy.edgeLabel")}</strong>:{" "}
            {t("home.hero.copy.edge")}
          </Text>
        </Tier>
      </Reveal>
    </HeroACanvas>
  );
}
