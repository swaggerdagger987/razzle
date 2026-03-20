"""
Razzle Smoke Tests — The val_bpb Equivalent

These are automated, objective pass/fail checks. No opinions, no vibes.
Either the endpoint returns correct data or it doesn't.

Run: python functional-qa/tests/smoke.py
Output: results printed to stdout + appended to functional-qa/results.tsv

Each test is one "experiment." Pass = the site works. Fail = file a ticket.
This is what autoresearch's val_bpb is to training — the ground truth metric
that neither agent can argue with.
"""

import json
import sys
import os
import time
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

BASE_URL = os.environ.get("RAZZLE_API_URL", "http://localhost:8000")
RESULTS_FILE = Path(__file__).parent.parent / "results.tsv"
TIMEOUT = 15

# ---------------------------------------------------------------------------
# Test infrastructure
# ---------------------------------------------------------------------------

class TestResult:
    def __init__(self, name: str, passed: bool, detail: str, severity: str = "OK",
                 file: str = "-", line: str = "-", function: str = "-"):
        self.name = name
        self.passed = passed
        self.detail = detail
        self.severity = severity
        self.file = file
        self.line = line
        self.function = function

results: list[TestResult] = []

def hit(method: str, path: str, body: dict | None = None, params: dict | None = None) -> tuple[int, str]:
    """Returns (status_code, response_body). Doesn't throw on HTTP errors."""
    url = BASE_URL + path
    if params:
        query = "&".join(f"{k}={v}" for k, v in params.items())
        url += f"?{query}"

    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")

    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    req.add_header("Accept-Encoding", "gzip, deflate")

    try:
        import gzip as _gzip
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            raw = resp.read()
            # Try gzip decompress first, fallback to raw
            try:
                raw = _gzip.decompress(raw)
            except Exception:
                pass  # Not gzip or partial, use raw
            return (resp.status, raw.decode("utf-8"))
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")[:500]
        return (e.code, body_text)
    except urllib.error.URLError as e:
        return (0, str(e.reason))
    except Exception as e:
        return (0, f"{type(e).__name__}: {e}")


def hit_json(method: str, path: str, **kwargs) -> tuple[int, dict | list | None]:
    """Returns (status_code, parsed_json_or_None)."""
    code, body = hit(method, path, **kwargs)
    if code == 0:
        print(f"    [DEBUG] {method} {path} failed: {body[:200]}", file=sys.stderr)
    try:
        return (code, json.loads(body))
    except (json.JSONDecodeError, TypeError):
        return (code, None)


# ---------------------------------------------------------------------------
# THE TESTS — each one is a binary pass/fail, no ambiguity
# ---------------------------------------------------------------------------

def test_health():
    """Server responds to health check."""
    code, body = hit("GET", "/api/health")
    if code == 200:
        results.append(TestResult("health", True, f"Server healthy (HTTP {code})"))
    else:
        results.append(TestResult("health", False, f"Server down (HTTP {code}: {body[:100]})",
                                  severity="P0", file="backend/server.py", function="health"))


def test_players_returns_data():
    """GET /api/players returns a non-empty list."""
    code, data = hit_json("GET", "/api/players")
    if code == 200 and isinstance(data, (list, dict)):
        # might be {"players": [...]} or just [...]
        players = data if isinstance(data, list) else data.get("items", data.get("items", data.get("players", data.get("data", []))))
        if len(players) > 0:
            results.append(TestResult("players_returns_data", True,
                                      f"Returns {len(players)} players"))
        else:
            results.append(TestResult("players_returns_data", False,
                                      "Returns empty player list", severity="P0",
                                      file="backend/server.py", function="get_players"))
    else:
        results.append(TestResult("players_returns_data", False,
                                  f"HTTP {code}, not valid JSON list", severity="P0",
                                  file="backend/server.py", function="get_players"))


