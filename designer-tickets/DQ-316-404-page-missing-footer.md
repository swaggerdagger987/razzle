---
id: DQ-316
title: 404 page has nav but no footer — inconsistent with all other pages
priority: P2
category: navigation-consistency
page: 404.html
---

## Problem
Every page on the site has a footer with sitemap links (Home, Lab, Bureau, Situation Room, Pricing, About). The 404 page (frontend/404.html) has the topnav but no footer.

A user who hits a dead link sees the 404 tiger animation but has no footer navigation to recover. They can only use the topnav. Every other page gives them both. Inconsistent.

## Expected
Add the standard site footer to 404.html, matching the footer structure on index.html and other pages.

## Fix
- `frontend/404.html`: add the standard footer HTML before closing </body>

## Files
- `frontend/404.html`
