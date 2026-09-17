// The fund's headline figures — the ONLY place a number about the fund is typed.
//
// Every surface that quotes the fund (the hero ribbon in both A/B variants, and
// whatever closing block or trust line lands next) reads these, so a figure can
// never be updated in one section and left stale in another. Formatting per
// locale lives in `shared/lib/fund-figures.ts`; nothing renders a raw value.
//
// SHARED WITH THE CABINET. banking's login page (`cabinet/frontend/views/login/
// ui/brand-panel.tsx`, currently "18.4 % / $120M+") must show the SAME values —
// a visitor who clicks through from the hero must not watch the fund contradict
// itself one page later (site_conductor #204, banking #385). The two repos do
// not share code; until this object moves into an `@evinvest/*` package, the
// cabinet mirrors it field for field, and a change here is a change there.
//
// Confirmed by the owner on 2026-09-18 (#204): the values are the ones the site
// showed before they were centralised, and `asOf` is the confirmation date. Set
// `asOf` back to `undefined` to take the "as of" line off the page while a new
// figure is pending — a placeholder date must never render as a fact.

export interface FundFigures {
  /** Target IRR, percent per annum. Rendered as a floor: "16.4% +". */
  readonly targetIrrPct: number;
  /** Hard cap the fund closes at, in USD millions. Rendered "$100M". */
  readonly closingTargetUsdM: number;
  /**
   * ISO 8601 calendar date the figures were last confirmed on. `undefined`
   * means nobody has confirmed them yet and the "as of" line MUST NOT render —
   * a placeholder date on the hero reads as a fact.
   */
  readonly asOf: string | undefined;
  /**
   * Minimum subscription, USD. `undefined` means the owner has not set one and
   * copy MUST omit the sentence — never render a placeholder amount.
   */
  readonly minSubscriptionUsd: number | undefined;
  /**
   * The one owner-approved wording about KYC duration (the cabinet's
   * `kyc.dialog.timeBody`). Kept here so no section paraphrases it into a
   * claim ("~10 minutes") nobody signed off. Not a figure: copy that quotes it
   * still goes through `t()` with a catalogue key so the other locales exist.
   */
  readonly kycTiming: string;
}

export const FUND_FIGURES: FundFigures = {
  targetIrrPct: 16.4,
  closingTargetUsdM: 100,
  asOf: "2026-09-18",
  minSubscriptionUsd: undefined,
  kycTiming:
    "A few minutes to submit. Most checks are decided within the hour.",
};
