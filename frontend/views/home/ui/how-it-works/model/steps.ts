import type { Translate } from "@evinvest/i18n";

export interface Step {
  /** Two-digit ordinal shown as display type. A real sequence, so it is earned. */
  ordinal: string;
  title: string;
  body: string;
}

// The only quantitative claim here is the KYC timing, and it is the cabinet's
// own owner-approved wording (`kyc.dialog.timeBody`) repeated verbatim so the two
// surfaces cannot disagree. "Allocation units", not "fund shares" — the fund's
// model vocabulary (banking #245).
//
// TODO(#204): sourced figures — the minimum subscription belongs in step two
// ("from $X") once the owner supplies it into the shared constant; until then
// the copy stays qualitative on purpose rather than carrying an invented number.
export const steps = (t: Translate): Step[] => [
  {
    ordinal: "01",
    title: t(
      "home.howItWorks.step1.title",
      "Create your account and pass verification"
    ),
    body: t(
      "home.howItWorks.step1.body",
      "Sign in with Google, then upload an ID document and a selfie. A few minutes to submit; most checks are decided within the hour."
    ),
  },
  {
    ordinal: "02",
    title: t(
      "home.howItWorks.step2.title",
      "Subscribe to allocation units at the current NAV"
    ),
    body: t(
      "home.howItWorks.step2.body",
      "Choose an amount and subscribe at the current net asset value per unit — the same price every holder is issued at, whenever they join."
    ),
  },
  {
    ordinal: "03",
    title: t(
      "home.howItWorks.step3.title",
      "Track NAV, reports and payouts in your cabinet"
    ),
    body: t(
      "home.howItWorks.step3.body",
      "Your units, the current NAV, every report and every payout land in one place as they happen — nothing to chase over email."
    ),
  },
];
