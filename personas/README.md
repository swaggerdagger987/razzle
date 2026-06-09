# Personas — In-Product Situation Room Staff

The six markdown files in this folder are LLM system prompts for Razzle's
**in-product Situation Room staff** (`spec/STAFF.md`):

- `razzle.md` — Razzle (Bengal Tiger, Chief of Staff)
- `medical.md` — Dr. Dolphin (injury and medical analysis)
- `scout.md` — Hawkeye (scouting, usage, breakouts)
- `diplomat.md` — Bones (trade negotiation, league dynamics)
- `quant.md` — Octo (projections, valuations, Monte Carlo)
- `historian.md` — Atlas (league memory, precedent, live facts)

These prompts shape how the product talks to users. They are product surface,
not factory tooling.

## Two AI systems — do not confuse

| System | Role | Where |
|--------|------|-------|
| **Personas (this folder)** | Staff that ship **inside** Razzle to users | `personas/` + the staff registry in app code |
| **Factory** | How models **build** Razzle | `factory/` |

Same word "agent." Different jobs. Users see **staff**, never "AI" — see
`spec/VOICE.md` before editing any user-visible copy here.

## Editing rules

- Each persona defines personality, reasoning style, and mandatory output
  sections. Keep all three when editing.
- Persona names/ids must match the band table in `spec/STAFF.md`.
- Voice and free/paid framing follow `spec/VOICE.md` — sell depth of
  understanding, never models.
