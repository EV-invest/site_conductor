"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/shared/ui/logo";
import { NAV_ITEMS } from "./nav-items";
import { InvestorPortalButton } from "./investor-portal-button";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 border-b ${
        hasScrolled
          ? "bg-main-black/90 backdrop-blur-md border-main-mist/10 py-4"
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="container flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="EV Investment — home"
        >
          <Logo className="w-10 h-10 text-white" />
          <div className="flex flex-col">
            <span className="font-serif-display font-bold text-lg tracking-wider text-white">
              EV INVESTMENT
            </span>
            <span className="text-[9px] font-mono-tech tracking-[0.3em] text-main-accent-t1 uppercase">
              Quy Nhon Fund
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 font-mono-tech text-xs tracking-widest uppercase">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-main-mist/80 hover:text-main-accent-t1 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <InvestorPortalButton className="hidden sm:inline-flex" />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
