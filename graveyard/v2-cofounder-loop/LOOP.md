# Razzle V2 — Cofounder Loop

**Read first:** `docs/v2/PROGRAM.md` (autoresearch skill) → `docs/v2/COFOUNDERS.md` (three equals)

Three models are **equal cofounders**. They read the compass, **debate with mutual accountability**, ship one vertical slice per cycle, score keep/discard, and **chain with zero idle time**.

Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch). Coding discipline: [Karpathy CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md).

**Models:**
- **Opus 4.7** — brand, north star, Reddit research
- **Codex 5.3** — structure, audit, simplicity enforcement
- **Composer** — bulk implementation

---

## The loop (one cycle ≈ 60–90 min, chain forever)

```
     ┌──────────────────────────────────────────┐
     │ 0. SYNC — Read PROGRAM.md, results.tsv, │
     │    COUNCIL.md (full thread), PARITY,     │
     │    localhost smoke                        │
     └─────────────────┬────────────────────────┘
                       ▼
     ┌──────────────────────────────────────────┐
     │ 1. COUNCIL — Three equals, one thread    │
     │    Each replies by name + calls out blind │
     │    spots. ONE vertical slice. 2/3 SHIP.   │
     └─────────────────┬────────────────────────┘
                       ▼
     ┌──────────────────────────────────────────┐
     │ 2. BUILD (Composer) — Karpathy: surgical, │
     │    simple, verified                        │
     └─────────────────┬────────────────────────┘
                       ▼
     ┌──────────────────────────────────────────┐
     │ 3. AUDIT (Codex) — independent, harsh    │
     └─────────────────┬────────────────────────┘
                       ▼
     ┌──────────────────────────────────────────┐
     │ 4. BRAND (Opus) — DESIGN, VOICE, Reddit  │
     └─────────────────┬────────────────────────┘
                       ▼
     ┌──────────────────────────────────────────┐
     │ 5. SCORE — keep | discard | crash        │
     │    Log results.tsv + evidence file       │
     └─────────────────┬────────────────────────┘
                       ▼
              IMMEDIATELY → next cycle
              (never ask human to continue)
```

**Odd cycles:** Opus appends `REDDIT-INTEL.md` before council.

**No standstill:** SHIP → build in same session. FAIL → fix (max 3) or discard and continue.

---

## Council debate prompt

```markdown
Read docs/v2/PROGRAM.md first.

You are an EQUAL cofounder. Read:
- docs/v2/results.tsv (prior experiments)
- docs/NORTH_STAR.md, DESIGN.md
- docs/v2/DEPTH.md, PARITY.md, HALLWAY.md, VOICE.md, REDDIT.md
- docs/v2/COUNCIL.md (full thread)
- docs/v2/ACCEPTANCE.md

Role: {OPUS | CODEX | COMPOSER}

Append to docs/v2/COUNCIL.md under "## Council — Cycle {N}":

1. **Re: [other cofounder by name]** — call out blind spot or agree with reason
2. **Slice proposal** — ONE vertical slice (pillar + layer + hallway checklist)
3. **Acceptance checks** — verifiable gates for this cycle
4. **Vote** — SHIP / VETO / DEFER

Rules:
- Karpathy: simplicity first, surgical scope
- No horizontal sprawl (76-page port, Twitter, auth polish)
- Do not block on SECRETS.md keys
- 2/3 SHIP → Composer builds immediately
```

Run three messages in order: Opus → Codex → Composer.

---

## Build rules (Composer)

- Implement **only** the council-SHIPped slice
- [Karpathy CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md): minimum code, no speculative abstractions
- Extend existing modules; match repo style
- Verify: `pytest apps/api/tests -q && npm run build` + localhost smoke

---

## Audit prompt (Codex)

```markdown
Independent audit — Cycle {N}. You did NOT write this code.

1. git diff since last keep
2. pytest + npm run build
3. Localhost smoke on slice routes
4. Bugs, null paths, 500s, god files, N+1 queries
5. Karpathy: overcomplicated? Could this be half the lines?

Append "## Audit — Cycle {N}": PASS | FAIL + numbered fixes

Must include **Git gate:** commit hash + `git status` clean (FAIL / VETO keep if dirty or hash missing)
```

---

## Brand prompt (Opus)

```markdown
Brand pass — Cycle {N}.

1. DESIGN.md compliance
2. VOICE.md — no "AI" in user-facing copy
3. REDDIT.md — screenshot-worthy or bot-fact-worthy?

Append "## Brand — Cycle {N}": PASS | FAIL
```

---

## Score + log (end of cycle)

Append `## Score — Cycle {N}` and row to `docs/v2/results.tsv`:

```
cycle	commit	score	status	pillar	slice	description
```

- **keep** — advance; cycle score improved; **commit hash required**
- **discard** — revert bad experiment; **commit the revert**; log; continue
- **crash** — gates/tests broken after 3 fixes; revert; **commit**; continue

**Then:** `git add -A && git commit -m "…"` — working tree must be clean before next cycle.

Add `docs/v2/evidence/YYYY-MM-DD-<pillar>-<layer>.md` (include commit hash).

---

## Activation

### Continuous (recommended)

**Cursor — paste once:**
```
Execute loop-prompt-continuous.txt — continuous cofounder loop per docs/v2/PROGRAM.md
```

**Terminal:**
```bash
./scripts/v2_loop.sh --continuous   # shell chains forever — zero sleep
./scripts/dev_stack.sh               # fix stale localhost
```

Do **not** use `/loop 5m` timers — start/stops are decay.

### Single cycle

```bash
./scripts/v2_loop.sh 1
```

Or paste `loop-prompt-v2.txt` in Agent chat.

### 3-model split

```bash
./scripts/v2_loop.sh --steps-continuous
```

---

## Files

| File | Purpose |
|------|---------|
| `docs/v2/PROGRAM.md` | **Autoresearch skill** — metric, loop, never stop |
| `docs/v2/results.tsv` | Experiment log (keep/discard/crash) |
| `docs/v2/CONTINUOUS.md` | Operator doctrine |
| `docs/v2/COFOUNDERS.md` | Three equals + accountability |
| `docs/v2/COUNCIL.md` | Shared debate + audit thread |
| `docs/v2/PARITY.md` | Vertical slice backlog |
| `docs/v2/DEPTH.md` | L0–L5 depth ladder |
| `docs/v2/HALLWAY.md` | Connective tissue checklist |
| `docs/v2/VOICE.md` | No AI marketing |
| `docs/v2/REDDIT.md` | Reddit-only GTM |
| `docs/v2/ACCEPTANCE.md` | Localhost gates |
| `docs/v2/LOOP-STATE.md` | cycle #, focus slice |
| `docs/v2/evidence/` | Screenshot / proof files |
| `loop-prompt-v2.txt` | Per-cycle prompt |
| `loop-prompt-continuous.txt` | Chain wrapper |

---

## When is the product "finished"?

**Never** — until the human stops the shell.

When `FEATURES.md` is all GREEN, climb `PARITY.md` DEPTH layers. When those are done, deepen L5 within each pillar. The compass is built; intelligence compounds.

Human adds secrets from `SECRETS.md` when ready for live billing + Reddit bot. No redesign required.
