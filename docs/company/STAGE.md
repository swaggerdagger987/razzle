# Razzle Stage

Razzle is in **deep build, no-launch, no-users** stage.

This document is read by every role on every cycle. The stage shapes the roles
that exist, the meetings that fire, and the metrics that matter. When the stage
advances, this document updates first, then role files, then automation.

---

## Current stage: BUILD

| Dimension | State |
|-----------|-------|
| Product | ~15% of V1 depth, ~5% of ceiling per `docs/v2/PARITY.md`. Pillars at L4-L5. |
| Launch | Not yet. Twitter and Reddit launches are deferred. |
| Users | None. No paid users. No public free users. |
| Constraint | Quality and velocity of **one atomic slice per morning**. Sustainable token spend. |
| Cost | Target ≤80k input per morning cycle. Planner ≤25k, Builder ≤40k, Verify ≤15k. |
| Bottleneck | Build queue throughput and verified completion. |

### What this implies

- The Company OS is **build-coded by design**: 4 build roles + 1 research + 1 coordination.
- Distribution roles are **deferred**, not abandoned.
- Scorecards measure internal progress (PARITY / DEPTH / ACCEPTANCE), not external metrics
  (revenue, signups, retention).
- The Outside Reality Briefing exists to feed the **build queue**, not to launch a
  posting cadence.
- Reality Checker uses internal acceptance gates as ground truth, since users do not exist
  to act as a backstop.

### What is in scope right now

- Climbing DEPTH layers per `docs/v2/PARITY.md` and `docs/v2/DEPTH.md`.
- Closing RED rows in PARITY.
- Hardening ACCEPTANCE gates in `docs/v2/ACCEPTANCE.md`.
- Building memory (per-role memory files).
- Sharpening role contracts via three-run evidence-of-impact trials.
- **Slack-triggered single-cycle runs** via the morning + evening Cursor
  Automations (`docs/company/automations/`). `good morning team` opens the
  workday, scheduled ticks continue the loop, role-addressed Slack questions
  run during the day, and `good evening team` creates the CEO nightly review.
  Passing PRs can merge autonomously. See `docs/company/SLACK.md`.

### What is out of scope right now

- Reddit / Twitter / Discord posting under the Founder's identity.
- Launch copy, landing-page experiments, marketing site polish.
- Pricing experiments, Stripe go-live, paid trials.
- New roles beyond the current six.
- Founder-only changes: NORTH_STAR, DESIGN, DECISIONS, role creation, Stripe /
  pricing decisions, and public posting under the Founder's identity.
- `scripts/company_loop.sh` — superseded by Cursor Automations. See
  `docs/company/AUTOMATION.md`.
- Automated stage advancement.

---

## Stage advancement triggers

Stages advance only when the Founder explicitly approves at a Founder Board.

### BUILD → LAUNCH-READY

All of:

- `docs/v2/FEATURES.md` is all GREEN.
- `docs/v2/PARITY.md` reaches at least 60% of V1 depth (founder judgment).
- `docs/v2/ACCEPTANCE.md` gates 0-4 pass on localhost without scaffold.
- Role contracts have produced consistent artifacts for at least 3 cycles each.
- Founder runs the loop without rewriting >30% of any role's output.
- One end-to-end Stripe test charge has cleared.
- A friends-and-family beta plan exists in writing.

When triggered:

- Add **Brand Guardian**: weekly public copy and screenshot review.
- Add **Launch Captain**: deployment health, DNS, Stripe verification, monitoring.
- Reactivate Outside Reality Briefing's posting-input scope.
- Outside Reality Briefing cadence increases to 2-3×/week.
- Founder Board cadence becomes weekly until launch.

### LAUNCH-READY → DISTRIBUTION

All of:

- Twitter launch executed; first thread shipped under Founder's handle.
- 2+ months of genuine Reddit participation logged in `docs/v2/REDDIT.md`.
- Friends-and-family beta has produced at least 5 written feedback items.
- Free Screener is on the public domain with watermarked share cards.

When triggered:

- Add **Growth Operator**: Reddit / Twitter cadence and content calendar.
- Reframe Data Researcher as feature-input + content-input dual mandate.
- Scorecards add: posts that landed, share cards in the wild, free signups.
- Customer Voice role activates on first paid user.

### DISTRIBUTION → REVENUE

All of:

- 1 paid user (any plan) on Stripe.
- 10 free users on the live free Screener.
- Reddit posts under Founder's handle have produced at least one screenshot
  thread that mentions Razzle without prompting.

When triggered:

- Add **Customer Voice**: support, feedback, churn reasons.
- Scorecards add: paid users, MRR, free → paid conversion %, churn.
- Founder Board cadence becomes trigger-based again, calmer.

### REVENUE → SCALE

Out of scope. Document when the company gets there.

---

## Reading discipline

Every role's autoresearch loop step 1 ("read the North Star and current status")
includes reading this file. If a role proposes work that is out of scope for the
current stage, the verdict is `KILL` (Strategist) or `VETO` (Architect / Builder).
