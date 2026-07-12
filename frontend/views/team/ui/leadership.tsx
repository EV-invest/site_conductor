import { Container } from "@evinvest/uikit";
import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker } from "@/features/ab-variant";
import { ASSETS } from "@/shared/config/assets";
import { LeadershipIntro } from "@/entities/team";
import { TeamMembers } from "./members";

export async function TeamLeadership() {
  const variant = await getVariant("team_office");
  const officeSrc = variant === "b" ? ASSETS.messy_office : undefined;

  return (
    <section className="border-t border-main-mist/10 py-20">
      <Container className="space-y-14">
        <ExperimentTracker experiment="team_office" variant={variant}>
          <LeadershipIntro officeSrc={officeSrc} />
        </ExperimentTracker>
        <TeamMembers />
      </Container>
    </section>
  );
}