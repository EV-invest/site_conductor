import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { ContactForm } from "@/features/contact-message";
import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

import { ContactStructuredData } from "./contact-structured-data";

// Keys, not text: the city name is translated too ("Хошимин"), so the pair has
// to come out of the catalogue rather than being interpolated around it.
const OFFICES = [
  { city: "contact.office.hq.city", line: "contact.office.hq.line" },
  { city: "contact.office.hcmc.city", line: "contact.office.hcmc.line" },
];

function Channel({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/45">
        {label}
      </p>
      <a
        href={`mailto:${value}`}
        className="text-sm text-main-mist/85 transition-colors hover:text-main-accent-t1"
      >
        {value}
      </a>
    </div>
  );
}

export function ContactView({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <div className="min-h-screen bg-main-black text-main-mist">
      <ContactStructuredData />
      <section className="pt-36 pb-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <p className="mb-5 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
                {t("contact.eyebrow")}
              </p>
              <h1 className="font-serif-display text-4xl font-light text-white sm:text-5xl">
                <Accented text={t("contact.title")} />
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-main-mist/60 sm:text-base">
                {t("contact.intro")}
              </p>
              <div className="mt-9 flex flex-wrap gap-10">
                <Channel
                  label={t("contact.channel.general")}
                  value="admin@evinvest.ltd"
                />
              </div>
              <div className="mt-10 grid gap-6 border-t border-white/[0.06] pt-8 sm:grid-cols-2">
                {OFFICES.map(office => (
                  <div key={office.city}>
                    <p className="font-mono-tech text-[10px] uppercase tracking-[0.18em] text-main-mist/60">
                      {t(office.city)}
                    </p>
                    <p className="mt-1 text-sm text-main-mist/45">
                      {t(office.line)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </Container>
      </section>
    </div>
  );
}
