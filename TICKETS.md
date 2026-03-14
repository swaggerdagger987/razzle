# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

---

---


---

---

## Phase: Visual Polish

**Exit Criterion**: Zero 1px borders on primary elements. Zero hardcoded white. Typography on-scale. prefers-reduced-motion exists.

### Task 1: Fix 1px borders across pricing, landing, agents

**Files**: frontend/index.html, frontend/pricing.html, frontend/agents.html

Replace 1px solid with 2px dashed on featured rows, feature lists, matrix cells, comparison table.

**Acceptance**: Zero 1px solid borders on primary content.

---

### Task 2: Fix hardcoded white and cold backgrounds for dark mode

**Files**: frontend/index.html, frontend/lab.html, frontend/app.js

sprawl-bubble white to var(--bg-card). Modal overlays to warm espresso rgba. Sleeper input to var(--bg-card).

**Acceptance**: No hardcoded white or cold rgba. Dark mode correct.

---

### Task 3: Fix off-scale typography

**Files**: frontend/index.html, frontend/lab.html

Hero h1 42px to 36px. Panel title 22px to 20px.

**Acceptance**: All font sizes on scale.

---

### Task 4: Add prefers-reduced-motion media query

**File**: frontend/styles.css

Global rule killing all animations when OS reduce-motion is enabled.

**Acceptance**: All animations stop with reduce-motion enabled.

---

## Phase: Bloomberg Kill — Full Rebrand Pass

**Exit Criterion**: Zero instances of Bloomberg in any file. Hero leads with Lab. All references use research lab positioning.

### Task 1: Kill Bloomberg across all frontend files

**Files**: All HTML files in frontend/, frontend/assets/og-image.svg, frontend/assets/og-image-lab.svg

Search for Bloomberg and bloomberg across the entire frontend. Replace based on context: hero/titles use "Fantasy Football Research Lab" or "The Lab is open." Meta descriptions use "Free fantasy football research lab." OG image SVGs update text.

**Acceptance**: grep -ri bloomberg frontend/ returns zero results.

---

### Task 2: Kill Bloomberg in docs and config

**Files**: CLAUDE.md, docs/NORTH_STAR.md, docs/ROADMAP.md, README.md, backend/config/tools_hub.json

Replace all Bloomberg references with research lab language. Reveal post title becomes "I built a free fantasy football research lab."

**Acceptance**: grep -ri bloomberg . returns zero results across entire repo (excluding git history).

---

### Task 3: Reorder landing page — Lab first, agents second

**File**: frontend/index.html

Hero: "The Lab is open." / "70+ stat panels. Custom formulas. Shareable views. Free." CTA buttons: Open the Lab first (primary), Meet the agents second (secondary). Final CTA leads with Lab. Page flow: Hero then Lab features then Bureau then Situation Room then Pricing. The Lab is the star.

**Acceptance**: Hero says The Lab is open. Primary CTA is Lab. Page flow leads with free product.

---

## Phase: Brand Voice Copy Polish

**Exit Criterion**: No fake stats, no fear marketing, no generic SaaS copy.

### Task 1: Fix landing page copy

**File**: frontend/index.html

Replace fake 80 percent stat with Your edge is scattered across 12 tabs. Remove fear marketing. Fix self-congratulatory lines.

**Acceptance**: No fake statistics. No fear language.

---

### Task 2: Fix pricing page copy

**File**: frontend/pricing.html

Pick Your Plan to Pick Your Playbook. Trial banner to On the house. Feature Comparison to The full breakdown. FAQ header to Questions we keep getting.

**Acceptance**: All copy matches Razzle voice.

---

### Task 3: Fix agents page loading states

**File**: frontend/agents.html

Replace loading with pulling. Fix setup wizard copy. Fix pixel engine text.

**Acceptance**: Zero instances of loading in user-facing text.

---

## Phase: Staff Engineer Bug Fixes

**Exit Criterion**: Lifetime badge correct. Trial expiry enforced. Failed leagues retryable. Checkout has error state. Timeouts on all async calls.

### Task 1: Fix pro_lifetime badge

**File**: frontend/app.js

Fix updateAuthUI plan check to include pro_lifetime and elite_lifetime.

**Acceptance**: Lifetime users see correct badge.

---

### Task 2: Force re-check auth on tab focus

**File**: frontend/app.js

visibilitychange listener calls checkAuth() after 5+ minutes hidden.

**Acceptance**: Expired trial users lose Pro on tab return.

---

### Task 3: Fix dataset.loaded race condition

**File**: frontend/league-intel.html

Move dataset.loaded=true to after successful fetch. Set false on failure.

**Acceptance**: Failed league expansions retryable.

---

### Task 4: Add timeout to callServerLLM

**File**: frontend/warroom.js

30s AbortController. User-friendly error on timeout.

**Acceptance**: 30s timeout. Error message shown.

---

### Task 5: Add error state for failed checkout polling

**File**: frontend/app.js

After 10 failed polls, show clear error with next steps.

**Acceptance**: User sees actionable error.

---

### Task 6: Add getSleeperPlayers timeout and error handling

**File**: frontend/league-intel.html

15s AbortController. Try-catch. User-friendly error. Retry possible.

**Acceptance**: 15s timeout. Error shown. Retry works.

---
