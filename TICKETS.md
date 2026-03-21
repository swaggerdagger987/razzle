# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## IMPORTANT: DO NOT re-upload terminal.db

The database file `data/terminal.db` uses WAL journal mode locally. Uploading it directly to GitHub releases produces a corrupt file because the WAL journal data is not included. **Never run `gh release upload` with `data/terminal.db`**. The clean version (`data/terminal_clean.db`, created with `VACUUM INTO`) is the only file that should be uploaded. A human handles DB uploads manually.

---

## DESIGN REFERENCE

All tickets below implement the Agent Connective Tissue design. Full design doc: `docs/plans/2026-03-20-agent-connective-tissue-design.md`. Read it before starting any ticket.

---

## Phase: Agent Presence — Layer 1 Foundation (Personality Layer, Free Tier)

**Context**: The 6 Situation Room agents (Razzle, Dr. Dolphin, Hawkeye, Bones, Octo, Atlas) need to become the voice of the entire site, not just the Situation Room. This phase adds the subtle personality layer that all users experience — loading states, empty states, margin notes, and tiny agent avatars. Users shouldn't realize these are "AI agents" — they should just feel like the site has personality.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "Layer 1: Personality (Free)"

**Exit criterion**: Every loading state, empty state, and error state across Lab, Bureau, and Situation Room uses agent-voiced copy. Subtle 16px agent avatar icons appear next to columns and panel headers in each agent's domain. 404 page uses Razzle's voice.

### Task 1: Define agent avatar icon set

**Accept when**: Six 16px avatar icons exist in `frontend/assets/agents/` — one per agent (razzle.svg, dolphin.svg, hawkeye.svg, bones.svg, octo.svg, atlas.svg). Simple, recognizable silhouettes that read at 16px. Colors match agent definitions: Razzle=#d97757, Dolphin=#5b7fff, Hawkeye=#2ec4b6, Bones=#8b5cf6, Octo=#e87422, Atlas=#d44040. SVG format for crisp rendering at any size. Also create 20px versions for panel headers.

### Task 2: Create agent territory config

**Accept when**: A new file `frontend/agent-config.js` exports an `AGENT_TERRITORY` object mapping each agent to their owned columns and panels. Structure:
```js
const AGENT_TERRITORY = {
  dolphin: {
    columns: ['injury_status', 'games_missed', 'durability_score', 'workload_flag'],
    panels: ['injury-report', 'durability', 'workload-sustainability'],
    loading: ['checking the injury wire...', 'reviewing practice reports...'],
    empty: ['Clean bill of health. For now.', 'No injuries to report. Enjoy it.'],
    color: '#5b7fff'
  },
  hawkeye: {
    columns: ['target_share', 'snap_pct', 'route_participation', 'wopr', 'usage_trend'],
    panels: ['breakout-finder', 'waiver-wire', 'usage-trends', 'rostership'],
    loading: ['scanning the tape...', 'reviewing snap counts...'],
    empty: ['Nothing worth your time right now.', 'No signal. All noise.'],
    color: '#2ec4b6'
  },
  bones: {
    columns: ['trade_value', 'buy_sell', 'contract_value'],
    panels: ['trade-values', 'buy-low-sell-high', 'trade-finder'],
    loading: ['reading the room...', 'checking the market...'],
    empty: ["Market's quiet. Check back Wednesday.", 'No deals worth making right now.'],
    color: '#8b5cf6'
  },
  octo: {
    columns: ['projection', 'floor', 'ceiling', 'ppg', 'efficiency', 'composite_score'],
    panels: ['monte-carlo', 'projections', 'efficiency', 'aging-curves'],
    loading: ['running the numbers...', 'calculating confidence intervals...'],
    empty: ['Insufficient data. Octo needs more.', 'Not enough sample. Check back later.'],
    color: '#e87422'
  },
  atlas: {
    columns: ['career_stats', 'yoy_delta', 'player_comp'],
    panels: ['career-trajectories', 'historical-comps', 'season-recaps', 'game-logs'],
    loading: ['pulling the archives...', 'searching the record books...'],
    empty: ["No precedent found. That's rare.", 'The archives are empty here.'],
    color: '#d44040'
  },
  razzle: {
    columns: [],
    panels: [],
    loading: ['pulling film...', 'getting the board ready...'],
    empty: ['The film room is empty. Add some players.', 'Nothing here yet. Start exploring.'],
    color: '#d97757'
  }
};
```
This config is the single source of truth for where agents appear. The autoresearch engine will update this file over time.