def test_position_filter_qb():
    """Position filter for QB returns ONLY QBs."""
    code, data = hit_json("GET", "/api/players", params={"position": "QB"})
    if code != 200 or not data:
        results.append(TestResult("position_filter_qb", False,
                                  f"HTTP {code}, can't test filter", severity="P1",
                                  file="backend/server.py", function="get_players"))
        return

    players = data if isinstance(data, list) else data.get("items", data.get("players", data.get("data", [])))
    non_qbs = [p for p in players[:50] if p.get("position") != "QB"]
    if len(non_qbs) == 0:
        results.append(TestResult("position_filter_qb", True,
                                  f"All {min(len(players), 50)} checked are QBs"))
    else:
        names = ", ".join(f"{p.get('name')}({p.get('position')})" for p in non_qbs[:3])
        results.append(TestResult("position_filter_qb", False,
                                  f"Filter leak: {len(non_qbs)} non-QBs in QB filter: {names}",
                                  severity="P0", file="backend/live_data/players.py",
                                  function="get_players"))


def test_position_filter_wr():
    """Position filter for WR returns ONLY WRs."""
    code, data = hit_json("GET", "/api/players", params={"position": "WR"})
    if code != 200 or not data:
        results.append(TestResult("position_filter_wr", False,
                                  f"HTTP {code}", severity="P1"))
        return

    players = data if isinstance(data, list) else data.get("items", data.get("players", data.get("data", [])))
    non_wrs = [p for p in players[:50] if p.get("position") != "WR"]
    if len(non_wrs) == 0:
        results.append(TestResult("position_filter_wr", True,
                                  f"All {min(len(players), 50)} checked are WRs"))
    else:
        names = ", ".join(f"{p.get('name')}({p.get('position')})" for p in non_wrs[:3])
        results.append(TestResult("position_filter_wr", False,
                                  f"Filter leak: {len(non_wrs)} non-WRs: {names}",
                                  severity="P0", file="backend/live_data/players.py",
                                  function="get_players"))


def test_sort_ppr_descending():
    """Sorting by PPR points descending: first player has highest PPR."""
    code, data = hit_json("GET", "/api/players", params={"sort": "fantasy_points_ppr", "order": "desc", "limit": "20"})
    if code != 200 or not data:
        results.append(TestResult("sort_ppr_desc", False,
                                  f"HTTP {code}", severity="P1"))
        return

    players = data if isinstance(data, list) else data.get("items", data.get("players", data.get("data", [])))
    if len(players) < 2:
        results.append(TestResult("sort_ppr_desc", False,
                                  "Too few players to test sort", severity="P1"))
        return

    # Check first 10 are in descending order
    out_of_order = []
    for i in range(min(len(players) - 1, 10)):
        curr = players[i].get("fantasy_points_ppr") or 0
        nxt = players[i + 1].get("fantasy_points_ppr") or 0
        if curr < nxt:
            out_of_order.append(f"#{i+1} {players[i].get('full_name')}={curr} < #{i+2} {players[i+1].get('full_name')}={nxt}")

    if len(out_of_order) == 0:
        results.append(TestResult("sort_ppr_desc", True, "PPR sort descending is correct"))
    else:
        results.append(TestResult("sort_ppr_desc", False,
                                  f"Sort broken: {out_of_order[0]}", severity="P0",
                                  file="backend/live_data/players.py", function="get_players"))


def test_season_switch():
    """Different seasons return different data."""
    code_25, data_25 = hit_json("GET", "/api/players", params={"season": "2025", "limit": "5"})
    code_24, data_24 = hit_json("GET", "/api/players", params={"season": "2024", "limit": "5"})

    if code_25 != 200 or code_24 != 200:
        results.append(TestResult("season_switch", False,
                                  f"HTTP {code_25}/{code_24}", severity="P1"))
        return

    p25 = data_25 if isinstance(data_25, list) else data_25.get("items", data_25.get("players", data_25.get("data", [])))
    p24 = data_24 if isinstance(data_24, list) else data_24.get("items", data_24.get("players", data_24.get("data", [])))

    if len(p25) == 0 or len(p24) == 0:
        results.append(TestResult("season_switch", False,
                                  "One or both seasons returned empty", severity="P1"))
        return

    # Check that at least the stat values differ (different seasons should have different numbers)
    # Just compare first player's points
    pts_25 = p25[0].get("fantasy_points_ppr")
    pts_24 = p24[0].get("fantasy_points_ppr")

    if pts_25 is not None and pts_24 is not None and pts_25 == pts_24:
        # Same points for #1 player in two seasons is suspicious
        name_25 = p25[0].get("full_name", "?")
        name_24 = p24[0].get("full_name", "?")
        if name_25 == name_24:
            results.append(TestResult("season_switch", False,
                                      f"Same #1 player ({name_25}) with same points ({pts_25}) in 2024 and 2025 — season filter may not work",
                                      severity="P1", file="backend/server.py", function="get_players"))
            return

    results.append(TestResult("season_switch", True, "Different seasons return different data"))


