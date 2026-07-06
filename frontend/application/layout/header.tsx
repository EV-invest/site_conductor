"use client";

// Client boundary on purpose: `linkComponent={Link}` is a function prop, which
// cannot cross the server→client boundary into the uikit's client Header.
import type { ReactNode } from "react";
import Link from "next/link";
import { Header as BrandHeader } from "@evinvest/uikit";
import { NAV_ITEMS } from "./nav-items";

// The chrome itself (scroll-aware bar, lockup, mobile overlay) is the shared
// @evinvest/uikit Header — one shell across every EV surface. This app wires in
// its nav items and the header CTA slot. The CTA is the account chip — a cabinet
// element remote resolved server-side (findMfe is node:fs) in `app/layout.tsx`
// and threaded down as `accountSlot`, keeping this a client component only for
// `linkComponent={Link}`. The bar CTA hides below `sm`; the overlay carries the
// full-width `mobileAccountSlot` variant instead.
export function Header({
  accountSlot,
  mobileAccountSlot,
}: {
  accountSlot?: ReactNode;
  mobileAccountSlot?: ReactNode;
}) {
  return (
    <BrandHeader
      nav={NAV_ITEMS}
      linkComponent={Link}
      cta={accountSlot}
      mobileCta={mobileAccountSlot}
    />
  );
}
