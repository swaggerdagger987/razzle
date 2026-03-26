# Design QA Tickets — 2026-03-25 (v5)

Audit method: full codebase scan of all 75 HTML pages, CSS, and JS files in `frontend/` against `docs/DESIGN.md`.

---

## DES-301: Normalize box-shadow sizes to design tokens (2px / 4px / 6px)

**Severity**: MEDIUM
**Files**: `frontend/styles.css`
**Lines**: 259, 327, 768, 773, 796, 801, 849, 969, 1089, 1685, 1697, 1701

**Problem**: 12 box-shadow declarations use non-standard offset sizes (1px, 3px, 5px). The design system defines exactly three shadow tiers:
- `2px 2px 0` — secondary elements (chips, badges, small buttons)
- `4px 4px 0` — primary elements (cards, containers) — `var(--shadow-chunky)`
- `6px 6px 0` — hover-lift state only

**BEFORE** (examples):
```css
.hamburger-toggle:active { box-shadow: 1px 1px 0 var(--ink); }   /* L259 */
.btn-chunky:hover { box-shadow: 3px 3px 0 var(--ink); }          /* L768 */
.card-hero { box-shadow: 5px 5px 0 var(--ink); }                 /* L849 */
.input-chunky:focus { box-shadow: 3px 3px 0 var(--ink); }        /* L969 */
```

**AFTER**:
```css
.hamburger-toggle:active { box-shadow: 2px 2px 0 var(--ink); }
.btn-chunky:hover { box-shadow: 4px 4px 0 var(--ink); }
.card-hero { box-shadow: 4px 4px 0 var(--ink); }
.input-chunky:focus { box-shadow: 4px 4px 0 var(--ink); }
```

**Rule**: DESIGN.md lines 151-156. Button active states -> 2px. Hover states -> 4px or 6px with translate. Static cards -> 4px. No 1px, 3px, or 5px shadows anywhere.

---

## DES-302: Replace hardcoded border-radius values with CSS variable tokens

**Severity**: MEDIUM
**Files**: `frontend/styles.css`
**Lines**: 217, 246, 345, 546, 689, 722, 759, 787, 830, 961, 988, 1079, 1144, 1324, 1363, 1418, 1613

**Problem**: 17 instances of hardcoded `border-radius: 8px`, `12px`, or `20px` instead of the CSS variable tokens. While the numeric values happen to match, hardcoding them bypasses the design system -- if token values change, these won't update.

**BEFORE**:
```css
border-radius: 8px;   /* 15 instances */
border-radius: 12px;  /* 1 instance */
border-radius: 20px;  /* 1 instance */
```

**AFTER**:
```css
border-radius: var(--radius-sm);   /* 8px */
border-radius: var(--radius);      /* 12px */
border-radius: var(--radius-lg);   /* 20px */
```

**Rule**: DESIGN.md lines 142-149 -- "Use the token, not a hardcoded value."

---

## DES-303: Fix non-token border-radius values (14px, 6px)

**Severity**: HIGH
**Files**: `frontend/archetypes.html:115`, `frontend/dashboard.html:113`, `frontend/tiers.html:120`, `frontend/lab-panels.css:411`, `frontend/lab-panels.js:9589,9612,10015,10188`, `frontend/lab.js:9274`

**Problem**: 9 instances of `border-radius: 14px` or `6px` -- values that don't exist in the design token system at all. 14px is between `--radius` (12px) and `--radius-lg` (20px). 6px is below `--radius-sm` (8px).

**BEFORE**:
```css
border-radius: 14px;  /* archetypes.html, dashboard.html, tiers.html, lab-panels.css */
border-radius: 6px;   /* lab-panels.js inline styles, lab.js */
```

**AFTER**:
```css
border-radius: var(--radius);     /* 14px -> 12px (cards/containers) */
border-radius: var(--radius-sm);  /* 6px -> 8px (small elements) */
```

**Rule**: DESIGN.md lines 142-149. Only three tokens exist: 8px, 12px, 20px. Everything else is off-spec.

---

## DES-304: Remove gradient in prompts.html

**Severity**: HIGH
**Files**: `frontend/prompts.html:78`

**Problem**: A `linear-gradient(transparent, var(--bg))` is used as a fade-out overlay on truncated prompt text. DESIGN.md explicitly forbids gradients.

