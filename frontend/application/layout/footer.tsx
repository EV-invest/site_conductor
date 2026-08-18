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
  // The uikit Footer defaults every one of these to English. Left unset they
  // are what a /ru/ reader still reads in English beside a translated sitemap,
  // so each one is passed explicitly. The "Offices" and "Newsletter" column
  // headings and the copyright line are baked into @evinvest/uikit with no prop
  // to override them — they need a uikit release, see issue notes.
  const offices = [
    { name: t("footer.office.hq.name"), address: t("footer.office.hq.address") },
    {
      name: t("footer.office.hcmc.name"),
      address: t("footer.office.hcmc.address"),
    },
  ];
  const legalLinks = [
    { label: t("footer.legal.privacy"), href: "#hero" },
    { label: t("footer.legal.terms"), href: "#hero" },
  ];
  return (
    <BrandFooter
      nav={nav}
      description={t("footer.description")}
      tagline={t("footer.tagline")}
      offices={offices}
      legalLinks={legalLinks}
      newsletterBlurb={t("footer.newsletter.blurb")}
      linkComponent={Link}
      newsletter={<NewsletterForm />}
      version={version}
      commitHref={`https://github.com/ev-invest/site_conductor/commit/${commit}`}
    >
      <BuildVersionLog />
    </BrandFooter>
  );
}
