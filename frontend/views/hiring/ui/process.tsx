import { Container } from "@evinvest/uikit";

import { ApplicationForm } from "@/features/job-application";

const STEPS = [
  {
    n: "01",
    title: "Intro call",
    body: "A 30-minute conversation about you and us — no scripts.",
  },
  {
    n: "02",
    title: "Deep dive",
    body: "A real problem from our actual pipeline — no whiteboard puzzles.",
  },
  {
    n: "03",
    title: "Meet the team",
    body: "Time with the people you'd work beside, in Quy Nhơn or remote.",
  },
  {
    n: "04",
    title: "Offer",
    body: "Fast, clear, and senior — usually within two weeks.",
  },
];

/** Merged "process + apply" panel: the gold-number hiring timeline beside the
 *  general (vacancy-agnostic) application form. */
export function HiringProcess() {
  return (
    <section id="apply" className="scroll-mt-24 bg-main-black pb-24 pt-4">
      <Container>
        <div className="rounded-3xl border border-white/[0.06] bg-main-card/20 p-8 sm:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
                How we hire
              </p>
              <h2 className="font-serif-display text-3xl text-white sm:text-4xl">
                A short,{" "}
                <span className="font-serif italic text-main-accent-t1">
                  honest
                </span>{" "}
                process.
              </h2>
              <ol className="relative mt-9 space-y-6 before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-main-accent-t3/20">
                {STEPS.map(step => (
                  <li key={step.n} className="relative flex gap-4">
                    <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-main-accent-t3/40 bg-main-black font-mono-tech text-xs text-main-accent-t3">
                      {step.n}
                    </span>
                    <div className="pt-1">
                      <h3 className="font-medium text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-main-mist/55">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <ApplicationForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
