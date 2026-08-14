import { Users, Globe } from "lucide-react";
import { localePath, translator, type Locale } from "@evinvest/i18n";

import { messagesFor } from "@/shared/config/i18n";
import { PlaceholderCard } from "./cards";

/**
 * The "join us" / "LP network" CTA cards, as data. Exported separately from the
 * fragment below so the desktop grid can wrap each card in its own stagger item
 * — a fragment would put both cards in one grid cell.
 */
// Title/body/CTA reuse the `team.join.*` keys the /team page already defines —
// this is the same offer in a second place, and two copies of one sentence drift.
const CARDS = [
  {
    icon: Users,
    key: "hiring",
    href: "/hiring",
    subKey: "home.team.placeholder.hiring.sub",
  },
  {
    icon: Globe,
    key: "ir",
    href: "/contact",
    subKey: "home.team.placeholder.ir.sub",
  },
] as const;

/** Resolved for one locale — the shape {@link PlaceholderCard} takes. */
export function placeholderCards(locale: Locale) {
  const t = translator(messagesFor(locale), locale);
  return CARDS.map(card => ({
    icon: card.icon,
    iconClassName: "text-main-accent-t1",
    title: t(`team.join.${card.key}.title`),
    body: t(`team.join.${card.key}.body`),
    cta: t(`team.join.${card.key}.cta`),
    href: localePath(locale, card.href),
    heading: t(`team.join.${card.key}.eyebrow`),
    sub: t(card.subKey),
  }));
}

/**
 * Both CTA cards as a fragment, so they sit as direct children of the parent
 * Team grid (or as one carousel slide on mobile).
 */
export function TeamPlaceholders({ locale }: { locale: Locale }) {
  return (
    <>
      {placeholderCards(locale).map(card => (
        <PlaceholderCard key={card.href} {...card} />
      ))}
    </>
  );
}
