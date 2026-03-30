# DES-206: No <meta name="format-detection"> — mobile Safari auto-links stat numbers

**Priority**: P2
**Category**: Mobile UX
**Affects**: All 75 pages — every page with stat data
**Cycle**: 19

## Problem

Zero instances of `<meta name="format-detection" content="telephone=no">` across all 75 pages. Mobile Safari's auto-detection heuristic scans page content for patterns that look like phone numbers and converts them to blue, clickable telephone links. Fantasy football stat tables are full of number patterns that can trigger this:

- Player stat lines: "238-1,024-7" (carries-yards-TDs)
- Draft picks: "2025 1.05" or "2024-2025"
- Scoring formats: "0.5 PPR" or "1-0-0"
- Any multi-digit numbers near hyphens or periods

When triggered, these numbers become blue underlined links that break the visual design (blue instead of espresso ink) and are tappable — tapping a "phone number" in a stat table opens the iOS dialer.

## Evidence

Verified in cycle 16: "sitewide format-detection meta audit — zero instances"

Grep confirms: zero `format-detection` anywhere in the frontend.

The issue is particularly bad on:
- Lab screener (100+ stat columns, many numeric)
- Panel pages (trade values, efficiency rankings, scoring comparisons)
- Trade Analyzer (numeric values displayed prominently)
- Bureau league data (standings, records, scores)

## Fix

Add to the `<head>` of all 75 pages:
```html
<meta name="format-detection" content="telephone=no">
```

Or add to the shared `<head>` template if one exists. This is a one-line-per-file fix.

Also consider adding:
```html
<meta name="format-detection" content="telephone=no, date=no, email=no, address=no">
```
To prevent all auto-detection behaviors on data-heavy pages.

## Why it matters

Mobile traffic from Twitter/Reddit is the primary acquisition channel. A dynasty manager tapping a Screener link from a tweet and seeing blue phone-number links on stat values = "this tool is broken on my phone." iOS Safari is the most common mobile browser for the target demographic (22-40, tech-comfortable). This is a zero-cost fix that prevents a jarring mobile experience.
