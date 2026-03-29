# Ticket 025 — Email Capture for Non-Registering Visitors

**ID**: 20260321-140007-025
**Page**: Landing / Lab
**Type**: structural
**Severity**: P1
**Created**: 2026-03-21

## Problem

The roadmap targets 5,000 registered users by Week 1 (September 2026). Currently, the only way to capture contact info is full account registration (email + password).

Visitors who are interested but not ready to register have no lightweight engagement path. They leave with no way to bring them back.

## BEFORE

Only full registration captures contact info. No email capture for casual visitors. No re-engagement mechanism for bounced traffic.

## AFTER

Lightweight email capture in two locations:

**1. Landing page** (below the screener visual):
- "Get weekly stat drops from Razzle" — email input + "Subscribe" button
- Single field. No password. No account creation.
- Stores email in backend (new `email_subscribers` table)
- Confirmation: "You're in. First drop arrives next Tuesday."

**2. Lab footer** (below the screener table):
- Smaller inline version: "Weekly insights → [email] [Go]"
- Same backend, same confirmation

Content delivered: Weekly email with 3-4 Lab screenshots (breakout candidates, trade value movers, usage risers). Each email links back to razzle.lol with the specific panel pre-loaded. The email IS the content marketing.

## Why This Matters

Fantasy football has strong seasonality. A visitor who arrives in March and doesn't register is gone forever — unless you have their email. The weekly stat drop keeps Razzle in their inbox until draft season, when conversion intent peaks.

## Accept When

Email input on landing page and Lab footer. Submission stores email in backend. No account required. Duplicate emails handled gracefully.
