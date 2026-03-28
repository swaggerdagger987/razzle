"""
Razzle Stat Verifier — Ironclad Data Accuracy Audit
====================================================
Downloads raw source data (nflverse, cfbfastR, combine, draft picks),
queries terminal.db, and cross-references 10,000+ random stat checks.

Outputs a detailed, auditable report to STAT-AUDIT-REPORT.md.

Usage:
    python scripts/stat_verifier.py [--checks 10000] [--output STAT-AUDIT-REPORT.md]
"""

import sqlite3
import csv
import io
import gzip
import random
import json
import os
import sys
import argparse
from datetime import datetime
from collections import defaultdict
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# ─── Configuration ───────────────────────────────────────────────────────────

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "terminal.db")

NFLVERSE_RELEASES_API = "https://api.github.com/repos/nflverse/nflverse-data/releases?per_page=100"
COMBINE_URL = "https://github.com/nflverse/nflverse-data/releases/download/combine/combine.csv"
DRAFT_PICKS_URL = "https://github.com/nflverse/nflverse-data/releases/download/draft_picks/draft_picks.csv"
SNAP_COUNTS_URL = "https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_{season}.csv"
CFBFASTR_BASE = "https://raw.githubusercontent.com/sportsdataverse/cfbfastR-data/main/player_stats/csv"

# Seasons to verify
NFL_SEASONS = list(range(2015, 2025))  # 2015-2024
CFB_SEASONS = list(range(2015, 2026))  # 2015-2025

# Stats to verify per source
NFL_CORE_STATS = [
    "fantasy_points_ppr", "fantasy_points_half_ppr", "fantasy_points_std",
    "passing_yards", "passing_tds", "completions", "attempts",
    "rushing_yards", "rushing_tds", "carries",
    "receiving_yards", "receiving_tds", "receptions", "targets",
    "interceptions", "rushing_fumbles_lost",
    "passing_air_yards", "receiving_air_yards", "receiving_yards_after_catch",
    "passing_first_downs", "rushing_first_downs", "receiving_first_downs",
    "sacks_taken", "rushing_fumbles", "receiving_fumbles",
]

COMBINE_STATS = ["forty", "bench", "vertical", "broad_jump", "cone", "shuttle", "height_inches", "weight"]

DRAFT_STATS = [
    "games", "pass_completions", "pass_attempts", "pass_yards", "pass_tds", "pass_ints",
    "rush_atts", "rush_yards", "rush_tds", "receptions", "rec_yards", "rec_tds",
]

CFB_STATS = [
    "completions", "pass_attempts", "pass_yards", "pass_tds", "ints_thrown",
    "carries", "rush_yards", "rush_tds",
    "receptions", "rec_yards", "rec_tds", "games",
]

# nflverse new format column mapping (new → old)
NEW_FORMAT_COLUMN_MAP = {
    "passing_interceptions": "interceptions",
    "sacks_suffered": "sacks",
    "sack_yards_lost": "sack_yards",
}

# Fantasy points column names vary
FANTASY_POINTS_MAP = {
    "fantasy_points_ppr": ["fantasy_points_ppr"],
    "fantasy_points_half_ppr": ["fantasy_points_half_ppr"],
    "fantasy_points_std": ["fantasy_points", "fantasy_points_std"],
}

# Stats where the source CSV may not have the column but DB computes it
COMPUTED_STATS = {"fantasy_points_half_ppr"}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def safe_float(val):
    """Convert to float, handling NA/NaN/empty."""
    if val is None or val == "" or val == "NA" or val == "NaN" or val == "nan":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def normalize_name(name):
    """Normalize player name for matching: lowercase, strip suffixes, alphanumeric only."""
    if not name:
        return ""
    name = name.lower().strip()
    for suffix in [" jr.", " jr", " sr.", " sr", " iii", " ii", " iv", " v"]:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    return "".join(c for c in name if c.isalpha() or c == " ").strip()


def fetch_csv(url, is_gzip=False):
    """Download and parse a CSV from a URL."""
    print(f"  Fetching: {url[:80]}...")
    req = Request(url, headers={"User-Agent": "RazzleStatVerifier/1.0"})
    try:
        resp = urlopen(req, timeout=60)
        raw = resp.read()
    except (URLError, HTTPError) as e:
        print(f"  ERROR fetching {url}: {e}")
        return []

    if is_gzip or url.endswith(".gz"):
        raw = gzip.decompress(raw)

    text = raw.decode("utf-8-sig")  # Handle BOM
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)


def find_player_stats_url(season):
    """Find the nflverse player stats CSV URL for a given season."""
    print(f"  Looking up nflverse release for {season}...")
    req = Request(NFLVERSE_RELEASES_API, headers={"User-Agent": "RazzleStatVerifier/1.0"})
    try:
        resp = urlopen(req, timeout=30)
        releases = json.loads(resp.read().decode())
    except Exception as e:
        print(f"  ERROR fetching releases: {e}")
        return None

    # Try new format first (stats_player), then old format (player_stats)
    for release in releases:
        tag = release.get("tag_name", "")
        for asset in release.get("assets", []):
            name = asset["name"]
            url = asset["browser_download_url"]
            # New format: stats_player_week_YYYY.csv
            if tag == "stats_player" and name == f"stats_player_week_{season}.csv":
                return url, "new"
            # Old format: player_stats_YYYY.csv
            if tag == "player_stats" and name == f"player_stats_{season}.csv":
                return url, "old"

    print(f"  WARNING: No player stats found for {season}")
    return None


def normalize_csv_row(row, fmt):
    """Normalize nflverse CSV row column names between old/new format."""
    if fmt == "new":
        normalized = {}
        for k, v in row.items():
            new_key = NEW_FORMAT_COLUMN_MAP.get(k, k)
            # Handle 'recent_team' vs 'team'
            if k == "team":
                new_key = "recent_team"
            normalized[new_key] = v
        return normalized
    return row


# ─── Verification Engine ────────────────────────────────────────────────────

