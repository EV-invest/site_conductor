import { SITE, OFFICES, type Office } from "@/shared/config/site";
import { TEAM } from "@/entities/team";
import {
  JsonLd,
  ldId,
  ldAbs,
  ldCompact,
  type JsonLdNode,
} from "@/shared/seo/json-ld";

// The homepage @graph: one connected set of nodes (WebSite + FinancialService
// organization + the two offices + named team) sharing @ids, rendered as a
// single <script>. This is the lever for the favicon + site-name + entity
// signals in search results. NO SearchAction (deprecated Nov 2024) and NO
// BreadcrumbList (needs ≥2 pages) while the site is single-page.

const ORG_ID = ldId("#organization");
const LOGO_ID = ldId("#logo");
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function postalAddress(office: Office): JsonLdNode {
  return ldCompact({
    "@type": "PostalAddress",
    streetAddress: office.streetAddress,
    addressLocality: office.addressLocality,
    addressRegion: office.addressRegion,
    postalCode: office.postalCode,
    addressCountry: office.addressCountry,
  });
}

function officeNode(office: Office): JsonLdNode {
  return ldCompact({
    "@type": "LocalBusiness",
    "@id": ldId(`#office-${office.id}`),
    name: `${SITE.name} — ${office.name}`,
    parentOrganization: { "@id": ORG_ID },
    url: `${SITE.url}/`,
    image: { "@id": LOGO_ID },
    address: postalAddress(office),
    telephone: office.telephone,
    geo: office.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: office.geo.lat,
          longitude: office.geo.lng,
        }
      : undefined,
  });
}

// Skip placeholder identities ("Elisey TODO") — never publish fake people in
// structured data. Real names appear automatically once entities/team is filled.
function personNodes(): JsonLdNode[] {
  return TEAM.filter(member => !/\btodo\b/i.test(member.name)).map(member =>
    ldCompact({
      "@type": "Person",
      "@id": ldId(`#person-${slug(member.name)}`),
      name: member.name,
      jobTitle: member.role,
      description: member.bio,
      image: ldAbs(member.photo),
      worksFor: { "@id": ORG_ID },
    })
  );
}

function homeGraph(): JsonLdNode {
  const offices = OFFICES.map(officeNode);
  const people = personNodes();
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
    address: hq ? postalAddress(hq) : undefined,
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
    "@id": ldId("#website"),
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

export function HomeStructuredData() {
  return <JsonLd data={homeGraph()} />;
}
