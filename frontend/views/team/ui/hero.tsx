import { Container } from "@evinvest/uikit";

export function TeamHero() {
  return (
    <section className="pb-14 pt-36 sm:pt-40">
      <Container className="space-y-5">
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
          A partnership of investment, risk and technology specialists building
          institutional-grade access to Vietnam&apos;s premium coastal real
          estate — on the ground in Quy Nhon and Da Nang.
        </p>
      </Container>
    </section>
  );
}
