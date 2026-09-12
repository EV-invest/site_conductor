import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { Text } from "@/shared/ui/text";
import { Stagger, StaggerItem } from "@/shared/ui/motion";
import { cn } from "@/shared/lib/utils";
import { translate, type T } from "@/shared/config/i18n";

/** One key metric. The value's accent colour is the only thing that varies. */
function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <StaggerItem distance={12}>
      <Text
        variant="secondary"
        className="text-xs font-mono-tech uppercase tracking-widest mb-1"
      >
        {label}
      </Text>
      <p
        className={cn(
          "text-2xl sm:text-3xl font-serif-display font-bold",
          tone
        )}
      >
        {value}
      </p>
    </StaggerItem>
  );
}

// AUM under advisory is deliberately absent: it should be derived from total
// bank assets rather than typed in, and a stale hardcoded figure on the hero is
// worse than no figure. Restore it here once the number is live.
// Labels translate; the figures do not. "Rentals" is a word and translates;
// "Quy Nhon" is a place and does not.
const stats = (t: T) => [
  {
    label: t("home.hero.stat.targetIrr", "Target IRR"),
    value: "16.4% +",
    tone: "text-accent-warn",
  },
  {
    label: t("home.hero.stat.specialization", "Specialization"),
    value: t("home.hero.stat.specializationValue", "Rentals"),
    tone: "text-white",
  },
  {
    label: t("home.hero.stat.currentCity", "Highest EV City"),
    value: "Quy Nhon",
    tone: "text-accent-debug",
  },
  {
    label: t("home.hero.stat.aumCap", "Closing at"),
    value: "$100M",
    tone: "text-accent-info",
  },
];

/**
 * The key-metrics ribbon pinned to the bottom of Hero A. Server Component apart
 * from the stagger wrapper: the metrics land one after another, last in the
 * hero's opening sequence (see `./index.tsx` for the beat timings).
 */
export function HeroAStats({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <div className="absolute bottom-0 left-0 w-full bg-background/80 border-t border-ink/10 py-6 backdrop-blur-sm z-20">
      <Stagger onMount delay={0.7}>
        <Container className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats(t).map(stat => (
            <Stat
              key={stat.label}
              label={stat.label}
              value={stat.value}
              tone={stat.tone}
            />
          ))}
        </Container>
      </Stagger>
    </div>
  );
}