### Task 3: Agent-voiced loading states across the Lab

**Accept when**: Every loading state in lab.html, lab.js, and lab-panels.js uses agent-specific copy from `AGENT_TERRITORY`. When a panel owned by Dr. Dolphin loads, it shows "checking the injury wire..." in Caveat font. When the main screener loads, it shows Razzle's "pulling film..." General/unowned panels use Razzle's loading copy as fallback. Loading states rotate through the agent's loading array on each load. All loading text uses `font-family: var(--font-hand)` (Caveat).

### Task 4: Agent-voiced empty states across the Lab

**Accept when**: Every empty/no-results state in the Lab uses agent-specific copy from `AGENT_TERRITORY`. When a breakout finder panel returns no results, it shows Hawkeye's "Nothing worth your time right now." When the screener has no matching players, it shows Razzle's "The film room is empty. Add some players." All empty state text uses Caveat font. Fallback to Razzle for unowned panels.

### Task 5: Agent avatar icons on Lab column headers

**Accept when**: Columns in the screener that belong to an agent show that agent's 16px avatar icon in the column header tooltip (on hover). NOT in the column header itself (too noisy) — in the tooltip that appears on hover. Tooltip text: "{Agent Name} — {Agent Role}" (e.g., "Dr. Dolphin — Medical Analyst"). Uses the SVG icons from Task 1. Only columns listed in `AGENT_TERRITORY.{agent}.columns` get icons.

### Task 6: Agent avatar icons on Lab panel headers

**Accept when**: Lab panels owned by an agent show that agent's 20px avatar icon in the panel subtitle/attribution line. Format: small icon + "Dr. Dolphin" in `font-family: var(--font-hand)`, `font-size: 13px`, `opacity: 0.6`. Positioned below the panel title, above the panel content. Subtle — should feel like a signature, not a label. Only panels listed in `AGENT_TERRITORY.{agent}.panels` get attribution.

### Task 7: Razzle-voiced 404 page

**Accept when**: `frontend/404.html` exists with a Razzle-personality 404 page. Headline in Luckiest Guy: "wrong film room." Body in Caveat: "Razzle checked everywhere. This page doesn't exist — or it was traded to another site." CTA button back to the Lab. Uses Razzle design language (sand background, chunky borders, terracotta accent). Razzle's tiger avatar displayed.

### Task 8: Agent-voiced error states

**Accept when**: All API error states across Lab and Bureau show agent-personality error messages instead of generic "Something went wrong." Examples: Razzle: "Film's not loading. Try again." / Octo: "The math broke. Refreshing might help." / Generic fallback: "Something's off. Razzle's looking into it." Error messages use Caveat font. Each agent's error only appears on their owned panels — Razzle is the fallback for everything else.

---

## Phase: Agent Presence — Layer 1 Bureau Extension

**Context**: Extend agent personality layer to the Bureau of Intelligence. Same subtle approach as the Lab — loading states, empty states, agent attribution on Bureau sections.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Bureau territory map

**Exit criterion**: Bureau pages use agent-voiced loading/empty states. Bureau sections show agent attribution. Agent territory config updated for Bureau sections.

### Task 1: Extend agent-config.js with Bureau territory

**Accept when**: `AGENT_TERRITORY` in `agent-config.js` adds a `bureau` key to each agent:
- Razzle: `bureau: ['overview', 'executive-summary']`
- Dr. Dolphin: `bureau: ['roster-depth-health']`
- Hawkeye: `bureau: ['self-scout-usage', 'roster-depth-trends']`
- Bones: `bureau: ['trade-finder', 'trade-network', 'pressure-map', 'manager-profiles']`
- Octo: `bureau: ['monte-carlo', 'power-rankings', 'strength-of-schedule']`
- Atlas: `bureau: ['manager-profiles-history', 'transaction-history', 'build-profiles']`

### Task 2: Agent-voiced loading/empty states in Bureau

**Accept when**: All Bureau loading and empty states use agent-specific copy, same pattern as Lab. Bureau overview loading: Razzle's "getting the board ready..." Monte Carlo loading: Octo's "running the numbers..." Trade finder empty: Bones' "Market's quiet. Check back Wednesday." Caveat font throughout.

