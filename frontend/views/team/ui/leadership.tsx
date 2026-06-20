import Image from "next/image";
import { ASSETS } from "@/shared/config/assets";
import { TeamMembers } from "./members";

export function TeamLeadership() {
  return (
    <section className="border-t border-main-mist/10 py-20">
      <div className="container space-y-14">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-main-accent-t1">
              Leadership
            </span>
            <h2 className="font-serif-display text-3xl font-light text-white sm:text-4xl">
              Led by{" "}
              <span className="font-serif italic text-main-accent-t1">
                Institutional Pioneers
              </span>
            </h2>
            <p className="max-w-xl leading-relaxed text-main-mist/80">
              Our partners combine international experience in investment, risk
              management and real estate development across Vietnam and
              Singapore — pairing local execution with institutional discipline.
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-main-mist/10 shadow-2xl">
            <Image
              src={ASSETS.office_interior}
              alt="EV Investment boardroom in Quy Nhon"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-main-black/85 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
              <div className="space-y-1">
                <span className="font-mono-tech text-[10px] uppercase tracking-wider text-main-accent-t1">
                  Head Office
                </span>
                <h3 className="text-sm font-semibold text-white">
                  EV Boardroom • Quy Nhon
                </h3>
              </div>
              <span className="font-mono-tech text-[10px] text-main-mist/60">
                Q1 2026
              </span>
            </div>
          </div>
        </div>
        <TeamMembers />
      </div>
    </section>
  );
}
