# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## DESIGN REFERENCE

All tickets below implement the Agent Connective Tissue design. Full design doc: `docs/plans/2026-03-20-agent-connective-tissue-design.md`. Read it before starting any ticket.

---

## Phase: P0 — CRITICAL: Half the Product Is Broken

**PRIORITY: P0 — THE SITE IS LIVE. PEOPLE ARE VISITING FROM TWITTER. HALF THE PANELS DO NOT LOAD AND THE ENTIRE BUREAU IS DOWN.**

The QA and Ship loops have been running for hundreds of sessions claiming things are fixed, but the actual user experience is broken. This is not a polish issue. This is a "the product doesn't work" issue. The two main things that needed hardening — Lab panels and the Bureau — are both failing.

**DO NOT mark tasks as DONE unless you have loaded the page in a browser and visually confirmed the data renders.** Screenshots required for every fix. No more claiming completion without evidence.

### Task 1: Fix EVERY broken Lab panel

**Accept when**: Open EVERY panel in the Lab sidebar on localhost:8000. For each panel:
1. Click it
2. Wait 5 seconds for data to load
3. Does it show data? Or does it show an error, empty state, or infinite loading?
4. Screenshot it

Any panel that does not load data is a bug. Fix it. The panels that are known to be broken need to be identified first — open all 70+ panels one by one and log which ones work and which don't. Then fix every broken one. This is not optional work. This is the core product.

**Evidence required**: A checklist of all panels with PASS/FAIL and a screenshot of each broken panel after fixing.

### Task 2: Fix the Bureau of Intelligence completely

**Accept when**: league-intel.html fully works again — Sleeper connection flow, league loading, odds cards, self-scout, trade finder, all Bureau features functional. Test the full flow: enter a Sleeper username, select a league, see odds cards. If any step fails, fix it. This was working before the ship loop touched it.

**Accept when**: The FULL Bureau flow works end-to-end:
1. Open league-intel.html
2. Enter a Sleeper username — does the input work?
3. Click connect — does it fetch leagues?
4. Select a league — does it load rosters?
5. Do odds cards render with championship/playoff percentages?
6. Does Self-Scout load and show roster analysis?
7. Does Trade Finder load and show trade suggestions?
8. Does Pressure Map load?
9. Does Manager Profiles load?
Every single step must work. If ANY step fails, fix it before moving on. Screenshot each step after fixing.

### Task 3: Restore original nav names

The ship loop renamed the navigation tabs. The correct names are:

- **"Fourth Down Lab"** (not "Lab" or "The Lab" or "Screener")
- **"Bureau of Intelligence"** (not "Bureau" or "League Intel")
- **"Situation Room"** (this one may be correct, verify)

These are the BRAND NAMES. They are not suggestions. Do not rename them to be "self-describing" or "simpler." The names ARE the brand.

**Accept when**: All navigation links, page titles, headers, and any references across the entire site use the exact names: "Fourth Down Lab", "Bureau of Intelligence", "Situation Room". Check: index.html nav, app.js nav builder, all page `<title>` tags, all H1/H2 headers, pricing page feature lists, any marketing copy. Grep for "League Intel", "The Lab", "AI Agents" and replace with the correct brand names.

---

## Phase: P0 — Agent Presence Is Invisible (Ship Loop Claimed Done But Nothing Shows)

**PRIORITY: P0 — the entire agent connective tissue design is not visible on the live site.**

The ship loop marked Agent Layers 1-3 as "COMPLETED" but the founder cannot see any agent presence anywhere on the site. The code exists (agent-config.js, agent-nudges.js, SVG icons in assets/agents/) but agents are NOT visible to users. This needs to be verified and fixed.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md`

The agents should be the personality of the site. Right now the site feels the same as before — no agent icons, no agent-voiced loading states, no margin notes, no personality layer. The whole point of the connective tissue design was to make the agents FELT across every page.

### Task 1: Audit what actually renders on the live site

**Accept when**: Browse every page (index, lab, league-intel, agents, pricing) on localhost:8000 and screenshot each one. For each page, document:
- Are agent SVG icons visible anywhere? (column tooltips, panel headers)
- Are loading states using agent-voiced Caveat-font copy? ("checking the injury wire...", "scanning the tape...")
- Are empty states using agent personality? ("Nothing worth your time right now.")
- Are margin notes visible on any panels?
- Does the 404 page use Razzle's voice?
- Do panel subtitles show agent attribution? ("Dr. Dolphin — Medical Analyst")
If ANY of these are missing, fix them. The agent-config.js territory map defines what goes where.

### Task 2: Make Layer 1 visible to FREE users

**Accept when**: A free user (not logged in) visiting the Lab sees:
- Caveat-font loading states with agent personality when data loads
- Agent-voiced empty states when no results match
- 16px agent avatar icons in column header tooltips (hover to see "Dr. Dolphin — Medical Analyst")
- 20px agent icons + name in panel subtitle/attribution lines
- These are NOT gated behind Pro/Elite — they are the free personality layer
- Verify by opening in an incognito browser with no auth

### Task 3: Make Layer 1 visible on Bureau

**Accept when**: A free user visiting the Bureau (league-intel.html) sees:
- Agent-voiced loading states (Octo: "running the numbers...", Bones: "reading the room...")
- Agent attribution on Bureau sections
- The same personality treatment as the Lab

### Task 4: Verify ambient character peek works

**Accept when**: Refresh any page 10+ times. On roughly 1 in 7 loads, a character sprite peeks from the margin. If this doesn't work, implement it — a small agent sprite (contextual to the page) slides in from the right edge, is dismissible on click, does not shift layout.

### Task 5: Verify rarity watermarks on screenshot exports

**Accept when**: Export a screenshot from the Lab screener. The watermark includes a random agent sprite (1/6 chance each agent) alongside "razzle.lol" text. If this doesn't work, implement it.

### Task 6: Deploy to production

**Accept when**: All changes from Tasks 1-5 are committed, pushed to master, and verified on razzle.lol (not just localhost). The live site shows agent personality on every page load.

---

## PREVIOUSLY CLAIMED COMPLETED (needs verification)

The ship loop claimed Layers 1-3 were done. The code exists but may not be rendering. After Task 1 above verifies what's actually working, update this section:
- Layer 1: SVG icons, agent-config.js, loading/empty/error states, tooltips, panel headers, 404, Bureau
- Layer 2: Sidebar agent attribution, one-liner insights (Pro-gated)
- Layer 3: Elite nudge system (agent-nudges.js, 12 cross-product nudges)
- Rarity watermarks (random character on screenshot exports)
- Ambient character peek (1/7 page load)
- Weekly briefing in Situation Room (Pro+)
- FAAB Strategy panel in Lab

---

## Phase: Autoresearch Engine — Synthetic User Simulation

**PRIORITY: Build this. Nothing is blocking it.** Playwright is installed. Claude API is available. This is pure Python logic.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "Autoresearch Self-Improvement Engine"

**Exit criterion**: 20+ user personas defined. Simulation runner executes full site journeys via Playwright with Sonnet making navigation decisions. All interactions instrumented and logged.

### Task 1: Create user persona definitions

**Accept when**: `self-improvement/personas/` directory contains 20+ JSON persona files. Each defines: id, description, experience level, league format, behavior type, goals, patience, upgrade likelihood, session length. Personas span: dynasty veteran, redraft casual, first-timer, trade junkie, data nerd, lurker, mobile-only, prospect obsessed, weekly grinder, commissioner, IDP enthusiast, DFS crossover, podcast listener, spreadsheet migrator, group chat screenshot sharer, auction league player, keeper league player, best ball player, superflex player, TE premium player.

### Task 2: Build simulation runner

**Accept when**: `self-improvement/simulate.py` runs a single simulated user journey:
1. Launches Playwright browser pointed at localhost:8000
2. Takes a screenshot at each navigation step
3. Sends screenshot + persona context to Sonnet via Claude API (`anthropic` Python SDK)
4. Sonnet responds with the next action (click element, scroll, hover, navigate, leave)
5. Executes the action, captures the result
6. Logs every interaction to `self-improvement/simulation-log.jsonl` with: persona, session id, step number, page, action, target element, agent callouts visible, agent callouts clicked, timestamp
7. Continues until persona "leaves" (Sonnet decides session is over) or max 50 steps
8. CLI: `python simulate.py --persona dynasty-veteran --sessions 5`

### Task 3: Build instrumentation layer

**Accept when**: The simulation runner captures per interaction: agent callout impressions, agent callout clicks, agent callout dismissals, hover duration on agent elements, navigation path, time-on-page, conversion events (pricing page visits), feature discovery (which panels found), session depth, session duration. All logged to `simulation-log.jsonl`.

### Task 4: Build batch runner

**Accept when**: `self-improvement/run_batch.py` runs N sessions per persona across all personas, parallelizes with configurable concurrency, aggregates results into `batch-results.json` with overall CTR, conversion rate, avg session depth, per-agent and per-persona breakdowns. CLI: `python run_batch.py --sessions-per-persona 10 --concurrency 2`

---

## Phase: Autoresearch Engine — Self-Reflection Loop

**PRIORITY: Build this right after simulation.** Same tools — Python + Claude API.

**Exit criterion**: Each agent produces insights and updated config. Razzle produces cross-agent strategy. Updated config deploys to frontend.

### Task 1: Build per-agent self-reflection runner

**Accept when**: `self-improvement/reflect.py` reads `simulation-log.jsonl` filtered to one agent's placements, calculates CTR/engagement metrics, sends data + agent persona to Claude API (Opus), agent writes insights markdown + updated placement/copy/timing JSON configs. CLI: `python reflect.py --agent dolphin` or `python reflect.py --all`

### Task 2: Build Razzle strategy session

**Accept when**: `self-improvement/strategize.py` reads all 6 agents' insight files, sends to Opus with Razzle's persona, Razzle writes cross-agent strategy markdown + stitching config JSON. CLI: `python strategize.py`

### Task 3: Build peer review runner

**Accept when**: `self-improvement/peer_review.py` has each agent review one other agent's proposed changes (rotation). Checks for brand drift, spam creep, territory conflicts. Flags go to Razzle for arbitration. CLI: `python peer_review.py`

### Task 4: Build config deployment

**Accept when**: `self-improvement/deploy_config.py` merges approved configs into `frontend/agent-config-optimized.json`, bumps versions, logs to `optimization-log.tsv`. Frontend reads optimized config at runtime if it exists, falls back to defaults.

### Task 5: Build full autoresearch cycle runner

**Accept when**: `self-improvement/run_cycle.py` orchestrates: simulate -> reflect -> strategize -> peer review -> deploy -> log. Optional `--auto-revert` reverts if metrics regress. CLI: `python run_cycle.py --sessions-per-persona 10`

---

## DEFERRED PHASES (need MiroFish service — build post-launch)

### Phase: MiroFish Integration — Decision Sandbox (Pro)
- MiroFish backend service + adapter
- Branching timeline SVG UI
- Decision Sandbox page

### Phase: MiroFish Integration — Season Simulator (Elite)
- Full season simulation endpoint
- Season Simulator page with progress UI
- Agent narration layer on timeline nodes

### Phase: Verification — Agent Connective Tissue
- Free/Pro/Elite tier experience verification
- Design compliance check (DESIGN.md alignment)

Full task specs are in `docs/plans/2026-03-20-agent-connective-tissue-design.md`.

---

## Design QA — 10 Tickets (2026-03-26)

> Findings from automated site walk + source audit against `docs/DESIGN.md`.

---

### DQ-314: Off-brand agent colors — #e87422 and #d44040 not in design palette

**Severity**: Medium
**Files**: `frontend/agent-config.js:94,122`, `frontend/warroom.js:362,727,729`, `frontend/lab.js:9769,9872`, `frontend/draftclass.html:628`

Octo uses `#e87422` and Atlas uses `#d44040`. Neither color exists in `DESIGN.md`. The palette defines `--orange: #d97757` and `--red: #e63946`. These off-brand colors leak into chart palettes, war room sprites, and Lab panel charts. Either add them as official `--pos-octo` / `--pos-atlas` agent tokens in `:root` and `DESIGN.md`, or replace with the nearest palette colors (`--orange` and `--red`).

**Accept when**: Every instance of `#e87422` and `#d44040` either uses a CSS variable or is documented in `DESIGN.md` as an official agent accent.

---

### DQ-315: Hardcoded colors in noscript fallback blocks

**Severity**: Low
**Files**: `frontend/agents.html:1604,1607`, `frontend/lab.html:3161,3164`, `frontend/league-intel.html:2535,2538`

The `<noscript>` blocks use inline `color:#6b5a4e` and `color:#a89585`. These are not design tokens — `#6b5a4e` is between `--ink-medium` (`#5c4a3d`) and `--ink-light` (`#8a7565`), and `#a89585` is between `--ink-light` and `--ink-faint` (`#c4b5a5`). Also uses hardcoded `font-family:'Space Mono',monospace` and `font-family:'Caveat',cursive` instead of `var(--font-mono)` and `var(--font-hand)`.

**Accept when**: Noscript blocks use `var(--ink-medium)` / `var(--ink-light)` and `var(--font-mono)` / `var(--font-hand)`. (CSS vars work in noscript since the stylesheet still loads.)

---

### DQ-316: Gradient in prompts.html violates "NO gradients" rule

**Severity**: Low
**Files**: `frontend/prompts.html:78`

`.prompt-text:not(.expanded)::after` uses `background: linear-gradient(transparent, var(--bg))` as a fade-out overlay on truncated text. DESIGN.md explicitly says **"Don't: Gradients"**. Replace with a solid `background: var(--bg)` mask with reduced height, or a dashed border divider, or simply remove the fade effect and rely on `overflow: hidden` alone.

**Accept when**: Zero `linear-gradient` declarations in any frontend file (excluding comments).

---

### DQ-317: Non-token border-radius: 14px — falls between design tokens

**Severity**: Low
**Files**: `frontend/dashboard.html:113`, `frontend/archetypes.html:115`, `frontend/lab-panels.css:411`, `frontend/tiers.html:120`

Four elements use `border-radius: 14px`. The design tokens are: `--radius-sm: 8px`, `--radius: 12px`, `--radius-lg: 20px`. 14px is not a token. These should use `var(--radius)` (12px) for cards or `var(--radius-lg)` (20px) for pills/sticker shapes.

**Accept when**: Zero hardcoded `14px` border-radius values. All replaced with `var(--radius)` or `var(--radius-lg)`.

---

### DQ-318: Inconsistent box-shadow: 3px 3px used instead of 4px 4px standard

**Severity**: Medium
**Files**: `frontend/aging.html:80`, `frontend/cheatsheet.html:78`, `frontend/lab.html:475,2369,2938,3043`, `frontend/league-intel.html:314,519,608,636`, `frontend/matchups.html:278`, `frontend/prompts.html:39,46`, `frontend/pricing.html:166`, `frontend/scoring.html:78`, `frontend/tools.html:85`, `frontend/lab-panels.css:468,2308,4156`

20+ elements use `box-shadow: 3px 3px 0 var(--ink)`. DESIGN.md specifies: standard shadow = `4px 4px 0 var(--ink)`, hover lift = `6px 6px 0`. The `3px 3px` value is neither — it's a visual inconsistency that makes some cards look thinner than others.

**Accept when**: All `3px 3px 0` shadows are replaced with `4px 4px 0` (standard) or removed if the element is a chip/badge that shouldn't have an offset shadow.

---

### DQ-319: Cold black rgba in shadows — should use warm brown

**Severity**: Medium
**Files**: `frontend/agents.html:39,259,285`, `frontend/lab.html:908,960,1046`

Six instances use `rgba(0,0,0,...)` for shadows and overlays: `rgba(0,0,0,0.4)`, `rgba(0,0,0,0.15)`, `rgba(0,0,0,0.3)`, `rgba(0,0,0,0.5)`, `rgba(0,0,0,0.25)`. DESIGN.md says **"Don't: Cold grays anywhere — even dark mode stays warm (brown, not gray)."** Pure black shadows produce a cold cast. Replace with warm espresso: `rgba(45,31,20,...)` (which is `--ink` / `#2d1f14` in rgba).

**Accept when**: Zero `rgba(0,0,0,` declarations in frontend CSS/HTML. All replaced with `rgba(45,31,20,` at equivalent opacity.

---

### DQ-320: charts.js hardcodes all colors — dark mode will render wrong

**Severity**: High
**Files**: `frontend/charts.js:3,341,379,387,450,491,533,549,561,672,673,828,1021,1111,1196,1230`

`charts.js` has 20+ hardcoded hex colors (`#d97757`, `#5b7fff`, `#2ec4b6`, `#8b5cf6`, `#e63946`) used directly in canvas `ctx.fillStyle`/`ctx.strokeStyle`. Canvas can't use CSS variables, but other files (aging.html, career.html, compare.js) correctly read from computed styles: `getComputedStyle(document.documentElement).getPropertyValue('--orange').trim() || '#d97757'`. Because charts.js skips this, all charts render light-mode colors even in dark mode.

**Accept when**: charts.js reads position and accent colors from computed CSS variables (with hex fallbacks) instead of hardcoding them. Canvas charts render correctly in both light and dark mode.

