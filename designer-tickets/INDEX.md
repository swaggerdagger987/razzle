# Design QA Tickets — Batch 2026-03-23

100 tickets from design audit against DESIGN.md. Cycles 1-3: code-based token audit. Cycle 4: sitewide pattern audit. Cycles 5-8: visual QA with screenshots. Cycle 9: visual QA + code audit. Cycle 10: code-level systematic audit. Cycle 11: type scale, spacing, voice. Cycle 12: visual QA + interaction audit (hover states, dark mode, skeleton loaders, position colors). Cycle 13: design system tokens, accessibility gaps, cross-browser, brand voice. Cycle 50: boom/bust canvas dark mode, home mini-screener accessibility, sitewide nowrap overflow, position tab ARIA. Cycle 51: UX flow audit — copy accuracy, discoverability, action feedback, label clarity. Cycle 54: interaction lifecycle, modal stacking, floating UI cleanup, conversion flow. Cycle 57: error recovery, animation polish, sharing UX, footer consistency.

## Cycle 57 — DQ-441 to DQ-450

| Ticket | Priority | Summary | Files |
|--------|----------|---------|-------|
| DQ-441 | P2 | Modal overlays (filter, column-picker) have zero open/close animation — instant display toggle | lab.html:896-956 |
| DQ-442 | P2 | Error state and empty state visually indistinguishable in standalone panels | breakouts.html:548,555; aging.html:745; lab-panels.js |
| DQ-443 | P2 | 33 standalone tool pages lack shareable URL state — kills Reddit sharing | tradevalues.html, rankings.html, +31 more |
| DQ-444 | P2 | 5+ standalone panels still lack retry button — DQ-118 gap | breakouts.html:548, aging.html:745, buysell, scarcity, yoy |
| DQ-445 | P1 | 10+ lab-panels.js catch handlers are empty — loading hangs forever on API error | lab-panels.js:332,749,1027,1099,1239,1371 |
| DQ-446 | P3 | hideHoverCard() display:none kills CSS opacity transition — instant disappear | lab.js:2252-2253 |
| DQ-447 | P3 | 33 standalone pages missing /prompts.html in footer vs main pages | advantage.html +32 more |
| DQ-448 | P3 | Lab weekly row expand error shows text but no retry button | lab.js:2431 |
| DQ-449 | P3 | breakouts.html error handler uses .breakouts-empty class — wrong semantics | breakouts.html:325,548,555 |
| DQ-450 | P2 | agent-nudges.js animation bypasses prefers-reduced-motion — a11y violation | agent-nudges.js:121,159 |

## Cycle 54 — DQ-421 to DQ-430

| Ticket | Priority | Summary | Files |
|--------|----------|---------|-------|
| DQ-421 | P1 | Tag picker + note editor {once:true} listener re-attach loop — unbounded accumulation | lab.js:496-508,614-626 |
| DQ-422 | P1 | Keyboard shortcuts fire while overlays open — causes modal stacking | lab.js:10530,3471,4257,10711 |
| DQ-423 | P1 | renderTableBody() doesn't dismiss floating UI — orphaned tag picker, note editor, context menu, colStats popover | lab.js:2010 |
| DQ-424 | P2 | Hover card _hoverTimer fires after table re-render — stale DOM access | lab.js:2259-2270 |
| DQ-425 | P2 | Compare/Player pages duplicate showToast — missing a11y, bypasses design system | compare.js:892, player.js:804 |
| DQ-426 | P2 | Watermark image preload missing onerror handler — silent failure | app.js:486-492 |
| DQ-427 | P2 | AbortController timeout not cleared in catch block — orphaned timers | warroom.js ~1990,2404,2460,2505 |
| DQ-428 | P2 | Saved Views delete button invisible on touch/mobile — relies on hover | lab.js ~4563 |
| DQ-429 | P1 | Monte Carlo simulation — no error recovery on empty roster, button state stuck | league-intel.html ~6972-7050 |
| DQ-430 | P1 | Agent API key saved without validation — no persistent error badge after 401 | warroom.js ~1472, ~2836 |

