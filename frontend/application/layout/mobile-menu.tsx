"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { InvestorPortalButton } from "./investor-portal-button";

/** Below-`lg` navigation: a full-screen opaque overlay with its own close
 *  button, so the 7-item nav stays reachable on tablet/phone.
 *
 *  The overlay is portalled to `document.body` ON PURPOSE: once scrolled, the
 *  header gains `backdrop-blur`, which makes it the containing block for any
 *  `position: fixed` descendant — that would clamp `inset-0` to the header box
 *  and let the page bleed through. Portalling escapes that. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while open and close on Escape.
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
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center text-white"
      >
        <Menu className="size-6" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col bg-main-black px-6 pb-10 duration-200 animate-in fade-in lg:hidden">
            <div className="flex h-20 shrink-0 items-center justify-end">
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex size-10 items-center justify-center text-white"
              >
                <X className="size-6" />
              </button>
            </div>
            <nav className="flex flex-col font-mono-tech text-sm uppercase tracking-widest duration-300 ease-out animate-in fade-in slide-in-from-top-4">
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
              className="mt-8 w-full justify-center py-6 duration-300 ease-out animate-in fade-in slide-in-from-top-4"
            />
          </div>,
          document.body
        )}
    </div>
  );
}
