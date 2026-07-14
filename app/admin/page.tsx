import { Button } from "@/components/ui/button";

const TOOLS = [
  {
    title: "Property Sizing Tool",
    description:
      "Paste addresses or upload a screenshot to get sizing estimates from QLD cadastre data.",
    href: "/admin/property-sizing",
  },
  {
    title: "KML Path Builder",
    description:
      "Enter or upload survey path coordinates and download a ready-to-use .kml file.",
    href: "/admin/kml-builder",
  },
];

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-xs uppercase tracking-[0.15em] text-ad-steel">AusDilaps · Field Tools</p>
      <h1 className="mt-1 text-3xl font-semibold text-ad-ink">Staff Tools</h1>
      <p className="mt-2 max-w-2xl text-ad-muted">
        Internal tools for the AusDilaps team. Pick a tool below to get started.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <div
            key={tool.href}
            className="flex flex-col rounded-xl border border-ad-border bg-white p-6 transition-colors hover:border-ad-steel"
          >
            <h2 className="text-lg font-semibold text-ad-ink">{tool.title}</h2>
            <p className="mt-2 flex-1 text-sm text-ad-muted">{tool.description}</p>
            <Button href={tool.href} variant="outline" size="sm" className="mt-4 self-start">
              Open tool
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}
