"use client";

import type { PublicationKind } from "@/entities/publication";
import { cn } from "@/shared/lib/utils";

export type KindFilter = PublicationKind | "all";

const CHIPS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "ALL" },
  { value: "field-note", label: "FIELD NOTES" },
  { value: "research", label: "RESEARCH" },
  { value: "whitepaper", label: "WHITEPAPER" },
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
  return (
    <div
      role="group"
      aria-label="Filter publications by kind"
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
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
