# Company Guardrails

These are the non-negotiable controls that make autonomy safe.

If these are missing, the team can still move fast but reliability will decay.

---

## 1) Branch Protection (required)

Protect `razzle-v2-redesign` in GitHub.

Minimum settings:

1. Require a pull request before merging.
2. Require status checks to pass before merging.
3. Require branch to be up to date before merging.
4. Restrict force pushes.
5. Restrict deletions.

Recommended required checks:

- `pytest apps/api/tests -q`
- `npm run build`

Name checks exactly as your CI workflow reports them.

Autonomous merge is allowed only through PRs that pass these checks.

---

## 2) Run Lock (required)

Use a repo-wide lock to prevent overlapping automations.

Lock mechanism:

- Canonical lock: an open GitHub issue titled `company-os-lock`.
- Morning, Tick, and Evening automations must:
  1. Check for an open `company-os-lock` issue before work.
  2. Exit early if lock is held by another run.
  3. Create/update lock at start.
  4. Close lock on clean exit.

If lock cannot be acquired (API/auth issues), the run should post a blocker and
exit instead of risking concurrent writes.

---

## 3) Prompt Sync Discipline (required)

Prompts in `docs/company/automations/*.md` are source of truth.

Dashboard prompts must match repo prompts.

Process:

1. Edit prompt file in repo.
2. Merge prompt PR.
3. Copy updated prompt text to Cursor automation dashboard.
4. Log sync event in nightly review.

Use `docs/company/automations/VERSION.md` as the visible version marker.

---

## 4) Domain Drift Guard (required)

Every build cycle must show domain intent:

- Explore / Lab / League(Bureau) / Room target
- Player Sheet or hallway impact
- PARITY/DEPTH/ACCEPTANCE citation
- football-specific user value

If output reads like generic SaaS work, Reality Checker marks NEEDS WORK.

---

## 5) Founder-Only Boundaries (required)

Automation may not autonomously:

- change `NORTH_STAR.md`, `DESIGN.md`, `DECISIONS.md`
- create/delete company roles
- change Stripe/pricing/charge behavior
- post publicly under Founder identity

These are routed to `Board:` or tagged `NEEDS FOUNDER`.
