import type { ReactNode } from "react";
import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { cn } from "@/lib/utils";

export type SectionVariant = "light" | "surface" | "dark";
export type SectionLayout = "stack" | "split";
export type SectionCard = { title: string; body: string; n?: string };

export type ContentSectionData = {
  id?: string;
  eyebrow: string;
  heading: string;
  body?: string;
  bullets?: string[];
  cards?: SectionCard[];
  chips?: string[];
  layout?: SectionLayout;
  variant?: SectionVariant;
};

/**
 * Data-driven content band. Encodes the dilapidation pillar's section rhythm
 * (light → surface → dark) so service / location pages stay visually identical
 * to the gold template without bespoke per-page markup.
 */
export function ContentSection({
  id,
  eyebrow,
  heading,
  body,
  bullets,
  cards,
  chips,
  layout = "stack",
  variant = "light",
  className,
  children,
}: ContentSectionData & { className?: string; children?: ReactNode }) {
  const dark = variant === "dark";
  const sectionBg =
    variant === "surface" ? "bg-ad-surface" : dark ? "bg-ad-navy text-ad-on-dark" : "";

  const headingBlock = (
    <div className={layout === "split" ? "" : "max-w-2xl"}>
      <Eyebrow className={dark ? "text-ad-accent-2" : "text-ad-accent"}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          "mt-5 font-heading text-3xl font-semibold tracking-tight",
          dark ? "text-white" : "text-ad-ink"
        )}
      >
        {heading}
      </h2>
      {body && (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed",
            dark ? "text-ad-on-dark-muted" : "text-ad-muted"
          )}
        >
          {body}
        </p>
      )}
    </div>
  );

  const cardsBlock = cards && (
    <div
      className={cn(
        "grid gap-6",
        cards.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3",
        dark && "gap-px overflow-hidden rounded-xl bg-white/10"
      )}
    >
      {cards.map((c) => (
        <div
          key={c.title}
          className={cn(
            "p-6",
            dark ? "bg-ad-navy" : "rounded-xl border border-ad-border bg-white"
          )}
        >
          {c.n ? (
            <div className={cn("font-heading text-sm font-bold", dark ? "text-ad-accent-2" : "text-ad-accent")}>
              {c.n}
            </div>
          ) : (
            !dark && <div className="rule-accent mb-4 w-10" />
          )}
          <h3
            className={cn(
              "font-heading text-lg font-semibold",
              c.n ? "mt-3" : "",
              dark ? "text-white" : "text-ad-ink"
            )}
          >
            {c.title}
          </h3>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed",
              dark ? "text-ad-on-dark-muted" : "text-ad-muted"
            )}
          >
            {c.body}
          </p>
        </div>
      ))}
    </div>
  );

  const bulletsBlock = bullets && (
    <ul className="space-y-4">
      {bullets.map((t) => (
        <li
          key={t}
          className={cn(
            "flex gap-3 rounded-lg border p-4",
            dark ? "border-ad-border-dark bg-white/5" : "border-ad-border bg-white"
          )}
        >
          <span className={cn("mt-0.5 font-heading text-sm font-bold", dark ? "text-ad-accent-2" : "text-ad-accent")}>
            →
          </span>
          <span className={cn("text-[0.95rem]", dark ? "text-white" : "text-ad-ink")}>{t}</span>
        </li>
      ))}
    </ul>
  );

  const chipsBlock = chips && (
    <div className="flex flex-wrap gap-2.5">
      {chips.map((m) => (
        <span
          key={m}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium",
            dark
              ? "border-ad-border-dark bg-white/5 text-white"
              : "border-ad-border bg-ad-surface text-ad-ink"
          )}
        >
          {m}
        </span>
      ))}
    </div>
  );

  return (
    <section id={id} className={cn("py-20 lg:py-24", sectionBg, id && "scroll-mt-20", className)}>
      <Container className={layout === "split" ? "grid gap-12 lg:grid-cols-2 lg:items-start" : undefined}>
        {layout === "split" ? (
          <>
            {headingBlock}
            <div>{bulletsBlock ?? chipsBlock ?? cardsBlock ?? children}</div>
          </>
        ) : (
          <>
            {headingBlock}
            {(cards || bullets || chips || children) && (
              <div className="mt-10">{cardsBlock ?? bulletsBlock ?? chipsBlock ?? children}</div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
