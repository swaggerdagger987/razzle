# Ticket 019 — CEO P0 Queue Priority Enforcement

**ID**: 20260321-140001-019
**Page**: Process
**Type**: process
**Severity**: P0
**Created**: 2026-03-21

## Problem

The ship loop's TICKETS.md queue contains agent connective tissue work (agent-config.js, loading states, avatar icons, 404 page). Meanwhile, 4 P0 tickets from CEO Review #1 are unexecuted:

- 001: Hero leads with ChatGPT comparison instead of Screener value prop
- 002: Replace static screener mockup with live interactive mini-screener
- 003: Landing page section order doesn't follow conversion funnel
- 007: Bureau is dead end for non-Sleeper users, needs demo mode

## BEFORE

Ship loop executes agent personality layers. Landing page still positions Razzle as a ChatGPT competitor. Bureau still shows a brick wall to non-Sleeper users. These are the pages strangers see FIRST.

## AFTER

TICKETS.md queue reordered: CEO P0 tickets (001, 002, 003, 007) execute first. Agent personality work moves to after P0s. The landing page and Bureau are fixed before any user ever sees a loading state.

## Why This Matters

A stranger bounces from the landing page in 5 seconds. They never reach a loading state. Fixing loading state personality before fixing the landing page is polishing the hallway while the front door is broken.

## Accept When

TICKETS.md top-of-queue contains CEO P0 tickets 001-003 and 007. Agent personality phases are moved below them.
