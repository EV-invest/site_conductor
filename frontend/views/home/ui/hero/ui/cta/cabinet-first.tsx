"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { localePath } from "@evinvest/i18n";
import { useLocale, useT } from "@evinvest/i18n/react";
import { Text } from "@/shared/ui/text";
import { useExperimentEvent } from "@/features/ab-variant";
import { PRIMARY, SECONDARY, TEXT_LINK, type HeroCtaAlign } from "./row";

// Emitted as `hero_cta_clicked`: the tracker prefixes the experiment key, so
// the bare `clicked` keeps the event name the pre-#198 row already reported
// under the `hero` tracker. Renaming would fork the funnel dashboard.
const ACTION = "clicked";

/**
 * Client island — arm `a` of `hero_cta`: "Start investing" into the cabinet as
 * the primary, "Explore Assets" demoted to secondary, the whitepaper a text
 * link, and one line under the row saying what the primary leads into.
 *
 * The cabinet is a routed zone (PATTERNS §9), so the primary is a hard `<a>`
 * — never `next/link`. It is a plain styled anchor rather than a uikit
 * `Button asChild` because the row would otherwise hold two `asChild` siblings
 * (PATTERNS §7).
 */
export function CabinetFirstCta({ align }: { align: HeroCtaAlign }) {
  const track = useExperimentEvent();
  const t = useT();
  const locale = useLocale();
  const centred = align === "center";
  const common = { location: "hero", locale };

  return (
    <div
      className={`flex flex-col gap-4 ${centred ? "items-center text-center" : "items-start"}`}
    >
      <div
        className={`flex flex-wrap items-center gap-4 ${centred ? "justify-center" : ""}`}
      >
        <a
          href={localePath(locale, "/cabinet")}
          className={PRIMARY}
          onClick={() => track(ACTION, { cta: "open_cabinet", ...common })}
        >
          {t("home.hero.cta.start", "Start investing")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </a>

        <button
          type="button"
          className={SECONDARY}
          onClick={() =>
            track(ACTION, { cta: "explore_assets", ...common }, fire => {
              fire();
              document
                .getElementById("portfolio")
                ?.scrollIntoView({ behavior: "smooth" });
            })
          }
        >
          {t("home.hero.cta.explore", "Explore Assets")}
        </button>

        <Link
          href="/publications/whitepaper"
          className={`${TEXT_LINK} max-sm:hidden`}
          onClick={() => track(ACTION, { cta: "whitepaper", ...common })}
        >
          {t("home.hero.cta.whitepaper", "Whitepaper")}
          <FileText className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* TODO(#204): sourced figures (minimum subscription, reporting cadence)
          join this line once the owner confirms them. Until then it carries
          only the cabinet's own KYC promise (`kyc.dialog.timeBody`). */}
      <Text variant="secondary" className="text-xs max-w-xl">
        {t(
          "home.hero.cta.fact",
          "Google sign-in, an identity check usually decided within the hour, then deposit and subscribe."
        )}
      </Text>
    </div>
  );
}
