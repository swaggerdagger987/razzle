# Company OS Harness — Setup Checklist

**Goal:** Run the software factory from your phone via Slack. One message starts a
cycle; the cloud agent reads the North Star, scores against **T1–T7**, ships a
PR, and posts back.

**North Star (scoring law):** `docs/NORTH_STAR.md` — especially **§ How we score work**.

**Operator cheat sheet:** `docs/company/SLACK.md`

**Cycle completion law:** `docs/company/FACTORY-DOD.md` — PR merged, preview verified.

---

## What the harness is

Three layers. All three must exist before autonomy is real.

| Layer | What | Where |
|-------|------|--------|
| **Compass** | Vision + Trust Score T1–T7 | `docs/NORTH_STAR.md` |
| **Rails** | Roles, loop, prompts, guardrails | `docs/company/*`, `AGENTS.md` |
| **Execution** | Cursor Automations + GitHub + Slack | Dashboard (you configure once) |

Prompts are **versioned in git**. Triggers and credentials live in **Cursor dashboard**.

---

## Phase 0 — GitHub (30 min)

Do this in the browser. Agents cannot merge safely without it.

### 1. Default branch for factory work

- Factory base branch: **`razzle-v2-redesign`**
- All standup PRs merge here (not `master` until you intentionally promote)

### 2. Branch protection on `razzle-v2-redesign`

Settings → Branches → Add rule:

- [x] Require a pull request before merging
- [x] Require status checks to pass (see CI job names below)
- [x] Require branches to be up to date
- [x] Block force pushes

**Required checks (must match CI exactly):**

| Job name in GitHub | What it runs |
|--------------------|--------------|
| `api` | ruff + pytest |
| `web` | typecheck + lint |
| `web-build` | `npm run build` |

After merging harness CI updates, open a test PR and confirm these three appear.

### 3. Cursor GitHub App

- Install Cursor GitHub integration on `swaggerdagger987/razzle`
- Grant **read + write** (contents, pull requests) on the repo
- Allow PRs from agent branches targeting `razzle-v2-redesign`

### 3b. Automation scope (critical for push)

| Scope | Push auth | When to use |
|-------|-----------|-------------|
| **Team Owned** | Org Cursor GitHub App | **Recommended** for morning/tick — matches Slack factory |
| Private | User token on VM | Often **no push** on fresh Automation VMs |

In Cursor → Automations → each automation → confirm **Open Pull Request** is
enabled. Agents must use it when `git push` fails.

### 3c. Merge without Founder click (pick one)

**Option A — Auto-merge (simplest):**

1. GitHub repo → Settings → General → Allow auto-merge
2. Branch protection: allow auto-merge when `api`, `web`, `web-build` pass
3. Agents run `gh pr merge --auto --merge` when gh works; otherwise PR stays
   open until checks green + auto-merge fires

**Option B — Cursor bot bypass:**

1. Settings → Branches → `razzle-v2-redesign` → bypass list
2. Add the **Cursor GitHub App** or `cursor[bot]` if your org uses that identity
3. Still require the three CI checks

Without A or B, agents will open PRs but Slack will show `open NEEDS FOUNDER
merge rule` — that is expected, not a bug.

### 4. Run lock (convention)

No UI — agents use `gh`:

- Open issue titled exactly: **`company-os-lock`**
- Morning/tick create it at start, close at end
- If two automations overlap, second run exits

---

## Phase 1 — Cursor Cloud Agent environment (15 min)

Repo file: **`.cursor/environment.json`** (update script runs on every agent VM boot).

Verify locally once:

```bash
npm install
python3 -m venv .venv-v2
.venv-v2/bin/pip install -r apps/api/requirements-dev.txt
.venv-v2/bin/pip install -r legacy/requirements-dev.txt
.venv-v2/bin/python scripts/sync_data.py --quick   # first time only (~20MB)
```

Agents need `data/terminal.db` for Explore/Lab evidence. It is gitignored.

**Secrets in Cursor dashboard** (not in repo):

| Secret | Required for |
|--------|----------------|
| `JWT_SECRET` | API tests / local smoke |
| `ENVIRONMENT=development` | API |
| `DEV_PLAN=elite` | Pro gates without Stripe |

Optional later: `RAZZLE_LLM_API_KEY`, Stripe keys — see `docs/v2/SECRETS.md`.

---

## Phase 2 — Slack + Cursor Automations (45 min)

Full specs: `docs/company/automations/README.md`

### Slack

1. Create channel `#razzle-team` (or your name — update prompts if different)
2. Install Cursor Slack app; link your Cursor account
3. Connect repo `swaggerdagger987/razzle`, base **`razzle-v2-redesign`**

### Create four automations

Copy prompt bodies from repo files. Start each with `PROMPT_VERSION` line.

