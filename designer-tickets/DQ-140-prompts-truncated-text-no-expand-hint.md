---
id: DQ-140
priority: P2
area: ux
section: prompts-page
type: discoverability
status: open
---

# Prompts page truncated prompt text has no visual expand indicator

## What's wrong

On prompts.html, prompt text is truncated to `max-height: 120px; overflow: hidden` (line 69) and clicking expands it. But there is:

- No fade gradient at the bottom to signal truncation
- No "click to expand" text or chevron
- No visual difference between a short prompt (fully visible) and a long one (truncated)
- Just `cursor: pointer` — the only hint

Users will miss that prompts are truncatable. They'll think all prompts are 3 lines long.

## Where

- `frontend/prompts.html` lines 65-72

## Fix

Add a bottom fade gradient to signal truncation:
```css
.prompt-text:not(.expanded) {
  position: relative;
}
.prompt-text:not(.expanded)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, var(--bg));
  pointer-events: none;
}
```

Or add a small "click to expand" label in Caveat font below the truncated text.

**Note**: The gradient here is a UI affordance, not a decorative gradient — it signals content continuation and is acceptable per DESIGN.md.

## Why this matters

The prompts page is a conversion path — users copy prompts to use with ChatGPT or Razzle's agents. If they can't see the full prompt, they'll copy an incomplete one or bounce.
