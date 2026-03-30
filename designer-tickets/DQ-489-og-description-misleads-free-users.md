---
id: DQ-489
title: OG meta description says "AI agents with full league context" — misleading for free tier
severity: P3
category: content-accuracy
file: frontend/index.html
lines: 8, 20
---

## Problem

The OG description meta tag says:
> "Free fantasy football research lab. 100+ stat columns, custom formulas, AI agents with full league context."

"AI agents with full league context" is a Pro/Elite feature. Free users get 5 generic queries/day with no league context. When this description appears in social shares, link previews, or Google results, it sets expectations the free tier can't deliver.

## Expected

Reword to clarify the AI agents are a premium feature, or describe what free users actually get:
> "Free fantasy football research lab. 100+ stat columns, custom formulas, and AI-powered analysis tools."

## Acceptance Criteria

- OG description does not promise league context to users who haven't paid
- Description still mentions AI as a differentiator
