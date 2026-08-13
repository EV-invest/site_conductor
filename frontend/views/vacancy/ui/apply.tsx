import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";
import { ApplicationForm } from "@/features/job-application";
import type { VacancyDetail } from "@/entities/vacancy";
import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";
import { DashList } from "./dash-list";

/** Closing apply band — reassurance copy beside the role-mode application form
 *  (the universal form with its role block injected). */
export function VacancyApply({
  vacancy,
  locale,
}: {
  vacancy: VacancyDetail;
  locale: Locale;
}) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section id="apply" className="scroll-mt-24 bg-main-black pb-24 pt-8">
      <Container>
        <div className="rounded-3xl border border-white/[0.06] bg-main-card/20 p-4 sm:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
                {t("vacancy.apply.eyebrow")}
              </p>
              <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
                <Accented text={t("vacancy.apply.title")} />
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-main-mist/60">
                {t("vacancy.apply.intro", { role: vacancy.title })}
              </p>
              <div className="mt-6">
                <DashList
                  items={[
                    t("vacancy.apply.point1"),
                    t("vacancy.apply.point2"),
                    t("vacancy.apply.point3"),
                  ]}
                />
              </div>
            </div>
            <ApplicationForm
              vacancy={{
                slug: vacancy.slug,
                title: vacancy.title,
                requirements: vacancy.requirements,
                screeningQuestion: vacancy.screening_question,
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
