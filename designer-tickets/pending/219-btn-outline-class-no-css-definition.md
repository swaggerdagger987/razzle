# DES-219: .btn and .btn-outline classes have zero CSS — unstyled buttons on 8 pages

**Priority**: P1 (Visual quality — buttons render as browser defaults)
**Pages**: breakdown.html, regression.html, strengths.html, weeklyleaders.html, career.html, career-compare.html, draftclass.html, percentiles.html
**Category**: Design system gap

## The Problem

Two CSS classes are used in HTML but have NO definition in styles.css, lab-panels.css, or any other stylesheet:

**`.btn-outline`** — used on 4 pages for Export PNG and error retry buttons:
- breakdown.html:374 — `<button class="btn btn-outline" id="bdExport">Export PNG</button>`
- regression.html:356 — `<button class="btn btn-outline" id="regExport">Export PNG</button>`
- strengths.html:441 — `<button class="btn btn-outline" id="swExport">Export PNG</button>`
- weeklyleaders.html:310 — `<button class="btn btn-outline" id="wlExport">Export PNG</button>`
- Same 4 pages also use `btn btn-outline` in error retry buttons (e.g., breakdown.html:587)

**`.btn`** — used as a base class on all 8 pages listed above. Has zero CSS definition.

For `class="btn btn-primary"` (career.html, career-compare.html, draftclass.html, percentiles.html), `.btn-primary` IS defined so those buttons look correct — `.btn` is dead weight.

For `class="btn btn-outline"`, NEITHER class is defined. These buttons render as unstyled browser defaults — no padding, no border, no font family, no cursor change. They look broken.

## Evidence

```
grep -r "\.btn-outline" frontend/*.css  → 0 results
grep -r "\.btn[^-]" frontend/*.css      → 0 results (no standalone .btn selector)
grep -r "class=\"btn " frontend/*.html  → 12 instances across 8 files
```

Compare: awards.html:624 correctly uses `class="btn-chunky"` for its retry button. The design system has `.btn-chunky` and `.btn-primary` — these 8 pages use a non-existent `.btn` system instead.

## The Fix

Option A (preferred): Replace `btn btn-outline` with `btn-chunky` and `btn btn-primary` with `btn-primary` across all 8 files. Remove dead `.btn` class references.

Option B: Define `.btn` and `.btn-outline` in styles.css matching the chunky design system (3px border, ink color, 8px radius, offset shadow on hover).

## Why This Matters

Export PNG buttons are marketing tools — every export carries the watermark. If the Export button looks broken (unstyled browser default), users won't click it. Error retry buttons that look unstyled make the error state feel even more broken.
