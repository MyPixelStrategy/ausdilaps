import Link from "next/link";
import { Container } from "./container";
import { SITE } from "@/lib/site";

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <div className="font-heading text-xs font-medium uppercase tracking-[0.18em] text-ad-on-dark-muted">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm text-white/85 transition-colors hover:text-ad-accent-2">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ad-navy-deep text-ad-on-dark">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="font-heading text-xl font-bold">AusDilaps</div>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ad-on-dark-muted">
              {SITE.descriptor}
            </p>
            <p className="mt-4 max-w-xs text-sm text-ad-on-dark-muted">
              Pre- and post-construction building condition reports that hold up when
              a damage claim is made. Compliant with {SITE.standard}.
            </p>
          </div>
          <FooterCol
            title="Services"
            links={[
              ["Dilapidation Reports", "#services"],
              ["Structural Integrity (SIA)", "#services"],
              ["Defect Origin (DOA)", "#services"],
              ["Defect Comparison (DCA)", "#services"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["Projects", "#projects"],
              ["Process", "#process"],
              ["About", "#about"],
              ["Request a Quote", "#contact"],
            ]}
          />
          <div>
            <div className="font-heading text-xs font-medium uppercase tracking-[0.18em] text-ad-on-dark-muted">
              Contact
            </div>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-4 block text-sm text-white/85 transition-colors hover:text-ad-accent-2"
            >
              {SITE.email}
            </a>
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="mt-1.5 block text-sm text-white/85 transition-colors hover:text-ad-accent-2"
            >
              {SITE.phone}
            </a>
            <p className="mt-1.5 text-sm text-ad-on-dark-muted">{SITE.address}</p>
          </div>
        </div>

        <div className="rule-hairline-dark my-10" />

        <div className="flex flex-col gap-2 text-xs text-ad-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE.legalName} T/A AusDilaps · ABN {SITE.abn}</p>
          <p>A company of the Urban Pulse group · Professional Indemnity &amp; Public Liability insured</p>
        </div>
      </Container>
    </footer>
  );
}
