import type { Locale } from "@evinvest/i18n";

import { FieldNotes } from "./field-notes";
import { Hero } from "./hero";
import { Portfolio } from "./portfolio";
import { Research } from "./research";
import { Showcase } from "./showcase";
import { Team } from "./team";
import { HomeStructuredData } from "./structured-data";

// Server Component composing the page top-to-bottom. It renders sections
// uniformly and is intentionally UNAWARE that any of them are A/B tested — each
// section owns its own variant resolution (see hero/ui/hero.tsx,
// team/ui/team.tsx). Header and Footer are page chrome rendered by the
// application layout, not page sections.
export function HomeView({ locale }: { locale: Locale }) {
  return (
    <div className="min-h-screen bg-main-black text-main-mist font-sans">
      <HomeStructuredData locale={locale} />
      <Hero locale={locale} />
      <FieldNotes locale={locale} />
      <Portfolio />
      <Research locale={locale} />
      <Showcase locale={locale} />
      <Team locale={locale} />
    </div>
  );
}
