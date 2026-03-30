# DES-225: prompts.html and tools.html have zero dark mode CSS in page-specific styles

**Priority**: P2 (Dark mode quality — page-specific layouts untested in dark mode)
**Pages**: prompts.html, tools.html
**Category**: Dark mode / CSS

## The Problem

Only 2 of 75 pages have `[data-theme="dark"]` rules in their page-specific `<style>` blocks: lab.html (3 rules) and pricing.html (15 rules). All other pages with custom `<style>` blocks rely entirely on CSS variable auto-flipping from styles.css.

For most standalone pages, this works because they use `var(--ink)`, `var(--bg-card)`, etc. But prompts.html and tools.html are main navigation pages (visible from the nav bar or footer) with custom CSS that may need dark mode adjustments.

DES-187 already covers about.html (same pattern). This ticket covers prompts.html and tools.html specifically.

**prompts.html** — uses all CSS variables (clean), but should be verified:
- `.prompts-page`, `.prompt-card`, `.prompt-category-badge` all use `var()` tokens
- No hardcoded hex colors found
- Likely works correctly in dark mode via auto-flip

**tools.html** — has one hardcoded hex in JS:
- Line 532: `html2canvas(el, { backgroundColor: ... '#2d1f14' : '#ede0cf' ... })` — correctly switches for dark mode
- Page CSS uses all `var()` tokens

## The Fix

1. Toggle dark mode on prompts.html and tools.html
2. Visually verify all elements render correctly
3. If any element needs adjustment (shadows, borders, backgrounds), add `[data-theme="dark"]` rules to the page `<style>` block
4. If everything auto-flips correctly, mark this as verified (no code change needed)

This is a verification ticket — the fix may be "confirmed clean" with no code changes.

## Why This Matters

prompts.html is linked from the footer on all 75 pages. tools.html is the Lab panel hub. Users who toggle dark mode on any page will visit these pages in dark mode. If anything looks wrong, it breaks the "dark mode just works" expectation.
