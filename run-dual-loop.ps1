# Razzle Dual Loop — QA + Ship in isolated git worktrees
#
# Architecture:
#   razzle/         → master (human merges here, Render deploys from here)
#   razzle-qa/      → qa/findings branch (QA Loop finds bugs, writes tickets)
#   razzle-ship/    → ship/launch-fixes branch (Ship Loop fixes bugs, deletes tickets)
#
# Flow:  QA finds → tickets/ → Ship fixes → ship/launch-fixes → human merges → master
# No git lock conflicts. No branch collisions. Isolated worktrees.
#
# Usage:
#   cd C:\Users\mcgui\Documents\razzle
#   .\run-dual-loop.ps1
#

$ErrorActionPreference = "Continue"
$repoDir = "C:\Users\mcgui\Documents\razzle"
$qaDir = "C:\Users\mcgui\Documents\razzle-qa"
$shipDir = "C:\Users\mcgui\Documents\razzle-ship"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RAZZLE DUAL LOOP (worktrees)" -ForegroundColor Cyan
Write-Host "  QA (eyes) + Ship (hands)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  razzle-qa/   → qa/findings (find bugs)" -ForegroundColor Yellow
Write-Host "  razzle-ship/ → ship/launch-fixes (fix bugs)" -ForegroundColor Green
Write-Host "  razzle/      → master (don't touch)" -ForegroundColor DarkGray
Write-Host ""

# ---------------------------------------------------------------------------
# Step 0: Verify worktrees exist
# ---------------------------------------------------------------------------

if (-not (Test-Path $qaDir)) {
    Write-Host "[SETUP] Creating QA worktree..." -ForegroundColor White
    Set-Location $repoDir
    git branch qa/findings 2>$null
    git worktree add $qaDir qa/findings
}

if (-not (Test-Path $shipDir)) {
    Write-Host "[SETUP] Creating Ship worktree..." -ForegroundColor White
    Set-Location $repoDir
    git worktree add $shipDir ship/launch-fixes
}

Write-Host "[OK] Worktrees ready" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 1: Start the backend (from main repo — it has the DB)
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[1/4] Starting backend server..." -ForegroundColor White

$backendJob = Start-Job -Name "RazzleBackend" -ScriptBlock {
    param($dir)
    Set-Location $dir
    python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000
} -ArgumentList $repoDir

$healthy = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {}
    Write-Host "  Waiting for backend... ($($i * 2)s)" -ForegroundColor DarkGray
}

if ($healthy) {
    Write-Host "[OK] Backend healthy on port 8000" -ForegroundColor Green
} else {
    Write-Host "[WARN] Backend didn't respond in 60s — continuing with static analysis" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# Step 2: Baseline smoke tests + visual baselines
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[2/4] Running baseline tests..." -ForegroundColor White

if ($healthy) {
    $smokeResult = & python "$qaDir\functional-qa\tests\smoke.py" 2>&1
    Write-Host ($smokeResult -join "`n") -ForegroundColor DarkGray

    $playwrightInstalled = & node -e "try{require('playwright');console.log('yes')}catch{console.log('no')}" 2>$null
    if ($playwrightInstalled -eq "yes") {
        Write-Host ""
        Write-Host "  Running browser tests..." -ForegroundColor DarkGray
        $browserResult = & node "$qaDir\functional-qa\tests\browser.js" 2>&1
        Write-Host ($browserResult -join "`n") -ForegroundColor DarkGray

        $baselinesExist = Test-Path "$qaDir\functional-qa\baselines\*.png"
        if (-not $baselinesExist) {
            Write-Host "  Saving visual baselines (first run)..." -ForegroundColor DarkGray
            & node "$qaDir\functional-qa\browse.js" baseline 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
        }

        & node "$qaDir\functional-qa\browse.js" cleanup 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
    }
}

# ---------------------------------------------------------------------------
# Step 3: Start QA Loop (in QA worktree)
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[3/4] Starting QA Loop in razzle-qa/..." -ForegroundColor Yellow

$qaJob = Start-Job -Name "RazzleQA" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\functional-prompt.txt" -Raw
        claude --agent-name "Razzle Functional Loop" --dangerously-skip-permissions -p $prompt
        Start-Sleep -Seconds 5
    }
} -ArgumentList $qaDir

Write-Host "[OK] QA Loop started (Job: $($qaJob.Id))" -ForegroundColor Yellow

Start-Sleep -Seconds 15

# ---------------------------------------------------------------------------
# Step 4: Start Ship Loop (in Ship worktree)
# ---------------------------------------------------------------------------

Write-Host "[4/4] Starting Ship Loop in razzle-ship/..." -ForegroundColor Green