## Cycle 51 — DQ-391 to DQ-400

| Ticket | Priority | Summary | Files |
|--------|----------|---------|-------|
| DQ-391 | P1 | Pricing page claims Pro/Elite have "same features" — factually wrong | pricing.html:327 |
| DQ-392 | P2 | Agents scenario textarea uses stale 2023 player example | agents.html:1772 |
| DQ-393 | P2 | "Use in Situation Room" button saves to localStorage silently — no feedback | prompts.html:264 |
| DQ-394 | P2 | Lab keyboard hint "H R B L I T D G A" cryptic — zero context | lab.html:3398 |
| DQ-395 | P2 | "Fantasy Only" button label semantically backwards — describes result not action | lab.html:3386 |
| DQ-396 | P2 | Bureau "Connect Your Sleeper" heading unclear to non-Sleeper users | league-intel.html:1972 |
| DQ-397 | P2 | Prompts truncated text at 120px max-height with no expand indicator | prompts.html:69-71 |
| DQ-398 | P2 | Toast and auth modal share z-index 9999 — collision risk | styles.css:647,1609 |
| DQ-399 | P2 | Agents API key config inputs have no visible labels | agents.html:1667-1686 |
| DQ-400 | P2 | Lab Smart Filters buried at end of filter bar — beginners miss it | lab.html:3445-3453 |

## Cycle 50 — DQ-381 to DQ-390

| Ticket | Priority | Summary | Files |
|--------|----------|---------|-------|
| DQ-381 | P2 | Boom/bust canvas hardcoded hex (12 instances, should use getCanvasTheme()) | lab.js:12762-12882 |
| DQ-382 | P1 | posColor+"40" alpha concat produces invalid CSS in dark mode | lab.js:12864,13088 |
| DQ-383 | P2 | Boom/bust export PNG ignores user theme — hardcoded light-mode colors | lab.js:13030-13102 |
| DQ-384 | P2 | Home mini-screener .mini-tab position tabs no focus-visible | index.html:376-389 |
| DQ-385 | P2 | Home mini-screener .mini-sortable column headers no focus-visible | index.html:412-414 |
| DQ-386 | P2 | Server-offline messages hardcoded #6b5a4e/#a89585 — invisible dark mode | agents.html, lab.html, league-intel.html |
| DQ-387 | P2 | white-space:nowrap without ellipsis — 156 instances across 69 files | sitewide |
| DQ-388 | P2 | Position filter tabs missing role="tab" in 17 standalone pages | 17 HTML files |
| DQ-389 | P2 | Inline JS hover handlers bypass @media(hover:hover) — stuck on touch | lab.js, formula-store.js, player.js |
| DQ-390 | P3 | Hero mascot emoji no aria-label — screen readers get raw Unicode | index.html, about.html |

## P1 — High Impact (visible on every page)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-001 | Dark mode --ink-light wrong hex (#a89888 vs #8a7565) | styles.css:80 |
| DQ-002 | btn-chunky/btn-primary box-shadow 2px instead of 4px | styles.css:761,789 |
| DQ-003 | Hover lift missing translate(-2px,-2px) on buttons | styles.css:766,794,1053 |
| DQ-011 | Sitewide box-shadow undersized (2px/3px instead of 4px) | 22 HTML files, 72 instances |
| DQ-015 | Tiers page cream text hardcoded rgba, poor contrast | tiers.html:144,217 |
| DQ-021 | Canvas `bold` on single-weight Luckiest Guy (47 instances) | lab.js, charts.js, compare.js, player.js |
| DQ-022 | overflow:hidden clips 4px box-shadows on 8 cards | lab-panels.css (8 classes) |
| DQ-023 | Dark mode overlays still use cold black rgba(0,0,0) | lab.html, player.js |
| DQ-024 | Correlation heatmap canvas hardcodes #fff text | lab-panels.js:9821,10118 |
| DQ-031 | Agents page hero+footer on light sand (should be all dark) | agents.html |
| DQ-032 | Agent names don't match DESIGN.md (Bones/Octo/Atlas) | agents.html:1619-1624 |
| DQ-041 | Pricing dark mode — comparison table text barely readable | pricing.html:169-183 |
| DQ-042 | Pro gate — 48+ panels identical generic lock, no teaser | lab.html (switchPanel) |
| DQ-051 | **4 files reference UNDEFINED position color CSS vars** (--qb not --pos-qb) | dashboard, tiers, auction, archetypes (32 rules) |
| DQ-052 | Home page Caveat font on primary selling content (hero sub + all sections) | index.html:94,235,259 |

