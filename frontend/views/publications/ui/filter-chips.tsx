"use client";

import { useT } from "@evinvest/i18n/react";

import type { PublicationKind } from "@/entities/publication";
import { cn } from "@/shared/lib/utils";

export type KindFilter = PublicationKind | "all";

const CHIPS: { value: KindFilter; labelKey: string }[] = [
  { value: "all", labelKey: "publications.filter.all" },
  { value: "field-note", labelKey: "publications.kind.fieldNotes" },
  { value: "research", labelKey: "publications.kind.research" },
  { value: "whitepaper", labelKey: "publications.kind.whitepaper" },
];

export function FilterChips({
  value,
  onChange,
  counts,
}: {
  value: KindFilter;
  onChange: (next: KindFilter) => void;
  counts: Record<KindFilter, number>;
}) {
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t("publications.filter.aria")}
      className="flex flex-wrap gap-2"
    >
      {CHIPS.map(chip => {
        const on = chip.value === value;
        // A kind nobody has published yet is a dead control, not a filter.
        const empty = counts[chip.value] === 0;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={on}
            disabled={empty}
            onClick={() => onChange(chip.value)}
            className={cn(
              "border px-4 py-2.5 font-mono-tech text-[11px] tracking-[0.15em] transition-colors",
              on
                ? "border-main-accent-t1 bg-main-accent-t1 text-main-black"
                : "border-main-mist/16 text-main-mist/55 hover:border-main-mist/40 hover:text-main-mist",
              empty && "cursor-not-allowed opacity-35 hover:border-main-mist/16"
            )}
          >
            {t(chip.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
