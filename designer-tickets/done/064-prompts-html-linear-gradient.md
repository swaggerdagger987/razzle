# DES-064: prompts.html uses linear-gradient — design guide bans gradients

**Priority**: P2
**Area**: frontend/prompts.html line 72
**Cycle**: 6

## Problem

The Prompts page uses a `linear-gradient` for a text overflow fade effect:

```css
.prompt-text::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 40px;
  background: linear-gradient(transparent, var(--bg));
  pointer-events: none;
}
```

DESIGN.md explicitly bans gradients: "Don't: Gradients."

## Context

This is a utility gradient (text fade to indicate "click to expand"), not a decorative gradient. It's a common UX pattern. However, the design guide makes no exceptions — the comic-strip aesthetic relies on hard edges, not smooth fades.

## Fix Options

**Option A (pure CSS, no gradient):**
Replace gradient with a solid block + ellipsis:
```css
.prompt-text {
  max-height: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Remove ::after entirely */
```

**Option B (dashed border hint):**
Replace gradient with a dashed bottom border indicating more content:
```css
.prompt-text:not(.expanded) {
  border-bottom: 2px dashed var(--ink-faint);
}
/* Remove ::after entirely */
```

Option B is more on-brand (dashed borders are part of the design language).

## Design Rule

DESIGN.md: "Don't: Gradients" — no exceptions listed.
