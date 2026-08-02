import { PUBLICATIONS } from "./catalogue";
import type { Cover, Publication, PublicationKind } from "./types";

// `undefined` (not a fallback entry) so an uncatalogued slug is a hard miss the
// caller must turn into a 404 — never a silently rendered soft-404 (#105).
export function findPublication(slug: string): Publication | undefined {
  return PUBLICATIONS.find(p => p.slug === slug);
}

// The whole catalogue, newest first. For consumers that genuinely need every
// entry — the index page and the sitemap — rather than an answer to a question.
export function allPublications(): readonly Publication[] {
  return PUBLICATIONS;
}

export function publicationsByKind(kind: PublicationKind): Publication[] {
  return PUBLICATIONS.filter(p => p.kind === kind);
}

export function latestPublications(n: number): Publication[] {
  return PUBLICATIONS.slice(0, n);
}

export function fieldNotes(n?: number): Publication[] {
  const notes = publicationsByKind("field-note");
  return n === undefined ? notes : notes.slice(0, n);
}

/// A type predicate rather than a plain boolean so a caller that guards on it
/// gets `p.cover` narrowed to `Cover` in the branch that renders it.
export function hasCover(p: Publication): p is Publication & { cover: Cover } {
  return p.cover !== undefined;
}

// Pinned to en-GB and UTC rather than the host locale/zone: this formats on the
// server and again on the client, and any divergence is a hydration mismatch.
const LONG = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPublicationDate(
  iso: string,
  style: "long" | "short"
): string {
  const at = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(at.getTime())) return iso;
  return style === "long"
    ? LONG.format(at)
    : SHORT.format(at).replace(/\./g, "").toUpperCase();
}
