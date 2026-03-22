# DES-004: Watermark style inconsistent across pages — 5 different implementations

**Priority:** P2
**Area:** Sitewide (15+ pages)
**Type:** Design consistency violation
**Impact:** Brand perception on Reddit screenshots — watermarks appear in every shared image

---

## Problem

The on-page watermark ("razzle.lol" fixed in bottom-right) is implemented **5 different ways** across the site. Since watermarks appear on every screenshot shared to Reddit — the primary growth channel — inconsistency here directly undermines the "polished, intentional" brand feeling.

### The 5 implementations

| Variant | Font | Color | Opacity | z-index | Size | Pages |
|---------|------|-------|---------|---------|------|-------|
| A | `--font-hand` | `--ink-faint` | none | 1 | 14px | archetypes, auction, dashboard, tiers |
| B | `--font-hand` | `--ink-faint` | none | 1 | **13px** | cheatsheet, rosterbuilder, scoring, tools |
| C | **`--font-mono`** | `--ink-faint` | **0.5** | 10 | 14px | compare, player |
| D | **`--font-display`** | **`--ink`** | **0.25** | **90** | **16px** | lab |
| E | `--font-hand` (inline) | **`--ink-light`** | **0.7** | **999** | 14px | tradevalues |

Additionally, matchups.html uses z-index 999 (same as variant E but with `--ink-faint`).

### What's wrong

- **3 different fonts** — `--font-hand`, `--font-mono`, `--font-display`
- **3 different colors** — `--ink-faint`, `--ink-light`, `--ink`
- **4 different opacity values** — none, 0.25, 0.5, 0.7
- **4 different z-indexes** — 1, 10, 90, 999
- **3 different font sizes** — 13px, 14px, 16px
- Some use dedicated CSS classes, tradevalues uses inline styles

## Expected (per DESIGN.md)

DESIGN.md Voice & Copy section specifies: `Watermark: "razzle.lol — let's razzle dazzle em baby"`

The watermark is a brand personality element, so per DESIGN.md:
- Font should be `--font-hand` (Caveat) — personality/voice lives in Caveat
- Color should be `--ink-faint` — subtle, not competing with content
- Consistent opacity, size, and z-index across all pages

## Fix

1. Add a single `.watermark` class to `styles.css` with the canonical style
2. Replace all page-specific watermark classes and inline styles with the shared class
3. Standardize to: `--font-hand`, 14px, `--ink-faint`, no extra opacity, z-index 1, bottom 10px right 14px

### Files to update
- `frontend/styles.css` — add canonical `.watermark` rule
- `frontend/compare.html` — replace `.watermark` (mono font, opacity 0.5)
- `frontend/player.html` — replace `.watermark` (mono font, opacity 0.5)
- `frontend/lab.html` — replace `.watermark` (display font, ink color, opacity 0.25)
- `frontend/tradevalues.html` — replace inline style div
- `frontend/matchups.html` — replace `.matchups-watermark` (z-index 999)
- `frontend/cheatsheet.html` — replace `.cs-watermark` (13px)
- `frontend/rosterbuilder.html` — replace `.rb-watermark` (13px)
- `frontend/scoring.html` — replace `.sc-watermark` (13px)
- `frontend/tools.html` — replace `.tools-watermark` (13px)
- `frontend/archetypes.html` — replace `.ar-watermark`
- `frontend/auction.html` — replace `.av-watermark`
- `frontend/dashboard.html` — replace `.db-watermark`
- `frontend/tiers.html` — replace `.tl-watermark`

### Verification
- Open any 3 pages side by side — watermark should look identical on all
- Export PNG from trade values and compare — watermark should match
- Check dark mode — watermark should still be visible but subtle
