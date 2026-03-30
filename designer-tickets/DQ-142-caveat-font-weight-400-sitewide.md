---
id: DQ-142
priority: P2
area: typography
section: font-weight
type: token-violation
status: open
---

# Caveat (--font-hand) elements explicitly set font-weight:400 (19 instances, 13 files)

## What's wrong

DESIGN.md specifies Caveat at font-weight 600 (24px annotations) and 500 (18px notes). Across 13 files, 19 inline styles explicitly set `font-weight:400` on Caveat elements, making the handwritten text thinner and less distinctive than intended. Caveat at 400 looks washed out against the chunky comic-strip aesthetic.

## Where (19 instances, 13 files)

- `lab-panels.js` — 7 instances (lines 911, 1839, 2333, 2548, 3903, 7837, 8774)
- `agents.html` — 1 instance (line 1781)
- `lab.html` — 1 instance (line 4202)
- `airyards.html` — 1 instance (line 600)
- `consistency.html` — 1 instance (line 570)
- `efficiency.html` — 1 instance (line 568)
- `opportunity.html` — 1 instance (line 601)
- `redzone.html` — 1 instance (line 568)
- `reportcard.html` — 1 instance (line 607)
- `schedule.html` — 1 instance (line 580)
- `stocks.html` — 1 instance (line 609)
- `usage.html` — 1 instance (line 538)
- `vorp.html` — 1 instance (line 563)

## Fix

Remove `font-weight:400` from all 19 instances. Caveat's default weight is already appropriate; removing the explicit override lets the browser use Caveat's natural weight which aligns with the design spec.

## Pattern

All 19 instances follow the same pattern — section header count annotations:
```html
<span style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); font-weight:400;">(12 players) - subtitle</span>
```

The fix is the same everywhere: delete `font-weight:400;` from the inline style.

## Why this matters

Caveat at 400 looks too thin to carry the "handwritten margin note" personality. At its natural weight it has the right amount of presence — readable but clearly an aside.
