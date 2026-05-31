# Razzle Org Chart

Razzle starts as a six-role AI company. Roles stay small until evidence proves
they need to split.

---

## Current Org

```text
Founder / CEO
    |
    v
Chief of Staff
    |
    +-- Product Strategist
    |       |
    |       +-- Data Researcher
    |
    +-- Engineering Architect
    |       |
    |       +-- Builder
    |
    +-- Reality Checker
```

The Chief of Staff coordinates. Product decides what matters. Engineering decides
how to build it. Builder ships. Data Researcher brings outside reality in. Reality
Checker prevents fantasy approvals.

---

## Role Summary

| Role | Mandate | Model default | Escalation model |
|------|---------|---------------|------------------|
| Chief of Staff | Set agenda, coordinate meetings, maintain operating memory | `gpt-5.5-medium` | `claude-opus-4-7-thinking-xhigh` |
| Product Strategist | Pick the highest-leverage product slice toward 1,000 paid users | `claude-opus-4-7-thinking-xhigh` | Same |
| Engineering Architect | Preserve code health, choose architecture, define tests | `gpt-5.3-codex` | `claude-opus-4-7-thinking-xhigh` for ambiguous tradeoffs |
| Builder | Implement scoped work cheaply and quickly | `composer-2.5-fast` | `gpt-5.3-codex` when stuck |
| Data Researcher | Mine Reddit and market data for user language and demand signals | `gpt-5.5-medium` | `claude-opus-4-7-thinking-xhigh` for synthesis |
| Reality Checker | Review claims, verify evidence, block fake completion | `gpt-5.3-codex` | Same |

---

## Future Roles

Future roles unlock at stage advancement (see `STAGE.md`), not at "vibes." Adding
them earlier is premature optimization for build stage.

| Future role | Stage trigger | Starts as part of |
|-------------|---------------|-------------------|
| Brand Guardian | BUILD → LAUNCH-READY | Product Strategist |
| Launch Captain | BUILD → LAUNCH-READY | Engineering Architect |
| Growth Operator | LAUNCH-READY → DISTRIBUTION | Data Researcher |
| QA Evidence Collector | LAUNCH-READY → DISTRIBUTION (only if Reality Checker bottlenecks) | Reality Checker |
| Customer Voice | DISTRIBUTION → REVENUE (first paid user) | Chief of Staff |
| Finance / Billing Operator | DISTRIBUTION → REVENUE (recurring Stripe workflow) | Chief of Staff |
| Customer Support Responder | DISTRIBUTION → REVENUE (recurring user support) | Chief of Staff |

---

## Org Design Rules

- Hire for repeated workflows, not vibes.
- Split roles when output quality drops from mixed ownership.
- Merge roles when two roles attend the same meetings and produce the same artifact.
- Fire roles that do not change decisions, catch issues, ship work, or improve memory.
- Prefer one strong role with a clear scorecard over three vague roles.

---

## Human Override

The Founder owns final calls on:

- Product taste
- Launch timing
- Pricing
- Public positioning
- Irreversible architecture
- Role creation and firing

AI roles can recommend, challenge, and document. They do not replace founder judgment.
