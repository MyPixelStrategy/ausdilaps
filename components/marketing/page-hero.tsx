import type { ReactNode } from "react";
import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { Button } from "@/components/ui/button";
import { QUOTE_HREF } from "@/lib/site";

/**
 * Standard interior-page hero: breadcrumbs + eyebrow + h1 + lead + CTAs.
 * Used by every service / location / content page so the top of the page is
 * consistent with the dilapidation pillar.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  actions,
}: {
  crumbs?: Crumb[];
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  /** Override the default CTA pair. */
  actions?: ReactNode;
}) {
  return (
    <section className="border-b border-ad-border py-16 lg:py-20">
      <Container className="max-w-3xl">
        {crumbs && <Breadcrumbs crumbs={crumbs} />}
        <Eyebrow className="mt-6 text-ad-accent">{eyebrow}</Eyebrow>
        <h1 className="mt-5 text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-ad-ink sm:text-5xl">
          {title}
        </h1>
        {typeof intro === "string" ? (
          <p className="mt-6 text-lg leading-relaxed text-ad-muted">{intro}</p>
        ) : (
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ad-muted">{intro}</div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {actions ?? (
            <>
              <Button href={QUOTE_HREF} size="lg" variant="accent">
                Request a Quote
              </Button>
              <Button href={QUOTE_HREF} size="lg" variant="outline">
                Download Capability Statement
              </Button>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
