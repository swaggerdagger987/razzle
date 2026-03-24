---
id: DQ-397
priority: P2
area: prompts.html
section: prompt cards
type: ux / affordance
status: open
---

# Prompts page truncates prompt text at 120px max-height with no "read more" indicator

## What's wrong

prompts.html CSS line ~69-71: `.prompt-text` has `max-height: 120px; overflow: hidden;` which hard-truncates long prompts. There is no visual indicator that:

1. The text is truncated (no fade, no ellipsis, no "..." indicator)
2. Clicking expands it (no "Read more" link or expand icon)
3. It can collapse again after expanding (no "Read less" cue)

The dashed bottom border on unexpanded cards (line 71: `border-bottom: 2px dashed`) is too subtle to signal "click to expand." Users see what looks like complete text and miss the rest.

## Where

- `frontend/prompts.html` line ~69-71: `.prompt-text` max-height truncation CSS
- `frontend/prompts.html` line ~71: `.prompt-text:not(.expanded)` dashed border

## Suggested fix

1. Add a gradient fade-out at the bottom of truncated text (e.g., linear-gradient to transparent over the last 20px)
2. Add a "Read more" text link below truncated content in Caveat font
3. When expanded, show "Read less" link to collapse

## Not a dupe of

- DQ-342 (prompts category headers flat) — that's about section headers, not prompt card content