### Task 3: Agent attribution on Bureau sections

**Accept when**: Each Bureau section that belongs to an agent shows subtle attribution — same 20px icon + name in Caveat font pattern from Lab panels. Razzle's overview card shows "Razzle — Chief of Staff" attribution. Trade finder shows "Bones — Diplomat." Monte Carlo shows "Octo — Quant." Subtle, signature-style, not a label.

---

## Phase: Agent Presence — Layer 2 Domain Ownership (Pro Tier)

**Context**: For Pro users, agents become more visible. Panel groups in the Lab sidebar get agent attribution. Agent-voiced contextual one-liners appear at the top of panels. The locked Situation Room shows pixel agents walking around with a demo briefing peekable.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "Layer 2: Domain Ownership (Pro)"

**Exit criterion**: Pro users see agent names next to panel groups in sidebar, contextual one-liners on panels they own, and can peek into the locked Situation Room.

### Task 1: Agent-attributed sidebar panel groups

**Accept when**: In the Lab sidebar, panels owned by each agent are grouped with a small agent icon (16px) and agent name next to the group header. Example: the breakout finder, waiver wire, usage trends panels have a small Hawkeye icon and "Hawkeye" label next to their group. This is tier-gated — only visible to Pro+ users. Free users see the current sidebar without agent names. Implementation: check user tier in JS, if Pro+, inject agent attribution into sidebar group headers using `AGENT_TERRITORY` config.

### Task 2: Contextual one-liner insights on panels

**Accept when**: Pro+ panels show a one-liner insight at the top of the panel content area, written in the owning agent's voice. These are STATIC copy (not AI-generated) — smart contextual observations. Examples:
- Breakout finder (Hawkeye): "3 names here weren't on this list 2 weeks ago."
- Trade values (Bones): "Trade market heats up after bye weeks."
- Aging curves (Octo): "Players above the curve are beating the model."
- Career trajectories (Atlas): "History doesn't repeat, but it rhymes."
- Injury report (Dolphin): "Soft tissue injuries have a 40% recurrence rate within 8 weeks."
Styled in Caveat font, `opacity: 0.7`, below panel title but above content. One line max. Stored in `AGENT_TERRITORY` as `one_liners` array per agent. Rotate on each panel load.

### Task 3: Situation Room peek for non-Elite users

**Accept when**: Users who visit `agents.html` without Elite access see:
1. The pixel canvas with agents walking around (animation runs, agents move between stations)
2. A frosted glass / blur overlay on the bottom half (scenario input, briefing output)
3. A demo briefing card visible (the existing demo from warroom.js) — shows what agent output looks like
4. A clear CTA: "Upgrade to Elite to talk to your agents" with pricing link
5. Agent bio cards still visible (the 6 small cards showing name, role, avatar)
The user can WATCH the agents but not INTERACT. They see the band performing but can't join the conversation.

---

## Phase: Agent Presence — Layer 3 Alive (Elite Tier)

**Context**: For Elite users, agents are alive — proactive nudges across Lab and Bureau that link products together. Small, dismissible, never spammy. One line max, one per page, rotate on refresh.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "Layer 3: Alive (Elite)" and "Stitching Patterns"

**Exit criterion**: Elite users see contextual agent nudges on Lab and Bureau pages. Nudges link between products. Hard caps enforced (1 per page, 5 per session).

### Task 1: Nudge rendering system

**Accept when**: A new `frontend/agent-nudges.js` module provides a `renderAgentNudge(containerId, nudge)` function that renders a small, dismissible pill-style callout. Structure:
- 16px agent avatar + agent name + one-line message + "→" link + dismiss X
- Styled: thin border in agent color, sand background, Caveat font for message, Space Mono for agent name
- Appears at top of panel or section content area
- Dismiss writes to sessionStorage to prevent re-showing that nudge this session
- Max 1 nudge visible per page at any time
- Session counter in sessionStorage: max 5 nudges per session total (Elite), max 3 (Pro if ever extended)
- Tier-gated: only renders for Elite users

### Task 2: Cross-product nudge definitions

