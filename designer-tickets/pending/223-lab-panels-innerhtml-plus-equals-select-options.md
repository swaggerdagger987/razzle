# DES-223: lab-panels.js builds select options via innerHTML += (18 instances of DOM thrashing)

**Priority**: P2 (Performance — unnecessary reparse cycles on flagship product)
**Page**: lab.html (via lab-panels.js)
**Category**: Performance / Code quality

## The Problem

lab-panels.js builds `<select>` dropdown options by appending one `<option>` at a time via `innerHTML +=`:

```javascript
// Example from line 6935
sel.innerHTML += '<option value="' + escapeHtml(String(s)) + '">' + escapeHtml(String(s)) + '</option>';
```

This pattern appears 18 times across the file (lines 6935, 7026, 7156, 7413, 7414, 7425, 7659, 7888, 7961, 8059, 8230, 8823, 8901, 9104, 9112, 9256, 9264, 9384).

Each `innerHTML +=` call forces the browser to:
1. Serialize the existing DOM subtree to HTML string
2. Concatenate the new string
3. Reparse the entire combined string back into DOM nodes

For a season selector with 10 options (2015-2025), this means 10 full serialize/parse cycles instead of 1.

## The Fix

Build the options string first, then assign once:

```javascript
// Before (10 reparse cycles):
for (var i = 0; i < seasons.length; i++) {
  sel.innerHTML += '<option value="' + escapeHtml(String(seasons[i])) + '">' + escapeHtml(String(seasons[i])) + '</option>';
}

// After (1 reparse cycle):
var opts = '';
for (var i = 0; i < seasons.length; i++) {
  opts += '<option value="' + escapeHtml(String(seasons[i])) + '">' + escapeHtml(String(seasons[i])) + '</option>';
}
sel.innerHTML = opts;
```

Note: `sel.innerHTML = opts` replaces existing options. If there's a default `<option>` that should be preserved, prepend it to the string.

## Why This Matters

lab-panels.js is loaded on every Lab page visit. These selectors run each time a panel renders. On slow devices (mobile phones — the target audience checks fantasy on their phone), unnecessary DOM thrashing adds up. This is a straightforward optimization that makes the code both faster and cleaner.
