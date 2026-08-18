import { translator, type Locale } from "@evinvest/i18n";

import { getVariant } from "@/features/ab-variant/get-variant";
import { ExperimentTracker, match } from "@/features/ab-variant";
import { SplitText } from "@/shared/ui/motion";
import { messagesFor } from "@/shared/config/i18n";
import { accented } from "@/shared/ui/accented";

const H1 =
  "text-4xl sm:text-6xl md:text-8xl font-serif-display font-light text-white leading-tight mb-6";

/** Server Component — owns the headline-copy A/B decision, nested inside Hero A. */
export async function HeroHeadline({ locale }: { locale: Locale }) {
  const variant = await getVariant("hero_headline");
  return (
    <ExperimentTracker experiment="hero_headline" variant={variant}>
      {match(variant, {
        a: <HeadlineA locale={locale} />,
        b: <HeadlineB locale={locale} />,
      })}
    </ExperimentTracker>
  );
}

// Both variants assemble word-by-word on mount ({@link SplitText}). The hero is
// above the fold, so this is the page's opening beat — everything below it is a
// scroll reveal, and the delays in `HeroACanvas` are timed off this finishing.
// Both headlines carry their accents and their line break inline, so a
// translation can move either — German and Russian both reorder the phrase, and
// where the line should break depends on how long the words come out.
const TONES = [
  "italic text-main-accent-t1 font-serif",
  "italic text-main-accent-t2 font-serif",
];

function HeadlineB({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <h1 className={H1}>
      <SplitText>
        {accented({ text: t("home.hero.headline.b"), classNames: TONES })}
      </SplitText>
    </h1>
  );
}

function HeadlineA({ locale }: { locale: Locale }) {
  const t = translator(messagesFor(locale), locale);
  return (
    <h1 className={H1}>
      <SplitText>
        {accented({ text: t("home.hero.headline.a"), classNames: TONES })}
      </SplitText>
    </h1>
  );
}
