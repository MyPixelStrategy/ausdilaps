import type { Metadata } from "next";
import { Container } from "@/components/marketing/container";
import { Eyebrow } from "@/components/marketing/eyebrow";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ, FAQ_FLAT } from "@/data/faq";
import { faqPageSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dilapidation Reports FAQ — Your Questions Answered",
  description:
    "Answers to common questions about dilapidation reports, structural engineering, BASIX and NatHERS assessments — from AusDilaps, Australia's specialist building inspection firm.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          faqPageSchema(FAQ_FLAT),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      <section className="border-b border-ad-border py-16 lg:py-20">
        <Container className="max-w-3xl">
          <Eyebrow className="text-ad-accent">Frequently Asked Questions</Eyebrow>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-ad-ink sm:text-5xl">
            Dilapidation reports, answered.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ad-muted">
            Clear answers on dilapidation and building condition reports, structural
            engineering, BASIX and NatHERS. Have a question that isn&apos;t here?{" "}
            <a href="#contact" className="font-medium text-ad-accent hover:brightness-90">
              Talk to our team.
            </a>
          </p>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container className="max-w-3xl space-y-14">
          {FAQ.map((category) => (
            <div key={category.id} id={category.id} className="scroll-mt-24">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-ad-ink">
                {category.title}
              </h2>
              <div className="rule-accent mt-3 w-12" />
              <div className="mt-6">
                {category.items.map((item) => (
                  <details key={item.q} className="group border-b border-ad-border py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-ad-ink [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="shrink-0 text-xl leading-none text-ad-accent transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-ad-muted">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section id="contact" className="scroll-mt-20 bg-ad-navy-deep">
        <div className="blueprint-grid">
          <Container className="py-16 text-center lg:py-20">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Still have a question about your project?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ad-on-dark-muted">
              Tell us about it and we&apos;ll scope your dilapidation report within 48 hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/#contact" size="lg" variant="onDarkAccent">
                Request a Quote
              </Button>
              <Button href="/#contact" size="lg" variant="onDarkOutline">
                Download Capability Statement
              </Button>
            </div>
          </Container>
        </div>
      </section>
    </>
  );
}
