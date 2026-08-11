// ROUTING SPIKE — temporary, delete before merge.
// Owns the [locale] param for every page beneath it.
const LOCALES = ["en", "ru", "vi", "fr", "de"] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }));
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
