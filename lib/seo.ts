import { SITE } from "@/lib/site";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ausdilaps.com.au";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  addressLocality: "Aspley",
  addressRegion: "QLD",
  postalCode: "4034",
  addressCountry: "AU",
};

const AREAS = [
  "New South Wales",
  "Queensland",
  "Victoria",
  "Australian Capital Territory",
  "South Australia",
];

/** Site-wide Organization schema (E-E-A-T / GEO). */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AusDilaps",
    legalName: `${SITE.legalName} T/A AusDilaps`,
    url: SITE_URL,
    logo: absoluteUrl("/logo/ad-logo.png"),
    description:
      "Australia's specialist dilapidation reporting firm — pre- and post-construction building condition reports that hold up when a damage claim is made.",
    email: SITE.email,
    telephone: SITE.phone,
    address: POSTAL_ADDRESS,
    areaServed: "AU",
    identifier: { "@type": "PropertyValue", propertyID: "ABN", value: SITE.abn },
  };
}

/** Local/professional service schema for local packs + AEO. */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "AusDilaps",
    image: absoluteUrl("/projects/queens-wharf.jpg"),
    url: SITE_URL,
    telephone: SITE.phone,
    email: SITE.email,
    address: POSTAL_ADDRESS,
    areaServed: AREAS,
    knowsAbout: [
      "Dilapidation reports",
      "Building condition reports",
      "Pre-construction condition surveys",
      "Structural integrity assessments",
      "Defect origin assessments",
      "AS 4349.0",
    ],
  };
}

export function faqPageSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function howToSchema(name: string, steps: { title: string; body: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };
}

export function serviceSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    provider: { "@type": "Organization", name: "AusDilaps", url: SITE_URL },
    areaServed: "AU",
    url: absoluteUrl(path),
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}
