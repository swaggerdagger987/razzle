"""
audit-fix/prepare.py — Fixed Infrastructure for Audit Fix Pipeline
===================================================================
Shared helpers for both the Audit Shipper and Ship Loop.
This file is FIXED — agents don't modify it. Humans update it.

Usage (from agent):
    python audit-fix/prepare.py status          # Show pipeline health
    python audit-fix/prepare.py triage-stats    # Shipper's performance metrics
    python audit-fix/prepare.py ship-stats      # Ship Loop's performance metrics
    python audit-fix/prepare.py cross-loop      # Cross-loop learning insights
    python audit-fix/prepare.py pending         # List pending tickets
    python audit-fix/prepare.py velocity        # Tickets/hour for both agents
"""

import os
import csv
import sys
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from pathlib import Path

REPO = Path(__file__).parent.parent
AUDIT_FIX = REPO / "audit-fix"
TICKETS_DIR = REPO / "tickets"
TRIAGE_TSV = AUDIT_FIX / "triage-results.tsv"
SHIP_TSV = AUDIT_FIX / "ship-results.tsv"


def read_tsv(path):
    """Read a TSV file, return list of dicts."""
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        return [row for row in reader]


def pending_tickets():
    """List ticket files in tickets/ directory."""
    if not TICKETS_DIR.exists():
        return []
    return sorted([
        f.name for f in TICKETS_DIR.iterdir()
        if f.suffix == ".md" and f.name != "SUMMARY.md"
    ])


def triage_stats():
    """Analyze Shipper performance from triage-results.tsv."""
    rows = read_tsv(TRIAGE_TSV)
    if not rows:
        print("No triage data yet.")
        return

    total = len(rows)
    by_severity = Counter(r.get("severity", "?") for r in rows)
    by_confidence = Counter(r.get("confidence", "?") for r in rows)
    by_category = Counter(r.get("category", "?") for r in rows)
    by_status = Counter(r.get("status", "?") for r in rows)

    # Track invocations
    invocations = set(r.get("invocation", "?") for r in rows)

    # Files investigated per ticket
    files_investigated = []
    for r in rows:
        fi = r.get("files_investigated", "0")
        try:
            files_investigated.append(int(fi))
        except (ValueError, TypeError):
            pass

    print(f"\n{'='*50}")
    print(f"AUDIT SHIPPER STATS")
    print(f"{'='*50}")
    print(f"Total tickets written:  {total}")
    print(f"Invocations:           {len(invocations)}")
    print(f"Tickets/invocation:    {total/len(invocations):.1f}" if invocations else "")
    print(f"\nBy severity:  {dict(by_severity)}")
    print(f"By confidence: {dict(by_confidence)}")
    print(f"By category:   {dict(by_category)}")
    print(f"By status:     {dict(by_status)}")
    if files_investigated:
        print(f"\nFiles investigated per ticket: avg {sum(files_investigated)/len(files_investigated):.1f}, "
              f"max {max(files_investigated)}")

    # Identify tickets still pending (written but not consumed)
    written_tickets = set(r.get("ticket_file", "") for r in rows if r.get("ticket_file"))
    pending = pending_tickets()
    consumed = written_tickets - set(pending)
    still_pending = written_tickets & set(pending)

    print(f"\nTicket flow:")
    print(f"  Written:    {len(written_tickets)}")
    print(f"  Consumed:   {len(consumed)} (Ship Loop fixed + deleted)")
    print(f"  Pending:    {len(still_pending)} (still in tickets/)")


