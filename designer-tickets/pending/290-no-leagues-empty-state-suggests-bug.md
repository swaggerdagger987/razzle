---
id: DES-290
title: "No leagues this season" empty state implies a bug, not expected behavior
severity: P2
category: UX/Copy
page: league-intel.html
---

## What's Wrong

When a Sleeper user has no leagues for the current season, the message is:

> "looks like you're not in any leagues this season. check your Sleeper username or explore the free Screener while we figure this out."

The phrase **"while we figure this out"** implies Razzle is broken — that there's a bug being investigated. But this is a normal, expected state (user hasn't joined a league yet this season, or the new season hasn't started).

## Where

- `frontend/league-intel.html` line 2208

## Fix

Replace with copy that treats this as expected:

> "no leagues found for this season. you might not have joined one yet — or the new season hasn't kicked off. explore the Screener while you wait, or try a different username."

Add actionable buttons:
- "Open the Screener" (primary CTA)
- "Try Demo League" (secondary — the demo button exists at line 1993)
- "Try a different username" (link back to connect form)

## Evidence

Line 2208: `"looks like you're not in any leagues this season. check your Sleeper username or explore the <a href="/lab.html" style="color:var(--orange);">free Screener</a> while we figure this out."`

The inline `<a>` link is also hard to spot — no button styling, just colored text inside a paragraph.
