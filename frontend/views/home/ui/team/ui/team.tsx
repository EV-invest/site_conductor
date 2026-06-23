import { Container } from "@evinvest/uikit";
import { MobileCarousel } from "@/shared/ui/carousel";
import { TEAM, MemberCard, LeadershipIntro } from "@/entities/team";
import { TeamPlaceholders } from "./shared/placeholders";

// Homepage Team section. Server Component; the only client island is
// {@link TeamPlaceholders} (CTA clicks) and {@link MobileCarousel} (swipe).
export function Team() {
  const cards = TEAM.map(member => (
    <MemberCard key={member.name} member={member} />
  ));

  return (
    <section
      id="team"
      className="py-24 relative border-t border-main-mist/10 bg-main-black"
    >
      <Container className="space-y-16">
        <LeadershipIntro />

        {/* Desktop: members and opportunities share one 4-up grid. */}
        <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {cards}
          <TeamPlaceholders />
        </div>
        {/* Mobile: swipe the portraits, opportunities stacked beneath. */}
        <div className="space-y-8 sm:hidden">
          <MobileCarousel>{cards}</MobileCarousel>
          <div className="grid gap-8">
            <TeamPlaceholders />
          </div>
        </div>
      </Container>
    </section>
  );
}
