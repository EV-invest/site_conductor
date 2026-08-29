import { cn } from "@/shared/lib/utils";

import type { ResearchReport } from "./research-report";

/// Mobile: browser-style tabs joined to the article. A continuous bottom rule
/// runs under the strip, broken only by the active tab, which drops over it
/// (-mb-px) to share the pane's black fill.
export function ResearchTabs({
  reports,
  active,
  onSelect,
}: {
  reports: ResearchReport[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-stretch border-b border-main-mist/10 lg:hidden">
      {reports.map((r, idx) => {
        const on = active === idx;
        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              "flex-1 border-l border-main-mist/10 first:border-l-0 transition-colors",
              on
                ? "-mb-px border-t-2 border-t-main-accent-t1 bg-main-black"
                : "border-t border-t-main-mist/10 bg-main-card/30 hover:bg-main-card/60"
            )}
          >
            <span
              className={cn(
                "block py-3 px-2 text-center font-mono-tech text-[8px] uppercase tracking-[0.15em] leading-tight",
                on ? "text-main-accent-t1" : "text-main-mist/45"
              )}
            >
              {r.cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}
