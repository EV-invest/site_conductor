import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";

/**
 * Says plainly that this role is being served in English.
 *
 * Vacancies take rule 1.3's `fallback` rather than `hide` — the deliberate
 * exception recorded in `docs/i18n-persisted-content.md`, because hiding an open
 * role from someone who reads English perfectly well costs a candidate, and
 * every one of these roles expects working English anyway.
 *
 * The price of that choice is that a reader can meet English prose under
 * localised chrome, which is exactly what rule 1.3 exists to prevent elsewhere.
 * Saying so is what makes the trade honest instead of sloppy: the reader learns
 * the page is not broken and the site is not pretending. Without this the
 * fallback is indistinguishable from a translation nobody finished.
 *
 * Driven by the backend's `translated` flag, which is false both when no
 * translation exists and when the one that does is stale (its `source_digest`
 * no longer matches the English row). The two are not distinguished on purpose —
 * they mean the same thing to a reader.
 */
export function UntranslatedNotice({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <div className="border-b border-white/[0.06] bg-white/[0.02]">
      <Container>
        <p role="note" className="py-3 text-xs text-main-mist/55">
          {t("vacancy.untranslated")}
        </p>
      </Container>
    </div>
  );
}
