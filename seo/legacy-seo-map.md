# Legacy SEO map — what the new site must preserve & expand

Source: SEMrush organic positions for ausdilaps.com.au (export 2026-06-13). The live site earns rankings (many #1–#5), AI overviews, featured snippets and local packs across a wide footprint. **Rule: preserve every ranking URL (keep the slug, or 301 precisely) and expand depth — do not consolidate pages that earn traffic.**

## URL-preservation strategy
The live URL patterns are clean (not date-based, except blog posts). **Keep these exact patterns** to avoid rankings decay:
- `/our-services/<slug>/` — service pages
- `/portfolio/<slug>/` — project case studies (was going to be `/projects/` — keep `/portfolio/` or 301 1:1)
- `/dilapidation-reports/` and `/dilapidation-reports/<location>/` — pillar + location pages
- `/dilapidation-reports/samples/` — sample/template hub (ranks for sample/template/format/checklist)
- Sample report PDFs under `/wp-content/uploads/...` rank for "pre construction survey", "property condition survey" etc. → keep equivalent downloadable samples (301 the PDF URLs to new sample pages/files).
- Only the dated blog post (`/2023/05/21/why-are-basix-reports-important/`) needs a clean 301 → `/insights/why-are-basix-reports-important`.

## Pages to keep/build (with primary keyword clusters)

### Powerhouse — `/` (home)
dilapidation reports (#1–2), dilapidation services (#2), dilap report (#1), dilap (#1), dilapidation surveys australia (#3), dilapidation survey/surveyor, what is a dilapidation report, dilapidation report cost, get a dilapidation report, brand terms (ausdilaps #1). Knowledge panel + sitelinks live. Keep home keyword-rich.

### Services — `/our-services/<slug>/` (KEEP DEPTH — these rank)
- `aerial-drone-surveys` — drone surveys, aerial/UAV survey, aerial site inspection (#1 AI overview), drone surveying
- `noise-and-vibration-monitoring-services` — vibration monitoring (+sydney/ground/construction), noise & vibration monitoring
- `structural-engineering` — structural engineers report
- `highways-roads` — road survey (#4), road dilapidation survey
- `defect-origin-assessments-doa` — d.o.a, why doa
- `commercial-dilapidation-reports` — commercial dilapidation report, certified provider, commercial property condition report, checklist
- `residential-dilapidation-reports` — building dilapidation report/survey, site dilapidation report, dilapidation inspection survey
- (industrial dilapidation reports — keep)
> Narrative: these are framed UNDER the dilapidation specialism (Law of Focus stays in the positioning), but each keeps its own SEO page. The earlier "consolidate to one capture-technology page" idea is REVERSED for the high-traffic ones — drone & vibration especially earn real traffic.

### Pillar + locations — `/dilapidation-reports/...`
- `/dilapidation-reports/` — what is a dilapidation report, meaning
- `/dilapidation-reports/dilapidation-reports-sydney/` — dilapidation report(s) sydney, qualified dilapidation surveyor
- `.../dilapidation-reports-brisbane/` — dilapidation report brisbane
- `.../dilapidation-reports-melbourne/` — dilapidation report melbourne
- `.../dilapidation-reports-wollongong/` — dilapidation, before construction
- (Perth ranks via home/service pages → add a Perth page; Canberra worth adding)
- `/dilapidation-reports/samples/` — sample/template/format/checklist, site/road dilapidation report

### Projects — `/portfolio/<slug>/` (all 22; these rank for project-name queries)
northwest-rail-link (nw rail link, norwest link, sydney metro north west, rail link), northconnex (m11 tunnel/motorway, northconnex route/tunnel, tunnel distance), barangaroo-south, brisbane-airport (brisbane airport corp/expansion, who owns brisbane airport), mona-vale-road-upgrade (mona vale road), port-botany-bulk-liquids-berth (bulk liquids berth), the-northern-road-upgrade (bringelly road), westconnex + the rest.

### Knowledge / informational (build a real hub + FAQ with schema)
what is a dilapidation report, dilapidation report cost, sample/template/format/checklist, pre construction survey, pre/property/construction condition survey, before construction, surveyor qualifications. → FAQPage + Article schema to win the AI overviews & snippets already showing.

### Insights / Advocacy pillar (the "trailblazer" play)
BASIX post (rebuilt) + NEW advocacy content: **the case for compulsory dilapidation reports, state-by-state requirements, the NSW model.** This is the category-authority + lobbying platform. Targets informational + advocacy intent and positions AusDilaps as the standard-setter.

## AEO / SERP features to target (already in play on these terms)
AI overviews, featured snippets, People-also-ask, local packs, image/video packs, knowledge panel. → comprehensive JSON-LD (Organization, LocalBusiness per location, Service, FAQPage, HowTo, Article, BreadcrumbList), concise snippet-ready answers, image alt + sitemaps.

## Migration checklist
1. Build full page depth above (services, locations, projects, knowledge, advocacy).
2. Preserve slugs; 301 only where a URL must change (dated blog post, PDF samples).
3. `data/redirects.ts` built from this map; verify each with `curl -I`.
4. Keep GA4 `G-81JV6BQ2R5`; submit new sitemap in Search Console; monitor the ranking URLs above through cutover.
