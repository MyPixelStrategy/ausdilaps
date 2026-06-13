import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { name: string; path: string };

/**
 * Visual breadcrumb trail. Pass the SAME crumbs array to breadcrumbSchema() so
 * the rendered trail and the JSON-LD never drift. The last crumb renders as
 * plain text (the current page).
 */
export function Breadcrumbs({
  crumbs,
  className,
}: {
  crumbs: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-ad-muted", className)}>
      <ol className="flex flex-wrap items-center gap-x-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-x-1">
              {last ? (
                <span className="text-ad-ink" aria-current="page">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.path} className="transition-colors hover:text-ad-ink">
                    {c.name}
                  </Link>
                  <span className="px-1 text-ad-border" aria-hidden="true">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
