#!/usr/bin/env python3
"""
Razzle Twitter Scheduler

Posts ONE tweet every 2 hours from queue/approved/.
Takes the oldest ready draft, posts it, waits 2 hours, repeats.

Usage:
    python scheduler.py
    python scheduler.py --interval 7200   # custom interval in seconds (default 2h)

Stop with Ctrl+C.
"""

import time
import sys
import argparse
from datetime import datetime
from pathlib import Path

# Import from post.py in the same directory
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from post import get_ready_drafts, parse_draft, post_tweet, get_client, log_to_results, move_to_posted, QUEUE_DIR, SCRIPT_DIR

DEFAULT_INTERVAL = 7200  # 2 hours in seconds
LOW_QUEUE_THRESHOLD = 10  # warn when fewer than this many drafts remain


def count_pending_drafts() -> int:
    """Counts all .md files in queue/approved/ (not just ready ones)."""
    if not QUEUE_DIR.exists():
        return 0
    return len(list(QUEUE_DIR.glob("*.md")))


def log(message: str):
    """Prints a timestamped log message."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")


def post_one() -> bool:
    """Posts the single oldest ready draft. Returns True if something was posted."""
    ready = get_ready_drafts()
    if not ready:
        return False

    # Take only the first (oldest) draft
    filepath = ready[0]
    log(f"Posting: {filepath.name}")
    draft = parse_draft(filepath)

    if not draft["text"]:
        log(f"  Skipping: no tweet text found in {filepath.name}")
        return False

    client = get_client()
    result = post_tweet(client, draft["text"], draft.get("image"))
    log_to_results(draft, result["tweet_id"], result["status"])

    if result["status"] == "posted":
        move_to_posted(filepath)
        return True
    elif result["status"] == "rate_limited":
        log("  Rate limited. Will retry next cycle.")
        return False
    elif result["status"] in ("error_no_image", "error_image_missing"):
        log(f"  SKIPPED: {result['status']}. Removing from queue — every tweet needs a screenshot.")
        # Move to rejected so Creator can learn
        rejected_dir = SCRIPT_DIR / "queue" / "rejected"
        rejected_dir.mkdir(parents=True, exist_ok=True)
        filepath.rename(rejected_dir / filepath.name)
        return False
    else:
        log(f"  Failed: {result['status']}. Leaving in queue for retry.")
        return False


def run_scheduler(interval: int):
    """Main scheduler loop. Posts one tweet per interval."""
    hours = interval / 3600
    log(f"Razzle scheduler started. Posting 1 tweet every {hours:.1f} hours.")
    log(f"Queue directory: {QUEUE_DIR}")
    log("Press Ctrl+C to stop.\n")

    while True:
        try:
            # Check queue health
            pending = count_pending_drafts()
            ready = get_ready_drafts()

            log(f"Queue health: {pending} pending, {len(ready)} ready to post.")

            if pending < LOW_QUEUE_THRESHOLD:
                log(f"WARNING: Only {pending} draft(s) remaining. Run the Creator agent to generate more.")

            if pending == 0:
                log("CRITICAL: Queue empty. No content to post. Run Creator + Reviewer agents.")

            # Post ONE draft
            if ready:
                posted = post_one()
                if posted:
                    remaining = count_pending_drafts()
                    log(f"Posted successfully. {remaining} drafts remaining in queue.")
                else:
                    log("Nothing posted this cycle.")
            else:
                log("No drafts ready to post.")

            # Wait for next cycle
            next_post = datetime.now().timestamp() + interval
            next_time = datetime.fromtimestamp(next_post).strftime("%H:%M")
            log(f"Next post at ~{next_time} ({hours:.1f}h from now).\n")
            time.sleep(interval)

        except KeyboardInterrupt:
            log("\nScheduler stopped by user.")
            sys.exit(0)
        except Exception as e:
            log(f"Error during check: {e}")
            log(f"Retrying in {hours:.1f} hours.\n")
            time.sleep(interval)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Razzle Twitter Scheduler")
    parser.add_argument("--interval", type=int, default=DEFAULT_INTERVAL,
                        help="Seconds between posts (default: 7200 = 2 hours)")
    args = parser.parse_args()
    run_scheduler(args.interval)
