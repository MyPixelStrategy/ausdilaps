import Link from "next/link";
import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import type { FaqItem } from "@/data/faq";

/**
 * The bare accordion list of question/answer <details> rows. No JS needed —
 * native disclosure. Used directly by the /faq page (grouped by category) and
 * wrapped by <FaqSection> on service / pillar pages.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.q} className="group border-b border-ad-border py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-ad-ink [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="shrink-0 text-xl leading-none text-ad-accent transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ad-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/**
 * Full FAQ band (surface) with heading + optional "see all" link. Emits no
 * schema itself — the page passes the same items to faqPageSchema().
 */
export function FaqSection({
  items,
  eyebrow = "Common questions",
  heading,
  seeAllHref = "/faq",
}: {
  items: FaqItem[];
  eyebrow?: string;
  heading: string;
  seeAllHref?: string | null;
}) {
  return (
    <section className="bg-ad-surface py-20 lg:py-24">
      <Container className="max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow className="text-ad-accent">{eyebrow}</Eyebrow>
            <h2 className="mt-5 font-heading text-3xl font-semibold tracking-tight text-ad-ink">
              {heading}
            </h2>
          </div>
          {seeAllHref && (
            <Link
              href={seeAllHref}
              className="text-sm font-medium text-ad-accent hover:brightness-90"
            >
              See all FAQs →
            </Link>
          )}
        </div>
        <div className="mt-8">
          <FaqList items={items} />
        </div>
      </Container>
    </section>
  );
}
