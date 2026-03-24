---
id: DQ-396
priority: P2
area: league-intel.html
section: pre-connect hero
type: copy / clarity
status: open
---

# Bureau "Connect Your Sleeper" heading is unclear to users who don't know what Sleeper is

## What's wrong

league-intel.html line 1972: the hero heading says "Connect Your Sleeper" with no additional context.

"Sleeper" is a fantasy football platform, but users arriving from Google, Reddit, or the home page may not know that. The heading assumes familiarity with the Sleeper brand. For non-Sleeper users, the heading reads as gibberish — "connect your sleeper" sounds like a mattress app.

## Where

- `frontend/league-intel.html` line 1972: hero heading text

## Suggested fix

Change to: "Connect Your Sleeper League"

One word ("League") adds all the context needed. Users immediately understand:
- This connects to a fantasy league
- The platform is called Sleeper
- They need a Sleeper account

## Not a dupe of

- DQ-339 (bureau whitespace) — that's about the empty space below the form, not the heading copy
- DQ-351 (mini-screener rows go to lab) — different page
