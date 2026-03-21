#!/usr/bin/env python3
"""
Razzle Twitter Metrics Importer

Two modes:
    --csv path/to/analytics.csv    Parse X Analytics CSV export, match by tweet_id, update metrics
    --update TWEET_ID key=value    Manual single-tweet metric update

Usage:
    python metrics_import.py --csv ~/Downloads/tweet_activity_metrics.csv
    python metrics_import.py --update 1234567890 impressions=500 likes=12 rts=3
"""

import argparse
import csv
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
RESULTS_FILE = SCRIPT_DIR / "results.tsv"

# Column indices in results.tsv (0-indexed)
COLUMNS = [
    "date", "time_et", "tweet_id", "type", "template", "pillar", "topic",
    "content_preview", "image", "status", "metrics_impressions", "metrics_likes",
    "metrics_rts", "metrics_quotes", "metrics_replies", "metrics_profile_clicks",
    "metrics_link_clicks", "metrics_engagement_rate", "metrics_follower_delta", "notes"
]

# Mapping from short metric names to column names
METRIC_MAP = {
    "impressions": "metrics_impressions",
    "likes": "metrics_likes",
    "rts": "metrics_rts",
    "quotes": "metrics_quotes",
    "replies": "metrics_replies",
    "profile_clicks": "metrics_profile_clicks",
    "link_clicks": "metrics_link_clicks",
    "engagement_rate": "metrics_engagement_rate",
    "follower_delta": "metrics_follower_delta",
}

# Mapping from X Analytics CSV column names to our metric column names
CSV_COLUMN_MAP = {
    "impressions": "metrics_impressions",
    "likes": "metrics_likes",
    "retweets": "metrics_rts",
    "quotes": "metrics_quotes",
    "replies": "metrics_replies",
    "user profile clicks": "metrics_profile_clicks",
    "url link clicks": "metrics_link_clicks",
    "engagement rate": "metrics_engagement_rate",
}


def read_results() -> tuple:
    """
    Reads results.tsv and returns (header, rows).
    Each row is a list of strings.
    """
    if not RESULTS_FILE.exists():
        print(f"Error: {RESULTS_FILE} not found.")
        sys.exit(1)

    with open(RESULTS_FILE, "r", encoding="utf-8") as f:
        lines = f.read().strip().split("\n")

    if not lines:
        print("Error: results.tsv is empty.")
        sys.exit(1)

    header = lines[0].split("\t")
    rows = []
    for line in lines[1:]:
        if line.strip():
            rows.append(line.split("\t"))

    return header, rows


def write_results(header: list, rows: list):
    """Writes header and rows back to results.tsv."""
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        f.write("\t".join(header) + "\n")
        for row in rows:
            # Pad row to match header length
            while len(row) < len(header):
                row.append("")
            f.write("\t".join(row) + "\n")


def get_col_index(header: list, col_name: str) -> int:
    """Returns the index of a column by name."""
    try:
        return header.index(col_name)
    except ValueError:
        print(f"Error: column '{col_name}' not found in results.tsv header.")
        sys.exit(1)


def import_csv(csv_path: str):
    """
    Parses an X Analytics CSV export and updates matching rows in results.tsv.
    Matches by tweet_id.
    """
    csv_file = Path(csv_path)
    if not csv_file.exists():
        print(f"Error: CSV file not found: {csv_path}")
        sys.exit(1)

    header, rows = read_results()
    tweet_id_idx = get_col_index(header, "tweet_id")

    # Build lookup: tweet_id -> row index
    id_to_row = {}
    for i, row in enumerate(rows):
        if len(row) > tweet_id_idx and row[tweet_id_idx]:
            id_to_row[row[tweet_id_idx]] = i

    # Parse CSV
    updated = 0
    skipped = 0

    with open(csv_file, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for csv_row in reader:
            # X Analytics uses "Tweet id" as the column name
            tweet_id = csv_row.get("Tweet id", csv_row.get("tweet_id", "")).strip()

            if not tweet_id:
                skipped += 1
                continue

            if tweet_id not in id_to_row:
                skipped += 1
                continue

            row_idx = id_to_row[tweet_id]
            row = rows[row_idx]

            # Pad row if needed
            while len(row) < len(header):
                row.append("")

            # Update metrics from CSV
            for csv_col, our_col in CSV_COLUMN_MAP.items():
                csv_col_lower = csv_col.lower()
                # Find the CSV column case-insensitively
                csv_value = None
                for k, v in csv_row.items():
                    if k.lower() == csv_col_lower:
                        csv_value = v.strip()
                        break

                if csv_value is not None:
                    col_idx = get_col_index(header, our_col)
                    row[col_idx] = csv_value

            rows[row_idx] = row
            updated += 1

    write_results(header, rows)
    print(f"Updated {updated} tweet(s), skipped {skipped} (no match in results.tsv).")


def update_single(tweet_id: str, metrics: dict):
    """
    Updates metrics for a single tweet by tweet_id.
    metrics is a dict of short_name -> value.
    """
    header, rows = read_results()
    tweet_id_idx = get_col_index(header, "tweet_id")

    found = False
    for i, row in enumerate(rows):
        if len(row) > tweet_id_idx and row[tweet_id_idx] == tweet_id:
            # Pad row if needed
            while len(row) < len(header):
                row.append("")

            for short_name, value in metrics.items():
                col_name = METRIC_MAP.get(short_name)
                if not col_name:
                    print(f"  Warning: unknown metric '{short_name}', skipping.")
                    continue
                col_idx = get_col_index(header, col_name)
                row[col_idx] = str(value)
                print(f"  Set {col_name} = {value}")

            rows[i] = row
            found = True
            break

    if not found:
        print(f"Error: tweet_id '{tweet_id}' not found in results.tsv.")
        sys.exit(1)

    write_results(header, rows)
    print(f"Updated metrics for tweet {tweet_id}.")


def main():
    parser = argparse.ArgumentParser(description="Razzle Twitter Metrics Importer")
    parser.add_argument("--csv", type=str, help="Path to X Analytics CSV export")
    parser.add_argument("--update", nargs="+", metavar="ARGS",
                        help="TWEET_ID key=value key=value ...")

    args = parser.parse_args()

    if args.csv:
        import_csv(args.csv)
    elif args.update:
        if len(args.update) < 2:
            print("Usage: --update TWEET_ID key=value key=value ...")
            sys.exit(1)

        tweet_id = args.update[0]
        metrics = {}
        for pair in args.update[1:]:
            if "=" not in pair:
                print(f"Error: invalid metric format '{pair}', expected key=value")
                sys.exit(1)
            key, value = pair.split("=", 1)
            metrics[key] = value

        update_single(tweet_id, metrics)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
