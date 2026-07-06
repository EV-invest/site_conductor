import type { ReactNode } from "react";
import Link from "next/link";
import { statusButtonClass, type StatusAccent } from "@evinvest/uikit";

// Soft-nav status CTA — the shared button styling now lives in the kit
// (`statusButtonClass`); this thin wrapper keeps the coming-soon surface on
// `next/link` (a browsable in-app route, unlike the 404/403/500 error pages).
export function StatusLink({
  accent,
  variant = "filled",
  href,
  children,
}: {
  accent: StatusAccent;
  variant?: "filled" | "outline";
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={statusButtonClass(accent, variant)}>
      {children}
    </Link>
  );
}
