---
id: S2-037
severity: S2
category: frontend
title: Several standalone pages have similar meta descriptions — reduces SEO value
source: deep-audit
status: open
---

## Problem

Multiple standalone pages have similar meta descriptions focused on generic "razzle.lol" branding rather than page-specific content. Pages with duplicate/similar descriptions compete with each other in search results and reduce SEO effectiveness.

## Root Cause

Investigation found that most descriptions ARE unique and page-specific (e.g., aging curves, archetypes, air yards each have distinct descriptions). However, some pages may share similar phrasing patterns. The issue is less severe than originally reported.

One specific problem: `frontend/records.html:21` meta description says "since 2020" but the backend query (`backend/live_data/tools.py:1182`) actually queries all seasons with no year filter — the description is misleading.

## Fix

1. Audit all `<meta name="description">` tags across the 75 HTML files
2. Write unique, keyword-rich descriptions for each page (120-160 chars)
3. Include the specific tool name and primary value proposition in each description
4. Example: `<meta name="description" content="Dynasty trade value chart — composite player values, 8 tiers, position breakdowns. Free at razzle.lol">`

## Accept When

- Every page has a unique meta description
- No two pages share the same description text
- Each description includes the page-specific tool name and 1-2 keywords
