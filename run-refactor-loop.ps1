# Razzle Refactor Loop - Multi-agent codebase cleanup
#
# Uses the same razzle-ship worktree as the ship loop (ship/launch-fixes branch).
# Do NOT run this simultaneously with the ship loop.
#
# Usage:
#   cd C:\Users\mcgui\Documents\razzle
#   .\run-refactor-loop.ps1

$ErrorActionPreference = "Continue"
$repoDir = "C:\Users\mcgui\Documents\razzle"
$shipDir = "C:\Users\mcgui\Documents\razzle-ship"

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  RAZZLE REFACTOR LOOP" -ForegroundColor Magenta
Write-Host "  Eliminate bloat. Preserve behavior." -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# ---------------------------------------------------------------------------
# Step 0: Verify worktree
# ---------------------------------------------------------------------------

if (-not (Test-Path $shipDir)) {
    Write-Host "[SETUP] Creating ship worktree..." -ForegroundColor White
    Set-Location $repoDir
    git worktree add $shipDir ship/launch-fixes
}

Write-Host "[OK] Ship worktree ready at $shipDir" -ForegroundColor Green

# Sync ship worktree with master (to pick up new tickets)
Set-Location $shipDir
git fetch origin
git merge origin/master --no-edit
Set-Location $repoDir
Write-Host "[OK] Ship worktree synced with master" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 1: Start backend for visual verification
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[1/5] Starting backend server..." -ForegroundColor White

$backendJob = Start-Job -Name "RefactorBackend" -ScriptBlock {
    param($d)
    Set-Location $d
    $env:PYTHONPATH = $d
    python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --workers 1
} -ArgumentList $repoDir

Start-Sleep -Seconds 5

try {
    $health = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  Backend healthy" -ForegroundColor Green
}
catch {
    Write-Host "  WARNING: Backend not responding (visual checks may fail)" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# Step 2: Run baseline tests
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[2/5] Running baseline tests..." -ForegroundColor White

Set-Location $shipDir
$env:PYTHONPATH = $shipDir
python -m pytest tests/ -q
$testExit = $LASTEXITCODE

if ($testExit -eq 0) {
    Write-Host "  Tests PASS (baseline)" -ForegroundColor Green
}
else {
    Write-Host "  Tests FAIL - fix before refactoring" -ForegroundColor Red
    Stop-Job -Name "RefactorBackend" -ErrorAction SilentlyContinue
    Remove-Job -Name "RefactorBackend" -ErrorAction SilentlyContinue
    exit 1
}

# ---------------------------------------------------------------------------
# Step 3: Count tickets
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[3/5] Scanning refactor tickets..." -ForegroundColor White

$tickets = Get-ChildItem "$shipDir\tickets\refactor\*.md" -ErrorAction SilentlyContinue
$ticketCount = 0
if ($tickets) { $ticketCount = $tickets.Count }

Write-Host "  Found $ticketCount refactor tickets" -ForegroundColor Cyan
if ($ticketCount -eq 0) {
    Write-Host "  No tickets. Nothing to do." -ForegroundColor Yellow
    Stop-Job -Name "RefactorBackend" -ErrorAction SilentlyContinue
    Remove-Job -Name "RefactorBackend" -ErrorAction SilentlyContinue
    exit 0
}

foreach ($t in $tickets) {
    Write-Host "  $($t.Name)" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# Step 4: Refactor agent - one ticket per invocation
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[4/5] Launching refactor agent..." -ForegroundColor White
Write-Host ""
Write-Host "  Worktree: razzle-ship/ (ship/launch-fixes)" -ForegroundColor Cyan
Write-Host "  Safety: tests after every file, revert on failure" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

$refactorPrompt = Get-Content "$repoDir\refactor-prompt.txt" -Raw
$iteration = 0

while ($true) {
    $iteration++
    $remainingTickets = Get-ChildItem "$shipDir\tickets\refactor\*.md" -ErrorAction SilentlyContinue
    $remaining = 0
    if ($remainingTickets) { $remaining = $remainingTickets.Count }

    if ($remaining -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ALL REFACTOR TICKETS COMPLETE" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        break
    }

    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Invocation $iteration - $remaining tickets remaining" -ForegroundColor White

    claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $refactorPrompt

    Start-Sleep -Seconds 3
}

# ---------------------------------------------------------------------------
# Step 5: Post-refactor review
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[5/5] Post-refactor verification..." -ForegroundColor White

Set-Location $shipDir
$env:PYTHONPATH = $shipDir

python -m pytest tests/ -q
$finalExit = $LASTEXITCODE

if ($finalExit -eq 0) {
    Write-Host "  Final tests PASS" -ForegroundColor Green
}
else {
    Write-Host "  Final tests FAIL - review the refactoring" -ForegroundColor Red
}

# Cleanup
Stop-Job -Name "RefactorBackend" -ErrorAction SilentlyContinue
Remove-Job -Name "RefactorBackend" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Refactor loop complete. Merge ship/launch-fixes to master when ready." -ForegroundColor Green
