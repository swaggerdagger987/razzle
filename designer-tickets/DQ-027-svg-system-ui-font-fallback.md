# DQ-027: research-sprawl.svg uses system-ui font fallback

**Priority**: P3 — Single file, low visual impact
**Category**: Typography
**Severity**: LOW — Violates 3-font rule but only affects one SVG

## Problem

`frontend/assets/research-sprawl.svg` line 1 sets a root-level `font-family="system-ui, -apple-system, sans-serif"` — none of which are approved Razzle fonts.

```xml
<svg xmlns="..." viewBox="..." font-family="system-ui, -apple-system, sans-serif">
```

Design guide only allows: Luckiest Guy, Space Mono, Caveat.

## Fix

Remove the root attribute (text elements inside declare fonts explicitly) or set to Space Mono:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 520">
```
