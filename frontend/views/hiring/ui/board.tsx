"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { useLocale, useT } from "@evinvest/i18n/react";
import { VACANCY_CATEGORIES, type VacancySummary } from "@/entities/vacancy";
import { Accented } from "@/shared/ui/accented";
import { RoleRow } from "./role-row";

export function HiringBoard({ vacancies }: { vacancies: VacancySummary[] }) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vacancies.filter(v => {
      const matchesCategory = category === "all" || v.category === category;
      const matchesQuery =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.summary.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [vacancies, query, category]);

  return (
    <section id="open-roles" className="scroll-mt-24 bg-main-black py-20">
      <Container>
        <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
          {t("hiring.board.eyebrow")}
        </p>
        <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
          <Accented text={t("hiring.board.title")} />
        </h2>

        <div className="mt-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-main-mist/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("hiring.board.search")}
              aria-label={t("hiring.board.searchLabel")}
              // text-base on phones: under 16px iOS zooms the viewport on
              // focus (see shared/ui/control.ts). sm: keeps the 14px design.
              className="w-full rounded-lg border border-white/10 bg-main-card/40 py-3.5 pl-11 pr-4 text-base sm:text-sm text-main-mist placeholder:text-main-mist/30 focus:border-main-accent-t1/40 focus:outline-none"
            />
          </div>
          <span className="hidden whitespace-nowrap font-mono-tech text-[11px] uppercase tracking-[0.2em] text-main-accent-t1 sm:block">
            {t("hiring.board.count", { count: filtered.length })}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {VACANCY_CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={
                category === c.key
                  ? "rounded-full bg-main-accent-t1 px-4 py-1.5 text-xs font-medium text-main-black"
                  : "rounded-full border border-white/[0.12] px-4 py-1.5 text-xs text-main-mist/70 transition-colors hover:border-white/25"
              }
            >
              {c.key === "all" ? t("hiring.board.allRoles") : t(c.labelKey)}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {filtered.map(vacancy => (
            <RoleRow key={vacancy.slug} vacancy={vacancy} locale={locale} />
          ))}
          {filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-main-mist/40">
              {t("hiring.board.empty")}{" "}
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="text-main-accent-t1 underline-offset-2 hover:underline"
              >
                {t("hiring.board.clear")}
              </button>
              .
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