def ship_stats():
    """Analyze Ship Loop performance from ship-results.tsv."""
    rows = read_tsv(SHIP_TSV)
    if not rows:
        print("No ship data yet.")
        return

    total = len(rows)
    by_status = Counter(r.get("status", "?") for r in rows)
    by_category = Counter(r.get("category", "?") for r in rows)
    by_severity = Counter(r.get("severity", "?") for r in rows)

    # Root cause accuracy
    accurate = sum(1 for r in rows if r.get("root_cause_accurate", "").lower() in ("yes", "true", "1"))
    inaccurate = sum(1 for r in rows if r.get("root_cause_accurate", "").lower() in ("no", "false", "0"))

    # Revert reasons
    revert_reasons = Counter(r.get("revert_reason", "") for r in rows if r.get("revert_reason"))

    # Lines changed per fix
    lines = []
    for r in rows:
        lc = r.get("lines_changed", "0")
        try:
            lines.append(int(lc))
        except (ValueError, TypeError):
            pass

    invocations = set(r.get("invocation", "?") for r in rows)

    fixed = by_status.get("FIXED", 0)
    reverted = by_status.get("REVERTED", 0)
    skipped = by_status.get("SKIPPED", 0)

    print(f"\n{'='*50}")
    print(f"SHIP LOOP STATS")
    print(f"{'='*50}")
    print(f"Total attempts:      {total}")
    print(f"Invocations:         {len(invocations)}")
    print(f"Fixes/invocation:    {total/len(invocations):.1f}" if invocations else "")
    print(f"\nFIXED:    {fixed}  ({fixed/total*100:.0f}%)" if total else "")
    print(f"REVERTED: {reverted}  ({reverted/total*100:.0f}%)" if total else "")
    print(f"SKIPPED:  {skipped}  ({skipped/total*100:.0f}%)" if total else "")
    print(f"\nBy category: {dict(by_category)}")
    print(f"By severity: {dict(by_severity)}")

    if accurate or inaccurate:
        total_rated = accurate + inaccurate
        print(f"\nRoot cause accuracy: {accurate}/{total_rated} ({accurate/total_rated*100:.0f}%)")

    if revert_reasons:
        print(f"\nRevert reasons:")
        for reason, count in revert_reasons.most_common():
            print(f"  {reason}: {count}")

    if lines:
        print(f"\nLines changed per fix: avg {sum(lines)/len(lines):.0f}, max {max(lines)}")


def cross_loop_insights():
    """Cross-reference both TSVs to find learning opportunities."""
    triage_rows = read_tsv(TRIAGE_TSV)
    ship_rows = read_tsv(SHIP_TSV)

    if not triage_rows or not ship_rows:
        print("Need data from both agents for cross-loop insights.")
        return

    print(f"\n{'='*50}")
    print(f"CROSS-LOOP LEARNING")
    print(f"{'='*50}")

    # Match tickets: triage wrote → ship consumed
    triage_tickets = {r.get("ticket_file", ""): r for r in triage_rows if r.get("ticket_file")}
    ship_tickets = {r.get("ticket_file", ""): r for r in ship_rows if r.get("ticket_file")}

    # Find tickets where Shipper said HIGH confidence but Ship Loop REVERTED
    miscalibrated = []
    for ticket, triage_row in triage_tickets.items():
        if ticket in ship_tickets:
            ship_row = ship_tickets[ticket]
            if triage_row.get("confidence") == "HIGH" and ship_row.get("status") == "REVERTED":
                miscalibrated.append((ticket, ship_row.get("revert_reason", "unknown")))

    if miscalibrated:
        print(f"\nMISCALIBRATED CONFIDENCE ({len(miscalibrated)} tickets):")
        print(f"  Shipper said HIGH confidence, but Ship Loop REVERTED:")
        for ticket, reason in miscalibrated:
            print(f"  - {ticket}: {reason}")
        print(f"  → Shipper should lower confidence for this pattern")

    # Find categories where Ship Loop has high revert rate
    category_outcomes = defaultdict(lambda: {"fixed": 0, "reverted": 0, "skipped": 0})
    for r in ship_rows:
        cat = r.get("category", "unknown")
        status = r.get("status", "unknown").upper()
        if status in category_outcomes[cat]:
            category_outcomes[cat][status] += 1

    print(f"\nFix rate by category:")
    for cat, outcomes in sorted(category_outcomes.items()):
        total = sum(outcomes.values())
        fixed = outcomes.get("fixed", 0)
        rate = fixed / total * 100 if total else 0
        flag = " ← STRUGGLING" if rate < 60 and total >= 3 else ""
        print(f"  {cat}: {fixed}/{total} fixed ({rate:.0f}%){flag}")

    # Find files with 3+ tickets (escalation candidates)
    file_counts = Counter()
    for r in triage_rows:
        rcf = r.get("root_cause_file", "")
        if rcf:
            file_counts[rcf] += 1

    escalation = [(f, c) for f, c in file_counts.items() if c >= 3]
    if escalation:
        print(f"\nESCALATION CANDIDATES (3+ tickets on same file):")
        for f, c in sorted(escalation, key=lambda x: -x[1]):
            print(f"  {f}: {c} tickets")

    # Find root cause accuracy per category
    accuracy_by_cat = defaultdict(lambda: {"accurate": 0, "inaccurate": 0})
    for r in ship_rows:
        cat = r.get("category", "unknown")
        rca = r.get("root_cause_accurate", "").lower()
        if rca in ("yes", "true", "1"):
            accuracy_by_cat[cat]["accurate"] += 1
        elif rca in ("no", "false", "0"):
            accuracy_by_cat[cat]["inaccurate"] += 1

    print(f"\nRoot cause accuracy by category:")
    for cat, acc in sorted(accuracy_by_cat.items()):
        total = acc["accurate"] + acc["inaccurate"]
        if total:
            rate = acc["accurate"] / total * 100
            flag = " ← INVESTIGATE MORE" if rate < 70 else ""
            print(f"  {cat}: {acc['accurate']}/{total} accurate ({rate:.0f}%){flag}")


