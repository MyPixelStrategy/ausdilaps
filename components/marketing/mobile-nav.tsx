"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV, SITE, QUOTE_HREF } from "@/lib/site";
import {
  SERVICES_PILLAR,
  SERVICES_DILAPIDATION,
  SERVICES_SPECIALIST,
  SERVICES_UTILITY,
} from "@/lib/nav";

/**
 * Mobile navigation drawer. Renders the hamburger trigger (md:hidden) and a
 * full-width panel below the 64px sticky header. Reuses brand tokens only.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  // Close the drawer and collapse the Services accordion together.
  const closeDrawer = () => {
    setOpen(false);
    setServicesOpen(false);
  };

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setServicesOpen(false);
      }
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
        onClick={() => (open ? closeDrawer() : setOpen(true))}
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
            onClick={closeDrawer}
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
              {NAV.map((item) =>
                item.menu === "services" ? (
                  <div key={item.href} className="border-b border-ad-border">
                    <button
                      type="button"
                      onClick={() => setServicesOpen((v) => !v)}
                      aria-expanded={servicesOpen}
                      aria-controls="mobile-services-submenu"
                      className="flex w-full items-center justify-between py-4 font-heading text-lg font-medium text-ad-ink transition-colors hover:text-ad-accent"
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                        aria-hidden="true"
                      />
                    </button>
                    {servicesOpen && (
                      <div id="mobile-services-submenu" className="pb-3">
                        <Link
                          href={SERVICES_PILLAR.href}
                          onClick={closeDrawer}
                          className="block py-2 font-heading text-base font-semibold text-ad-steel transition-colors hover:text-ad-steel-dark"
                        >
                          {SERVICES_PILLAR.label}
                        </Link>
                        {[...SERVICES_DILAPIDATION, ...SERVICES_SPECIALIST].map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            onClick={closeDrawer}
                            className="block py-2 pl-3 text-sm text-ad-muted transition-colors hover:text-ad-ink"
                          >
                            {l.label}
                          </Link>
                        ))}
                        {SERVICES_UTILITY.map((l) => (
                          <Link
                            key={l.href}
                            href={l.href}
                            onClick={closeDrawer}
                            className="block py-2 text-sm font-medium text-ad-muted transition-colors hover:text-ad-steel"
                          >
                            {l.label} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className="border-b border-ad-border py-4 font-heading text-lg font-medium text-ad-ink transition-colors hover:text-ad-accent"
                  >
                    {item.label}
                  </Link>
                )
              )}
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                onClick={closeDrawer}
                className="py-4 text-sm font-medium text-ad-muted transition-colors hover:text-ad-ink"
              >
                Call {SITE.phone}
              </a>
              <Button
                href={QUOTE_HREF}
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
