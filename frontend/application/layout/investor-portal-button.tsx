"use client";

import { Button } from "@evinvest/uikit";
import { useRouter } from "next/navigation";
import { getLoginUrl } from "@/shared/config/const";

/**
 * Investor Portal CTA. The portal is a separate application on its own origin
 * (NEXT_PUBLIC_OAUTH_PORTAL_URL); when configured we send the user to its OAuth
 * sign-in (built at runtime so the redirect URI reflects this origin). When the
 * env is unset (local / preview) we fall back to the in-app Coming Soon stub, so
 * the CTA is never a dead end. A single non-`asChild` Button is hydration-safe.
 */
export function InvestorPortalButton({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    onNavigate?.();
    if (process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL) {
      window.location.href = getLoginUrl();
    } else {
      router.push("/investor-portal");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={`font-mono-tech text-xs tracking-wider border-main-accent-t1 text-main-accent-t1 hover:bg-main-accent-t1 hover:text-main-black transition-all duration-300 bg-transparent ${className ?? ""}`}
    >
      Investor Portal
    </Button>
  );
}
