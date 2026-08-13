import Link from "next/link";
import { Users, Globe } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { localePath, translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";
import { SectionHead } from "./section-head";

// Plain styled <Link> CTAs (not two sibling <Button asChild> — that desyncs
// hydration under React 19; see frontend/PATTERNS.md §7).
const CARDS = [
  { icon: Users, key: "hiring", href: "/hiring" },
  { icon: Globe, key: "ir", href: "/contact" },
];

export function TeamJoin({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section className="border-t border-main-mist/10 pb-24 pt-20">
      <Container className="space-y-12">
        <SectionHead eyebrow={t("team.join.eyebrow")}>
          {t("team.join.title")}
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map(({ icon: Icon, key, href }) => (
            <div
              key={key}
              className="flex flex-col items-center gap-4 rounded-xl border border-main-mist/10 bg-main-card px-8 py-14 text-center"
            >
              <div className="flex size-13 items-center justify-center rounded-full bg-main-mist/5 text-main-accent-t1">
                <Icon className="size-5" />
              </div>
              <span className="font-mono-tech text-[10px] uppercase tracking-widest text-main-mist/60">
                {t(`team.join.${key}.eyebrow`)}
              </span>
              <h3 className="font-serif-display text-lg font-bold text-white">
                {t(`team.join.${key}.title`)}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-main-mist/75">
                {t(`team.join.${key}.body`)}
              </p>
              <Link
                // Locale-prefixed for the same reason localizeNav prefixes
                // the header: a reader on /ru/team clicking through must not
                // land on the English /hiring.
                href={localePath(locale, href)}
                className="mt-1 rounded-md border border-main-accent-t1/60 px-5 py-2 font-mono-tech text-[11px] uppercase tracking-widest text-main-accent-t1 transition-colors hover:bg-main-accent-t1/10"
              >
                {t(`team.join.${key}.cta`)}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