**Accept when**: A `frontend/agent-nudges-config.js` file defines available nudges. Each nudge specifies:
```js
{
  id: 'dolphin-injury-to-bureau',
  agent: 'dolphin',
  source_page: 'lab',
  source_context: 'injury_column_visible',
  message: 'injury risk on your RB1',
  link: '/league-intel.html#self-scout',
  link_label: 'See roster health →',
  requires_league: true
}
```
Define 15-20 nudges covering all cross-product stitches:
- Lab → Bureau (5-6 nudges): injury flag → roster health, usage trend → self-scout, trade value → trade finder, projection → odds, career comp → manager profiles
- Bureau → Lab (4-5 nudges): roster gap → screener filter, trade target → player card, odds concern → projection panel, depth weakness → breakout finder
- Bureau → Bureau (3-4 nudges): manager behavior → trade finder, pressure map → trade network, odds → power rankings
- Lab/Bureau → Situation Room (2-3 nudges): complex decision → "your agents have a take on this", multiple flags → "Razzle wants to brief you"

### Task 3: Nudge triggering logic

**Accept when**: `agent-nudges.js` includes a `checkNudges()` function that runs on page load and evaluates which nudges are relevant based on:
- Current page (lab, bureau, agents)
- User's connected league data (if any)
- Which panels/columns are currently visible
- What the user has been looking at (Lab context from localStorage)
- Session nudge count (respect the cap)
- Previously dismissed nudges (sessionStorage)
Selects the single most relevant nudge and renders it. If no nudge is relevant, renders nothing. Called on page load and on panel switch in the Lab.

### Task 4: Situation Room callbacks

**Accept when**: When agents respond in the Situation Room (warroom.js briefing output), they reference data the user has seen elsewhere. Implementation: read Lab context from localStorage and Bureau context (connected league) and inject references into the agent system prompt. Example additions to system prompt: "The user has been looking at [player] in the Lab. Their injury status is [status]. Reference this if relevant — say 'You saw the durability flag in the Lab.'" This makes agent responses feel continuous with the rest of the product.

---

## Phase: Autoresearch Engine — Synthetic User Simulation

**Context**: Build the Playwright + LLM persona simulation engine that generates synthetic user journeys to pre-optimize agent placement, copy, and timing. This is the foundation of the autoresearch self-improvement loop.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "Autoresearch Self-Improvement Engine"

**Exit criterion**: 20+ user personas defined. Simulation runner executes full site journeys via Playwright with Sonnet making navigation decisions. All interactions instrumented and logged.

### Task 1: Create user persona definitions

**Accept when**: `self-improvement/personas/` directory contains 20+ JSON persona files. Each defines:
```json
{
  "id": "dynasty-veteran",
  "description": "Plays in 5 dynasty leagues, trades weekly, data-obsessed, knows advanced stats",
  "experience": "expert",
  "league_format": "dynasty",
  "behavior": "power_user",
  "goals": ["find trade targets", "evaluate prospects", "optimize roster"],
  "patience": "high",
  "upgrade_likelihood": "medium",
  "session_length": "long"
}
```
Personas span: dynasty veteran, redraft casual, first-timer, trade junkie, data nerd, lurker, mobile-only, prospect obsessed, weekly grinder, commissioner, IDP enthusiast, DFS crossover, podcast listener, spreadsheet migrator, group chat screenshot sharer, auction league player, keeper league player, best ball player, superflex player, TE premium player.

### Task 2: Build simulation runner

**Accept when**: `self-improvement/simulate.py` runs a single simulated user journey:
1. Launches Playwright browser pointed at localhost (or razzle.lol)
2. Takes a screenshot at each navigation step
3. Sends screenshot + persona context to Sonnet via Claude API
4. Sonnet responds with the next action (click element, scroll, hover, navigate, leave)
5. Executes the action, captures the result
6. Logs every interaction to `self-improvement/simulation-log.jsonl`:
   ```json
   {"persona": "dynasty-veteran", "session": "abc123", "step": 5, "page": "/lab.html", "action": "click", "target": "#breakout-panel", "agent_callout_visible": "hawkeye-breakout-note", "agent_callout_clicked": true, "timestamp": "2026-03-20T14:30:00Z"}
   ```
7. Continues until persona "leaves" (Sonnet decides session is over) or max 50 steps
8. Supports running N sessions per persona via CLI args: `python simulate.py --persona dynasty-veteran --sessions 50`

### Task 3: Build instrumentation layer

