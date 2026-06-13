"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatInsightDate } from "@/lib/format";
import type { InsightMeta, InsightCategory } from "@/lib/insights";

export function InsightsGrid({
  insights,
  categories,
}: {
  insights: InsightMeta[];
  categories: readonly InsightCategory[];
}) {
  const [active, setActive] = useState<InsightCategory | "All">("All");
  const filtered = active === "All" ? insights : insights.filter((i) => i.category === active);
  const chips: (InsightCategory | "All")[] = ["All", ...categories];

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {chips.map((c) => {
          const count = c === "All" ? insights.length : insights.filter((i) => i.category === c).length;
          if (count === 0) return null;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active === c
                  ? "border-ad-accent bg-ad-accent text-white"
                  : "border-ad-border bg-white text-ad-ink hover:border-ad-accent/40"
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => (
          <Link
            key={i.slug}
            href={`/insights/${i.slug}`}
            className="group flex flex-col rounded-xl border border-ad-border bg-white p-7 transition-colors hover:border-ad-accent/40"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-ad-accent">
              {i.category}
            </span>
            <h3 className="mt-3 font-heading text-lg font-semibold text-ad-ink group-hover:text-ad-accent">
              {i.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ad-muted">{i.excerpt}</p>
            <span className="mt-5 text-xs text-ad-muted">{formatInsightDate(i.date)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
