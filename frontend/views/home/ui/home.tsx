import type { Locale } from "@evinvest/i18n";

import { CabinetTour } from "./cabinet-tour";
import { FieldNotes } from "./field-notes";
import { Hero } from "./hero";
import { Partners } from "./partners";
import { Portfolio } from "./portfolio";
import { Research } from "./research";
import { Team } from "./team";
import { HomeStructuredData } from "./structured-data";

// Server Component composing the page top-to-bottom. It renders sections
// uniformly and is intentionally UNAWARE that any of them are A/B tested — each
// section owns its own variant resolution (see hero/ui/hero.tsx,
// team/ui/team.tsx). Header and Footer are page chrome rendered by the
// application layout, not page sections.
//
// The hero carries the page's one pitch; every other section shows rather
// than sells, and the cabinet tour is the only place below the fold that
// says what happens next (owner feedback, 2026-09-18).
export function HomeView({ locale }: { locale: Locale }) {
  return (
    <div className="min-h-screen bg-background text-ink font-sans">
      <HomeStructuredData locale={locale} />
      <Hero locale={locale} />
      <FieldNotes locale={locale} />
      <Portfolio locale={locale} />
      <Research locale={locale} />
      <CabinetTour locale={locale} />
      <Partners locale={locale} />
      <Team locale={locale} />
    </div>
  );
}
