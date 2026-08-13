import { ASSETS } from "@/shared/config/assets";

// Roles and bios are catalogue keys, not literals: this row is rendered by the
// homepage Team section, the /team grid and the Person JSON-LD, and a translated
// string held in three places drifts. The key is the single identifier; the five
// catalogues under messages/ hold the text. Names are NOT translated.
export type TeamMember = {
  photo: string;
  name: string;
  roleKey: string;
  bioKey: string;
};

export const TEAM: TeamMember[] = [
  {
    photo: ASSETS.team_member_1,
    name: "Elisey Zhikharev",
    roleKey: "team.member.ez.role",
    bioKey: "team.member.ez.bio", //TODO: real bio
  },
  {
    photo: ASSETS.team_member_2,
    name: "Valeriy Sakharov",
    roleKey: "team.member.vs.role",
    bioKey: "team.member.vs.bio",
  },
];
