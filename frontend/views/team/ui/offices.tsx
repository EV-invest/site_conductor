import { MapPin } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { OFFICES } from "@/shared/config/site";
import { messagesFor } from "@/shared/config/i18n";
import { SectionHead } from "./section-head";

export function TeamOffices({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section className="border-t border-main-mist/10 py-20">
      <Container className="space-y-12">
        <SectionHead eyebrow={t("team.offices.eyebrow")}>
          {t("team.offices.title")}
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-2">
          {OFFICES.map(office => (
            <div
              key={office.id}
              className="space-y-3.5 rounded-xl border border-main-mist/10 bg-main-card p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-main-mist/5 text-main-accent-t1">
                  <MapPin className="size-5" />
                </div>
                <h3 className="font-mono-tech text-[11px] uppercase tracking-widest text-white">
                  {t(`team.offices.${office.id}`)}
                </h3>
              </div>
              {/* The office *name* above is descriptive and translates. The
                  postal address does not: it is the address a courier, a visa
                  form or Google Maps has to resolve, and it is the same string
                  the Organization JSON-LD emits. Translating it would break
                  both. */}
              <p className="leading-relaxed text-main-mist/80">
                {office.streetAddress}, {office.addressLocality},{" "}
                {office.addressRegion}, {office.addressCountry}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
