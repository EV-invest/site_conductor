import type { Metadata } from "next";

import { Container } from "@evinvest/uikit";

import { RemoteDocument } from "@/shared/mfe";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "EV Investment whitepaper — our institutional thesis on coastal real estate in Quy Nhơn, Vietnam.",
  alternates: { canonical: "/whitepaper" },
};

// The whitepaper is a self-contained static HTML build (whitepaper flake →
// public/), composed into the page as a *document microfrontend* — no iframe, so
// it flows under the fixed header with the host's own chrome and scroll. It ships
// its own complete styles (bare-tag selectors, its own fonts), so it mounts
// isolated in a shadow root (`isolate`). Dark is the default variant.
export default function Page() {
  return (
    <main className="mt-24 min-h-[60vh]">
      {/* The doc body mounts in a shadow root (client-side), so give the page a
          light-DOM heading for the a11y/heading landmark. */}
      <h1 className="sr-only">EV Investment Whitepaper</h1>
      <RemoteDocument
        src="/whitepaper.dark.html"
        isolate
        className="block"
        fallback={
          <Container className="py-24 text-main-mist/60">
            Loading the whitepaper… if it doesn’t appear,{" "}
            <a href="/whitepaper.pdf" className="text-main-accent-t1 underline">
              download the PDF
            </a>
            .
          </Container>
        }
      />
    </main>
  );
}
