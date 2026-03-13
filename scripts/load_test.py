"""
Load test: simulate 50 concurrent users hitting key Lab endpoints.
Uses ThreadPoolExecutor + httpx for concurrent HTTP requests.
"""

import httpx
import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://127.0.0.1:8000"

# Key Lab endpoints that real users hit most
ENDPOINTS = [
    ("GET", "/api/health", None),
    ("GET", "/api/players?position=QB&limit=50", None),
    ("GET", "/api/players?position=RB&limit=50", None),
    ("GET", "/api/players?position=WR&limit=50", None),
    ("GET", "/api/players?position=TE&limit=50", None),
    ("GET", "/api/filter-options", None),
    ("GET", "/api/featured", None),
    ("POST", "/api/screener/query", {
        "position": "QB", "season": "2025", "limit": 50,
        "sort_key": "fantasy_points_half_ppr", "sort_dir": "desc"
    }),
    ("POST", "/api/screener/query", {
        "position": "RB", "season": "2025", "limit": 50,
        "sort_key": "fantasy_points_half_ppr", "sort_dir": "desc",
        "filters": [{"key": "games", "op": "gte", "value": 10}]
    }),
    ("POST", "/api/screener/query", {
        "position": "WR", "season": "2025", "limit": 200,
        "sort_key": "fantasy_points_half_ppr", "sort_dir": "desc"
    }),
    ("GET", "/api/dynasty-dashboard", None),
    ("GET", "/api/trade-value-chart?position=all", None),
    ("GET", "/api/stat-leaders?season=2025", None),
    ("GET", "/api/dynasty-rankings", None),
    ("GET", "/api/breakout-candidates?season=2025", None),
    ("GET", "/api/matchup-heatmap?season=2025", None),
    ("GET", "/api/aging-curves", None),
    ("GET", "/api/weekly-heatmap?position=QB&season=2025", None),
    ("GET", "/api/efficiency-rankings?season=2025", None),
    ("GET", "/api/consistency-rankings?season=2025", None),
]

CONCURRENT_USERS = 50
REQUESTS_PER_USER = 5  # each user hits 5 random endpoints


def make_request(client: httpx.Client, method: str, path: str, json_body):
    """Make a single request, return (path, status, elapsed_ms)."""
    url = BASE_URL + path
    start = time.perf_counter()
    try:
        if method == "GET":
            resp = client.get(url, timeout=10)
        else:
            resp = client.post(url, json=json_body, timeout=10)
        elapsed_ms = (time.perf_counter() - start) * 1000
        return (path, resp.status_code, elapsed_ms, None)
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start) * 1000
        return (path, 0, elapsed_ms, str(e))


def user_session(user_id: int):
    """Simulate one user making multiple requests."""
    import random
    results = []
    with httpx.Client() as client:
        endpoints = random.sample(ENDPOINTS, min(REQUESTS_PER_USER, len(ENDPOINTS)))
        for method, path, body in endpoints:
            result = make_request(client, method, path, body)
            results.append(result)
    return user_id, results


def main():
    print(f"Load test: {CONCURRENT_USERS} concurrent users, {REQUESTS_PER_USER} requests each")
    print(f"Target: {BASE_URL}")
    print(f"Total requests: {CONCURRENT_USERS * REQUESTS_PER_USER}")
    print("-" * 70)

    # Warm up: hit each endpoint multiple times to warm all worker process caches
    print("Warming up caches (hitting each endpoint 8x for multi-worker coverage)...")
    warm_start = time.perf_counter()
    with httpx.Client() as c:
        try:
            r = c.get(f"{BASE_URL}/api/health", timeout=10)
            if r.status_code != 200:
                print(f"WARN: health check returned {r.status_code}")
        except Exception as e:
            print(f"ERROR: Server not reachable -- {e}")
            return
        for _ in range(8):  # 8 rounds to cover all worker processes
            for method, path, body in ENDPOINTS:
                try:
                    if method == "GET":
                        c.get(BASE_URL + path, timeout=15)
                    else:
                        c.post(BASE_URL + path, json=body, timeout=15)
                except Exception:
                    pass
    warm_time = time.perf_counter() - warm_start
    print(f"Warm-up done in {warm_time:.1f}s. Starting concurrent load test...")

    all_results = []
    start = time.perf_counter()

    with ThreadPoolExecutor(max_workers=CONCURRENT_USERS) as pool:
        futures = [pool.submit(user_session, uid) for uid in range(CONCURRENT_USERS)]
        for f in as_completed(futures):
            uid, results = f.result()
            all_results.extend(results)

    total_time = time.perf_counter() - start

    # Analyze results
    times = [r[2] for r in all_results]
    errors = [r for r in all_results if r[1] != 200]
    slow = [r for r in all_results if r[2] > 1000]

    print(f"\nCompleted in {total_time:.1f}s")
    print(f"Total requests: {len(all_results)}")
    print(f"Errors: {len(errors)}")
    print(f"Slow (>1s): {len(slow)}")
    print()

    print("Response time stats (ms):")
    print(f"  Min:    {min(times):.0f}")
    print(f"  Max:    {max(times):.0f}")
    print(f"  Mean:   {statistics.mean(times):.0f}")
    print(f"  Median: {statistics.median(times):.0f}")
    print(f"  P95:    {sorted(times)[int(len(times)*0.95)]:.0f}")
    print(f"  P99:    {sorted(times)[int(len(times)*0.99)]:.0f}")
    print(f"  RPS:    {len(all_results)/total_time:.1f}")

    # Per-endpoint breakdown
    from collections import defaultdict
    by_endpoint = defaultdict(list)
    for path, status, ms, err in all_results:
        by_endpoint[path].append((status, ms, err))

    print(f"\nPer-endpoint breakdown:")
    print(f"{'Endpoint':<55} {'N':>3} {'Avg':>6} {'P95':>6} {'Err':>3}")
    print("-" * 80)
    for path in sorted(by_endpoint.keys()):
        entries = by_endpoint[path]
        ep_times = [e[1] for e in entries]
        ep_errors = sum(1 for e in entries if e[0] != 200)
        avg = statistics.mean(ep_times)
        p95 = sorted(ep_times)[int(len(ep_times) * 0.95)] if len(ep_times) > 1 else ep_times[0]
        print(f"{path:<55} {len(entries):>3} {avg:>5.0f}ms {p95:>5.0f}ms {ep_errors:>3}")

    if errors:
        print(f"\nError details (first 10):")
        for path, status, ms, err in errors[:10]:
            print(f"  {path} -> {status} ({ms:.0f}ms) {err or ''}")

    if slow:
        print(f"\nSlow requests (>1s):")
        for path, status, ms, err in sorted(slow, key=lambda x: -x[2])[:10]:
            print(f"  {path} -> {ms:.0f}ms (status {status})")

    # Pass/Fail verdict
    print("\n" + "=" * 70)
    error_rate = len(errors) / len(all_results) * 100
    p95 = sorted(times)[int(len(times) * 0.95)]
    passed = error_rate < 5 and p95 < 1000

    if passed:
        print(f"PASS — P95={p95:.0f}ms, error rate={error_rate:.1f}%, {len(all_results)} requests")
    else:
        reasons = []
        if p95 >= 1000:
            reasons.append(f"P95={p95:.0f}ms (>1000ms)")
        if error_rate >= 5:
            reasons.append(f"error rate={error_rate:.1f}% (>=5%)")
        print(f"FAIL — {', '.join(reasons)}")

    return passed


if __name__ == "__main__":
    import sys
    ok = main()
    sys.exit(0 if ok else 1)
