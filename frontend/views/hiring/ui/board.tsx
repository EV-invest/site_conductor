"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Container } from "@evinvest/uikit";
import {
  VACANCY_CATEGORIES,
  type VacancySummary,
  vacancyTeamLabel,
} from "@/entities/vacancy";

export function HiringBoard({ vacancies }: { vacancies: VacancySummary[] }) {
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
          Open roles
        </p>
        <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
          Where we&apos;re{" "}
          <span className="font-serif italic text-main-accent-t1">hiring</span>.
        </h2>

        <div className="mt-8 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-main-mist/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search roles, teams, or locations…"
              aria-label="Search roles"
              className="w-full rounded-lg border border-white/10 bg-main-card/40 py-3.5 pl-11 pr-4 text-sm text-main-mist placeholder:text-main-mist/30 focus:border-main-accent-t1/40 focus:outline-none"
            />
          </div>
          <span className="hidden whitespace-nowrap font-mono-tech text-[11px] uppercase tracking-[0.2em] text-main-accent-t1 sm:block">
            {filtered.length} role{filtered.length === 1 ? "" : "s"}
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
              {c.key === "all" ? "All roles" : c.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {filtered.map(vacancy => (
            <RoleRow key={vacancy.slug} vacancy={vacancy} />
          ))}
          {filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-main-mist/40">
              No roles match your search.{" "}
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="text-main-accent-t1 underline-offset-2 hover:underline"
              >
                Clear filters
              </button>
              .
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

function RoleRow({ vacancy }: { vacancy: VacancySummary }) {
  return (
    <Link
      href={`/hiring/${vacancy.slug}`}
      className="group flex items-center justify-between gap-6 rounded-2xl border border-white/[0.06] bg-main-card/30 p-6 transition-colors hover:border-main-accent-t1/30 hover:bg-main-card/50 sm:p-7"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-serif-display text-xl text-white sm:text-2xl">
            {vacancy.title}
          </h3>
          <span className="rounded bg-main-accent-t1/10 px-2 py-0.5 font-mono-tech text-[9px] uppercase tracking-[0.16em] text-main-accent-t1">
            {vacancyTeamLabel(vacancy.category, vacancy.category_label)}
          </span>
        </div>
        <p className="mt-2 text-sm text-main-mist/60">{vacancy.summary}</p>
        <p className="mt-2 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-main-mist/40">
          {vacancy.location} · {vacancy.employment_type}
        </p>
      </div>
      <span className="hidden shrink-0 items-center gap-2 rounded-md border border-main-accent-t1/30 px-4 py-2 font-mono-tech text-[11px] uppercase tracking-widest text-main-accent-t1 transition-colors group-hover:bg-main-accent-t1/10 sm:inline-flex">
        View role <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
