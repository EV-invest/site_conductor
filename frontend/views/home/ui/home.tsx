import type { Locale } from "@evinvest/i18n";

import { FieldNotes } from "./field-notes";
import { Hero } from "./hero";
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
// `./partners` is built and not mounted, on purpose. The marquee of the vendors
// we run on is ready to switch on with one line here, once we decide the landing
// should name them.
export function HomeView({ locale }: { locale: Locale }) {
  return (
    <div className="min-h-screen bg-background text-ink font-sans">
      <HomeStructuredData locale={locale} />
      <Hero locale={locale} />
      <FieldNotes locale={locale} />
      <Portfolio />
      <Research locale={locale} />
      <Team locale={locale} />
    </div>
  );
}
