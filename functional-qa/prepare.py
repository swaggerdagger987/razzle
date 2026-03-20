"""
Razzle Functional QA — Prepare (Fixed Infrastructure)

This file is NOT modified by the agent. It provides:
1. Backend health check + endpoint hitting
2. Response validation (stat sanity, sort order, filter accuracy)
3. File-per-ticket system (replaces shared TICKETS.md to avoid merge conflicts)
4. Structured results logging (results.tsv)
5. Convergence detection (prevents infinite fix-break cycles)

The agent imports these to do real runtime testing, not just static code reading.

Modeled after karpathy/autoresearch's prepare.py — fixed evaluation infrastructure
that the agent cannot change, only use.
"""

import csv
import json
import os
import sys
import time
import glob as glob_mod
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants (do not modify)
# ---------------------------------------------------------------------------

BASE_URL = os.environ.get("RAZZLE_API_URL", "http://localhost:8000")
RESULTS_FILE = Path(__file__).parent / "results.tsv"
TICKETS_DIR = Path(__file__).parent.parent / "tickets"
TICKETS_MD = Path(__file__).parent.parent / "TICKETS.md"
REQUEST_TIMEOUT = 15

# Convergence: if the same file has been ticketed this many times, escalate
MAX_TICKETS_PER_FILE = 3


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

def check_health() -> dict:
    """Hit /api/health. Returns dict with 'ok' bool and 'detail' string."""
    try:
        resp = hit("GET", "/api/health")
        return {"ok": True, "detail": f"Server up. Response: {resp[:200]}"}
    except Exception as e:
        return {"ok": False, "detail": str(e)}


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def hit(method: str, path: str, body: dict | None = None, params: dict | None = None) -> str:
    """Hit a Razzle API endpoint. Returns response body as string."""
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

    try:
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
            return resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"HTTP {e.code} on {method} {path}: {body_text}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Connection failed on {method} {path}: {e.reason}") from e


def hit_json(method: str, path: str, body: dict | None = None, params: dict | None = None) -> dict | list:
    """Hit endpoint and parse JSON response."""
    raw = hit(method, path, body, params)
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Validation helpers (the "evaluation harness")
# ---------------------------------------------------------------------------

def check_players_response(data: list, expected_position: str | None = None) -> list[str]:
    """Validate a player list response. Returns list of issues found."""
    issues = []
    if not isinstance(data, list):
        issues.append(f"Expected list, got {type(data).__name__}")
        return issues
    if len(data) == 0:
        issues.append("Empty player list — expected results")
        return issues

    seen_ids = set()
    for i, player in enumerate(data[:50]):
        if not isinstance(player, dict):
            issues.append(f"Player {i} is not a dict: {type(player).__name__}")
            continue
        for field in ["name", "position"]:
            if field not in player or not player[field]:
                issues.append(f"Player {i} missing '{field}': {player.get('name', '???')}")
        if expected_position and player.get("position") != expected_position:
            issues.append(
                f"Position filter leak: expected {expected_position}, "
                f"got {player.get('position')} for {player.get('name', '???')}"
            )
        pid = player.get("player_id") or player.get("gsis_id") or player.get("name")
        if pid in seen_ids:
            issues.append(f"Duplicate player: {pid}")
        seen_ids.add(pid)
    return issues


def check_stat_sanity(player: dict) -> list[str]:
    """Sanity-check a player's stats. Catches what a dynasty vet would notice."""
    issues = []
    name = player.get("name", "???")

    for key, val in player.items():
        if isinstance(val, float):
            if val != val:
                issues.append(f"{name}: {key} is NaN")
            elif val == float("inf") or val == float("-inf"):
                issues.append(f"{name}: {key} is Infinity")

    games = player.get("games", player.get("games_played", 0))
    for pts_key, ppg_key in [
        ("ppr_points", "ppr_ppg"),
        ("half_ppr_points", "half_ppr_ppg"),
        ("standard_points", "standard_ppg"),
    ]:
        total = player.get(pts_key)
        ppg = player.get(ppg_key)
        if total is not None and ppg is not None and games and games > 0:
            expected_ppg = round(total / games, 1)
            if abs(expected_ppg - ppg) > 0.2:
                issues.append(f"{name}: {ppg_key}={ppg} but {pts_key}/{games}={expected_ppg}")

    non_negative = [
        "targets", "receptions", "receiving_yards", "carries", "rushing_yards",
        "passing_yards", "completions", "attempts", "games", "snap_pct", "target_share",
    ]
    for key in non_negative:
        val = player.get(key)
        if val is not None and isinstance(val, (int, float)) and val < 0:
            issues.append(f"{name}: {key}={val} is negative")

    return issues