## P2 — Medium Impact (visible in specific views)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-004 | 15x border-bottom:1px in JS tables (should be 2px dashed) | charts.js, lab.js, formulas.js, player.js, lab-panels.js |
| DQ-005 | Noscript blocks hardcode colors + fonts | lab.html, league-intel.html, agents.html |
| DQ-006 | border-radius 3px/4px/6px not in token set | warroom.js, lab-panels.js, lab.js |
| DQ-007 | charts.js position color map hardcoded 3x | charts.js:341,672,1021 |
| DQ-008 | charts.js accent colors hardcoded (no dark mode) | charts.js:3-561 |
| DQ-012 | Off-token border-radius 14px (should be 12px) | archetypes.html, dashboard.html, lab-panels.css, tiers.html |
| DQ-013 | Off-token border-radius 6px (should be 8px) | lab.html:2246,2493 |
| DQ-014 | Hover shadow wrong size (5px/3px instead of 6px/4px) | lab.html:2147,475 |
| DQ-017 | Sort column bg hardcoded terracotta rgba | lab.html:1063-1068 |
| DQ-018 | Cold black rgba(0,0,0,...) shadows (should be warm brown) | agents.html:39,259,285 |
| DQ-020 | Dashboard/tiers hover + text-shadow no dark mode override | dashboard.html:145, tiers.html:139 |
| DQ-025 | 6 remaining off-token border-radius in lab-panels.css | lab-panels.css (6 values) |
| DQ-026 | cmd-palette-item + nav-dropdown-item missing :focus-visible | styles.css |
| DQ-028 | 4 interactive elements missing :active press state | agents.html, lab.html, lab-panels.css, styles.css |
| DQ-029 | Z-index hierarchy undocumented (9999, 10000, 1000) | styles.css |
| DQ-033 | Tiers tier-letter badges have NO rotation (should be 3deg) | tiers.html:125-146 |
| DQ-035 | Tiers/Rankings no dark mode overrides for tier colors | tiers.html, rankings.html |
| DQ-037 | Standalone redirect pages show flash of Pro gate content | stocks.html, reportcard.html, etc. |
| DQ-039 | Lab mobile toolbar cramped touch targets (<44px) | lab.html |
| DQ-040 | Standalone page cards hover shadow stays 4px (should grow to 6px) | breakouts.html, dashboard.html, tiers.html |
| DQ-043 | Compare page empty state — no illustration or example | compare.html, compare.js |
| DQ-044 | Rankings player names truncated in cards (~140px) | rankings.html:201-209 |
| DQ-045 | Tiers chip density too cramped (~6px gap, needs 10-12px) | tiers.html |
| DQ-046 | Home Situation Room demo is tiny static card, not visual | index.html |
| DQ-047 | Breakouts page — all cards identical weight, no hierarchy | breakouts.html |
| DQ-048 | Bureau pre-connect — generic form, no feature preview | league-intel.html |
| DQ-050 | Pricing mobile — comparison table cramped at 375px | pricing.html |
| DQ-053 | Home feature card icons are generic system emoji (not SVGs) | index.html:693-708 |
| DQ-054 | Home "Connect Your League" section has no visual/preview | index.html:752-755 |
| DQ-055 | Brand mascot is system emoji (no custom illustration anywhere) | index.html, 404.html, about.html, all pages (nav) |
| DQ-056 | Meta theme-color hardcoded to light #ede0cf on all 70+ pages | all pages, app.js |
| DQ-057 | Dashboard top-5 cards missing position-colored 6px top stripe | dashboard.html:65,488 |
| DQ-058 | Archetypes/auction hardcode position hex in rgba() backgrounds | archetypes.html:150-153, auction.html:234-235 |

