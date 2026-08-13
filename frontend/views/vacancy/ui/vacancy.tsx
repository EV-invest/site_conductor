import type { VacancyDetail } from "@/entities/vacancy";
import { VacancyApply } from "./apply";
import { VacancyBody } from "./body";
import { VacancyHero } from "./hero";
import { VacancyStructuredData } from "./vacancy-structured-data";

/** One reusable role-page template (the backend supplies the content). */
export function VacancyView({ vacancy }: { vacancy: VacancyDetail }) {
  return (
    <div className="min-h-screen bg-main-black text-main-mist">
      <VacancyStructuredData vacancy={vacancy} />
      <VacancyHero vacancy={vacancy} />
      <VacancyBody vacancy={vacancy} />
      <VacancyApply vacancy={vacancy} />
    </div>
  );
}
