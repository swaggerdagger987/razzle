# Model Routing — Expensive Judgment, Cheap Throughput

The factory's economics: **frontier models decide, cheap models build.** This contract is harness-agnostic — Claude Code sessions, CI-triggered runs, or any future loop runner must honor it. No runner code ships in this repo.

## Frontier model (Opus-class) — judgment

Required for:

- Writing or changing anything in `spec/` or `factory/` (including gate definitions and this file).
- Slice planning: creating cards, reordering BACKLOG, splitting oversized cards, KILL calls.
- Taste review: T6 screenshot-gravity judgments, design-language calls, persona voice.
- Architecture: anything that would touch `spec/STACK.md`, add a dependency, or change the schema's shape beyond the active slice's stated scope.
- Reviewing a cheap-model slice before merge when the slice shipped a user-facing surface.

## Cheap model (Haiku/Sonnet-class) — throughput

Appropriate for:

- Executing an ACTIVE slice whose card has a complete scope fence and concrete G5 assertions.
- Mechanical ports, test writing against a stated contract, adapter implementations against `spec/DATA.md`.
- Gate-failure fix loops where the failure is local (failing test, lint, type error).

## The escalation rule

A cheap-model session that hits a decision **not answerable from `spec/`** does not guess. It writes the question on the slice card, marks it BLOCKED, finishes what is safely in scope, and ends clean. A frontier session (or the Founder) answers on the card, flips it back to OPEN, and the next cheap session proceeds.

Signals you must escalate: the fix wants a new dependency · two specs appear to conflict · the slice needs a product call the card didn't make · the gate itself seems wrong.

## Founder-only

- Posting anywhere public under the Founder's identity (Reddit, social).
- Pricing changes, billing live-mode, deleting data.
- Overriding a VETO condition from `spec/NORTH_STAR.md`.

## Cadence (suggested, not enforced by tooling)

One frontier planning pass keeps BACKLOG ordered and answers BLOCKED cards; cheap sessions burn down the top of BACKLOG one slice at a time; a frontier review pass audits shipped surfaces against T1–T7 every few slices. State lives in `factory/STATE.md` — any harness that reads it, honors the slice contract, and routes by this file can drive the factory.