---

### DQ-321: box-shadow: 5px 5px used — not a standard token value

**Severity**: Low
**Files**: `frontend/about.html:88`, `frontend/agents.html:727`, `frontend/lab.html:2153`, `frontend/index.html:374`, `frontend/matchups.html:115`, `frontend/league-intel.html:1999,2163,2284`, `frontend/styles.css:849,1697`

10 elements use `box-shadow: 5px 5px 0 var(--ink)`. DESIGN.md defines: standard = `4px 4px 0`, hover lift = `6px 6px 0 + translate(-2px,-2px)`. The `5px 5px` value is neither — it's likely intended as a "big card" shadow but doesn't follow the design system. These should either use `4px 4px` (standard) or implement proper hover-lift logic with `6px 6px`.

**Accept when**: All `5px 5px 0` shadows are replaced with `4px 4px 0` (at rest) or `6px 6px 0` (hover state with translate).

---

### DQ-322: `transition: all` used in 30+ places — performance and specificity issue

**Severity**: Low
**Files**: Widespread across `frontend/agents.html` (18 instances), `frontend/aging.html`, `frontend/airyards.html`, `frontend/awards.html`, `frontend/buysell.html`, `frontend/consistency.html`, `frontend/compare.html`, `frontend/cheatsheet.html`, `frontend/breakouts.html`, and more

`transition: all 0.12s` / `transition: all 0.15s` is used broadly instead of targeting specific properties. This transitions unintended properties (color, padding, border) on theme changes and hover states, creating visual jank. Replace with explicit properties: `transition: transform 0.12s, box-shadow 0.12s` for hover-lift elements, `transition: background 0.15s, color 0.15s` for interactive elements.

**Accept when**: Zero `transition: all` declarations in frontend CSS/HTML. All replaced with specific property transitions.

---

### DQ-323: Card-level elements using 2px border instead of 3px

**Severity**: Low
**Files**: `frontend/agents.html:1900` (memoryPanel), `frontend/agents.html:1060`, `frontend/agents.html:74,144,178`, plus various panel control containers

DESIGN.md: "Primary border: 3px solid var(--ink) on cards, containers" and "Secondary border: 2px solid var(--ink) on chips, badges, toggles, buttons." Several card-level elements (the memory panel, scenario cards, agent cards) use `border: 2px solid var(--ink)` instead of the required 3px. This makes them look thinner and less "chunky" than the design intends.

**Accept when**: All card/container elements use `border: 3px solid var(--ink)`. Only chips, badges, and buttons use 2px.

### DQA-314: `.panel-error` references undefined CSS variable `--card-bg`

**Severity**: HIGH — broken styling on every error state
**File**: `frontend/styles.css:934`

`.panel-error` uses `background: var(--card-bg)` but `--card-bg` is never defined in `:root`. The correct variable is `--bg-card`. This means every panel error state renders with the browser default (transparent), losing its card background.

**BEFORE**: `background: var(--card-bg);`
**AFTER**: `background: var(--bg-card);`

Also on line 933: the fallback `var(--red, #e74c3c)` uses an off-palette red. The Razzle palette red is `#e63946`.

**BEFORE**: `border-left: 4px solid var(--red, #e74c3c);`
**AFTER**: `border-left: 4px solid var(--red);`

**Accept when**: Both lines fixed, `--card-bg` grep returns 0 hits across entire frontend.

---

### DQA-315: Homepage demo cards have unreadable text (WCAG fail)

**Severity**: HIGH — accessibility violation on homepage
**File**: `frontend/index.html` (inline `<style>`, line ~292)

