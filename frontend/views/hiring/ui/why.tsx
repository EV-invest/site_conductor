import { Container } from "@evinvest/uikit";

const REASONS = [
  {
    n: "01",
    title: "Coastal mandate",
    body: "A focused thesis: premium coastal real estate in one of Asia's fastest-growing markets.",
  },
  {
    n: "02",
    title: "Institutional rigor",
    body: "Bridgewater-grade research and underwriting on assets you can stand in front of.",
  },
  {
    n: "03",
    title: "Ground-floor scale",
    body: "Join early. Your work compounds into the fund's track record — and your own.",
  },
  {
    n: "04",
    title: "Aligned upside",
    body: "Senior contributors share in the carry they help create.",
  },
];

export function HiringWhy() {
  return (
    <section className="bg-main-black py-20">
      <Container>
        <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
          Why EV
        </p>
        <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
          Why join{" "}
          <span className="font-serif italic text-main-accent-t1">now</span>.
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(reason => (
            <div key={reason.n} className="border-t border-white/10 pt-5">
              <p className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-main-accent-t1">
                {reason.n}
              </p>
              <h3 className="mt-3 font-medium text-white">{reason.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-main-mist/55">
                {reason.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
