import { TeamPageView } from "@/views/team";
import { pageMetadata } from "@/shared/seo/page-metadata";

// Static page — no request data — so it's statically generated and indexable.
export const metadata = pageMetadata({
  title: "Team",
  description:
    "The cross-border investment, risk and development team behind EV Investment — a Quy Nhơn–based fund building institutional access to Vietnam's premium coastal real estate.",
  path: "/team",
});

export default function Page() {
  return <TeamPageView />;
}
