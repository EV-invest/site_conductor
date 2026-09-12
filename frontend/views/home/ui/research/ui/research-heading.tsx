"use client";

import { useT } from "@/shared/lib/t";

import { Text, Tier } from "@/shared/ui/text";
import { Reveal, SplitText } from "@/shared/ui/motion";
import { accented } from "@/shared/ui/accented";

/// The section's opening block: eyebrow, split-animated headline, standfirst.
export function ResearchHeading() {
  const t = useT();
  return (
    <Reveal className="max-w-3xl mb-16">
      <span className="text-xs font-mono-tech text-accent-debug tracking-[0.3em] uppercase block mb-3">
        {t("home.research.eyebrow", "Academic Rigor")}
      </span>
      <h2 className="text-3xl sm:text-5xl font-serif-display text-white font-light leading-tight">
        <SplitText inView>
          {accented({
            text: t("home.research.title", "Data-Driven *Research & Insights*"),
            className: "italic text-accent-debug font-serif",
          })}
        </SplitText>
      </h2>
      <Tier tier="main">
        <Text className="mt-4">
          {t(
            "home.research.intro",
            "We believe in deep macroeconomic analysis. Our research team produces exhaustive monthly reports on Vietnam’s economic landscape, urbanization trends, and Quy Nhon’s real estate cycles."
          )}
        </Text>
      </Tier>
    </Reveal>
  );
}