**Accept when**: The simulation runner captures these metrics per interaction:
- Agent callout impressions (which agent callouts were visible on screen)
- Agent callout clicks (which were engaged with)
- Agent callout dismissals (which were explicitly closed)
- Hover duration on any element with agent attribution
- Navigation path (ordered list of pages/panels visited)
- Time-on-page per page/panel
- Conversion events (detected by page transitions: pricing page visit, checkout page visit)
- Feature discovery (which panels/tools were found and used)
- Session depth (total pages visited)
- Session duration (total simulated time)
All logged to `simulation-log.jsonl` with consistent schema.

### Task 4: Build batch runner

**Accept when**: `self-improvement/run_batch.py` orchestrates a full simulation cycle:
1. Reads all persona files from `self-improvement/personas/`
2. Runs N sessions per persona (configurable, default 50)
3. Parallelizes across personas (configurable concurrency)
4. Aggregates results into `self-improvement/batch-results.json`:
   ```json
   {
     "batch_id": "2026-03-20-001",
     "total_sessions": 1000,
     "personas": 20,
     "sessions_per_persona": 50,
     "metrics": {
       "overall_ctr": 0.23,
       "conversion_rate": 0.041,
       "avg_session_depth": 4.2,
       "top_agent": "bones",
       "worst_agent": "atlas"
     },
     "per_agent": { ... },
     "per_persona": { ... }
   }
   ```
5. CLI: `python run_batch.py --sessions-per-persona 50 --concurrency 4`

---

## Phase: Autoresearch Engine — Self-Reflection Loop

**Context**: After simulation data is collected, each agent independently analyzes their own performance and updates their placement/copy/timing config. Razzle then synthesizes cross-agent strategy. All analysis runs on Opus except the simulation sessions themselves (Sonnet).

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Loops 2, 3, and 4

**Exit criterion**: Each agent produces insights and updated config. Razzle produces cross-agent strategy. Peer review catches issues. Updated config deploys to frontend.

### Task 1: Build per-agent self-reflection runner

**Accept when**: `self-improvement/reflect.py` runs self-reflection for one agent:
1. Reads `simulation-log.jsonl` filtered to that agent's placements
2. Calculates: CTR per placement, CTR per copy variant, engagement by persona type, timing patterns
3. Sends data + agent persona to Opus via Claude API with prompt: "You are {agent}. Here is your engagement data. What's working? What's not? What should you change? Output updated placement config."
4. Agent writes:
   - `self-improvement/{agent}-insights.md` — what they learned
   - `self-improvement/{agent}-placement.json` — updated placement config (same schema as `AGENT_TERRITORY` but with performance data and enabled/disabled flags)
   - `self-improvement/{agent}-copy-variants.json` — tested copy with scores
   - `self-improvement/{agent}-timing.json` — timing/frequency rules
5. CLI: `python reflect.py --agent dolphin`
6. `python reflect.py --all` runs all 6 sequentially

### Task 2: Build Razzle strategy session

**Accept when**: `self-improvement/strategize.py` runs Razzle's cross-agent synthesis:
1. Reads all 6 agents' insight files and placement configs
2. Sends to Opus with Razzle's persona + strategy prompt: "You are Razzle. You've read your team's self-assessments. Optimize the cross-agent stitching. Resolve conflicts. Identify the highest-converting paths. What nudges should connect which products?"
3. Razzle writes:
   - `self-improvement/razzle-strategy.md` — cross-agent observations and decisions
   - `self-improvement/cross-agent-stitching.json` — updated nudge definitions and priorities
4. CLI: `python strategize.py`

### Task 3: Build peer review runner

**Accept when**: `self-improvement/peer_review.py` runs peer review:
1. Each agent reviews one other agent's proposed changes (rotation: Dolphin→Hawkeye→Bones→Octo→Atlas→Dolphin, Razzle reviews all)
2. Sends reviewing agent's persona + reviewed agent's changes to Opus
3. Reviewer checks for: brand drift, spam creep, territory cannibalization, copy that sounds wrong for the character
4. Output: approve or flag with specific feedback
5. Flagged items go to Razzle for arbitration
6. CLI: `python peer_review.py`

### Task 4: Build config deployment

