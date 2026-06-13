import Link from "next/link";
import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ad-border bg-white/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-heading text-lg font-bold tracking-tight text-ad-ink"
        >
          Aus<span className="text-ad-blue">Dilaps</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ad-muted transition-colors hover:text-ad-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="hidden text-sm font-medium text-ad-muted transition-colors hover:text-ad-ink lg:block"
          >
            {SITE.phone}
          </a>
          <Button href="#contact" size="sm" variant="accent">
            Request a Quote
          </Button>
        </div>
      </Container>
    </header>
  );
}
