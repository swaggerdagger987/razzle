# Razzle Team Autoresearch Protocol

This file is read by ALL agents (Designer, PM, Shipper, Site Walker). It defines the shared autoresearch protocol that makes the team get better every cycle.

## THE PATTERN

Every agent follows this loop every invocation:

```
1. READ previous insights (your own + teammates')
2. DO your work
3. REVIEW your own output — find weak spots
4. REVISE anything that's weak
5. WRITE insights — what you learned, what patterns you see
6. SPAWN subagents for tasks you can't do well yourself
```

## 1. READ BEFORE ACTING

Every invocation, read these files FIRST:

- `designer-insights.md` — Designer's patterns (what's broken most, what categories of issues dominate)
- `designer-tickets/pm-log.md` — PM's decomposition quality and root cause findings
- `shipper-insights.md` — Shipper's fix patterns (what it keeps getting wrong, root causes found)
- `designer-reports/` — latest site walker report (what's PASS vs FAIL right now)
- `team-retro.md` — cross-team retrospective (updated every 30 tickets)

These files are the team's shared brain. If you skip reading them, you'll repeat mistakes the team already solved.

## 2. REVIEW YOUR OWN OUTPUT

After completing your work, stop and audit yourself:

**Designer asks:**
- Did I write tickets for real problems or noise? Look at the last 10 tickets in done/ — were they impactful?
- Am I still writing tickets for the same category the Shipper already fixed? Check if the walker still shows those as FAIL.
- Are my tickets specific enough? If the PM had to decompose more than 20% of them, they're too vague.

**PM asks:**
- Did the Shipper complete my tickets on the first try? If not, my specs weren't clear enough.
- Did I find root causes or just list symptoms? Count: how many of my tickets were "fix X in one file" vs "fix the pattern across all files."
- Are my priority numbers correct? Did the Shipper fix a P3 font issue while a P0 broken panel sat in the queue?

**Shipper asks:**
- Did my fixes actually work? Run the site walker after fixing to verify.
- Did I break anything else? Check the walker report for NEW failures that weren't there before.
- Did I fix the symptom or the root cause? If the same type of ticket keeps coming back, I'm fixing symptoms.

## 3. WRITE INSIGHTS (append, never overwrite)

Each agent appends to their insights file after every cycle. Include:

```markdown
### Cycle [N] — [timestamp]

**What I did**: [summary]
**Quality score**: [1-10, be honest]
**What worked**: [what went well]
**What didn't**: [what failed or was weak]
**Pattern spotted**: [anything recurring]
**Root cause found**: [if any — these are gold]
**Suggestion for teammates**: [what another agent should do differently]
**What I'd do differently next time**: [self-correction]
```

## 4. SPAWN SUBAGENTS

Any agent can spawn a subagent for a task they can't do well. Use the Agent tool with a specific, scoped prompt.

**When to spawn:**

- **Designer** can spawn a subagent to deep-read a specific JS file and map all the functions that render a broken panel. "Read frontend/lab-panels.js and list every function that renders the breakout panel. What API endpoint does it call? What happens if the API returns empty?"

- **PM** can spawn a subagent to research a root cause. "Read all 15 tickets about broken panels. Grep the codebase for the common pattern. What single fix would resolve all 15?"

- **Shipper** can spawn a subagent to verify a fix across all pages. "I fixed the loading state in lab.html. Check if the same bug exists in league-intel.html, agents.html, pricing.html, and all standalone panel pages."

- **Site Walker** (when run by Designer) — the Designer can spawn a targeted walker: "Run the site walker on ONLY league-intel.html with deep tab clicking. I need to know which Bureau tabs work and which don't."

**Subagent rules:**
- Give the subagent a SPECIFIC task, not "explore the codebase"
- Tell it exactly what files to read and what question to answer
- The subagent returns findings — the parent agent decides what to do with them
- Max 2 subagents per invocation (don't go recursive)
- Log what subagents you spawned and what they found in your insights file

## 5. TEAM RETRO (every 30 completed tickets)

After every 30th ticket in designer-tickets/done/, the Designer writes team-retro.md:

```markdown
## Team Retro — Ticket [N]

### Velocity
- Tickets completed this batch: X
- Average cycle time: X minutes per ticket
- Tickets that came back (regressions): X

### Quality
- Site walker health score before: X%
- Site walker health score after: X%
- Net improvement: +/- X percentage points

### Root Causes Found
- [list every root cause the team identified]
- [which ones were fixed vs just noted]

### Patterns
- Top 3 ticket categories this batch: [categories with counts]
- Are categories shifting? (e.g., fewer broken panels, more agent presence)
- What category should the next 30 tickets focus on?

### Agent Performance
- Designer: writing useful tickets? Or noise?
- PM: decomposition quality improving?
- Shipper: first-try fix rate?
- Site Walker: catching real issues?

### Subagents Spawned
- [what subagents were used, what they found, were they worth it]

### Recommendation for Next 30
- [what to focus on, what to stop doing, what to try differently]
```

## 6. CROSS-TEAM FEEDBACK LOOP

Agents can write feedback for each other in their insights files:

**Designer to PM**: "Your decomposition of the Bureau epic was too granular — 20 tickets when 5 would have been clearer. Group related changes."

**PM to Shipper**: "You keep fixing CSS but not testing in dark mode. Add dark mode check to your verification step."

**Shipper to Designer**: "Stop writing tickets about aria labels. Focus on broken panels. We have 15 panels that don't load."

**Anyone to Site Walker**: Add new expectations to the EXPECTATIONS dict in site_walker.py. If you notice the walker misses something, tell the next agent to update the script.

This feedback is how the team self-corrects without a human manager.
