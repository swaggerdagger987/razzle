## Razzle Codex Guide

### Mission
Ship Razzle phase-by-phase toward the north star. Optimize for a screenshot-worthy fantasy football analytics product, not generic app polish.

### Required Reading
Before making code changes or running the loop, read these files in order:
1. `docs/NORTH_STAR.md`
2. `docs/ROADMAP.md`
3. `docs/DESIGN.md`
4. `PROGRESS.md`
5. `LOOP-TASKS.md`
6. `CLAUDE.md`

### Product Rules
- Frontend stays vanilla HTML, CSS, and JS. No frameworks.
- Backend stays thin FastAPI endpoints over SQLite-backed data access.
- Follow `docs/DESIGN.md` exactly: sand background, terracotta accent, chunky borders, comic-strip energy.
- Do not skip phases. Do not move past a phase until its exit criterion is actually met.
- Use the old FDL codebase only as pattern reference. Rewrite clean for Razzle.

### Codex Loop
When the user asks for the Razzle loop, Codex loop, headless loop, or autonomous iteration:
- Treat `loop-prompt.txt` as the authoritative execution contract.
- Use these installed skills when relevant: `agency-agents-orchestrator`, `agency-sprint-prioritizer`, `agency-ui-designer`, `agency-whimsy-injector`, `agency-frontend-developer`, `agency-evidence-collector`, `agency-reality-checker`.
- Execute exactly one attempt on the next `PENDING` or `FAIL` task unless the user explicitly overrides that behavior.
- On PASS, update `LOOP-TASKS.md` and `PROGRESS.md`, commit, and push `origin/master`.
- On FAIL, record the concrete failure, increment the attempt count, and stop that attempt.
- If a task hits 3 failed attempts, mark it `BLOCKED`, log the blocker, and continue to the next unblocked task.

### Git
- Local git identity for this repo should be `swaggerdagger987` / `swaggerdagger987@users.noreply.github.com`.
- Autonomous loop runs are explicitly authorized to commit and push to `origin/master`.
