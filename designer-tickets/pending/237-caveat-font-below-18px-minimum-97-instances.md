# DES-237: Caveat (--font-hand) used below 18px minimum — 97 instances across 44 files

**Priority:** P2 — design system governance
**Page:** sitewide (44 files)
**Cycle:** 23

## Problem

DESIGN.md type scale specifies two Caveat sizes:
- 24px / 600 weight — handwritten annotations
- 18px / 500 weight — card scribbles, smaller notes

The codebase uses Caveat at 14px (74 instances across 34 files), 13px (15 instances across 8 files), and 12px (8 instances across 5 files). Total: 97 instances below the 18px minimum.

At 12-14px, Caveat loses its handwritten character — it's too small to read as personality. It looks like a rendering bug, not a design choice.

**Heaviest offenders:**
- league-intel.html: 26 instances (12-14px) — loading states, annotations, "you" labels, Bureau copy
- index.html: 2 instances at 14px — mini-screener note, social proof annotation
- lab.html: 3 instances at 13-15px — panel agent attribution, formula builder notes
- 20+ standalone panel pages: watermark at 14px (these are fixed-position corner watermarks)

**Watermark exception:** The fixed-position "razzle.lol" watermark at 14px appears on 20+ pages. These are intentionally small and could be exempted from this ticket. Focus on content annotations.

## Fix

Audit each instance. For content annotations, raise to 18px minimum. For watermarks, consider exempting or raising to 16px.

## Why this matters

The handwritten personality layer is Razzle's brand differentiator — "a Sunday comics page that runs a research lab." At 12-14px, Caveat text is barely distinguishable from body text and loses the handwritten feel. The personality leaks through the seams only if users can actually read it.
