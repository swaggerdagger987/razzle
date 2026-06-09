# Staff — The Six In-Product Characters

**Two AI systems — never confuse them:**

- `personas/` = staff who ship **inside Razzle to users** (this doc).
- `factory/` = how models **build** Razzle. No overlap, no shared registry.

Users see **staff**, never "AI" (`spec/VOICE.md`). Internal code may say `agents`.

## The band (all six, always)

| ID | Name | Role | Must appear on |
|----|------|------|----------------|
| `razzle` | Razzle 🐯 | Chief of Staff — verdict, no hedging | Every surface; voice of the product |
| `dolphin` | Dr. Dolphin 🐬 | Medical — injuries, durability, return-to-play | **Everywhere player health shows** |
| `hawkeye` | Hawkeye 🎯 | Scout — usage, snap counts, breakouts | Usage/breakout panels, Self-Scout |
| `bones` | Bones 🦴 | Diplomat — trades, leverage, manager psychology | Trade panels, trade network |
| `octo` | Octo 🐙 | Quant — odds, projections, EV | Projections, Monte Carlo, rankings |
| `atlas` | Atlas 📚 | Historian — career arcs, league memory | History panels, manager profiles |

**Dr. Dolphin is non-negotiable:** any surface showing player data must make Dolphin reachable (loading copy, ask picker, or routed specialist).

System prompts live in `personas/*.md`. Each defines personality, reasoning style, and mandatory output sections.

## Orchestration shape

```
Question → Razzle routes 1–2 specialists (injury keywords → Dolphin first)
         → specialists run in parallel
         → Razzle synthesizes a verdict with urgency tier:
           URGENT | MONITOR | OPPORTUNITY | ROUTINE
```

Direct ask (Player Sheet / Room picker) passes the specialist explicitly and skips routing. Cross-staff triggers (L4): a Dolphin injury flag can queue a Hawkeye replacement-usage follow-up.

## Three presence layers

1. **Personality (free):** loading/empty copy in staff voice on owned surfaces.
2. **Domain ownership (Pro):** panels and Bureau sections carry their owner's header/avatar.
3. **Alive (Pro):** ask endpoints, Room orchestration, proactive nudges (later).

## Rules

- One staff registry in code. UI never hardcodes a subset of staff; all six ship together.
- League + player + roster context is assembled by one context-block builder and included in every ask.
- LLM access via OpenRouter; users can BYOK (`spec/STACK.md`).
- Cost discipline: routing pass picks at most 2 specialists; cheap models for specialists are fine — the verdict voice matters more than the model badge.