| Automation | Trigger | Prompt file | Model (starting point) |
|------------|---------|-------------|----------------------|
| **Morning Standup** | Slack keyword `good morning team` | `good-morning.md` | Opus 4.7 thinking |
| **Ask The Team** | Prefix `Strategist:` etc. | `ask-team.md` | Sonnet 4.6 thinking |
| **CEO Nightly** | Slack keyword `good evening team` | `good-evening.md` | Sonnet 4.6 thinking |
| **Loop Tick** | Schedule every 60–90 min | `tick.md` + morning body | Opus or GPT-5.5 medium |

**Tools to enable:** Open Pull Request (required), Send to Slack, Memories.

**Scope:** Team Owned for morning + tick (see §3b above).

PR merge when checks pass — configure auto-merge or bot bypass (§3c).

**Test order:**

1. `Team: Are we ready to run a morning cycle?` (no PR expected)
2. `good morning team` (expect standup PR + Slack roll call)
3. One manual tick (only after morning PR merged or workday open on branch)
4. `good evening team` (digest, close workday)

---

## Phase 3 — First live cycle (watch once)

When you send **`good morning team`**:

```text
Slack → Cursor Automation → Cloud VM (/workspace)
  → read AGENTS.md + NORTH_STAR.md (T1–T7)
  → read automations/good-morning.md
  → Outside Reality (1–3 signals)
  → Standup + three-equals vote
  → Build slice from PARITY/NEXT.md
  → Reality Checker (curl / screenshot / pytest)
  → Score Trust pillars T1–T7 in standup
  → commit → push → PR standup: YYYY-MM-DD
  → merge if api + web + web-build green
  → Slack summary with PR link
```

**Your phone job:** read Slack at night. Override only if direction is wrong.

---

## Phase 4 — Carrot (scoring) in every artifact

Every cycle must log **which Trust pillars moved**:

| Pillar | Question |
|--------|----------|
| T1 | Decision trust |
| T2 | League-relative |
| T3 | Player Sheet hub |
| T4 | Film-room loop (post-Sunday story) |
| T5 | Lab invention / visual |
| T6 | Screenshot gravity |
| T7 | Free-tier obsession |

**Where it gets recorded:**

- `docs/company/standups/YYYY-MM-DD.md` — `Trust score: T1,T3,T5` line
- `docs/v2/results.tsv` — in `description` column: `trust=T1,T3,T5; slice=...`
- Slack roll call — Reality line cites evidence + pillars

**Instant VETO** (do not merge): see `NORTH_STAR.md` § Instant VETO.

---

## Phase 5 — Prompt sync discipline

When you change a prompt:

1. Edit `docs/company/automations/<name>.md` in a PR
2. Merge to `razzle-v2-redesign`
3. Copy full prompt into Cursor dashboard
4. Bump `docs/company/automations/VERSION.md`
5. Nightly review checks dashboard vs repo (manual until automated)

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Agent can't merge | Branch protection check names ≠ CI jobs (`api`, `web`, `web-build`) |
| **Local commit, no push** | Automation VM lacks git creds → enable **Team Owned** + Open PR tool; see § Publish blocked |
| **gh read-only / 403 merge** | Enable auto-merge (§3c) or add Cursor app to bypass with checks required |
| Tick does nothing | `workday.json` still `closed` on base — merge morning PR first |
| Empty Explore / no players | Run `sync_data.py --quick` in VM or add to env setup |
| Two cycles collide | `company-os-lock` issue left open — close manually |
| Prompt drift | Compare dashboard to repo; VERSION.md |
| Generic SaaS output | Reality FAIL on T6 — cite DESIGN.md |

### Publish blocked

If Slack shows `BLOCKED: GITHUB_PUBLISH`:

1. Cursor Dashboard → Integrations → GitHub → confirm app on `swaggerdagger987/razzle`
2. Automations → Morning + Tick → **Team Owned** scope (not Private)
3. Tools → **Open Pull Request** enabled
4. Re-run trigger or wait for next tick
5. Cherry-pick local commit from agent branch if it never pushed (check branch on GitHub)

Agents should always report CONTENT_HASH even when publish fails so you can recover.

---

## What you own vs what the factory owns

| **You (Founder)** | **Factory (agents)** |
|-------------------|----------------------|
| Brand, voice, Reddit posts | PARITY/DEPTH slices |
| NORTH_STAR / DESIGN / DECISIONS edits | T1–T7 scoring each cycle |
| Stripe go-live, pricing calls | Code + standups + memory |
| Merge override when direction wrong | Autonomous merge when gates pass |

---

## Done when

- [ ] Branch protection + 3 CI checks green on a test PR
- [ ] Four Cursor Automations live with repo prompts pasted
- [ ] First `good morning team` produced standup PR + Slack + memory append
- [ ] `results.tsv` row includes `trust=T…` in description
- [ ] You reviewed one nightly digest without rewriting >30% of output

Then enable **Loop Tick** on a schedule and walk away until evening.
