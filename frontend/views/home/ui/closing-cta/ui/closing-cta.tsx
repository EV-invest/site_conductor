import { CalendarCheck, Layers, ShieldCheck } from "lucide-react";
import { Container } from "@evinvest/uikit";
import type { Locale, Translate } from "@evinvest/i18n";

import { Accented } from "@/shared/ui/accented";
import { Text, Tier } from "@/shared/ui/text";
import { Reveal, Stagger, StaggerItem } from "@/shared/ui/motion";
import { translate } from "@/shared/config/i18n";
import { ClosingCtaActions } from "./closing-cta-actions";

// Qualitative on purpose: the only owner-approved wording about timing is the
// cabinet's "most checks are decided within the hour". Minimum ticket and
// reporting cadence are unsourced and stay out until they land in one shared
// constant.
// TODO(#204): sourced figures
const facts = (t: Translate) => [
  {
    icon: ShieldCheck,
    text: t(
      "home.closing.fact.kyc",
      "Sign in with Google; most identity checks are decided within the hour"
    ),
  },
  {
    icon: Layers,
    text: t(
      "home.closing.fact.units",
      "Subscribe to allocation units at the current NAV"
    ),
  },
  {
    icon: CalendarCheck,
    text: t(
      "home.closing.fact.cabinet",
      "NAV, reports and payouts in your cabinet"
    ),
  },
];

// The page-level closer after Team (issue #201): the self-serve funnel's last
// ask before the footer. Server Component; the CTA pair is the client island.
export function ClosingCta({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <section
      id="closing-cta"
      className="py-24 relative border-t border-ink/10 bg-background"
    >
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-7 max-w-2xl">
          <span className="text-xs font-mono-tech text-primary-ink tracking-[0.3em] uppercase block mb-3">
            {t("home.closing.eyebrow", "Get Started")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif-display text-ink font-light leading-tight">
            <Accented
              text={t("home.closing.title", "Ready to *start investing*?")}
              className="italic text-primary-ink font-serif"
            />
          </h2>
          <Tier tier="main">
            <Text className="mt-4">
              {t(
                "home.closing.intro",
                "Open an account online, verify your identity and subscribe to allocation units — all from the investor cabinet."
              )}
            </Text>
          </Tier>
          <ClosingCtaActions />
        </Reveal>

        {/* The motion primitives render divs, so the list semantics ride on roles. */}
        <Stagger role="list" className="lg:col-span-5 space-y-6">
          {facts(t).map(({ icon: Icon, text }) => (
            <StaggerItem
              key={text}
              role="listitem"
              className="flex items-start gap-4"
            >
              <span className="w-10 h-10 shrink-0 rounded-full bg-primary-ink/15 border border-primary-ink/30 flex items-center justify-center text-primary-ink">
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              <Tier tier="main">
                <Text className="pt-2">{text}</Text>
              </Tier>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
