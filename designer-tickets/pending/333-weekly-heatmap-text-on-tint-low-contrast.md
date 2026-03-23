# DES-333: Weekly heatmap cells — colored text on colored tints creates low contrast

**Priority**: P2
**Category**: Readability — Color Contrast
**Affects**: frontend/weekly.html heatmap cells
**Cycle**: 4 (visual QA)

## Problem

The weekly heatmap at weekly.html uses 5-tier color coding where both cell background AND text take on the performance color (green for good, red for bad). At extreme values, colored text on similarly-colored tinted backgrounds creates low contrast — e.g., dark green text on green-tinted cell, or red text on red-tinted cell. Scores become hard to read.

## Evidence

Screenshot shows player weekly score grid with cells ranging from deep green to deep red. In the most saturated cells, the score numbers blend into the background tint. Middle-tier cells (yellow/neutral) are fine. The extremes (best and worst weeks) are the hardest to read — which is ironic since those are the most important data points.

## Fix

Keep the background tinting for visual pattern recognition, but force text to a high-contrast neutral:

```css
.heatmap-cell { color: var(--ink); }
```

Or for the darkest tinted cells, switch text to `var(--bg-card)` (light on dark):

```css
.heatmap-cell.tier-1, .heatmap-cell.tier-5 { color: var(--bg-card); }
```

The background color tells the story. The text just needs to be readable.

## Why it matters

The heatmap is a power-user tool — managers scan it to spot boom/bust patterns. If the most extreme cells (the ones that matter most) are the hardest to read, the tool fails its purpose.
