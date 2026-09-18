import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";
import { ExternalLink } from "lucide-react";

import { Reveal } from "@/shared/ui/motion";
import { translate } from "@/shared/config/i18n";
import { Accented } from "@/shared/ui/accented";

import { partners } from "../model/partners";
import { PartnerRow } from "./partner-row";

// How many times the track repeats the list. The animation slides exactly one
// copy per lap, which only reads as continuous while the REMAINING copies still
// cover the viewport — one row of this list measures ~1200px at the current
// mark size, so two copies would run dry and show a gap before snapping back
// on any window wider than that, which is most desktops. Five carries the
// remaining four past ~4800px, beyond a 4K display.
//
// Keep in sync with the `-100% / 5` in `partners-marquee`
// (application/styles/globals.css): that fraction is 1 / COPIES.
const COPIES = 5;

const GITHUB_ORG = "https://github.com/EV-invest";

// A trust bar between the portfolio and the research desk: the portfolio claims
// the returns, this says who holds, verifies and moves the money behind them,
// and research then shows the working. Named vendors are cheap for us and
// expensive to fake, which is the whole point of putting them on the page.
//
// Deliberately a Server Component with zero interactivity: the loop is CSS
// (see `partners-marquee` in application/styles/globals.css), so the section
// ships no JS of its own. Only the two Reveal wrappers are client islands, the
// same as every sibling section.
export function Partners({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <section
      id="partners"
      className="border-b border-ink/10 bg-background py-20 text-ink"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <span className="block font-mono-tech text-xs tracking-widest text-primary-ink uppercase">
            {t("home.partners.eyebrow", "What your money runs on")}
          </span>
          <h2 className="mt-3 font-serif-display text-3xl leading-tight font-light text-ink sm:text-4xl">
            <Accented
              text={t("home.partners.title", "The stack behind *the numbers*")}
            />
          </h2>
          <p className="mt-4 leading-relaxed font-light text-ink-mid">
            {t(
              "home.partners.intro",
              "Custody by Turnkey, identity verification by Didit, Google sign-in, every balance on a TigerBeetle ledger, errors and product analytics through Sentry and PostHog. Our client-facing products — the investor cabinet and this site — are developed in the open on GitHub."
            )}
          </p>
          {/* A plain <a>, not Button: this is a reference in running copy, not a
              call to action, and the permanent underline is what tells it apart
              from the CTAs above and below. */}
          <a
            href={GITHUB_ORG}
            target="_blank"
            rel="noopener"
            className="mt-4 inline-flex items-center gap-1.5 rounded-sm font-mono-tech text-xs tracking-widest text-primary-ink uppercase underline underline-offset-4 transition-colors duration-300 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("home.partners.github", "See the code on GitHub")}
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
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
              <PartnerRow key={i} items={partners} clone={i > 0} />
            ))}
          </div>
        </div>
        {/* Same gradient the uikit's CarouselEdgeFade paints, minus its
            scroll-state opacity: `background` and `background` are the same
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