## P3 — Low Impact (polish)

| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-009 | Razzle mascot image empty alt text | agents.html:1633 |
| DQ-010 | Pixel engine uses 20+ cold gray hex values | warroom.js:418-651 |
| DQ-016 | Hero mascot drop-shadow hardcoded, invisible in dark mode | index.html:77 |
| DQ-019 | Konami confetti hardcoded position color hex values | app.js:1741 |
| DQ-027 | SVG research-sprawl.svg uses system-ui font fallback | assets/research-sprawl.svg |
| DQ-030 | Transition timing inconsistent (0.1s vs 0.12s standard) | styles.css, agents.html, lab.html |
| DQ-034 | Rankings tier badges wrong rotation angle (-2deg vs 3deg) | rankings.html:117 |
| DQ-036 | Dashboard hover hardcoded rgba(217,119,87,0.05) | dashboard.html:145 |
| DQ-038 | Pro teaser uses custom .btn-pro-upgrade instead of .btn-primary | agents.html, warroom.js |
| DQ-049 | Pricing dark mode — feature pills harsh teal borders | pricing.html |
| DQ-059 | Home agent demo card uses wrong name "Bones" (should be "The Fox") | index.html:770 |
| DQ-060 | Home pricing subtitle — inline Caveat on trust/selling copy | index.html:787 |

## Cycle 10 — Code-Level Systematic Audit (DQ-061 to DQ-070)

### P1
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-061 | Watermark missing on ~43 pages, split implementation on remaining 32 | 75 HTML files |

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-062 | `transition: all` performance anti-pattern — 23+ instances | agents.html, aging.html |
| DQ-063 | agents.html hover lift undersized — 7+ hovers go to 4px not 6px | agents.html |
| DQ-064 | `outline: none` without `:focus-visible` — 4 new instances | agents.html (3), lab-panels.css (1) |
| DQ-066 | `max-width` inconsistency — 6+ values across 70+ pages | 70+ standalone HTML |
| DQ-068 | agents.html agent card drop-shadow(2px) — undersized | agents.html:285 |
| DQ-069 | lab.html sticky header dark mode cold black blur shadow | lab.html:1040 |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-065 | formulas.js `border-radius: 4px` in inline cssText | formulas.js:273 |
| DQ-067 | agents.html btn-pro-upgrade hover uses off-spec 5px shadow | agents.html:727 |
| DQ-070 | agents.html 37 long inline style= attrs — unmaintainable | agents.html |

## Cycle 11 — Type Scale, Spacing, Voice & Architecture (DQ-071 to DQ-080)

### P1
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-071 | **font-size: 10px used 325+ times — not in type scale** | 66+ files (lab-panels.css: 125, lab.html: 43, league-intel.html: 45) |
| DQ-072 | **font-size: 9px used 133 times — below type scale floor** | 20 files (lab-panels.css: 31, league-intel.html: 34, lab.html: 25, lab.js: 15) |

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-073 | font-size 22px (49x) and 26px (41x) — off-spec display sizes | 40+ files |
| DQ-074 | font-size: 15px used 38 times — off-spec (between 14 and 16) | 20 files |
| DQ-075 | gap values 1-3px across 30+ files — too tight for design system | 30+ files (lab-panels.css: 26, lab.html: 19) |
| DQ-076 | 16+ pages use generic "no X found" empty states — no personality | 16 HTML files + lab-panels.js |
| DQ-077 | "fumbled the data fetch" error msg 9+ times — not centralized | 9 files (razzleError() exists but unused) |
| DQ-078 | font-size: 28px used 26 times — off-spec hero sections | 12 files (pricing: 5, lab-panels.css: 5, index: 3) |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-079 | z-index 14 distinct values in inline HTML — no token system | 30+ files (values: 1 to 10001) |
| DQ-080 | letter-spacing used 76 times with no design system guidance | 20+ files (5 different values, no tokens) |

