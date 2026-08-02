import type { ReactNode } from "react";

/**
 * A single key chip. Server Component — shared by the field hints and the
 * shortcuts dialog so the two never drift apart.
 */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-main-mist/22 bg-main-mist/8 px-1.5 py-0.5 font-mono-tech text-[10px] leading-none text-main-mist/70">
      {children}
    </kbd>
  );
}

/** The quiet caption that follows a group of chips. */
export function KbdCaption({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-main-mist/35">
      {children}
    </span>
  );
}
