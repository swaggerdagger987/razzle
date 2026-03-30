# DES-190: 7+ search inputs missing aria-label — placeholder as sole label

**Priority**: P2
**Category**: Accessibility
**Affects**: lab.html (4 inputs), auction.html, tools.html, and JS-generated inputs
**Cycle**: 18

## Problem

At least 7 search/filter inputs rely on `placeholder` as the only accessible label. Placeholders disappear when the user types, and screen readers may not announce them as the input's purpose. WCAG 2.1 requires a persistent accessible name via `<label>`, `aria-label`, or `aria-labelledby`.

Many other search inputs in the codebase DO have `aria-label` (breakdown.html, career.html, gamelog.html, strengths.html, etc.) — the pattern exists but wasn't applied everywhere.

## Evidence

Inputs MISSING `aria-label`:

1. `lab.html:3545` — Column picker search:
   ```html
   <input type="text" id="columnPickerSearch" placeholder="Search columns...">
   ```

2. `lab.html:3804` — Trade Analyzer give search:
   ```html
   <input type="text" class="input-chunky" id="taSearchGive" placeholder="search player...">
   ```

3. `lab.html:3833` — Trade Analyzer get search:
   ```html
   <input type="text" class="input-chunky" id="taSearchGet" placeholder="search player...">
   ```

4. `lab.html:3892` & `lab.html:3906` — Trade value comp search:
   ```html
   <input type="text" class="input-chunky" id="tvSearchA" placeholder="search player...">
   <input type="text" class="input-chunky" id="tvSearchB" placeholder="search player...">
   ```

5. `auction.html:350`:
   ```html
   <input type="text" id="search-input" placeholder="search players...">
   ```

6. `tools.html:308`:
   ```html
   <input type="text" class="tools-search" id="tools-search" placeholder="search tools...">
   ```

Inputs WITH `aria-label` (correct pattern):
- `lab.html:3328`: `aria-label="Search players"`
- `breakdown.html:365`: `aria-label="Player search"`
- `tradefinder.html:468`: `aria-label="Search for a player"`

## Fix

Add `aria-label` to each input matching its purpose:
```html
<input ... placeholder="Search columns..." aria-label="Search columns">
<input ... placeholder="search player..." aria-label="Search player to give">
<input ... placeholder="search player..." aria-label="Search player to receive">
```

## Why it matters

The Trade Analyzer is a Pro conversion feature. VoiceOver/NVDA users who can't identify what each search input does will bounce. The pattern already exists in the codebase — just propagate it.
