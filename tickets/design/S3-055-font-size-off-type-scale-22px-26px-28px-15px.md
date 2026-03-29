---
id: S3-055
severity: S3
confidence: MEDIUM
category: design
source: DQ-073,DQ-074,DQ-078
status: OPEN
---

# Off-type-scale font sizes: 22px (49x), 26px (41x), 28px (26x), 15px (38x)

## Root Cause

DESIGN.md type scale: 11, 12, 13, 14, 16, 18, 20, 24, 32, 36, 48px. Multiple off-scale sizes used sitewide:

- **22px** used 49 times across 40+ files (between 20 and 24)
- **26px** used 41 times across 40+ files (between 24 and 32)
- **28px** used 26 times in 12 files (between 24 and 32, hero sections)
- **15px** used 38 times in 20 files (between 14 and 16)

## Fix

- 15px → 14px or 16px (context-dependent)
- 22px → 20px or 24px
- 26px → 24px or 32px
- 28px → 24px or 32px

## Files

- Sitewide — lab-panels.css (highest concentration), standalone HTML pages, pricing.html

## Acceptance Criteria

- All font sizes use the documented type scale values
- No visual regression on key pages (pricing, home, lab)
