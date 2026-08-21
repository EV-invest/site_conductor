import { StatusScreen } from "@evinvest/uikit";
import { localePath, translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";

/**
 * The 404 / 403 surfaces, in the reader's language.
 *
 * The uikit's ready-made `NotFound` / `Forbidden` bake their copy in, which is
 * why these pages were English under Russian chrome — a reader who had navigated
 * the whole site in their own language met an English apology at the one moment
 * the site was already failing them. `StatusScreen` is the same component
 * underneath and takes every string as a prop, so this needs no uikit release.
 *
 * Server-rendered on purpose. The catalogues are ~176 KB across five locales;
 * reading the locale on the client would mean shipping all of them to render a
 * page nobody wants to be on. `next/root-params` is what makes that avoidable —
 * see the note on the pages themselves.
 */
type StatusKind = "notFound" | "forbidden";

const ACCENT = { notFound: "teal", forbidden: "gold" } as const;
const CODE = { notFound: "404", forbidden: "403" } as const;

export function LocalisedStatus({
  kind,
  locale,
}: {
  kind: StatusKind;
  locale: Locale;
}) {
  const t = translator(messagesFor(locale), locale);
  return (
    <StatusScreen
      accent={ACCENT[kind]}
      code={CODE[kind]}
      eyebrow={t(`status.${kind}.eyebrow`)}
      headlineLead={t(`status.${kind}.headlineLead`)}
      headlineAccent={t(`status.${kind}.headlineAccent`)}
      subtext={t(`status.${kind}.subtext`)}
      links={[
        {
          label: t("status.backHome"),
          href: localePath(locale, "/"),
          leadingArrow: true,
        },
        {
          label:
            kind === "forbidden"
              ? t("status.requestAccess")
              : t("status.contactTeam"),
          href: localePath(locale, "/contact"),
          variant: "outline",
        },
      ]}
    />
  );
}
