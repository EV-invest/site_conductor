import { Container, Eyebrow } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { accented } from "@/shared/ui/accented";
import { Reveal, SplitText, Stagger, StaggerItem } from "@/shared/ui/motion";
import { translate } from "@/shared/config/i18n";

import { benefits } from "../model/benefits";
import { CabinetShots } from "./cabinet-shots";
import { CabinetTourCta } from "./cabinet-tour-cta";

/**
 * "Inside the investor cabinet" (issue #200): the product behind the "Investor
 * Portal" door, shown rather than described. Retail platforms put their UI on
 * the landing; private funds do not, and the closed door is half of why their
 * portals feel members-only. It sits between Research (the working) and Team
 * (the people) — the tool between the two.
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

          {/* The motion primitives render divs, so the list semantics ride on roles. */}
          <Stagger role="list" className="mt-10 space-y-6">
            {benefits(t).map(({ icon: Icon, title, body }) => (
              <StaggerItem
                key={title}
                role="listitem"
                className="flex items-start gap-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-ink/30 bg-primary-ink/15 text-primary-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg leading-snug font-light text-ink">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed font-light text-ink-mid">
                    {body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.05} className="mt-10">
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
