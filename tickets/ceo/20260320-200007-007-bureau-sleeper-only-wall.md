---
id: 20260320-200007-007
severity: P0
confidence: HIGH
flow: ceo-review
flow_name: CEO Review — Bureau
found_by: Razzle (CEO)
date: 2026-03-20
status: TODO
type: structural
---

## The Bureau is a dead end for non-Sleeper users -- no fallback experience

**PRIORITY: P0** | **Type: structural**
**Page**: league-intel.html
**Found by**: Razzle (CEO Review)

The Bureau page opens with "Connect Your Sleeper" and that's it. If you don't use Sleeper, the entire page is a brick wall. ESPN/Yahoo are listed as "Coming soon" with no timeline. This means every fantasy manager who uses ESPN, Yahoo, Fleaflicker, or any non-Sleeper platform sees a page that tells them "this product isn't for you yet."

That's a conversion killer. A significant portion of dynasty managers use ESPN or Yahoo. Sending them to a blank page with a "coming soon" label is worse than not having the page at all -- it damages trust.

**BEFORE** (what it is now):
- "Connect Your Sleeper" input is the only onramp
- ESPN/Yahoo shows "Coming soon" with no timeline or email capture
- Non-Sleeper users see nothing and bounce

**AFTER** (what it should be):
- Keep the Sleeper connection flow exactly as-is (it works well)
- For ESPN/Yahoo: add an email capture form: "Drop your email. We'll ping you when ESPN/Yahoo support launches." Store emails for launch notification.
- Below the connection form: add a DEMO MODE button: "See what the Bureau looks like with a sample league." Load a pre-built demo league (fabricated but realistic -- 12 teams, full rosters, 3 seasons of history) that showcases manager profiles, pressure map, trade finder, and all Bureau features
- Demo mode lets non-Sleeper users experience the Bureau's value without connecting anything. This turns a dead end into a demo funnel.
- Clear label on demo mode: "This is sample data. Connect your Sleeper league to see YOUR league."

**WHY**: The Bureau is the conversion engine. It's where "cool free tool" becomes "I need this." But right now, only Sleeper users can experience it. Demo mode lets EVERY visitor feel what league-contextualized intelligence is like -- ESPN users, Yahoo users, people who are just browsing. It also reduces the friction of "I have to enter my Sleeper username before I see anything" -- some users want to see the product first. Demo mode is the try-before-you-buy for the Bureau.

### Task 1: Add email capture for ESPN/Yahoo waitlist
**Accept when**: Non-Sleeper users can enter their email to be notified when ESPN/Yahoo support launches. Emails are stored (backend endpoint or third-party form).

### Task 2: Build Bureau demo mode with sample league data
**Accept when**: A "See Demo" button loads the Bureau with pre-built sample league data, showcasing all key features. Clear labeling distinguishes demo from real data.
