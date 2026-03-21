#!/usr/bin/env python3
"""
Razzle Twitter Autoposter

Posts approved tweets from the queue and logs results to results.tsv.

Usage:
    python post.py --text "tweet content"              # Direct post
    python post.py --text "tweet" --image path/to.png  # Direct post with image
    python post.py --queue                              # Post all ready drafts from queue/approved/
"""

import os
import sys
import argparse
import re
from datetime import datetime
from pathlib import Path

import tweepy
from dotenv import load_dotenv

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent
ENV_PATH = SCRIPT_DIR / ".env"
QUEUE_DIR = SCRIPT_DIR / "queue" / "approved"
POSTED_DIR = SCRIPT_DIR / "queue" / "posted"
RESULTS_FILE = SCRIPT_DIR / "results.tsv"

# Load environment
load_dotenv(ENV_PATH)


def get_client() -> tweepy.Client:
    """Returns a tweepy.Client using OAuth 1.0a user context."""
    return tweepy.Client(
        consumer_key=os.getenv("TWITTER_API_KEY"),
        consumer_secret=os.getenv("TWITTER_API_SECRET"),
        access_token=os.getenv("TWITTER_ACCESS_TOKEN"),
        access_token_secret=os.getenv("TWITTER_ACCESS_TOKEN_SECRET"),
    )


def get_v1_api() -> tweepy.API:
    """Returns a tweepy.API (v1.1) for media uploads."""
    auth = tweepy.OAuth1UserHandler(
        consumer_key=os.getenv("TWITTER_API_KEY"),
        consumer_secret=os.getenv("TWITTER_API_SECRET"),
        access_token=os.getenv("TWITTER_ACCESS_TOKEN"),
        access_token_secret=os.getenv("TWITTER_ACCESS_TOKEN_SECRET"),
    )
    return tweepy.API(auth)


def parse_draft(filepath: Path) -> dict:
    """
    Parses a draft markdown file with YAML-like frontmatter.

    Expected format:
        ---
        type: evidence
        template: quiet-data-drop
        pillar: evidence
        topic: "some topic"
        scheduled: 2026-03-20 07:30
        ---

        ## Tweet

        The tweet text here.

        ## Image

        path/to/image.png
    """
    content = filepath.read_text(encoding="utf-8")

    draft = {
        "type": "",
        "template": "",
        "pillar": "",
        "topic": "",
        "scheduled": "",
        "text": "",
        "image": None,
        "filename": filepath.name,
    }

    # Parse frontmatter
    fm_match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if fm_match:
        frontmatter = fm_match.group(1)
        for line in frontmatter.strip().split("\n"):
            if ":" in line:
                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key in draft:
                    draft[key] = value
        body = content[fm_match.end():]
    else:
        body = content

    # Parse ## Tweet section
    tweet_match = re.search(r"## Tweet\s*\n(.*?)(?=\n## |\Z)", body, re.DOTALL)
    if tweet_match:
        draft["text"] = tweet_match.group(1).strip()

    # Parse ## Image section
    image_match = re.search(r"## Image\s*\n(.*?)(?=\n## |\Z)", body, re.DOTALL)
    if image_match:
        image_path = image_match.group(1).strip()
        if image_path:
            # Resolve relative to script dir
            resolved = SCRIPT_DIR / image_path
            if resolved.exists():
                draft["image"] = str(resolved)
            else:
                print(f"  Warning: image not found at {resolved}")

    return draft


def post_tweet(client: tweepy.Client, text: str, image_path: str = None) -> dict:
    """
    Posts a tweet, optionally with an image.

    Returns dict with tweet_id and status.
    """
    if len(text) > 280:
        print(f"  Error: tweet is {len(text)} chars (max 280). Truncating is not allowed.")
        return {"tweet_id": None, "status": "error_too_long"}

    if not image_path:
        print(f"  Error: no image attached. Every tweet must have a screenshot.")
        return {"tweet_id": None, "status": "error_no_image"}

    if not Path(image_path).exists():
        print(f"  Error: image not found at {image_path}")
        return {"tweet_id": None, "status": "error_image_missing"}

    media_ids = None
    if image_path:
        try:
            v1_api = get_v1_api()
            media = v1_api.media_upload(filename=image_path)
            media_ids = [media.media_id]
            print(f"  Uploaded media: {media.media_id}")
        except tweepy.TweepyException as e:
            print(f"  Warning: media upload failed ({e}), posting without image.")
            media_ids = None

    try:
        response = client.create_tweet(text=text, media_ids=media_ids)
        tweet_id = response.data["id"]
        print(f"  Posted tweet: {tweet_id}")
        return {"tweet_id": tweet_id, "status": "posted"}
    except tweepy.TooManyRequests:
        print("  Error: rate limited. Try again later.")
        return {"tweet_id": None, "status": "rate_limited"}
    except tweepy.TweepyException as e:
        print(f"  Error posting tweet: {e}")
        return {"tweet_id": None, "status": f"error_{e}"}


