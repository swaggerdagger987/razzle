---
id: DES-352
priority: P3
area: index.html
section: discovery filters
type: ux / discoverability
status: open
---

# Smart filter discovery chips have no descriptions or tooltips

## What's wrong

The home page has 5 discovery filter chips (line 719-725):
- Breakout Candidates (`?sf=breakout`)
- Buy Low Targets (`?sf=buylow`)
- Workhorses (`?sf=workhorses`)
- Sleepers (`?sf=sleepers`)
- Rookies (`?sf=rookies`)

These chips have no tooltip, subtitle, or description explaining what criteria define each category. A user clicking "Sleepers" doesn't know if it means "low-owned players," "undervalued by ADP," "young with upside," or something else entirely.

The section heading says "One-click discovery filters" and subtitle "These update live as the season plays out" — but neither explains what the filters actually DO.

## Where

- `frontend/index.html` lines 719-725: smart-chip links
- No title="" or aria-description on any chip

## Suggested fix

Add a one-line description below each chip or a title attribute:
```html
<a href="/lab.html?sf=breakout" class="smart-chip" title="Players getting volume but not yet production — the opportunity-to-output gap">Breakout Candidates</a>
```

Or add a subtitle row beneath the chips explaining each filter's logic in 5-7 words.

## Not a dupe of

- DES-335 (discovery chips flat no shadow) — that's about visual styling, not content
- DES-001 (orphan discovery filter chip) — that's about chip CSS
