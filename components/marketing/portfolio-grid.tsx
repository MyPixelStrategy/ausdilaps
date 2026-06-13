"use client";

import { useState } from "react";
import { PortfolioCard } from "./portfolio-card";
import { cn } from "@/lib/utils";
import type { PortfolioItem, Sector } from "@/data/portfolio";

/** Filterable portfolio grid (client island). Filters by sector. */
export function PortfolioGrid({
  projects,
  sectors,
}: {
  projects: PortfolioItem[];
  sectors: readonly Sector[];
}) {
  const [active, setActive] = useState<Sector | "All">("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.sector === active);

  const chips: (Sector | "All")[] = ["All", ...sectors];

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {chips.map((c) => {
          const count = c === "All" ? projects.length : projects.filter((p) => p.sector === c).length;
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
              <span className={cn("ml-1.5", active === c ? "text-white/70" : "text-ad-muted")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PortfolioCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
