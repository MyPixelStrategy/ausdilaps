import type { Metadata } from "next";
import { Container } from "@/components/marketing/container";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { PageHero } from "@/components/marketing/page-hero";
import { FaqSection } from "@/components/marketing/faq-accordion";
import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { faqPageSchema, breadcrumbSchema } from "@/lib/seo";
import type { FaqItem } from "@/data/faq";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Dilapidation Reports", path: "/dilapidation-reports" },
  { name: "Samples", path: "/dilapidation-reports/samples" },
];

export const metadata: Metadata = {
  title: "Sample Dilapidation Reports | Examples, Formats & What's Included",
  description:
    "View real AusDilaps sample dilapidation reports across every capture type — residential, commercial, GPS, council assets, roadway video, tunnels, drone, culvert, plus DOA, SIA and DCA engineering reports.",
  alternates: { canonical: "/dilapidation-reports/samples" },
};

// Real published sample reports. Hosted on the live site during the transition;
// migrate to storage before the domain cutover (see seo/content-backlog + Phase 7).
const LIVE = "https://ausdilaps.com.au/wp-content/uploads";

type Sample = { name: string; desc: string; url: string };
type SampleGroup = { id: string; title: string; blurb: string; items: Sample[] };

const SAMPLE_GROUPS: SampleGroup[] = [
  {
    id: "general",
    title: "General documents",
    blurb: "How we work — capability, methodology and the access letters property owners receive.",
    items: [
      { name: "Capability Statement", desc: "Who we are, our stats, methodology and project experience.", url: `${LIVE}/2026/04/AusDilaps-Capability-Statement-FY25-26.pdf` },
      { name: "Methodology Statement", desc: "Our full 6-step survey and reporting methodology.", url: `${LIVE}/2025/09/AusDilaps-Methodology-FY25-26.pdf` },
      { name: "Access Letter sample", desc: "The letter adjoining owners receive when we arrange access.", url: `${LIVE}/2025/07/AusDilaps-Sample-Access-Letter-2025.pdf` },
    ],
  },
  {
    id: "building",
    title: "Residential & commercial building reports",
    blurb: "Pre- and post-construction condition reports — the core dilapidation deliverable.",
    items: [
      { name: "Commercial — Pre-construction", desc: "A commercial dilapidation survey before works begin.", url: `${LIVE}/2025/04/AusDilaps-Sample-Commercial-Pre-Report.pdf` },
      { name: "Commercial — Post-construction", desc: "The matching post-construction commercial survey.", url: `${LIVE}/2025/04/AusDilaps-Sample-Commercial-Post.pdf` },
      { name: "Residential — Pre-construction", desc: "A residential dilapidation survey before works begin.", url: `${LIVE}/2025/04/AusDilaps-Sample-Residential-Pre.pdf` },
      { name: "Residential — Post-construction", desc: "The matching post-construction residential survey.", url: `${LIVE}/2023/10/AD-Residential-Sample-Report-POST-2020.pdf` },
      { name: "Defect-marked Floor Plan", desc: "Defects mapped to a scaled floor plan for precise location.", url: `${LIVE}/2025/04/AusDilaps-Sample-Defect-Floor-Plan.pdf` },
    ],
  },
  {
    id: "external",
    title: "External & council-asset surveys",
    blurb: "Georeferenced surveys of roads, kerbs, drainage and council-owned assets.",
    items: [
      { name: "GPS — Commercial External", desc: "Georeferenced external dilapidation survey.", url: `${LIVE}/2025/04/AusDilaps-Sample-GPS-External.pdf` },
      { name: "GPS — Council Assets", desc: "Council-asset survey with GPS-logged imagery.", url: `${LIVE}/2024/11/Sample-Council-Assets.pdf` },
      { name: "Roadways — Video Report", desc: "Vehicle-mounted roadway video condition survey.", url: `${LIVE}/2026/04/AusDilaps-Sample-2026-Video-Report.pdf` },
      { name: "Rail Corridor", desc: "Dilapidation survey along a rail corridor.", url: `${LIVE}/2023/04/AD-Rail-Corridor-Sample-Report-2020.pdf` },
    ],
  },
  {
    id: "specialised",
    title: "Specialised surveys",
    blurb: "Tunnels, stations, drone, culvert and pipe — the right method for hard-to-reach assets.",
    items: [
      { name: "Tunnels", desc: "Dilapidation survey of a tunnel structure.", url: `${LIVE}/2025/04/AusDilaps-Sample-Tunnel.pdf` },
      { name: "Train Station (GPS)", desc: "Georeferenced station dilapidation survey.", url: `${LIVE}/2026/04/AusDilaps-Sample-2026-Train-Station-GPS.pdf` },
      { name: "Drone — Rural (with GPS)", desc: "Aerial dilapidation survey with georeferenced imagery.", url: `${LIVE}/2025/04/AusDilaps-Sample-Drone-Rural.pdf` },
      { name: "Culvert & Pipe", desc: "Internal culvert and pipe condition inspection.", url: `${LIVE}/2025/07/AusDilaps-Sample-Culvert-2025.pdf` },
    ],
  },
  {
    id: "engineering",
    title: "Engineering reports",
    blurb: "Engineer-led assessments that supplement the condition record.",
    items: [
      { name: "DOA — Defect Origin Assessment", desc: "Evidence-based analysis of what caused a defect, and when.", url: `${LIVE}/2025/09/AusDilaps-Sample-DOA-2025.pdf` },
      { name: "SIA — Structural Integrity Assessment", desc: "Evaluation of structural performance and stability.", url: `${LIVE}/2026/04/AusDilaps-Sample-2026-SIA.pdf` },
      { name: "DCA — Defect Comparison Assessment", desc: "Pre- vs post-construction comparison of conditions.", url: `${LIVE}/2025/04/AusDilaps-Sample-Defect-Comparison-Assessment-DCA.pdf` },
    ],
  },
];

