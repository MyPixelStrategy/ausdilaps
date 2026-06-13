"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV, SITE } from "@/lib/site";

/**
 * Mobile navigation drawer. Renders the hamburger trigger (md:hidden) and a
 * full-width panel below the 64px sticky header. Reuses brand tokens only.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-ad-ink transition-colors hover:bg-ad-surface"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-40 cursor-default bg-ad-ink/30 backdrop-blur-sm"
          />
          {/* Panel */}
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-x-0 top-16 z-50 border-b border-ad-border bg-white/98 backdrop-blur-md"
          >
            <nav className="flex flex-col px-6 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-ad-border py-4 font-heading text-lg font-medium text-ad-ink transition-colors hover:text-ad-accent"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                onClick={() => setOpen(false)}
                className="py-4 text-sm font-medium text-ad-muted transition-colors hover:text-ad-ink"
              >
                Call {SITE.phone}
              </a>
              <Button
                href="#contact"
                size="lg"
                variant="accent"
                className="mt-2 w-full"
              >
                Request a Quote
              </Button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
