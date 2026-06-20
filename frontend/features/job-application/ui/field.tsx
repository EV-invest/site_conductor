import type { ReactNode } from "react";
import { INPUT_CLASS as CONTROL } from "@/shared/ui/control";

/** Mono-labelled form control wrapper — the "letterhead field" look. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono-tech text-[10px] uppercase tracking-[0.2em] text-main-mist/50">{label}</span>
      {children}
    </label>
  );
}

export { CONTROL };
