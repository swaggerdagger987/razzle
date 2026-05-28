# Razzle UI Designer Audit -- 2026-03-14

**Persona**: UI Designer
**Scope**: Visual design compliance against DESIGN.md
**Files audited**: styles.css, lab-panels.css, 74 HTML files, 11 JS files
**Prior review**: 2026-03-13 (Ship Readiness: 34/100)

---

## Summary

Phase A claimed to fix the design audit. It made real progress -- cold Tailwind grays like `#e5e7eb` and `#374151` are gone, undefined CSS variables (`--accent`, `--bg-main`, `--border-light`, `--font-data`) are resolved, and the 121 bare `sans-serif` canvas font calls in lab.js/charts.js/player.js/compare.js were fixed. The hamburger menu exists. But the audit was incomplete. Three systemic issues persist: (1) **63+ bare `monospace` canvas calls** that should be `'Space Mono', monospace`, (2) **massive 1px border violations** across 60+ files that were supposedly upgraded, and (3) **`--ink-light` is the wrong hex value** -- DESIGN.md says `#8a7565` but styles.css defines it as `#6d5c4e`. These are not edge cases; they are pervasive.

---

## Findings

### CRITICAL

#### 1. `--ink-light` is wrong: `#6d5c4e` vs DESIGN.md `#8a7565`
- **File**: `frontend/styles.css:25` and `frontend/styles.css:68`
- **Evidence**: `:root { --ink-light: #6d5c4e; }` in both light and dark modes
- **DESIGN.md says**: `--ink-light: #8a7565` -- "Labels, metadata, timestamps"
- **Impact**: Every element using `var(--ink-light)` renders darker than designed. This affects labels, metadata, timestamps, placeholder text, the entire command palette secondary text, all loading/empty states, skeleton loaders, and dozens of panel headers. The color `#6d5c4e` is closer to `--ink-medium` (#5c4a3d) than to the intended light ink.
- **Also**: Dark mode `--ink-light` should remain `#8a7565` per DESIGN.md ("shared" between modes), but it is also set to `#6d5c4e`.

#### 2. `--ink-light` dark mode value wrong
- **File**: `frontend/styles.css:68`
- **Evidence**: `[data-theme="dark"] { --ink-light: #6d5c4e; }`
- **DESIGN.md says**: Dark mode `--ink-light` should be `#8a7565` (shared between light and dark)
- **Impact**: Same as above, compounded in dark mode.

---

### HIGH

#### 3. 63+ bare `monospace` canvas font calls (should be `'Space Mono', monospace`)
The Phase A typography audit claimed to fix hardcoded font-family refs. It fixed 6 instances. It missed 63+.

- **File**: `frontend/lab.js` -- 31 instances (lines 5896, 5902, 5917, 5925, 6672, 6697, 6713, 6735, 7528, 7540, 7594, 7599, 7861, 7866, 8212, 8241, 8247, 8555, 8577, 8645, 8650, 8656, 9071, 9090, 10661, 10702, 10711, 10774, 10827, 10947, 10989, 11966, 12022, 12032, 12037, 12061, 12076, 12080)
- **File**: `frontend/charts.js` -- 4 instances (lines 1084, 1102, 1135, 1177)
- **File**: `frontend/warroom.js` -- 9 instances (lines 324, 415, 515, 518, 907, 977, 1136, 1164, 3913) -- pixel canvas, may be intentionally raw
- **File**: `frontend/lab-panels.js` -- 9 instances (lines 5497, 5526, 5529, 5534, 5685, 5691, 6592, 6603, 6607)
- **Evidence**: `ctx.font = "12px monospace"` instead of `ctx.font = "12px 'Space Mono', monospace"`
- **Rule violated**: DESIGN.md: "All stat values... Space Mono" / "Three Fonts, Three Jobs"
- **Note**: warroom.js pixel canvas uses bare monospace for pixel-art labels, which is arguably intentional for the retro aesthetic. The 53 other instances are not.

#### 4. Pervasive 1px solid borders across 60+ files
Phase A Task 3 claimed: "1px/1.5px borders upgraded to 2px across 17 files." The reality: **1px solid borders still exist in 60+ files.** These are primarily table cell borders (`border-bottom: 1px solid var(--ink-faint)`) on `<td>` elements.

Files still using `1px solid`:
- **CSS in HTML** (50+ files): auction.html:170, advantage.html:48, career-compare.html:116+253, airyards.html:189, cheatsheet.html:138, breakdown.html:235, career.html:91+308, comptable.html:184, compare.html:204, awards.html:260, dashboard.html:135+196, draftclass.html:203, consistency.html:158, efficiency.html:158, fptsbreakdown.html:143, gamelog.html:208, handcuffs.html:118, leaders.html:158, matchups.html:188, opportunity.html:156, percentiles.html:90, player.html:205, playoffs.html:136, recap.html:200, redzone.html:158, regression.html:186, rosterbuilder.html:89, reportcard.html:156, schedule.html:158, scoring.html:143, stacks.html:113, stocks.html:158, streaks.html:150, strengths.html:312, targets.html:187, team.html:139, tradevalues.html:204, tradefinder.html:100+344, usage.html:153, vorp.html:181, waivers.html:139, weekly.html:147, weeklyleaders.html:156, weeklymvp.html:112, yoy.html:154
- **CSS in HTML** (standalone panels): drops.html:47, dualthreat.html:44, gamescript.html:46, garbagetime.html:47, seasonpace.html:44, snapefficiency.html:44, successrate.html:44, targetpremium.html:44, tdregression.html:51, records.html:67, workload.html:44
- **JS inline styles**: charts.js:887+891+1250+1254+1275+1284+1292+1296, lab-panels.js:9940, lab.js:2290+2306+8855+10343+11252, formulas.js:130, player.js:745
- **lab.html CSS**: lines 956, 1032, 1302, 1824, 1913, 2717
- **Rule violated**: DESIGN.md: "Dashed dividers: 2px dashed var(--ink-faint) inside cards" and the Do/Don't list: "Don't: Thin 1px borders on primary elements"
- **Counterargument**: Some could argue table row dividers at 1px are acceptable as they are not "primary elements." But DESIGN.md says the minimum secondary border is 2px. These borders are inconsistent with the chunky aesthetic.

#### 5. Four canvas export functions still use `'24px sans-serif'`
- **File**: `frontend/archetypes.html:417`, `frontend/auction.html:510`, `frontend/dashboard.html:613`, `frontend/tiers.html:421`
- **Evidence**: `ctx.font = '24px sans-serif'` in screenshot watermark functions
- **Rule violated**: DESIGN.md: Three fonts only. sans-serif is not one of them.
- **Note**: Phase A Task 2 claimed all hardcoded font-family refs were fixed. These 4 were missed.

#### 6. Non-palette colors used for semantic green/red: `#16a34a` and `#dc2626`
- **File**: `frontend/lab-panels.css` -- 18 instances (lines 2642, 2643, 2656, 2657, 2662, 2663, 2750, 2751, 2775, 2776, 2978, 2979, 3010, 3011, 3031, 3035, 3085, 3088)
- **File**: `frontend/lab-panels.js` -- 7 instances (lines 4396, 5098, 5416, 5894, 5898, 5901, 5905)
- **Evidence**: `color: #16a34a` (Tailwind green-600) and `color: #dc2626` (Tailwind red-600)
- **DESIGN.md says**: `--green: #2ec4b6` for positive signals, `--red: #e63946` for negative signals. Or use `--semantic-green: #2e7d52` / `--semantic-red: #9b3232` from styles.css.
- **Impact**: These are Tailwind utility colors that don't match Razzle's warm palette. They are cold-toned greens and reds that look foreign against the sand background.

#### 7. Additional off-palette colors: `#e74c3c`, `#eab308`, `#f472b6`
- **File**: `frontend/lab-panels.js:6490` -- comparison chart colors array
- **File**: `frontend/lab-panels.js:6144` -- breakdown chart color for touchdowns
- **File**: `frontend/lab-panels.css:3033` -- `.rpc-avg` background
- **File**: `frontend/fptsbreakdown.html:369` -- TD color
- **Evidence**: `#e74c3c` (flat red), `#eab308` (Tailwind yellow-500), `#f472b6` (Tailwind pink-400)
- **Impact**: More Tailwind/flat-design colors that don't belong in the Razzle palette. These should use `--red`, `--yellow`, `--orange` or their light variants.

#### 8. `#e8a838` and `#cd7f32` used outside palette
- **File**: `frontend/lab-panels.css:414` -- `.tl-tier-label.B { background: #e8a838; }`
- **File**: `frontend/lab-panels.css:2507, 3326` -- `.wkl-rank.top3` and `.ld2-rank.bronze` use `#cd7f32`
- **File**: `frontend/tiers.html:147`, `frontend/rankings.html:236-238`, `frontend/records.html:75`, `frontend/weeklyleaders.html:177`
- **Evidence**: Bronze medal color `#cd7f32` and amber `#e8a838` are not in DESIGN.md
- **Note**: These serve legitimate UX purposes (bronze medals, B-tier). Consider adding them to the palette or using `--yellow` / `--orange` instead.

---

### MEDIUM

#### 9. Hardcoded age-badge text colors not using CSS variables
- **File**: `frontend/lab-panels.css:258-260`, `frontend/lab-panels.css:338-341`, `frontend/rankings.html:236-238`
- **Evidence**: `color: #1a7a6e` (young), `color: #8a6e1a` (prime), `color: #a82d3a` (aging)
- **Impact**: These don't respond to dark mode toggle. They are hardcoded warm-ish tones but should be CSS variables for theme consistency.

#### 10. Warroom pixel canvas uses cold grays extensively (but intentionally)
- **File**: `frontend/warroom.js` -- 30+ instances of `#333`, `#555`, `#666`, `#888`, `#999`, `#aaa`, `#ccc`, `#ddd`
- **Evidence**: Lines 58, 60, 68, 385-387, 423-446, 488, 501, 553, 583-618, 660, 938-970, 1147, 1156, 1229, 1266, 1297
- **Note**: Phase A Task 1 explicitly exempted warroom.js pixel art from color fixes. This is reasonable -- pixel art furniture/objects use gray palette for visual clarity. Flagging for documentation purposes, not as a violation.

#### 11. Gradient usage -- some legitimate, some questionable
- **File**: `frontend/styles.css:731` -- skeleton shimmer animation (`linear-gradient`)
- **File**: `frontend/lab.js:1798` -- data bar visualization (`linear-gradient`)
- **File**: `frontend/index.html:183` -- decorative line pattern (`repeating-linear-gradient`)
- **File**: `frontend/lab.html:1341` -- decorative line pattern (`repeating-linear-gradient`)
- **DESIGN.md says**: "Don't: Gradients"
- **Assessment**: The skeleton shimmer is a standard loading pattern. The data bars use gradient for visualization, not decoration. The repeating-linear-gradients create line patterns, not smooth gradients. All are defensible, but the design guide is absolute. Phase A did not flag or address these.

#### 12. `!important` count: 85+ instances
- **File**: `frontend/styles.css` -- 24 instances
- **File**: `frontend/lab.html` -- 39 instances
- **File**: `frontend/lab-panels.css` -- 7 instances
- **File**: Various HTML files -- 15 instances
- **File**: `frontend/agents.html` -- 1 instance
- **Assessment**: Most are in media queries (`.hide-mobile`, `.nav-links display:none`, print styles) or specificity overrides (`.nav-signout` legacy compat). These are standard patterns. The `lab.html` count (39) is concerning -- many are inline `<style>` blocks for the screener table that could be structured better. Not a design violation per se, but a code smell.

#### 13. `color: white` / `color: #fff` used extensively on colored backgrounds
- **File**: `frontend/styles.css` -- 10 instances, `frontend/lab-panels.css` -- 95+ instances
- **Evidence**: Position badges, tier badges, active buttons all use `color: white` or `color: #fff`
- **Assessment**: This is standard practice for text on colored backgrounds (e.g., a QB badge with blue background needs white text). Not a violation. However, these will not auto-adjust in dark mode since they are hardcoded rather than using a CSS variable. Consider adding a `--text-on-color` variable.

#### 14. Inline `style=` attributes: 5,209 instances across 85 files
- **Assessment**: The vast majority are in JS-generated HTML (tables, cards, charts) where inline styles are the practical approach for dynamic data. Many use `var()` references. This is acceptable for a vanilla JS codebase without a framework, but it makes dark mode support fragile for dynamically generated content.

---

### LOW

#### 15. Logo shadow is 3px 3px, not 4px 4px
- **File**: `frontend/styles.css:126`
- **Evidence**: `.logo-mark { box-shadow: 3px 3px 0 var(--ink); }`
- **DESIGN.md says**: "Box shadows: 4px 4px 0 var(--ink) on cards, containers"
- **Assessment**: The logo mark is small (38px). 3px shadow may be an intentional proportional choice. But it deviates from the spec.

#### 16. Multiple card-like elements use 3px 3px shadow instead of 4px 4px
- **File**: `frontend/lab-panels.css:3234, 3311, 3315, 3366, 3390, 3574, 4114`
- **Evidence**: Cards and tooltips with `box-shadow: 3px 3px 0 var(--ink)` instead of the spec'd `4px 4px 0`
- **Assessment**: These are inconsistent with the primary `--shadow-chunky: 4px 4px 0` defined in styles.css. Some cards use the variable, others hardcode 3px.

#### 17. No Tailwind utility classes found
- **Assessment**: Clean. No Tailwind detected. This was a concern from the prior review and it has been resolved.

---

## Trend Comparison (vs 2026-03-13 review)

| Issue from prior review | Status |
|------------------------|--------|
| Undefined CSS vars (`--accent`, `--bg-main`, `--border-light`, `--font-data`) | **FIXED** |
| Cold Tailwind grays (`#e5e7eb`, `#374151`, `#f3f4f6`, `#3a3a3a`, `#808080`) | **FIXED** |
| 121 bare `sans-serif` canvas calls in lab.js/charts.js/player.js/compare.js | **PARTIALLY FIXED** -- sans-serif gone, but 63 bare `monospace` remain |
| 200+ hardcoded hex values bypass CSS variables | **NOT FIXED** -- still pervasive in charts.js, lab.js, lab-panels.js |
| 56 instances of 1px solid borders in lab-panels.css | **NOT FIXED** -- now 60+ files have 1px borders |
| Gradient in data bars | **NOT FIXED** -- still present |
| No hamburger menu | **FIXED** |

**Net assessment**: Phase A fixed the most visible problems (undefined variables, Tailwind grays, mobile nav) but left the systemic issues (1px borders, bare monospace, off-palette colors) largely untouched. The audit was surface-level.

---

## Priority Recommendations

1. **Fix `--ink-light` to `#8a7565`** in both light and dark mode. This is a single-line fix that affects the entire site. (CRITICAL)
2. **Replace all 63 bare `monospace` with `'Space Mono', monospace`** in canvas rendering. Find-and-replace operation. (HIGH)
3. **Upgrade all 1px table borders to 2px dashed** across 60+ HTML files and JS inline styles. This is tedious but systematic. (HIGH)
4. **Fix 4 remaining `sans-serif` canvas calls** in archetypes.html, auction.html, dashboard.html, tiers.html. (HIGH)
5. **Replace `#16a34a`/`#dc2626` with `--semantic-green`/`--semantic-red`** or `--green`/`--red` CSS variables. 25 instances total. (HIGH)
6. **Replace `#e74c3c`/`#eab308`/`#f472b6`** with palette colors. 8 instances. (MEDIUM)
7. **Standardize card shadows to 4px 4px** or use `var(--shadow-chunky)`. 7 inconsistent instances. (LOW)
