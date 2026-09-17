import type { Locale } from "@evinvest/i18n";

import { FUND_FIGURES } from "@/shared/config/fund-figures";
import { formatCalendarDate, formatDecimal } from "./intl";

export interface FormattedFundFigures {
  /** "16.4% +" — the digits localised, the floor marker not. */
  targetIrr: string;
  /** "$100M" — the digits localised, the currency and unit not. */
  closingTarget: string;
  /** The as-of date in the locale's long form. */
  asOf: string;
}

/**
 * The fund figures as the locale writes them. One function rather than each
 * hero assembling "% +" and "$…M" itself, so both variants (and the cabinet
 * mirror) render the same shape from the same source.
 *
 * Digits localise; the `$` and `M` do not, following {@link CountUp}'s
 * prefix/suffix convention rather than `Intl`'s compact currency, whose
 * en-GB output ("$100m") would quietly restyle the ribbon.
 */
export function formatFundFigures(locale: Locale): FormattedFundFigures {
  const { targetIrrPct, closingTargetUsdM, asOf } = FUND_FIGURES;
  return {
    targetIrr: `${formatDecimal(targetIrrPct, locale, 1)}% +`,
    closingTarget: `$${formatDecimal(closingTargetUsdM, locale, 0)}M`,
    asOf: formatCalendarDate(asOf, locale),
  };
}
