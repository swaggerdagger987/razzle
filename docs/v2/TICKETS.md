# V2 Ticket Backlog — Reference (not the loop driver)

**Active loop:** `docs/v2/COUNCIL.md` — cofounders debate and SHIP features from `FEATURES.md`.

This file is a **reference backlog** mapped to north star. Council picks 1–3 items per cycle; Composer may bundle related rows.

Status: `PENDING` | `IN_PROGRESS` | `PASS` | `FAIL` | `BLOCKED`

---

## Phase A — Localhost Green (blocks everything)

| ID | Status | Title | North star tie | Owner hint |
|----|--------|-------|----------------|------------|
| A-001 | PASS | Screener age float validation | Screener free growth engine | API |
| A-002 | PASS | Explore error states + empty DB message | Trust the user | Web |
| A-003 | PASS | Wire `/api/explore/*` alias if frontend expects it | Stable API | API |
| A-004 | PENDING | Panel renderer: handle 402 pro gate in UI | Pro conversion | Web |
| A-005 | PENDING | League connect: persist league across routes | Context moat | Web |
| A-006 | PENDING | Bureau self-scout: show error when no Sleeper user | Personalization | Web |

## Phase B — Depth (screenshot-worthy)

| ID | Status | Title | North star tie | Owner hint |
|----|--------|-------|----------------|------------|
| B-001 | PENDING | Player Sheet: league tab with roster fit stub | Context layer | Web |
| B-002 | PENDING | Top 10 panels: verify handler + renderer match | Lab Pro value | Full-stack |
| B-003 | PENDING | Explore: column picker + 5 core stat columns | Screener power | Web |
| B-004 | PENDING | OG share card for explore state | Reddit screenshots | Web |
| B-005 | PENDING | Head-to-head opponent picker | Bureau moat | Full-stack |

## Phase C — Pixel Situation Room (non-negotiable)

| ID | Status | Title | North star tie | Owner hint |
|----|--------|-------|----------------|------------|
| C-001 | PENDING | Extract pixel engine from `legacy/frontend/agents.html` → `packages/pixel-room/` | Brand delight | Web |
| C-002 | PENDING | React wrapper `<PixelRoom />` on `/room` | Ship pixel room | Web |
| C-003 | PENDING | Agent sprites + state machine (IDLE/WALK/WORK/THINK) | Living agents | Web |
| C-004 | PENDING | Link agent WORK state to LLM pending/running | UX magic | Full-stack |
| C-005 | PENDING | Briefing panel overlay on canvas (v5-hybrid layout) | One UX | Design |

Reference: `legacy/frontend/agents.html`, `legacy/frontend/warroom.js`, `legacy/frontend/assets/characters/`

## Phase D — Moat polish

| ID | Status | Title | North star tie | Owner hint |
|----|--------|-------|----------------|------------|
| D-001 | PENDING | Agent context: full league roster in prompt | Context > ChatGPT | API |
| D-002 | PENDING | Stripe webhook → plan sync | Monetization | API |
| D-003 | PENDING | Remove dev toolbar from production build | Polish | Web |
| D-004 | PENDING | Watermarked explore PNG export | Free marketing | Web |

---

## Adding tickets

Council adds rows here when Reddit intel or audits surface new work. Debate in `COUNCIL.md`, update status when shipped.
