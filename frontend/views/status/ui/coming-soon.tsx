import { ArrowLeft } from "lucide-react";
import { StatusLink } from "./buttons";
import { Blueprint } from "./blueprint";

// The Coming Soon surface is an embeddable element (no dedicated /coming-soon
// route): host routes that have no finished page render it inline. Header/footer
// are app-shell chrome, so this view is only the centred drawing-board hero.
// Raw blueprint blues — see {@link Blueprint} / status-screen's "blue" accent.
export function ComingSoonView() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-main-black px-6 py-28 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_45%_at_50%_18%,rgba(94,155,230,0.14),transparent_70%)]"
      />

      <Blueprint />

      <div className="relative z-10 mt-14 flex max-w-xl flex-col items-center sm:mt-20">
        <p className="mb-5 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-[#5e9be6]">
          In progress · on the drawing board
        </p>
        <h1 className="font-serif-display text-3xl font-light leading-tight text-white sm:text-5xl">
          Still on the{" "}
          <span className="font-serif italic text-[#5e9be6]">
            drawing board
          </span>
          .
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-main-mist/70 sm:text-base">
          Every EV development begins as a blueprint. This page is still in
          draft — our team is dimensioning the details. The finished plan lands
          here soon.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <StatusLink accent="blue" href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
          </StatusLink>
          <StatusLink accent="blue" variant="outline" href="/contact">
            Notify me
          </StatusLink>
        </div>
      </div>
    </section>
  );
}