def pipeline_status():
    """Overall pipeline health check."""
    print(f"\n{'='*50}")
    print(f"AUDIT FIX PIPELINE STATUS")
    print(f"{'='*50}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

    # Check files exist
    audit_exists = (REPO / "DEEP-AUDIT-TICKETS.md").exists()
    stat_exists = (REPO / "STAT-AUDIT-REPORT.md").exists()
    print(f"\nInputs:")
    print(f"  DEEP-AUDIT-TICKETS.md: {'FOUND' if audit_exists else 'MISSING'}")
    print(f"  STAT-AUDIT-REPORT.md:  {'FOUND' if stat_exists else 'MISSING (optional)'}")

    # Pending tickets
    pending = pending_tickets()
    print(f"\nTicket queue: {len(pending)} pending")
    if pending:
        for t in pending[:10]:
            print(f"  - {t}")
        if len(pending) > 10:
            print(f"  ... and {len(pending) - 10} more")

    # Results counts
    triage_rows = read_tsv(TRIAGE_TSV)
    ship_rows = read_tsv(SHIP_TSV)
    print(f"\nTriage results: {len(triage_rows)} entries")
    print(f"Ship results:   {len(ship_rows)} entries")

    # Programs exist
    tp = (AUDIT_FIX / "triage-program.md").exists()
    sp = (AUDIT_FIX / "ship-program.md").exists()
    print(f"\nPrograms:")
    print(f"  triage-program.md: {'FOUND' if tp else 'MISSING'}")
    print(f"  ship-program.md:   {'FOUND' if sp else 'MISSING'}")

    # Quick health
    if ship_rows:
        recent = ship_rows[-10:]  # Last 10
        reverts = sum(1 for r in recent if r.get("status", "").upper() == "REVERTED")
        if reverts >= 5:
            print(f"\n⚠ WARNING: {reverts}/10 recent fixes were REVERTED. Pipeline may be thrashing.")
        elif reverts >= 3:
            print(f"\n⚠ CAUTION: {reverts}/10 recent fixes reverted. Monitor closely.")
        else:
            print(f"\n✓ Pipeline healthy. {10-reverts}/10 recent fixes landed.")


def velocity():
    """Estimate throughput for both agents."""
    triage_rows = read_tsv(TRIAGE_TSV)
    ship_rows = read_tsv(SHIP_TSV)

    print(f"\n{'='*50}")
    print(f"VELOCITY")
    print(f"{'='*50}")

    for name, rows in [("Triage", triage_rows), ("Ship", ship_rows)]:
        if not rows:
            print(f"\n{name}: no data")
            continue

        timestamps = []
        for r in rows:
            ts = r.get("timestamp", "")
            try:
                timestamps.append(datetime.fromisoformat(ts))
            except (ValueError, TypeError):
                pass

        if len(timestamps) >= 2:
            duration = (max(timestamps) - min(timestamps)).total_seconds() / 3600
            if duration > 0:
                rate = len(rows) / duration
                print(f"\n{name}: {rate:.1f} items/hour ({len(rows)} items over {duration:.1f}h)")
            else:
                print(f"\n{name}: {len(rows)} items (all in same hour)")
        else:
            print(f"\n{name}: {len(rows)} items (insufficient data for rate)")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"

    commands = {
        "status": pipeline_status,
        "triage-stats": triage_stats,
        "ship-stats": ship_stats,
        "cross-loop": cross_loop_insights,
        "pending": lambda: print("\n".join(pending_tickets()) or "No pending tickets"),
        "velocity": velocity,
    }

    if cmd in commands:
        commands[cmd]()
    else:
        print(f"Unknown command: {cmd}")
        print(f"Available: {', '.join(commands.keys())}")
