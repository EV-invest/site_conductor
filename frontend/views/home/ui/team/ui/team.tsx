import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";
import { MobileCarousel } from "@/shared/ui/carousel";
import { Reveal, Stagger, StaggerItem } from "@/shared/ui/motion";
import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker } from "@/features/ab-variant";
import { TEAM, MemberCard, LeadershipIntro } from "@/entities/team";
import { PlaceholderCard } from "./shared/cards";
import { placeholderCards, TeamPlaceholders } from "./shared/placeholders";

// Homepage Team section. Server Component; client islands are
// {@link MobileCarousel} (swipe), the motion wrappers, and the
// {@link ExperimentTracker} boundary. Resolves the team_bio_shade A/B variant
// server-side; the intro above the grid is the shared {@link LeadershipIntro}
// and takes no variant of its own.
//
// Motion: the intro reveals as one block, then the 4-up grid deals its cards in
// sequence. The mobile carousel reveals whole — staggering slides the reader
// can't see yet would just delay the first one.
export async function Team({ locale }: { locale: Locale }) {
  const shadeVariant = await getVariant("team_bio_shade");
  const shade = shadeVariant === "b" ? "shadow" : "gradient";
  const cards = TEAM.map(member => (
    <MemberCard
      key={member.name}
      member={member}
      locale={locale}
      shade={shade}
    />
  ));

  return (
    <section
      id="team"
      className="py-24 relative border-t border-main-mist/10 bg-main-black"
    >
      <Container className="space-y-16">
        <Reveal>
          <LeadershipIntro locale={locale} />
        </Reveal>

        <ExperimentTracker experiment="team_bio_shade" variant={shadeVariant}>
          {/* Desktop: members and opportunities share one 4-up grid. */}
          <Stagger className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(member => (
              <StaggerItem key={member.name}>
                <MemberCard member={member} locale={locale} shade={shade} />
              </StaggerItem>
            ))}
            {placeholderCards(locale).map(card => (
              <StaggerItem key={card.href}>
                <PlaceholderCard {...card} />
              </StaggerItem>
            ))}
          </Stagger>
          {/* Mobile: portraits and opportunities share one swipe carousel. */}
          <Reveal className="sm:hidden">
            <MobileCarousel>
              {cards}
              <TeamPlaceholders locale={locale} />
            </MobileCarousel>
          </Reveal>
        </ExperimentTracker>
      </Container>
    </section>
  );
}
