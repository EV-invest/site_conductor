"use client";

import { ArrowRight } from "lucide-react";
import { localePath } from "@evinvest/i18n";
import { useLocale, useT } from "@evinvest/i18n/react";
import { Button } from "@evinvest/uikit";

import { useAnalytics } from "@/features/analytics";

// This section runs no experiment, so the funnel schema's `variant` is the
// control arm — the same convention as the research footer and the header's
// cabinet entry tracker.
const HOW_IT_WORKS_VARIANT = "control";
const LOCATION = "how_it_works";

/**
 * Client island — the section's closing CTA pair. The step map is static and
 * stays on the server; only the two links need a click handler, for the funnel
 * event that has to fire before the hard navigation into the cabinet zone.
 *
 * Both are hard links (`Button href` renders a plain `<a>`), never `next/link`:
 * the cabinet is a separate document behind a route-handler proxy.
 */
export function HowItWorksCta() {
  const t = useT();
  const locale = useLocale();
  const capture = useAnalytics();

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
      <Button
        href={localePath(locale, "/cabinet/login?intent=signup")}
        className="bg-ink text-brand hover:bg-primary hover:text-on-primary hover:scale-105 active:scale-95 transition-all duration-300 font-mono-tech text-xs tracking-widest uppercase px-8 py-6 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() =>
          capture("cta_clicked", {
            cta: "open_cabinet",
            location: LOCATION,
            variant: HOW_IT_WORKS_VARIANT,
            locale,
          })
        }
      >
        {t("home.howItWorks.cta", "Start investing")}
        <ArrowRight className="size-4" />
      </Button>
      <a
        href={localePath(locale, "/cabinet/login")}
        className="rounded-sm font-mono-tech text-xs tracking-widest uppercase text-ink-soft transition-colors hover:text-primary-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() =>
          capture("cta_clicked", {
            cta: "cabinet",
            location: LOCATION,
            variant: HOW_IT_WORKS_VARIANT,
            locale,
          })
        }
      >
        {t("home.howItWorks.login", "Already an investor? Log in")}
      </a>
    </div>
  );
}
