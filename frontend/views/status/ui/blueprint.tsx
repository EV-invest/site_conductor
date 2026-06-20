import { Logo } from "@/shared/ui/logo";

/**
 * The isometric "drawing sheet" centrepiece of the Coming Soon screen: a tilted
 * navy blueprint with a grid, a dimensioned EV mark, a DRAFT watermark and an
 * engineering title block. Raw blueprint blues — the technical-drawing motif has
 * no token equivalent (mirrors status-screen's "blue" accent). Sized in vw so
 * the whole sheet scales down cleanly on small screens.
 */
export function Blueprint() {
  return (
    <div aria-hidden className="relative [perspective:1600px]">
      <div className="relative aspect-[3/2] w-[660px] max-w-[88vw] rounded-sm border-2 border-[#9bc1ff]/70 bg-[#0a2f6e] shadow-[0_45px_90px_-25px_rgba(0,10,31,0.7)] [transform:rotateX(9deg)_rotateY(-17deg)]">
        <div className="absolute inset-0 [background:linear-gradient(rgba(155,193,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(155,193,255,0.16)_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <Logo className="h-[26%] w-auto text-[#dbe8ff]" />
        </div>

        <span className="absolute left-[7%] top-[9%] rotate-[7deg] font-mono-tech text-[clamp(1.4rem,6vw,3.25rem)] font-extrabold tracking-[0.16em] text-transparent [-webkit-text-stroke:1px_rgba(155,193,255,0.4)]">
          DRAFT
        </span>

        <span className="absolute bottom-[11%] left-1/2 -translate-x-1/2 font-mono-tech text-[10px] tracking-wider text-[#bcd6ff]">
          24.00 m
        </span>
        <span className="absolute left-[19%] top-[46%] font-mono-tech text-[10px] tracking-wider text-[#bcd6ff]">
          31.5 m
        </span>
        <span className="absolute right-[24%] top-[19%] font-mono-tech text-[11px] font-semibold text-[#bcd6ff]">
          A
        </span>

        <div className="absolute bottom-[6%] right-[5%] w-[30%] min-w-[148px] border border-[#9bc1ff]/55 bg-[#0a2f6e] p-2.5 text-left">
          <p className="font-mono-tech text-[9px] font-semibold tracking-wider text-[#eaf2ff]">
            EV INVESTMENT
          </p>
          <div className="my-1.5 h-px bg-[#9bc1ff]/35" />
          <p className="font-mono-tech text-[7px] tracking-wide text-[#bcd6ff]">
            DWG · COASTAL TOWER A-04
          </p>
          <p className="mt-0.5 font-mono-tech text-[7px] tracking-wide text-[#bcd6ff]">
            SCALE 1:100 · REV —
          </p>
          <p className="mt-0.5 font-mono-tech text-[7px] tracking-wide text-[#5e9be6]">
            STATUS · IN PROGRESS
          </p>
        </div>
      </div>
    </div>
  );
}
