# Reddit — Primary Distribution (Everything Else Later)

**razzle.lol** is the brand. **Reddit is the only channel that matters right now.**

Twitter, Discord, SEO, paid ads, podcasts — all **secondary, deferred**. We do not split focus until Reddit pays for itself.

---

## The goal

Make **enough** from Reddit-driven traffic to justify spending more time and money on Razzle. Not VC scale. Lifestyle business: proof on Reddit → conversions → reinvest.

Success looks like:
1. Dynasty managers recognize **razzle.lol** from helpful thread replies
2. Screenshots from The Lab circulate on r/DynastyFF without feeling like ads
3. The bot earns trust by being **right and useful**, not promotional
4. Pro converts because the free screener + intel already proved value in-thread

---

## What we market on Reddit

**Obsession with fantasy — not AI.** See `docs/v2/VOICE.md`.

| Post well | Post badly |
|-----------|------------|
| "IND is 3rd-most RB-friendly by carry share — [chart]" | "Try our AI fantasy assistant!" |
| Watermarked screener export | Link dump with no insight |
| Bot confirms a stat with source | Generic ChatGPT paragraph |
| "Here's the tape" energy | SaaS launch tone |

---

## Three Reddit motions

### 1. Screenshot engine (now)

The Lab and Explore exist to be **screenshotted**. Every vertical slice should pass:

- Would r/DynastyFF upvote this **for the data**?
- Watermark says **razzle.lol**
- Mobile card feed works (Reddit app users)

Primary subs: **r/DynastyFF** (dynasty), r/fantasyfootball (volume), r/Fantasy_Football.

### 2. Value posts (human, later automation)

Pure analysis posts — no link in body, watermark on image. Build karma and mod trust before any reveal post.

Opus logs thread patterns in `docs/v2/REDDIT-INTEL.md` each odd cycle.

### 3. !razzle bot (build later — design now)

**Highest-leverage distribution.** Modeled on FPLbot: summoned in comments, delivers facts, links back only when useful.

**Status:** Scaffold at `apps/api/bots/reddit_bot.py`. Credentials in `docs/v2/SECRETS.md`. **Do not deploy until product + intel layer are solid.**

#### Planned triggers

| Command | Behavior |
|---------|----------|
| `!razzle confirm <claim>` | Check claim against terminal.db + intel snippets. Reply: confirmed / debunked + one stat + optional link |
| `!razzle <player>` | Top 2–3 intel snippets (usage, contract, coaching tendency). Hawkeye/Bones voice, not AI voice |
| `!razzle <A> for <B>` | Trade value read + link to `/lab/trade-values` (existing scaffold) |
| DM `!razzle …` | Same fact engine, shorter reply |

#### Bot rules (non-negotiable)

- **Helpful first** — if we can't answer from data, say "don't have clean data on that" (no hallucination)
- **One reply / user / hour** — polite, not spammy
- **Never say AI** — "Razzle says" / stat citation / razzle.lol link
- **UTM on links** — `utm_source=reddit&utm_medium=bot`
- **Mod outreach** before launch on r/DynastyFF — message mods, follow sub rules
- **Intel layer** (`docs/v2/INTEL.md`) powers fact replies — coaching tendencies, contracts, usage

#### Subreddits (priority order)

1. r/DynastyFF — primary audience
2. r/fantasyfootball
3. r/Fantasy_Football
4. r/redzonefantasy

---

## Conversion path

```
Reddit thread → bot reply or screenshot → razzle.lol/explore (free)
                                        → depth in Lab / Bureau
                                        → Pro when league context is worth it
```

Free screener is the hook. **Intelligence** (intel snippets, Bureau, film room) is what they pay for — never marketed as AI.

---

## What the loop prioritizes for Reddit

Each cycle Opus asks:
1. Does this slice produce a **screenshot** or **bot-worthy fact**?
2. Does copy pass VOICE.md (no AI)?
3. Does intel/hallway make replies **league-aware** when relevant?

Horizontal work that doesn't help Reddit waits.

---

## Deferred (explicitly not now)

- Twitter/X pipeline
- Discord bot / server seeding
- SEO content farm
- Paid ads
- Podcast / influencer
- App store / mobile native

Revisit only when Reddit MRR justifies it.

---

## Related

- Bot code: `apps/api/bots/reddit_bot.py`
- Intel for fact replies: `docs/v2/INTEL.md`
- Voice: `docs/v2/VOICE.md`
- Thread research: `docs/v2/REDDIT-INTEL.md`
- Credentials: `docs/v2/SECRETS.md`
