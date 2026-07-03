"use client";

import { Button } from "@evinvest/uikit";
import { useRouter } from "next/navigation";
import { getLoginUrl } from "@/shared/config/const";
import { cn } from "@/shared/lib/utils";

/**
 * Investor Portal CTA. Three destinations, by deployment shape:
 * 1. NEXT_PUBLIC_CABINET_PATH — the cabinet mounted as a zone of this domain
 *    (conductor rewrites /cabinet/* to it). Cross-zone navigation must be a
 *    full document load, so assign location instead of the app router.
 * 2. NEXT_PUBLIC_OAUTH_PORTAL_URL — a portal on its own origin; send the user
 *    to its OAuth sign-in (built at runtime so the redirect URI reflects this
 *    origin).
 * 3. Neither set (local / preview) — the in-app Coming Soon stub, so the CTA
 *    is never a dead end. A single non-`asChild` Button is hydration-safe.
 */
export function InvestorPortalButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (process.env.NEXT_PUBLIC_CABINET_PATH) {
      window.location.href = process.env.NEXT_PUBLIC_CABINET_PATH;
    } else if (process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL) {
      window.location.href = getLoginUrl();
    } else {
      router.push("/investor-portal");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={cn(
        "font-mono-tech text-xs tracking-wider border-main-accent-t1 text-main-accent-t1 hover:bg-main-accent-t1 hover:text-main-black transition-all duration-300 bg-transparent",
        className
      )}
    >
      Investor Portal
    </Button>
  );
}
