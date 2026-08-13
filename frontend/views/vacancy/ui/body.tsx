import type { ReactNode } from "react";
import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";
import { type VacancyDetail, vacancyTeamLabel } from "@/entities/vacancy";
import { messagesFor } from "@/shared/config/i18n";
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

export function VacancyBody({
  vacancy,
  locale,
}: {
  vacancy: VacancyDetail;
  locale: Locale;
}) {
  const t = translator(messagesFor(locale), locale);
  const team = vacancyTeamLabel(vacancy.category, vacancy.category_label, t);
  return (
    <section className="bg-main-black py-12">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            <Block title={t("vacancy.block.about")}>
              <p className="text-sm leading-relaxed text-main-mist/65 sm:text-base">
                {vacancy.about}
              </p>
            </Block>
            {vacancy.responsibilities.length > 0 && (
              <Block title={t("vacancy.block.responsibilities")}>
                <DashList items={vacancy.responsibilities} />
              </Block>
            )}
            {vacancy.requirements.length > 0 && (
              <Block title={t("vacancy.block.requirements")}>
                <DashList items={vacancy.requirements} />
              </Block>
            )}
            {vacancy.nice_to_have.length > 0 && (
              <Block title={t("vacancy.block.niceToHave")}>
                <DashList items={vacancy.nice_to_have} />
              </Block>
            )}
            {vacancy.offer.length > 0 && (
              <Block title={t("vacancy.block.offer")}>
                <DashList items={vacancy.offer} />
              </Block>
            )}
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-2xl border border-white/[0.07] bg-main-card/40 p-6">
              <p className="mb-4 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/45">
                {t("vacancy.glance")}
              </p>
              <dl className="space-y-3">
                <GlanceRow label={t("vacancy.pill.team")} value={team} />
                <GlanceRow
                  label={t("vacancy.pill.location")}
                  value={vacancy.location}
                />
                <GlanceRow
                  label={t("vacancy.pill.type")}
                  value={vacancy.employment_type}
                />
                <GlanceRow
                  label={t("vacancy.pill.compensation")}
                  value={vacancy.compensation}
                  accent
                />
              </dl>
              <a
                href="#apply"
                className="mt-6 block rounded-md bg-main-accent-t1 px-6 py-3 text-center font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90"
              >
                {t("vacancy.applyCta")}
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
