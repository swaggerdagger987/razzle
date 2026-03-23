# DES-194: Home page Bureau section copy starts lowercase — looks like typo

**Priority**: P3
**Category**: Copy / Trust
**Affects**: index.html line 775 — Bureau showcase section
**Cycle**: 18

## Problem

The Bureau section on the home page has a Caveat-font annotation that starts with a lowercase letter:

```
this is what your agents see when they know your league
```

All other Caveat annotations on the home page also use lowercase (which is part of the handwritten aesthetic), BUT this particular one is the Bureau section's primary descriptor — it functions more like a subtitle than a margin note.

The issue is that Caveat font annotations per DESIGN.md should be "a comment, aside, margin note" — never primary information. This line IS primary information (it explains the Bureau's value prop). It should either:
1. Be promoted to a proper subtitle in display font with sentence case, or
2. Stay in Caveat but be clearly positioned as a margin note, not a subtitle.

## Evidence

`index.html:775`:
```html
<p style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); margin-top:16px;">this is what your agents see when they know your league</p>
```

For comparison, other sections use proper display-font subtitles for their value propositions.

## Fix

Option A (promote to subtitle):
```html
<p style="font-family:var(--font-display); font-size:16px; color:var(--ink-medium); margin-top:16px;">This is what your agents see when they know your league.</p>
```

Option B (keep as annotation, capitalize):
```html
<p style="font-family:var(--font-hand); font-size:18px; color:var(--ink-light); margin-top:16px;">This is what your agents see when they know your league</p>
```

## Why it matters

The home page is the front door. Every sentence contributes to or detracts from the impression of polish. A lowercase sentence fragment that looks like a caption reads as unfinished to a first-time visitor from Reddit.
