import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { localePath, translator, type Locale } from "@evinvest/i18n";
import { type VacancyDetail, vacancyTeamLabel } from "@/entities/vacancy";
import { messagesFor } from "@/shared/config/i18n";
import { ShareButton } from "./share-button";

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-main-card/40 px-3.5 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-main-accent-t1/60" />
      <span className="font-mono-tech text-[9px] uppercase tracking-[0.16em] text-main-mist/45">
        {label}
      </span>
      <span className="text-xs text-main-mist/85">{value}</span>
    </span>
  );
}

export function VacancyHero({
  vacancy,
  locale,
}: {
  vacancy: VacancyDetail;
  locale: Locale;
}) {
  const t = translator(messagesFor(locale), locale);
  const team = vacancyTeamLabel(vacancy.category, vacancy.category_label, t);
  return (
    <section className="bg-main-black pt-32 pb-10">
      <Container>
        <Link
          href={localePath(locale, "/hiring")}
          className="inline-flex items-center gap-2 font-mono-tech text-[11px] uppercase tracking-[0.16em] text-main-mist/45 transition-colors hover:text-main-mist/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t("vacancy.back")}
        </Link>
        <p className="mt-7 font-mono-tech text-[11px] uppercase tracking-[0.3em] text-main-accent-t1">
          {team} · {vacancy.employment_type}
        </p>
        <h1 className="mt-3 font-serif-display text-4xl text-white sm:text-5xl">
          {vacancy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-main-mist/60 sm:text-base">
          {vacancy.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Pill label={t("vacancy.pill.location")} value={vacancy.location} />
          <Pill
            label={t("vacancy.pill.type")}
            value={vacancy.employment_type}
          />
          <Pill label={t("vacancy.pill.team")} value={team} />
          <Pill
            label={t("vacancy.pill.compensation")}
            value={vacancy.compensation}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#apply"
            className="inline-flex items-center rounded-md bg-main-accent-t1 px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90"
          >
            {t("vacancy.applyCta")}
          </a>
          <ShareButton />
        </div>
      </Container>
    </section>
  );
}
