import { Container } from "@evinvest/uikit";

import { Text } from "@/shared/ui/text";
import { Stagger, StaggerItem } from "@/shared/ui/motion";
import { cn } from "@/shared/lib/utils";

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
const STATS = [
  { label: "Target IRR", value: "16.4% +", tone: "text-main-accent-t3" },
  { label: "Specialization", value: "Rentals", tone: "text-white" },
  {
    label: "Current Target City",
    value: "Quy Nhon",
    tone: "text-main-accent-t1",
  },
  { label: "AUM hard cap", value: "$100M", tone: "text-main-accent-t4" },
] as const;

/**
 * The key-metrics ribbon pinned to the bottom of Hero A. Server Component apart
 * from the stagger wrapper: the metrics land one after another, last in the
 * hero's opening sequence (see `./index.tsx` for the beat timings).
 */
export function HeroAStats() {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-main-black/80 border-t border-main-mist/10 py-6 backdrop-blur-sm z-20">
      <Stagger onMount delay={0.7}>
        <Container className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(stat => (
            <Stat key={stat.label} {...stat} />
          ))}
        </Container>
      </Stagger>
    </div>
  );
}
