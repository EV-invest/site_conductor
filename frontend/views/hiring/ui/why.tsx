import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

const REASONS = [
  { n: "01", key: "focus" },
  { n: "02", key: "rigor" },
  { n: "03", key: "scale" },
  { n: "04", key: "upside" },
];

export function HiringWhy({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section className="bg-main-black py-20">
      <Container>
        <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
          {t("hiring.why.eyebrow")}
        </p>
        <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
          <Accented text={t("hiring.why.title")} />
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(reason => (
            <div key={reason.n} className="border-t border-white/10 pt-5">
              <p className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-main-accent-t1">
                {reason.n}
              </p>
              <h3 className="mt-3 font-medium text-white">
                {t(`hiring.why.${reason.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-main-mist/55">
                {t(`hiring.why.${reason.key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
