"use client";

import { ChevronRight } from "lucide-react";
import { useT } from "@/shared/lib/t";

import { cn } from "@/shared/lib/utils";

import type { ResearchReport } from "./research-report";

/// Research Selection Menu (desktop card list): the same choice the mobile tab
/// strip offers, with room for each report's title and date.
export function ResearchMenu({
  reports,
  active,
  onSelect,
}: {
  reports: ResearchReport[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const t = useT();
  return (
    <div className="hidden lg:block lg:col-span-1 space-y-4">
      {reports.map((r, idx) => (
        <div
          key={idx}
          onClick={() => onSelect(idx)}
          className={cn(
            "p-6 border border-l-2 cursor-pointer transition-all duration-300",
            active === idx
              ? "research-panel border-ink/10 border-l-accent-debug shadow-lg shadow-background/50"
              : "bg-card/40 border-ink/10 border-l-transparent hover:bg-card/70 hover:border-l-ink/30"
          )}
        >
          <span className="text-[10px] font-mono-tech text-accent-debug uppercase tracking-widest block mb-2">
            {r.cat}
          </span>
          <h4 className="font-serif-display text-lg text-white font-bold mb-3">
            {r.title}
          </h4>
          <div className="flex justify-between items-center font-mono-tech text-[10px] text-ink/40">
            <span>{r.date}</span>
            <span className="flex items-center gap-1">
              {t("home.research.read", "Read")}{" "}
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
