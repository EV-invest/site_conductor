import { LineChart, ShieldCheck, Anchor } from "lucide-react";
import { SectionHead } from "./section-head";

const PRINCIPLES = [
  {
    icon: LineChart,
    title: "Macro-first research",
    body: "Every position starts from a top-down read of Vietnam's growth, urbanisation and coastal-tourism cycles — not from a single deal.",
  },
  {
    icon: ShieldCheck,
    title: "Risk before return",
    body: "Algorithmic risk modelling and conservative leverage are set before capital is committed, so downside is sized before upside is sold.",
  },
  {
    icon: Anchor,
    title: "Local roots, institutional standards",
    body: "On-the-ground presence in Quy Nhon paired with the reporting, governance and transparency international LPs expect.",
  },
];

export function TeamPhilosophy() {
  return (
    <section className="border-t border-main-mist/10 bg-main-surface py-20">
      <div className="container space-y-12">
        <SectionHead eyebrow="How we operate">
          A discipline, not a pitch
        </SectionHead>
        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="space-y-4 rounded-xl border border-main-mist/10 bg-main-card p-8"
            >
              <div className="flex size-13 items-center justify-center rounded-full bg-main-mist/5 text-main-accent-t1">
                <Icon className="size-5" />
              </div>
              <h3 className="font-serif-display text-lg font-bold text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-main-mist/75">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
