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

Many pages in `frontend/` have meta descriptions that are variations of "Free fantasy football analytics at razzle.lol" without page-specific keywords. These were likely generated from a template.

## Fix

1. Audit all `<meta name="description">` tags across the 75 HTML files
2. Write unique, keyword-rich descriptions for each page (120-160 chars)
3. Include the specific tool name and primary value proposition in each description
4. Example: `<meta name="description" content="Dynasty trade value chart — composite player values, 8 tiers, position breakdowns. Free at razzle.lol">`

## Accept When

- Every page has a unique meta description
- No two pages share the same description text
- Each description includes the page-specific tool name and 1-2 keywords