**BEFORE**:
```css
.prompt-text:not(.expanded)::after {
  background: linear-gradient(transparent, var(--bg));
}
```

**AFTER**:
```css
/* Option A: Solid mask at bottom */
.prompt-text:not(.expanded)::after {
  background: var(--bg);
  height: 24px;
}
```

**Rule**: DESIGN.md line 233 -- "Don't: Gradients."

---

## DES-305: Replace cold black rgba(0,0,0,...) with warm espresso in agents.html

**Severity**: MEDIUM
**Files**: `frontend/agents.html:39,259,285`, `frontend/lab.html:1040`

**Problem**: Drop shadows and box shadows use `rgba(0,0,0,...)` (cold black) instead of warm espresso `rgba(45,31,20,...)`. The design guide mandates warm brown tones everywhere -- "even dark mode stays warm (brown, not gray)."

**BEFORE**:
```css
filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15));         /* agents.html:39 */
box-shadow: 4px 4px 0 rgba(0,0,0,0.4);                   /* agents.html:259 */
filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));           /* agents.html:285 */
[data-theme="dark"] ... box-shadow: 0 4px 8px rgba(0,0,0,0.25);  /* lab.html:1040 */
```

**AFTER**:
```css
filter: drop-shadow(3px 3px 0 rgba(45,31,20,0.15));
box-shadow: 4px 4px 0 rgba(45,31,20,0.4);
filter: drop-shadow(2px 2px 0 rgba(45,31,20,0.3));
[data-theme="dark"] ... box-shadow: 0 4px 8px rgba(45,31,20,0.25);
```

**Rule**: DESIGN.md line 231 -- "Don't: Blue-black ink -- always use espresso brown, never navy/charcoal/gray." Cold black rgba(0,0,0) is gray, not warm.

**Note**: `warroom.js` also uses rgba(0,0,0,...) but is exempt -- pixel art canvas colors are thematic, not part of the design system.

---

## DES-306: Replace blurred drop shadow on sticky thead with chunky offset

**Severity**: MEDIUM
**Files**: `frontend/lab.html:1037-1040`

**Problem**: The sticky table header uses a blurred CSS drop shadow (`0 4px 8px rgba(...)`) to indicate scroll state. The design system uses only hard-offset shadows -- blurred shadows are a fintech/dashboard anti-pattern.

**BEFORE**:
```css
.screener-table thead.thead-shadow th {
  box-shadow: 0 4px 8px rgba(45,31,20,0.08);
}
[data-theme="dark"] .screener-table thead.thead-shadow th {
  box-shadow: 0 4px 8px rgba(0,0,0,0.25);
}
```

**AFTER**:
```css
.screener-table thead.thead-shadow th {
  box-shadow: 0 3px 0 var(--ink-faint);
}
[data-theme="dark"] .screener-table thead.thead-shadow th {
  box-shadow: 0 3px 0 var(--ink-faint);
}
```

**Rule**: DESIGN.md lines 155-156. Shadows are always hard-offset (`Npx Npx 0`), never blurred (`0 Npx Npx rgba`). The design language is comic-strip/sticker -- blurred shadows break the aesthetic.

---

## DES-307: Use var(--text-on-accent) instead of hardcoded #fff in lab.js

**Severity**: LOW
**Files**: `frontend/lab.js:1185`

**Problem**: A stale-data warning banner hardcodes `color:#fff` instead of using the CSS variable `var(--text-on-accent)` which exists specifically for text on accent-colored backgrounds and flips correctly in dark mode.

**BEFORE**:
```js
banner.style.cssText = "background:var(--orange);color:#fff;text-align:center;...";
```

**AFTER**:
```js
banner.style.cssText = "background:var(--orange);color:var(--text-on-accent);text-align:center;...";
```

**Rule**: `--text-on-accent` is defined in `:root` (styles.css:69) and flips to `var(--bg)` in dark mode (styles.css:103). Hardcoding #fff breaks dark mode contrast.

---

## DES-308: Replace hardcoded colors and font names in noscript blocks

**Severity**: LOW
**Files**: `frontend/agents.html:1604-1607`, `frontend/lab.html:3155-3158`, `frontend/league-intel.html:2535-2538`

**Problem**: All three major pages have `<noscript>` fallback blocks with inline styles using hardcoded hex colors (`#6b5a4e`, `#a89585`) and direct font-family names (`'Space Mono'`, `'Luckiest Guy'`, `'Caveat'`) instead of CSS variables.

