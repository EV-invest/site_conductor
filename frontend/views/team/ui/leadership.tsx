import { Container } from "@evinvest/uikit";
import { LeadershipIntro } from "@/entities/team";
import { TeamMembers } from "./members";

export function TeamLeadership() {
  return (
    <section className="border-t border-main-mist/10 py-20">
      <Container className="space-y-14">
        <LeadershipIntro />
        <TeamMembers />
      </Container>
    </section>
  );
}
