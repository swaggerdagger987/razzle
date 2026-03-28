---
id: S2-029
severity: S2
category: ux
title: About page uses anonymous first-person narrative — no founder name, photo, or social link
source: deep-audit
status: open
---

## Problem

The about page uses first-person narrative without identifying the founder. No name, photo, social media link, or team information. Paying users at $80-150/year want to know who they are paying.

## Root Cause

`frontend/about.html` — the page content is intentionally anonymous, written as a brand narrative.

## Fix

Add a brief founder section:
1. First name and Twitter/X handle
2. Photo or avatar (could be Razzle-themed)
3. Brief bio (1-2 sentences)
4. This builds trust for conversion without breaking the brand voice

## Accept When

- About page includes at minimum a founder first name and social link
- The brand voice and personality are preserved
