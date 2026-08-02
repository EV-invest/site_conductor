export type PublicationKind = "field-note" | "research" | "whitepaper";

export type Cover =
  | {
      type: "video";
      src: string;
      poster: string;
      duration?: string;
      caption?: string;
      alt: string;
    }
  | {
      type: "youtube";
      videoId: string;
      poster?: string;
      duration?: string;
      caption?: string;
      alt: string;
    }
  | { type: "image"; src: string; caption?: string; alt: string };

export type Publication = {
  slug: string;
  title: string;
  /// ISO 8601 calendar date, e.g. "2026-07-28". Sorting and formatting both
  /// depend on this shape — see `formatPublicationDate`.
  date: string;
  kind: PublicationKind;
  author?: string;
  role?: string;
  dek: string;
  quote?: string;
  /// Editorial rubric shown above the title ("Macroeconomics", "Risk", …).
  /// Mirrors the `#header(eyebrow: …)` the article sets for itself.
  category?: string;
  /// Absent means a *text* entry — a first-class state of a publication, not a
  /// missing asset. Callers render the text layout, never a placeholder image.
  cover?: Cover;
  /// Documents only.
  pages?: number;
  readingMinutes?: number;
  /// Photo essays only.
  frames?: number;
  /// Plain-text body, extracted from the compiled HTML by the blog build. Only
  /// the search index reads it — never render it. Absent in the committed seed,
  /// so search degrades to title-and-dek matching until a real build has run.
  text?: string;
};

/// YouTube serves a poster per video id, so a `youtube` cover need not ship a
/// local one; a hand-authored `poster` still wins where the auto frame is poor.
export function youtubePosterUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

export function coverPoster(cover: Cover): string | undefined {
  switch (cover.type) {
    case "video":
      return cover.poster;
    case "youtube":
      return cover.poster ?? youtubePosterUrl(cover.videoId);
    case "image":
      return cover.src;
  }
}
