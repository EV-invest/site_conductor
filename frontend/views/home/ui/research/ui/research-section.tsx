import { type Locale } from "@evinvest/i18n";

import {
  formatPublicationDate,
  publicationsByKind,
} from "@/entities/publication";

import { ResearchA, type ResearchReport } from "./research";

/**
 * Server half of the Research section: reads the catalogue and hands the client
 * component a small, already-formatted view model.
 *
 * The split exists to keep the catalogue off the wire. `ResearchA` is a client
 * component, so anything it imports is bundled — importing the entity there
 * would ship every publication's full search text to the homepage.
 */
export function Research({ locale }: { locale: Locale }) {
  const reports: ResearchReport[] = publicationsByKind("research", locale).map(
    publication => ({
      cat: publication.category ?? "Research",
      title: publication.title,
      paneTitle: publication.title,
      slug: publication.slug,
      date: formatPublicationDate(publication.date, "long", locale),
      quote: publication.quote ?? publication.dek,
      // The dek is the report's own summary. The section used to carry two
      // hand-written paragraphs per report that existed nowhere else and drifted
      // from the documents they described.
      body: [publication.dek],
    })
  );

  if (reports.length === 0) return null;
  return <ResearchA reports={reports} locale={locale} />;
}
