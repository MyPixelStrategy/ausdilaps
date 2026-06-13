# Content backlog — News/Insights + service targets (future)

Grounded target list for the expansive content/news engine. Tie every topic back to the dilapidation/condition-report service (adjoining-property documentation, dispute defence, evidence standards).

## Tunnel projects (high-value — major dilapidation work along the alignment)
**Sydney**
- WestConnex (M4 East, M8, M4–M5 Link, Rozelle Interchange)
- NorthConnex (already a portfolio project)
- Sydney Metro (City & Southwest, West, Western Sydney Airport)
- Western Harbour Tunnel
- M6 Stage 1
- Beaches Link (proposed)

**Melbourne**
- Metro Tunnel
- West Gate Tunnel
- North East Link
- Suburban Rail Loop (tunnelled sections)

> Action: dedicated project/case-study + insight content for tunnel works — "why tunnel projects need dilapidation surveys on every adjoining property," vibration/settlement monitoring angle, georeferenced evidence.

## Major projects / pipeline
- **Brisbane 2032 Olympics** — venues + transport pipeline (Cross River Rail, Brisbane Metro, stadium/precinct works)
- State infrastructure programmes (road/rail upgrades)

## Natural events (timely, high-search; damage-documentation angle)
- Earthquakes, storm seasons, cyclones, floods → post-event condition reports, insurance/dispute evidence

## Knowledge / informational (the long tail that already ranks)
- What is a dilapidation report · cost · samples/templates/checklists · pre-construction vs post-construction

## Standards & advocacy (category-authority play)
- The case for compulsory dilapidation reporting (the NSW model), state-by-state requirements, AS 4349.0, evidence standards

> When building the News engine, run a grounded research pass (verify current project status/dates) before publishing — keep it factual.

## Sample-report hosting (action required before domain cutover)
The `/dilapidation-reports/samples` page links sample PDFs at their **live WordPress URLs** (`https://ausdilaps.com.au/wp-content/uploads/...`) as an interim. These are ~164MB total — too heavy to commit to git, and v1 has no R2/storage.
**The old WP site will be taken down**, so a permanent home is needed. Options for the future solution:
- Host the curated sample PDFs in Supabase Storage (a public bucket) and point the samples page at those URLs; OR
- Commit compressed/optimised versions (ghostscript downsample to <2MB each) into `public/samples/`; OR
- Gate the full sample pack behind the quote form (lead capture) and host via storage.
Until then, the samples page links the live URLs. **Re-point these links before cutover** (otherwise they 404 once `/wp-content/uploads/` no longer exists on the new domain).
