# DES-029: Command palette badges use hardcoded #fff — no dark mode override

**Priority**: P1
**Area**: sitewide (styles.css)
**Impact**: The command palette (Ctrl+K) — a power user feature — has two elements with hardcoded `color: #fff` and no dark mode override. Power users are exactly the audience most likely to use dark mode AND the command palette.

## The Problem

`frontend/styles.css` line 1113:
```css
.cmd-palette-key-label {
  /* ... */
  color: #fff;  /* ← hardcoded, no dark mode override */
}
```

`frontend/styles.css` line 1147:
```css
.cmd-palette-pos {
  /* ... */
  color: #fff;  /* ← hardcoded, no dark mode override */
}
```

These are the keyboard shortcut label badges and position badges inside the quick search palette. They sit on colored backgrounds (orange for key labels, position colors for pos badges). White text on these backgrounds works in both modes, but the hardcoded value bypasses the design system.

## The Fix

Both should use a CSS variable:
```css
.cmd-palette-key-label {
  color: var(--bg);  /* white in light mode, sand in dark mode */
}
.cmd-palette-pos {
  color: var(--bg);
}
```

Or introduce `--text-on-accent` token (see DES-032 for the systemic pattern).

## Why This Matters

The command palette is a discovery and power-user feature — it's how experienced users navigate the 70+ panels. Broken styling here signals "unfinished product" to exactly the users who are most likely to pay.