**Accept when**: `self-improvement/deploy_config.py` takes the approved configs and:
1. Merges all agent placement configs into a single `frontend/agent-config-optimized.json`
2. Merges copy variants into the frontend config
3. Merges timing rules
4. Bumps version number on each agent's config
5. Logs to `self-improvement/optimization-log.tsv`: cycle, version, total_ctr, conversion_rate, avg_session_depth, churn_rate, best_agent, worst_agent, new_placements, killed_placements, notes
6. Frontend reads from `agent-config-optimized.json` at runtime if it exists, falls back to `agent-config.js` defaults
7. CLI: `python deploy_config.py`

### Task 5: Build full autoresearch cycle runner

**Accept when**: `self-improvement/run_cycle.py` orchestrates one complete cycle:
1. Run batch simulation (`run_batch.py`)
2. Run self-reflection for all 6 agents (`reflect.py --all`)
3. Run Razzle strategy session (`strategize.py`)
4. Run peer review (`peer_review.py`)
5. Deploy config (`deploy_config.py`)
6. Log cycle results
7. CLI: `python run_cycle.py --sessions-per-persona 50`
8. Optional: `--auto-revert` flag — if overall metrics regress vs previous cycle, auto-revert to last config

---

## Phase: MiroFish Integration — Decision Sandbox (Pro Feature)

**Context**: Integrate MiroFish as a user-facing feature. Pro users get the Decision Sandbox — simulate 50 futures branching from a specific move (trade, waiver, start/sit). Visual branching timeline UI with agent annotations.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "MiroFish Season Simulation"

**Exit criterion**: Pro users can input a decision scenario, MiroFish simulates 50 branching futures, results render as a visual branching timeline with agent-annotated nodes.

### Task 1: MiroFish backend integration

**Accept when**: MiroFish runs as a service alongside the FastAPI backend. A new endpoint `POST /api/simulate/decision` accepts:
```json
{
  "scenario_type": "trade",
  "decision": "Trade Breece Hall for 1.02 pick",
  "league_context": { "rosters": [...], "scoring": {...}, "format": "dynasty" },
  "branches": 50
}
```
The endpoint seeds MiroFish with league data (rosters as agent profiles, manager behavioral data from Atlas, injury probabilities from Dolphin, breakout data from Hawkeye). Returns 50 branching timeline results, each a sequence of weekly events (trades, injuries, breakouts, standings changes, playoff outcomes). Caches results per league+scenario for 24 hours. Pro+ tier gated.

### Task 2: MiroFish agent data seeding

**Accept when**: League data is properly translated into MiroFish agent personas:
- Each league manager becomes a MiroFish agent with behavioral profile from Atlas (trade frequency, panic threshold, positional preferences)
- Dr. Dolphin's injury probability curves seed health event generation
- Hawkeye's breakout/bust probabilities seed usage shifts
- Octo validates that simulated point totals are statistically plausible (within 2 stddev of projections)
- Bones' trade behavior model influences when/how simulated managers trade
- A `backend/mirofish_adapter.py` handles the translation from Razzle data → MiroFish seed format

### Task 3: Branching timeline UI component

**Accept when**: A new `frontend/timeline.js` module renders a visual branching timeline:
- SVG-based branching tree visualization
- Each branch is a simulated season path
- Key events are clickable nodes: trades, injuries, breakouts, playoff results, championship
- Clicking a node expands an agent annotation panel showing which agent flagged this event and their take
- Agent avatars appear on nodes in their domain (Dolphin on injury nodes, Bones on trade nodes, etc.)
- Color-coded paths: green (championship), yellow (playoff), orange (mid-pack), red (collapse)
- Scrollable/zoomable for large trees
- Razzle design language: sand background, chunky node borders, Caveat annotations, Space Mono data values

### Task 4: Decision Sandbox page

**Accept when**: A new section in the Bureau or a dedicated page provides the Decision Sandbox:
- Input: scenario description (text), scenario type dropdown (trade, waiver add, start/sit, draft pick)
- Optional: select involved players from connected roster
- "Simulate 50 Futures" button (chunky, terracotta, Razzle-styled)
- Loading state: "Razzle's running the scenarios..." with pixel agents animation
- Output: branching timeline (Task 3) + summary card showing: % of futures where this decision helped, average championship odds delta, Razzle's verdict
- Pro tier gated (free users see a locked preview with sample timeline)

---

## Phase: MiroFish Integration — Season Simulator (Elite Feature)

**Context**: Elite users get the full Season Simulator — simulate 100+ complete remaining-season timelines with real manager behavior, injuries, breakouts, trades. The big crystal ball.

