import type { Locale } from "@evinvest/i18n";

import { SITE, OFFICES } from "@/shared/config/site";
import { teamPersonNodes } from "@/entities/team";
import { officeNode, postalAddressNode } from "@/shared/seo/office";
import {
  JsonLd,
  ldAbs,
  ldCompact,
  LOGO_ID,
  ORG_ID,
  WEBSITE_ID,
  type JsonLdNode,
} from "@/shared/seo/json-ld";

// The homepage @graph: one connected set of nodes (WebSite + FinancialService
// organization + the two offices + named team) sharing @ids, rendered as a
// single <script>. This is the lever for the favicon + site-name + entity
// signals in search results. NO SearchAction (deprecated Nov 2024) and NO
// BreadcrumbList — home is the root of every trail, so it has none of its own.
//
// The node @ids, the office builders and the person builders are all shared
// (shared/seo/*, entities/team/seo) because /team, /contact, the publication
// articles and the job postings emit nodes that must resolve to these exact
// same entities.

function homeGraph(locale: Locale): JsonLdNode {
  const offices = OFFICES.map(officeNode);
  const people = teamPersonNodes(locale);
  const hq = OFFICES[0];

  const organization = ldCompact({
    "@type": "FinancialService",
    "@id": ORG_ID,
    name: SITE.name,
    alternateName: SITE.alternateName,
    legalName: SITE.legalName,
    url: `${SITE.url}/`,
    logo: {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: ldAbs("/assets/logo.svg"),
      width: 387,
      height: 335,
      caption: SITE.name,
    },
    image: { "@id": LOGO_ID },
    description: SITE.description,
    foundingDate: SITE.foundingDate,
    email: SITE.email,
    telephone: hq?.telephone,
    address: hq ? postalAddressNode(hq) : undefined,
    areaServed: ["Europe", "Worldwide"],
    knowsLanguage: [...SITE.locales],
    paymentAccepted: SITE.paymentAccepted.join(", "),
    sameAs: SITE.sameAs,
    contactPoint:
      SITE.email || hq?.telephone
        ? ldCompact({
            "@type": "ContactPoint",
            contactType: "investor relations",
            email: SITE.email,
            telephone: hq?.telephone,
            areaServed: "Worldwide",
            availableLanguage: ["en"],
          })
        : undefined,
    subOrganization: offices.map(office => ({ "@id": office["@id"] })),
    employee: people.map(person => ({ "@id": person["@id"] })),
  });

  const website = ldCompact({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    alternateName: SITE.alternateName,
    url: `${SITE.url}/`,
    description: SITE.description,
    inLanguage: SITE.defaultLocale,
    publisher: { "@id": ORG_ID },
  });

  return {
    "@context": "https://schema.org",
    "@graph": [website, organization, ...offices, ...people],
  };
}

export function HomeStructuredData({ locale }: { locale: Locale }) {
  return <JsonLd data={homeGraph(locale)} />;
}
