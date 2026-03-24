# DQ-470: lab.html Embedded Styles — 7 Instances of transition:all (DES-178 Scope Gap)

**Priority**: P3
**Category**: Performance / Design Token
**Affects**: frontend/lab.html

## Problem

DES-178 (pending) covers `transition: all` in styles.css (8 selectors). But lab.html has its own embedded `<style>` block with **7 additional instances** of `transition: all` that aren't covered.

`transition: all` animates every CSS property on change (including layout properties like width, height, padding), triggering unnecessary repaints. Should specify exact properties.

## Violations

Lines ~224, ~315, ~396, ~871, ~1761, ~1785, ~2569 in lab.html `<style>` block.

## Fix

Replace each `transition: all` with specific properties:
- For hover effects: `transition: transform 0.15s, box-shadow 0.15s`
- For color changes: `transition: background-color 0.15s, color 0.15s`
- For opacity: `transition: opacity 0.15s`

## Acceptance

Grep `transition:\s*all` in lab.html returns 0 matches.
