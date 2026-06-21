import { Hero } from "./hero";
import { Overview as RealEstateAllocation } from "./real_estate_allocation";
import { Research } from "./research";
import { Team } from "./team";
import { HomeStructuredData } from "./structured-data";

// Server Component composing the page top-to-bottom. It renders sections
// uniformly and is intentionally UNAWARE that any of them are A/B tested — each
// section owns its own variant resolution (see hero/ui/hero.tsx,
// team/ui/team.tsx). Header and Footer are page chrome rendered by the
// application layout, not page sections.
export function HomeView() {
  return (
    <div className="min-h-screen bg-main-black text-main-mist font-sans">
      <HomeStructuredData />
      <Hero />
      <RealEstateAllocation />
      <Research />
      <Team />
    </div>
  );
}
