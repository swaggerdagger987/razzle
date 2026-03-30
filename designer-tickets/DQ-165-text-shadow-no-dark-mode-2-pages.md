# DQ-165: fptsbreakdown + percentiles text-shadow no dark mode override

**Priority:** P2
**Area:** Dark Mode
**Type:** Dark mode gap
**Impact:** Text shadows create odd halos in dark mode instead of clean depth

---

## Problem

Two standalone pages use `rgba(45,31,20,...)` text-shadows in their `<style>` blocks without `[data-theme="dark"]` overrides. In dark mode, the text color flips to light sand via CSS variables, but the text-shadow stays dark brown — creating a visible dark halo around light text instead of a clean shadow effect.

### Affected files

1. **fptsbreakdown.html:215**
   ```css
   text-shadow: 0 0 2px rgba(45,31,20,0.5);
   ```

2. **percentiles.html:226**
   ```css
   text-shadow: 0 1px 2px rgba(45,31,20,0.3);
   ```

## Note

Different from done-153 (aging.html legend dot) and DQ-020 (dashboard+tiers hover text-shadow). These are distinct elements on different pages.

## Fix

Add dark mode overrides in each page's `<style>` block:
```css
[data-theme="dark"] .affected-selector {
  text-shadow: 0 1px 2px rgba(237,224,207,0.3);
}
```

## Verification
- Toggle dark mode on fptsbreakdown.html and percentiles.html.
- Text should have clean, consistent shadow effect in both themes.
