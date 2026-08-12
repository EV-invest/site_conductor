import type { Metadata } from "next";
import { HomeView } from "@/views/home";

// Self-referencing canonical collapses UTM / analytics query-string duplicates
// (PostHog/Umami params) onto the clean URL. Resolved against metadataBase.
// Declared here rather than in the root metadata so it can't cascade into
// noindexed routes or the 404.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  return <HomeView />;
}
