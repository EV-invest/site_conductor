import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";
import { Text, Tier } from "@/shared/ui/text";
import { HeroBCta } from "./cta";
import { BoardroomImage } from "./boardroom";
import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

/**
 * Variant B — calmer editorial split: left-aligned headline + CTA, framed image
 * on the right. No scroll-zoom (the A/B differentiator), so it reads as a
 * content-first hero. Server Component; the only client island is {@link HeroBCta}.
 */
export function HeroB({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden z-10 bg-main-black"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px] pointer-events-none" />

      <Container className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-28">
        {/* Left: editorial copy */}
        <div className="space-y-8">
          <span className="block text-xs font-mono-tech text-main-accent-t1 tracking-[0.3em] uppercase">
            {t("home.hero.b.eyebrow")}
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif-display font-light text-white leading-[1.05]">
            <Accented
              text={t("home.hero.b.headline")}
              className="italic text-main-accent-t1 font-serif"
            />
          </h1>

          <Tier tier="main">
            <Text className="max-w-xl">{t("home.hero.b.copy")}</Text>
          </Tier>

          <div className="flex flex-wrap items-center gap-8 pt-2">
            <HeroBCta className="bg-main-mist text-main-brand hover:bg-main-accent-t1 hover:text-main-black hover:scale-105 active:scale-95 transition-all duration-300 font-mono-tech text-xs tracking-widest uppercase px-8 py-6 rounded-none" />

            <div>
              <Text
                variant="secondary"
                className="text-[10px] font-mono-tech uppercase tracking-widest mb-1"
              >
                {t("home.hero.stat.targetIrr")}
              </Text>
              <p className="text-2xl sm:text-3xl font-serif-display text-main-accent-t3 font-bold">
                22.4% +
              </p>
            </div>
          </div>
        </div>

        {/* Right: framed image */}
        <BoardroomImage locale={locale} />
      </Container>
    </section>
  );
}
