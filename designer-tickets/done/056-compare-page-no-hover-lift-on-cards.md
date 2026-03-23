# DES-056: compare.html has no hover-lift on player cards or stat sections

**Priority**: P2
**Area**: compare.html (Player Comparison page)
**Found by**: Design QA Cycle 5

## Problem

The compare page has two major card types — `.compare-player-card` and `.compare-section` — neither has a `:hover` state. Only the back link (`.compare-back:hover`) has a hover interaction.

DESIGN.md mandates: "Hover-lift — interaction should feel physical" and specifies `6px 6px 0` + `translate(-2px, -2px)` on hover.

Both card types use the correct base styling:
- `border: 3px solid var(--ink)`
- `border-radius: 12px`
- `box-shadow: 4px 4px 0 var(--ink)`

But they feel static — no response to interaction.

## Conversion impact

The compare page is a sharing tool. Users generate comparisons, then export or share URLs. Hover-lift makes the page feel premium and interactive, reinforcing the "this tool is serious" impression.

## Fix

```css
.compare-player-card:hover,
.compare-section:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
  transition: all 0.12s ease;
}
```

Add transition to base styles:
```css
.compare-player-card,
.compare-section {
  transition: all 0.12s ease;
}
```
