import Link from "next/link";
import { Users, Globe } from "lucide-react";
import { SectionHead } from "./section-head";

// Plain styled <Link> CTAs (not two sibling <Button asChild> — that desyncs
// hydration under React 19; see frontend/PATTERNS.md §7).
const CARDS = [
  {
    icon: Users,
    eyebrow: "Open position",
    title: "Join Us",
    body: "We are always looking for talented analysts and asset managers in Quy Nhon.",
    cta: "Careers",
    href: "/hiring",
  },
  {
    icon: Globe,
    eyebrow: "Investor relations",
    title: "LP Partner Network",
    body: "Over 40 institutional investors across 12 countries trust us with their capital.",
    cta: "IR Contacts",
    href: "/contact",
  },
];

export function TeamJoin() {
  return (
    <section className="border-t border-main-mist/10 pb-24 pt-20">
      <div className="container space-y-12">
        <SectionHead eyebrow="Get involved">Build the fund with us</SectionHead>
        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map(({ icon: Icon, eyebrow, title, body, cta, href }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-4 rounded-xl border border-main-mist/10 bg-main-card px-8 py-14 text-center"
            >
              <div className="flex size-13 items-center justify-center rounded-full bg-main-mist/5 text-main-accent-t1">
                <Icon className="size-5" />
              </div>
              <span className="font-mono-tech text-[10px] uppercase tracking-widest text-main-mist/60">
                {eyebrow}
              </span>
              <h3 className="font-serif-display text-lg font-bold text-white">
                {title}
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-main-mist/75">
                {body}
              </p>
              <Link
                href={href}
                className="mt-1 rounded-md border border-main-accent-t1/60 px-5 py-2 font-mono-tech text-[11px] uppercase tracking-widest text-main-accent-t1 transition-colors hover:bg-main-accent-t1/10"
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
