import type { Locale } from "@evinvest/i18n";

import type { VacancyDetail } from "@/entities/vacancy";
import { VacancyApply } from "./apply";
import { VacancyBody } from "./body";
import { VacancyHero } from "./hero";
import { VacancyStructuredData } from "./vacancy-structured-data";
import { UntranslatedNotice } from "./untranslated-notice";

/** One reusable role-page template (the backend supplies the content). */
export function VacancyView({
  locale,
  vacancy,
}: {
  locale: Locale;
  vacancy: VacancyDetail;
}) {
  return (
    <div className="min-h-screen bg-main-black text-main-mist">
      <VacancyStructuredData vacancy={vacancy} locale={locale} />
      {!vacancy.translated && <UntranslatedNotice locale={locale} />}
      <VacancyHero vacancy={vacancy} locale={locale} />
      <VacancyBody vacancy={vacancy} locale={locale} />
      <VacancyApply vacancy={vacancy} locale={locale} />
    </div>
  );
}
