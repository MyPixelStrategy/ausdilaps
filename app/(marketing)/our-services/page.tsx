import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/marketing/container";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { PageHero } from "@/components/marketing/page-hero";
import { CtaBand } from "@/components/marketing/cta-band";
import { JsonLd } from "@/components/seo/json-ld";
import { SERVICES_CONTENT } from "@/data/services";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/our-services" },
];

export const metadata: Metadata = {
  title: "Our Services | Dilapidation, Structural & Specialist Building Inspections",
  description:
    "AusDilaps' specialist services — dilapidation reports (commercial, residential, industrial), structural engineering, aerial drone surveys, noise & vibration monitoring, defect assessments and road condition reports.",
  alternates: { canonical: "/our-services" },
};

export default function ServicesIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          itemListSchema([
            { name: "Dilapidation Reports", path: "/dilapidation-reports" },
            ...SERVICES_CONTENT.map((s) => ({ name: s.schemaName, path: `/our-services/${s.slug}` })),
          ]),
          breadcrumbSchema(CRUMBS),
        ]}
      />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="Our Services"
        title="Specialist reports, backed by chartered engineering."
        intro="Every service is framed under one specialism — dilapidation. From a single residential build to billion-dollar infrastructure, we match the right method and the right engineer to the asset, so the record holds up when a claim is made."
      />

      {/* Flagship pillar */}
      <section className="py-20 lg:py-24">
        <Container>
          <Link
            href="/dilapidation-reports"
            className="group block overflow-hidden rounded-2xl border border-ad-border bg-ad-navy text-ad-on-dark"
          >
            <div className="blueprint-grid">
              <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div>
                  <Eyebrow className="text-ad-accent-2">Flagship</Eyebrow>
                  <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-white">
                    Dilapidation Reports
                  </h2>
                  <p className="mt-3 max-w-xl text-ad-on-dark-muted">
                    Pre- and post-construction building condition reports that document existing
                    conditions and provide a defensible baseline — residential, commercial and
                    infrastructure.
                  </p>
                </div>
                <div className="lg:text-right">
                  <span className="font-heading text-base font-semibold text-ad-accent-2 group-hover:brightness-110">
                    Explore dilapidation reports →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </Container>
      </section>

      {/* Service grid */}
      <section className="bg-ad-surface py-20 lg:py-24">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow className="text-ad-accent">The full suite</Eyebrow>
            <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-ad-ink">
              Specialist services across every asset.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES_CONTENT.map((s) => (
              <Link
                key={s.slug}
                href={`/our-services/${s.slug}`}
                className="group flex flex-col rounded-xl border border-ad-border bg-white p-7 transition-colors hover:border-ad-accent/40"
              >
                <span className="self-start rounded-full bg-ad-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-ad-muted">
                  {s.eyebrow}
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-ad-ink group-hover:text-ad-accent">
                  {s.h1}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ad-muted">{s.summary}</p>
                <span className="mt-6 text-sm font-medium text-ad-accent">Learn more →</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand eyebrow="Let's work together" />
    </>
  );
}
