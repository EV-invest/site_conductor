// ROUTING SPIKE — temporary, delete before merge.
//
// The decisive case. In the real end state `app/[locale]/page.tsx` is the
// homepage, which means a ONE-segment English URL like `/team` is ambiguous with
// it: `[locale]` matches a single segment, so `/team` reads as locale="team"
// before any rewrite gets a chance. This route stands in for `/team`, and
// `app/[locale]/page.tsx` beside it stands in for the homepage that creates the
// ambiguity.
export default async function Spike2({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main>
      <h1>spike2</h1>
      <p data-testid="locale">{locale}</p>
    </main>
  );
}