const SAMPLES_FAQ: FaqItem[] = [
  {
    q: "Can I see a sample dilapidation report?",
    a: "Yes. We publish real sample reports across every capture type — residential and commercial pre/post-construction surveys, GPS and council-asset surveys, roadway video, tunnels, drone, culvert, and engineering reports (DOA, SIA, DCA). Browse them above.",
  },
  {
    q: "Is there a dilapidation report template or checklist?",
    a: "Every AusDilaps report follows a consistent, AS 4349.0-compliant structure — a description of each property, existing damage and defects recorded with severity and location, location-referenced photography, and a summary of findings with engineer sign-off. Rather than a blank template, our samples show the finished standard.",
  },
  {
    q: "What's included in a dilapidation report?",
    a: "A detailed description of each inspected structure, all existing damage and defects (cracks, settling, movement, leaks, wear), high-resolution geo-referenced photographic and video records, repair or maintenance recommendations where issues are found, and a clear summary signed off by our engineers.",
  },
  {
    q: "Can I get a sample for my specific project type?",
    a: "Yes — request the full sample pack and tell us your project type, and we'll send the most relevant examples along with our capability statement.",
  },
];

export default function SamplesPage() {
  return (
    <>
      <JsonLd data={[faqPageSchema(SAMPLES_FAQ), breadcrumbSchema(CRUMBS)]} />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="Dilapidation Reports · Samples"
        title="Sample dilapidation reports."
        intro="See the standard for yourself. We publish real sample reports across every capture type — from residential and commercial surveys to drone, tunnel, roadway and engineering reports. Every one is AS 4349.0-compliant, with location-referenced imagery and engineer sign-off."
      />

      {/* Jump nav — lets you skip straight to a category instead of scrolling past everything */}
      <section className="border-b border-ad-border py-5">
        <Container>
          <nav aria-label="Sample categories" className="flex flex-wrap gap-x-6 gap-y-2">
            {SAMPLE_GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="text-sm font-medium text-ad-muted transition-colors hover:text-ad-accent"
              >
                {group.title}
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container className="max-w-3xl space-y-14">
          {SAMPLE_GROUPS.map((group) => (
            <div key={group.id} id={group.id} className="scroll-mt-24">
              <Eyebrow className="text-ad-accent">{group.title}</Eyebrow>
              <p className="mt-3 text-ad-muted">{group.blurb}</p>
              <div className="mt-6 divide-y divide-ad-border rounded-xl border border-ad-border bg-white">
                {group.items.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-ad-surface sm:px-6"
                  >
                    <div>
                      <h3 className="font-heading text-[0.95rem] font-semibold text-ad-ink group-hover:text-ad-accent">
                        {s.name}
                      </h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-ad-muted">{s.desc}</p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-ad-accent">View →</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* LiDAR / 3D interactive note */}
      <section className="bg-ad-navy py-16 text-ad-on-dark lg:py-20">
        <Container className="max-w-3xl">
          <Eyebrow className="text-ad-accent-2">Point cloud, LiDAR & 3D</Eyebrow>
          <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-white">
            Interactive LiDAR and digital-twin samples.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ad-on-dark-muted">
            For large or complex assets we capture LiDAR point clouds and build navigable 3D models and
            digital twins — letting you inspect a highway, road corridor or building from any angle.
            Request access and we'll share live interactive examples relevant to your project.
          </p>
        </Container>
      </section>

      <FaqSection items={SAMPLES_FAQ} heading="Sample reports, answered." seeAllHref="/faq" />

      <CtaBand
        eyebrow="See more"
        heading="Want the full sample pack for your project type?"
        subhead="Tell us your project type and we'll send the most relevant samples with our capability statement."
      />
    </>
  );
}
