import type { Metadata } from "next";
import { ComingSoonView } from "@/views/status";

// The investor portal is a separate application on its own origin/port, set via
// NEXT_PUBLIC_OAUTH_PORTAL_URL (the header CTA builds the login URL from it).
// Until that env is configured the CTA lands here, which embeds the shared
// Coming Soon element rather than being its own page. Noindex — not a public
// marketing surface.
export const metadata: Metadata = {
  title: "Investor Portal",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ComingSoonView />;
}