def log_to_results(draft: dict, tweet_id: str, status: str):
    """Appends a row to results.tsv."""
    now = datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M")

    content_preview = draft.get("text", "")[:80].replace("\t", " ").replace("\n", " ")
    image = draft.get("image", "") or ""

    row = "\t".join([
        date_str,
        time_str,
        str(tweet_id or ""),
        draft.get("type", ""),
        draft.get("template", ""),
        draft.get("pillar", ""),
        draft.get("topic", ""),
        content_preview,
        image,
        status,
        "",  # metrics_impressions
        "",  # metrics_likes
        "",  # metrics_rts
        "",  # metrics_quotes
        "",  # metrics_replies
        "",  # metrics_profile_clicks
        "",  # metrics_link_clicks
        "",  # metrics_engagement_rate
        "",  # metrics_follower_delta
        "",  # notes
    ])

    with open(RESULTS_FILE, "a", encoding="utf-8") as f:
        f.write(row + "\n")

    print(f"  Logged to results.tsv")


def get_ready_drafts() -> list:
    """
    Returns list of draft file paths from queue/approved/
    where the filename timestamp <= now.
    """
    if not QUEUE_DIR.exists():
        return []

    now = datetime.now()
    ready = []

    for f in sorted(QUEUE_DIR.glob("*.md")):
        # Parse timestamp from filename: YYYY-MM-DD_HH-MM_type.md
        match = re.match(r"(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2})_", f.name)
        if match:
            date_str = match.group(1)
            time_str = match.group(2).replace("-", ":")
            try:
                scheduled = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
                if scheduled <= now:
                    ready.append(f)
            except ValueError:
                print(f"  Warning: could not parse timestamp from {f.name}, skipping.")
        else:
            # No timestamp in filename — post immediately
            ready.append(f)

    return ready


def move_to_posted(filepath: Path):
    """Moves a draft from approved/ to posted/."""
    POSTED_DIR.mkdir(parents=True, exist_ok=True)
    dest = POSTED_DIR / filepath.name
    filepath.rename(dest)
    print(f"  Moved to posted/: {filepath.name}")


def post_all_ready():
    """Posts all ready drafts from the approved queue."""
    drafts = get_ready_drafts()

    if not drafts:
        print("No ready drafts in queue/approved/.")
        return

    print(f"Found {len(drafts)} ready draft(s).")
    client = get_client()

    for filepath in drafts:
        print(f"\nProcessing: {filepath.name}")
        draft = parse_draft(filepath)

        if not draft["text"]:
            print(f"  Skipping: no tweet text found in {filepath.name}")
            continue

        result = post_tweet(client, draft["text"], draft.get("image"))
        log_to_results(draft, result["tweet_id"], result["status"])

        if result["status"] == "posted":
            move_to_posted(filepath)
        elif result["status"] == "rate_limited":
            print("  Stopping queue processing due to rate limit.")
            break


def post_single(text: str, image_path: str = None):
    """Posts a single tweet directly (not from queue)."""
    client = get_client()

    draft = {
        "type": "direct",
        "template": "direct",
        "pillar": "",
        "topic": "",
        "text": text,
        "image": image_path,
    }

    result = post_tweet(client, text, image_path)
    log_to_results(draft, result["tweet_id"], result["status"])


def main():
    parser = argparse.ArgumentParser(description="Razzle Twitter Autoposter")
    parser.add_argument("--text", type=str, help="Tweet text for direct posting")
    parser.add_argument("--image", type=str, help="Image path for direct posting")
    parser.add_argument("--queue", action="store_true", help="Post all ready drafts from queue/approved/")

    args = parser.parse_args()

    if args.text:
        post_single(args.text, args.image)
    elif args.queue:
        post_all_ready()
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
