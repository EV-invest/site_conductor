import { FileSearch, FileSignature, MessageSquare, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { ApplicationForm } from "@/features/job-application";
import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

// The medallion says what the step IS; the ordinal in the title line says where
// it sits. A candidate checks "third of four" by eye, and the <ol> conveys that
// to a screen reader only — hence a visible number, marked aria-hidden so the
// list semantics are not read out twice.
const STEPS: { icon: LucideIcon; key: string }[] = [
  { icon: MessageSquare, key: "intro" },
  { icon: FileSearch, key: "deep" },
  { icon: Users, key: "meet" },
  { icon: FileSignature, key: "offer" },
];

/** Merged "process + apply" panel: the gold-number hiring timeline beside the
 *  general (vacancy-agnostic) application form. */
export function HiringProcess({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section id="apply" className="scroll-mt-24 bg-main-black pb-24 pt-4">
      <Container>
        <div className="rounded-3xl border border-white/[0.06] bg-main-card/20 p-8 sm:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
                {t("hiring.process.eyebrow")}
              </p>
              <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
                <Accented text={t("hiring.process.title")} />
              </h2>
              <ol className="relative mt-9 space-y-6 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-main-accent-t3/20">
                {STEPS.map(({ icon: Icon, key }, index) => (
                  <li key={key} className="relative flex gap-4">
                    <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-main-accent-t3/40 bg-main-black text-main-accent-t3">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    <div className="pt-1">
                      <h3 className="flex items-baseline gap-2.5 font-medium text-white">
                        <span
                          aria-hidden
                          className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-accent-t3"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {t(`hiring.process.${key}.title`)}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-main-mist/55">
                        {t(`hiring.process.${key}.body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <ApplicationForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
