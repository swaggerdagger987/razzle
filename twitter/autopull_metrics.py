#!/usr/bin/env python3
"""
Razzle Twitter Auto-Pull Metrics

Reads results.tsv, finds posted tweets with tweet_ids but missing metrics,
pulls engagement data from the Twitter API, and updates results.tsv.

This closes the autoresearch loop — no manual metric entry needed.

Usage:
    python autopull_metrics.py          # Pull metrics for all posted tweets
    python autopull_metrics.py --recent # Only tweets from last 7 days
"""

import os
import csv
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path

import tweepy
from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).resolve().parent
ENV_PATH = SCRIPT_DIR / ".env"
RESULTS_FILE = SCRIPT_DIR / "results.tsv"

load_dotenv(ENV_PATH)


def get_client() -> tweepy.Client:
    return tweepy.Client(
        bearer_token=os.getenv("TWITTER_BEARER_TOKEN"),
        consumer_key=os.getenv("API_KEY"),
        consumer_secret=os.getenv("API_KEY_SECRET"),
        access_token=os.getenv("ACCESS_TOKEN"),
        access_token_secret=os.getenv("ACCESS_TOKEN_SECRET"),
    )


def pull_tweet_metrics(client: tweepy.Client, tweet_id: str) -> dict:
    """Fetch engagement metrics for a single tweet."""
    try:
        resp = client.get_tweet(
            tweet_id,
            tweet_fields=["public_metrics", "organic_metrics", "created_at"],
            user_auth=True,
        )
        if resp.data and resp.data.public_metrics:
            m = resp.data.public_metrics
            return {
                "metrics_impressions": m.get("impression_count", 0),
                "metrics_likes": m.get("like_count", 0),
                "metrics_rts": m.get("retweet_count", 0),
                "metrics_quotes": m.get("quote_count", 0),
                "metrics_replies": m.get("reply_count", 0),
            }
    except tweepy.errors.TweepyException as e:
        print(f"  [WARN] Could not fetch {tweet_id}: {e}")
    return {}


def load_results() -> list[dict]:
    """Load results.tsv as list of dicts."""
    if not RESULTS_FILE.exists():
        return []
    with open(RESULTS_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        return list(reader)


def save_results(rows: list[dict], fieldnames: list[str]):
    """Write results back to results.tsv."""
    with open(RESULTS_FILE, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter="\t")
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--recent", action="store_true", help="Only last 7 days")
    args = parser.parse_args()

    rows = load_results()
    if not rows:
        print("No results.tsv data found.")
        return

    fieldnames = list(rows[0].keys())
    client = get_client()

    cutoff = None
    if args.recent:
        cutoff = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

    updated = 0
    skipped = 0

    for row in rows:
        tweet_id = row.get("tweet_id", "").strip()
        status = row.get("status", "").strip()

        # Only process posted tweets with an ID
        if not tweet_id or status.upper() != "POSTED":
            continue

        # Skip if already has metrics
        if row.get("metrics_impressions", "").strip():
            skipped += 1
            continue

        # Skip if older than cutoff
        if cutoff and row.get("date", "") < cutoff:
            skipped += 1
            continue

        print(f"  Pulling metrics for tweet {tweet_id}...")
        metrics = pull_tweet_metrics(client, tweet_id)

        if metrics:
            for key, val in metrics.items():
                if key in row:
                    row[key] = str(val)
            # Calculate engagement rate
            impressions = int(metrics.get("metrics_impressions", 0))
            if impressions > 0:
                engagements = (
                    int(metrics.get("metrics_likes", 0))
                    + int(metrics.get("metrics_rts", 0))
                    + int(metrics.get("metrics_replies", 0))
                    + int(metrics.get("metrics_quotes", 0))
                )
                row["metrics_engagement_rate"] = f"{(engagements / impressions * 100):.2f}"
            updated += 1

    if updated > 0:
        save_results(rows, fieldnames)

    print(f"\nDone. Updated: {updated}, Skipped: {skipped} (already had metrics or filtered)")


if __name__ == "__main__":
    main()
