---
id: DES-013
priority: P2
area: pricing.html + about.html
status: open
created: 2026-03-22
---

# DES-013: "60+ analytical panels" on pricing and about pages — undersells actual 67+ panels

## What's Wrong

Multiple pages say "60+ analytical panels" but the actual count from `agent-config.js` panel territories is 67:
- Dolphin: 9 panels
- Hawkeye: 17 panels
- Bones: 10 panels
- Octo: 18 panels
- Atlas: 13 panels
- **Total: 67 panels**

The North Star document says **"70+ analytical panels."**

Pages with "60+":
- `pricing.html:223` — free-celebration chip: "60+ analytical panels"
- `pricing.html:322` — feature matrix: "All 60+ analytical panels"
- `pricing.html:400` — FAQ answer: "60+ analytical panels"
- `about.html:8` — OG description: "60+ analytics tools"
- `about.html:17` — Twitter description: "60+ analytics tools"
- `about.html:19` — meta description: "60+ analytics tools"
- `about.html:216` — body copy: "60+ analytical panels"

## Why It Matters

On the conversion decision page (pricing), you're underselling by ~12%. "70+ analytical panels" sounds significantly more impressive than "60+" — it pushes past a psychological threshold. The pricing page's job is to make the value feel overwhelming. Every number matters.

## Fix

Update all instances to "70+" to match the North Star and actual count:

```
FIND:    60+ analytical panels
REPLACE: 70+ analytical panels

FIND:    60+ analytics tools
REPLACE: 70+ analytics tools
```

7 instances across 2 files.

## Files

- `frontend/pricing.html` — lines 223, 322, 400
- `frontend/about.html` — lines 8, 17, 19, 216
