import { TeamPageView } from "@/views/team";
import { pageMetadata } from "@/shared/seo/page-metadata";

// generateMetadata, not a static `metadata`, only so the canonical can carry the
// locale prefix — the page itself still takes no request data and prerenders for
// every locale via the layout's generateStaticParams.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata({
    title: "Team",
    description:
      "The cross-border investment, risk and development team behind EV Investment — a Quy Nhơn–based fund building institutional access to Vietnam's premium coastal real estate.",
    path: "/team",
    locale,
  });
}

export default function Page() {
  return <TeamPageView />;
}
