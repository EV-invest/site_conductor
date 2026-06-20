import { TeamHero } from "./hero";
import { TeamLeadership } from "./leadership";
import { TeamPhilosophy } from "./philosophy";
import { TeamOffices } from "./offices";
import { TeamJoin } from "./join";

// Dedicated /team page (ported from Figma "Team · Desktop"). Fully static — no
// backend data — so it statically generates and is indexable. Header/Footer are
// app-shell chrome from the root layout; this view owns the content top-to-bottom.
export function TeamPageView() {
  return (
    <div className="min-h-screen bg-main-black text-main-mist">
      <TeamHero />
      <TeamLeadership />
      <TeamPhilosophy />
      <TeamOffices />
      <TeamJoin />
    </div>
  );
}
