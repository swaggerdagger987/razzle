#!/usr/bin/env python3
"""
Razzle Reddit Scraper

Pulls posts + comments from fantasy football subreddits via Reddit's public JSON endpoints.
Output matches Apify reddit-scraper-pro format for consistency.

Usage:
    python scripts/reddit_scraper.py                    # Scrape all configured subs
    python scripts/reddit_scraper.py --sub DynastyFF    # Scrape one sub
    python scripts/reddit_scraper.py --limit 100        # Limit posts per sort type
    python scripts/reddit_scraper.py --no-comments      # Skip fetching comments
    python scripts/reddit_scraper.py --fast             # OAuth rate (needs env vars)

Output: data/reddit/YYYY-MM-DD_scrape.json (single file, Apify-compatible format)
"""

import json
import time
import argparse
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR.parent / "data" / "reddit"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = "razzle-research/1.0 (fantasy football analytics research)"

# Rate limiting: 10 req/min without OAuth
REQUEST_DELAY = 7.5  # seconds between requests (~8/min, safe margin)
MAX_RETRIES = 3

# All fantasy football subreddits worth scraping
SUBREDDITS = [
    # Tier 1 — Core dynasty community (your exact customer)
    {
        "name": "DynastyFF",
        "sorts": ["top", "hot", "new"],
        "top_time": "year",
    },
    # Tier 1 — Your platform's users
    {
        "name": "SleeperApp",
        "sorts": ["top", "hot"],
        "top_time": "year",
    },
    # Tier 2 — Broad fantasy, dynasty overlap
    {
        "name": "fantasyfootball",
        "sorts": ["top", "hot"],
        "top_time": "year",
    },
    {
        "name": "Fantasy_Football",
        "sorts": ["top", "hot"],
        "top_time": "year",
    },
    # Tier 2 — Dynasty-adjacent
    {
        "name": "DynastyFootballLeague",
        "sorts": ["top", "hot"],
        "top_time": "year",
    },
    {
        "name": "KeeperFF",
        "sorts": ["top"],
        "top_time": "year",
    },
    # Tier 3 — Draft/prospect obsessives
    {
        "name": "NFL_Draft",
        "sorts": ["top"],
        "top_time": "year",
    },
    {
        "name": "fantasyfootballadvice",
        "sorts": ["top", "hot"],
        "top_time": "year",
    },
    # Tier 3 — Trade/value focused
    {
        "name": "TradeAnalyzerFF",
        "sorts": ["top"],
        "top_time": "year",
    },
    {
        "name": "FantasyFootballers",
        "sorts": ["top"],
        "top_time": "year",
    },
]


def fetch_json(url):
    """Fetch JSON from a URL with rate limiting and retries."""
    for attempt in range(MAX_RETRIES):
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT})
            with urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                time.sleep(REQUEST_DELAY)
                return data
        except HTTPError as e:
            if e.code == 429:
                wait = 60 * (attempt + 1)
                print(f"    Rate limited (429). Waiting {wait}s...")
                time.sleep(wait)
            elif e.code == 403:
                print(f"    Forbidden (403) for {url}. Skipping.")
                return None
            elif e.code == 404:
                print(f"    Not found (404) — subreddit may not exist. Skipping.")
                return None
            else:
                print(f"    HTTP {e.code}. Retry {attempt + 1}/{MAX_RETRIES}")
                time.sleep(REQUEST_DELAY * 2)
        except (URLError, TimeoutError) as e:
            print(f"    Network error: {e}. Retry {attempt + 1}/{MAX_RETRIES}")
            time.sleep(REQUEST_DELAY * 2)
    print(f"    Failed after {MAX_RETRIES} retries: {url}")
    return None


