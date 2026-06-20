import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import type { StatusAccent } from "./status-screen";

// Plain styled link/button — no uikit Button/Slot, so two siblings hydrate
// cleanly. These CTAs are navigations, not form controls.
const BASE = "inline-flex items-center justify-center rounded-md px-6 py-3.5 font-mono-tech text-xs uppercase tracking-widest transition-colors";

const FILLED: Record<StatusAccent, string> = {
  teal: "bg-main-accent-t1 text-main-black hover:bg-main-accent-t1/90",
  gold: "bg-main-accent-t3 text-main-black hover:bg-main-accent-t3/90",
  red: "bg-destructive text-white hover:bg-destructive/90",
  blue: "bg-[#5e9be6] text-main-black hover:bg-[#5e9be6]/90",
};

const OUTLINE: Record<StatusAccent, string> = {
  teal: "border border-main-accent-t1/40 text-main-accent-t1 hover:bg-main-accent-t1/10",
  gold: "border border-main-accent-t3/40 text-main-accent-t3 hover:bg-main-accent-t3/10",
  red: "border border-destructive/40 text-destructive hover:bg-destructive/10",
  blue: "border border-[#5e9be6]/40 text-[#5e9be6] hover:bg-[#5e9be6]/10",
};

/** Shared between the navigation links and the 500 client retry button. */
export function statusButtonClass(accent: StatusAccent, variant: "filled" | "outline") {
  return cn(BASE, variant === "filled" ? FILLED[accent] : OUTLINE[accent]);
}

export function StatusLink({ accent, variant = "filled", href, children }: { accent: StatusAccent; variant?: "filled" | "outline"; href: string; children: ReactNode }) {
  return (
    <Link href={href} className={statusButtonClass(accent, variant)}>
      {children}
    </Link>
  );
}
