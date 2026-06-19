import { ArrowLeft } from "lucide-react";
import { Logo } from "@/shared/ui/logo";
import { StatusLink } from "./buttons";

// Blueprint accents are raw blue (the design specifies #5e9be6 / #3b6ea5 — no
// token equivalent for the technical-drawing motif).
export function ComingSoonView() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a1428] px-6 py-28 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_50%_25%,rgba(94,155,230,0.10),transparent_70%)]" />

      {/* faux-3D drawing sheet */}
      <div className="relative mb-14 [perspective:1500px]">
        <div className="relative h-[330px] w-[520px] max-w-[86vw] rounded-sm border border-[#3b6ea5]/60 bg-[#0d1d3a] shadow-[0_45px_90px_-25px_rgba(0,0,0,0.7)] [transform:rotateX(7deg)_rotateY(-15deg)]">
          <div aria-hidden className="absolute inset-0 [background:linear-gradient(rgba(59,110,165,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(59,110,165,0.22)_1px,transparent_1px)] [background-size:26px_26px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo className="h-24 w-auto text-white/90" />
          </div>
          <span className="absolute left-6 top-6 -rotate-12 border-2 border-[#5e9be6]/70 px-3 py-1 font-mono-tech text-sm uppercase tracking-[0.3em] text-[#5e9be6]/80">Draft</span>
          <div className="absolute bottom-6 left-6 right-28 flex items-center gap-1 text-[#5e9be6]/55">
            <span className="h-2 w-px bg-current" />
            <span className="h-px flex-1 bg-current" />
            <span className="h-2 w-px bg-current" />
          </div>
          <div className="absolute bottom-4 right-4 w-32 border border-[#3b6ea5]/60 bg-[#0a1730] p-2 text-left">
            <p className="font-mono-tech text-[8px] uppercase tracking-widest text-[#5e9be6]/80">EV Investment</p>
            <p className="mt-1 font-mono-tech text-[7px] uppercase tracking-wider text-[#5e9be6]/50">Scale 1:1 · Sheet 01</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex max-w-xl flex-col items-center">
        <p className="mb-5 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-[#5e9be6]">Progress — on the drawing board</p>
        <h1 className="font-serif-display text-3xl font-light leading-tight text-white sm:text-5xl">
          Still on the <span className="font-serif italic text-[#5e9be6]">drawing board</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-main-mist/60 sm:text-base">
          Every EV development begins as a blueprint. This page is still in draft — our team is dimensioning the details. The finished plan lands here soon.
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
