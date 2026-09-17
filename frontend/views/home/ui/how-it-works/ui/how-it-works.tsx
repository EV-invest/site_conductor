import { Container, Eyebrow } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { Reveal, SplitText, Stagger, StaggerItem } from "@/shared/ui/motion";
import { accented } from "@/shared/ui/accented";
import { translate } from "@/shared/config/i18n";

import { steps } from "../model/steps";
import { HowItWorksCta } from "./how-it-works-cta";
import { StepCard } from "./step-card";

/**
 * The step map, directly under the hero: what actually happens after a visitor
 * decides to invest. Onboarding drop-off is mostly "too long / too much data /
 * changed my mind" (issue #199), and every one of those is a surprise a map up
 * front removes — so it sits before the click, not on the noindex login page.
 *
 * Server Component: the copy and the step list never change per client. The
 * only island is the CTA pair, which needs a click handler for the funnel event.
 */
export function HowItWorks({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <section
      id="how-it-works"
      className="border-b border-ink/10 bg-background py-24 text-ink"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow className="uppercase">
            {t("home.howItWorks.eyebrow", "How it works")}
          </Eyebrow>
          <h2 className="mt-3 font-serif-display text-3xl leading-tight font-light text-white sm:text-5xl">
            <SplitText inView>
              {accented({
                text: t(
                  "home.howItWorks.title",
                  "From sign-in to *your first report*"
                ),
              })}
            </SplitText>
          </h2>
          <p className="mt-4 leading-relaxed font-light text-ink-mid">
            {t(
              "home.howItWorks.intro",
              "Investing with us is a short, fixed sequence: verify who you are, subscribe to units, then follow your position from the cabinet. This is exactly what happens after you click."
            )}
          </p>
        </Reveal>

        <Stagger className="mt-14">
          <ol className="grid gap-6 md:grid-cols-3">
            {steps(t).map(step => (
              <li key={step.ordinal}>
                <StaggerItem className="h-full">
                  <StepCard step={step} />
                </StaggerItem>
              </li>
            ))}
          </ol>
        </Stagger>

        <Reveal delay={0.05} className="mt-14">
          <HowItWorksCta />
        </Reveal>
      </Container>
    </section>
  );
}
