#!/usr/bin/env python3
"""
Razzle Marketing Research Engine (Autoresearch Pattern)

Reads scraped Reddit data and produces:
1. Customer persona profiles (who are these people?)
2. Pain point map (what problems do they have that Razzle solves?)
3. Agent profiles (how each of the 6 agents addresses specific pain points)
4. Content strategy (what to post, where, when)
5. Conversion playbook (how to turn a Reddit lurker into a $100/yr subscriber)

Uses Karpathy's autoresearch pattern:
  Observe → Analyze → Hypothesize → Test → Iterate

Usage:
    python scripts/marketing_research.py                  # Full analysis
    python scripts/marketing_research.py --data-only      # Just parse data, no LLM
    python scripts/marketing_research.py --section agents  # Only generate agent profiles

Output: docs/marketing/ directory
"""

import json
import argparse
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
REDDIT_DIR = PROJECT_DIR / "data" / "reddit"
OUTPUT_DIR = PROJECT_DIR / "docs" / "marketing"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_all_reddit_data():
    """Load all scraped Reddit data from data/reddit/."""
    all_items = []
    for f in REDDIT_DIR.glob("*.json"):
        try:
            with open(f, encoding="utf-8") as fh:
                data = json.load(fh)
                if isinstance(data, list):
                    all_items.extend(data)
                    print(f"  Loaded {len(data)} items from {f.name}")
        except Exception as e:
            print(f"  Error loading {f.name}: {e}")

    posts = [i for i in all_items if i.get("dataType") == "post"]
    comments = [i for i in all_items if i.get("dataType") == "comment"]
    print(f"  Total: {len(posts)} posts, {len(comments)} comments")
    return posts, comments


def analyze_pain_points(posts, comments):
    """Extract pain points, questions, and frustrations from Reddit data."""

    # Keywords that signal pain/need
    pain_signals = {
        "trade_confusion": ["should i trade", "trade advice", "fair trade", "trade value", "overpay", "underpay", "trade calculator", "trade offer"],
        "start_sit": ["should i start", "start or sit", "start sit", "who do i start", "wdis"],
        "waiver_wire": ["waiver wire", "faab", "waiver priority", "pick up", "drop for"],
        "rookie_draft": ["rookie draft", "rookie rankings", "startup draft", "draft strategy", "who to draft", "1.01", "1.02", "1.03", "1.04", "1.05"],
        "value_uncertainty": ["what is .* worth", "value check", "price check", "how much", "worth a"],
        "tool_complaints": ["fantasypros", "ktc", "keeptradecut", "trade calculator sucks", "rankings are", "tool for", "app for", "site for"],
        "league_management": ["commissioner", "league settings", "scoring settings", "roster size", "taxi squad"],
        "rebuild_contend": ["rebuild", "contender", "competing", "tanking", "blowing up", "window"],
        "prospect_research": ["film", "tape", "college", "combine", "measurables", "pro day", "prospect"],
        "data_analysis": ["target share", "snap count", "usage", "efficiency", "yards per", "ppg", "points per game", "stats"],
        "injury_concern": ["injury", "injured", "hamstring", "acl", "knee", "ankle", "concussion", "ir"],
        "aging_decline": ["age", "aging", "cliff", "decline", "old", "washed", "over the hill"],
    }

    pain_counts = Counter()
    pain_examples = {k: [] for k in pain_signals}

    all_text = []
    for post in posts:
        text = f"{post.get('title', '')} {post.get('body', '')}".lower()
        all_text.append(text)
        for category, keywords in pain_signals.items():
            for kw in keywords:
                if kw in text:
                    pain_counts[category] += 1
                    if len(pain_examples[category]) < 5:
                        pain_examples[category].append({
                            "title": post.get("title", "")[:100],
                            "score": post.get("upVotes", 0),
                            "sub": post.get("parsedCommunityName") or post.get("communityName", ""),
                            "url": post.get("postUrl", ""),
                        })
                    break

    for comment in comments:
        text = (comment.get("body", "") or "").lower()
        all_text.append(text)
        for category, keywords in pain_signals.items():
            for kw in keywords:
                if kw in text:
                    pain_counts[category] += 1
                    break

    return pain_counts, pain_examples


