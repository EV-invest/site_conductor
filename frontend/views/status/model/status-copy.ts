import { localePath, translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";
import type { StatusCopy } from "@/shared/ui/status-copy";

/**
 * Resolve the 500's strings on the server, for `StatusCopyProvider` to carry to
 * the client boundary. Server-only by construction: it reads `messagesFor`,
 * which statically imports every catalogue.
 */
export function serverErrorCopy(locale: Locale): StatusCopy {
  const t = translator(messagesFor(locale), locale);
  return {
    eyebrow: t("status.serverError.eyebrow"),
    headlineLead: t("status.serverError.headlineLead"),
    headlineAccent: t("status.serverError.headlineAccent"),
    subtext: t("status.serverError.subtext"),
    backHome: t("status.backHome"),
    tryAgain: t("status.tryAgain"),
    homeHref: localePath(locale, "/"),
  };
}
