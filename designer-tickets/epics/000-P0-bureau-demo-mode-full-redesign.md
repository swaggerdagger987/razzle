---
id: 000-P0
page: league-intel.html
panel: entire-page
type: broken-panel
severity: P0
---

## Bureau of Intelligence needs a full demo mode with tabs — connect Sleeper at the bottom

**Page**: league-intel.html
**This is the #1 conversion driver. It is currently broken. Fix it completely.**

### The Design

The Bureau should load with a DEMO LEAGUE showing ALL features working. The user sees the full product with sample data BEFORE connecting their own league. Sleeper connection is at the BOTTOM — not the top, not a gate, not a wall.

### Page Structure (top to bottom)

**Hero section:**
- Title: "Bureau of Intelligence" in Luckiest Guy
- Subtitle in Caveat: "your league, analyzed by six agents who never stop watching."
- NO Sleeper input here. The demo IS the pitch.

**Tab bar** (horizontal, sticky below nav):
- Overview (default)
- Self-Scout
- Rivals
- Trades
- Power Rankings
- Schedule

Each tab shows a FULL working view with demo data. Not a teaser. Not blurred. Not "connect to see." REAL data from a sample 12-team dynasty league.

**Tab: Overview**
- Razzle's executive summary card: "Here's your league at a glance."
- Monte Carlo odds grid: 12 managers, each with championship % and playoff %
- Top 3 storylines (agent-attributed): "Hawkeye: Manager 3's RB room is trending up." "Bones: Manager 7 is desperate — 3 losses in a row." "Atlas: Manager 1 always sells low in March."
- This is the screenshot moment. This is what gets shared in group chats.

**Tab: Self-Scout**
- One manager's full roster analysis
- Starter quality by position (A/B/C/D grades)
- Depth score (0-100)
- Build profile (Hero RB / Zero RB / Stars & Scrubs etc.)
- Vulnerability flags ("One injury at RB and you're starting a waiver wire player")
- Hawkeye's usage trend arrows on each starter

**Tab: Rivals**
- Manager profile cards for all 12 managers
- Behavioral archetype badges (Panic Seller, Hoarder, Trade Addict, etc.)
- Trade tendency: who they trade with, what positions they target
- Atlas's historical pattern: "This manager sold low after losses 3 times last season"
- Pressure Map: desperation score 0-100 per manager

**Tab: Trades**
- Trade Finder: value-matched suggestions between managers
- Trade Network: who trades with whom (visual or table)
- Bones's verdict on each suggested trade
- Recent trade history

**Tab: Power Rankings**
- Composite rankings beyond W-L
- Roster strength, depth, activity, schedule difficulty
- Octo's math behind each ranking

**Tab: Schedule**
- Remaining matchup difficulty per manager
- Easy/hard stretches highlighted
- Playoff path preview

**Below all tabs — Sleeper connection section:**
- Clean card with sand background, chunky border
- "See this for YOUR league"
- Sleeper username input
- "Connect" button (terracotta, chunky)
- "Coming soon: ESPN, Yahoo" with email capture below
- Small Caveat note: "We only read your league data. We never post or modify anything."

### Sample Demo Data

Create a realistic 12-team dynasty league with:
- 12 managers with fun names ("The Commissioner", "Taco of the League", "Trade Addict Steve")
- Real player names on rosters (from the database — pick top 200 players, distribute them)
- Realistic standings (some 4-1, some 1-4, some 2-3)
- Behavioral profiles assigned (2 Panic Sellers, 1 Hoarder, 3 Trade Addicts, 2 Steady Hands, 2 Waiver Hawks, 1 Draft Creature, 1 Ghost)
- Monte Carlo odds that make sense (frontrunner at 25%, cellar at 2%)
- 5-10 historical trades to power the trade network

This demo data can be hardcoded JSON in the frontend — it doesn't need to hit the API. It's a showcase, not a live query.

### Agent Presence on Every Tab

Each tab has agent attribution:
- Overview: Razzle (executive summary)
- Self-Scout: Hawkeye (usage trends) + Dr. Dolphin (health grades)
- Rivals: Atlas (behavioral history) + Bones (trade patterns)
- Trades: Bones (trade finder) + Octo (value math)
- Power Rankings: Octo (composite math)
- Schedule: Octo (difficulty scoring)

Agent avatar icons (20px) next to section headers. Loading states use agent copy from agent-config.js.

### Design Rules

- Sand background, card-based layout
- 3px borders, 4px offset shadows on cards
- Luckiest Guy for tab names and section headers
- Space Mono for ALL data (numbers, names, stats)
- Caveat for agent annotations and personality text
- Position colors: QB blue, RB teal, WR terracotta, TE purple
- Dark mode must work (espresso flip)
- Mobile responsive (tabs stack or scroll horizontally)

### Accept When

1. league-intel.html loads WITHOUT any Sleeper connection and shows the full demo
2. All 6 tabs work and show demo data
3. Monte Carlo odds render with percentages
4. Behavioral profiles show on Rivals tab
5. Trade suggestions appear on Trades tab
6. Agent attribution visible on every tab
7. Sleeper connection input is at the BOTTOM of the page
8. After connecting Sleeper, demo data is replaced with real league data
9. Works in both light and dark mode
10. Works on mobile (test at 480px width)