**Design ref**: `docs/plans/2026-03-20-agent-connective-tissue-design.md` — Section "MiroFish Season Simulation"

**Exit criterion**: Elite users can simulate 100+ full season timelines from their actual league. Results render as explorable branching timelines with agent narration.

### Task 1: Full season simulation endpoint

**Accept when**: `POST /api/simulate/season` accepts:
```json
{
  "league_id": "sleeper_league_id",
  "simulations": 100,
  "weeks_remaining": 12
}
```
Seeds MiroFish with full league state: current standings, all rosters, remaining schedule, manager behavioral profiles, injury histories, waiver wire. Simulates week-by-week: each week generates events (injuries, breakouts, trades, waiver moves, game results, standings changes). Returns 100 complete season paths from current week through championship. Heavy compute — cache aggressively (per league, refresh weekly). Elite tier gated.

### Task 2: Season Simulator page

**Accept when**: A dedicated section in the Bureau (or standalone page linked from Bureau) provides the Season Simulator:
- Requires connected Sleeper league
- "Simulate My Season" button — runs 100 simulations
- Loading state: pixel agents animation + progress bar ("simulating week 8... week 9... week 12... playoffs...")
- Output: branching timeline showing all 100 paths with convergence/divergence points
- Summary dashboard: championship probability distribution, most common playoff bracket, most impactful upcoming events, biggest risk factors
- Each timeline node annotated by the relevant agent
- Razzle's verdict card at the top: "Here's how your season looks. [Key insight]."
- Filter by outcome: show only championship paths, only collapse paths, only paths where a specific trade happens
- Elite tier gated

### Task 3: Agent narration layer

**Accept when**: After MiroFish produces raw simulation data, each agent annotates their domain:
- Razzle: overall narrative summary per timeline ("In this timeline, you peaked at week 10 but your rival's deadline trade turned the tide")
- Dr. Dolphin: annotates injury events ("Week 8: your RB1's hamstring history caught up — missed 3 weeks")
- Hawkeye: annotates breakout/bust events ("Week 6: your WR3 broke out — target share jumped 8 points")
- Bones: annotates trade events ("Week 9: your rival panic-traded — Atlas predicted this")
- Octo: annotates probability shifts at each node ("Championship odds went from 22% to 34% after this waiver add")
- Atlas: annotates historical parallels ("This manager sold low after losses 3 times in league history — it happened again here")
Annotations use each agent's voice and are displayed when clicking timeline nodes.

---

## Phase: Verification — Agent Connective Tissue

**Context**: After all agent presence layers are implemented, verify the complete experience end-to-end.

**Exit criterion**: All checks pass.

### Task 1: Free tier experience verification

**Accept when**: Navigate the entire site as a free user. Verify:
- Every loading state uses agent-voiced copy in Caveat font
- Every empty state has agent personality
- 16px agent icons appear in column header tooltips (screener)
- 20px agent icons appear in panel subtitles
- 404 page uses Razzle's voice
- No agent NAMES are prominently displayed — just icons and personality
- No nudges appear (Elite only)

### Task 2: Pro tier experience verification

**Accept when**: Navigate as a Pro user. Verify:
- Everything from Task 1 plus:
- Agent names visible next to sidebar panel groups
- One-liner insights appear at top of owned panels
- Situation Room peek works (canvas animates, briefing area blurred/locked, demo visible)
- Decision Sandbox accessible and functional
- No Elite nudges appear

### Task 3: Elite tier experience verification

**Accept when**: Navigate as an Elite user. Verify:
- Everything from Tasks 1-2 plus:
- Agent nudges appear (max 1 per page)
- Nudges are dismissible and don't reappear this session
- Session nudge cap of 5 respected
- Nudges link between products correctly
- Situation Room fully accessible
- Season Simulator accessible and functional
- Agent callbacks reference Lab/Bureau data in Situation Room responses

### Task 4: Design compliance check

**Accept when**: All agent UI elements match DESIGN.md:
- Caveat font for personality text
- Space Mono for any data within agent elements
- Luckiest Guy only for headings
- Agent colors match definitions (Dolphin=#5b7fff, Hawkeye=#2ec4b6, etc.)
- Chunky borders on any agent cards/containers
- Sand background, no gradients, no thin 1px borders
- Dark mode compatible
- Mobile responsive (agent icons scale, nudges stack properly)
