// 301 redirect map for legacy WordPress URLs. Slugs that survive 1:1 (services,
// portfolio, locations, the pillar) need NO redirect — they're preserved exactly.
// Only URLs that genuinely change are mapped here. Verify each with `curl -I`
// before the domain cutover.

export type Redirect = { source: string; destination: string; permanent: boolean };

export const REDIRECTS: Redirect[] = [
  // Legacy /projects/* archives → the new filterable portfolio.
  { source: "/projects", destination: "/portfolio", permanent: true },
  { source: "/projects/:category", destination: "/portfolio", permanent: true },

  // Duplicate / junk portfolio slugs.
  {
    source: "/portfolio/epping-to-thornleigh-third-track-2",
    destination: "/portfolio/epping-to-thornleigh-third-track",
    permanent: true,
  },
  { source: "/portfolio/tatsu-5214", destination: "/portfolio", permanent: true },

  // Dated blog post → clean insights URL.
  {
    source: "/2023/05/21/why-are-basix-reports-important",
    destination: "/insights/why-are-basix-reports-important",
    permanent: true,
  },

  // Thin / moved legacy pages.
  { source: "/contact-us/faqs", destination: "/faq", permanent: true },
  {
    source: "/dilapidation-reports/condition-reports",
    destination: "/dilapidation-reports",
    permanent: true,
  },
];
