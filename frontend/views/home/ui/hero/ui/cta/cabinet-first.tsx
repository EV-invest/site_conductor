"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@evinvest/uikit";
import { localePath } from "@evinvest/i18n";
import { useLocale, useT } from "@evinvest/i18n/react";
import { useExperimentEvent } from "@/features/ab-variant";
import { PRIMARY, SECONDARY, SIZE, TEXT_LINK, type HeroCtaAlign } from "./row";

// Emitted as `hero_cta_clicked`: the tracker prefixes the experiment key, so
// the bare `clicked` keeps the event name the pre-#198 row already reported
// under the `hero` tracker. Renaming would fork the funnel dashboard.
const ACTION = "clicked";

// The login page renders its signup state only under `?intent=signup`
// (banking #391); a bare /cabinet bounces a visitor to the "Welcome back"
// login intent. The cabinet's proxy sends signed-in users away from /login, so
// the link is right in both states. `localePath` only prefixes, so the query
// survives it.
const SIGNUP = "/cabinet/login?intent=signup";

/**
 * Client island — arm `a` of `hero_cta`: "Start investing" into the cabinet as
 * the primary, "Explore Assets" demoted to secondary, the whitepaper a text
 * link, and one line under the row saying what the primary leads into.
 *
 * The cabinet is a routed zone (PATTERNS §9), so the primary is a hard `<a>`
 * — `Button href`, never `next/link`. Nothing in the row is `asChild`, so the
 * two-sibling hydration trap (PATTERNS §7) cannot apply.
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
        <Button
          href={localePath(locale, SIGNUP)}
          size={SIZE}
          className={PRIMARY}
          onClick={() => track(ACTION, { cta: "open_cabinet", ...common })}
        >
          {t("home.hero.cta.start", "Start investing")}
          <ArrowRight />
        </Button>

        <Button
          variant="outline"
          size={SIZE}
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
        </Button>

        <Link
          href="/publications/whitepaper"
          className={`${TEXT_LINK} max-sm:hidden`}
          onClick={() => track(ACTION, { cta: "whitepaper", ...common })}
        >
          {t("home.hero.cta.whitepaper", "Whitepaper")}
          <FileText />
        </Link>
      </div>

      {/* TODO(#204): sourced figures (minimum subscription, reporting cadence)
          join this line once the owner confirms them. Until then it carries
          only the cabinet's own KYC promise (`kyc.dialog.timeBody`). */}
      {/* A plain <p>, not <Text variant="secondary">: that variant pins
          text-ink/40, and overriding it to the readable ramp step trips the
          dev-time cn() conflict panic (and 3.2:1 on the hero fill). */}
      <p className="max-w-md text-xs leading-relaxed text-ink-soft">
        {t(
          "home.hero.cta.fact",
          "Google sign-in, an identity check usually decided within the hour, then deposit and subscribe."
        )}
      </p>
    </div>
  );
}
