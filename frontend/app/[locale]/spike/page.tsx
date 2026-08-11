// ROUTING SPIKE — temporary, delete before merge.
//
// Proves the config-level locale routing from the i18n plan: every page lives
// under `app/[locale]/`, and one `afterFiles` rewrite serves the default locale
// at unprefixed paths, so no middleware is needed and no indexed English URL
// moves.
//
// This route exists ONLY under `[locale]`, which is the whole point — a route
// that also existed at `app/spike/` would match the static path and never
// exercise the rewrite.
import { notFound } from "next/navigation";

const LOCALES = ["en", "ru", "vi", "fr", "de"] as const;
type Locale = (typeof LOCALES)[number];

const GREETING: Record<Locale, string> = {
  en: "English page",
  ru: "Русская страница",
  vi: "Trang tiếng Việt",
  fr: "Page française",
  de: "Deutsche Seite",
};

export const dynamicParams = true;

export function generateStaticParams() {
  // Includes "en": unprefixed URLs are *rewritten* onto /en/*, so that route has
  // to be really prerendered even though no reader ever sees the URL.
  return LOCALES.map(locale => ({ locale }));
}

export default async function SpikePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  return (
    <main data-testid="spike">
      <h1>{GREETING[locale as Locale]}</h1>
      <p data-testid="locale">{locale}</p>
    </main>
  );
}
