import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";

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

function HeadlineB() {
  return (
    <h1 className={H1}>
      Invest in{" "}
      <span className="italic text-main-accent-t1 font-serif">Vietnam</span>
      <br />
      Through Institutional Vision.
    </h1>
  );
}

function HeadlineA() {
  return (
    <h1 className={H1}>
      Invest in{" "}
      <span className="italic text-main-accent-t1 font-serif">China+1</span>
      <br />
      Through{" "}
      <span className="italic text-main-accent-t2 font-serif">Vietnam</span>
    </h1>
  );
}