`.demo-card` sets `background: var(--bg-ink)` (#1a110a, near-black) with `color: var(--ink-medium)` (#5c4a3d, dark brown). Contrast ratio is ~2.2:1. WCAG AA requires 4.5:1 for body text.

The Situation Room demo cards on the homepage are the first impression of the paid product. The body text is nearly invisible on the dark background.

**BEFORE**: `color: var(--ink-medium);`
**AFTER**: `color: var(--ink-faint);` (or `#c4b5a5` — provides ~6.5:1 contrast on `#1a110a`)

Also: no `[data-theme="dark"]` override exists for `.demo-card`. In dark mode, `--bg-ink` and `--ink-medium` both flip, potentially causing the same or worse contrast issue.

**Accept when**: Demo card body text contrast is >= 4.5:1 in both light and dark mode. Verified via browser devtools contrast checker.

---

### DQA-316: Position stripe is 4px, spec says 6px

**Severity**: MEDIUM — visual spec drift
**File**: `frontend/styles.css:858-861`

DESIGN.md specifies: "Position stripe (top border): 6px colored top border." All four `.pos-stripe-*` classes use `4px`. This makes the position color indicator thinner than intended, reducing the visual punch of position-colored cards.

**BEFORE**:
```css
.pos-stripe-qb { border-top: 4px solid var(--pos-qb) !important; }
.pos-stripe-rb { border-top: 4px solid var(--pos-rb) !important; }
.pos-stripe-wr { border-top: 4px solid var(--pos-wr) !important; }
.pos-stripe-te { border-top: 4px solid var(--pos-te) !important; }
```

**AFTER**: Change all four from `4px` to `6px`.

**Accept when**: All four `.pos-stripe-*` rules use `6px`. Visually verify on Lab screener table.

---

### DQA-317: Hover lift effect is half the spec (3px vs 6px)

**Severity**: MEDIUM — visual spec drift
**File**: `frontend/styles.css` (lines 769, 797, 838, 1090)

DESIGN.md specifies hover lift as: `box-shadow: 6px 6px 0` + `transform: translate(-2px, -2px)`. The implementation uses `3px 3px 0` + `translate(-1px, -1px)` on `.btn-chunky:hover`, `.btn-primary:hover`, `.chip:hover`, and several other interactive elements.

The spec's lift is deliberately exaggerated for the comic-strip / sticker aesthetic. The current half-lift makes interactions feel flat.

**BEFORE**: `box-shadow: 3px 3px 0 var(--ink); transform: translate(-1px, -1px);`
**AFTER**: `box-shadow: 6px 6px 0 var(--ink); transform: translate(-2px, -2px);`

Apply to: `.btn-chunky:hover`, `.btn-primary:hover`, `.chip:hover`, `.sticker-chip:hover` (all in styles.css).

Exception: The homepage `.btn-hero:hover` (index.html inline styles) already correctly uses `translate(-2px, -2px)` but keeps the shadow at `4px 4px 0` — this should also become `6px 6px 0`.

**Accept when**: All hover lifts use 6px/−2px. Tab through buttons in Lab toolbar to verify the lift is visually noticeable.

---

### DQA-318: `transition: all` used 115 times across 41 files

**Severity**: MEDIUM — performance + visual jank
**Files**: `frontend/styles.css` (8), `frontend/lab-panels.css` (15), `frontend/*.html` (92)

`transition: all` animates every CSS property on change, including `width`, `height`, `display`, etc. This causes:
- Layout thrash during window resize
- Unexpected animations on dark mode toggle (backgrounds slide between colors)
- Sluggish interactions on low-end devices

Replace with targeted transitions. Common pattern:

**BEFORE**: `transition: all 0.15s;`
**AFTER**: `transition: background-color 0.15s, color 0.15s, box-shadow 0.15s, transform 0.15s;`

For buttons/chips, `transition: background-color 0.12s, box-shadow 0.12s, transform 0.12s;` covers all intended animation.

**Accept when**: Grep `transition:\s*all` returns 0 hits in `styles.css` and `lab-panels.css`. Standalone HTML pages can be done in a follow-up. Dark mode toggle no longer causes any property sliding.

---

### DQA-319: Hardcoded overlay RGBa values (fragile dark mode)

**Severity**: MEDIUM — maintainability + dark mode consistency
**File**: `frontend/styles.css`

Four overlay backgrounds use raw `rgba()` values instead of CSS variables:
- Line 274: `.mobile-nav-overlay` → `rgba(45,31,20,0.4)`
- Line 645: `.auth-modal-overlay` → `rgba(45, 31, 20, 0.5)`
- Line 1108: `.cmd-palette-backdrop` → `rgba(45, 31, 20, 0.45)`

Each requires a separate `[data-theme="dark"]` override. If the ink color ever changes, these silently break.

**AFTER**: Add to `:root`:
```css
--overlay-light: rgba(45, 31, 20, 0.4);
--overlay-medium: rgba(45, 31, 20, 0.5);
```
Dark mode:
```css
--overlay-light: rgba(26, 17, 10, 0.5);
--overlay-medium: rgba(26, 17, 10, 0.65);
```

Then replace hardcoded values + remove the individual dark mode overrides.

**Accept when**: No raw `rgba(45` values remain in styles.css. All overlays use CSS variables. Dark mode overlay tint verified visually.

---

### DQA-320: 1px borders in JS-generated HTML violate "no thin borders" rule

**Severity**: LOW — visual spec drift, subtle
**Files**: `frontend/charts.js`, `frontend/lab.js`, `frontend/lab-panels.js`, `frontend/formulas.js`, `frontend/player.js`

DESIGN.md states: "NO thin 1px borders." The stylesheet correctly avoids 1px borders, but 15+ JS-generated HTML strings use `border-bottom:1px solid var(--ink-faint)` for table rows, autocomplete items, and form dividers.

These thin borders clash with the chunky comic-strip aesthetic. Replace with `2px dashed var(--ink-faint)` (the spec's divider pattern) or `2px solid var(--ink-faint)`.

**Accept when**: Grep `1px solid` in frontend JS files returns 0 hits. Visually verify charts.js compare tables and lab.js weekly breakdown rows use the thicker border.

---

### DQA-321: Off-palette color `#e87422` used for Octo agent + chart lines

**Severity**: LOW — palette violation
**Files**: `frontend/agent-config.js:94`, `frontend/lab.js:9769,9872`, `frontend/warroom.js:362,727`, `frontend/draftclass.html:628`

The color `#e87422` (a pumpkin orange) is not in the Razzle palette. It's used as Octo's agent color and as a chart series color. The closest palette color is `--orange` (#d97757, tiger terracotta).

If Octo needs a distinct color from Razzle (both orange-family), use `--yellow` (#ffc857) or add `#e87422` to the design spec as an official extended palette color for agent identity.

**Accept when**: Either `#e87422` is added to DESIGN.md as an official agent color, or all instances are replaced with an existing palette color. Decision should be documented.

---

### DQA-322: `border-radius: 14px` used on 3 pages (off-token)

**Severity**: LOW — design token drift
**Files**: `frontend/archetypes.html:115`, `frontend/dashboard.html:113`, `frontend/tiers.html:120`

DESIGN.md defines three radius tokens: `--radius-sm: 8px`, `--radius: 12px`, `--radius-lg: 20px`. These three pages use `14px` which falls between `--radius` and `--radius-lg`, creating a subtle inconsistency in card roundness.

**BEFORE**: `border-radius: 14px;`
**AFTER**: `border-radius: var(--radius);` (12px)

**Accept when**: Grep `border-radius:\s*14px` returns 0 hits. Cards on archetypes, dashboard, and tiers pages use `var(--radius)`.

---

### DQA-323: `linear-gradient` used on prompts.html (spec says NO gradients)

**Severity**: LOW — visual spec violation
**File**: `frontend/prompts.html:78`

DESIGN.md states: "NO gradients." The prompts page uses `background: linear-gradient(transparent, var(--bg))` as a fade-out overlay on collapsed prompt text blocks.

This is a functional gradient (truncation indicator, not decoration), but it still violates the letter of the spec. Replace with a hard cut-off approach:

**AFTER**: Use `overflow: hidden; max-height: 120px;` with a "Show more" toggle and no gradient fade. Or, if the gradient is intentionally allowed for functional use, add an exception note to DESIGN.md.

**Accept when**: Either the gradient is removed and replaced with a non-gradient truncation pattern, or DESIGN.md is updated to note "functional fade-out gradients for text truncation are allowed."

---

## Design QA — 10 Tickets (2026-03-26)

> Second pass. Source audit against `docs/DESIGN.md`. Previous DQA-314–323 (2026-03-25) still open.

---

### DQA-324: Nav label "Bureau" should be "Bureau of Intelligence" — 148 occurrences across 75 files

**Severity**: HIGH — brand identity violation
**Files**: All 75 HTML files (nav + footer), `frontend/app.js:163`

DESIGN.md Brand Hierarchy and TICKETS.md P0 Task 3 both mandate the nav label is **"Bureau of Intelligence"**, not "Bureau". The shortened form appears 148 times across every page's nav `<li>` and footer `<a>`. The app.js dynamic nav builder on line 163 sets `label: "Bureau"`.

The full brand name "Bureau of Intelligence" only appears in 2 files (league-intel.html and warroom.js). Every other page uses the truncated version.

**BEFORE**: `{ href: "/league-intel.html", label: "Bureau" }`
**AFTER**: `{ href: "/league-intel.html", label: "Bureau of Intelligence" }`

Also fix all 75 HTML files' hardcoded nav `<li>` and footer links.

**Accept when**: Grep `>Bureau<` returns 0 hits. Grep `Bureau of Intelligence` returns matches in every nav/footer. App.js nav builder uses full name.

---

### DQA-325: Nav label "Screener" should be "Fourth Down Lab" — app.js + 15 index.html references

**Severity**: HIGH — brand identity violation
**Files**: `frontend/app.js:162`, `frontend/index.html` (15 refs), `frontend/about.html:258`, `frontend/lab.html:3163`, `frontend/lab.js:1`

DESIGN.md and TICKETS.md P0 Task 3 mandate the brand name is **"Fourth Down Lab"**, not "Screener" or "The Lab". Current state:
- `app.js:162` → `label: "Screener"`
- `index.html` → "Open the Screener" (3 CTAs), "The Screener is forever free", nav `<li>`, footer
- `about.html:258` → "The Lab (forever free)"
- `lab.html:3163` → "The Lab needs JavaScript"
- `lab.js:1` → comment "The Lab (screener logic)"
- `lab.js:3942` → page title set to "Screener" / "Prospect Screener"

**BEFORE**: `{ href: "/lab.html", label: "Screener" }`
**AFTER**: `{ href: "/lab.html", label: "Fourth Down Lab" }`

Note: "Screener" as a descriptor inside sentences is fine ("the screener filters players"). The issue is using it as the BRAND NAME in nav, CTAs, and headers.

**Accept when**: Nav label, footer link, all CTA buttons, and H1/H2 headers use "Fourth Down Lab". Grep for `>Screener<` in nav/footer context returns 0 hits. Page `<title>` says "Fourth Down Lab".

---

### DQA-326: `--shadow-chunky` CSS token defined but never referenced

**Severity**: MEDIUM — design system integrity
**File**: `frontend/styles.css:64` (definition), everywhere else (usage)

`:root` defines `--shadow-chunky: 4px 4px 0 var(--ink)` on line 64, but it is used **zero times** across the entire frontend. All 10+ box-shadow declarations hardcode `4px 4px 0 var(--ink)` instead of referencing the token.

This defeats the purpose of having the token — changing the shadow spec requires editing every file instead of one variable. The token also serves as documentation of the design intent.

**AFTER**: Replace all `box-shadow: 4px 4px 0 var(--ink)` with `box-shadow: var(--shadow-chunky)` in:
- `styles.css` (lines 187, 577, 657, 819, 854, 1125)
- All standalone HTML `<style>` blocks that hardcode the shadow

**Accept when**: Grep `4px 4px 0 var(--ink)` returns 0 hits in styles.css (only `--shadow-chunky` definition remains). Standalone pages migrated where feasible.

---

### DQA-327: 73 standalone HTML pages have zero dark mode CSS — toggle breaks page-specific styles

**Severity**: HIGH — broken user-facing feature
**Files**: All standalone HTML pages except `lab.html` (3 overrides) and `pricing.html` (15 overrides)

The dark mode toggle is site-wide (sets `data-theme="dark"` on `<html>`). `styles.css` has 13 `[data-theme="dark"]` rules and `lab-panels.css` has 33. But 73 standalone HTML pages (dashboard, breakouts, aging, weekly, etc.) embed their own `<style>` blocks with hardcoded light-mode colors like `background: var(--bg-card)`, `color: var(--ink-medium)`, `border: 3px solid var(--ink)`.

While CSS variables auto-switch on dark mode toggle, any page-specific styles that use hardcoded hex values (like `#f7efe5` for card backgrounds) will NOT switch — creating a broken visual where the nav/footer go dark but the page content stays light.

**AFTER**: Audit all standalone HTML `<style>` blocks. Replace any hardcoded hex values with CSS variable references so the dark mode toggle works uniformly. Add `[data-theme="dark"]` overrides for any page-specific custom colors that can't use existing variables.

**Accept when**: Toggle dark mode on any 5 representative standalone pages (dashboard, breakouts, aging, weekly, tiers). All elements switch correctly — no light-on-dark or dark-on-dark contrast failures.

---

### DQA-328: Off-type-scale font sizes: 15px and 22px used in styles.css

**Severity**: LOW — type scale drift
**File**: `frontend/styles.css`

DESIGN.md type scale defines: 32, 20, 16, 14, 13, 12, 11, 24, 18 px. Two sizes fall outside the scale:

- **15px** — used on `.input-chunky::placeholder` (line 979) and `.cmd-palette-item-name` (line 1220). Scale neighbors: 14px (body text) and 16px (section headers). Should be 14px.
- **22px** — used on dark mode toggle icon (line 186) and `.empty-msg` (line 925). Scale neighbors: 20px (player names, card headers) and 24px (Caveat annotations). Should be 24px for Caveat or 20px for Display.

**AFTER**:
- `15px` → `14px` (both are mono font, body text scale)
- `22px` on `.empty-msg` → `24px` (Caveat annotation scale)
- `22px` on toggle icon → `20px` (Display scale)

**Accept when**: Grep `font-size:\s*(15|22)px` in styles.css returns 0 hits.

---

### DQA-329: `#d44040` off-palette red used for Atlas/Elephant agent — 11 occurrences

**Severity**: MEDIUM — palette violation
**Files**: `frontend/agent-config.js:122`, `frontend/warroom.js:729,3099`, `frontend/lab.js:9769,9872`, `frontend/draftclass.html:628`, `frontend/assets/agents/atlas.svg` (5 occurrences)

The color `#d44040` (brick red) is Atlas the Elephant's agent identity color, but it is NOT in the Razzle palette. The palette red is `--red: #e63946`. Using `#d44040` creates an inconsistency — sometimes the same "red" intent is `#e63946`, sometimes `#d44040`, sometimes `#e74c3c`.

Options:
A) Replace `#d44040` with `#e63946` (palette red) — simple, consistent
B) Add `#d44040` to DESIGN.md as an official agent identity color with a token `--agent-atlas`
C) Choose a non-red palette color for Atlas (e.g., `--yellow` #ffc857 for elephants)

**Accept when**: Decision documented. Either all instances replaced with palette color, or `#d44040` added to DESIGN.md with a named token.

---

### DQA-330: `#e74c3c` off-palette red used as CSS fallback in 5 places

**Severity**: LOW — palette violation, subtle
**Files**: `frontend/styles.css:933`, `frontend/agents.html:2157`, `frontend/lab.js:3235`, `frontend/lab-panels.js:6359,6705`

Five places use `#e74c3c` (a flat-design red from older UI libraries) instead of the Razzle palette red `#e63946`. Three are CSS fallbacks `var(--red, #e74c3c)` — the fallback fires only if the variable is undefined, making this mostly cosmetic. But `lab-panels.js:6359` uses it as a raw color for TD chart bars (`td: '#e74c3c'`).

**BEFORE**: `var(--red, #e74c3c)` / `'#e74c3c'`
**AFTER**: `var(--red)` (drop fallback since `--red` is always defined) / `'#e63946'`

**Accept when**: Grep `#e74c3c` returns 0 hits in frontend.

---

### DQA-331: lab-panels.css bar elements use 30+ non-token border-radius values

**Severity**: LOW — design token drift
**File**: `frontend/lab-panels.css`

30+ bar/fill elements in lab-panels.css use hardcoded `border-radius` values of 2px, 3px, 4px, 5px, 7px — none of which match design tokens (8px, 12px, 20px). These are progress bars, stat bars, and fill indicators.

Examples:
- `.ww-recent-bar` → `border-radius: 2px 2px 0 0;`
- `.se-bar`, `.wl-bar`, `.tp-bar`, `.dr-bar`, `.gt-bar` → `border-radius: 2px;`
- `.dt-split-bar`, `.sk-corr-bar` → `border-radius: 3px;`
- `.tv-bar-fill`, `.av-tv-bar`, `.pt-pace-bar-wrap` → `border-radius: 4px;`
- `.pa-bar` → `border-radius: 5px;`
- `.sw2-bar-track`, `.sw2-bar-fill` → `border-radius: 7px;`

These are internal decorative elements (not primary containers) where small radii arguably make visual sense. Consider adding a `--radius-xs: 4px` token for bar/fill elements to standardize.

**AFTER**: Add `--radius-xs: 4px;` to `:root`. Replace 2-5px values with `var(--radius-xs)`. Replace 7px values with `var(--radius-sm)` (8px).

**Accept when**: `--radius-xs` token defined. Grep for hardcoded 2-7px border-radius in lab-panels.css returns 0 hits (or only in `border-radius: 50%` circles).

---

### DQA-332: Warroom pixel engine uses 40+ hardcoded non-palette hex colors

**Severity**: LOW — palette violation, contained
**File**: `frontend/warroom.js:36-75`

The Situation Room pixel art renderer defines 40+ colors inline (wall blues `#121a2e`, floor woods `#8b6d3c`, turf greens `#1e5c28`, furniture browns, monitor glows). These are valid pixel-art palette colors but exist completely outside the Razzle design system.

Additionally, the chart color array on line 362 includes `#33aaaa` (off-palette teal, should be `#2ec4b6`).

This is intentional for the pixel engine (canvas API doesn't use CSS variables), but the chart colors SHOULD use palette values.

**AFTER** (minimal fix): Replace chart array off-palette colors:
- `#33aaaa` → `#2ec4b6` (palette teal)
- `#d44040` → `#e63946` (palette red, or per DQA-329 decision)
- `#e87422` → palette decision from DQA-321

Pixel engine colors: document as an accepted exception in DESIGN.md ("Situation Room pixel renderer uses its own canvas palette").

**Accept when**: Chart color arrays in warroom.js use only palette colors. DESIGN.md notes the pixel engine exception.

---

### DQA-333: `.search-hl` and `.tag-picker-clear` use off-token border-radius

**Severity**: LOW — design token drift
**File**: `frontend/styles.css:906,1497`

Two elements use non-token border-radius values:
- `.search-hl` (line 906) → `border-radius: 2px;` — search text highlight. Too small for the chunky aesthetic. Should be `var(--radius-sm)` (8px) or at minimum 4px.
- `.tag-picker-clear` (line 1497) → `border-radius: 0 0 6px 6px;` — bottom of tag picker popup. Should be `0 0 var(--radius-sm) var(--radius-sm)` (0 0 8px 8px).

**BEFORE**:
```css
.search-hl { border-radius: 2px; }
.tag-picker-clear { border-radius: 0 0 6px 6px; }
```

**AFTER**:
```css
.search-hl { border-radius: var(--radius-sm); }
.tag-picker-clear { border-radius: 0 0 var(--radius-sm) var(--radius-sm); }
```

**Accept when**: Both use `var(--radius-sm)`. No hardcoded non-token border-radius values remain in styles.css (excluding `50%` for circles).

---

## Design QA — 10 Tickets (2026-03-26, Pass 3)

> Third pass. Deep source audit of styles.css, lab.js, and standalone HTML against `docs/DESIGN.md`. Previous DQA-314–333 still open.

---

### DQA-334: Base-state box-shadows are 2px instead of spec 4px on 7 core elements

**Severity**: HIGH — every button, nav link, and toggle looks flat
**File**: `frontend/styles.css` (lines 225, 233, 250, 320, 763, 791, 1085)

DESIGN.md specifies base shadow as `4px 4px 0 var(--ink)`. Seven elements use `2px 2px 0`:

| Line | Element | Current | Spec |
|------|---------|---------|------|
| 225 | `.nav-links a:hover` | 2px 2px 0 | 6px 6px 0 (hover) |
| 233 | `.nav-links a.active` | 2px 2px 0 | 4px 4px 0 |
| 250 | `.hamburger-toggle` | 2px 2px 0 | 4px 4px 0 |
| 320 | `.mobile-nav-close` | 2px 2px 0 | 4px 4px 0 |
| 763 | `.btn-chunky` | 2px 2px 0 | 4px 4px 0 |
| 791 | `.btn-primary` | 2px 2px 0 | 4px 4px 0 |
| 1085 | `.theme-toggle` | 2px 2px 0 | 4px 4px 0 |

DQA-317 covers the HOVER lift (3px→6px). This ticket covers the BASE state being half the spec size. The 2px shadow makes the comic-strip "chunky" aesthetic look thin and flat.

**BEFORE**: `box-shadow: 2px 2px 0 var(--ink);`
**AFTER**: `box-shadow: var(--shadow-chunky);` (which is `4px 4px 0 var(--ink)` per DQA-326)

**Accept when**: All 7 lines use `var(--shadow-chunky)`. Buttons and nav items visibly pop off the page.

---

### DQA-335: 15 hardcoded `border-radius: 8px` in styles.css — should use `var(--radius-sm)`

**Severity**: MEDIUM — design token adoption failure
**File**: `frontend/styles.css`

15 elements hardcode `border-radius: 8px` instead of using `var(--radius-sm)` (which equals 8px). The token exists — it's just not being used. This means if the design ever adjusts `--radius-sm`, these 15 elements won't update.

Elements: `.nav-link` (217), `.hamburger-toggle` (246), `.mobile-nav-link` (345), `.auth-form input` (546), `.auth-modal` (689), `.auth-tabs` (722), `.btn-chunky` (759), `.btn-primary` (787), `.input-chunky` (961), `.select-chunky` (988), `.theme-toggle` (1079), `.cmd-palette-input` (1144), two `.auth-modal` media queries (1324, 1363 at 12px→`var(--radius)`).

DQA-322 covers the `14px` outlier. DQA-333 covers `2px`/`6px`. This ticket covers the bulk `8px` migration.

**BEFORE**: `border-radius: 8px;`
**AFTER**: `border-radius: var(--radius-sm);`

**Accept when**: Grep `border-radius:\s*8px` in styles.css returns 0 hits. All use `var(--radius-sm)`.

---

### DQA-336: `font-size: 10px` used 48 times in lab.js — below minimum type scale (11px)

**Severity**: MEDIUM — type scale violation, readability concern
**File**: `frontend/lab.js` (48 occurrences)

DESIGN.md type scale minimum is `11px` (Display uppercase, section labels). lab.js uses `font-size:10px` in 48 inline style strings for sort indicators, filter dots, DVS info icons, position breakdown badges, stale data warnings, watchlist buttons, and more.

At 10px, these elements are below the type scale floor and may be illegible on mobile or high-DPI screens. The correct scale step is 11px (small data) or 12px (badges, chips, small data).

**BEFORE**: `font-size:10px;`
**AFTER**: `font-size:11px;` for icon/indicator elements, `font-size:12px;` for badge/chip text

**Accept when**: Grep `font-size:\s*10px` in lab.js returns 0 hits. All small text uses 11px or 12px per the type scale.

---

### DQA-337: `#4a9e5c` and `#c44daa` off-palette colors in chart arrays

**Severity**: MEDIUM — palette violation
**Files**: `frontend/lab.js:9770,9873`

Two chart color arrays (archetype charts and heatmap legends) include `#4a9e5c` (forest green) and `#c44daa` (magenta). Neither color exists in the Razzle palette.

DQA-321 covers `#e87422`. DQA-329 covers `#d44040`. DQA-330 covers `#e74c3c`. This ticket covers the remaining two off-palette chart colors.

Razzle palette alternatives:
- `#4a9e5c` (forest green) → `#2ec4b6` (palette teal/green) — already the RB position color
- `#c44daa` (magenta) → `#8b5cf6` (palette purple) — already the TE position color

If chart series need more than 6 colors, define an extended chart palette in DESIGN.md.

**BEFORE**: `"#4a9e5c", "#c44daa"`
**AFTER**: Either replace with palette colors or add to DESIGN.md as official chart-extended palette.

**Accept when**: Grep `#4a9e5c|#c44daa` returns 0 hits in frontend, or both are documented in DESIGN.md.

---

### DQA-338: `.card-hero` box-shadow is 5px — neither spec nor token

**Severity**: LOW — off-spec shadow
**File**: `frontend/styles.css:849`

`.card-hero` uses `box-shadow: 5px 5px 0 var(--ink)`. The design spec defines `4px 4px 0` for base shadows and `6px 6px 0` for hover. 5px is neither — it's an in-between that suggests the value was eyeballed rather than token-driven.

`.card-hero` is meant to be the highest-rank card (rank #1 player). If the intent is extra emphasis, it should use the hover-level shadow (6px) as its base. If it should match other cards, use 4px.

**BEFORE**: `box-shadow: 5px 5px 0 var(--ink);`
**AFTER**: `box-shadow: 6px 6px 0 var(--ink);` (hero cards deserve the premium shadow)

**Accept when**: `.card-hero` uses 6px shadow. No `5px 5px 0` values remain in styles.css.

---

### DQA-339: `.sticker-chip` base shadow is 3px — off-spec

**Severity**: LOW — off-spec shadow
**File**: `frontend/styles.css:1685`

`.sticker-chip` uses `box-shadow: 3px 3px 0 var(--ink)` as its base shadow. Spec says `4px 4px 0`. The sticker chip is the playful tier badge element (slightly rotated) — it should feel physical and sticker-like, which the spec's 4px shadow achieves better.

Its hover (line 1697) uses `5px 5px 0` — also off-spec (should be `6px 6px 0` per DQA-317).

**BEFORE**:
```css
.sticker-chip { box-shadow: 3px 3px 0 var(--ink); }
.sticker-chip:hover { box-shadow: 5px 5px 0 var(--ink); }
```

**AFTER**:
```css
.sticker-chip { box-shadow: var(--shadow-chunky); }
.sticker-chip:hover { box-shadow: 6px 6px 0 var(--ink); transform: translate(-2px, -2px); }
```

**Accept when**: `.sticker-chip` uses `var(--shadow-chunky)` base and `6px 6px 0` hover.

---

### DQA-340: `color: #fff` (pure white) in lab.js offline banner — not in palette

**Severity**: LOW — palette violation
**File**: `frontend/lab.js:1185`

The offline/stale data banner uses inline `color:#fff` (pure white). Pure white is NOT in the Razzle palette — the lightest color is `--bg-card` (#f7efe5, warm cream). On the `--orange` background, white text creates a cold contrast that breaks the warm sand-on-espresso brand feel.

**BEFORE**: `color:#fff;`
**AFTER**: `color:var(--bg-card);` (warm cream on orange, stays on-brand)

**Accept when**: Grep `color:#fff` and `color: #fff` in lab.js returns 0 hits. Banner text uses palette color.

---

### DQA-341: `.input-chunky:focus` shadow is 3px — should be 4px

**Severity**: LOW — off-spec focus state
**File**: `frontend/styles.css:969`

When a user focuses an input field, the focus shadow grows to `3px 3px 0` — but the spec base shadow is already `4px 4px 0`. This means focused inputs look the SAME or thinner than non-focused buttons, which inverts the visual hierarchy. Focus should feel more prominent, not less.

**BEFORE**: `box-shadow: 3px 3px 0 var(--ink);` (focus)
**AFTER**: `box-shadow: 6px 6px 0 var(--ink);` (focus should lift like hover — user is actively interacting)

Also add `transform: translate(-1px, -1px);` to complete the lift effect on focus.

**Accept when**: `.input-chunky:focus` uses `6px 6px 0` shadow with translate. Tabbing through Lab filters shows a clear visual lift.

---

### DQA-342: Position color maps duplicated 4+ times in lab.js — fragile, drift-prone

**Severity**: MEDIUM — maintainability / design system integrity
**File**: `frontend/lab.js` (lines 5, 9606-9609, plus `_getPosColorsHex()`, `_acPosColors`, `_hmPosColors`)

The QB/RB/WR/TE color mapping is declared at least 4 separate times in lab.js:

1. Line 5: `_POS_COLORS_CSS` — uses `var(--pos-*)` (correct)
2. Line 9606-9609: hardcoded hex object for canvas archetype charts
3. `_getPosColorsHex()`: reads computed CSS values at runtime
4. `_acPosColors`, `_hmPosColors`: yet more copies for specific chart features

If a position color changes in CSS, copies 2/4 silently drift. The hex copies exist because Canvas API needs raw colors, but `_getPosColorsHex()` already solves this by reading computed styles.

**AFTER**: Delete the hardcoded hex maps (lines 9606-9609 etc.) and replace all usages with calls to `_getPosColorsHex()`. Single source of truth.

**Accept when**: Grep for `QB.*#5b7fff` in lab.js returns only `_getPosColorsHex` or 0 hits. All canvas drawing uses the runtime-resolved colors.

---

### DQA-343: 73 standalone HTML pages embed 500-2000 line `<style>` blocks — style drift factory

**Severity**: HIGH — systemic maintainability + design consistency risk
**Files**: All standalone HTML pages (dashboard.html, breakouts.html, aging.html, weekly.html, etc.)

Each of the 73 standalone Lab panel pages embeds its own `<style>` block (typically 500-2000 lines) with repeated patterns: card styles, badge styles, table styles, position colors, responsive breakpoints. These are NOT imported from styles.css or a shared stylesheet — they're copy-pasted with slight variations.

This creates:
- **Style drift**: Each page evolves independently. One page's cards might use `border-radius: 14px` (DQA-322) while another uses `12px`.
- **Dark mode failures**: DQA-327 exists because these pages can't benefit from centralized dark mode rules.
- **Shadow/radius token adoption impossible**: DQA-326, 334, 335 can fix styles.css, but the same violations are duplicated in 73 `<style>` blocks.
- **Maintenance burden**: Any design system change requires editing 73+ files.

**AFTER**: Extract common patterns (card, badge, table, position color, responsive) into `lab-panels.css` (which already exists and is loaded by these pages). Remove the duplicated rules from each page's `<style>` block, keeping only truly page-specific styles.

This is a large task. Recommended approach:
1. Identify the 10 most-repeated CSS patterns across pages
2. Add them to `lab-panels.css` with shared class names
3. Migrate 5 pages as a pilot, verify no regressions
4. Migrate remaining pages in batches of 10

**Accept when**: 5 pilot pages (dashboard, breakouts, aging, weekly, tiers) have their `<style>` blocks reduced by 50%+ with shared styles moved to lab-panels.css. No visual regression on those 5 pages.

---

## Phase: Design QA — Site Walk Findings (2026-03-26)

**SOURCE**: Headless browser audit of razzle.lol — every major page screenshotted, computed styles inspected, CSS source grepped. All findings verified against `docs/DESIGN.md`.

---

### DQA-401: UI buttons inherit browser-default Arial font

**Priority**: P2 — Design system inconsistency
**Pages affected**: All (nav bar is global)

Four interactive buttons render in Arial because their CSS rules never set `font-family`. Browsers default `<button>` elements to Arial/system font, bypassing the page's font stack.

**Elements**:
- `.hamburger-toggle` (mobile menu button) — `frontend/styles.css:242`
- `.theme-toggle` (dark mode toggle) — `frontend/styles.css:1076`
- `.mobile-nav-close` (mobile nav X button) — `frontend/styles.css:311`
- `.auth-modal-close` (login modal X button) — `frontend/styles.css:664`

**DESIGN.md rule**: All body text, nav links, and buttons use `var(--font-mono)` ("Space Mono", monospace) at 14px.

**Fix**: Add `font-family: var(--font-mono);` to each of these four rules.

**Accept when**: All four buttons render in Space Mono. Verify with `getComputedStyle(el).fontFamily` in browser devtools — must not contain "Arial".

---

### DQA-402: Nav links at 13px instead of 14px per type scale

**Priority**: P2 — Typography inconsistency
**Pages affected**: All (global nav)

Nav links (Home, Screener, Bureau, etc.) compute to `13px` / `700` weight. The DESIGN.md type scale specifies:

> 14px | 400/600 | Mono | Body text, nav links, buttons

Two violations: font size (13px vs 14px) and font weight (700 vs 400/600).

**File**: `frontend/styles.css` — `.nav-links a` rule

**Accept when**: Nav links render at 14px, weight 600. Verified on desktop and mobile.

---

### DQA-403: Home page H1 at 38px overshoots 32px type scale

**Priority**: P3 — Minor typography deviation
**Pages affected**: index.html

The hero H1 ("The fantasy football research lab. Forever free.") computes to 38px. DESIGN.md type scale says:

> 32px | 700 | Display | Page titles

**File**: `frontend/index.html` — inline `<style>` block, hero section CSS

**Accept when**: H1 renders at 32px on desktop. May need a responsive bump for mobile readability, but desktop should match the type scale.

---

### DQA-404: H2 section headings at 26px — gap in type scale

**Priority**: P3 — Typography inconsistency
**Pages affected**: index.html

All H2 headings on the home page ("What you get. Right now. Free.", "One-click discovery filters.", etc.) compute to 26px. This value doesn't exist in DESIGN.md's type scale, which jumps from 20px (card headers) to 32px (page titles).

**Fix**: Decide whether section headings should be 24px (new token) or 20px (existing card header size). If 24px is correct, add it to DESIGN.md. If 20px is sufficient, resize.

**Accept when**: H2 font size matches an approved type scale value, or a new entry is added to DESIGN.md with a clear usage label.

---

### DQA-405: Feature cards on home page missing hover lift

**Priority**: P2 — Missing interaction, design guide violation
**Pages affected**: index.html

The four feature cards ("150+ Stat Columns", "Custom Formulas", "PNG Export", "Shareable URLs") have no `:hover` state at all. On hover, `transform` stays `none` and `box-shadow` stays `4px 4px 0`.

DESIGN.md specifies:
> Hover lift: `6px 6px 0` + `translate(-2px, -2px)`
> Cards: hover lifts

**File**: `frontend/index.html` — inline `<style>`, `.feature-card` rule (line ~328). No `.feature-card:hover` rule exists.

**Fix**: Add:
```css
.feature-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}
```
Also add `transition: transform 0.15s, box-shadow 0.15s;` to the base `.feature-card` rule and `cursor: pointer;`.

**Accept when**: Hovering a feature card on the home page lifts it (shadow grows, card shifts up-left). Transition is smooth.

---

### DQA-406: Non-palette agent colors for Octo and Atlas

**Priority**: P2 — Design palette violation
**Pages affected**: agents.html (Situation Room), any panel using agent attribution

Two agents use hex colors not found anywhere in DESIGN.md:
- **Octo** (The Octopus): `#e87422` — a brownish orange, not the palette orange `#d97757`
- **Atlas** (The Elephant): `#d44040` — a muted red, not the palette red `#e63946`

**Files**:
- `frontend/agent-config.js:94` (Octo color)
- `frontend/agent-config.js:122` (Atlas color)
- `frontend/warroom.js:727` (Octo duplicate)
- `frontend/warroom.js:729` (Atlas duplicate)

**Fix**: Replace `#e87422` → `#d97757` (orange) or `#ffc857` (yellow) for Octo. Replace `#d44040` → `#e63946` (red) for Atlas. Pick the closest palette color that still provides visual differentiation from other agents.

**Accept when**: All agent colors in agent-config.js and warroom.js are drawn from the DESIGN.md palette. `grep -rn '#e87422\|#d44040' frontend/` returns zero results.

---

### DQA-407: border-radius 14px on .tl-tier — not a design token

**Priority**: P3 — Token violation
**Pages affected**: Lab panels (tier list panel)

`.tl-tier` in `lab-panels.css:411` uses `border-radius: 14px`. DESIGN.md defines three radius tokens:
- `--radius-sm`: 8px
- `--radius`: 12px
- `--radius-lg`: 20px

14px is between tokens and matches nothing.

**Fix**: Change to `var(--radius)` (12px) or `var(--radius-lg)` (20px) depending on the visual intent. Tier containers are card-like, so 12px is likely correct.

**Accept when**: `border-radius: 14px` no longer appears in `lab-panels.css`. Replacement uses a CSS variable token.

---

### DQA-408: border-radius 1px on .str-recent-bar — not a design token

**Priority**: P3 — Token violation
**Pages affected**: Lab panels (streaks panel)

`.str-recent-bar` in `lab-panels.css:2487` uses `border-radius: 1px`. The smallest design token is `--radius-sm: 8px`. A 1px radius is effectively square and serves no visual purpose — either go fully square (0px) or use the smallest token.

**Fix**: Change to `border-radius: var(--radius-sm)` (8px) if the bar should be rounded, or `0` if it's intentionally flat.

**Accept when**: `border-radius: 1px` no longer appears in `lab-panels.css`.

---

### DQA-409: Mobile Lab toolbar overflow at 375px

**Priority**: P2 — Mobile usability bug
**Pages affected**: lab.html

At 375px viewport width (iPhone SE / small phones), the Lab toolbar overflows horizontally. The season dropdown ("2025") is visually truncated — the last digit clips against the right edge. The toolbar row with NFL/College toggle, position filters, search, and season selector doesn't wrap or shrink gracefully.

**Observed**: Screenshot at 375x812 shows "202" with the "5" cut off.

**Fix**: Either wrap the toolbar into two rows at small widths, or shrink the season dropdown width, or allow horizontal scroll with visual affordance.

**Accept when**: At 375px viewport, all toolbar controls are fully visible and usable. Season dropdown is not clipped.

---

### DQA-410: Nav bar interactive element font sizes inconsistent

**Priority**: P2 — Typography inconsistency
**Pages affected**: All (global nav)

Three nav-bar interactive elements use three different font sizes:
- Dark mode toggle (`.theme-toggle`): **16px**
- Nav links (`.nav-links a`): **13px**
- Sign In button (`.btn-sm`): **11px**

DESIGN.md type scale says all three should be **14px** (nav links, buttons). The toggle is oversized, nav links are undersized, and Sign In is dramatically undersized.

**Fix**: Normalize all three to 14px, or use 13px for nav links and 12px for the Sign In badge (which is a small button). The dark toggle at 16px is the most visually jarring — it should match nav link size.

**Accept when**: Theme toggle, nav links, and Sign In button are within 1px of each other. All use `var(--font-mono)`.

---

## Design QA — 10 Tickets (2026-03-26, Pass 4)

> Fourth pass. Deep source audit of lab-panels.css, JS inline styles, and CSS variable adoption against `docs/DESIGN.md`. Previous DQA-314–410 still open.

---

### DQA-411: `font-size: 9px` used 60+ times across 8 files — below 11px type scale minimum

**Severity**: HIGH — systemic type scale violation, readability concern
**Files**: `frontend/lab-panels.css` (38), `frontend/lab.js` (17), `frontend/lab-panels.js` (4), `frontend/charts.js` (2), `frontend/formulas.js` (3), `frontend/formula-store.js` (1), `frontend/app.js` (1), `frontend/warroom.js` (3)

DESIGN.md type scale minimum is 11px. The value 9px appears 60+ times across the codebase — more than any other sub-minimum font size. Used for position badges, stat labels, team names, conference labels, and chart annotations.

DQA-336 covers `font-size:10px` in lab.js. This ticket covers the 9px epidemic across ALL files.

Examples:
- `lab-panels.css:627`: `.tv-stat-label { font-size: 9px; }` — stat label in trade values
- `lab-panels.css:2802`: `.tdr-pos-badge { font-size: 9px; }` — position badge in TD regression
- `lab.js:2220`: `style="font-size:9px; padding:1px 5px;"` — inline position badge
- `formulas.js:138`: `font-size:9px` — Published badge on formulas
- `charts.js:891`: `font-size:9px` — position badge in chart tooltips

**BEFORE**: `font-size: 9px;`
**AFTER**: `font-size: 11px;` for stat labels, team names, uppercase tags. `font-size: 12px;` for badges and chips per type scale (12px | 700 | Mono | Badges, chips, small data).

**Accept when**: Grep `font-size:\s*9px` returns 0 hits across all frontend files. All small text uses 11px or 12px.

---

### DQA-412: `font-size: 8px` used in 5 locations across 3 files — 3px below minimum

**Severity**: HIGH — illegible text, type scale violation
**Files**: `frontend/styles.css` (2), `frontend/lab.js` (2), `frontend/lab-panels.js` (1)

Five elements use 8px text — 3px below the 11px type scale floor. At this size, text is effectively invisible on mobile and barely readable on desktop.

Locations:
- `styles.css:1304` — media query context (likely mobile nav element)
- `styles.css:1428` — tag picker option
- `lab.js:387` — Pro badge on column headers
- `lab.js:1950` — percentile superscript `%` symbol
- `lab-panels.js:10420` — FAAB chart bar labels
- `lab-panels.css:3155` — `.arc-player-pos` archetype player position badge

**BEFORE**: `font-size: 8px;`
**AFTER**: `font-size: 11px;` minimum. For the percentile `%` superscript, 11px with `opacity:0.6` preserves the visual intent while remaining readable.

**Accept when**: Grep `font-size:\s*8px` returns 0 hits in all frontend files.

---

### DQA-413: `font-size: 10px` in 20+ locations outside lab.js scope

**Severity**: MEDIUM — type scale violation, DQA-336 scope gap
**Files**: `frontend/lab-panels.css` (15+), `frontend/warroom.js` (5), `frontend/formulas.js` (1), `frontend/charts.js` (1), `frontend/styles.css:1054`

DQA-336 covers the 48 occurrences of `font-size:10px` in lab.js. This ticket covers 20+ occurrences in OTHER files that DQA-336 doesn't touch.

Lab-panels.css examples:
- `.dh-team` (line 356), `.tl-chip-tv` (line 482), `.tv-pos-badge` (line 610), `.tv-age` (line 616), `.vorp-pos-badge` (line 710), `.pa-table th` (line 755), `.pa-pos-badge` (line 761), `.av-tier-badge` (line 799)

Warroom.js examples (lines 3623, 3627, 3629, 3634, 3889)

Styles.css:1054: `.nav-signout { font-size: 10px !important; }` — forces the sign-out link below minimum at mobile breakpoint, using `!important` to prevent override.

**BEFORE**: `font-size: 10px;`
**AFTER**: `font-size: 11px;` for labels and metadata, `font-size: 12px;` for badges and interactive elements.

**Accept when**: Grep `font-size:\s*10px` in lab-panels.css, warroom.js, formulas.js, charts.js, and styles.css returns 0 hits.

---

### DQA-414: `--text-on-accent: white` uses cold pure white — not in Razzle palette

**Severity**: MEDIUM — palette philosophy violation, affects 271 element instances
**File**: `frontend/styles.css:69`

The CSS variable `--text-on-accent` is set to `white` (#ffffff) in light mode. Pure white is NOT in the Razzle color palette. DESIGN.md says: "Don't: Cold grays anywhere — even dark mode stays warm." Pure white is the coldest possible value. The lightest palette color is `--bg-card` (#f7efe5, warm cream).

This variable is used 271 times across 78 files for text on colored backgrounds (position badges, active chips, CTAs, tier badges). Every badge on the site has cold white text on warm sand/terracotta/teal backgrounds, breaking the warm material aesthetic.

Dark mode correctly uses `--text-on-accent: var(--bg)` (line 103), which resolves to warm sand. Light mode should follow the same philosophy.

**BEFORE**: `--text-on-accent: white;`
**AFTER**: `--text-on-accent: #f7efe5;` (warm cream, matches `--bg-card`)

**Caveat**: Contrast must be verified. `#f7efe5` on `#d97757` (orange) = ~3.1:1. This passes WCAG AA for large text (14px bold+) but not normal text. Since most badge text is 11-12px bold uppercase, consider `#faf4ec` (slightly brighter warm white) for ~3.5:1 or adding a text-shadow for contrast.

**Accept when**: `--text-on-accent` uses a warm off-white from the palette. Contrast ratio >= 3:1 on all position colors. No pure `white` or `#ffffff` in `:root`.

---

### DQA-415: `var(--radius)` and `var(--radius-lg)` tokens unused in lab-panels.css — 23 hardcoded values

**Severity**: MEDIUM — design token adoption failure
**File**: `frontend/lab-panels.css`

Lab-panels.css is the largest stylesheet (4600+ lines) and uses radius tokens ZERO times despite having 23 hardcoded values that should be tokenized:

- `border-radius: 12px` appears **17 times** — should be `var(--radius)`
- `border-radius: 20px` appears **6 times** — should be `var(--radius-lg)`

Meanwhile `var(--radius-sm)` (8px) IS used 188 times in the same file, showing the pattern is understood for small radii but wasn't applied for medium/large.

This means any future change to `--radius` or `--radius-lg` will NOT propagate to the 70+ Lab panel pages that load this stylesheet.

DQA-331 covers the 2-7px small bar values. DQA-335 covers `8px` in styles.css. This ticket covers the medium (12px) and large (20px) values in lab-panels.css.

**BEFORE**: `border-radius: 12px;` / `border-radius: 20px;`
**AFTER**: `border-radius: var(--radius);` / `border-radius: var(--radius-lg);`

**Accept when**: Grep `border-radius:\s*12px` and `border-radius:\s*20px` in lab-panels.css returns 0 hits. All use token variables.

---

### DQA-416: Caveat font used at 7 off-scale sizes (12px–16px, 20px, 22px) — type scale allows only 18px and 24px

**Severity**: MEDIUM — type scale violation, affects brand personality layer
**Files**: `frontend/app.js`, `frontend/lab-panels.js`, `frontend/charts.js`, `frontend/warroom.js`, `frontend/agent-nudges.js`, `frontend/compare.js`

DESIGN.md type scale defines exactly two Caveat sizes:
- 24px weight 600 — Handwritten annotations
- 18px weight 500 — Card scribbles, smaller notes

But Caveat (via `var(--font-hand)`) is used at **7 off-scale sizes** in JS inline styles:

| Size | Count | Examples |
|------|-------|---------|
| 22px | 4 | app.js:510 (error), charts.js:857,868 (compare errors), lab-panels.js:4133 (empty state) |
| 20px | 1 | app.js:1897 (loading state) |
| 16px | 11+ | app.js:1368,1398,1399, charts.js:104, compare.js:29, lab-panels.js:922,1850,2344,2559,7848,8786 |
| 15px | 1 | lab-panels.js:10198 (dynasty assets label) |
| 14px | 6 | app.js:1358,1853, lab-panels.js:3914, agent-nudges.js:163 |
| 13px | 2 | lab-panels.js:10424,10438 (chart annotations) |
| 12px | 1 | warroom.js:3214 (powered by label) |

**Rule**: "Caveat is never primary information. Always a comment, aside, margin note." The 16px usage for section subtitles (player counts, panel subtitles) is arguably primary information, violating both the size scale and the usage rule.

**AFTER**:
- 22px → 24px (annotation scale)
- 20px → 24px or 18px depending on context
- 16px → 18px (card scribble scale)
- 15px, 14px, 13px → 18px (card scribble scale)
- 12px → 18px (too small for any Caveat use)

**Accept when**: All `var(--font-hand)` / Caveat usages in JS files use exactly 18px or 24px per the type scale.

---

### DQA-417: `#ffd700` hardcoded in lab-panels.css when `--medal-gold` CSS variable exists

**Severity**: LOW — token adoption failure
**File**: `frontend/lab-panels.css` (lines 580, 3476), `frontend/styles.css` (lines 67, 105)

`styles.css` defines `--medal-gold: #ffd700` on both light mode (line 67) and dark mode (line 105). But `lab-panels.css` uses the raw hex value instead of the variable:

- Line 580: `.tv-tier-num.t1 { background: #ffd700; }` — trade value tier 1 badge
- Line 3476: `.rc2-badge.gold { background: #ffd700; }` — records panel gold badge

If the medal gold color changes (e.g., for dark mode warmth), these two elements won't update.

**BEFORE**: `background: #ffd700;`
**AFTER**: `background: var(--medal-gold);`

**Accept when**: Grep `#ffd700` in lab-panels.css returns 0 hits. Both elements use `var(--medal-gold)`.

---

### DQA-418: `#b8860b` and `#a0522d` off-palette colors for trade value ranks

**Severity**: LOW — palette violation
**File**: `frontend/lab-panels.css` (lines 603, 605)

Two colors used for trade value rank highlighting are not in the Razzle palette and not defined as CSS variables:

- Line 603: `.tv-rank.top1 { color: #b8860b; }` — dark goldenrod for #1 rank
- Line 605: `.tv-rank.top3 { color: #a0522d; }` — sienna for top 3 rank

These are traditional "gold" and "bronze" medal colors but don't match the Razzle aesthetic. The design system already has `--medal-gold` (#ffd700) and `--medal-bronze` (#cd7f32) tokens in styles.css.

Also: line 603 uses `font-size: 16px` and line 605 uses `font-size: 15px` — both off the type scale (should be 16px and 14px, or both 16px).

**BEFORE**:
```css
.tv-rank.top1 { color: #b8860b; font-size: 16px; }
.tv-rank.top3 { color: #a0522d; font-size: 15px; }
```

**AFTER**:
```css
.tv-rank.top1 { color: var(--medal-gold); font-size: 16px; }
.tv-rank.top3 { color: var(--medal-bronze); font-size: 14px; }
```

**Accept when**: Grep `#b8860b|#a0522d` returns 0 hits in frontend. Both use medal token variables.

---

### DQA-419: 10 `--semantic-*` color tokens in styles.css not documented in DESIGN.md

**Severity**: MEDIUM — undocumented palette extension
**File**: `frontend/styles.css` (lines 46-55, 91-100)

Ten CSS variables extend the color palette without any mention in DESIGN.md:

| Token | Light | Dark |
|-------|-------|------|
| `--semantic-green` | `#2e7d52` | `#5cb87a` |
| `--semantic-green-light` | `#e8f0e4` | `#1a3325` |
| `--semantic-blue` | `#2d4a8f` | `#7da0e0` |
| `--semantic-blue-light` | `#dde4f7` | `#1e2840` |
| `--semantic-yellow` | `#6b4f1e` | `#d4a84a` |
| `--semantic-yellow-light` | `#f5eacc` | `#332a14` |
| `--semantic-orange` | `#7a3718` | `#d49060` |
| `--semantic-orange-light` | `#f7e4d8` | `#3d2010` |
| `--semantic-red` | `#9b3232` | `#e06060` |
| `--semantic-red-light` | `#f0e0df` | `#3d1f1f` |

None of these match the accent palette colors (e.g., `--semantic-green` is `#2e7d52`, palette green is `#2ec4b6`). They appear to be desaturated, higher-contrast versions meant for text-on-tint combinations (e.g., dark green text on light green background for "positive" states).

This is a valid pattern, but undocumented. Any designer or developer reading DESIGN.md won't know these exist, and may introduce competing semantic colors.

**AFTER**: Add a "Semantic Colors" section to DESIGN.md documenting these tokens, their purpose (text-on-tint for status indicators), and when to use them vs. the accent palette. Or, if they're no longer needed, remove them from styles.css.

**Accept when**: DESIGN.md has a "Semantic Colors" section listing all 10 tokens with their light/dark values and usage rules. OR: the tokens are removed and replaced with the existing accent palette.

---

### DQA-420: `var(--radius)` (12px) used only 2 times in styles.css — 1 hardcoded `12px` remains

**Severity**: LOW — incomplete token migration in primary stylesheet
**File**: `frontend/styles.css`

The `--radius: 12px` token is defined in `:root` but used only twice (lines 656, 1124). One hardcoded `12px` remains at line 1363 (media query for `.auth-modal`). By contrast, `var(--radius-sm)` (8px) is used 18 times — showing the token pattern is partially adopted.

Additionally, `var(--radius-lg)` (20px) is used **zero times** across the entire codebase despite `border-radius: 20px` appearing 8+ times in styles.css, lab-panels.css, and JS files. The `.chip` class (styles.css:830) is the most prominent — it's the position filter chip on every page.

**Hardcoded `20px` in styles.css**:
- Line 830: `.chip { border-radius: 20px; }` — should be `var(--radius-lg)`

**Hardcoded `12px` in styles.css**:
- Line 1363: media query `.auth-modal { border-radius: 12px; }` — should be `var(--radius)`

**AFTER**: Replace remaining hardcoded values with token references.

**Accept when**: `var(--radius)` used 3 times (was 2). `var(--radius-lg)` used 1+ times (was 0). No hardcoded `border-radius: 12px` or `border-radius: 20px` remains in styles.css.

---

## Design QA — 10 Tickets (2026-03-26, Pass 5)

> Fifth pass. Focused on cross-page consistency, watermark fragmentation, and inline `<style>` design drift not covered by DQA-314–420. All findings verified via source grep against `docs/DESIGN.md`.

---

### DQA-421: 55 pages use inline watermark code instead of shared `drawRazzleWatermark()`

**Severity**: HIGH — fragmented branding, inconsistent export identity
**Files**: 55 of 65 export-capable HTML pages (all except drops, dualthreat, gamescript, garbagetime, seasonpace, snapefficiency, successrate, targetpremium, tdregression, workload)

`app.js:531` defines `drawRazzleWatermark()` — the canonical watermark function with agent sprite, Caveat font, dark mode awareness, and URL annotation. But only 10 pages call it. The other 55 pages duplicate watermark logic inline with `ctx.fillText('razzle.lol', ...)` using inconsistent positioning and styling:

| Position variant | Pages |
|-----------------|-------|
| `canvas.width - 20` | 26 pages |
| `canvas.width - 130` | 13 pages |
| `canvas.width - 160` | 12 pages |
| `canvas.width - 220` | 10 pages (via `drawRazzleWatermark` fallback) |

Additionally, the inline versions:
- Use `font: bold 12px Space Mono` — the shared function uses `600 28px Caveat`
- Miss the agent sprite (1/6 random character per export)
- Miss the dark mode color switch
- Miss the URL annotation line
- Render at different Y offsets (`canvas.height - 16` vs `canvas.height - 20` vs `canvas.height - 30`)

Every exported PNG has a different watermark. Screenshots shared on Reddit will look inconsistent.

**AFTER**: Replace all inline `ctx.fillText('razzle.lol', ...)` blocks in the 55 pages with:
```js
if (typeof drawRazzleWatermark === 'function') { drawRazzleWatermark(ctx, canvas); }
else { ctx.font = "bold 28px 'Space Mono', monospace"; ctx.fillStyle = 'rgba(45,31,20,0.13)'; ctx.fillText("razzle.lol", canvas.width - 220, canvas.height - 20); }
```

**Accept when**: Grep `fillText.*razzle\.lol` in frontend/*.html returns 0 hits outside of a `drawRazzleWatermark` fallback block. All 65 pages produce visually identical watermarks.

---

### DQA-422: Watermark text is just "razzle.lol" — missing brand tagline from DESIGN.md

**Severity**: MEDIUM — brand identity gap
**Files**: `frontend/app.js:546` (`drawRazzleWatermark`), all 65 pages with export

DESIGN.md specifies the watermark text as: **"razzle.lol — let's razzle dazzle em baby"**. The actual implementation (both the shared function and all 55 inline copies) only renders "razzle.lol" — the tagline "let's razzle dazzle em baby" appears nowhere in the codebase (grep confirms 0 hits).

The tagline is the brand's personality compressed into one line. Without it, exported PNGs look generic — just a domain name, not a brand.

**BEFORE**: `ctx.fillText("razzle.lol", ...)`
**AFTER**: Add the tagline as a second line below the domain:
```js
ctx.font = "600 28px Caveat, cursive";
ctx.fillText("razzle.lol", canvas.width - 20, canvas.height - 36);
ctx.font = "500 16px Caveat, cursive";
ctx.fillText("let's razzle dazzle em baby", canvas.width - 20, canvas.height - 16);
```

**Accept when**: `drawRazzleWatermark()` renders both the domain and the tagline. Grep `razzle dazzle` returns 1+ hits in app.js. Exported PNGs show the full branded watermark.

---

### DQA-423: `font-size: 10px` used 306 times across 66 standalone HTML `<style>` blocks — below 11px minimum

**Severity**: HIGH — systemic type scale violation (DQA-336/413 scope gap)
**Files**: 66 standalone HTML files (advantage.html through yoy.html)

DQA-336 covers the 48 occurrences of `10px` in lab.js. DQA-413 covers 20+ in lab-panels.css/warroom.js/formulas.js/charts.js/styles.css. But **306 occurrences across 66 HTML files** are not covered by either ticket. These are in page-specific `<style>` blocks and inline JS `style=` strings.

Worst offenders:
- `lab.html`: 35 occurrences (inline JS styles beyond DQA-336 scope)
- `league-intel.html`: 28 occurrences
- `agents.html`: 9 occurrences
- `weekly.html`, `yoy.html`, `waivers.html`, etc.: 3-4 each

Common patterns:
- `font-size: 10px` on `.xx-table th` (table headers) — 50+ pages
- `font-size: 10px` on `.xx-pos-badge` (position badges) — 40+ pages
- `font-size:10px` in inline JS `style=` for team names, rank labels

DESIGN.md minimum is 11px. At 10px, table headers and badges are barely legible on mobile.

**AFTER**: In each page's `<style>`:
- Table header `th` font sizes: `10px` → `11px`
- Position badge font sizes: `10px` → `11px`
- Inline JS `style=` strings: `10px` → `11px`

**Accept when**: Grep `font-size:\s*10px` across all frontend/*.html returns 0 hits.

---

### DQA-424: Export buttons on 50+ pages lack hover-lift — only color-swap on hover

**Severity**: MEDIUM — interaction design inconsistency
**Files**: 50+ standalone HTML pages (advantage.html, aging.html, breakouts.html, etc.)

DESIGN.md specifies: "Buttons: hover adds shadow + lift" and "Hover lift: 6px 6px 0 + translate(-2px, -2px)". The export button (`.xx-export:hover`) on nearly every standalone page uses only `background: var(--ink); color: var(--bg);` — a color swap with no shadow growth or translate lift. Only 6 pages (agents, auction, archetypes, pricing, prompts, tiers) have any `box-shadow` or `transform` in their hover states.

Example from advantage.html:
```css
.pa-export:hover { background: var(--ink); color: var(--bg); }
```

**AFTER**: Add hover-lift to all export button hover rules:
```css
.pa-export:hover {
  background: var(--ink); color: var(--bg);
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```
And add `transition: background-color 0.12s, box-shadow 0.12s, transform 0.12s;` to the base rule.

Since every page duplicates this pattern, consider extracting `.btn-export` into `styles.css` and reusing it across all pages.

**Accept when**: Hovering the export button on any page lifts it. Grep `:hover.*background.*var\(--ink\)` without `box-shadow` or `transform` returns 0 hits in frontend/*.html.

---

### DQA-425: Card-level elements in standalone pages have no hover state at all

**Severity**: MEDIUM — missing interaction, inconsistent with core design
**Files**: 50+ standalone HTML pages

DESIGN.md: "Cards: hover lifts" and "Hover lift: 6px 6px 0 + translate(-2px, -2px)". The main card class on most standalone pages (`.pa-card`, `.bs-card`, `.sc-card`, `.aw-card`, etc.) has NO `:hover` rule. Cards are static — they don't respond to mouse interaction at all.

By contrast, the homepage feature cards (DQA-405) and pricing cards already have hover-lift. The 50+ tool page cards are inconsistent.

Example (advantage.html):
```css
.pa-card { background: var(--bg-card); border: 3px solid var(--ink);
           border-radius: var(--radius-sm); box-shadow: 4px 4px 0 var(--ink); }
/* No .pa-card:hover exists */
```

**AFTER**: Add hover-lift to each page's card class, or better — extract a shared `.panel-card` class into styles.css or lab-panels.css:
```css
.panel-card {
  background: var(--bg-card); border: 3px solid var(--ink);
  border-radius: var(--radius-sm); box-shadow: 4px 4px 0 var(--ink);
  transition: box-shadow 0.15s, transform 0.15s;
}
.panel-card:hover {
  box-shadow: 6px 6px 0 var(--ink);
  transform: translate(-2px, -2px);
}
```

**Accept when**: Cards on at least 5 representative pages (advantage, breakouts, aging, weekly, dashboard) lift on hover. Or: a shared `.panel-card` class exists in styles.css/lab-panels.css and is adopted by 10+ pages as a pilot.

---

### DQA-426: No `transition` property on interactive elements in 60+ standalone pages

**Severity**: MEDIUM — abrupt visual state changes violate "physical" interaction feel
**Files**: 60+ standalone HTML pages

DESIGN.md says interactions should "feel physical." The `styles.css` core elements have `transition` properties (DQA-318/322 address `transition: all`), but the page-specific `<style>` blocks in 60+ standalone pages define interactive elements (buttons, tabs, badges, table rows) with NO `transition` property at all.

This means:
- Pos-tab buttons snap between active/inactive states
- Export buttons snap between normal/hover
- Table row hover highlights appear instantly
- Any future hover-lift additions (DQA-424/425) will snap instead of animate

Example (advantage.html):
```css
.pa-controls .pos-tab { /* ...no transition... */ }
.pa-controls .pos-tab.active { background: var(--ink); color: var(--bg); }
.pa-export { /* ...no transition... */ }
.pa-export:hover { background: var(--ink); color: var(--bg); }
.pa-table tbody tr:hover { background: var(--orange-hover); }
```

**AFTER**: Add `transition: background-color 0.12s, color 0.12s, box-shadow 0.12s, transform 0.12s;` to all interactive elements in each page's `<style>` block. Better approach: move repeated patterns to a shared stylesheet (per DQA-343).

**Accept when**: All interactive elements (buttons, tabs, hoverable rows) across 5 representative pages have a `transition` property. State changes animate smoothly.

---

### DQA-427: Table header (`th`) uses solid bottom border — spec says "dashed dividers inside cards"

**Severity**: LOW — visual spec drift, widespread
**Files**: 50+ standalone HTML pages

DESIGN.md: "Dashed dividers: 2px dashed var(--ink-faint) inside cards." Most standalone pages use `border-bottom: 2px solid var(--ink-faint)` on table `th` elements. Tables live inside card containers, making their internal dividers subject to the dashed divider rule.

Example (advantage.html:50):
```css
.pa-table th { border-bottom: 2px solid var(--ink-faint); }
```

Meanwhile, `td` rows on the same pages correctly use `2px dashed var(--ink-faint)`:
```css
.pa-table td { border-bottom: 2px dashed var(--ink-faint); }
```

This inconsistency — solid headers, dashed rows — exists on 50+ pages. Either both should be dashed (strict spec compliance) or the solid header bottom should be elevated to `2px solid var(--ink)` for visual hierarchy (header separator stronger than row separator).

**AFTER (recommended)**: Keep `th` bottom as `2px solid var(--ink)` (stronger separator between header and data), and `td` bottom as `2px dashed var(--ink-faint)` (lighter separation between rows). This is an intentional hierarchy, not a spec violation. But standardize the `th` to use `var(--ink)` instead of `var(--ink-faint)` — the header separator should be visually distinct from row separators.

**BEFORE**: `.xx-table th { border-bottom: 2px solid var(--ink-faint); }`
**AFTER**: `.xx-table th { border-bottom: 2px solid var(--ink); }`

**Accept when**: All 50+ pages use `2px solid var(--ink)` for `th` bottom borders. Document this header separator pattern in DESIGN.md.

---

### DQA-428: Position badge color applied via inline JS `style=` — not CSS classes

**Severity**: MEDIUM — dark mode fragile, maintainability issue
**Files**: 50+ standalone HTML pages (JS `<script>` blocks)

Most standalone pages build position badges in JavaScript with inline hex colors derived from CSS variable reads:

```js
var qbC = _cs.getPropertyValue('--pos-qb').trim() || '#5b7fff';
html += '<span style="background:' + qbC + '; color:var(--text-on-accent);">' + pos + '</span>';
```

This reads the CSS variable once at page load, then bakes the hex value into inline `style=`. If the user toggles dark mode AFTER page load, the position badge colors won't update (inline styles override CSS cascade). The `color:var(--text-on-accent)` updates correctly, but the `background` is frozen.

Additionally, 50+ pages each independently implement this same `getPropertyValue` → inline style pattern, duplicating 5-10 lines of boilerplate.

**AFTER**: Use CSS classes instead of inline colors:
```html
<span class="pos-badge pos-badge-qb">QB</span>
```
```css
.pos-badge-qb { background: var(--pos-qb); color: var(--text-on-accent); }
```

These classes already partially exist in `styles.css` (`.pos-stripe-*`). Add `.pos-badge-qb/rb/wr/te` classes and replace the inline JS color baking.

**Accept when**: Position badges across 5+ representative pages use CSS classes instead of inline `style=` with computed hex values. Dark mode toggle correctly updates badge background colors without page reload.

---

### DQA-429: `box-shadow: 3px 3px 0` used in 20+ standalone HTML `<style>` blocks — off-spec

**Severity**: MEDIUM — DQA-318 scope gap (styles.css only)
**Files**: `aging.html:80`, `cheatsheet.html:78`, `matchups.html:278`, `prompts.html:39,46`, `scoring.html:78`, `tools.html:85`, plus 15+ pages in lab-panels.css-loaded panels

DQA-318 covers 20+ elements using `3px 3px 0` box-shadow, but lists files primarily in the core stylesheets and main pages (lab.html, league-intel.html, pricing.html). This ticket covers the standalone HTML `<style>` block instances that DQA-318 doesn't enumerate.

Additional pages found with `3px 3px 0` in their `<style>` blocks:
- `aging.html:80` — `.ac-card`
- `cheatsheet.html:78` — `.cs-card`
- `scoring.html:78` — `.sf-card`
- `tools.html:85` — `.tool-card`
- `prompts.html:39,46` — `.prompt-card`, `.prompt-filter`
- `matchups.html:278` — `.mh-badge`

DESIGN.md: base shadow = `4px 4px 0 var(--ink)`. The 3px shadow makes these cards look subtly thinner than cards on other pages.

**BEFORE**: `box-shadow: 3px 3px 0 var(--ink);`
**AFTER**: `box-shadow: 4px 4px 0 var(--ink);` (or `var(--shadow-chunky)` per DQA-326)

**Accept when**: Grep `3px 3px 0` across all frontend/*.html returns 0 hits.

---

### DQA-430: `nav-links a` shows "AI Agents" (149 instances) — P0 Task 3 still unfixed

**Severity**: HIGH — P0 brand identity violation, stale since first ticket batch
**Files**: All 75 HTML files (nav `<li>` + footer `<a>`)

TICKETS.md P0 Task 3 mandated: nav labels must be "Fourth Down Lab", "Bureau of Intelligence", "Situation Room". Current state:

| Expected | Actual | Grep hits |
|----------|--------|-----------|
| Fourth Down Lab | "Screener" | 0 uses of "Fourth Down Lab" anywhere |
| Bureau of Intelligence | "Bureau" | 148 uses of "Bureau" (short form) |
| Situation Room | "AI Agents" | 149 uses of "AI Agents" |

This was filed as a P0 in the first ticket batch and remains completely unfixed. Every page renders the wrong brand names in both the topnav `<li>` and the site footer `<a>`.

The nav links are hardcoded per-page (not generated by app.js), so fixing this requires editing all 75 HTML files — both the `<nav>` block and the `<footer>` block.

**AFTER**: In all 75 files:
- `<li><a href="/lab.html">Screener</a></li>` → `<li><a href="/lab.html">Fourth Down Lab</a></li>`
- `<li><a href="/league-intel.html">Bureau</a></li>` → `<li><a href="/league-intel.html">Bureau of Intelligence</a></li>`
- `<li><a href="/agents.html">AI Agents</a></li>` → `<li><a href="/agents.html">Situation Room</a></li>`
- Same for all footer links

**Accept when**: Grep `>Screener<` returns 0 hits. Grep `>Bureau<` (without "of Intelligence") returns 0 hits in nav/footer context. Grep `>AI Agents<` returns 0 hits. Grep `>Fourth Down Lab<` returns 75 hits (one per page nav). Grep `>Bureau of Intelligence<` returns 75 hits. Grep `>Situation Room<` returns 75 hits.

---

## Design QA — 10 Tickets (2026-03-26, Pass 6)

> Sixth pass. Focused on dark mode canvas rendering, meta tags, z-index chaos, keyboard accessibility, cursor states, and WCAG contrast on interactive affordances. All findings verified via source grep. Previous DQA-314–430 still open.

---

### DQA-431: `<meta name="theme-color">` hardcoded to `#ede0cf` on all 75 pages — wrong in dark mode

**Severity**: MEDIUM — browser chrome color mismatch in dark mode
**Files**: All 75 HTML files (line 6 of each)

Every page has `<meta name="theme-color" content="#ede0cf">` hardcoded in the `<head>`. When a user toggles dark mode, the page background flips to espresso `#2d1f14` but the browser chrome (mobile Safari address bar, Android status bar, PWA title bar) stays sand-colored. This creates a jarring visual seam between OS chrome and page content.

HTML supports `media` attribute on `<meta name="theme-color">` for exactly this purpose:

**BEFORE**:
```html
<meta name="theme-color" content="#ede0cf">
```

**AFTER**:
```html
<meta name="theme-color" content="#ede0cf" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#2d1f14" media="(prefers-color-scheme: dark)">
```

Additionally, the dark mode toggle should update theme-color dynamically via JS:
```js
document.querySelector('meta[name="theme-color"]').setAttribute('content', isDark ? '#2d1f14' : '#ede0cf');
```

**Accept when**: All 75 pages have dual `<meta name="theme-color">` tags with media queries. Toggle dark mode → browser chrome color matches page background. Test on mobile Safari or Android Chrome.

---

### DQA-432: Canvas theme fallback objects hardcode light-mode hex — dark mode charts render wrong

**Severity**: HIGH — visible rendering bug in dark mode
**Files**: `frontend/aging.html:443`, `frontend/breakdown.html:667`, `frontend/career.html:813`, `frontend/career-compare.html:745`, `frontend/draftclass.html:582`, `frontend/explorer.html:419`

Six pages with canvas charts use an inline fallback theme object that is 100% light-mode:

```js
var t = typeof getCanvasTheme === 'function' ? getCanvasTheme() : {bg:'#ede0cf',bgCard:'#f7efe5',ink:'#2d1f14',inkMedium:'#5c4a3d',inkLight:'#8a7565',inkFaint:'#c4b5a5',white:'#fff'};
```

`getCanvasTheme()` (defined in `app.js:96`) correctly returns dark-mode colors. But these 6 fallback objects only fire if `getCanvasTheme` is undefined — which happens if the chart `<script>` runs before `app.js` loads (race condition on slow connections) or if the function is renamed/moved.

**Problem 1**: The fallback will ALWAYS render light-mode charts even in dark mode.
**Problem 2**: The fallback uses `white:'#fff'` — pure white is not in the palette (DQA-414 covers `--text-on-accent`, this covers canvas specifically).

**AFTER**: Update all 6 fallback objects to be dark-mode-aware:
```js
var t = typeof getCanvasTheme === 'function' ? getCanvasTheme() : (function() {
  var d = document.documentElement.getAttribute('data-theme') === 'dark';
  return d ? {bg:'#2d1f14',bgCard:'#4a3728',ink:'#ede0cf',inkMedium:'#c4b5a5',inkLight:'#8a7565',inkFaint:'#5c4a3d',white:'#f7efe5'}
           : {bg:'#ede0cf',bgCard:'#f7efe5',ink:'#2d1f14',inkMedium:'#5c4a3d',inkLight:'#8a7565',inkFaint:'#c4b5a5',white:'#f7efe5'};
})();
```

**Accept when**: Toggle dark mode, then reload any of the 6 pages. Canvas charts render with dark backgrounds and light text. Grep `white:'#fff'` returns 0 hits.

---

### DQA-433: z-index values span 1 to 99999 with no documented layering system

**Severity**: MEDIUM — maintainability + stacking context bugs
**Files**: `frontend/styles.css` (11 values), `frontend/lab.html` (4), `frontend/app.js` (2), `frontend/lab.js` (1), `frontend/player.js` (1), `frontend/prompts.html` (1), `frontend/agents.html` (1)

The codebase uses 8 distinct z-index tiers with no naming system or documentation:

| Value | Element | File |
|-------|---------|------|
| 1 | `.caveat-anno` | styles.css:120 |
| 100 | `.main-nav` | styles.css:166 |
| 1000 | `.auth-modal-overlay`, `.tag-picker-wrap`, `.notes-editor` | styles.css:578,1445,1538 |
| 9000 | `.cmd-palette-backdrop` | styles.css:1110 |
| 9998 | `.mobile-nav-overlay` | styles.css:275 |
| 9999 | `.mobile-nav`, `.auth-modal-overlay`, toasts, overlays | styles.css:292,649 + lab.html + app.js |
| 10000 | unknown | styles.css:392 |
| 10001 | `.razzle-toast` | styles.css:1645 |
| 99999 | easter egg dots | app.js:1811 |

Two bugs lurk here:
1. `.auth-modal-overlay` is defined at BOTH `z-index: 1000` (line 578) AND `z-index: 9999` (line 649) — whichever CSS rule wins depends on specificity, not intent.
2. The command palette (`z-index: 9000`) renders BELOW the mobile nav (`z-index: 9998`), meaning on mobile the nav overlay obscures the Ctrl+K palette.

**AFTER**: Add z-index tokens to `:root` and document in DESIGN.md:
```css
--z-annotation: 1;
--z-nav: 100;
--z-dropdown: 500;
--z-modal: 1000;
--z-command-palette: 2000;
--z-mobile-nav: 3000;
--z-toast: 4000;
```

Replace all hardcoded z-index values with token references.

**Accept when**: No hardcoded `z-index` values >1 remain in styles.css. All use `var(--z-*)` tokens. DESIGN.md lists the z-index layer stack. Auth modal has exactly one z-index declaration.

---

### DQA-434: lab-panels.css has 93 `:hover` rules and 6 `:focus` rules — keyboard users blind

**Severity**: HIGH — WCAG 2.1 SC 2.4.7 (Focus Visible) violation
**Files**: `frontend/lab-panels.css` (93 hover, 6 focus), `frontend/styles.css` (21 hover without focus counterpart)

WCAG 2.1 AA requires all interactive elements to have a visible focus indicator. lab-panels.css defines 93 `:hover` rules for table rows, cards, badges, tabs, and buttons — but only 6 `:focus`/`:focus-visible` rules. This means 87 interactive elements are visually unreachable for keyboard-only and assistive technology users.

Worst offenders (interactive elements that respond to click/hover but have no focus indicator):
- 50+ `tbody tr:hover` rules (player rows in every panel — `.vorp-table`, `.eff-table`, `.con-table`, `.stk-table`, etc.)
- `.tl-player-chip:hover` (line 468)
- `.breakout-card:hover` (line 944)
- `.buysell-card:hover` (line 1134)
- `.scarcity-card:hover` (line 1557)
- `.cs-fmt-tab:hover` (line 819)
- `.lp-search-list > div:hover` (line 2884)

`styles.css` has a better ratio (13 `:focus-visible` rules) but still misses:
- `.chip:hover` (line 838)
- `.sticker-chip:hover` (line 1695)
- `.tag-icon:hover` (line 1439)
- `.tag-picker-option:hover` (line 1478)
- `.mobile-nav-link:hover` (line 352)
- `.nav-search-hint:hover` (line 455)
- `.nav-user-trigger:hover` (line 553)
- `.nav-dropdown-item:hover` (line 607)

**AFTER**: For every `:hover` rule, add a matching `:focus-visible` rule. Shared pattern:
```css
.xx-table tbody tr:hover,
.xx-table tbody tr:focus-visible {
  background: var(--orange-hover);
  outline: none;
}
.xx-table tbody tr:focus-visible {
  box-shadow: inset 3px 0 0 var(--orange);
}
```

For cards/badges, use `outline: 3px solid var(--orange); outline-offset: 2px;` on focus-visible.

**Accept when**: Every `:hover` rule in lab-panels.css has a matching `:focus-visible` rule. Count of `:focus-visible` rules >= count of `:hover` rules. Tab through Lab panels → every interactive row/card shows a visible focus indicator.

---

### DQA-435: 8 interactive elements in lab-panels.css have `:hover` but no `cursor: pointer`

**Severity**: MEDIUM — missing click affordance
**Files**: `frontend/lab-panels.css`

DESIGN.md says interactions should "feel physical." Eight elements have `:hover` visual feedback (background change, shadow, etc.) but no `cursor: pointer`, which breaks the affordance that tells users the element is clickable:

| Line | Element | Has hover? | Has cursor? |
|------|---------|-----------|-------------|
| 224 | `.rankings-card:hover` | Yes | No |
| 944 | `.breakout-card:hover` | Yes | No |
| 1134 | `.buysell-card:hover` | Yes | No |
| 1508 | `.scarcity-summary-card:hover` | Yes | No |
| 1557 | `.scarcity-card:hover` | Yes | No |
| 1694 | `.hc-table tbody tr:hover` | Yes | No |
| 1947 | `.wl-table tbody tr:hover` | Yes | No |
| 2308 | `.mh-detail-player:hover` | Yes | No |

By contrast, 30+ other elements in the same file correctly pair `:hover` with `cursor: pointer` (e.g., `.vorp-table tbody tr`, `.eff-table tbody tr`, `.stk-table tbody tr`).

**BEFORE**: (e.g., line 224)
```css
.rankings-card { /* ...no cursor... */ }
.rankings-card:hover { background: var(--orange-hover); }
```

**AFTER**: Add `cursor: pointer;` to the base rule for all 8 elements.

**Accept when**: All elements with `:hover` background-change effects in lab-panels.css also have `cursor: pointer`. Grep for `:hover.*background` in lab-panels.css and verify each parent selector has `cursor: pointer`.

---

### DQA-436: Pin icon at `opacity: 0.15` fails WCAG non-text contrast (3:1 minimum)

**Severity**: MEDIUM — accessibility violation on core screener interaction
**File**: `frontend/lab.html:1503-1504`

The pin icon (📌) in unpinned state uses `opacity: 0.15` on `.pin-icon.pin-faint`. The pin icon is an interactive control (click to pin a player row) that relies solely on opacity to communicate its available/inactive state.

At 0.15 opacity on the sand background (`#ede0cf`), the effective color is approximately `#e3d9cc` — a contrast ratio of ~1.1:1 against the background. WCAG 2.1 SC 1.4.11 requires **3:1 minimum** contrast for non-text UI components.

The hover state (`.screener-table tr:hover .pin-icon.pin-faint`) bumps to `opacity: 0.5` — still only ~1.9:1 contrast, still below the 3:1 threshold.

**BEFORE**:
```css
.pin-icon.pin-faint { opacity: 0.15; }
.screener-table tr:hover .pin-icon.pin-faint { opacity: 0.5; }
```

**AFTER**:
```css
.pin-icon.pin-faint { opacity: 0.35; }
.screener-table tr:hover .pin-icon.pin-faint { opacity: 0.7; }
```

At 0.35, the effective contrast is ~2.8:1 (near threshold). At 0.7 on hover, ~5:1 (passes easily). Active pins (`.pin-icon.pin-active`) already use full `background: var(--orange)` which passes.

**Accept when**: Pin icon at rest has >= 3:1 contrast ratio against `--bg` background. Hover state has >= 4.5:1. Verify with browser devtools accessibility inspector on a player row.

---

### DQA-437: `<button>` elements without `font-family` inherit browser defaults across 50+ standalone pages

**Severity**: MEDIUM — typography inconsistency (extends DQA-401 beyond global nav)
**Files**: 50+ standalone HTML pages (advantage.html through yoy.html)

DQA-401 covers 4 global nav buttons missing `font-family`. This ticket covers the **page-specific** buttons in standalone HTML files that also lack `font-family`.

Browsers reset `<button>` elements to system fonts (Arial on Windows, SF Pro on Mac). Each standalone page defines its own `.xx-export` button and `.pos-tab` buttons in `<style>` blocks, but none set `font-family`. The export buttons ("Export PNG") and position filter tabs ("ALL / QB / RB / WR / TE") render in Arial instead of Space Mono.

Example from advantage.html:
```css
.pa-export { background: var(--bg-card); border: 2px solid var(--ink); /* ...no font-family... */ }
.pa-controls .pos-tab { background: var(--bg-card); border: 2px solid var(--ink); /* ...no font-family... */ }
```

This is the same button in 50+ pages, each independently missing the same declaration.

**AFTER** (two options):
A) Add `font-family: var(--font-mono);` to each page's `.xx-export` and `.pos-tab` rules.
B) Add a global reset to `styles.css`:
```css
button, input, select, textarea { font-family: inherit; }
```
Option B fixes all 50+ pages plus any future buttons, and is a standard CSS reset practice.

**Accept when**: Export buttons and position tabs on any 5 representative standalone pages render in Space Mono, not Arial. Verify with `getComputedStyle(el).fontFamily`.

---

### DQA-438: `styles.css` has duplicate z-index on `.auth-modal-overlay` — 1000 vs 9999

**Severity**: HIGH — stacking context bug, auth modal may render under other overlays
**File**: `frontend/styles.css` (lines 578, 649)

The `.auth-modal-overlay` class has TWO z-index declarations in the same file:

- Line 578: `z-index: 1000;` (in the first `.auth-modal-overlay` rule block)
- Line 649: `z-index: 9999;` (in a second `.auth-modal-overlay` rule block)

CSS cascade means the LAST value (9999) wins. But this is fragile — if someone adds specificity to the first rule, or if a build tool reorders rules, the auth modal could drop behind the mobile nav overlay (9998) or toast notifications (10001).

This also suggests the auth modal was patched to fix a stacking bug rather than architected correctly.

**AFTER**: Remove the first `z-index: 1000` declaration on line 578. Keep only the line 649 value. Better yet, use the z-index token from DQA-433 (`var(--z-modal)`).

**Accept when**: Grep `z-index` in `.auth-modal-overlay` rules returns exactly 1 hit. The auth modal renders above all page content but below toasts.

---

### DQA-439: `!important` used on `.pos-stripe-*` borders — blocks dark mode overrides

**Severity**: MEDIUM — design system maintainability + dark mode fragility
**File**: `frontend/styles.css:858-861`

The four position stripe classes use `!important`:
```css
.pos-stripe-qb { border-top: 4px solid var(--pos-qb) !important; }
.pos-stripe-rb { border-top: 4px solid var(--pos-rb) !important; }
.pos-stripe-wr { border-top: 4px solid var(--pos-wr) !important; }
.pos-stripe-te { border-top: 4px solid var(--pos-te) !important; }
```

`!important` prevents any specificity-based override, including `[data-theme="dark"]` rules. If position colors need to shift in dark mode (e.g., slightly muted for contrast on dark backgrounds), no CSS-only override can do it.

The `!important` was likely added to overcome specificity conflicts in standalone page `<style>` blocks — the fix should be to increase selector specificity instead:
```css
[class*="pos-stripe-qb"] { border-top: 6px solid var(--pos-qb); }
```

Note: DQA-316 covers the size (4px → 6px per spec). This ticket covers the `!important` that prevents maintainable overrides.

**AFTER**: Remove `!important` from all four rules. If specificity conflicts resurface, debug the conflicting rule and fix it rather than re-adding `!important`.

**Accept when**: Grep `!important` on `.pos-stripe-*` rules returns 0 hits. Position stripes still render correctly on Lab screener and all standalone pages.

---

### DQA-440: No `prefers-reduced-motion` guard on 50+ standalone page hover transitions

**Severity**: MEDIUM — accessibility (WCAG 2.3.3 Animation from Interactions)
**Files**: 50+ standalone HTML pages, `frontend/lab-panels.css`

`styles.css:1675-1678` correctly includes a `@media (prefers-reduced-motion: reduce)` query that strips transitions from core elements:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

This is excellent — BUT it only applies to rules loaded from `styles.css`. The 50+ standalone HTML pages each define their own `<style>` blocks with hover transitions (`.xx-table tbody tr`, `.pos-tab`, `.xx-export`). If DQA-426 is implemented (adding `transition` to all interactive elements in standalone pages), those transitions will NOT be covered by the reduced-motion query.

Additionally, `lab-panels.css` defines transitions on 15+ elements (verified: `.rankings-card`, `.breakout-card`, `.stk-table tbody tr`, `.eff-table tbody tr`, etc.) that are also not covered.

**AFTER**: Add the same reduced-motion query to the end of `lab-panels.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

For standalone pages: the `styles.css` wildcard `*` selector SHOULD cascade into inline `<style>` blocks since styles.css is loaded first. But verify — if inline `<style>` `transition` declarations override via specificity, the reduced-motion query won't reach them.

**Accept when**: Toggle `prefers-reduced-motion: reduce` in browser devtools → no visible transitions or animations on any page (lab-panels or standalone). Verify on 3 pages (Lab, aging.html, breakouts.html).

---

## Design QA — Site Walk (2026-03-26)

Findings from a full code-level audit of all frontend files against `docs/DESIGN.md`.

---

### DQA-441: "AI Agents" in navigation across 75 pages — should be "Situation Room"

**Severity**: CRITICAL — brand name violation on every page of the site
**Files**: 75 HTML files in `frontend/` (149 total occurrences — nav + footer)

Every page has `<a href="/agents.html">AI Agents</a>` in the nav and/or footer. The `<title>` tag on agents.html correctly says "Situation Room — Razzle", but the nav link text is wrong everywhere.

CLAUDE.md is explicit: "These are the BRAND NAMES. They are not suggestions. Do not rename them to be 'self-describing' or 'simpler.' The names ARE the brand."

**BEFORE**: `<a href="/agents.html" title="AI agents for your league">AI Agents</a>`
**AFTER**: `<a href="/agents.html" title="AI agents for your league">Situation Room</a>`

**Accept when**: `grep -r "AI Agents" frontend/` returns zero results. All nav links and footer links to agents.html read "Situation Room".

---

### DQA-442: "Bureau" nav/footer text across 75+ pages — should be "Bureau of Intelligence"

**Severity**: CRITICAL — brand name truncated on every page
**Files**: 75+ HTML files in `frontend/` (nav `<li>` + footer links)

Navigation and footer links say `Bureau` instead of `Bureau of Intelligence`. Page title on league-intel.html is correct (`Bureau of Intelligence — Razzle`), but the nav text is abbreviated.

Example from `frontend/aging.html:301`:
```html
<li><a href="/league-intel.html">Bureau</a></li>
```

Footer from `frontend/aging.html:349`:
```html
<a href="/league-intel.html" class="footer-link">Bureau</a>
```

**BEFORE**: `>Bureau</a>`
**AFTER**: `>Bureau of Intelligence</a>`

Also fix `about.html:259` which says `<strong>The Bureau</strong>` → should be `<strong>Bureau of Intelligence</strong>`.

**Accept when**: `grep -rn ">Bureau<" frontend/` returns zero results. All references use the full brand name.

---

### DQA-443: Bootstrap green fallback #28a745 in player.html — should be Razzle green #2ec4b6

**Severity**: HIGH — wrong color palette leaking into production
**Files**: `frontend/player.html:119, 123`

The pro-badge styling uses Bootstrap's green as a CSS variable fallback instead of Razzle's teal green:

```css
color: var(--green, #28a745);
border: 2px solid var(--green, #28a745);
```

`#28a745` is Bootstrap. Razzle's `--green` is `#2ec4b6` (teal). If the CSS variable ever fails to load, users see the wrong color.

**BEFORE**: `var(--green, #28a745)` (2 instances)
**AFTER**: `var(--green, #2ec4b6)`

Also fix `--red` fallback `#e74c3c` (Bootstrap red) in these files — Razzle's red is `#e63946`:
- `frontend/styles.css:933` — `border-left: 4px solid var(--red, #e74c3c);`
- `frontend/agents.html:2157` — `var(--red, #e74c3c)`
- `frontend/lab.js:3235` — `var(--red, #e74c3c)`

**Accept when**: `grep -rn "#28a745\|#e74c3c" frontend/` returns zero results. All fallbacks match DESIGN.md palette.

---

### DQA-444: Hardcoded off-palette inline colors on noscript fallbacks

**Severity**: MEDIUM — wrong espresso shades, inline instead of CSS variables
**Files**: `frontend/agents.html:1604,1607`, `frontend/lab.html:3161,3164`, `frontend/league-intel.html:2535,2538`

The `<noscript>` fallback blocks use hardcoded colors that are NOT in the design palette:
- `color:#6b5a4e` — should be `var(--ink-medium)` which is `#5c4a3d`
- `color:#a89585` — should be `var(--ink-light)` which is `#8a7565`

These are inline styles. Even in noscript context, CSS custom properties work (they're CSS, not JS).

**BEFORE**: `color:#6b5a4e` / `color:#a89585`
**AFTER**: `color:var(--ink-medium, #5c4a3d)` / `color:var(--ink-light, #8a7565)`

**Accept when**: `grep -rn "#6b5a4e\|#a89585" frontend/` returns zero results.

---

### DQA-445: 1px borders on data table rows in JS-generated HTML — design spec requires 2px

**Severity**: MEDIUM — violates chunky border spec across core data views
**Files**: `frontend/charts.js` (8 instances), `frontend/lab.js` (4 instances), `frontend/lab-panels.js` (1 instance), `frontend/formulas.js` (1 instance), `frontend/player.js` (1 instance)

15 instances of `border-bottom:1px solid var(--ink-faint)` in JS-generated inline styles for table rows and dividers. DESIGN.md specifies: "Dashed dividers: 2px dashed var(--ink-faint) inside cards."

For table row borders (solid, not dashed), 1px is below the design minimum. The design guide says "NO thin 1px borders on primary elements."

**BEFORE**: `border-bottom:1px solid var(--ink-faint)`
**AFTER**: `border-bottom:2px solid var(--ink-faint)`

Key locations:
- `charts.js:904,908,1270,1274,1295,1304,1312,1316`
- `lab.js:2429,2445,9337,10886`
- `lab-panels.js:10208`
- `formulas.js:140`
- `player.js:749`

**Accept when**: `grep -rn "border-bottom:1px\|border-top:1px\|border:1px" frontend/*.js` returns zero results for `var(--ink-faint)` patterns.

---

### DQA-446: ~50 hardcoded border-radius values in styles.css — should use design tokens

**Severity**: MEDIUM — design tokens exist but aren't used consistently
**Files**: `frontend/styles.css`, `frontend/lab-panels.css`

DESIGN.md defines three border-radius tokens:
- `--radius-sm: 8px` (inputs, small badges)
- `--radius: 12px` (cards, containers, modals)
- `--radius-lg: 20px` (pills, chips, agent badges)

And says: "Use the token, not a hardcoded value."

`styles.css` has ~18 hardcoded `border-radius` values. `lab-panels.css` has ~30+ more. Examples from styles.css:
- `.nav-links a { border-radius: 8px; }` → `var(--radius-sm)`
- `.btn-chunky { border-radius: 8px; }` → `var(--radius-sm)`
- `.chip { border-radius: 20px; }` → `var(--radius-lg)`
- `.auth-form input { border-radius: 8px; }` → `var(--radius-sm)`

lab-panels.css additionally has non-standard values like `14px`, `5px`, `3px`, `2px`, `1px` that don't map to any token.

**AFTER**: Replace all `8px` → `var(--radius-sm)`, `12px` → `var(--radius)`, `20px` → `var(--radius-lg)`. For non-standard values (`2px`, `3px`, `5px`), either map to `var(--radius-sm)` or introduce a `--radius-xs: 4px` token if needed.

**Accept when**: `grep -n "border-radius: [0-9]" frontend/styles.css` returns only `50%` (circular) and `0` values. Same for lab-panels.css.

---

### DQA-447: Hedging language in agent briefing copy — violates "no ifs, buts, or maybes"

**Severity**: MEDIUM — brand voice violation in core Situation Room feature
**Files**: `frontend/agents.html:2333`, `frontend/warroom.js:2980`

DESIGN.md: "Razzle doesn't hedge. Other tools say 'consider starting' — Razzle says 'start him.' No ifs, buts, or maybes — just absolutes."

**Instance 1** — `agents.html:2333`:
```javascript
briefing.agents.bones = "Rising stock: " + riser.name + " (score " + riser.stock_score + "). Buy window might be closing.";
```
**AFTER**: `"Buy window is closing."`

**Instance 2** — `warroom.js:2980`:
```javascript
'Who might be willing to trade? Propose specific trade frameworks.'
```
**AFTER**: `'Who is willing to trade? Propose specific trade frameworks.'`

Also fix `scarcity.html` meta description if it contains "might surprise you" → "will surprise you".

**Accept when**: `grep -rn "might be\|might want\|consider starting\|you may want" frontend/` returns only non-UI-copy matches (e.g., localStorage error handling in lab.js:4390 is acceptable — that's a system message, not brand voice).

---

### DQA-448: Hardcoded medal/tier colors in lab-panels.css — should use CSS variables

**Severity**: LOW — hardcoded but correct colors, just not tokenized
**Files**: `frontend/lab-panels.css:580,603,605,3476`

Gold, dark-goldenrod, and sienna colors for medal rankings are hardcoded instead of using CSS variables:

```css
.tv-tier-num.t1 { background: #ffd700; }   /* gold — no variable */
.tv-rank.top1 { color: #b8860b; }           /* dark goldenrod — not in palette */
.tv-rank.top3 { color: #a0522d; }           /* sienna — not in palette */
.rc2-badge.gold { background: #ffd700; }    /* gold — duplicate */
```

styles.css already defines `--medal-gold` and related variables. These should be used.

**AFTER**: Use `var(--medal-gold)`, `var(--medal-silver)`, `var(--medal-bronze)` or define new variables if missing.

**Accept when**: `grep -n "#ffd700\|#b8860b\|#a0522d" frontend/lab-panels.css` returns zero results.

---

### DQA-449: Favicon path inconsistency — relative vs absolute across 4 pages

**Severity**: LOW — works locally but could break on subdirectory routes
**Files**: `frontend/404.html`, `frontend/compare.html`, `frontend/player.html`, `frontend/team.html`

Most pages use relative path:
```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
```

These 4 pages use absolute path:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
```

Both work, but the inconsistency suggests copy-paste drift. Since the site is served from root, both resolve the same — but standardize for maintainability.

**AFTER**: All pages use `/favicon.svg` (absolute, more robust for any route pattern).

**Accept when**: `grep -rn 'href="favicon.svg"' frontend/` returns zero results (all use `/favicon.svg`).

---

### DQA-450: about.html uses "The Lab" instead of "Fourth Down Lab" or "The Screener"

**Severity**: LOW — brand hierarchy not followed in marketing copy
**Files**: `frontend/about.html:258`

```html
<li><strong>The Lab</strong> (forever free) — NFL, college, and prospect data...</li>
```

DESIGN.md brand hierarchy says the free product is "The Screener" and the full feature set is "Fourth Down Lab". "The Lab" is neither — it's an informal shorthand that doesn't appear in the brand guide.

**BEFORE**: `<strong>The Lab</strong> (forever free)`
**AFTER**: `<strong>The Screener</strong> (forever free)` — per brand hierarchy: "When someone says 'have you used Razzle?' they mean the Screener."

**Accept when**: The about page correctly uses brand hierarchy terms. "The Lab" as standalone term does not appear in marketing copy.

---

## Design QA Walker — 2026-03-26 (10 tickets)

---

### DQA-500: Nav labels use "Screener" and "Bureau" instead of brand names

**Severity**: HIGH — brand identity diluted in primary navigation
**Files**: `frontend/app.js:162-163`

```js
{ href: "/lab.html", label: "Screener" },
{ href: "/league-intel.html", label: "Bureau" },
```

TICKETS.md Task 3 (P0) already requires "Fourth Down Lab" and "Bureau of Intelligence" as the nav labels. These are brand names, not suggestions. The current labels are informal shorthand that strips the product personality from the most visible UI element on every page.

**BEFORE**: `"Screener"`, `"Bureau"`
**AFTER**: `"Fourth Down Lab"`, `"Bureau of Intelligence"`

**Accept when**: `grep -n '"Screener"\|"Bureau"' frontend/app.js` returns zero navigation label matches. All nav links across desktop and mobile panels use the full brand names.

---

### DQA-501: Gradient in prompts.html violates "NO gradients" rule

**Severity**: MEDIUM — direct DESIGN.md violation
**Files**: `frontend/prompts.html:78`

```css
.prompt-text:not(.expanded)::after {
    background: linear-gradient(transparent, var(--bg));
}
```

DESIGN.md explicitly says "Don't: Gradients." This fade-out overlay on truncated prompt text uses a linear-gradient. Replace with a hard edge or a solid overlay that doesn't violate the design rule.

**BEFORE**: `background: linear-gradient(transparent, var(--bg));`
**AFTER**: `background: var(--bg); height: 24px;` — solid overlay bar with Caveat "show more..." text, or clip the container with `overflow: hidden` and no pseudo-element.

**Accept when**: `grep -n 'gradient' frontend/prompts.html` returns zero results.

---

### DQA-502: border-radius: 14px is not a design token

**Severity**: MEDIUM — inconsistent radius breaks visual rhythm
**Files**: `frontend/archetypes.html:115`, `frontend/dashboard.html:113`, `frontend/lab-panels.css:411`, `frontend/tiers.html:120`

4 files use `border-radius: 14px`. The design tokens are `--radius-sm` (8px), `--radius` (12px), and `--radius-lg` (20px). 14px falls between tokens and creates visual inconsistency — cards with 14px radius look almost-but-not-quite the same as 12px cards, which is worse than being obviously different.

**BEFORE**: `border-radius: 14px;`
**AFTER**: `border-radius: var(--radius);` (12px — these are all card-level containers)

**Accept when**: `grep -rn 'border-radius: 14px' frontend/` returns zero results.

---

### DQA-503: Lab thead uses soft blur shadow instead of offset chunky

**Severity**: MEDIUM — violates shadow design language
**Files**: `frontend/lab.html:1043,1046`

```css
.screener-table thead.thead-shadow th {
    box-shadow: 0 4px 8px rgba(45,31,20,0.08);
}
[data-theme="dark"] .screener-table thead.thead-shadow th {
    box-shadow: 0 4px 8px rgba(0,0,0,0.25);
}
```

The design guide specifies offset chunky shadows (`4px 4px 0 var(--ink)`), never soft blur shadows. This scroll-indicator shadow on the sticky table header uses a diffused blur pattern that looks like a generic Material Design component, not the chunky comic-strip aesthetic.

**BEFORE**: `box-shadow: 0 4px 8px rgba(45,31,20,0.08);`
**AFTER**: `box-shadow: 0 3px 0 var(--ink-faint);` — subtle downward line that signals scroll without breaking the offset-shadow language. Or `border-bottom: 2px solid var(--ink-faint)` as class toggle.

**Accept when**: No `rgba` blur shadows in the lab thead sticky header. Shadow uses design tokens only.

---

### DQA-504: agents.html canvas-container uses rgba(0,0,0) instead of var(--ink)

**Severity**: LOW — hardcoded color bypasses dark mode
**Files**: `frontend/agents.html:259,285,39`

```css
.canvas-container { box-shadow: 4px 4px 0 rgba(0,0,0,0.4); }
filter: drop-shadow(3px 3px 0 rgba(0,0,0,0.15));
filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.3));
```

Three shadow/filter declarations use hardcoded `rgba(0,0,0,...)` instead of `var(--ink)`. The Situation Room is always dark mode, so `rgba(0,0,0)` happens to work visually — but it breaks the principle that all colors flow through CSS variables. If the Situation Room palette ever shifts, these won't update.

**BEFORE**: `rgba(0,0,0,0.4)`
**AFTER**: `var(--ink)` with appropriate opacity, e.g., `4px 4px 0 color-mix(in srgb, var(--ink) 40%, transparent)` or a dedicated `--shadow-dark` token.

**Accept when**: `grep -n 'rgba(0,0,0' frontend/agents.html` returns only overlay backgrounds (modal backdrops), not shadow or filter declarations.

---

### DQA-505: border-radius: 6px in inline JS styles is not a token

**Severity**: MEDIUM — inline styles bypass design system
**Files**: `frontend/lab-panels.js:9589,9612,10015,10188`, `frontend/lab.js:9297`

5 inline-style strings in JS use `border-radius:6px`. This is not a design token (8/12/20 are the tokens). These are dynamically generated cards and containers in Lab panel renderers that build HTML strings with hardcoded styles.

**BEFORE**: `border-radius:6px` in HTML string templates
**AFTER**: `border-radius:var(--radius-sm)` (8px) — nearest token for small panel elements.

**Accept when**: `grep -rn 'border-radius:6px' frontend/*.js` returns zero results.

---

### DQA-506: 68+ standalone pages have no card hover-lift

**Severity**: HIGH — interactive cards feel static and dead across most of the site
**Files**: All standalone HTML pages except agents.html, archetypes.html, auction.html, prompts.html, tiers.html

DESIGN.md requires: "Hover-lift — interaction should feel physical" and "Cards: hover lifts." Only 5 of 73 HTML pages implement hover-lift (`translate + shadow increase`) on their page-specific cards. The remaining 68 pages have static cards with no hover response — they look inert, breaking the comic-strip "physical sticker" feel that is core to the brand.

The fix is a shared CSS class. Cards already use `border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink);` across the site. Add a `.card-lift` utility to `styles.css` with the hover-lift transition, then apply it to all page-specific card containers.

**BEFORE**: Cards are static (no transform on hover)
**AFTER**: Add to `styles.css`:
```css
.card-lift {
  transition: transform 0.12s, box-shadow 0.12s;
}
.card-lift:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--ink);
}
```
Then add `class="card-lift"` to card containers in each standalone page.

**Accept when**: At least 90% of page-specific card containers across standalone pages have hover-lift behavior. Spot-check dashboard.html, awards.html, leaders.html, efficiency.html, breakouts.html.

---

### DQA-507: Massive inline style count in league-intel.html (365), lab.html (300), agents.html (166)

**Severity**: HIGH — maintenance debt, dark mode fragility, design system bypass
**Files**: `frontend/league-intel.html` (365 inline style attrs), `frontend/lab.html` (300), `frontend/agents.html` (166)

These three flagship pages have hundreds of `style="..."` attributes in their HTML/JS. This means:
1. Styles can't be overridden by dark mode `[data-theme="dark"]` selectors
2. Design token changes don't cascade — every inline hex/value is frozen
3. Responsive breakpoints can't target inline styles
4. The pages are brittle: changing the design system requires finding and updating hundreds of individual strings

This is the single largest design system debt in the codebase. Prioritize league-intel.html (365 inline styles, zero dark mode overrides) as the worst offender.

**BEFORE**: `<div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-light); ...">`
**AFTER**: Extract repeated patterns into named CSS classes in the page's `<style>` block or `styles.css`. Target: reduce inline style count by 60%+ per page.

**Accept when**: `grep -c 'style="' frontend/league-intel.html` returns < 150 (down from 365). Same proportional reduction for lab.html and agents.html.

---

### DQA-508: 70+ standalone pages have zero dark mode overrides for page-specific styles

**Severity**: HIGH — dark mode is broken or visually degraded on most pages
**Files**: All standalone HTML pages (everything except lab.html, pricing.html, styles.css, lab-panels.css)

Zero standalone HTML pages have `[data-theme="dark"]` CSS rules. The global dark mode toggle in styles.css flips CSS variables, which works for elements using vars — but any page-specific `<style>` block that defines custom component styles (position tabs, section headers, loading states, custom cards) won't have dark mode adjustments for focus rings, borders, or subtle visual differences.

Critically: pages like dashboard.html, agents.html, league-intel.html define extensive custom styles that work in light mode but may have contrast or readability issues in dark mode because they never account for the flipped palette.

**BEFORE**: No `[data-theme="dark"]` rules in any standalone page
**AFTER**: Audit top-traffic pages (dashboard.html, awards.html, leaders.html, tradefinder.html, rankings.html) for dark mode rendering. Add `[data-theme="dark"]` overrides where contrast fails or components look wrong. At minimum: verify agents.html Situation Room always-dark doesn't conflict, verify league-intel.html is legible.

**Accept when**: Toggle dark mode on dashboard.html, awards.html, leaders.html, tradefinder.html, rankings.html — all are legible with correct contrast. Screenshots of each page in dark mode with no broken styling.

---

### DQA-509: Lab sidebar uses soft diffused shadow instead of chunky offset

**Severity**: LOW — shadow language inconsistency on mobile sidebar
**Files**: `frontend/lab.html:596`

```css
.lab-sidebar.open {
    box-shadow: -8px 0 24px rgba(45, 31, 20, 0.15);
}
```

The mobile sidebar overlay uses a large blur-radius shadow (24px) that looks like a Material Design drawer, not a comic-strip panel. The design guide only allows offset shadows (`Npx Npx 0 var(--ink)`).

**BEFORE**: `box-shadow: -8px 0 24px rgba(45, 31, 20, 0.15);`
**AFTER**: `box-shadow: -4px 0 0 var(--ink);` — hard left-edge shadow matching the chunky offset language. Or `border-left: 3px solid var(--ink);` with a semi-transparent backdrop overlay.

**Accept when**: Lab mobile sidebar uses offset shadow or border, not blur shadow. `grep -n '24px rgba' frontend/lab.html` returns zero results.

---

## Phase: Design QA — Site Walk (2026-03-26)

> Design QA agent walked the entire frontend (75 HTML files, styles.css, lab-panels.css, lab-panels.js, lab.js, warroom.js, charts.js, formulas.js) against DESIGN.md. 10 tickets below, ordered by severity.

---

### DQA-510: "AI Agents" used instead of "Situation Room" — 149 occurrences across 75 files

**Severity**: HIGH — brand name violation, user-facing on every page
**Files**: Every HTML file with nav/footer (75 files, 149 occurrences)

The nav link and footer link both say "AI Agents" instead of the brand name "Situation Room" on every single page. This was flagged in P0 Task 3 but never completed. DESIGN.md Brand Hierarchy item 4 defines the name as "The Situation Room (Pro)."

**BEFORE**: `>AI Agents</a>` in topnav and footer across 75 files
**AFTER**: `>Situation Room</a>` everywhere. Grep confirms zero remaining "AI Agents" strings in frontend/.

**Accept when**: `grep -r "AI Agents" frontend/` returns zero results. All nav links and footer links read "Situation Room."

---

### DQA-511: Cold black rgba(0,0,0) shadows instead of warm espresso

**Severity**: HIGH — violates "never blue-black ink" rule. DESIGN.md says all shadows use warm espresso (#2d1f14), never cold black.
**Files**: `agents.html:39,259,285`, `lab.html:908,960,1046`, `warroom.js:82,299,300,435,1244`

11 instances of `rgba(0,0,0,...)` used for drop-shadows, box-shadows, and overlays. Dark mode overlays in lab.html use cold black for modal backdrops. agents.html uses cold black for card shadows and icon drop-shadows.

warroom.js is an exception — pixel canvas rendering on the always-dark Situation Room uses `rgba(0,0,0)` for tile shading, which is acceptable since it's a pixel art engine on a near-black background.

**BEFORE**: `box-shadow: 4px 4px 0 rgba(0,0,0,0.4)` (agents.html:259)
**AFTER**: `box-shadow: 4px 4px 0 var(--ink)` or `rgba(45,31,20,0.4)` for alpha variants

**Fix scope**: agents.html (3 instances), lab.html (3 instances). Leave warroom.js as-is.
**Accept when**: `grep -n "rgba(0,0,0" frontend/agents.html frontend/lab.html` returns zero results.

---

### DQA-512: Forbidden gradient in prompts.html

**Severity**: HIGH — DESIGN.md Don't list explicitly says "NO gradients"
**Files**: `prompts.html:78`

```css
background: linear-gradient(transparent, var(--bg));
```

A fade-out overlay at the bottom of the prompt list uses a linear gradient. The design guide prohibits all gradients.

**BEFORE**: `background: linear-gradient(transparent, var(--bg));`
**AFTER**: `background: var(--bg); opacity: 0.9;` or a solid `var(--bg)` block with `border-top: 2px dashed var(--ink-faint)` to indicate truncation.

**Accept when**: `grep -n "linear-gradient\|radial-gradient" frontend/prompts.html` returns zero results.

---

### DQA-513: Off-token border-radius 14px on cards (should be 12px token)

**Severity**: MEDIUM — visual inconsistency, cards use non-standard radius
**Files**: `archetypes.html:115`, `dashboard.html:113`, `lab-panels.css:411`, `tiers.html:120` (note: `tiers.html` was reported but verify line)

Four card/container components use `border-radius: 14px` instead of the design token `var(--radius)` (12px). The design system defines exactly three radius values: 8px, 12px, 20px. 14px is not a token.

**BEFORE**: `border-radius: 14px;`
**AFTER**: `border-radius: var(--radius);` (resolves to 12px)

**Accept when**: `grep -rn "border-radius: 14px" frontend/` returns zero results.

---

### DQA-514: 5px box-shadow on 11 elements — should be 4px (standard) or 6px (hover)

**Severity**: MEDIUM — shadow scale drift, muddled visual hierarchy
**Files**: `styles.css:849,1697,1701`, `about.html:88`, `agents.html:727`, `index.html:374`, `lab.html:2153`, `league-intel.html:1999,2163,2284`, `matchups.html:115`

DESIGN.md specifies two shadow sizes: `4px 4px 0` (standard) and `6px 6px 0` (hover-lift). 11 elements use `5px 5px 0` which is neither — it creates visual ambiguity between resting and hover states.

**BEFORE**: `box-shadow: 5px 5px 0 var(--ink);`
**AFTER**: `box-shadow: 4px 4px 0 var(--ink);` for resting state, `6px 6px 0 var(--ink)` for hover state. Decide per-element: if it's a hover rule, use 6px. If it's default state, use 4px.

**Accept when**: `grep -rn "5px 5px 0" frontend/` returns zero results.

---

### DQA-515: Hardcoded #ffd700 and medal colors instead of --medal-gold token

**Severity**: MEDIUM — tokens exist but aren't used
**Files**: `lab-panels.css:580,603,605,3476`

`--medal-gold: #ffd700` and `--medal-bronze: #cd7f32` are defined in `:root` (styles.css:67-68) but lab-panels.css uses the raw hex values directly instead of the CSS variables. Additionally, `#b8860b` and `#a0522d` are used for ranking colors with no corresponding token at all.

**BEFORE**: `background: #ffd700;` (lab-panels.css:580)
**AFTER**: `background: var(--medal-gold);` — and define `--medal-silver: #b8860b` and `--medal-bronze-text: #a0522d` tokens in `:root` for the other two.

**Accept when**: `grep -n "#ffd700\|#b8860b\|#a0522d" frontend/lab-panels.css` returns zero results. All medal/rank colors use CSS variables.

---

### DQA-516: Hardcoded #fff breaks dark mode theming

**Severity**: MEDIUM — white text/backgrounds won't flip in dark mode
**Files**: `lab.js:1185`, `cheatsheet.html:227`

Two instances of hardcoded `#fff`:
1. `lab.js:1185` — sticky banner uses `color:#fff` on orange background. Should use `var(--text-on-accent)` which is already defined and flips correctly.
2. `cheatsheet.html:227` — print stylesheet sets `background: #fff`. Print is acceptable since it's physical paper, but should use `#f7efe5` (cream) to match brand feel in print.

**BEFORE**: `color:#fff` (lab.js:1185)
**AFTER**: `color:var(--text-on-accent)` — the token already exists for exactly this purpose.

**Accept when**: `grep -rn "color:#fff\|color: #fff" frontend/lab.js` returns zero results.

---

### DQA-517: "The Lab" mislabel on about.html — should be "The Screener"

**Severity**: MEDIUM — brand hierarchy violation
**Files**: `about.html:258`

```html
<li><strong>The Lab</strong> (forever free) — NFL, college, and prospect data...
```

DESIGN.md Brand Hierarchy item 1 defines the free tier as "The Screener (Forever Free)." "The Lab Panels" (item 2) is the paid tier. The about page incorrectly labels the free tier as "The Lab."

**BEFORE**: `<li><strong>The Lab</strong> (forever free)`
**AFTER**: `<li><strong>The Screener</strong> (forever free)`

**Accept when**: about.html brand hierarchy matches DESIGN.md exactly: "The Screener" (free), "The Lab Panels" (Pro), "The Bureau" (free+Sleeper), "The Situation Room" (Pro).

---

### DQA-518: "Copied!" with exclamation mark — should be "Copied." (period)

**Severity**: LOW — voice/tone violation. DESIGN.md: "Period over exclamation mark. Never shouty."
**Files**: `prompts.html:294,306`

Two buttons set text to `'Copied!'` after clipboard copy. Design voice guide says period over exclamation mark, always.

**BEFORE**: `btn.textContent = 'Copied!';`
**AFTER**: `btn.textContent = 'Copied.';`

**Accept when**: `grep -n "Copied!" frontend/prompts.html` returns zero results.

---

### DQA-519: Off-token 4px border-radius on small elements (should be 8px minimum)

**Severity**: LOW — many small UI elements use 4px radius, below the smallest token
**Files**: `lab-panels.css` (20+ instances), `lab-panels.js:9667`, `charts.js:891,1259`, `formulas.js:138,279`

The design system's smallest radius token is `--radius-sm: 8px`. Over 20 bar fills, badges, and inline chips use `border-radius: 4px` which is below the token floor. Most are progress bar fills and tiny inline badges where 8px might be too round — but the design guide says "use the token, not a hardcoded value."

Note: progress bar fills (`.tv-bar-fill`, `.av-tv-fill`, `.pt-pace-bar`, etc.) are inner elements inside 4px-radius containers. Using 4px here is a reasonable exception to prevent the fill from poking out of its container. The real violations are the standalone chips and badges in JS-generated HTML.

**BEFORE**: `border-radius:4px` on standalone badges (charts.js:891, formulas.js:138)
**AFTER**: `border-radius:var(--radius-sm)` (8px) on standalone badges and chips. Leave bar fills at 4px where they're inside matching-radius containers.

**Accept when**: JS-generated badges in charts.js, formulas.js, and lab-panels.js use `var(--radius-sm)` instead of hardcoded `4px`. Bar fill CSS in lab-panels.css is acceptable at 4px.
