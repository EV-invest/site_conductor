import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { StatusLink } from "./buttons";
import { Seal } from "./seal";

export type StatusAccent = "teal" | "gold" | "red" | "blue";

// Accent → token text colour. Bound to ev/color tokens; "blue" is the
// blueprint accent the design specifies as a raw value (no token equivalent).
const ACCENT_TEXT: Record<StatusAccent, string> = {
  teal: "text-main-accent-t1",
  gold: "text-main-accent-t3",
  red: "text-destructive",
  blue: "text-[#5e9be6]",
};

export interface StatusLinkData {
  label: string;
  href: string;
  variant?: "filled" | "outline";
  leadingArrow?: boolean;
}

interface StatusScreenProps {
  accent: StatusAccent;
  eyebrow: string;
  code: string;
  headlineLead: string;
  headlineAccent: string;
  headlineTail?: string;
  subtext: string;
  links?: StatusLinkData[];
  /** Leading action slot, rendered before `links` (e.g. the 500 client retry). */
  children?: ReactNode;
}

/**
 * Shared skeleton for the 404 / 403 / 500 status pages: a centred hero with the
 * skyline seal, a mono eyebrow, a giant Playfair code, a headline whose final
 * clause is an italic accent, supporting copy, and the CTAs. The accent threads
 * through all four marks. Actions render inline (from `links` data, plus an
 * optional `children` slot) — never passed as a JSX prop through this server
 * boundary, which would desync hydration.
 */
export function StatusScreen({ accent, eyebrow, code, headlineLead, headlineAccent, headlineTail = ".", subtext, links, children }: StatusScreenProps) {
  const accentText = ACCENT_TEXT[accent];
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-main-black px-6 py-32 text-center">
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 opacity-[0.07] [background:radial-gradient(55%_45%_at_50%_30%,currentColor,transparent_70%)]", accentText)} />
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <Seal className={cn("mb-7 h-10 w-auto", accentText)} />
        <p className={cn("mb-6 font-mono-tech text-[11px] uppercase tracking-[0.34em]", accentText)}>{eyebrow}</p>
        <p className={cn("font-serif-display text-[110px] font-medium leading-[0.9] sm:text-[180px]", accentText)}>{code}</p>
        <h1 className="mt-4 font-serif-display text-3xl font-light leading-tight text-white sm:text-5xl">
          {headlineLead}
          <span className={cn("font-serif italic", accentText)}>{headlineAccent}</span>
          {headlineTail}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-main-mist/60 sm:text-base">{subtext}</p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          {children}
          {links?.map((link) => (
            <StatusLink key={link.label} accent={accent} variant={link.variant ?? "filled"} href={link.href}>
              {link.leadingArrow ? <ArrowLeft className="mr-2 h-4 w-4" /> : null}
              {link.label}
            </StatusLink>
          ))}
        </div>
      </div>
    </section>
  );
}