## Cycle 12 — Visual QA + Interaction Audit (DQ-081 to DQ-090)

### P1
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-085 | btn-chunky no dark mode override — Sign In invisible in dark | styles.css, all pages |

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-081 | Home feature-card missing hover lift (no :hover rule at all) | index.html:328-352 |
| DQ-082 | btn-chunky/btn-primary base padding mismatch + 6 inline overrides | styles.css:755,783, pricing.html, agents.html |
| DQ-086 | Standalone pages have text-only loading — no skeleton cards | dashboard.html, rankings.html, tiers.html, 20+ pages |
| DQ-087 | Position filter buttons show no position color when inactive | rankings.html, tiers.html, 10+ standalone pages |
| DQ-088 | Agent icon SVGs missing onerror fallback — broken images on failure | agents.html, index.html |
| DQ-089 | Trade values 150-player chart has no tier breaks or section headers | tradevalues.html |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-083 | Pricing page missing watermark div | pricing.html |
| DQ-084 | Footer personality text ("made for Reddit") not using Caveat font | index.html:912-913 |
| DQ-090 | Pricing comparison table thin 1px dividers, invisible in dark mode | pricing.html |

## Cycle 13 — Design System Tokens, Accessibility, Cross-Browser, Brand Voice (DQ-091 to DQ-100)

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-091 | No custom scrollbar colors — default browser scrollbars clash with warm palette | styles.css |
| DQ-092 | line-height fragmented — 21 distinct values with no design tokens | styles.css, lab-panels.css, 30+ pages |
| DQ-093 | prefers-reduced-motion — only 1 CSS @media rule, 150+ animated elements unprotected | styles.css |
| DQ-094 | lab-panels.css — 121 :hover rules vs 5 :focus-visible, keyboard nav dead zone | lab-panels.css |
| DQ-097 | Dynamic headshot img tags missing width/height — CLS layout shift risk | 11+ standalone HTML files |
| DQ-099 | All 47 table elements missing caption — WCAG 1.3.1 violation | all HTML files with tables |
| DQ-100 | Pricing dark mode FAQ/feature description sections unreadable contrast | pricing.html |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-095 | Placeholder text generic — 32/35 inputs say "Search..." not personality language | lab.html, league-intel.html, agents.html, 8+ pages |
| DQ-096 | backdrop-filter missing -webkit- prefix — Safari blur broken on cmd palette | styles.css:1073 |
| DQ-098 | opacity values fragmented — 12 distinct values, no semantic tokens | styles.css, agents.html, 30+ pages |

## Cycle 22 — Fresh Code Audit (DQ-131 to DQ-140)

