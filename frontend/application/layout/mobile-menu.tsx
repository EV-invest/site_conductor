"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { InvestorPortalButton } from "./investor-portal-button";

/** Below-`lg` navigation: a full-screen overlay so the 7-item nav stays
 *  reachable on tablet/phone (the desktop nav is `hidden lg:flex`). */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the overlay is up, and close it on Escape (the
  // toggle stays focusable above the overlay for pointer/tab dismissal).
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="flex size-10 items-center justify-center text-white"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[55] flex flex-col bg-main-black/98 px-6 pb-10 pt-28 backdrop-blur-md">
          <nav className="flex flex-col font-mono-tech text-sm uppercase tracking-widest">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-main-mist/10 py-4 text-main-mist/80 transition-colors hover:text-main-accent-t1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <InvestorPortalButton
            onNavigate={() => setOpen(false)}
            className="mt-8 w-full justify-center py-6"
          />
        </div>
      )}
    </div>
  );
}