def test_week_filter():
    """Week filter via screener returns single-week data, not season totals."""
    # /api/players doesn't support week — use screener POST
    code_all, data_all = hit_json("POST", "/api/screener/query",
                                  body={"season": 2025, "limit": 5, "position": "QB"})
    code_w1, data_w1 = hit_json("POST", "/api/screener/query",
                                body={"season": 2025, "week": 1, "limit": 5, "position": "QB"})

    if code_all != 200 or code_w1 != 200:
        results.append(TestResult("week_filter", False,
                                  f"HTTP {code_all}/{code_w1}", severity="P1"))
        return

    def _items(d):
        return d if isinstance(d, list) else d.get("items", d.get("players", []))

    p_all = _items(data_all)
    p_w1 = _items(data_w1)

    if len(p_all) == 0 or len(p_w1) == 0:
        results.append(TestResult("week_filter", False,
                                  "One or both returned empty", severity="P1"))
        return

    games_all = p_all[0].get("games", 0)
    games_w1 = p_w1[0].get("games", 0)

    if games_w1 > 1:
        results.append(TestResult("week_filter", False,
                                  f"Week 1 player has {games_w1} games — week filter not working",
                                  severity="P0", file="backend/live_data/players.py",
                                  function="_fetch_screener_uncached"))
    elif games_all <= 1:
        results.append(TestResult("week_filter", False,
                                  f"Season top player has only {games_all} games", severity="P1"))
    else:
        results.append(TestResult("week_filter", True,
                                  f"Week filter OK: season={games_all}gp, week1={games_w1}gp"))


def test_screener_query():
    """POST /api/screener/query with a position filter works."""
    body = {"position": "RB", "limit": 10}
    code, data = hit_json("POST", "/api/screener/query", body=body)
    if code != 200 or not data:
        results.append(TestResult("screener_query", False,
                                  f"HTTP {code}", severity="P1",
                                  file="backend/server.py", function="screener_query"))
        return

    players = data if isinstance(data, list) else data.get("items", data.get("results", data.get("players", data.get("data", []))))
    non_rbs = [p for p in players if p.get("position") != "RB"]
    if len(non_rbs) == 0 and len(players) > 0:
        results.append(TestResult("screener_query", True,
                                  f"Screener returns {len(players)} RBs, all correct"))
    elif len(players) == 0:
        results.append(TestResult("screener_query", False,
                                  "Screener returned empty for RB filter", severity="P1",
                                  file="backend/server.py", function="screener_query"))
    else:
        results.append(TestResult("screener_query", False,
                                  f"{len(non_rbs)} non-RBs in RB filter", severity="P0",
                                  file="backend/server.py", function="screener_query"))


def test_no_nan_in_stats():
    """No NaN or Infinity in player stat values."""
    code, data = hit_json("GET", "/api/players", params={"limit": "50"})
    if code != 200 or not data:
        results.append(TestResult("no_nan_stats", False, f"HTTP {code}", severity="P1"))
        return

    players = data if isinstance(data, list) else data.get("items", data.get("players", data.get("data", [])))
    nan_fields = []
    for p in players:
        for key, val in p.items():
            if isinstance(val, float):
                if val != val:  # NaN
                    nan_fields.append(f"{p.get('name', '?')}.{key}=NaN")
                elif abs(val) == float("inf"):
                    nan_fields.append(f"{p.get('name', '?')}.{key}=Inf")

    if len(nan_fields) == 0:
        results.append(TestResult("no_nan_stats", True, "No NaN/Inf in first 50 players"))
    else:
        results.append(TestResult("no_nan_stats", False,
                                  f"Found NaN/Inf: {', '.join(nan_fields[:5])}",
                                  severity="P0", file="backend/live_data/players.py",
                                  function="query"))


