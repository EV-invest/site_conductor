import { Container } from "@evinvest/uikit";
import { ApplicationForm } from "@/features/job-application";
import type { VacancyDetail } from "@/entities/vacancy";
import { DashList } from "./dash-list";

/** Closing apply band — reassurance copy beside the role-mode application form
 *  (the universal form with its role block injected). */
export function VacancyApply({ vacancy }: { vacancy: VacancyDetail }) {
  return (
    <section id="apply" className="scroll-mt-24 bg-main-black pb-24 pt-8">
      <Container>
        <div className="rounded-3xl border border-white/[0.06] bg-main-card/20 p-8 sm:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
                Apply
              </p>
              <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
                Send your{" "}
                <span className="font-serif italic text-main-accent-t1">
                  application
                </span>
                .
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-main-mist/60">
                Tell us where you&apos;d fit on the {vacancy.title} role. A few
                lines is enough — we read every note and reply within about two
                weeks.
              </p>
              <div className="mt-6">
                <DashList
                  items={[
                    "No cover-letter theatre — your work speaks.",
                    "You'll hear back either way.",
                    "Questions first? hiring@evinvest.vn",
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