def fetch_posts(subreddit, sort="top", time_filter="year", limit=200):
    """Fetch posts from a subreddit, paginating up to limit."""
    posts = []
    after = None
    per_page = min(limit, 100)

    print(f"  Fetching r/{subreddit}/{sort} (t={time_filter})...")

    while len(posts) < limit:
        url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit={per_page}&t={time_filter}&raw_json=1"
        if after:
            url += f"&after={after}"

        data = fetch_json(url)
        if not data or "data" not in data:
            break

        children = data["data"].get("children", [])
        if not children:
            break

        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

        for child in children:
            p = child["data"]
            created = datetime.fromtimestamp(p.get("created_utc", 0), tz=timezone.utc)

            posts.append({
                "dataType": "post",
                "title": p.get("title"),
                "body": p.get("selftext", ""),
                "authorName": p.get("author"),
                "communityName": f"r/{subreddit}",
                "upVotes": p.get("score", 0),
                "upVoteRatio": p.get("upvote_ratio", 0),
                "commentsCount": p.get("num_comments", 0),
                "postUrl": f"https://www.reddit.com{p.get('permalink', '')}",
                "createdAt": created.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "crawledAt": now,
                "id": p.get("name", f"t3_{p.get('id')}"),
                "parsedId": p.get("id"),
                "postType": "text" if p.get("is_self") else "link",
                "flair": p.get("link_flair_text"),
                "contentUrl": p.get("url") if not p.get("is_self") else None,
                "authorId": f"t2_{p.get('author_fullname', '').replace('t2_', '')}",
                "parsedCommunityName": subreddit,
            })

        after = data["data"].get("after")
        if not after:
            break

        print(f"    ...{len(posts)} posts")

    print(f"    Got {len(posts)} posts from r/{subreddit}/{sort}")
    return posts


def fetch_comments(permalink, subreddit, post_id, post_fullname, max_comments=30):
    """Fetch top comments for a post. Returns Apify-format comment dicts."""
    url = f"https://www.reddit.com{permalink}.json?limit={max_comments}&sort=top&raw_json=1"

    data = fetch_json(url)
    if not data or not isinstance(data, list) or len(data) < 2:
        return []

    comments = []
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    def parse_comments(children, depth=0):
        if depth > 2:  # Don't go deeper than 2 reply levels
            return
        for child in children:
            if child.get("kind") != "t1":
                continue
            c = child["data"]
            created = datetime.fromtimestamp(c.get("created_utc", 0), tz=timezone.utc)

            comments.append({
                "dataType": "comment",
                "body": c.get("body", ""),
                "authorName": c.get("author"),
                "subredditName": subreddit,
                "commentUpVotes": c.get("score", 0),
                "url": f"https://www.reddit.com{c.get('permalink', '')}",
                "commentCreatedAt": created.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
                "crawledAt": now,
                "id": c.get("id"),
                "authorId": f"t1_{c.get('id')}",
                "parsedAuthorId": c.get("id"),
                "subredditId": "",
                "parsedSubredditId": "",
                "postId": post_fullname,
                "parsedPostId": post_id,
                "parentId": c.get("parent_id", ""),
                "parsedParentId": c.get("parent_id", "").split("_")[-1] if c.get("parent_id") else "",
            })

            # Recurse into replies
            replies = c.get("replies")
            if replies and isinstance(replies, dict):
                reply_children = replies.get("data", {}).get("children", [])
                parse_comments(reply_children, depth + 1)

    children = data[1].get("data", {}).get("children", [])
    parse_comments(children)

    return comments


def scrape_subreddit(config, post_limit=200, fetch_comments_flag=True):
    """Scrape a full subreddit. Returns list of post + comment dicts."""
    name = config["name"]
    print(f"\n{'='*60}")
    print(f"  r/{name}")
    print(f"{'='*60}")

    all_items = []
    seen_ids = set()

    for sort in config["sorts"]:
        time_filter = config.get("top_time", "year") if sort == "top" else "year"
        posts = fetch_posts(name, sort=sort, time_filter=time_filter, limit=post_limit)

        for post in posts:
            if post["parsedId"] not in seen_ids:
                seen_ids.add(post["parsedId"])
                all_items.append(post)

    unique_posts = [i for i in all_items if i["dataType"] == "post"]
    print(f"\n  Unique posts: {len(unique_posts)}")

    if fetch_comments_flag and unique_posts:
        # Fetch comments for top-scoring posts
        sorted_posts = sorted(unique_posts, key=lambda p: p["upVotes"], reverse=True)
        to_fetch = sorted_posts[:min(75, len(sorted_posts))]

        print(f"  Fetching comments for top {len(to_fetch)} posts...")
        comment_count = 0
        for i, post in enumerate(to_fetch):
            permalink = post["postUrl"].replace("https://www.reddit.com", "")
            comments = fetch_comments(permalink, name, post["parsedId"], post["id"])
            all_items.extend(comments)
            comment_count += len(comments)
            if (i + 1) % 10 == 0:
                print(f"    ...{i+1}/{len(to_fetch)} posts, {comment_count} comments")

        print(f"  Total comments: {comment_count}")

    return all_items


