# Graveyard

**Pre-deletion holding pen. Not for current truth.**

Files here describe systems Razzle no longer runs. They live here briefly so
deletion can be reviewed, not as historical reference for active work.

---

## Rules

1. **Agents do not read `graveyard/`** when running the Company OS loop, picking
   slices, scoping architecture, or answering "how does this work?"
2. **No active doc, code, or script may reference a graveyard path.** If a
   reference appears, the reference is the bug — fix the active doc, do not pull
   the file back out.
3. **Each subfolder has a `RETIRED.md`** explaining what the system was and what
   replaced it.
4. **Deletion trigger** (any one):
   - 5 successful Company OS standups produced (Stage 0 → 1 unlock per
     `docs/company/AUTOMATION.md`)
   - 30 calendar days from 2026-05-27 (creation date)
   - Founder approval at a Founder Board
5. **Before deletion:** `git tag pre-graveyard-deletion-YYYY-MM-DD` so history is
   recoverable.

---

## Contents

| Folder | Retired system |
|--------|----------------|
| `v2-cofounder-loop/` | Three-equals cofounder loop (Opus / Codex / Composer + Gemini board) and runner |
| `process/` | V1 autonomous process artifacts (LOOP-TASKS, designer tickets, QA audits) |
| `reviews/` | Point-in-time audits from March 2026 |
| `marketing/` | Premature GTM research (Reddit / GTM / sprint journal) — reactivate at LAUNCH-READY |
| `designs/` | Old surface design memos (launch, bureau) |
| `top-level/` | Stale root-level docs (PROGRESS_ARCHIVE, CAMPAIGN_PLAN, BRAND_VOICE_REVIEW) |

---

## Where current truth lives

- Operating system: `docs/company/`
- Stage: `docs/company/STAGE.md`
- Build status: `docs/v2/STATUS.md` + `docs/v2/PARITY.md`
- Product compass: `docs/NORTH_STAR.md` + `docs/DESIGN.md` + `docs/DECISIONS.md`
- Acceptance gates: `docs/v2/ACCEPTANCE.md`
