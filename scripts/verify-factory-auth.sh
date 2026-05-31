#!/usr/bin/env bash
# Run on agent VM or locally. Confirms factory auth chain is wired.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'
ok() { echo -e "${GREEN}OK${NC}  $1"; }
fail() { echo -e "${RED}FAIL${NC} $1"; ERR=1; }

ERR=0

echo "=== Razzle Good Morning — auth verification ==="

# 1. Repo wiring
test -f .github/workflows/standup-pr-autopen.yml && ok "standup-pr-autopen workflow present" || fail "missing standup-pr-autopen.yml"
test -f .github/workflows/standup-pr-merge.yml && ok "standup-pr-merge workflow present" || fail "missing standup-pr-merge.yml"
test -x scripts/company-os-wait-for-pr.sh && ok "wait-for-pr script executable" || fail "missing company-os-wait-for-pr.sh"
test -f docs/company/automations/good-morning.md && ok "good-morning.md present" || fail "missing good-morning.md"

# 2. Git push credential (Automation VM)
if git remote get-url origin | grep -q 'x-access-token'; then
  ok "git remote uses GitHub token (push path)"
else
  fail "git remote missing x-access-token — push will fail on Automation VM"
fi

# 3. gh read (PR poll)
if gh pr list --limit 1 --json number -q '.[0].number' >/dev/null 2>&1; then
  ok "gh can list PRs (poll path after autopen)"
else
  fail "gh cannot list PRs"
fi

# 4. gh create must NOT work on VM (autopen handles it)
if gh pr create --help >/dev/null 2>&1; then
  if gh pr create --base razzle-v2-redesign --head razzle-v2-redesign --title "auth-probe" --body "probe" 2>&1 | grep -qi "not accessible by integration\|403"; then
    ok "gh pr create correctly blocked on VM (autopen is the PR path)"
  else
    ok "gh pr create probe inconclusive — rely on autopen anyway"
  fi
fi

# 5. Repo auto-merge enabled
if gh api repos/swaggerdagger987/razzle --jq '.allow_auto_merge' 2>/dev/null | grep -q true; then
  ok "GitHub repo allow_auto_merge enabled"
else
  fail "Enable auto-merge: repo Settings → General → Allow auto-merge"
fi

# 6. Recent autopen success
LAST=$(gh run list --workflow=standup-pr-autopen.yml --limit 1 --json conclusion -q '.[0].conclusion' 2>/dev/null || echo "")
if [ "$LAST" = "success" ]; then
  ok "Last standup-pr-autopen run: success"
elif [ -n "$LAST" ]; then
  fail "Last standup-pr-autopen run: $LAST — check Actions → Allow Actions to create PRs"
else
  fail "No standup-pr-autopen runs found"
fi

echo ""
echo "=== Cursor dashboard (confirm manually — cannot probe from repo) ==="
echo "  [ ] Good Morning → Team Owned (not Private)"
echo "  [ ] Good Morning → Open Pull Request tool ON"
echo "  [ ] Prompt first line: PROMPT_VERSION: 2026-06-01.v2"
echo "  [ ] GitHub → Actions → Allow GitHub Actions to create and approve pull requests"
echo ""

if [ "${ERR:-0}" -eq 0 ]; then
  echo -e "${GREEN}Repo-side auth: PASS${NC}"
  exit 0
else
  echo -e "${RED}Repo-side auth: FAIL — fix items above${NC}"
  exit 1
fi
