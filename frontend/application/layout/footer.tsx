"use client";

// Client boundary on purpose: `linkComponent={Link}` is a function prop, which
// cannot cross the server→client boundary into the uikit's client Footer.
import Link from "next/link";
import { Footer as BrandFooter } from "@evinvest/uikit";
import { useT, useLocale } from "@evinvest/i18n/react";
import { BuildVersionLog } from "./build-version-log";
import { FOOTER_NAV, localizeNav } from "./nav-items";
import { NewsletterForm } from "./newsletter-form";
import { config } from "@/config";

const version = config.public.buildVersion ?? "unknown";
const commit = config.public.buildCommit || version;

// The 12-col footer grid (Figma: site_conductor › Footer) is the shared
// @evinvest/uikit Footer; this app supplies the sitemap columns, the
// newsletter form island, and the deployed-version line.
export function Footer() {
  const t = useT();
  const locale = useLocale();
  // Both halves matter: the heading and link text come from the catalogue, and
  // the hrefs get the locale prefix so a reader on /ru/ stays on /ru/.
  const nav = FOOTER_NAV.map(column => ({
    ...column,
    heading: t(column.key),
    links: localizeNav(column.links, locale, t),
  }));
  return (
    <BrandFooter
      nav={nav}
      linkComponent={Link}
      newsletter={<NewsletterForm />}
      version={version}
      commitHref={`https://github.com/ev-invest/site_conductor/commit/${commit}`}
    >
      <BuildVersionLog />
    </BrandFooter>
  );
}
