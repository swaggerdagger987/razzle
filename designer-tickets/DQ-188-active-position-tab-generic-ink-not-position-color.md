---
id: DQ-188
priority: P2
category: design-system/position-colors
status: open
cycle: 27
---

# 15 standalone pages — active position tab uses generic `var(--ink)` instead of position color

## What's wrong

When you click a position filter tab (QB/RB/WR/TE) on 15 standalone pages, the active tab fills with `var(--ink)` (dark espresso) regardless of position. This means:
- Clicking QB looks identical to clicking WR — both become dark brown
- Position identity is lost at the moment of interaction
- Violates DESIGN.md: "Position colors consistently (QB=blue, RB=teal, WR=terracotta, TE=purple)"

DQ-087 covers **inactive** tabs missing position color tints. This ticket is about **active** tabs also losing position identity.

## Where

All 15 pages follow the same pattern:
```css
.xx-controls .pos-tab.active { background: var(--ink); color: var(--bg); }
```

| File | Line | Class prefix |
|------|------|-------------|
| `advantage.html` | 38 | `.pa-controls` |
| `archetypes.html` | 109 | `.ar-pos-tab` |
| `draftclass.html` | 91 | `.dc-pos-tab` |
| `drops.html` | 38 | `.dr-controls` |
| `dualthreat.html` | 38 | `.dt-controls` |
| `garbagetime.html` | 38 | `.gt-controls` |
| `gamescript.html` | 38 | `.gs-controls` |
| `records.html` | 42 | `.rb-controls` |
| `seasonpace.html` | 38 | `.sp-controls` |
| `snapefficiency.html` | 38 | `.se-controls` |
| `successrate.html` | 38 | `.sr-controls` |
| `targetpremium.html` | 38 | `.tp-controls` |
| `tdregression.html` | 38 | `.tdr-controls` |
| `weeklyleaders.html` | 90 | `.wl-pos-tab` |
| `workload.html` | 38 | `.wl-controls` |

## Fix

Replace generic `--ink` with position-specific colors via data attribute:

```css
.pos-tab.active[data-pos="QB"] { background: var(--pos-qb); color: #fff; }
.pos-tab.active[data-pos="RB"] { background: var(--pos-rb); color: #fff; }
.pos-tab.active[data-pos="WR"] { background: var(--pos-wr); color: #fff; }
.pos-tab.active[data-pos="TE"] { background: var(--pos-te); color: #fff; }
.pos-tab.active[data-pos="ALL"] { background: var(--ink); color: var(--bg); }
```

If the HTML tabs use `data-pos="QB"` (check each page), this can be a shared rule in `styles.css`. Otherwise, add per-page CSS using the existing class prefixes.

## Test

1. Open any affected page (e.g., drops.html).
2. Click QB — tab should turn blue (`#5b7fff`).
3. Click RB — tab should turn teal (`#2ec4b6`).
4. Click WR — tab should turn terracotta (`#d97757`).
5. Click TE — tab should turn purple (`#8b5cf6`).
6. Click ALL — tab should stay dark ink (generic).
