# DQ-070: agents.html has 37 long inline `style=` attributes (100+ chars each)

**Priority**: P3 — Maintainability and dark mode risk
**Category**: Code Quality / Dark Mode
**Severity**: LOW — inline styles can't respond to CSS variable theme changes

## Problem

agents.html has 37 inline `style="..."` attributes exceeding 100 characters. These are maintenance nightmares and create dark mode blind spots — inline styles with hardcoded values override CSS variable theme switching.

### Top offenders (longest inline styles):

1. **Line ~1829** — setup step 1: `display:flex; align-items:flex-start; gap:10px; padding:8px 10px; border:2px solid var(--ink-faint); border-radius:8px; background:var(--bg-warm); transition:all 0.2s;`
2. **Line ~1839** — setup step 2: same pattern
3. **Line ~1846** — setup step 3: same pattern
4. **Line ~1937** — "recommended" badge: position, transform, background, color, font, padding, border, shadow
5. **Line ~1580** — skip-link: position, background, color, padding, z-index, font, transition

For comparison: league-intel.html has 40 and lab.html has 56 similar instances.

### Why this matters:

While most of these inline styles use `var()` correctly, the pattern itself makes the codebase fragile:
- Can't be overridden by dark mode CSS without `!important`
- Can't be searched/replaced as a CSS class
- Duplicated styling (setup steps 1-3 are identical)

## Fix

Extract the top 5-10 most repeated patterns into CSS classes:

```css
.setup-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border: 2px solid var(--ink-faint);
  border-radius: var(--radius-sm);
  background: var(--bg-warm);
  transition: transform 0.2s, box-shadow 0.2s;
}
```

Then replace `style="..."` with `class="setup-step"` on each element.

## Verification

Search for `style="` in agents.html — count should drop significantly. All setup steps and repeated patterns should use CSS classes.