### P1
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-131 | **Sitewide hover translate(-1px) should be (-2px)** — 35 instances, 16 files | styles.css, index.html, lab.html, agents.html, league-intel.html, +11 more |

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-132 | Agent config non-standard hex colors (#e87422 Octo, #d44040 Atlas) | agent-config.js |
| DQ-133 | Prompts .prompt-agent badge missing 2px border (vs .prompt-cat) | prompts.html:60 |
| DQ-134 | Home page 4 different max-widths (760/820/860/960px) — uneven edges | index.html |
| DQ-136 | Prompts .use-btn hover shadow only 2px, no lift | prompts.html:87 |
| DQ-139 | 404 tigerWalk CSS animation no prefers-reduced-motion guard | 404.html:98-126 |
| DQ-140 | Prompts truncated text no visual expand indicator (fade/chevron) | prompts.html:65-72 |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-135 | Cheatsheet player link uses old /player.html?id= pattern | cheatsheet.html:461 |
| DQ-137 | Social-card uses --radius-sm (8px) should be --radius (12px) for cards | index.html:428 |
| DQ-138 | Prompts filter pills lose ink border on hover — fills solid orange | prompts.html:40-42 |

## Cycle 25 — Integration Flow + Dark Mode + Mobile Hardening (DQ-161 to DQ-170)

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-161 | **Canvas watermark invisible in dark mode — 10 pages** | drops, gamescript, dualthreat, garbagetime, seasonpace, snapefficiency, successrate, targetpremium, tdregression, workload |
| DQ-164 | Lab sidebar blurry shadow (-8px 0 24px) breaks comic-strip aesthetic | lab.html:596 |
| DQ-165 | fptsbreakdown + percentiles text-shadow no dark mode override | fptsbreakdown.html:215, percentiles.html:226 |
| DQ-167 | **22 standalone pages missing 480px mobile breakpoint** | about, advantage, breakdown, comptable, drops, dualthreat, +16 more |
| DQ-170 | **Export PNG buttons have no loading feedback (40+ pages)** | all standalone pages with html2canvas |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-162 | 4 pages use absolute asset paths while 71 use relative | 404.html, compare.html, player.html, team.html |
| DQ-163 | 3 loading text strings use generic verbs ("analyzing", "crunching") | airyards.html, explorer.html, lab.js, lab-panels.js |
| DQ-166 | agents.html border-top:1px dashed — should be 2px | agents.html:2271 |
| DQ-168 | lab-panels.css hover shadows use 3px offset — should be 6px | lab-panels.css:468, :2308 |
| DQ-169 | Headshot onerror hides image but leaves layout gap — no fallback | 19+ standalone pages |

## Cycle 26 — Interaction Quality + Accessibility (DQ-171 to DQ-180)

### P0
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-172 | **GP filter tag uses non-existent --bg-sand CSS variable** | lab.js:3271 |

### P1
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-171 | **Native confirm() dialogs break Razzle immersion — 3 calls** | formulas.js:99, lab.js:4415, lab.html:3406 |
| DQ-173 | **breakdown.html canvas 560x560 overflows mobile, no 480px breakpoint** | breakdown.html:634 |
| DQ-175 | **Pricing interval toggle not keyboard focusable** | pricing.html:236-240 |

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-174 | **Watermark position:fixed no mobile adjustment — 22 pages** | aging, airyards, awards, +19 more |
| DQ-176 | Promo code input missing label element | pricing.html:333 |
| DQ-178 | auction.html search input missing all ARIA attributes | auction.html:350 |
| DQ-179 | **Home CTA buttons have 10+ line inline onclick handlers** | index.html:822, 839 |
| DQ-180 | Lab "Reset All" filter tag inline-styled, dark mode can't override | lab.js:3284 |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-177 | Console.log ASCII tiger art fires on every page load | app.js:1709-1715 |

## Cycle 45 — UX Edge Cases + CTA Hierarchy + Metadata (DQ-341 to DQ-350)

### P1
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-341 | **Agents page OG metadata uses old role names (Scout, Quant, Medic)** | agents.html:9 |

### P2
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-342 | Home btn-hero hover shadow stays 4px instead of growing to 6px | index.html:121-124 |
| DQ-343 | Home page has 3 competing btn-hero-primary CTAs — broken hierarchy | index.html:647,683,755 |
| DQ-344 | Dashboard top5/trends render blank sections when empty | dashboard.html:485-513 |
| DQ-345 | Situation Room canvas placeholder has no timeout or error state | agents.html:1654-1658 |
| DQ-347 | Home page smart-chips have no :focus-visible state | index.html:355-373 |
| DQ-350 | Pricing promo cards have no expiration/sold-out fallback | pricing.html:737-758 |

### P3
| Ticket | Summary | Files |
|--------|---------|-------|
| DQ-346 | Pricing promo cards built entirely with inline styles (40+ lines) | pricing.html:740-779 |
| DQ-348 | Canvas placeholder icon uses cold black rgba(0,0,0) drop-shadow | agents.html:285 |
| DQ-349 | Home section CTAs override btn-hero sizing with inline styles | index.html:683,755,778 |
