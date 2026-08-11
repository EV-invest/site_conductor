import { Container } from "@evinvest/uikit";
import { MobileCarousel } from "@/shared/ui/carousel";
import { Reveal, Stagger, StaggerItem } from "@/shared/ui/motion";
import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker } from "@/features/ab-variant";
import { ASSETS } from "@/shared/config/assets";
import { TEAM, MemberCard, LeadershipIntro } from "@/entities/team";
import { PlaceholderCard } from "./shared/cards";
import { PLACEHOLDER_CARDS, TeamPlaceholders } from "./shared/placeholders";

// Homepage Team section. Server Component; client islands are
// {@link MobileCarousel} (swipe), the motion wrappers, and the
// {@link ExperimentTracker} boundaries. Resolves the team_office A/B
// variant server-side so the right photo lands in the shared
// {@link LeadershipIntro}.
//
// Motion: the intro reveals as one block, then the 4-up grid deals its cards in
// sequence. The mobile carousel reveals whole — staggering slides the reader
// can't see yet would just delay the first one.
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
          <Reveal>
            <LeadershipIntro officeSrc={officeSrc} />
          </Reveal>
        </ExperimentTracker>

        <ExperimentTracker experiment="team_bio_shade" variant={shadeVariant}>
          {/* Desktop: members and opportunities share one 4-up grid. */}
          <Stagger className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(member => (
              <StaggerItem key={member.name}>
                <MemberCard member={member} shade={shade} />
              </StaggerItem>
            ))}
            {PLACEHOLDER_CARDS.map(card => (
              <StaggerItem key={card.title}>
                <PlaceholderCard {...card} />
              </StaggerItem>
            ))}
          </Stagger>
          {/* Mobile: portraits and opportunities share one swipe carousel. */}
          <Reveal className="sm:hidden">
            <MobileCarousel>
              {cards}
              <TeamPlaceholders />
            </MobileCarousel>
          </Reveal>
        </ExperimentTracker>
      </Container>
    </section>
  );
}
