"use client";

// Client boundary on purpose: `linkComponent={Link}` is a function prop, which
// cannot cross the server→client boundary into the uikit's client Footer.
import Link from "next/link";
import { Footer as BrandFooter } from "@evinvest/uikit";
import { useT, useLocale } from "@/shared/lib/t";
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
    heading: column.heading(t),
    links: localizeNav(column.links, locale, t),
  }));
  // The uikit Footer defaults every one of these to English. Left unset they
  // are what a /ru/ reader still reads in English beside a translated sitemap,
  // so each one is passed explicitly.
  const offices = [
    {
      name: t("footer.office.hq.name", "Quy Nhon Head Office"),
      address: t(
        "footer.office.hq.address",
        "102 An Duong Vuong St, Nguyen Van Cu Ward, Quy Nhon City, Vietnam"
      ),
    },
    {
      name: t("footer.office.hcmc.name", "Ho Chi Minh Representative"),
      address: t(
        "footer.office.hcmc.address",
        "Deutsches Haus, 33 Le Duan Blvd, District 1, Ho Chi Minh City, Vietnam"
      ),
    },
  ];
  const legalLinks = [
    { label: t("footer.legal.privacy", "Privacy Policy"), href: "#hero" },
    { label: t("footer.legal.terms", "Terms of Service"), href: "#hero" },
  ];
  return (
    <BrandFooter
      nav={nav}
      brand="EV INVESTMENT"
      copyright={`© ${new Date().getFullYear()} EV Investment. ${t("footer.rights", "All rights reserved.")}`}
      description={t(
        "footer.description",
        "EV Investment is a registered real estate advisory and investment management fund specializing in premium coastal developments in Quy Nhon, Binh Dinh province, Vietnam."
      )}
      tagline={t("footer.tagline", "Quy Nhon Fund")}
      offices={offices}
      legalLinks={legalLinks}
      newsletterBlurb={t(
        "footer.newsletter.blurb",
        "Subscribe, to receive our macro reports"
      )}
      linkComponent={Link}
      newsletter={<NewsletterForm />}
      version={version}
      commitHref={`https://github.com/ev-invest/site_conductor/commit/${commit}`}
    >
      <BuildVersionLog />
    </BrandFooter>
  );
}