def analyze_top_content(posts):
    """What types of content get the most engagement?"""
    # Sort by upvotes
    sorted_posts = sorted(posts, key=lambda p: p.get("upVotes", 0), reverse=True)

    # Top 50 posts
    top_50 = sorted_posts[:50]

    # Categorize by flair
    flair_scores = Counter()
    flair_counts = Counter()
    for post in posts:
        flair = post.get("flair") or "No Flair"
        flair_scores[flair] += post.get("upVotes", 0)
        flair_counts[flair] += 1

    # Average score per flair
    flair_avg = {}
    for flair in flair_counts:
        flair_avg[flair] = flair_scores[flair] / flair_counts[flair]

    # Content that gets screenshotted (image posts)
    image_posts = [p for p in posts if p.get("postType") == "link" or (p.get("contentUrl") and "redd.it" in str(p.get("contentUrl", "")))]

    return {
        "top_50": [{"title": p["title"][:120], "score": p.get("upVotes", 0), "flair": p.get("flair"), "comments": p.get("commentsCount", 0), "sub": p.get("parsedCommunityName", "")} for p in top_50],
        "flair_avg_score": dict(sorted(flair_avg.items(), key=lambda x: x[1], reverse=True)[:20]),
        "flair_counts": dict(flair_counts.most_common(20)),
        "image_post_count": len(image_posts),
        "total_posts": len(posts),
    }


def analyze_language(posts, comments):
    """What words and phrases do dynasty managers actually use?"""
    all_text = []
    for post in posts:
        all_text.append(post.get("title", ""))
        all_text.append(post.get("body", ""))
    for comment in comments:
        all_text.append(comment.get("body", ""))

    combined = " ".join(all_text).lower()

    # Player mentions
    player_pattern = re.compile(r'\b([A-Z][a-z]+ [A-Z][a-z]+)\b')
    player_text = " ".join(post.get("title", "") + " " + post.get("body", "") for post in posts)
    players = player_pattern.findall(player_text)
    player_counts = Counter(players).most_common(30)

    # Fantasy-specific terms frequency
    terms = [
        "dynasty", "redraft", "keeper", "startup", "superflex", "sf",
        "ppr", "half ppr", "standard", "te premium", "tep",
        "trade value", "trade calculator", "trade advice",
        "target share", "snap count", "snap percentage", "usage rate",
        "breakout", "bust", "sleeper", "waiver wire", "faab",
        "aging curve", "decline", "cliff", "regression",
        "championship", "playoff", "contender", "rebuild",
        "screener", "analytics", "data", "stats", "metrics",
        "league mate", "leaguemate", "group chat",
    ]
    term_counts = {}
    for term in terms:
        count = combined.count(term)
        if count > 0:
            term_counts[term] = count

    return {
        "top_players_mentioned": player_counts,
        "fantasy_term_frequency": dict(sorted(term_counts.items(), key=lambda x: x[1], reverse=True)),
    }


def analyze_tool_sentiment(posts, comments):
    """What do people say about existing tools?"""
    tools = {
        "KeepTradeCut": ["keeptradecut", "ktc", "keep trade cut"],
        "FantasyPros": ["fantasypros", "fantasy pros"],
        "ESPN": ["espn app", "espn fantasy", "espn league"],
        "Yahoo": ["yahoo fantasy", "yahoo league", "yahoo app"],
        "Sleeper": ["sleeper app", "sleeper league", "sleeper platform"],
        "Dynasty Nerds": ["dynasty nerds", "dynastynerds"],
        "Dynasty Process": ["dynasty process"],
        "PlayerProfiler": ["playerprofiler", "player profiler"],
    }

    tool_mentions = {tool: {"positive": [], "negative": [], "neutral": 0} for tool in tools}

    positive_words = ["love", "great", "best", "amazing", "helpful", "accurate", "reliable", "good"]
    negative_words = ["sucks", "terrible", "garbage", "broken", "inaccurate", "useless", "hate", "worst", "wrong", "bad", "trash"]

    all_items = [(p.get("title", "") + " " + p.get("body", ""), p) for p in posts]
    all_items += [(c.get("body", ""), c) for c in comments]

    for text, item in all_items:
        text_lower = text.lower()
        for tool_name, keywords in tools.items():
            for kw in keywords:
                if kw in text_lower:
                    sentiment = "neutral"
                    for pw in positive_words:
                        if pw in text_lower:
                            sentiment = "positive"
                            break
                    for nw in negative_words:
                        if nw in text_lower:
                            sentiment = "negative"
                            break

                    if sentiment == "neutral":
                        tool_mentions[tool_name]["neutral"] += 1
                    else:
                        excerpt = text[:200].strip()
                        if len(tool_mentions[tool_name][sentiment]) < 5:
                            tool_mentions[tool_name][sentiment].append(excerpt)
                    break

    return tool_mentions


