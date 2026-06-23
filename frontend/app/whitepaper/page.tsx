import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whitepaper",
  description:
    "EV Investment whitepaper — our institutional thesis on coastal real estate in Quy Nhơn, Vietnam.",
  alternates: { canonical: "/whitepaper" },
};

// The doc is a self-contained static HTML build (whitepaper flake → public/).
// Rendering it as an app route (not a next.config rewrite) keeps the root
// layout's Header on top, the general-case way every page gets it. The iframe
// flows below the fixed header (mt clears it) and fills the viewport; the
// layout Footer sits just past the fold. Dark is the default variant.
export default function Page() {
  return (
    <iframe
      src="/whitepaper.dark.html"
      title="EV Investment whitepaper"
      className="block w-full border-0"
      style={{ marginTop: "6rem", height: "calc(100vh - 6rem)" }}
    />
  );
}
