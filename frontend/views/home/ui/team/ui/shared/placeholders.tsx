import { Users, Globe } from "lucide-react";
import { PlaceholderCard } from "./cards";

/**
 * The "join us" / "LP network" CTA cards, as data. Exported separately from the
 * fragment below so the desktop grid can wrap each card in its own stagger item
 * — a fragment would put both cards in one grid cell.
 */
export const PLACEHOLDER_CARDS = [
  {
    icon: Users,
    iconClassName: "text-main-accent-t1",
    title: "Join Us",
    body: "We are always looking for talented analysts and asset managers in Quy Nhon and Da Nang.",
    cta: "Hiring",
    href: "/hiring",
    heading: "Open Position",
    sub: "Investment Analyst",
  },
  {
    icon: Globe,
    iconClassName: "text-main-accent-t1",
    title: "LP Partner Network",
    body: "Talk to us about co-investing in Vietnam's coastal real estate.",
    cta: "IR Contacts",
    href: "/contact",
    heading: "Investor Relations",
    sub: "Investor Relations (IR)",
  },
] as const;

/**
 * Both CTA cards as a fragment, so they sit as direct children of the parent
 * Team grid (or as one carousel slide on mobile).
 */
export function TeamPlaceholders() {
  return (
    <>
      {PLACEHOLDER_CARDS.map(card => (
        <PlaceholderCard key={card.title} {...card} />
      ))}
    </>
  );
}
