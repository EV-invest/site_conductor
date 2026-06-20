// Top stats mirror the Figma hero ribbon. Static marketing figures.
const STATS = [
  { label: "Years Experience", value: "30+" },
  { label: "AUM Advisory", value: "$145M" },
  { label: "Core Markets", value: "VN · SG" },
  { label: "Institutional LPs", value: "40+" },
];

export function TeamHero() {
  return (
    <section className="pb-14 pt-36 sm:pt-40">
      <div className="container space-y-5">
        <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-main-accent-t1">
          Our people
        </span>
        <h1 className="max-w-3xl font-serif-display text-4xl font-light leading-[1.12] text-white sm:text-6xl">
          The team behind{" "}
          <span className="font-serif italic text-main-accent-t1">
            EV Investment
          </span>
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-main-mist/80 sm:text-lg">
          A cross-border partnership of investment, risk and development
          specialists building institutional-grade access to Vietnam&apos;s
          premium coastal real estate.
        </p>
        <dl className="grid grid-cols-2 gap-8 pt-6 sm:grid-cols-4">
          {STATS.map(stat => (
            <div key={stat.label} className="space-y-1.5">
              <dt className="font-mono-tech text-[10px] uppercase tracking-widest text-main-mist/60">
                {stat.label}
              </dt>
              <dd className="font-serif-display text-3xl text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
