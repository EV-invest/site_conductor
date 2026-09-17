import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";
import { Text, Tier } from "@/shared/ui/text";
import { HeroCta } from "../cta";
import { BoardroomImage } from "./boardroom";
import { translate } from "@/shared/config/i18n";
import { formatFundFigures } from "@/shared/lib/fund-figures";
import { Accented } from "@/shared/ui/accented";

/**
 * Variant B — calmer editorial split: left-aligned headline + CTA, framed image
 * on the right. No scroll-zoom (the A/B differentiator), so it reads as a
 * content-first hero. Server Component; the only client islands are the CTA
 * row's ({@link HeroCta}).
 */
export function HeroB({ locale }: { locale: Locale }) {
  const t = translate(locale);
  const figures = formatFundFigures(locale);
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden z-10 bg-background"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] pointer-events-none" />

      <Container className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-28">
        {/* Left: editorial copy */}
        <div className="space-y-8">
          <span className="block text-xs font-mono-tech text-primary-ink tracking-[0.3em] uppercase">
            {t("home.hero.b.eyebrow", "Institutional Real Estate • Quy Nhon")}
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-display font-light text-white leading-[1.05]">
            <Accented
              text={t(
                "home.hero.b.headline",
                "Invest in *Quy Nhon*\nThrough Institutional Vision."
              )}
              className="italic text-primary-ink font-serif"
            />
          </h1>

          <Tier tier="main">
            <Text className="max-w-xl">
              {t(
                "home.hero.b.copy",
                "EV Investment bridges the gap between premium coastal real estate development and sophisticated investors. Experience high-yield real estate assets in Vietnam's fastest-growing coastal hub."
              )}
            </Text>
          </Tier>

          <div className="flex flex-wrap items-center gap-8 pt-2">
            <HeroCta align="start" />

            {/* The same figure as Hero A's ribbon, from the same constant (#204):
                a variant must never quote a different fund than the control. */}
            <div className="shrink-0">
              <Text
                variant="secondary"
                className="text-xs font-mono-tech uppercase tracking-widest mb-1"
              >
                {t("home.hero.stat.targetIrr", "Target IRR")}
              </Text>
              <p className="text-2xl sm:text-3xl font-serif-display text-accent-warn font-bold">
                {figures.targetIrr}
              </p>
              {figures.asOf && (
                <Text
                  variant="secondary"
                  className="text-xs font-mono-tech uppercase tracking-widest mt-1"
                >
                  {t("home.hero.stat.asOf", "Figures as of {date}", {
                    date: figures.asOf,
                  })}
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Right: framed image */}
        <BoardroomImage locale={locale} />
      </Container>
    </section>
  );
}
