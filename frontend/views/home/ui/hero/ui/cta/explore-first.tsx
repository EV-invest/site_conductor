"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@evinvest/uikit";
import { useLocale, useT } from "@evinvest/i18n/react";
import { useExperimentEvent } from "@/features/ab-variant";
import { PRIMARY, SECONDARY, SIZE, type HeroCtaAlign } from "./row";

// See cabinet-first.tsx: `clicked` under the `hero_cta` tracker keeps the
// event named `hero_cta_clicked`, as it was before the row became its own arm.
const ACTION = "clicked";

/**
 * Client island — arm `b` of `hero_cta`, the row as it stood before #198:
 * "Explore Assets" primary (scroll to the portfolio), "Whitepaper" secondary.
 * Kept verbatim as the comparison arm; delete with the experiment.
 */
export function ExploreFirstCta({ align }: { align: HeroCtaAlign }) {
  const track = useExperimentEvent();
  const t = useT();
  const locale = useLocale();
  const common = { location: "hero", locale };

  return (
    <div
      className={`flex flex-row items-center gap-4 ${align === "center" ? "justify-center" : ""}`}
    >
      <Button
        size={SIZE}
        className={PRIMARY}
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
        <ArrowRight />
      </Button>

      <Button
        asChild
        variant="outline"
        size={SIZE}
        className={`${SECONDARY} max-sm:hidden`}
        onClick={() => track(ACTION, { cta: "whitepaper", ...common })}
      >
        <Link href="/publications/whitepaper">
          {t("home.hero.cta.whitepaper", "Whitepaper")}
          <FileText />
        </Link>
      </Button>
    </div>
  );
}
