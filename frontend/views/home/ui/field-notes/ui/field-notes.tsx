import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@evinvest/uikit";
import { localePath, type Locale } from "@evinvest/i18n";

import { fieldNotes, formatPublicationDate } from "@/entities/publication";
import { Reveal, SplitText } from "@/shared/ui/motion";
import { translate } from "@/shared/config/i18n";
import { accented } from "@/shared/ui/accented";

import { toNoteViews } from "../model/to-note-view";
import { NoteSummary } from "./note-summary";

/**
 * Second section of the homepage, directly under the hero.
 *
 * Research (further down the page) is the desk work; this is the evidence from
 * the ground. Putting a real place and a real person immediately after the
 * pitch is the point — it is the fastest de-risking a fund selling one specific
 * district can do.
 */
export function FieldNotes({ locale }: { locale: Locale }) {
  const t = translate(locale);
  // Bounded at the source: the band renders a lead, one companion and three
  // archive lines, and nothing below that is ever read.
  const notes = toNoteViews(fieldNotes(locale, 5), t);

  // Nothing filmed yet is a legitimate state — say nothing rather than render
  // an empty band.
  if (notes.length === 0) return null;
  const [lead, ...rest] = notes;
  const second = rest[0];
  const archive = rest.slice(1, 4);

  return (
    <section
      id="field-notes"
      className="border-b border-ink/10 bg-background py-24 text-ink"
    >
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="block font-mono-tech text-xs tracking-[0.3em] text-accent-debug uppercase">
              {t("home.fieldNotes.eyebrow", "From the ground")}
            </span>
            <h2 className="mt-3 font-serif-display text-3xl leading-tight font-light text-white sm:text-5xl">
              <SplitText inView>
                {accented({
                  text: t(
                    "home.fieldNotes.title",
                    "Field Notes from *Quy Nhơn*"
                  ),
                })}
              </SplitText>
            </h2>
            <p className="mt-4 leading-relaxed font-light text-ink/70">
              {t(
                "home.fieldNotes.intro",
                "Research explains the thesis. Field notes show you the place — our people on the ground, filming the districts we underwrite, the roads being built, and what daily life actually costs."
              )}
            </p>
          </div>
          <Link
            href={localePath(locale, "/publications")}
            className="inline-flex items-center gap-2 border border-ink/25 px-5 py-3.5 font-mono-tech text-[11px] tracking-[0.15em] text-ink/85 transition-colors hover:border-accent-debug hover:text-accent-debug"
          >
            {t("home.fieldNotes.all", "All field notes")}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Reveal>

        <Reveal delay={0.05} className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <NoteSummary
              note={lead}
              eyebrow={t("home.fieldNotes.latest", "Latest dispatch")}
              lead
              locale={locale}
            />
          </div>
          {second && (
            <div className="flex flex-col gap-10 lg:col-span-4">
              <NoteSummary
                note={second}
                eyebrow={t("home.fieldNotes.previous", "Previous")}
                locale={locale}
              />
              {archive.length > 0 && (
                <div className="border border-ink/10 bg-card/50 px-6 pt-5 pb-2">
                  <span className="block font-mono-tech text-[10px] tracking-[0.19em] text-accent-debug uppercase">
                    {t("home.fieldNotes.more", "More from the field")}
                  </span>
                  <ul className="mt-3">
                    {archive.map(({ publication }) => (
                      <li
                        key={publication.slug}
                        className="border-t border-ink/8 py-3.5 first:border-t-0"
                      >
                        <Link
                          href={localePath(
                            locale,
                            `/publications/${publication.slug}`
                          )}
                          className="flex gap-4 text-sm text-ink/80 transition-colors hover:text-ink"
                        >
                          <span className="w-14 shrink-0 font-mono-tech text-[10px] text-ink/35">
                            {formatPublicationDate(
                              publication.date,
                              "short",
                              locale
                            )}
                          </span>
                          {publication.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
