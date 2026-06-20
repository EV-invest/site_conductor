import { Container } from "@evinvest/uikit";
import { ArrowDown } from "lucide-react";

function Stat({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className: string;
}) {
  return (
    <div>
      <p className={`font-serif-display text-3xl ${className}`}>{value}</p>
      <p className="mt-1 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/45">
        {label}
      </p>
    </div>
  );
}

export function HiringHero({
  roleCount,
  teamCount,
}: {
  roleCount: number;
  teamCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-main-black pt-40 pb-16">
      <Container>
        <p className="mb-5 font-mono-tech text-[11px] uppercase tracking-[0.34em] text-main-accent-t1">
          Hiring · Join the fund
        </p>
        <h1 className="max-w-3xl font-serif-display text-4xl font-light leading-tight text-white sm:text-6xl">
          Build coastal Vietnam&apos;s{" "}
          <span className="font-serif italic text-main-accent-t1">
            next decade
          </span>{" "}
          with us.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-main-mist/60 sm:text-base">
          EV Investment develops premium coastal assets in Quy Nhơn — and
          we&apos;re hiring senior people across investment, development, and
          client advisory. Find your role below.
        </p>
        <a
          href="#open-roles"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-main-accent-t1 px-6 py-3 font-mono-tech text-xs uppercase tracking-widest text-main-black transition-colors hover:bg-main-accent-t1/90"
        >
          View open roles <ArrowDown className="h-4 w-4" />
        </a>

        <div className="mt-14 flex items-center gap-10 border-t border-white/[0.06] pt-7">
          <Stat
            value={String(roleCount)}
            label="Open roles"
            className="text-main-accent-t3"
          />
          <span className="h-8 w-px bg-white/10" />
          <Stat
            value={String(teamCount)}
            label="Teams hiring"
            className="text-main-accent-t1"
          />
          <span className="h-8 w-px bg-white/10" />
          <Stat value="2" label="Office locations" className="text-white" />
        </div>
      </Container>
    </section>
  );
}