def test_negative_stats():
    """No negative values where impossible (games, targets, yards for positive-only stats)."""
    code, data = hit_json("GET", "/api/players", params={"limit": "50"})
    if code != 200 or not data:
        results.append(TestResult("no_negative_stats", False, f"HTTP {code}", severity="P1"))
        return

    players = data if isinstance(data, list) else data.get("items", data.get("players", data.get("data", [])))
    # Note: rushing_yards and receiving_yards CAN be negative in real NFL data
    # (sacks on QBs, laterals, end-arounds that lose yardage)
    non_negative_fields = ["games", "targets", "receptions", "carries"]
    violations = []
    for p in players:
        for field in non_negative_fields:
            val = p.get(field)
            if val is not None and isinstance(val, (int, float)) and val < 0:
                violations.append(f"{p.get('name', '?')}.{field}={val}")

    if len(violations) == 0:
        results.append(TestResult("no_negative_stats", True, "No impossible negative values"))
    else:
        results.append(TestResult("no_negative_stats", False,
                                  f"Negative stats: {', '.join(violations[:5])}",
                                  severity="P0", file="backend/live_data/players.py"))


def test_filter_options():
    """GET /api/filter-options returns valid options."""
    code, data = hit_json("GET", "/api/filter-options")
    if code != 200 or not data:
        results.append(TestResult("filter_options", False,
                                  f"HTTP {code}", severity="P1",
                                  file="backend/server.py", function="filter_options"))
        return

    # Should have positions and teams at minimum
    if isinstance(data, dict):
        has_positions = "positions" in data or "position" in data
        has_teams = "teams" in data or "team" in data
        if has_positions and has_teams:
            results.append(TestResult("filter_options", True, "Returns positions and teams"))
        else:
            results.append(TestResult("filter_options", False,
                                      f"Missing fields. Keys: {list(data.keys())[:10]}",
                                      severity="P1", file="backend/server.py",
                                      function="filter_options"))
    else:
        results.append(TestResult("filter_options", True, "Returns data (non-dict format)"))


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------

ALL_TESTS = [
    test_health,
    test_players_returns_data,
    test_position_filter_qb,
    test_position_filter_wr,
    test_sort_ppr_descending,
    test_season_switch,
    test_week_filter,
    test_screener_query,
    test_no_nan_in_stats,
    test_negative_stats,
    test_filter_options,
]


def run_all():
    """Run all smoke tests. Returns (passed, failed, total)."""
    print(f"=== Razzle Smoke Tests — {datetime.now().strftime('%Y-%m-%d %H:%M')} ===")
    print(f"Target: {BASE_URL}")
    print()

    for i, test_fn in enumerate(ALL_TESTS):
        name = test_fn.__name__.replace("test_", "")
        try:
            test_fn()
        except Exception as e:
            results.append(TestResult(name, False, f"Test crashed: {e}", severity="P0"))
        # Small delay between tests to avoid rate limiting on production
        if i < len(ALL_TESTS) - 1:
            time.sleep(0.5)

    # Print results
    passed = sum(1 for r in results if r.passed)
    failed = sum(1 for r in results if not r.passed)
    total = len(results)

    for r in results:
        status = "PASS" if r.passed else "FAIL"
        icon = "+" if r.passed else "X"
        sev = f" [{r.severity}]" if not r.passed else ""
        print(f"  [{icon}] {r.name}: {r.detail}{sev}")

    print()
    print(f"Results: {passed}/{total} passed, {failed} failed")

    # Append to results.tsv
    if RESULTS_FILE.parent.exists():
        header_needed = not RESULTS_FILE.exists()
        with open(RESULTS_FILE, "a", encoding="utf-8") as f:
            if header_needed:
                f.write("flow\tseverity\tfile\tline\tfunction\tstatus\tdescription\n")
            for r in results:
                status = "pass" if r.passed else "ticket"
                desc = f"smoke:{r.name} — {r.detail}".replace("\t", " ").replace("\n", " ")
                f.write(f"smoke\t{r.severity}\t{r.file}\t{r.line}\t{r.function}\t{status}\t{desc}\n")

    return (passed, failed, total)


if __name__ == "__main__":
    passed, failed, total = run_all()
    sys.exit(0 if failed == 0 else 1)
