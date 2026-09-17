import { ChartLine, Layers, ShieldCheck, Wallet } from "lucide-react";
import type { Translate } from "@evinvest/i18n";

// Qualitative on purpose: no minimums, cadences or return figures — the model
// wording is "allocation units at the posted NAV" (banking #245), and the only
// sourced number lives in the cabinet itself.
// TODO(#204): sourced figures
export const benefits = (t: Translate) => [
  {
    icon: Layers,
    title: t(
      "home.cabinetTour.benefit.units.title",
      "Holdings in allocation units"
    ),
    body: t(
      "home.cabinetTour.benefit.units.body",
      "Your stake is a number of units; its value follows the fund's posted NAV, not a promise."
    ),
  },
  {
    icon: ChartLine,
    title: t("home.cabinetTour.benefit.nav.title", "NAV history you can see"),
    body: t(
      "home.cabinetTour.benefit.nav.body",
      "Every valuation mark since inception, with your own participation drawn on top of it."
    ),
  },
  {
    icon: ShieldCheck,
    title: t(
      "home.cabinetTour.benefit.status.title",
      "Verification status always in view"
    ),
    body: t(
      "home.cabinetTour.benefit.status.body",
      "Identity check, account standing and the devices signed in — on your profile, never buried in a menu."
    ),
  },
  {
    icon: Wallet,
    title: t("home.cabinetTour.benefit.wallet.title", "Wallet in USDT"),
    body: t(
      "home.cabinetTour.benefit.wallet.body",
      "Fund and withdraw in USDT on TRON; every balance is an entry on the ledger, not a spreadsheet."
    ),
  },
];
