"use client";

// Client boundary on purpose: `linkComponent={Link}` is a function prop, which
// cannot cross the server→client boundary into the uikit's client Header.
import Link from "next/link";
import { Header as BrandHeader } from "@evinvest/uikit";
import { HeaderActions } from "@/shared/ui/header-actions";
import { NAV_ITEMS } from "./nav-items";
import { InvestorPortalButton } from "./investor-portal-button";

// The chrome itself (scroll-aware bar, lockup, mobile overlay) is the shared
// @evinvest/uikit Header — one shell across every EV surface. This app only
// wires in its nav items and CTA. The bar CTA hides below `sm` (the overlay
// carries the full-width variant instead), matching the pre-uikit behavior.
// Route-owned actions (`HeaderAction`) slot in left of the CTA and stay
// visible on mobile, where the CTA itself hides.
export function Header() {
  return (
    <BrandHeader
      nav={NAV_ITEMS}
      linkComponent={Link}
      cta={
        <>
          <HeaderActions />
          <InvestorPortalButton className="hidden sm:inline-flex" />
        </>
      }
      mobileCta={<InvestorPortalButton className="w-full justify-center py-6" />}
    />
  );
}