def check_sort_order(data: list, key: str, descending: bool = True) -> list[str]:
    """Verify a list is sorted by the given key."""
    issues = []
    prev = None
    for i, item in enumerate(data[:30]):
        val = item.get(key)
        if val is None:
            continue
        if prev is not None:
            if descending and val > prev:
                issues.append(f"Sort broken at {i}: {key}={val} > previous {prev}")
                break
            elif not descending and val < prev:
                issues.append(f"Sort broken at {i}: {key}={val} < previous {prev}")
                break
        prev = val
    return issues


# ---------------------------------------------------------------------------
# File-per-ticket system (replaces shared TICKETS.md)
# ---------------------------------------------------------------------------

def _ticket_id() -> str:
    """Generate a ticket ID: YYYYMMDD-HHMMSS-NNN."""
    now = datetime.now()
    existing = list(TICKETS_DIR.glob(f"{now.strftime('%Y%m%d')}*.md"))
    seq = len(existing) + 1
    return f"{now.strftime('%Y%m%d-%H%M%S')}-{seq:03d}"


def write_ticket(
    flow_num: int,
    flow_name: str,
    severity: str,
    description: str,
    root_cause: str,
    fix_description: str,
    accept_when: str,
    confidence: str = "HIGH",
) -> str:
    """
    Write a ticket as a separate file in tickets/ directory.
    Returns the ticket file path.

    Confidence levels:
    - HIGH: Code clearly shows the bug. Ship Loop should auto-fix.
    - MEDIUM: Likely a bug based on code patterns. Ship Loop should fix but verify carefully.
    - LOW: Might be a bug, might be intentional. Queue for human review — Ship Loop should SKIP.
    """
    TICKETS_DIR.mkdir(exist_ok=True)
    ticket_id = _ticket_id()
    today = datetime.now().strftime("%Y-%m-%d")

    # Check convergence — has this file been ticketed too many times?
    target_file = root_cause.split(":")[0].split(",")[0].strip() if root_cause else ""
    if target_file and _count_tickets_for_file(target_file) >= MAX_TICKETS_PER_FILE:
        confidence = "ESCALATE"
        description = (
            f"[ESCALATE — {target_file} has been ticketed {MAX_TICKETS_PER_FILE}+ times. "
            f"Fix-break cycle detected. Needs human review.]\n\n{description}"
        )

    slug = description[:60].lower()
    slug = "".join(c if c.isalnum() or c == " " else "" for c in slug)
    slug = slug.strip().replace(" ", "-")[:40]

    filename = f"{ticket_id}-{slug}.md"
    filepath = TICKETS_DIR / filename

    content = f"""---
id: {ticket_id}
severity: {severity}
confidence: {confidence}
flow: {flow_num}
flow_name: {flow_name}
found_by: Functional Loop
date: {today}
status: TODO
---

## {description}

**PRIORITY: {severity}** | **Confidence: {confidence}**
**Flow**: {flow_num}. {flow_name}
**Found by**: Functional Loop — {today}

{description}

**Root cause**: {root_cause}

### Task 1: {fix_description}
**Accept when**: {accept_when}
"""
    filepath.write_text(content, encoding="utf-8")
    return str(filepath)


def _count_tickets_for_file(target_file: str) -> int:
    """Count how many existing tickets reference the same file."""
    count = 0
    if not TICKETS_DIR.exists():
        return 0
    for ticket_path in TICKETS_DIR.glob("*.md"):
        try:
            text = ticket_path.read_text(encoding="utf-8")
            if target_file in text:
                count += 1
        except Exception:
            pass
    return count


def read_tickets() -> list[dict]:
    """Read all pending tickets from tickets/ directory. Returns list of dicts."""
    tickets = []
    if not TICKETS_DIR.exists():
        return tickets
    for ticket_path in sorted(TICKETS_DIR.glob("*.md")):
        try:
            text = ticket_path.read_text(encoding="utf-8")
            meta = {}
            meta["path"] = str(ticket_path)
            meta["filename"] = ticket_path.name
            # Parse frontmatter
            if text.startswith("---"):
                end = text.index("---", 3)
                fm = text[3:end]
                for line in fm.strip().split("\n"):
                    if ":" in line:
                        k, v = line.split(":", 1)
                        meta[k.strip()] = v.strip()
            meta["body"] = text
            tickets.append(meta)
        except Exception:
            pass
    return tickets


def complete_ticket(ticket_path: str):
    """Mark a ticket as done by deleting it from tickets/ directory."""
    p = Path(ticket_path)
    if p.exists():
        p.unlink()


