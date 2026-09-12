import { localePath, type Locale } from "@evinvest/i18n";

import { joinCards } from "@/entities/team";
import { translate } from "@/shared/config/i18n";
import { PlaceholderCard } from "./cards";

/**
 * The "join us" / "LP network" CTA cards, as data. Exported separately from the
 * fragment below so the desktop grid can wrap each card in its own stagger item
 * — a fragment would put both cards in one grid cell.
 */
export function placeholderCards(locale: Locale) {
  const t = translate(locale);
  // The one field the /team section has no counterpart for: the role a reader
  // would actually be applying into.
  const sub = {
    hiring: t("home.team.placeholder.hiring.sub", "Investment Analyst"),
    ir: t("home.team.placeholder.ir.sub", "Investor Relations (IR)"),
  };
  return joinCards(t, href => localePath(locale, href)).map(card => ({
    icon: card.icon,
    iconClassName: "text-accent-debug",
    title: card.title,
    body: card.body,
    cta: card.cta,
    href: card.href,
    heading: card.eyebrow,
    sub: sub[card.id],
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