def main():
    parser = argparse.ArgumentParser(description="Razzle Reddit Scraper")
    parser.add_argument("--sub", type=str, help="Scrape only this subreddit")
    parser.add_argument("--limit", type=int, default=200, help="Max posts per sort type (default: 200)")
    parser.add_argument("--no-comments", action="store_true", help="Skip fetching comments")
    parser.add_argument("--fast", action="store_true", help="Faster rate (use with OAuth env vars)")
    parser.add_argument("--tier", type=int, choices=[1, 2, 3], help="Only scrape this tier (1=core, 2=adjacent, 3=niche)")

    args = parser.parse_args()

    global REQUEST_DELAY
    if args.fast:
        REQUEST_DELAY = 1.0  # 60 req/min with OAuth

    subs = SUBREDDITS
    if args.sub:
        subs = [s for s in SUBREDDITS if s["name"].lower() == args.sub.lower()]
        if not subs:
            subs = [{"name": args.sub, "sorts": ["top", "hot", "new"], "top_time": "year"}]
    elif args.tier:
        tier_map = {
            1: ["DynastyFF", "SleeperApp"],
            2: ["fantasyfootball", "Fantasy_Football", "DynastyFootballLeague", "KeeperFF"],
            3: ["NFL_Draft", "fantasyfootballadvice", "TradeAnalyzerFF", "FantasyFootballers"],
        }
        tier_names = tier_map[args.tier]
        subs = [s for s in SUBREDDITS if s["name"] in tier_names]

    print(f"Razzle Reddit Scraper")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Posts per sort: {args.limit}")
    print(f"Comments: {'No' if args.no_comments else 'Yes (top 75 posts per sub)'}")
    print(f"Rate: ~{60/REQUEST_DELAY:.0f} req/min")
    print(f"Subreddits ({len(subs)}): {', '.join(s['name'] for s in subs)}")

    all_items = []

    for config in subs:
        try:
            items = scrape_subreddit(config, post_limit=args.limit, fetch_comments_flag=not args.no_comments)
            all_items.extend(items)
        except KeyboardInterrupt:
            print("\n\nInterrupted. Saving what we have so far...")
            break
        except Exception as e:
            print(f"  Error scraping r/{config['name']}: {e}. Continuing...")

    # Save single file matching Apify format
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    output_file = OUTPUT_DIR / f"reddit_scrape_{timestamp}.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_items, f, indent=2, ensure_ascii=False)

    posts = [i for i in all_items if i["dataType"] == "post"]
    comments = [i for i in all_items if i["dataType"] == "comment"]

    # Per-subreddit summary
    sub_counts = {}
    for item in all_items:
        sub = item.get("parsedCommunityName") or item.get("subredditName") or "unknown"
        if sub not in sub_counts:
            sub_counts[sub] = {"posts": 0, "comments": 0}
        sub_counts[sub][item["dataType"] + "s"] = sub_counts[sub].get(item["dataType"] + "s", 0) + 1

    print(f"\n{'='*60}")
    print(f"COMPLETE")
    print(f"{'='*60}")
    print(f"Total: {len(posts)} posts, {len(comments)} comments")
    print(f"File: {output_file}")
    print(f"Size: {output_file.stat().st_size / 1024 / 1024:.1f} MB")
    print(f"\nPer subreddit:")
    for sub, counts in sorted(sub_counts.items()):
        print(f"  r/{sub}: {counts.get('posts', 0)} posts, {counts.get('comments', 0)} comments")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