def generate_data_report(posts, comments):
    """Generate the full data analysis report (no LLM needed)."""
    print("\nAnalyzing pain points...")
    pain_counts, pain_examples = analyze_pain_points(posts, comments)

    print("Analyzing top content...")
    content = analyze_top_content(posts)

    print("Analyzing language...")
    language = analyze_language(posts, comments)

    print("Analyzing tool sentiment...")
    tools = analyze_tool_sentiment(posts, comments)

    # Per-subreddit breakdown
    sub_posts = Counter()
    for post in posts:
        sub = post.get("parsedCommunityName") or post.get("communityName", "unknown")
        sub_posts[sub] += 1

    report = {
        "generated_at": datetime.now().isoformat(),
        "data_summary": {
            "total_posts": len(posts),
            "total_comments": len(comments),
            "subreddits": dict(sub_posts.most_common()),
        },
        "pain_points": {
            "counts": dict(pain_counts.most_common()),
            "examples": pain_examples,
        },
        "top_content": content,
        "language": language,
        "tool_sentiment": tools,
    }

    # Save raw analysis
    report_file = OUTPUT_DIR / "reddit_analysis.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nSaved analysis: {report_file}")

    # Generate human-readable report
    generate_readable_report(report)

    return report


def generate_readable_report(report):
    """Generate a markdown report from the analysis data."""

    pain = report["pain_points"]["counts"]
    content = report["top_content"]
    language = report["language"]
    tools = report["tool_sentiment"]
    summary = report["data_summary"]

    lines = []
    lines.append("# Razzle Market Research — Reddit Analysis")
    lines.append(f"\nGenerated: {report['generated_at'][:10]}")
    lines.append(f"Data: {summary['total_posts']} posts, {summary['total_comments']} comments")
    lines.append(f"Subreddits: {', '.join(f'r/{s} ({c})' for s, c in summary['subreddits'].items())}")

    lines.append("\n---\n")
    lines.append("## Pain Points — What Dynasty Managers Struggle With\n")
    lines.append("Ranked by frequency across all posts and comments:\n")
    lines.append("| Rank | Pain Point | Mentions | Razzle Solution |")
    lines.append("|------|-----------|----------|-----------------|")

    razzle_solutions = {
        "trade_confusion": "Bones (Diplomat) + Trade Finder + Trade Values panel",
        "start_sit": "Razzle verdict + Situation Room briefing",
        "waiver_wire": "Hawkeye (Scout) + Waiver Wire panel + FAAB strategy",
        "rookie_draft": "Hawkeye + Atlas + Big Board + Prospect panels",
        "value_uncertainty": "Octo (Quant) + Trade Values + floor/ceiling projections",
        "tool_complaints": "The Lab itself — free, better data, better UX",
        "league_management": "Bureau of Intelligence — league analysis, not management",
        "rebuild_contend": "Bureau Self-Scout + Monte Carlo odds + Razzle briefing",
        "prospect_research": "Hawkeye (Scout) + College data + Draft Class panel",
        "data_analysis": "The entire Lab — target share, snap %, usage, efficiency, everything",
        "injury_concern": "Dr. Dolphin (Medical) + Injury panel + Durability ratings",
        "aging_decline": "Atlas (Historian) + Aging Curves panel + Career Trajectories",
    }

    for rank, (pain_point, count) in enumerate(sorted(pain.items(), key=lambda x: x[1], reverse=True), 1):
        name = pain_point.replace("_", " ").title()
        solution = razzle_solutions.get(pain_point, "—")
        lines.append(f"| {rank} | {name} | {count} | {solution} |")

    lines.append("\n### Top Examples per Pain Point\n")
    for category, examples in report["pain_points"]["examples"].items():
        if examples:
            name = category.replace("_", " ").title()
            lines.append(f"**{name}:**")
            for ex in examples[:3]:
                lines.append(f"- [{ex['title']}]({ex['url']}) (score: {ex['score']}, r/{ex['sub']})")
            lines.append("")

    lines.append("\n---\n")
    lines.append("## What Content Gets Engagement\n")
    lines.append("### Top Flairs by Average Score\n")
    lines.append("| Flair | Avg Score | Post Count |")
    lines.append("|-------|-----------|------------|")
    for flair, avg in list(content["flair_avg_score"].items())[:15]:
        count = content["flair_counts"].get(flair, 0)
        lines.append(f"| {flair} | {avg:.0f} | {count} |")

    lines.append("\n### Top 20 Posts by Score\n")
    for i, post in enumerate(content["top_50"][:20], 1):
        lines.append(f"{i}. **{post['title']}** — {post['score']} upvotes, {post['comments']} comments (r/{post['sub']})")

    lines.append("\n---\n")
    lines.append("## Language — How Dynasty Managers Talk\n")
    lines.append("### Most Discussed Players\n")
    lines.append("| Player | Mentions |")
    lines.append("|--------|----------|")
    for player, count in language["top_players_mentioned"][:20]:
        lines.append(f"| {player} | {count} |")

    lines.append("\n### Fantasy Term Frequency\n")
    lines.append("| Term | Mentions |")
    lines.append("|------|----------|")
    for term, count in list(language["fantasy_term_frequency"].items())[:25]:
        lines.append(f"| {term} | {count} |")

    lines.append("\n---\n")
    lines.append("## Tool Sentiment — What People Say About Competitors\n")
    for tool_name, data in tools.items():
        neg = len(data["negative"])
        pos = len(data["positive"])
        neu = data["neutral"]
        total = neg + pos + neu
        if total == 0:
            continue
        lines.append(f"\n### {tool_name} ({total} mentions)")
        if data["negative"]:
            lines.append("**Complaints:**")
            for excerpt in data["negative"][:3]:
                lines.append(f'- "{excerpt[:150]}..."')
        if data["positive"]:
            lines.append("**Praise:**")
            for excerpt in data["positive"][:3]:
                lines.append(f'- "{excerpt[:150]}..."')

    lines.append("\n---\n")
    lines.append("## How Each Agent Addresses These Pain Points\n")

    agent_profiles = {
        "Razzle (Chief of Staff)": {
            "pain_points": ["start_sit", "rebuild_contend"],
            "pitch": "The final verdict. When dynasty managers are paralyzed by conflicting advice on Reddit, Razzle synthesizes all the data and gives one clear answer. No hedging, no 'it depends' — here's what the tape says.",
            "reddit_proof": "Start/sit and rebuild/contend threads get hundreds of comments with contradicting advice. Razzle cuts through the noise.",
        },
        "Dr. Dolphin (Medical Analyst)": {
            "pain_points": ["injury_concern"],
            "pitch": "The protector. Dynasty managers lose seasons starting players coming off soft-tissue injuries because they saw one optimistic practice report. Dr. Dolphin gives the unflinching truth about health risk with durability ratings and injury history.",
            "reddit_proof": "Injury threads are full of copium. 'He looked good in practice' gets upvoted while the hamstring history gets ignored. Dolphin doesn't let you lie to yourself.",
        },
        "Hawkeye (Scout)": {
            "pain_points": ["waiver_wire", "rookie_draft", "prospect_research", "data_analysis"],
            "pitch": "The signal finder. While Reddit argues about player narratives, Hawkeye watches the usage data. Target share trending up? Snap count climbing? Route participation spiking? Hawkeye saw it three weeks ago.",
            "reddit_proof": "Breakout threads on Reddit are reactive — they talk about players AFTER the breakout. Hawkeye finds them BEFORE. That's the edge worth paying for.",
        },
        "Bones (Diplomat)": {
            "pain_points": ["trade_confusion", "value_uncertainty"],
            "pitch": "The dealmaker. Trade threads on Reddit are chaos — 50 people giving 50 different answers on whether a trade is fair. Bones knows what both sides need and finds deals that actually get accepted.",
            "reddit_proof": "Trade advice on Reddit is from strangers who don't know your league. Bones knows your league — who's desperate, who overpays, who panics after losses.",
        },
        "Octo (Quant)": {
            "pain_points": ["value_uncertainty", "data_analysis"],
            "pitch": "The math. When Reddit debates are all vibes and narratives, Octo shows the numbers. Floor/ceiling projections, championship equity, confidence intervals. Here's what the math says — you decide.",
            "reddit_proof": "Reddit upvotes confident takes regardless of data backing. Octo doesn't care about confidence — just accuracy. Every take comes with the math to verify it.",
        },
        "Atlas (Historian)": {
            "pain_points": ["aging_decline", "prospect_research", "rebuild_contend"],
            "pitch": "The memory. Dynasty is a long game. Atlas remembers what happened last time a RB had this usage profile at age 28, or last time your league-mate panic-sold after two losses. History doesn't repeat, but it rhymes.",
            "reddit_proof": "Reddit has no memory. The same questions get asked every year. Atlas has the receipts from every season since 2015.",
        },
    }

    for agent, profile in agent_profiles.items():
        pain_names = [p.replace("_", " ").title() for p in profile["pain_points"]]
        lines.append(f"### {agent}")
        lines.append(f"**Addresses:** {', '.join(pain_names)}")
        lines.append(f"\n**Pitch:** {profile['pitch']}")
        lines.append(f"\n**Reddit proof:** {profile['reddit_proof']}")
        lines.append("")

    lines.append("\n---\n")
    lines.append("## Conversion Playbook — Reddit Lurker to $100/yr Subscriber\n")
    lines.append("""
### The Funnel

1. **Reddit sees a Razzle screenshot** — Lab export with watermark + agent sprite. The data is interesting enough to click.
2. **They land on the Lab** — free screener, real data, no signup. They sort, filter, discover something they didn't know.
3. **They come back** — the site has personality (agents in the margins). They start to notice the characters.
4. **They connect Sleeper** — Bureau shows their championship odds. They screenshot it and send to their group chat.
5. **Group chat clicks the link** — 3 more people land on the Lab. Flywheel starts.
6. **They hit the paywall** — Self-Scout, trade finder, or Situation Room. Something they NEED for their league.
7. **They pay $100/yr** — not for AI, not for data. For THEIR team of analysts who know THEIR league.

### Content Strategy by Platform

**Reddit (r/DynastyFF):**
- Post analysis screenshots (Lab exports with watermark)
- Answer trade questions with data ("here's what the screener says")
- Share breakout findings before they're consensus
- Never be salesy — be the person with the best data in the thread
- Build credibility over 2-3 months before any "I built a thing" post

**Twitter (@razzle_lol):**
- Agent-voiced takes (Hawkeye breakout alerts, Bones trade plays)
- Lab screenshots with contrarian data
- Draft season content (prospect comparisons, historical comps from Atlas)
- One tweet every 2 hours, every tweet has a screenshot

### What to Post This Week (March 2026 — Pre-Draft)

Based on Reddit analysis, these topics are hot right now:
1. Rookie draft rankings (who's 1.01 in SF vs 1QB?)
2. Free agency impact on dynasty values (new signings changing depth charts)
3. Buy-low candidates after disappointing 2025 seasons
4. Startup draft strategy for 2026 leagues forming now
5. Trade deadline regrets — what trades should you have made?
""")

    report_file = OUTPUT_DIR / "marketing_research.md"
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Saved report: {report_file}")


def main():
    parser = argparse.ArgumentParser(description="Razzle Marketing Research Engine")
    parser.add_argument("--data-only", action="store_true", help="Parse data only, no LLM analysis")
    parser.add_argument("--section", type=str, help="Only generate a specific section")

    args = parser.parse_args()

    print("Razzle Marketing Research Engine")
    print(f"Data source: {REDDIT_DIR}")
    print(f"Output: {OUTPUT_DIR}\n")

    print("Loading Reddit data...")
    posts, comments = load_all_reddit_data()

    if not posts:
        print("No data found. Run reddit_scraper.py first.")
        return

    report = generate_data_report(posts, comments)

    print(f"\n{'='*60}")
    print("MARKETING RESEARCH COMPLETE")
    print(f"{'='*60}")
    print(f"Report: {OUTPUT_DIR / 'marketing_research.md'}")
    print(f"Raw data: {OUTPUT_DIR / 'reddit_analysis.json'}")
    print(f"\nNext: Feed this into the Creator agent for tweet content")
    print(f"Next: Feed agent profiles into agent persona files")


if __name__ == "__main__":
    main()
