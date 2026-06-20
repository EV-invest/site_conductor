import type { VacancySummary } from "@/entities/vacancy";
import { HiringBoard } from "./board";
import { HiringHero } from "./hero";
import { HiringProcess } from "./process";
import { HiringWhy } from "./why";

/** The searchable job board. Vacancies are fetched server-side (the backend is
 *  the source of truth) and filtered client-side in {@link HiringBoard}. */
export function HiringView({ vacancies }: { vacancies: VacancySummary[] }) {
  const teamCount = new Set(vacancies.map((v) => v.category)).size;
  return (
    <div className="min-h-screen bg-main-black text-main-mist">
      <HiringHero roleCount={vacancies.length} teamCount={teamCount} />
      <HiringBoard vacancies={vacancies} />
      <HiringWhy />
      <HiringProcess />
    </div>
  );
}
