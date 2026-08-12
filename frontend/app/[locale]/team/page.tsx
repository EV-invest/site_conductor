import type { Metadata } from "next";
import { TeamPageView } from "@/views/team";

// Static page — no request data — so it's statically generated and indexable.
export const metadata: Metadata = {
  title: "Team",
  description:
    "The cross-border investment, risk and development team behind EV Investment — a Quy Nhơn–based fund building institutional access to Vietnam's premium coastal real estate.",
  alternates: { canonical: "/team" },
};

export default function Page() {
  return <TeamPageView />;
}
