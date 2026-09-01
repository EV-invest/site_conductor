import { translator, type Locale } from "@evinvest/i18n";

import { CountUp, Stagger, StaggerItem } from "@/shared/ui/motion";
import { messagesFor } from "@/shared/config/i18n";
import { EXIT_MULTIPLE, HOLD_YEARS, TARGET_IRR_PCT } from "../model/trajectory";

/**
 * The three figures beside the curve, in the palette's declared order of
 * seniority: t3 (Rice Gold) for the headline return, t2 (Jungle Green) for the
 * positive signal it compounds into, t1 (Ha Long Teal) for the structural
 * number that is neither.
 *
 * Two labels are borrowed from the hero ribbon rather than duplicated. They name
 * the *same* quantities, and a second English string reading "Target IRR" would
 * eventually be translated differently from the first — the section would then
 * disagree with the top of the same page in four languages, and nobody reading
 * only English would ever see it.
 *
 * `prefix`/`suffix` are spelled out on every entry, empty string included, so
 * the array has one shape and spreads into {@link CountUp} without widening to
 * a union of partial figures.
 */
const METRICS = [
  {
    id: "irr",
    labelKey: "home.hero.stat.targetIrr",
    tone: "text-main-accent-t3",
    figure: { value: TARGET_IRR_PCT, decimals: 1, prefix: "", suffix: "%" },
  },
  {
    id: "multiple",
    labelKey: "home.showcase.metric.multiple.label",
    tone: "text-main-accent-t2",
    figure: { value: EXIT_MULTIPLE, decimals: 2, prefix: "×", suffix: "" },
  },
  {
    id: "cap",
    labelKey: "home.hero.stat.aumCap",
    tone: "text-main-accent-t1",
    figure: { value: 100, decimals: 0, prefix: "$", suffix: "M" },
  },
] as const;

/** The figures column beside the chart. Server Component; only the counters
 *  and the stagger wrapper are client islands. */
export function ShowcaseMetrics({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  const values = { years: HOLD_YEARS };
  return (
    <Stagger className="flex h-full flex-col">
      {METRICS.map(({ id, labelKey, tone, figure }) => (
        <StaggerItem
          key={id}
          // A hairline *between* figures rather than a border around each: the
          // column is one statement in three lines, not three stacked cards.
          className="flex-1 border-b border-main-mist/10 px-6 py-7 last:border-b-0 sm:px-8"
        >
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-main-mist/40">
            {t(labelKey, values)}
          </p>
          <p
            className={`mt-2 font-serif-display text-3xl font-bold tabular-nums sm:text-4xl ${tone}`}
          >
            <CountUp locale={locale} {...figure} />
          </p>
          <p className="mt-2 text-sm leading-relaxed text-main-mist/50">
            {t(`home.showcase.metric.${id}.note`, values)}
          </p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
