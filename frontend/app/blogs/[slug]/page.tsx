import type { Metadata } from "next";

// TODO: generalize — hardcoded title map, should come from the blog flake
const TITLES: Record<string, string> = {
  hospitality_yield_shifts: "Post-Pandemic Hospitality Yield Shifts",
  vietnam_coastal_2026: "Vietnam Coastal Macro Report 2026",
  vietnam_tail_risk: "Vietnam Tail Risk Analysis",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = TITLES[slug] ?? slug;
  return {
    title,
    description: `EV Investment research — ${title}`,
    alternates: { canonical: `/blogs/${slug}` },
    robots: "noindex",
  };
}

// Same pattern as /whitepaper — self-contained static HTML build served via
// iframe so the root layout's Header sits on top. Dark is the default variant.
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <iframe
      src={`/blogs/${slug}.dark.html`}
      title={TITLES[slug] ?? slug}
      className="block w-full border-0"
      style={{ marginTop: "6rem", height: "calc(100vh - 6rem)" }}
    />
  );
}
