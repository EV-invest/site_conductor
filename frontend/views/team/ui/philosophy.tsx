import { LineChart, ShieldCheck, Anchor } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";
import { SectionHead } from "./section-head";

// Icon + catalogue keys; the text itself lives in messages/<locale>/common.json.
const PRINCIPLES = [
  { icon: LineChart, key: "macro" },
  { icon: ShieldCheck, key: "risk" },
  { icon: Anchor, key: "roots" },
];

export function TeamPhilosophy({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section className="border-t border-main-mist/10 bg-main-surface py-20">
      <Container className="space-y-12">
        <SectionHead eyebrow={t("team.philosophy.eyebrow")}>
          {t("team.philosophy.title")}
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="space-y-4 rounded-xl border border-main-mist/10 bg-main-card p-8"
            >
              <div className="flex size-13 items-center justify-center rounded-full bg-main-mist/5 text-main-accent-t1">
                <Icon className="size-5" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-white">
                {t(`team.philosophy.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-main-mist/75">
                {t(`team.philosophy.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
