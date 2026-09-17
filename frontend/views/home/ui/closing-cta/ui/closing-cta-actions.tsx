"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@evinvest/uikit";
import { localePath } from "@evinvest/i18n";
import { useLocale, useT } from "@evinvest/i18n/react";

import { useAnalytics } from "@/features/analytics";

// The closer runs no experiment, so the funnel schema's `variant` is the
// control arm — same convention as the research pane and the shell's tracker.
const CLOSING_VARIANT = "control";

// Both targets are in the cabinet zone, so they are hard links (PATTERNS §9)
// — `Button href` renders a plain `<a>`. The primary carries `intent=signup`,
// which the login page reads for its first-visit state (banking #391).
export function ClosingCtaActions() {
  const t = useT();
  const locale = useLocale();
  const capture = useAnalytics();
  const track = (cta: "open_cabinet" | "cabinet") =>
    capture("cta_clicked", {
      cta,
      location: "closing",
      variant: CLOSING_VARIANT,
      locale,
    });

  return (
    <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
      <Button
        href={localePath(locale, "/cabinet/login?intent=signup")}
        className="bg-ink text-brand hover:bg-primary hover:text-on-primary transition-colors duration-300 font-mono-tech text-xs tracking-widest uppercase px-8 py-6 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => track("open_cabinet")}
      >
        {t("home.closing.cta.start", "Start investing")}
        <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
      </Button>
      <Button
        variant="outline"
        href={localePath(locale, "/cabinet/login")}
        className="bg-transparent text-ink border border-ink/40 hover:bg-ink hover:text-brand transition-colors duration-300 font-mono-tech text-xs tracking-widest uppercase px-8 py-6 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => track("cabinet")}
      >
        {t("home.closing.cta.cabinet", "Cabinet")}
      </Button>
    </div>
  );
}
