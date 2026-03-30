---
id: DES-310
title: Agents.html pricing cards omit "7-day free trial" from feature lists
priority: P1
page: agents.html
category: Conversion / Copy
cycle: 28
---

## Problem

The Situation Room pricing cards (agents.html:1923-1948) don't include "7-day free trial" as a feature list item on either Pro or Elite cards. The trial is only mentioned in a small note below the cards (line 1956).

Compare with other conversion surfaces:
- **Home page Pro card** (index.html:820): `<li class="highlight">7-day free trial</li>` ✅
- **Pricing page Pro card** (pricing.html:289): `7-day free trial` ✅
- **Pricing page Elite card** (pricing.html:312): `7-day free trial` ✅
- **Agents page Pro card**: missing ❌
- **Agents page Elite card**: missing ❌

The Situation Room is where users experience the AI agents — the premium product. If they're impressed and look at pricing, the trial incentive should be as prominent as on other pages.

## Where

- `frontend/agents.html` lines 1923-1928: Pro card `<ul>` — no trial item
- `frontend/agents.html` lines 1943-1948: Elite card `<ul>` — no trial item

## Fix

Add `<li style="color:var(--orange); font-weight:700;">7-day free trial</li>` to both Pro and Elite card lists, matching the home page pattern.

## Evidence

- index.html:820 has trial as highlighted li ✅
- pricing.html:289, 312 both have trial ✅
- agents.html:1923-1948 — neither card has trial ❌
