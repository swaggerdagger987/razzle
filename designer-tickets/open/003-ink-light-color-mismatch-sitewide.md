# DES-003: --ink-light CSS variable doesn't match DESIGN.md spec (sitewide)

**Priority:** P1
**Area:** Sitewide — every page
**Type:** Design system violation

## The Problem

The `--ink-light` CSS variable is wrong in both light and dark mode. This affects **219 usages** across `styles.css` and `lab-panels.css` — every label, metadata line, timestamp, and secondary border on the entire site.

| Mode | DESIGN.md spec | Actual CSS | Delta |
|------|---------------|------------|-------|
| Light | `#8a7565` | `#6d5a4d` | Too dark — muddy, competes with body text |
| Dark | `#8a7565` (shared) | `#b09a88` | Too light — washed out on dark bg |

## Why It Matters

`--ink-light` is the "labels, metadata, timestamps" color. DESIGN.md chose `#8a7565` to feel warm and recessive against the sand background — subtle secondary information that doesn't compete with `--ink-medium` body text.

The current `#6d5a4d` is only 17 hex values away from `--ink-medium` (`#5c4a3d`). Labels and metadata look almost as heavy as body text, killing the typographic hierarchy. Everything feels dense instead of airy.

In dark mode, `#b09a88` is too bright for what should be a shared-tone neutral. The design spec says this value stays the same across both modes — the one anchor point.

## The Fix

Two lines. Change the CSS variable declarations:

**Light mode** (`:root`, ~line 25 in `styles.css`):
```css
--ink-light: #8a7565;  /* was #6d5a4d */
```

**Dark mode** (`[data-theme="dark"]`, ~line 75 in `styles.css`):
```css
--ink-light: #8a7565;  /* was #b09a88 — shared per DESIGN.md */
```

No other files need to change — everything uses the CSS variable.

## Conversion Impact

Every page benefits. The typographic hierarchy loosens up — primary text pops more, secondary info recedes properly, the whole site feels more breathable and polished. This is invisible in isolation but it's the kind of ambient quality that makes r/DynastyFF users think "this tool is clean" vs "something feels off."

## Verification

1. Open any page (index.html, lab.html, etc.)
2. Labels/metadata/timestamps should be visibly lighter than body text
3. Toggle dark mode — `--ink-light` elements should match the same tone
4. Compare a before/after screenshot of any data-heavy panel
