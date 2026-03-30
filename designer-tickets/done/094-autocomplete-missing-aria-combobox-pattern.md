# DES-094: 10+ autocomplete search inputs missing ARIA combobox pattern

**Priority**: P1
**Area**: 9 standalone HTML pages + command palette + Lab player search
**Cycle**: 9

## Problem

Player search autocomplete inputs across the site implement keyboard navigation (ArrowDown/ArrowUp/Enter) but have no ARIA combobox attributes. Screen readers don't announce:
- That the input has autocomplete functionality
- When the dropdown opens/closes
- Which option is highlighted
- How many options are available

### Affected pages (confirmed pattern — all identical)

| Page | Input selector | Dropdown selector |
|------|---------------|-------------------|
| `breakdown.html` | `.bd-search` | `.bd-ac-list` |
| `strengths.html` | `.sw-search` | `.sw-ac-list` |
| `tradefinder.html` | `.tf-search-input` | `.tf-autocomplete` |
| `rosterbuilder.html` | `.rb-search` | `.rb-autocomplete` |
| `career.html` | search input | ac-list |
| `career-compare.html` | search input | ac-list |
| `comptable.html` | search input | ac-list |
| `gamelog.html` | search input | ac-list |
| `percentiles.html` | search input | ac-list |

### Example of the gap (from breakdown.html)

```html
<!-- Input has aria-label but no combobox role -->
<input type="text" class="bd-search" id="bdSearch"
  placeholder="Search for a player..." autocomplete="off"
  aria-label="Player search">

<!-- Dropdown has no listbox role -->
<div class="bd-ac-list" id="bdAcList"></div>
```

```javascript
// Items are divs, not options
html += '<div class="bd-ac-item" data-id="...">';
// No role="option", no aria-selected
```

## Fix

1. Add combobox attributes to input:
```html
<input ... role="combobox" aria-autocomplete="list"
  aria-expanded="false" aria-controls="bdAcList">
```

2. Add listbox role to dropdown:
```html
<div class="bd-ac-list" id="bdAcList" role="listbox"></div>
```

3. Add option role to items:
```javascript
html += '<div class="bd-ac-item" role="option" ...>';
```

4. Toggle `aria-expanded` when dropdown opens/closes:
```javascript
searchInput.setAttribute('aria-expanded', 'true');  // on open
searchInput.setAttribute('aria-expanded', 'false');  // on close
```

5. Set `aria-activedescendant` on highlighted item during keyboard navigation.

## Design Rule

WAI-ARIA Combobox Pattern (APG). Search inputs with suggestion dropdowns must implement the combobox pattern for screen reader users to navigate results.
