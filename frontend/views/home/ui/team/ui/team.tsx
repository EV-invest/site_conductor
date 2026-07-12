import { Container } from "@evinvest/uikit";
import { MobileCarousel } from "@/shared/ui/carousel";
import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker } from "@/features/ab-variant";
import { ASSETS } from "@/shared/config/assets";
import { TEAM, MemberCard, LeadershipIntro } from "@/entities/team";
import { TeamPlaceholders } from "./shared/placeholders";

// Homepage Team section. Server Component; client islands are
// {@link TeamPlaceholders} (CTA clicks), {@link MobileCarousel} (swipe), and
// the {@link ExperimentTracker} boundaries. Resolves the team_office A/B
// variant server-side so the right photo lands in the shared
// {@link LeadershipIntro}.
export async function Team() {
  const shadeVariant = await getVariant("team_bio_shade");
  const shade = shadeVariant === "b" ? "shadow" : "gradient";
  const cards = TEAM.map(member => (
    <MemberCard key={member.name} member={member} shade={shade} />
  ));

  const officeVariant = await getVariant("team_office");
  const officeSrc = officeVariant === "b" ? ASSETS.messy_office : undefined;

  return (
    <section
      id="team"
      className="py-24 relative border-t border-main-mist/10 bg-main-black"
    >
      <Container className="space-y-16">
        <ExperimentTracker experiment="team_office" variant={officeVariant}>
          <LeadershipIntro officeSrc={officeSrc} />
        </ExperimentTracker>

        <ExperimentTracker experiment="team_bio_shade" variant={shadeVariant}>
          {/* Desktop: members and opportunities share one 4-up grid. */}
          <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {cards}
            <TeamPlaceholders />
          </div>
          {/* Mobile: portraits and opportunities share one swipe carousel. */}
          <div className="sm:hidden">
            <MobileCarousel>
              {cards}
              <TeamPlaceholders />
            </MobileCarousel>
          </div>
        </ExperimentTracker>
      </Container>
    </section>
  );
}