$shipJob = Start-Job -Name "RazzleShip" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\ship-prompt.txt" -Raw
        claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $prompt
        Start-Sleep -Seconds 5
    }
} -ArgumentList $shipDir

Write-Host "[OK] Ship Loop started (Job: $($shipJob.Id))" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Monitor loop
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Both loops running in isolated worktrees." -ForegroundColor Cyan
Write-Host "  QA:   $qaDir (qa/findings)" -ForegroundColor Yellow
Write-Host "  Ship: $shipDir (ship/launch-fixes)" -ForegroundColor Green
Write-Host "  Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

$smokeInterval = 0

try {
    while ($true) {
        $qaOutput = Receive-Job -Job $qaJob -ErrorAction SilentlyContinue
        if ($qaOutput) { foreach ($line in $qaOutput) { Write-Host "[QA] $line" -ForegroundColor Yellow } }

        $shipOutput = Receive-Job -Job $shipJob -ErrorAction SilentlyContinue
        if ($shipOutput) { foreach ($line in $shipOutput) { Write-Host "[SHIP] $line" -ForegroundColor Green } }

        # Every 10 min: smoke tests to measure improvement
        $smokeInterval++
        if ($smokeInterval -ge 200 -and $healthy) {
            $smokeInterval = 0
            Write-Host ""
            Write-Host "[METRIC] Smoke tests..." -ForegroundColor Cyan
            $smokeResult = & python "$qaDir\functional-qa\tests\smoke.py" 2>&1
            $lastLine = $smokeResult | Select-Object -Last 1
            Write-Host "[METRIC] $lastLine" -ForegroundColor Cyan

            $ticketCount = (Get-ChildItem "$qaDir\tickets\*.md" -ErrorAction SilentlyContinue).Count
            Write-Host "[METRIC] Open tickets: $ticketCount" -ForegroundColor Cyan
            Write-Host ""
        }

        # Auto-restart crashed jobs
        if ($qaJob.State -eq "Failed" -or $qaJob.State -eq "Completed") {
            Write-Host "[QA] Restarting..." -ForegroundColor Yellow
            Remove-Job -Job $qaJob -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            $qaJob = Start-Job -Name "RazzleQA" -ScriptBlock {
                param($dir); Set-Location $dir
                while ($true) { $prompt = Get-Content ".\functional-prompt.txt" -Raw; claude --agent-name "Razzle Functional Loop" --dangerously-skip-permissions -p $prompt; Start-Sleep -Seconds 5 }
            } -ArgumentList $qaDir
        }

        if ($shipJob.State -eq "Failed" -or $shipJob.State -eq "Completed") {
            Write-Host "[SHIP] Restarting..." -ForegroundColor Green
            Remove-Job -Job $shipJob -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            $shipJob = Start-Job -Name "RazzleShip" -ScriptBlock {
                param($dir); Set-Location $dir
                while ($true) { $prompt = Get-Content ".\ship-prompt.txt" -Raw; claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $prompt; Start-Sleep -Seconds 5 }
            } -ArgumentList $shipDir
        }

        Start-Sleep -Seconds 3
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping all processes..." -ForegroundColor Red
    Stop-Job -Job $qaJob -ErrorAction SilentlyContinue
    Stop-Job -Job $shipJob -ErrorAction SilentlyContinue
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $qaJob -ErrorAction SilentlyContinue
    Remove-Job -Job $shipJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue

    $uvicornPid = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
    if ($uvicornPid) { Stop-Process -Id $uvicornPid -Force -ErrorAction SilentlyContinue }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  SESSION SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    $resultsFile = "$qaDir\functional-qa\results.tsv"
    if (Test-Path $resultsFile) {
        $results = Get-Content $resultsFile | Select-Object -Skip 1
        $p0 = ($results | Select-String "`tP0`t").Count
        $p1 = ($results | Select-String "`tP1`t").Count
        $p2 = ($results | Select-String "`tP2`t").Count
        $ok = ($results | Select-String "`tOK`t").Count
        Write-Host "  Findings: P0=$p0  P1=$p1  P2=$p2  OK=$ok" -ForegroundColor Yellow
    }

    $ticketCount = (Get-ChildItem "$qaDir\tickets\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Open tickets: $ticketCount" -ForegroundColor White
    Write-Host ""
    Write-Host "  To merge fixes to master:" -ForegroundColor DarkGray
    Write-Host "    cd $repoDir" -ForegroundColor DarkGray
    Write-Host "    git merge ship/launch-fixes" -ForegroundColor DarkGray
    Write-Host "    git push origin master" -ForegroundColor DarkGray
    Write-Host ""
}
