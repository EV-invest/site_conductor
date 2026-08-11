import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";
import { SplitText } from "@/shared/ui/motion";

const H1 =
  "text-4xl sm:text-6xl md:text-8xl font-serif-display font-light text-white leading-tight mb-6";

/** Server Component — owns the headline-copy A/B decision, nested inside Hero A. */
export async function HeroHeadline() {
  const variant = await getVariant("hero_headline");
  return (
    <ExperimentTracker experiment="hero_headline" variant={variant}>
      {match(variant, { a: <HeadlineA />, b: <HeadlineB /> })}
    </ExperimentTracker>
  );
}

// Both variants assemble word-by-word on mount ({@link SplitText}). The hero is
// above the fold, so this is the page's opening beat — everything below it is a
// scroll reveal, and the delays in `HeroACanvas` are timed off this finishing.
function HeadlineB() {
  return (
    <h1 className={H1}>
      <SplitText>
        Invest in{" "}
        <span className="italic text-main-accent-t1 font-serif">Vietnam</span>
        <br />
        Through Institutional Vision.
      </SplitText>
    </h1>
  );
}

function HeadlineA() {
  return (
    <h1 className={H1}>
      <SplitText>
        Invest in{" "}
        <span className="italic text-main-accent-t1 font-serif">China+1</span>
        <br />
        Through{" "}
        <span className="italic text-main-accent-t2 font-serif">Vietnam</span>
      </SplitText>
    </h1>
  );
}
