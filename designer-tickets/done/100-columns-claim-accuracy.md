<!-- PM: ready -->
---
id: DES-347
priority: P1
area: home page, about page, meta tags
section: marketing claims
type: content accuracy
status: open
---

# "100+ stat columns" marketing claim — NFL screener has 87 columns

## What's wrong

The hero, feature cards, pricing section, about page, and meta descriptions all claim "100+ stat columns." The actual COLUMNS object in lab.js (line 778) defines 87 NFL columns. The College universe adds 28 and Prospects adds 36, totaling ~151 across all three views — but users in the default NFL view see 87 columns, not 100+.

A Reddit power user who counts columns in the NFL screener will find 87, not 100+. This is the kind of claim r/DynastyFF will verify and call out.

## Where

- `frontend/index.html` line 645: hero "100+ stat columns"
- `frontend/index.html` line 695: feature card "100+ Stat Columns"
- `frontend/index.html` line 797: pricing "100+ stat columns, 10 seasons of data"
- `frontend/about.html` line 218: "100+ stat columns, 70+ analytical panels"
- `frontend/about.html` line 9: meta "70+ analytics tools" (different claim entirely)
- `frontend/index.html` line 34: JSON-LD structured data doesn't make column claim but site description does

## Evidence

lab.js COLUMNS object: 87 entries (line 778-963)
lab.js COLLEGE_COLUMNS: 28 entries (line 722-757)
lab.js PROSPECT_COLUMNS: 36 entries (line 651-687)
Total across all universes: ~151

## Suggested fix

Option A: Change claim to "85+ NFL stat columns" (accurate for NFL view)
Option B: Change claim to "150+ stat columns across NFL, college, and prospects" (accurate total)
Option C: Add 13+ more NFL columns to actually reach 100+ (e.g., snap count, redzone targets, air yards per game, etc.)

Also fix about.html meta (line 9) which says "70+ analytics tools" — should match whatever the canonical claim is.

## Why this matters

Trust. Fantasy football communities verify everything. One angry post about inflated claims damages the brand permanently. Better to understate and overdeliver.
