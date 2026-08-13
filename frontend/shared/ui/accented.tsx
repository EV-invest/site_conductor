import { Fragment, type ReactNode } from "react";

/**
 * Renders a translated string whose accent word is marked with `*asterisks*`.
 *
 * The display headings on this site set one word apart in italic serif — "Let's
 * *talk*.", "Built for the *long* horizon". Splitting that into two catalogue
 * keys (lead + accent) would hard-code English word order: Russian puts the verb
 * elsewhere, German pushes it to the end, and a translator handed
 * `{lead} <em>{accent}</em>` cannot move it. One key with an inline marker lets
 * the sentence be rearranged freely and keeps the typography.
 *
 * Deliberately not Markdown, and deliberately not `dangerouslySetInnerHTML`: the
 * only thing that needs expressing is "this word is the accent", and a
 * one-character convention keeps translator-authored strings inert.
 *
 * @example
 * ```tsx
 * <Accented text={t("contact.title")} />   // "Let's *talk*." → Let's <em>talk</em>.
 * ```
 */
export function Accented({
  text,
  className = "font-serif italic text-main-accent-t1",
}: {
  text: string;
  className?: string;
}): ReactNode {
  // Odd indices are the marked segments: "a *b* c" → ["a ", "b", " c"].
  return text.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={className}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}
