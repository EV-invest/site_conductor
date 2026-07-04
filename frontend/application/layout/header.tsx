"use client";

// Client boundary on purpose: `linkComponent={Link}` is a function prop, which
// cannot cross the server→client boundary into the uikit's client Header.
import Link from "next/link";
import { Header as BrandHeader } from "@evinvest/uikit";
import { NAV_ITEMS } from "./nav-items";
import { InvestorPortalButton } from "./investor-portal-button";

// The chrome itself (scroll-aware bar, lockup, mobile overlay) is the shared
// @evinvest/uikit Header — one shell across every EV surface. This app only
// wires in its nav items and CTA. The bar CTA hides below `sm` (the overlay
// carries the full-width variant instead), matching the pre-uikit behavior.
export function Header() {
  return (
    <BrandHeader
      nav={NAV_ITEMS}
      linkComponent={Link}
      cta={<InvestorPortalButton className="hidden sm:inline-flex" />}
      mobileCta={<InvestorPortalButton className="w-full justify-center py-6" />}
    />
  );
}
