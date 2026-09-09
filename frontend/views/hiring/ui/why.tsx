import { Crosshair, Microscope, Sparkles, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

// These four are a set, not a sequence — the old "01".."04" markers implied an
// order that the copy does not have. Icon + catalogue key, as on /team.
const REASONS: { icon: LucideIcon; key: string }[] = [
  { icon: Crosshair, key: "focus" },
  { icon: Microscope, key: "rigor" },
  { icon: TrendingUp, key: "scale" },
  { icon: Sparkles, key: "upside" },
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
          {REASONS.map(({ icon: Icon, key }) => (
            <div key={key} className="border-t border-white/10 pt-5">
              <div className="flex size-10 items-center justify-center rounded-full bg-main-mist/5 text-main-accent-t1">
                <Icon aria-hidden className="size-4" />
              </div>
              <h3 className="mt-3 font-medium text-white">
                {t(`hiring.why.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-main-mist/55">
                {t(`hiring.why.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