**BEFORE**:
```html
<div style="font-family:'Space Mono',monospace; color:#6b5a4e;">
  <p style="font-family:'Luckiest Guy',cursive;">JavaScript required</p>
  <p style="font-family:'Caveat',cursive; color:#a89585;">pulling film requires electricity...</p>
</div>
```

**AFTER**:
```html
<div style="font-family:var(--font-mono); color:var(--ink-medium);">
  <p style="font-family:var(--font-display);">JavaScript required</p>
  <p style="font-family:var(--font-hand); color:var(--ink-light);">pulling film requires electricity...</p>
</div>
```

**Rule**: DESIGN.md lines 108-123. Fonts use CSS variable tokens. Colors `#6b5a4e` and `#a89585` are close to but not exactly `--ink-medium` (#5c4a3d) and `--ink-light` (#8a7565) -- they're off-palette.

---

## DES-309: Replace hardcoded medal colors with CSS variables in lab-panels.css

**Severity**: LOW
**Files**: `frontend/lab-panels.css:580,603,605,3476`

**Problem**: Gold and bronze medal colors are hardcoded as hex values when CSS variables `--medal-gold` and `--medal-bronze` already exist in `:root` (styles.css:67-68).

**BEFORE**:
```css
.tv-tier-num.t1 { background: #ffd700; }     /* L580 */
.tv-rank.top1 { color: #b8860b; }            /* L603 -- dark gold, not even matching */
.tv-rank.top3 { color: #a0522d; }            /* L605 -- sienna, not matching --medal-bronze */
.rc2-badge.gold { background: #ffd700; }     /* L3476 */
```

**AFTER**:
```css
.tv-tier-num.t1 { background: var(--medal-gold); }
.tv-rank.top1 { color: var(--medal-gold); }
.tv-rank.top3 { color: var(--medal-bronze); }
.rc2-badge.gold { background: var(--medal-gold); }
```

**Rule**: CSS variables exist for these exact values. Using hardcoded hex breaks dark-mode cascade and makes future palette changes miss these elements.

---

## DES-310: Hardcoded border-radius in JavaScript inline styles

**Severity**: LOW
**Files**: `frontend/lab.js:1210,5721,9274`, `frontend/lab-panels.js:9589,9612,10015,10188`

**Problem**: JavaScript-generated inline styles use hardcoded pixel values for border-radius instead of CSS variable references. While CSS variables work in inline styles, these bypass the token system.

**BEFORE** (lab.js):
```js
`border-radius:12px`   // L1210, L5721
`border-radius:6px`    // L9274
```
**BEFORE** (lab-panels.js):
```js
`border-radius:6px`    // L9589, L9612, L10015, L10188
```

**AFTER**:
```js
`border-radius:var(--radius)`      // 12px containers
`border-radius:var(--radius-sm)`   // 6px -> 8px small elements
```

**Rule**: DESIGN.md lines 142-149. All border-radius values should use tokens. CSS variables work in inline styles and will cascade correctly with dark mode and future theme changes.

---

## Summary

| Ticket  | Severity | Instances | Category |
|---------|----------|-----------|----------|
| DES-301 | MEDIUM   | 12        | Non-standard box-shadow sizes |
| DES-302 | MEDIUM   | 17        | Hardcoded border-radius (correct values, wrong form) |
| DES-303 | HIGH     | 9         | Non-token border-radius (wrong values) |
| DES-304 | HIGH     | 1         | Forbidden gradient |
| DES-305 | MEDIUM   | 4         | Cold black rgba instead of warm espresso |
| DES-306 | MEDIUM   | 2         | Blurred drop shadow instead of hard offset |
| DES-307 | LOW      | 1         | Hardcoded #fff instead of var(--text-on-accent) |
| DES-308 | LOW      | 3 files   | Noscript blocks with off-palette colors and direct font names |
| DES-309 | LOW      | 4         | Medal colors not using existing CSS variables |
| DES-310 | LOW      | 7         | JS inline styles with hardcoded border-radius |

**Total violations**: ~60 instances across 10 categories.

**Positive findings**: No "Loading..." text (all personality messages). No 1px borders on primary elements. No cold grays in main stylesheet. No mismatched position colors. Dark mode variables properly defined. Design tokens properly declared in :root. All pages use correct font tokens in CSS classes.
