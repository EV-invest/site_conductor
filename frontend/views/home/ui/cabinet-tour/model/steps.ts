import type { Translate } from "@evinvest/i18n";

// What happens after the click, as three plain facts — no timing, no minimum,
// no verbs of persuasion. "Allocation units at the posted NAV" is the fund's
// model vocabulary (banking #245); the only sourced number stays in the
// cabinet itself.
// TODO(#204): sourced figures
export const steps = (t: Translate): readonly string[] => [
  t(
    "home.cabinetTour.step.verify",
    "Sign in with Google and verify your identity"
  ),
  t(
    "home.cabinetTour.step.subscribe",
    "Subscribe to allocation units at the posted NAV"
  ),
  t(
    "home.cabinetTour.step.follow",
    "Follow NAV, reports and payouts in the cabinet"
  ),
];
