import { StatusScreen } from "@evinvest/uikit";
import { localePath, translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";

/**
 * The 404 / 403 / 401 surfaces, in the reader's language.
 *
 * The uikit's ready-made `NotFound` / `Forbidden` / `ServerError` bake their copy
 * in, which is why these pages were English under Russian chrome — a reader who
 * had navigated the whole site in their own language met an English apology at
 * the one moment the site was already failing them. `StatusScreen` is the same
 * component underneath and takes every string as a prop, so this needs no uikit
 * release.
 *
 * 401 has no uikit page at all: `authInterrupts` gives Next both `forbidden()`
 * and `unauthorized()`, and only the former had a file. An `unauthorized()` call
 * would have fallen through to the generic error boundary.
 *
 * Server-rendered on purpose. The catalogues are ~176 KB across five locales;
 * reading the locale on the client would ship all of them to render a page
 * nobody wants to be on. The 500 cannot use this — Next requires `error.tsx` to
 * be a Client Component — and takes its copy from `StatusCopyProvider` instead.
 */
type StatusKind = "notFound" | "forbidden" | "unauthorized";

const ACCENT = { notFound: "teal", forbidden: "gold", unauthorized: "gold" } as const;
const CODE = { notFound: "404", forbidden: "403", unauthorized: "401" } as const;

/** Shell-owned auth entry point; not a `[locale]` route, so no `localePath`. */
const SIGN_IN_HREF = "/api/auth/login";

export function LocalisedStatus({
  kind,
  locale,
}: {
  kind: StatusKind;
  locale: Locale;
}) {
  const t = translator(messagesFor(locale), locale);
  const secondary =
    kind === "unauthorized"
      ? { label: t("status.signIn"), href: SIGN_IN_HREF }
      : {
          label:
            kind === "forbidden"
              ? t("status.requestAccess")
              : t("status.contactTeam"),
          href: localePath(locale, "/contact"),
        };
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
        { ...secondary, variant: "outline" },
      ]}
    />
  );
}
