// The shape every legal document renders through. Section titles come from
// the catalogue (they are short and translate cheaply); the binding prose is
// English-only until counsel has signed the English off — translating a draft
// is work that gets thrown away with the draft.
export interface LegalSection {
  title: string;
  paragraphs: readonly string[];
  /** Rendered as a list after the paragraphs. */
  bullets?: readonly string[];
}

export interface LegalDocument {
  title: string;
  /** The one-line summary under the title. */
  lede: string;
  sections: readonly LegalSection[];
}