def is_duplicate(description: str) -> bool:
    """Check if a similar ticket already exists."""
    if not TICKETS_DIR.exists():
        return False
    desc_lower = description.lower()[:50]
    for ticket_path in TICKETS_DIR.glob("*.md"):
        try:
            text = ticket_path.read_text(encoding="utf-8").lower()
            if desc_lower in text:
                return True
        except Exception:
            pass
    # Also check TICKETS.md for legacy tickets
    if TICKETS_MD.exists():
        try:
            text = TICKETS_MD.read_text(encoding="utf-8").lower()
            if desc_lower in text:
                return True
        except Exception:
            pass
    return False


# ---------------------------------------------------------------------------
# Results logging
# ---------------------------------------------------------------------------

RESULTS_HEADER = "flow\tseverity\tfile\tline\tfunction\tstatus\tdescription\tconfidence\ttimestamp\n"


def init_results():
    """Create results.tsv with header if it doesn't exist."""
    if not RESULTS_FILE.exists():
        RESULTS_FILE.write_text(RESULTS_HEADER)


def log_result(
    flow: int | str,
    severity: str,
    file: str,
    line: int | str,
    function: str,
    status: str,
    description: str,
    confidence: str = "-",
):
    """Append one result row to results.tsv."""
    init_results()
    desc_clean = description.replace("\t", " ").replace("\n", " ").strip()
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    row = f"{flow}\t{severity}\t{file}\t{line}\t{function}\t{status}\t{desc_clean}\t{confidence}\t{ts}\n"
    with open(RESULTS_FILE, "a", encoding="utf-8") as f:
        f.write(row)


def load_results() -> list[dict]:
    """Load results.tsv into a list of dicts."""
    init_results()
    results = []
    with open(RESULTS_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            results.append(row)
    return results


def results_summary() -> dict:
    """Quick summary of results so far."""
    results = load_results()
    total = len(results)
    p0 = sum(1 for r in results if r.get("severity") == "P0")
    p1 = sum(1 for r in results if r.get("severity") == "P1")
    p2 = sum(1 for r in results if r.get("severity") == "P2")
    ok = sum(1 for r in results if r.get("severity") == "OK")
    flows_done = len(set(r.get("flow") for r in results))
    return {"total_findings": total, "P0": p0, "P1": p1, "P2": p2, "OK": ok, "flows_audited": flows_done}


# ---------------------------------------------------------------------------
# Convergence detection
# ---------------------------------------------------------------------------

def check_convergence(file_path: str) -> dict:
    """
    Check if a file is in a fix-break cycle.
    Returns: { "converging": bool, "ticket_count": int, "should_escalate": bool }
    """
    count = _count_tickets_for_file(file_path)
    return {
        "converging": count <= 1,
        "ticket_count": count,
        "should_escalate": count >= MAX_TICKETS_PER_FILE,
    }


# ---------------------------------------------------------------------------
# Main — if run directly, health check + summary
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=== Razzle Functional QA — Prepare ===\n")

    health = check_health()
    if health["ok"]:
        print(f"[OK] Server healthy: {health['detail']}")
    else:
        print(f"[FAIL] Server down: {health['detail']}")
        print("Start: cd backend && python -m uvicorn server:app --port 8000")

    print()
    summary = results_summary()
    print(f"Results so far:")
    print(f"  Flows audited: {summary['flows_audited']}")
    print(f"  P0 (wrong data): {summary['P0']}")
    print(f"  P1 (dead feature): {summary['P1']}")
    print(f"  P2 (confusing): {summary['P2']}")
    print(f"  OK (passing): {summary['OK']}")

    tickets = read_tickets()
    print(f"\nPending tickets: {len(tickets)}")
    for t in tickets[:5]:
        print(f"  [{t.get('severity','?')}] [{t.get('confidence','?')}] {t.get('filename','')}")

    # Check convergence
    print("\nConvergence check:")
    files_seen = {}
    for t in tickets:
        body = t.get("body", "")
        # Extract file references
        for line in body.split("\n"):
            if "frontend/" in line or "backend/" in line:
                for word in line.split():
                    if "frontend/" in word or "backend/" in word:
                        f = word.strip("`,*:()[]")
                        files_seen[f] = files_seen.get(f, 0) + 1
    for f, count in sorted(files_seen.items(), key=lambda x: -x[1]):
        if count >= MAX_TICKETS_PER_FILE:
            print(f"  [ESCALATE] {f} — {count} tickets (fix-break cycle?)")
        elif count >= 2:
            print(f"  [WATCH] {f} — {count} tickets")
