import { Fragment, type ReactNode } from "react";

/**
 * Renders a translated string whose accent words are marked with `*asterisks*`,
 * and whose line breaks are written as `\n`.
 *
 * The display headings on this site set one word apart in italic serif — "Let's
 * *talk*.", "Built for the *long* horizon". Splitting that into two catalogue
 * keys (lead + accent) would hard-code English word order: Russian puts the verb
 * elsewhere, German pushes it to the end, and a translator handed
 * `{lead} <em>{accent}</em>` cannot move it. One key with an inline marker lets
 * the sentence be rearranged freely and keeps the typography.
 *
 * The same argument applies to the line break. The hero reads "Invest in
 * *China+1*\nThrough *Vietnam*" — where that break falls depends on how long
 * the words are in the target language, so it belongs in the string a
 * translator can edit, not in JSX they cannot reach.
 *
 * Deliberately not Markdown, and deliberately not `dangerouslySetInnerHTML`: the
 * only things that need expressing are "this word is the accent" and "break
 * here", and a two-character convention keeps translator-authored strings inert.
 *
 * @example
 * ```tsx
 * <Accented text={t("contact.title")} />   // "Let's *talk*." → Let's <em>talk</em>.
 *
 * // Two accents in different tones — the hero's China+1 / Vietnam pair.
 * <Accented
 *   text={t("home.hero.headline")}
 *   classNames={["... text-main-accent-t1", "... text-main-accent-t2"]}
 * />
 * ```
 */
export function Accented({
  text,
  className = "font-serif italic text-main-accent-t1",
  classNames,
}: {
  text: string;
  className?: string;
  /**
   * One class per accent, in order, for headings that tint their accents
   * differently. Cycles if the string carries more accents than entries — a
   * translation with an extra accent renders in a real tone rather than
   * unstyled.
   */
  classNames?: readonly string[];
}): ReactNode {
  const tones = classNames?.length ? classNames : [className];

  // Odd indices are the marked segments: "a *b* c" → ["a ", "b", " c"].
  return text.split("*").map((part, i) => {
    const content = withBreaks(part, i);
    if (i % 2 === 0) return <Fragment key={i}>{content}</Fragment>;
    // i is 1, 3, 5… for the 1st, 2nd, 3rd accent.
    const tone = tones[((i - 1) / 2) % tones.length];
    return (
      <span key={i} className={tone}>
        {content}
      </span>
    );
  });
}

/** Turn `\n` into real breaks. Never a trailing `<br/>`, which would add space. */
function withBreaks(part: string, outer: number): ReactNode {
  if (!part.includes("\n")) return part;
  const lines = part.split("\n");
  return lines.map((line, i) => (
    <Fragment key={`${outer}-${i}`}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}
