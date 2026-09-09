import { Container } from "@evinvest/uikit";
import { translator, type Locale } from "@evinvest/i18n";

import { Reveal } from "@/shared/ui/motion";
import { messagesFor } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

import { PartnerRow } from "./partner-row";

// How many times the track repeats the list. The animation slides exactly one
// copy per lap, which only reads as continuous while the REMAINING copies still
// cover the viewport — one row of this list is roughly 1700px, so two copies
// would run dry and show a gap before snapping back on any window wider than
// that, which is most desktops. Four carries it past ~5000px.
//
// Keep in sync with the -25% in `partners-marquee` (application/styles/globals.css):
// that percentage is 100 / COPIES.
const COPIES = 4;

// A trust bar between the portfolio and the research desk: the portfolio claims
// the returns, this says what produces and safeguards them, and research then
// shows the working. Named vendors are cheap for us and expensive to fake, which
// is the whole point of putting them on the page.
//
// Deliberately a Server Component with zero interactivity: the loop is CSS
// (see `partners-marquee` in application/styles/globals.css), so the section
// ships no JS of its own. Only the two Reveal wrappers are client islands, the
// same as every sibling section.
export function Partners({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <section
      id="partners"
      className="border-b border-main-mist/10 bg-main-black py-20 text-main-mist"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <span className="block font-mono-tech text-xs tracking-[0.3em] text-main-accent-t1 uppercase">
            {t("home.partners.eyebrow")}
          </span>
          <h2 className="mt-3 font-serif-display text-3xl leading-tight font-light text-white sm:text-4xl">
            <Accented text={t("home.partners.title")} />
          </h2>
          <p className="mt-4 leading-relaxed font-light text-main-mist/70">
            {t("home.partners.intro")}
          </p>
        </Reveal>
      </Container>

      {/* Outside <Container> on purpose: the row runs the full page width and
          dissolves at both edges, so a gutter would cut the illusion short.
          `from="none"` keeps this a pure fade — an animated transform here would
          nest a moving box inside a moving track. */}
      <Reveal from="none" delay={0.05} className="relative mt-12">
        <div className="partners-marquee overflow-hidden">
          <div className="partners-marquee-track flex w-max">
            {Array.from({ length: COPIES }, (_, i) => (
              <PartnerRow key={i} clone={i > 0} />
            ))}
          </div>
        </div>
        {/* Same gradient the uikit's CarouselEdgeFade paints, minus its
            scroll-state opacity: `background` and `main-black` are the same
            token value, and this section sits on it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background via-background/60 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background via-background/60 to-transparent"
        />
      </Reveal>
    </section>
  );
}
