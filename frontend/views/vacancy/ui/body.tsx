import type { ReactNode } from "react";
import { Container } from "@evinvest/uikit";
import { type VacancyDetail, vacancyTeamLabel } from "@/entities/vacancy";
import { DashList } from "./dash-list";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-serif-display text-2xl text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function GlanceRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
      <dt className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-main-mist/45">
        {label}
      </dt>
      <dd
        className={
          accent
            ? "text-sm font-medium text-main-accent-t1"
            : "text-sm text-main-mist/85"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function VacancyBody({ vacancy }: { vacancy: VacancyDetail }) {
  const team = vacancyTeamLabel(vacancy.category, vacancy.category_label);
  return (
    <section className="bg-main-black py-12">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <Block title="About the role">
              <p className="text-sm leading-relaxed text-main-mist/65 sm:text-base">
                {vacancy.about}
              </p>
            </Block>
            {vacancy.responsibilities.length > 0 && (
              <Block title="What you'll do">
                <DashList items={vacancy.responsibilities} />
              </Block>
            )}
            {vacancy.requirements.length > 0 && (
              <Block title="What we're looking for">
                <DashList items={vacancy.requirements} />
              </Block>
            )}
            {vacancy.nice_to_have.length > 0 && (
              <Block title="Nice to have">
                <DashList items={vacancy.nice_to_have} />
              </Block>
            )}
            {vacancy.offer.length > 0 && (
              <Block title="What we offer">
                <DashList items={vacancy.offer} />
              </Block>
            )}
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-2xl border border-white/[0.07] bg-main-card/40 p-6">
              <p className="mb-4 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/45">
                At a glance
              </p>
              <dl className="space-y-3">
                <GlanceRow label="Team" value={team} />
                <GlanceRow label="Location" value={vacancy.location} />
                <GlanceRow label="Type" value={vacancy.employment_type} />
                <GlanceRow
                  label="Compensation"
                  value={vacancy.compensation}
                  accent
                />
              </dl>
              <a
                href="#apply"
                className="mt-6 block rounded-md bg-main-accent-t1 px-6 py-3 text-center font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90"
              >
                Apply for this role
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
