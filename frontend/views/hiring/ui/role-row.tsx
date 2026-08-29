"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type Locale } from "@evinvest/i18n";
import { useT } from "@evinvest/i18n/react";
import { type VacancySummary, vacancyTeamLabel } from "@/entities/vacancy";

export function RoleRow({
  vacancy,
  locale,
}: {
  vacancy: VacancySummary;
  locale: Locale;
}) {
  const t = useT();
  return (
    <Link
      href={localePath(locale, `/hiring/${vacancy.slug}`)}
      className="group flex items-center justify-between gap-6 rounded-2xl border border-white/[0.06] bg-main-card/30 p-6 transition-colors hover:border-main-accent-t1/30 hover:bg-main-card/50 sm:p-7"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-serif-display text-xl text-white sm:text-2xl">
            {vacancy.title}
          </h3>
          <span className="rounded bg-main-accent-t1/10 px-2 py-0.5 font-mono-tech text-[9px] uppercase tracking-[0.16em] text-main-accent-t1">
            {vacancyTeamLabel(vacancy.category, vacancy.category_label, t)}
          </span>
        </div>
        <p className="mt-2 text-sm text-main-mist/60">{vacancy.summary}</p>
        <p className="mt-2 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-main-mist/40">
          {vacancy.location} · {vacancy.employment_type}
        </p>
      </div>
      <span className="hidden shrink-0 items-center gap-2 rounded-md border border-main-accent-t1/30 px-4 py-2 font-mono-tech text-[11px] uppercase tracking-widest text-main-accent-t1 transition-colors group-hover:bg-main-accent-t1/10 sm:inline-flex">
        {t("hiring.board.viewRole")} <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
