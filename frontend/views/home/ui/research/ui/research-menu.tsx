"use client";

import { ChevronRight } from "lucide-react";
import { useT } from "@evinvest/i18n/react";

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
              ? "research-panel border-main-mist/10 border-l-main-accent-t1 shadow-lg shadow-main-black/50"
              : "bg-main-card/40 border-main-mist/10 border-l-transparent hover:bg-main-card/70 hover:border-l-main-mist/30"
          )}
        >
          <span className="text-[10px] font-mono-tech text-main-accent-t1 uppercase tracking-widest block mb-2">
            {r.cat}
          </span>
          <h4 className="font-serif-display text-lg text-white font-bold mb-3">
            {r.title}
          </h4>
          <div className="flex justify-between items-center font-mono-tech text-[10px] text-main-mist/40">
            <span>{r.date}</span>
            <span className="flex items-center gap-1">
              {t("home.research.read")} <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
