"use client";

// Client boundary on purpose: `linkComponent={Link}` is a function prop, which
// cannot cross the server→client boundary into the uikit's client Footer.
import Link from "next/link";
import { Footer as BrandFooter } from "@evinvest/uikit";
import { BuildVersionLog } from "./build-version-log";
import { FOOTER_NAV } from "./nav-items";
import { NewsletterForm } from "./newsletter-form";

const version = process.env.NEXT_PUBLIC_BUILD_VERSION ?? "unknown";
const commit = process.env.NEXT_PUBLIC_BUILD_COMMIT || version;

// The 12-col footer grid (Figma: site_conductor › Footer) is the shared
// @evinvest/uikit Footer; this app supplies the sitemap columns, the
// newsletter form island, and the deployed-version line.
export function Footer() {
  return (
    <BrandFooter
      nav={FOOTER_NAV}
      linkComponent={Link}
      newsletter={<NewsletterForm />}
      version={version}
      commitHref={`https://github.com/EV-invest/site_conductor/commit/${commit}`}
    >
      <BuildVersionLog />
    </BrandFooter>
  );
}
