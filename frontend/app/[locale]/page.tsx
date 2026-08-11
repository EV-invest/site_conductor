// ROUTING SPIKE — temporary, delete before merge.
// Stands in for the real homepage under [locale]. Its existence is what makes a
// one-segment English URL ambiguous — see spike2/page.tsx.
export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main>
      <h1>locale home</h1>
      <p data-testid="locale">{locale}</p>
    </main>
  );
}
