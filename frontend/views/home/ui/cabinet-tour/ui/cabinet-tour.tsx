import { Container, Eyebrow } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { accented } from "@/shared/ui/accented";
import { Reveal, SplitText, Stagger, StaggerItem } from "@/shared/ui/motion";
import { translate } from "@/shared/config/i18n";

import { steps } from "../model/steps";
import { CabinetShots } from "./cabinet-shots";
import { CabinetTourCta } from "./cabinet-tour-cta";

/**
 * "Inside the investor cabinet" (issue #200): the product behind the "Investor
 * Portal" door, shown rather than described. Retail platforms put their UI on
 * the landing; private funds do not, and the closed door is half of why their
 * portals feel members-only. It sits between Research (the working) and Team
 * (the people) — the tool between the two.
 *
 * It is also the page's only "what happens next": the step map and the closer
 * that used to bracket the page were folded in here as three plain lines and
 * one quiet link (owner feedback, 2026-09-18) — the reader is meant to reach
 * the conclusion on their own, so nothing here asks.
 *
 * Server Component: copy and captures never change per client. The only island
 * is the CTA, which needs a click handler for the funnel event.
 */
export function CabinetTour({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <section id="cabinet-tour" className="bg-background py-24 text-ink">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow className="uppercase">
              {t("home.cabinetTour.eyebrow", "Inside the investor cabinet")}
            </Eyebrow>
            <h2 className="mt-3 font-serif-display text-3xl leading-tight font-light text-ink sm:text-5xl">
              <SplitText inView>
                {accented({
                  text: t(
                    "home.cabinetTour.title",
                    "Your investment, *in full view*"
                  ),
                })}
              </SplitText>
            </h2>
            <p className="mt-4 leading-relaxed font-light text-ink-mid">
              {t(
                "home.cabinetTour.intro",
                "The cabinet is where the fund reports to you: what you hold, how it has been valued, where you stand on verification and what is in your wallet. These are its actual screens."
              )}
            </p>
          </Reveal>

          {/* An <ol>: the order is the point, and assistive tech numbers it, so
              the visible ordinals are decoration. */}
          <Stagger className="mt-10">
            <ol className="space-y-3 border-t border-border pt-6">
              {steps(t).map((step, i) => (
                <li key={step}>
                  <StaggerItem className="flex items-baseline gap-4">
                    <span
                      aria-hidden
                      className="font-mono-tech text-xs tracking-widest text-ink-soft"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm leading-relaxed font-light text-ink-mid">
                      {step}
                    </span>
                  </StaggerItem>
                </li>
              ))}
            </ol>
          </Stagger>

          <Reveal delay={0.05} className="mt-8">
            <CabinetTourCta />
          </Reveal>
        </div>

        <Reveal delay={0.05} className="lg:col-span-7">
          <CabinetShots t={t} />
        </Reveal>
      </Container>
    </section>
  );
}
