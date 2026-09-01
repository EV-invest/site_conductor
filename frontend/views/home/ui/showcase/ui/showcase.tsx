import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { Reveal, SplitText } from "@/shared/ui/motion";
import { Text, Tier } from "@/shared/ui/text";
import { accented } from "@/shared/ui/accented";
import { messagesFor } from "@/shared/config/i18n";
import { HOLD_YEARS } from "../model/trajectory";
import { TrajectoryChart } from "./trajectory-chart";
import { ShowcaseMetrics } from "./metrics";

/**
 * "The thesis in numbers" — the section between the research block and the team.
 *
 * It exists to answer the one question a reader has after the portfolio and
 * before the people: *what does this compound to?* One curve and three figures,
 * all derived from the single published target rate in `../model/trajectory` —
 * nothing here is a performance claim, and `home.showcase.disclaimer` says so in
 * the markup rather than in a footnote nobody renders.
 *
 * Server Component. The client islands are the chart (it has to observe the
 * viewport to plot itself), the counters inside it, and the motion wrappers.
 * The chart takes its strings as props rather than calling `messagesFor` — a
 * client component that imports the catalogue drags all five languages into the
 * browser bundle.
 */
export function Showcase({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  // Only the hold length is interpolated. The target *rate* is written out in
  // each catalogue instead: ICU interpolation stringifies a number with a dot,
  // and "16.4%" is simply wrong in ru, fr and de, all of which take a comma.
  const values = { years: HOLD_YEARS };
  return (
    <section
      id="thesis"
      className="relative border-t border-main-mist/10 bg-main-black py-24"
    >
      <Container className="space-y-12">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="space-y-5 lg:col-span-7">
              <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-main-accent-t1">
                {t("home.showcase.eyebrow")}
              </span>
              <h2 className="font-serif-display text-3xl font-light leading-[1.15] text-white sm:text-4xl">
                <SplitText inView>
                  {accented({ text: t("home.showcase.title", values) })}
                </SplitText>
              </h2>
            </div>
            <Tier tier="main">
              <Text className="lg:col-span-5">
                {t("home.showcase.intro", values)}
              </Text>
            </Tier>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid overflow-hidden rounded-xl border border-main-mist/10 bg-main-card lg:grid-cols-5">
            {/* The divider flips from a bottom rule to a right rule at the same
                breakpoint the grid turns horizontal, so the card never shows a
                hairline that ends in the middle of nothing. */}
            <div className="border-b border-main-mist/10 p-6 sm:p-8 lg:col-span-3 lg:border-b-0 lg:border-r">
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-serif-display text-lg text-white">
                  {t("home.showcase.chart.title")}
                </h3>
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-main-mist/40">
                  {t("home.showcase.chart.legend", values)}
                </span>
              </div>
              <TrajectoryChart
                locale={locale}
                alt={t("home.showcase.chart.alt", values)}
                axisLabel={t("home.showcase.chart.axis")}
              />
            </div>
            <div className="lg:col-span-2">
              <ShowcaseMetrics locale={locale} />
            </div>
          </div>
        </Reveal>

        <p className="max-w-3xl font-mono-tech text-[11px] leading-relaxed text-main-mist/35">
          {t("home.showcase.disclaimer", values)}
        </p>
      </Container>
    </section>
  );
}
