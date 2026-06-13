import Link from "next/link";
import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { cn } from "@/lib/utils";

export type RelatedLink = { label: string; href: string; description?: string };

/**
 * Cross-link grid for internal linking / SEO (related services, local projects).
 * Light section by default; pass variant="surface" to alternate against a
 * preceding white band.
 */
export function RelatedLinks({
  eyebrow = "Keep exploring",
  heading,
  links,
  variant = "surface",
}: {
  eyebrow?: string;
  heading: string;
  links: RelatedLink[];
  variant?: "light" | "surface";
}) {
  if (!links.length) return null;
  return (
    <section className={cn("py-20 lg:py-24", variant === "surface" && "bg-ad-surface")}>
      <Container>
        <div className="max-w-2xl">
          <Eyebrow className="text-ad-accent">{eyebrow}</Eyebrow>
          <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-ad-ink">
            {heading}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex flex-col rounded-xl border border-ad-border bg-white p-6 transition-colors hover:border-ad-accent/40"
            >
              <span className="font-heading text-base font-semibold text-ad-ink group-hover:text-ad-accent">
                {l.label}
              </span>
              {l.description && (
                <span className="mt-2 text-sm leading-relaxed text-ad-muted">{l.description}</span>
              )}
              <span className="mt-4 text-sm font-medium text-ad-accent">Explore →</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
