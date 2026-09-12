"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { formatMessage, type Locale, type Messages } from "@evinvest/i18n";
import type { T } from "@/shared/config/i18n";

// The local twin of `translate` in shared/config/i18n.ts, for client islands.
// Not `@evinvest/i18n/react`: that package's `Translate` is `(key, values)` and
// is shared with the cabinet, which has 971 call sites on that signature. The
// catalogue arrives as a prop rather than by import — shared/config/i18n.ts
// statically imports all five.

const Ctx = createContext<{ locale: Locale; t: T } | null>(null);

// The client half of the unknown-key channel in shared/config/i18n.ts. Inlined
// rather than imported from there: that module statically imports all five
// catalogues, and pulling a value out of it would ship them to the browser.
// `en` arrives with an empty catalogue by construction, so it is not a miss.
const warned = new Set<string>();
function warnUnknownKey(key: string, locale: Locale) {
  if (locale === "en" || warned.has(key)) return;
  warned.add(key);
  console.warn(
    `i18n ${locale}: "${key}" is not in messages/en/common.json — rendering the` +
      ` inline English. Run \`npm run i18n:extract\`.`
  );
}

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      t: ((key, en, values) => {
        const pattern = messages[key];
        if (pattern === undefined) warnUnknownKey(key, locale);
        return formatMessage(pattern ?? en, locale, values);
      }) as T,
    }),
    [locale, messages]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useI18n() {
  const value = useContext(Ctx);
  if (!value) throw new Error("no <I18nProvider> above this component");
  return value;
}

export const useT = (): T => useI18n().t;
export const useLocale = (): Locale => useI18n().locale;