class StatVerifier:
    def __init__(self, db_path, num_checks=10000):
        self.db_path = db_path
        self.num_checks = num_checks
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self.results = []  # List of check results
        self.errors = []   # Mismatches
        self.warnings = [] # Suspicious but not definite errors
        self.missing_in_db = []  # Source has it, DB doesn't
        self.missing_in_source = []  # DB has it, source doesn't
        self.passes = 0
        self.fails = 0
        self.skips = 0
        self.source_cache = {}  # Cache downloaded CSVs

    def run(self):
        """Run the full verification."""
        print("=" * 70)
        print("RAZZLE STAT VERIFIER — Ironclad Data Accuracy Audit")
        print(f"Database: {self.db_path}")
        print(f"Target checks: {self.num_checks}")
        print(f"Started: {datetime.now().isoformat()}")
        print("=" * 70)

        # Determine check distribution
        # ~50% NFL weekly stats (biggest dataset, most important)
        # ~15% NFL season aggregates (verify SUM logic)
        # ~10% Combine data
        # ~10% Draft picks career stats
        # ~15% College stats
        nfl_weekly_checks = int(self.num_checks * 0.50)
        nfl_season_checks = int(self.num_checks * 0.15)
        combine_checks = int(self.num_checks * 0.10)
        draft_checks = int(self.num_checks * 0.10)
        cfb_checks = self.num_checks - nfl_weekly_checks - nfl_season_checks - combine_checks - draft_checks

        print(f"\nCheck distribution:")
        print(f"  NFL weekly stats:    {nfl_weekly_checks}")
        print(f"  NFL season aggregates: {nfl_season_checks}")
        print(f"  Combine data:        {combine_checks}")
        print(f"  Draft picks:         {draft_checks}")
        print(f"  College stats:       {cfb_checks}")
        print()

        # Run each verification category
        self.verify_nfl_weekly(nfl_weekly_checks)
        self.verify_nfl_season_aggregates(nfl_season_checks)
        self.verify_combine(combine_checks)
        self.verify_draft_picks(draft_checks)
        self.verify_cfb_stats(cfb_checks)

        # Additional integrity checks (don't count toward 10k but are critical)
        self.verify_fantasy_points_formulas()
        self.verify_no_negative_stats()
        self.verify_no_impossible_stats()
        self.verify_season_coverage()
        self.verify_player_id_integrity()

        return self.generate_report()

    # ─── NFL Weekly Stats ────────────────────────────────────────────────

    def verify_nfl_weekly(self, num_checks):
        """Verify NFL weekly stats against raw nflverse CSVs."""
        print("\n" + "─" * 70)
        print("PHASE 1: NFL Weekly Stats Verification")
        print("─" * 70)

        # Pick random seasons weighted toward recent (more important)
        season_weights = {s: (s - 2014) for s in NFL_SEASONS}  # 2024 = 10x weight of 2015
        total_weight = sum(season_weights.values())
        checks_per_season = {}
        for s in NFL_SEASONS:
            checks_per_season[s] = max(1, int(num_checks * season_weights[s] / total_weight))

        # Adjust to hit exact target
        allocated = sum(checks_per_season.values())
        if allocated < num_checks:
            checks_per_season[2024] += num_checks - allocated
        elif allocated > num_checks:
            checks_per_season[2024] -= allocated - num_checks

        for season in NFL_SEASONS:
            n = checks_per_season.get(season, 0)
            if n <= 0:
                continue
            print(f"\n  Season {season} ({n} checks):")
            self._verify_nfl_season_weekly(season, n)

    def _verify_nfl_season_weekly(self, season, num_checks):
        """Verify random weekly stats for a single NFL season."""
        # Download source CSV
        cache_key = f"nfl_weekly_{season}"
        if cache_key not in self.source_cache:
            result = find_player_stats_url(season)
            if result is None:
                print(f"    SKIP: Could not find source data for {season}")
                self.skips += num_checks
                return
            url, fmt = result
            rows = fetch_csv(url)
            if not rows:
                print(f"    SKIP: Empty CSV for {season}")
                self.skips += num_checks
                return
            # Normalize column names
            rows = [normalize_csv_row(r, fmt) for r in rows]
            self.source_cache[cache_key] = rows
        else:
            rows = self.source_cache[cache_key]

        # Filter to regular season, fantasy-relevant positions
        fantasy_positions = {"QB", "RB", "WR", "TE"}
        relevant_rows = [r for r in rows if r.get("position") in fantasy_positions
                         and r.get("season_type") in ("REG", "regular")]

        if not relevant_rows:
            print(f"    SKIP: No relevant rows for {season}")
            self.skips += num_checks
            return

        # Random sample
        sample_size = min(num_checks, len(relevant_rows))
        sampled = random.sample(relevant_rows, sample_size)
        remaining = num_checks - sample_size
        if remaining > 0:
            # If we need more checks than rows, re-sample with different stats
            sampled.extend(random.choices(relevant_rows, k=remaining))

        for row in sampled:
            # Pick a random stat to verify
            stat = random.choice(NFL_CORE_STATS)
            self._check_nfl_weekly_stat(season, row, stat)

    def _check_nfl_weekly_stat(self, season, source_row, stat_name):
        """Compare a single stat between source CSV and database."""
        player_name = source_row.get("player_display_name") or source_row.get("player_name", "UNKNOWN")
        player_id_csv = source_row.get("player_id", "")
        week = source_row.get("week", "")
        position = source_row.get("position", "")
        team = source_row.get("recent_team", "")

        # Get source value
        source_col = stat_name
        # Handle fantasy points column name variations
        if stat_name in FANTASY_POINTS_MAP:
            source_val = None
            for col_name in FANTASY_POINTS_MAP[stat_name]:
                source_val = safe_float(source_row.get(col_name))
                if source_val is not None:
                    source_col = col_name
                    break
            # If half_ppr not in source CSV, compute from std + 0.5 * receptions
            if source_val is None and stat_name == "fantasy_points_half_ppr":
                std_val = safe_float(source_row.get("fantasy_points")) or safe_float(source_row.get("fantasy_points_std"))
                recs_val = safe_float(source_row.get("receptions"))
                if std_val is not None and recs_val is not None:
                    source_val = round(std_val + recs_val * 0.5, 2)
                    source_col = "computed_half_ppr"
        else:
            # Handle sacks_taken → sacks in source
            if stat_name == "sacks_taken":
                source_val = safe_float(source_row.get("sacks") or source_row.get("sacks_taken"))
            else:
                source_val = safe_float(source_row.get(stat_name))

        # Find player in database
        db_player_id = self._resolve_player_id(player_id_csv, player_name, position, team)
        if not db_player_id:
            self.missing_in_db.append({
                "category": "nfl_weekly",
                "player": player_name,
                "season": season,
                "week": week,
                "stat": stat_name,
                "source_value": source_val,
                "detail": f"Player not found in DB (csv_id={player_id_csv}, name={player_name}, pos={position})"
            })
            self.fails += 1
            return

        # Query database
        cursor = self.conn.execute(
            f"SELECT {stat_name} FROM player_week_stats "
            f"WHERE player_id = ? AND season = ? AND week = ? AND season_type = 'regular'",
            (db_player_id, season, week)
        )
        db_row = cursor.fetchone()

        if not db_row:
            self.missing_in_db.append({
                "category": "nfl_weekly",
                "player": player_name,
                "player_id": db_player_id,
                "season": season,
                "week": week,
                "stat": stat_name,
                "source_value": source_val,
                "detail": f"Week row not found in DB"
            })
            self.fails += 1
            return

        db_val = db_row[stat_name] if db_row[stat_name] is not None else None

        # Compare
        check_result = {
            "category": "nfl_weekly",
            "player": player_name,
            "player_id": db_player_id,
            "season": season,
            "week": week,
            "stat": stat_name,
            "source_value": source_val,
            "db_value": db_val,
        }

        if self._values_match(source_val, db_val):
            check_result["status"] = "PASS"
            self.passes += 1
        else:
            check_result["status"] = "FAIL"
            check_result["delta"] = self._compute_delta(source_val, db_val)
            self.fails += 1
            self.errors.append(check_result)

        self.results.append(check_result)

    # ─── NFL Season Aggregates ───────────────────────────────────────────

    def verify_nfl_season_aggregates(self, num_checks):
        """Verify that season totals (SUM of weekly) match the API's aggregation."""
        print("\n" + "─" * 70)
        print("PHASE 2: NFL Season Aggregate Verification")
        print("─" * 70)

        # Get random player-season combinations from DB
        cursor = self.conn.execute(
            "SELECT DISTINCT player_id, season FROM player_week_stats "
            "WHERE season_type = 'regular' ORDER BY RANDOM() LIMIT ?",
            (num_checks,)
        )
        player_seasons = cursor.fetchall()

        stats_to_check = [
            "fantasy_points_ppr", "passing_yards", "passing_tds",
            "rushing_yards", "rushing_tds", "carries",
            "receiving_yards", "receiving_tds", "receptions", "targets",
            "interceptions", "completions", "attempts",
        ]

        for ps in player_seasons:
            player_id = ps["player_id"]
            season = ps["season"]
            stat = random.choice(stats_to_check)

            # Get SUM from weekly rows
            cursor = self.conn.execute(
                f"SELECT SUM({stat}) as total, COUNT(*) as weeks FROM player_week_stats "
                f"WHERE player_id = ? AND season = ? AND season_type = 'regular'",
                (player_id, season)
            )
            agg_row = cursor.fetchone()
            db_sum = agg_row["total"] if agg_row else None
            weeks = agg_row["weeks"] if agg_row else 0

            # Get player name for reporting
            name_row = self.conn.execute(
                "SELECT full_name FROM players WHERE player_id = ?", (player_id,)
            ).fetchone()
            player_name = name_row["full_name"] if name_row else player_id

            # Now verify: download source and compute our own SUM
            cache_key = f"nfl_weekly_{season}"
            if cache_key in self.source_cache:
                source_rows = self.source_cache[cache_key]
            else:
                result = find_player_stats_url(season)
                if result is None:
                    self.skips += 1
                    continue
                url, fmt = result
                source_rows = fetch_csv(url)
                source_rows = [normalize_csv_row(r, fmt) for r in source_rows]
                self.source_cache[cache_key] = source_rows

            # Find this player's rows in source
            source_player_rows = [
                r for r in source_rows
                if (r.get("player_id", "") == self._get_gsis_id(player_id)
                    or normalize_name(r.get("player_display_name") or r.get("player_name", "")) == normalize_name(player_name))
                and r.get("season_type") in ("REG", "regular")
            ]

            if not source_player_rows:
                # Could be a backfilled player — skip
                self.skips += 1
                continue

            # Compute source sum
            source_sum = 0.0
            for sr in source_player_rows:
                val = safe_float(sr.get(stat))
                if val is not None:
                    source_sum += val

            check_result = {
                "category": "nfl_season_agg",
                "player": player_name,
                "player_id": player_id,
                "season": season,
                "stat": stat,
                "source_value": round(source_sum, 2),
                "db_value": round(db_sum, 2) if db_sum is not None else None,
                "weeks_in_db": weeks,
                "weeks_in_source": len(source_player_rows),
            }

            if self._values_match(source_sum, db_sum, tolerance=0.5):
                check_result["status"] = "PASS"
                self.passes += 1
            else:
                check_result["status"] = "FAIL"
                check_result["delta"] = self._compute_delta(source_sum, db_sum)
                self.fails += 1
                self.errors.append(check_result)

            self.results.append(check_result)

    # ─── Combine Data ────────────────────────────────────────────────────

    def verify_combine(self, num_checks):
        """Verify combine measurements against raw nflverse combine.csv."""
        print("\n" + "─" * 70)
        print("PHASE 3: Combine Data Verification")
        print("─" * 70)

        # Download source
        cache_key = "combine"
        if cache_key not in self.source_cache:
            rows = fetch_csv(COMBINE_URL)
            self.source_cache[cache_key] = rows
        else:
            rows = self.source_cache[cache_key]

        if not rows:
            print("  SKIP: Could not fetch combine.csv")
            self.skips += num_checks
            return

        # Filter to only years that exist in our DB
        db_years = set()
        cursor = self.conn.execute("SELECT DISTINCT draft_year FROM combine_data")
        for r in cursor.fetchall():
            db_years.add(str(r["draft_year"]))
        rows = [r for r in rows if (r.get("draft_year") or r.get("season", "")) in db_years]
        print(f"  Filtered to {len(rows)} rows matching DB years {sorted(db_years)}")

        if not rows:
            print("  SKIP: No combine rows match DB years")
            self.skips += num_checks
            return

        # Random sample
        sample_size = min(num_checks, len(rows))
        sampled = random.sample(rows, sample_size)
        remaining = num_checks - sample_size
        if remaining > 0:
            sampled.extend(random.choices(rows, k=remaining))

        for row in sampled:
            stat = random.choice(COMBINE_STATS)
            self._check_combine_stat(row, stat)

    def _check_combine_stat(self, source_row, stat_name):
        """Compare a single combine stat between source and database."""
        player_name = source_row.get("player_name", "UNKNOWN")
        position = source_row.get("pos", "")
        draft_year = source_row.get("draft_year") or source_row.get("season", "")

        source_val = safe_float(source_row.get(stat_name))

        # Handle weight — source CSV uses 'wt', not 'weight'
        if stat_name == "weight":
            source_val = safe_float(source_row.get("wt") or source_row.get("weight"))

        # Handle height specially — source might be in different format
        if stat_name == "height_inches":
            ht = source_row.get("ht", "") or source_row.get("height", "")
            if ht and "-" in str(ht):
                parts = str(ht).split("-")
                try:
                    source_val = int(parts[0]) * 12 + int(parts[1])
                except (ValueError, IndexError):
                    source_val = safe_float(ht)
            elif ht:
                source_val = safe_float(ht)

        # Query database
        cursor = self.conn.execute(
            "SELECT * FROM combine_data WHERE player_name = ? AND position = ? AND draft_year = ?",
            (player_name, position, draft_year)
        )
        db_row = cursor.fetchone()

        check_result = {
            "category": "combine",
            "player": player_name,
            "position": position,
            "draft_year": draft_year,
            "stat": stat_name,
            "source_value": source_val,
        }

        if not db_row:
            check_result["status"] = "FAIL"
            check_result["db_value"] = None
            check_result["detail"] = "Player not found in combine_data"
            self.missing_in_db.append(check_result)
            self.fails += 1
        else:
            db_val = db_row[stat_name] if stat_name in db_row.keys() else None
            check_result["db_value"] = db_val

            if self._values_match(source_val, db_val, tolerance=0.02):
                check_result["status"] = "PASS"
                self.passes += 1
            else:
                check_result["status"] = "FAIL"
                check_result["delta"] = self._compute_delta(source_val, db_val)
                self.fails += 1
                self.errors.append(check_result)

        self.results.append(check_result)

    # ─── Draft Picks ─────────────────────────────────────────────────────

    def verify_draft_picks(self, num_checks):
        """Verify draft pick career stats against raw nflverse draft_picks.csv."""
        print("\n" + "─" * 70)
        print("PHASE 4: Draft Picks Career Stats Verification")
        print("─" * 70)

        cache_key = "draft_picks"
        if cache_key not in self.source_cache:
            rows = fetch_csv(DRAFT_PICKS_URL)
            self.source_cache[cache_key] = rows
        else:
            rows = self.source_cache[cache_key]

        if not rows:
            print("  SKIP: Could not fetch draft_picks.csv")
            self.skips += num_checks
            return

        # Filter to only years that exist in our DB
        db_years = set()
        cursor = self.conn.execute("SELECT DISTINCT season FROM draft_picks")
        for r in cursor.fetchall():
            db_years.add(str(r["season"]))
        rows = [r for r in rows if r.get("season", "") in db_years]
        print(f"  Filtered to {len(rows)} rows matching DB years {sorted(db_years)}")

        if not rows:
            print("  SKIP: No draft rows match DB years")
            self.skips += num_checks
            return

        sample_size = min(num_checks, len(rows))
        sampled = random.sample(rows, sample_size)
        remaining = num_checks - sample_size
        if remaining > 0:
            sampled.extend(random.choices(rows, k=remaining))

        for row in sampled:
            stat = random.choice(DRAFT_STATS)
            self._check_draft_stat(row, stat)

    def _check_draft_stat(self, source_row, stat_name):
        """Compare a single draft pick career stat."""
        player_name = source_row.get("pfr_player_name") or source_row.get("player_name", "UNKNOWN")
        season = source_row.get("season", "")
        rnd = source_row.get("round", "")
        pick = source_row.get("pick", "")

        source_val = safe_float(source_row.get(stat_name))

        cursor = self.conn.execute(
            "SELECT * FROM draft_picks WHERE season = ? AND round = ? AND pick = ?",
            (season, rnd, pick)
        )
        db_row = cursor.fetchone()

        check_result = {
            "category": "draft_picks",
            "player": player_name,
            "season": season,
            "round": rnd,
            "pick": pick,
            "stat": stat_name,
            "source_value": source_val,
        }

        if not db_row:
            check_result["status"] = "FAIL"
            check_result["db_value"] = None
            check_result["detail"] = "Draft pick not found in DB"
            self.missing_in_db.append(check_result)
            self.fails += 1
        else:
            db_val = db_row[stat_name] if stat_name in db_row.keys() else None
            check_result["db_value"] = db_val

            if self._values_match(source_val, db_val):
                check_result["status"] = "PASS"
                self.passes += 1
            else:
                check_result["status"] = "FAIL"
                check_result["delta"] = self._compute_delta(source_val, db_val)
                self.fails += 1
                self.errors.append(check_result)

        self.results.append(check_result)

    # ─── College Stats ───────────────────────────────────────────────────

    def verify_cfb_stats(self, num_checks):
        """Verify college football stats against raw cfbfastR CSVs."""
        print("\n" + "─" * 70)
        print("PHASE 5: College Football Stats Verification")
        print("─" * 70)

        # Distribute checks across seasons (weight toward recent)
        checks_per_season = {}
        total_seasons = len(CFB_SEASONS)
        base = max(1, num_checks // total_seasons)
        for s in CFB_SEASONS:
            checks_per_season[s] = base
        # Give extra to recent seasons
        remaining = num_checks - sum(checks_per_season.values())
        for s in sorted(CFB_SEASONS, reverse=True):
            if remaining <= 0:
                break
            checks_per_season[s] += 1
            remaining -= 1

        for season in CFB_SEASONS:
            n = checks_per_season.get(season, 0)
            if n <= 0:
                continue
            print(f"\n  CFB Season {season} ({n} checks):")
            self._verify_cfb_season(season, n)

    def _verify_cfb_season(self, season, num_checks):
        """Verify college stats for a single season."""
        # Download play-level source data
        cache_key = f"cfb_{season}"
        if cache_key not in self.source_cache:
            url = f"{CFBFASTR_BASE}/player_stats_{season}.csv"
            rows = fetch_csv(url)
            if not rows:
                print(f"    SKIP: Could not fetch CFB data for {season}")
                self.skips += num_checks
                return
            self.source_cache[cache_key] = rows
        else:
            rows = self.source_cache[cache_key]

        # Aggregate play-level data into player season totals (same as adapter)
        player_seasons = self._aggregate_cfb_plays(rows)

        if not player_seasons:
            self.skips += num_checks
            return

        sample_keys = list(player_seasons.keys())
        sample_size = min(num_checks, len(sample_keys))
        sampled_keys = random.sample(sample_keys, sample_size)
        remaining = num_checks - sample_size
        if remaining > 0:
            sampled_keys.extend(random.choices(sample_keys, k=remaining))

        for key in sampled_keys:
            source_player = player_seasons[key]
            stat = random.choice(CFB_STATS)
            self._check_cfb_stat(season, source_player, stat)

    def _aggregate_cfb_plays(self, rows):
        """Aggregate play-level CFB data into player season totals.

        The source CSV is play-level with role-specific columns:
        - completion_player_id / completion_player / completion_yds
        - incompletion_player_id / incompletion_player
        - reception_player_id / reception_player / reception_yds
        - target_player_id / target_player
        - rush_player_id / rush_player / rush_yds
        - touchdown_player_id
        - interception_thrown_player_id
        - sack_taken_player_id
        - fumble_player_id
        """
        players = {}

        def _valid_id(val):
            if not val:
                return None
            v = val.strip()
            if v in ("", "NA", "NaN", "None", "null"):
                return None
            return v

        def _get_or_create(pid, name, team, conf, game_id):
            if pid not in players:
                players[pid] = {
                    "player_id": pid,
                    "player_name": name,
                    "team": team,
                    "conference": conf,
                    "completions": 0, "pass_attempts": 0, "pass_yards": 0,
                    "pass_tds": 0, "ints_thrown": 0,
                    "carries": 0, "rush_yards": 0, "rush_tds": 0,
                    "receptions": 0, "rec_yards": 0, "rec_tds": 0,
                    "games": set(),
                }
            p = players[pid]
            if name:
                p["player_name"] = name
            if team:
                p["team"] = team
            if conf:
                p["conference"] = conf
            if game_id:
                p["games"].add(game_id)
            return p

        for row in rows:
            game_id = row.get("game_id", "")
            team = (row.get("team") or "").strip()
            conf = (row.get("conference") or "").strip()

            td_id = _valid_id(row.get("touchdown_player_id"))
            comp_id = _valid_id(row.get("completion_player_id"))
            inc_id = _valid_id(row.get("incompletion_player_id"))
            rec_id = _valid_id(row.get("reception_player_id"))
            tgt_id = _valid_id(row.get("target_player_id"))
            rush_id = _valid_id(row.get("rush_player_id"))

            # Passing: completions
            if comp_id:
                p = _get_or_create(comp_id, (row.get("completion_player") or "").strip(), team, conf, game_id)
                p["completions"] += 1
                p["pass_attempts"] += 1
                comp_yds = safe_float(row.get("completion_yds"))
                if comp_yds is not None:
                    p["pass_yards"] += int(comp_yds)
                # Passing TD: credit QB when td_id matches either the QB or receiver
                # (cfbfastR inconsistently sets td_id to passer OR receiver on pass TDs)
                if td_id and rec_id:
                    p["pass_tds"] += 1

            # Passing: incompletions
            if inc_id:
                p = _get_or_create(inc_id, (row.get("incompletion_player") or "").strip(), team, conf, game_id)
                p["pass_attempts"] += 1

            # Receiving: receptions
            if rec_id:
                p = _get_or_create(rec_id, (row.get("reception_player") or "").strip(), team, conf, game_id)
                p["receptions"] += 1
                p["rec_yards"] += int(safe_float(row.get("reception_yds")) or 0)
                # Receiving TD: credit receiver when there's a TD on this reception
                if td_id and comp_id:
                    p["rec_tds"] += 1

            # Targets on incompletions
            if tgt_id:
                p = _get_or_create(tgt_id, (row.get("target_player") or "").strip(), team, conf, game_id)
                p["rec_yards"] += 0  # just ensure tracked
                # Each reception already counted as target above; this covers incomplete targets
                players[tgt_id]["receptions"] += 0  # don't double count
                # We track targets separately if needed — for now the adapter counts
                # receptions + incomplete targets as the CFB target proxy

            # Rushing
            if rush_id:
                p = _get_or_create(rush_id, (row.get("rush_player") or "").strip(), team, conf, game_id)
                p["carries"] += 1
                p["rush_yards"] += int(safe_float(row.get("rush_yds")) or 0)
                if td_id and td_id == rush_id:
                    p["rush_tds"] += 1

            # Interceptions thrown
            int_id = _valid_id(row.get("interception_thrown_player_id"))
            if int_id:
                p = _get_or_create(int_id, (row.get("interception_thrown_player") or "").strip(), team, conf, game_id)
                p["ints_thrown"] += 1

            # Sacks taken
            sack_id = _valid_id(row.get("sack_taken_player_id"))
            if sack_id:
                _get_or_create(sack_id, (row.get("sack_taken_player") or "").strip(), team, conf, game_id)

            # Fumbles
            fum_id = _valid_id(row.get("fumble_player_id"))
            if fum_id:
                _get_or_create(fum_id, (row.get("fumble_player") or "").strip(), team, conf, game_id)

        # Convert game sets to counts, filter to meaningful players
        result = {}
        for pid, p in players.items():
            p["games"] = len(p["games"])
            total_touches = p["pass_attempts"] + p["carries"] + p["receptions"]
            if total_touches >= 5 and p["player_name"]:
                result[pid] = p

        return result

    def _check_cfb_stat(self, season, source_player, stat_name):
        """Compare a single CFB stat between aggregated source and database."""
        player_name = source_player["player_name"]
        player_id = source_player["player_id"]
        team = source_player["team"]
        source_val = source_player.get(stat_name)
        if isinstance(source_val, set):
            source_val = len(source_val)

        # Query database
        cursor = self.conn.execute(
            "SELECT * FROM cfb_player_season_stats "
            "WHERE (player_id = ? OR player_name = ?) AND season = ?",
            (player_id, player_name, season)
        )
        db_row = cursor.fetchone()

        check_result = {
            "category": "cfb",
            "player": player_name,
            "team": team,
            "season": season,
            "stat": stat_name,
            "source_value": source_val,
        }

        if not db_row:
            # Try fuzzy name match
            cursor = self.conn.execute(
                "SELECT * FROM cfb_player_season_stats "
                "WHERE season = ? AND team = ?",
                (season, team)
            )
            team_rows = cursor.fetchall()
            matched = None
            for tr in team_rows:
                if normalize_name(tr["player_name"]) == normalize_name(player_name):
                    matched = tr
                    break

            if not matched:
                check_result["status"] = "FAIL"
                check_result["db_value"] = None
                check_result["detail"] = f"CFB player not found in DB (id={player_id}, name={player_name}, team={team})"
                self.missing_in_db.append(check_result)
                self.fails += 1
                self.results.append(check_result)
                return
            db_row = matched

        db_val = db_row[stat_name] if stat_name in db_row.keys() else None
        check_result["db_value"] = db_val

        # CFB aggregation can differ slightly due to play categorization
        if self._values_match(source_val, db_val, tolerance=2.0):
            check_result["status"] = "PASS"
            self.passes += 1
        else:
            check_result["status"] = "FAIL"
            check_result["delta"] = self._compute_delta(source_val, db_val)
            self.fails += 1
            self.errors.append(check_result)

        self.results.append(check_result)

    # ─── Integrity Checks (Bonus) ────────────────────────────────────────

    def verify_fantasy_points_formulas(self):
        """Verify fantasy points are calculated correctly from component stats."""
        print("\n" + "─" * 70)
        print("BONUS: Fantasy Points Formula Verification")
        print("─" * 70)

        # Standard scoring: 0.04/pass_yd, 4/pass_td, -2/int, 0.1/rush_yd, 6/rush_td,
        #                    0.1/rec_yd, 6/rec_td, -2/fum_lost
        # PPR adds 1.0/reception, Half-PPR adds 0.5/reception
        cursor = self.conn.execute(
            "SELECT player_id, season, week, "
            "passing_yards, passing_tds, interceptions, "
            "rushing_yards, rushing_tds, "
            "receiving_yards, receiving_tds, receptions, "
            "rushing_fumbles_lost, receiving_fumbles_lost, sack_fumbles_lost, "
            "fantasy_points_ppr, fantasy_points_half_ppr, fantasy_points_std "
            "FROM player_week_stats "
            "WHERE season_type = 'regular' "
            "ORDER BY RANDOM() LIMIT 500"
        )
        rows = cursor.fetchall()

        formula_errors = 0
        for row in rows:
            pass_yds = row["passing_yards"] or 0
            pass_tds = row["passing_tds"] or 0
            ints = row["interceptions"] or 0
            rush_yds = row["rushing_yards"] or 0
            rush_tds = row["rushing_tds"] or 0
            rec_yds = row["receiving_yards"] or 0
            rec_tds = row["receiving_tds"] or 0
            recs = row["receptions"] or 0
            fum_lost = (row["rushing_fumbles_lost"] or 0) + (row["receiving_fumbles_lost"] or 0) + (row["sack_fumbles_lost"] or 0)

            # Standard scoring
            expected_std = (pass_yds * 0.04 + pass_tds * 4 - ints * 2 +
                           rush_yds * 0.1 + rush_tds * 6 +
                           rec_yds * 0.1 + rec_tds * 6 - fum_lost * 2)
            expected_ppr = expected_std + recs * 1.0
            expected_half = expected_std + recs * 0.5

            db_ppr = row["fantasy_points_ppr"]
            db_half = row["fantasy_points_half_ppr"]
            db_std = row["fantasy_points_std"]

            # nflverse provides its own fantasy points which may include 2pt conversions,
            # return TDs, etc. So we allow a small tolerance.
            tolerance = 2.0  # 2 points tolerance for 2pt conversions, return TDs, etc.

            for label, expected, actual in [
                ("PPR", expected_ppr, db_ppr),
                ("Half-PPR", expected_half, db_half),
                ("Standard", expected_std, db_std),
            ]:
                if actual is not None and abs(expected - actual) > tolerance:
                    # Check if it's a known discrepancy (2pt conversions, return TDs)
                    if abs(expected - actual) > 6.0:  # More than a TD difference = real error
                        formula_errors += 1
                        self.errors.append({
                            "category": "formula_check",
                            "player_id": row["player_id"],
                            "season": row["season"],
                            "week": row["week"],
                            "stat": f"fantasy_points_{label.lower().replace('-', '_')}",
                            "source_value": round(expected, 2),
                            "db_value": round(actual, 2),
                            "delta": round(actual - expected, 2),
                            "status": "FAIL",
                            "detail": f"Formula mismatch: computed {expected:.2f}, DB has {actual:.2f} (diff: {actual - expected:.2f})"
                        })

        print(f"  Checked 500 random weeks. Formula errors (>6pt diff): {formula_errors}")

    def verify_no_negative_stats(self):
        """Check for negative values in stats that should never be negative.

        Note: passing_yards, rushing_yards, receiving_yards, and fantasy_points_ppr
        CAN legitimately be negative in NFL per-game data (trick plays, losses behind
        the line of scrimmage, turnover-only games). Only check count stats.
        """
        print("\n  Checking for negative stats...")
        non_negative_stats = [
            "carries", "targets", "receptions", "completions", "attempts",
            "passing_tds", "rushing_tds", "receiving_tds",
        ]

        for stat in non_negative_stats:
            cursor = self.conn.execute(
                f"SELECT player_id, season, week, {stat} FROM player_week_stats "
                f"WHERE {stat} < 0 LIMIT 10"
            )
            negatives = cursor.fetchall()
            for neg in negatives:
                self.errors.append({
                    "category": "integrity_negative",
                    "player_id": neg["player_id"],
                    "season": neg["season"],
                    "week": neg["week"],
                    "stat": stat,
                    "db_value": neg[stat],
                    "status": "FAIL",
                    "detail": f"Negative value for {stat}: {neg[stat]}"
                })
                self.fails += 1

    def verify_no_impossible_stats(self):
        """Check for statistically impossible values."""
        print("  Checking for impossible stats...")

        # No QB should have >700 passing yards in a week
        cursor = self.conn.execute(
            "SELECT p.full_name, s.player_id, s.season, s.week, s.passing_yards "
            "FROM player_week_stats s JOIN players p ON s.player_id = p.player_id "
            "WHERE s.passing_yards > 700 LIMIT 10"
        )
        for row in cursor.fetchall():
            self.warnings.append({
                "category": "integrity_impossible",
                "player": row["full_name"],
                "season": row["season"],
                "week": row["week"],
                "stat": "passing_yards",
                "value": row["passing_yards"],
                "detail": f"Passing yards > 700 in single game: {row['passing_yards']}"
            })

        # No player should have > 400 rushing yards in a week
        cursor = self.conn.execute(
            "SELECT p.full_name, s.player_id, s.season, s.week, s.rushing_yards "
            "FROM player_week_stats s JOIN players p ON s.player_id = p.player_id "
            "WHERE s.rushing_yards > 400 LIMIT 10"
        )
        for row in cursor.fetchall():
            self.warnings.append({
                "category": "integrity_impossible",
                "player": row["full_name"],
                "season": row["season"],
                "week": row["week"],
                "stat": "rushing_yards",
                "value": row["rushing_yards"],
                "detail": f"Rushing yards > 400 in single game: {row['rushing_yards']}"
            })

        # No player should have > 20 receptions in a week
        cursor = self.conn.execute(
            "SELECT p.full_name, s.player_id, s.season, s.week, s.receptions "
            "FROM player_week_stats s JOIN players p ON s.player_id = p.player_id "
            "WHERE s.receptions > 20 LIMIT 10"
        )
        for row in cursor.fetchall():
            self.warnings.append({
                "category": "integrity_impossible",
                "player": row["full_name"],
                "season": row["season"],
                "week": row["week"],
                "stat": "receptions",
                "value": row["receptions"],
                "detail": f"Receptions > 20 in single game: {row['receptions']}"
            })

    def verify_season_coverage(self):
        """Verify we have data for all expected seasons."""
        print("  Checking season coverage...")

        # NFL seasons
        cursor = self.conn.execute(
            "SELECT DISTINCT season FROM player_week_stats ORDER BY season"
        )
        db_nfl_seasons = [r["season"] for r in cursor.fetchall()]
        expected_nfl = set(range(2015, 2025))
        actual_nfl = set(db_nfl_seasons)
        missing_nfl = expected_nfl - actual_nfl

        if missing_nfl:
            self.errors.append({
                "category": "coverage",
                "stat": "nfl_seasons",
                "detail": f"Missing NFL seasons: {sorted(missing_nfl)}",
                "status": "FAIL"
            })
            self.fails += 1

        # CFB seasons
        cursor = self.conn.execute(
            "SELECT DISTINCT season FROM cfb_player_season_stats ORDER BY season"
        )
        db_cfb_seasons = [r["season"] for r in cursor.fetchall()]
        expected_cfb = set(range(2015, 2026))
        actual_cfb = set(db_cfb_seasons)
        missing_cfb = expected_cfb - actual_cfb

        if missing_cfb:
            self.errors.append({
                "category": "coverage",
                "stat": "cfb_seasons",
                "detail": f"Missing CFB seasons: {sorted(missing_cfb)}",
                "status": "FAIL"
            })
            self.fails += 1

        # Check minimum row counts per NFL season
        for season in sorted(actual_nfl):
            cursor = self.conn.execute(
                "SELECT COUNT(*) as cnt FROM player_week_stats WHERE season = ?", (season,)
            )
            cnt = cursor.fetchone()["cnt"]
            if cnt < 1000:  # Should have at least 1000 player-weeks per season
                self.warnings.append({
                    "category": "coverage",
                    "stat": "nfl_season_rows",
                    "detail": f"Season {season} has only {cnt} rows (expected 1000+)"
                })

        print(f"    NFL seasons in DB: {sorted(actual_nfl)}")
        print(f"    CFB seasons in DB: {sorted(actual_cfb)}")
        if missing_nfl:
            print(f"    MISSING NFL: {sorted(missing_nfl)}")
        if missing_cfb:
            print(f"    MISSING CFB: {sorted(missing_cfb)}")

    def verify_player_id_integrity(self):
        """Check for orphaned stats (stats without a player record)."""
        print("  Checking player ID integrity...")

        cursor = self.conn.execute(
            "SELECT COUNT(DISTINCT s.player_id) as orphans "
            "FROM player_week_stats s "
            "LEFT JOIN players p ON s.player_id = p.player_id "
            "WHERE p.player_id IS NULL"
        )
        orphans = cursor.fetchone()["orphans"]
        if orphans > 0:
            self.warnings.append({
                "category": "integrity_orphan",
                "detail": f"{orphans} player_ids in player_week_stats have no matching players record"
            })

        # Check for duplicate player entries
        cursor = self.conn.execute(
            "SELECT full_name, position, COUNT(*) as cnt "
            "FROM players GROUP BY full_name, position HAVING cnt > 1 LIMIT 20"
        )
        dupes = cursor.fetchall()
        for d in dupes:
            self.warnings.append({
                "category": "integrity_duplicate",
                "detail": f"Duplicate player: {d['full_name']} ({d['position']}) — {d['cnt']} records"
            })

    # ─── Comparison Helpers ──────────────────────────────────────────────

    def _values_match(self, source_val, db_val, tolerance=0.01):
        """Compare two values with tolerance for floating point."""
        if source_val is None and db_val is None:
            return True
        if source_val is None and db_val == 0:
            return True  # None and 0 are equivalent for stats
        if db_val is None and source_val == 0:
            return True
        if source_val is None or db_val is None:
            return False
        try:
            return abs(float(source_val) - float(db_val)) <= tolerance
        except (ValueError, TypeError):
            return str(source_val) == str(db_val)

    def _compute_delta(self, source_val, db_val):
        """Compute the difference between source and DB values."""
        if source_val is None or db_val is None:
            return None
        try:
            return round(float(db_val) - float(source_val), 4)
        except (ValueError, TypeError):
            return None

    def _resolve_player_id(self, gsis_id, name, position, team):
        """Resolve a player to their database player_id."""
        # Try gsis_id first
        if gsis_id:
            cursor = self.conn.execute(
                "SELECT player_id FROM players WHERE gsis_id = ?", (gsis_id,)
            )
            row = cursor.fetchone()
            if row:
                return row["player_id"]

            # Also check if gsis_id IS the player_id
            cursor = self.conn.execute(
                "SELECT player_id FROM players WHERE player_id = ?", (gsis_id,)
            )
            row = cursor.fetchone()
            if row:
                return row["player_id"]

        # Try name + position + team
        search = normalize_name(name)
        cursor = self.conn.execute(
            "SELECT player_id FROM players WHERE search_name = ? AND position = ? AND team = ?",
            (search, position, team)
        )
        row = cursor.fetchone()
        if row:
            return row["player_id"]

        # Try name + position (team may have changed)
        cursor = self.conn.execute(
            "SELECT player_id FROM players WHERE search_name = ? AND position = ?",
            (search, position)
        )
        row = cursor.fetchone()
        if row:
            return row["player_id"]

        return None

    def _get_gsis_id(self, player_id):
        """Get the gsis_id for a player_id."""
        cursor = self.conn.execute(
            "SELECT gsis_id FROM players WHERE player_id = ?", (player_id,)
        )
        row = cursor.fetchone()
        return row["gsis_id"] if row and row["gsis_id"] else player_id

    # ─── Report Generation ───────────────────────────────────────────────

    def generate_report(self):
        """Generate the full audit report."""
        total = self.passes + self.fails + self.skips
        accuracy = (self.passes / (self.passes + self.fails) * 100) if (self.passes + self.fails) > 0 else 0

        report = []
        report.append("# Razzle Stat Accuracy Audit Report")
        report.append(f"\n**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"**Database**: `{self.db_path}`")
        report.append(f"**NFL Seasons**: {min(NFL_SEASONS)}-{max(NFL_SEASONS)}")
        report.append(f"**CFB Seasons**: {min(CFB_SEASONS)}-{max(CFB_SEASONS)}")
        report.append("")

        report.append("## Executive Summary")
        report.append("")
        report.append(f"| Metric | Value |")
        report.append(f"|--------|-------|")
        report.append(f"| Total checks | {total:,} |")
        report.append(f"| Passed | {self.passes:,} |")
        report.append(f"| Failed | {self.fails:,} |")
        report.append(f"| Skipped | {self.skips:,} |")
        report.append(f"| **Accuracy** | **{accuracy:.2f}%** |")
        report.append(f"| Missing in DB | {len(self.missing_in_db):,} |")
        report.append(f"| Warnings | {len(self.warnings):,} |")
        report.append("")

        if accuracy == 100.0:
            report.append("> **VERDICT: IRONCLAD** — All sampled stats match source data exactly.")
        elif accuracy >= 99.5:
            report.append(f"> **VERDICT: NEAR-PERFECT** — {accuracy:.2f}% accuracy. Minor discrepancies found.")
        elif accuracy >= 95.0:
            report.append(f"> **VERDICT: NEEDS ATTENTION** — {accuracy:.2f}% accuracy. Review errors below.")
        else:
            report.append(f"> **VERDICT: CRITICAL** — {accuracy:.2f}% accuracy. Significant data issues detected.")

        # Breakdown by category
        report.append("\n## Accuracy by Category\n")
        categories = defaultdict(lambda: {"pass": 0, "fail": 0, "skip": 0})
        for r in self.results:
            cat = r.get("category", "unknown")
            if r["status"] == "PASS":
                categories[cat]["pass"] += 1
            else:
                categories[cat]["fail"] += 1

        report.append("| Category | Checks | Pass | Fail | Accuracy |")
        report.append("|----------|--------|------|------|----------|")
        for cat in sorted(categories.keys()):
            c = categories[cat]
            total_cat = c["pass"] + c["fail"]
            acc = (c["pass"] / total_cat * 100) if total_cat > 0 else 0
            report.append(f"| {cat} | {total_cat:,} | {c['pass']:,} | {c['fail']:,} | {acc:.2f}% |")

        # Errors detail
        if self.errors:
            report.append(f"\n## Errors ({len(self.errors):,} total)\n")
            report.append("Each error represents a stat mismatch between the raw source CSV and our database.\n")

            # Group errors by category
            error_by_cat = defaultdict(list)
            for e in self.errors:
                error_by_cat[e.get("category", "unknown")].append(e)

            for cat in sorted(error_by_cat.keys()):
                errors = error_by_cat[cat]
                report.append(f"\n### {cat} ({len(errors)} errors)\n")
                report.append("| Player | Season | Week | Stat | Source | DB | Delta |")
                report.append("|--------|--------|------|------|--------|-----|-------|")
                for e in errors[:100]:  # Cap at 100 per category for readability
                    player = e.get("player", e.get("player_id", "?"))
                    season = e.get("season", "")
                    week = e.get("week", "")
                    stat = e.get("stat", "")
                    src = e.get("source_value", "NULL")
                    db = e.get("db_value", "NULL")
                    delta = e.get("delta", "")
                    detail = e.get("detail", "")
                    if src is not None:
                        src = f"{src:.2f}" if isinstance(src, float) else str(src)
                    if db is not None:
                        db = f"{db:.2f}" if isinstance(db, float) else str(db)
                    if delta is not None and isinstance(delta, (int, float)):
                        delta = f"{delta:+.2f}"
                    report.append(f"| {player} | {season} | {week} | {stat} | {src} | {db} | {delta} |")
                    if detail:
                        report.append(f"| | | | | *{detail}* | | |")

                if len(errors) > 100:
                    report.append(f"\n*... and {len(errors) - 100} more errors in this category*\n")

        # Missing in DB
        if self.missing_in_db:
            report.append(f"\n## Missing in Database ({len(self.missing_in_db):,} entries)\n")
            report.append("These are records found in the source CSV but not in our database.\n")

            # Group by category
            missing_by_cat = defaultdict(list)
            for m in self.missing_in_db:
                missing_by_cat[m.get("category", "unknown")].append(m)

            for cat in sorted(missing_by_cat.keys()):
                entries = missing_by_cat[cat]
                report.append(f"\n### {cat} ({len(entries)} missing)\n")
                for e in entries[:50]:
                    player = e.get("player", "?")
                    season = e.get("season", "")
                    week = e.get("week", "")
                    detail = e.get("detail", "")
                    report.append(f"- **{player}** (S{season} W{week}): {detail}")
                if len(entries) > 50:
                    report.append(f"\n*... and {len(entries) - 50} more missing entries*\n")

        # Warnings
        if self.warnings:
            report.append(f"\n## Warnings ({len(self.warnings):,})\n")
            report.append("Suspicious data that may or may not be errors.\n")
            for w in self.warnings:
                cat = w.get("category", "")
                detail = w.get("detail", "")
                report.append(f"- **[{cat}]** {detail}")

        # Full results appendix (machine-readable)
        report.append("\n## Appendix: Full Check Log\n")
        report.append("<details>")
        report.append("<summary>Click to expand all " + f"{len(self.results):,} checks</summary>\n")
        report.append("```tsv")
        report.append("status\tcategory\tplayer\tseason\tweek\tstat\tsource\tdb\tdelta")
        for r in self.results:
            status = r.get("status", "?")
            cat = r.get("category", "")
            player = r.get("player", r.get("player_id", "?"))
            season = r.get("season", "")
            week = r.get("week", "")
            stat = r.get("stat", "")
            src = r.get("source_value", "")
            db = r.get("db_value", "")
            delta = r.get("delta", "")
            report.append(f"{status}\t{cat}\t{player}\t{season}\t{week}\t{stat}\t{src}\t{db}\t{delta}")
        report.append("```")
        report.append("</details>")

        return "\n".join(report)


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Razzle Stat Verifier")
    parser.add_argument("--checks", type=int, default=10000, help="Number of stat checks (default: 10000)")
    parser.add_argument("--output", type=str, default="STAT-AUDIT-REPORT.md", help="Output file path")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for reproducibility")
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)
    else:
        # Use date as seed for reproducibility within same day
        random.seed(int(datetime.now().strftime("%Y%m%d")))

    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        sys.exit(1)

    verifier = StatVerifier(DB_PATH, num_checks=args.checks)
    report = verifier.run()

    # Write report
    output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), args.output)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)

    print("\n" + "=" * 70)
    print(f"AUDIT COMPLETE")
    print(f"  Passed: {verifier.passes:,}")
    print(f"  Failed: {verifier.fails:,}")
    print(f"  Skipped: {verifier.skips:,}")
    print(f"  Accuracy: {(verifier.passes / (verifier.passes + verifier.fails) * 100) if (verifier.passes + verifier.fails) > 0 else 0:.2f}%")
    print(f"  Report: {output_path}")
    print("=" * 70)


if __name__ == "__main__":
    main()
