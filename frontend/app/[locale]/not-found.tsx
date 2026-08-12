import type { Metadata } from "next";
import { NotFound } from "@evinvest/uikit";

// Explicit noindex overrides the root metadata's `index, follow`, which would
// otherwise be emitted alongside Next's built-in not-found noindex as a
// conflicting pair.
export const metadata: Metadata = { robots: { index: false } };

export default function NotFoundPage() {
  return <NotFound />;
}
