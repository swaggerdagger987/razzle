# Razzle Dual Loop — QA + Ship running simultaneously
#
# The QA Loop finds bugs and writes tickets (to tickets/ directory).
# The Ship Loop reads tickets and fixes bugs.
# They never touch the same files. No merge conflicts.
#
# Architecture (inspired by karpathy/autoresearch):
#   QA Loop  = the researcher (reads code, hits endpoints, logs structured results)
#   Ship Loop = the optimizer (reads tickets, fixes code, commits)
#   tickets/  = file-per-ticket queue (no shared-file conflicts)
#   results.tsv = structured experiment log
#   smoke tests = the val_bpb equivalent (objective pass/fail before and after fixes)
#
# Usage:
#   cd C:\Users\mcgui\Documents\razzle
#   .\run-dual-loop.ps1
#
# To stop: Ctrl+C (kills everything)
#

$ErrorActionPreference = "Continue"
$repoDir = "C:\Users\mcgui\Documents\razzle"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RAZZLE DUAL LOOP" -ForegroundColor Cyan
Write-Host "  QA (eyes) + Ship (hands)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# Step 1: Start the backend
# ---------------------------------------------------------------------------

Write-Host "[1/4] Starting backend server..." -ForegroundColor White

$backendJob = Start-Job -Name "RazzleBackend" -ScriptBlock {
    param($dir)
    Set-Location $dir
    python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000
} -ArgumentList $repoDir

# Wait for backend to be healthy
$healthy = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $healthy = $true
            break
        }
    } catch {
        # Backend not ready yet
    }
    Write-Host "  Waiting for backend... ($($i * 2)s)" -ForegroundColor DarkGray
}

if ($healthy) {
    Write-Host "[OK] Backend healthy on port 8000" -ForegroundColor Green
} else {
    Write-Host "[WARN] Backend didn't respond in 60s — continuing anyway (static analysis only)" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# Step 2: Run smoke tests (baseline — like autoresearch's first run)
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[2/4] Running smoke tests (baseline)..." -ForegroundColor White

if ($healthy) {
    # API smoke tests
    $smokeResult = & python "$repoDir\functional-qa\tests\smoke.py" 2>&1
    Write-Host ($smokeResult -join "`n") -ForegroundColor DarkGray

    # Browser tests (if playwright is installed)
    $playwrightInstalled = & node -e "try{require('playwright');console.log('yes')}catch{console.log('no')}" 2>$null
    if ($playwrightInstalled -eq "yes") {
        Write-Host ""
        Write-Host "  Running browser tests..." -ForegroundColor DarkGray
        $browserResult = & node "$repoDir\functional-qa\tests\browser.js" 2>&1
        Write-Host ($browserResult -join "`n") -ForegroundColor DarkGray
        # Save visual baselines (golden screenshots for regression detection)
        $baselinesExist = Test-Path "$repoDir\functional-qa\baselines\*.png"
        if (-not $baselinesExist) {
            Write-Host ""
            Write-Host "  Saving visual baselines (first run)..." -ForegroundColor DarkGray
            & node "$repoDir\functional-qa\browse.js" baseline 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
        } else {
            Write-Host "  [OK] Visual baselines already exist" -ForegroundColor DarkGray
        }

        # Cleanup old screenshots
        & node "$repoDir\functional-qa\browse.js" cleanup 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }

    } else {
        Write-Host "  [SKIP] Browser tests — run 'npm install playwright && npx playwright install chromium' to enable" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [SKIP] Backend not running — no smoke tests" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# Step 3: Start QA Loop
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[3/4] Starting QA Loop (eyes)..." -ForegroundColor Yellow

$qaJob = Start-Job -Name "RazzleQA" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\functional-prompt.txt" -Raw
        claude --agent-name "Razzle Functional Loop" --dangerously-skip-permissions -p $prompt
        Start-Sleep -Seconds 5
    }
} -ArgumentList $repoDir

Write-Host "[OK] QA Loop started (Job: $($qaJob.Id))" -ForegroundColor Yellow

# Stagger so they don't collide on first git operation
Start-Sleep -Seconds 15

# ---------------------------------------------------------------------------
# Step 4: Start Ship Loop
# ---------------------------------------------------------------------------

Write-Host "[4/4] Starting Ship Loop (hands)..." -ForegroundColor Green

$shipJob = Start-Job -Name "RazzleShip" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\ship-prompt.txt" -Raw
        claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $prompt
        Start-Sleep -Seconds 5
    }
} -ArgumentList $repoDir

Write-Host "[OK] Ship Loop started (Job: $($shipJob.Id))" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Monitor loop
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Both loops running. Monitoring..." -ForegroundColor Cyan
Write-Host "  QA writes tickets to:  tickets/" -ForegroundColor Yellow
Write-Host "  Ship reads tickets from: tickets/" -ForegroundColor Green
Write-Host "  Structured log: functional-qa/results.tsv" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

$smokeInterval = 0
$lastTicketCount = 0

try {
    while ($true) {
        # Relay output from both jobs
        $qaOutput = Receive-Job -Job $qaJob -ErrorAction SilentlyContinue
        if ($qaOutput) {
            foreach ($line in $qaOutput) {
                Write-Host "[QA] $line" -ForegroundColor Yellow
            }
        }

        $shipOutput = Receive-Job -Job $shipJob -ErrorAction SilentlyContinue
        if ($shipOutput) {
            foreach ($line in $shipOutput) {
                Write-Host "[SHIP] $line" -ForegroundColor Green
            }
        }

        # Every 10 minutes: re-run smoke tests to measure improvement
        $smokeInterval++
        if ($smokeInterval -ge 200 -and $healthy) {  # 200 * 3s = 10 min
            $smokeInterval = 0
            Write-Host ""
            Write-Host "[METRIC] Running smoke tests to measure improvement..." -ForegroundColor Cyan
            $smokeResult = & python "$repoDir\functional-qa\tests\smoke.py" 2>&1
            $lastLine = $smokeResult | Select-Object -Last 1
            Write-Host "[METRIC] $lastLine" -ForegroundColor Cyan

            # Count open tickets
            $ticketCount = (Get-ChildItem "$repoDir\tickets\*.md" -ErrorAction SilentlyContinue).Count
            $delta = $ticketCount - $lastTicketCount
            $direction = if ($delta -gt 0) { "+$delta (QA finding more)" } elseif ($delta -lt 0) { "$delta (Ship fixing faster)" } else { "unchanged" }
            Write-Host "[METRIC] Open tickets: $ticketCount ($direction)" -ForegroundColor Cyan
            $lastTicketCount = $ticketCount

            # Check convergence
            $escalations = Get-Content "$repoDir\functional-qa\results.tsv" -ErrorAction SilentlyContinue | Select-String "ESCALATE"
            if ($escalations) {
                Write-Host "[ESCALATE] Fix-break cycles detected — check results.tsv" -ForegroundColor Red
            }
            Write-Host ""
        }

        # Auto-restart crashed jobs
        if ($qaJob.State -eq "Failed" -or $qaJob.State -eq "Completed") {
            Write-Host "[QA] Restarting..." -ForegroundColor Yellow
            Remove-Job -Job $qaJob -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            $qaJob = Start-Job -Name "RazzleQA" -ScriptBlock {
                param($dir); Set-Location $dir
                while ($true) {
                    $prompt = Get-Content ".\functional-prompt.txt" -Raw
                    claude --agent-name "Razzle Functional Loop" --dangerously-skip-permissions -p $prompt
                    Start-Sleep -Seconds 5
                }
            } -ArgumentList $repoDir
        }

        if ($shipJob.State -eq "Failed" -or $shipJob.State -eq "Completed") {
            Write-Host "[SHIP] Restarting..." -ForegroundColor Green
            Remove-Job -Job $shipJob -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
            $shipJob = Start-Job -Name "RazzleShip" -ScriptBlock {
                param($dir); Set-Location $dir
                while ($true) {
                    $prompt = Get-Content ".\ship-prompt.txt" -Raw
                    claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $prompt
                    Start-Sleep -Seconds 5
                }
            } -ArgumentList $repoDir
        }

        Start-Sleep -Seconds 3
    }
}
finally {
    # Cleanup
    Write-Host ""
    Write-Host "Stopping all processes..." -ForegroundColor Red
    Stop-Job -Job $qaJob -ErrorAction SilentlyContinue
    Stop-Job -Job $shipJob -ErrorAction SilentlyContinue
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $qaJob -ErrorAction SilentlyContinue
    Remove-Job -Job $shipJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue

    # Kill any remaining uvicorn process on port 8000
    $uvicornPid = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
    if ($uvicornPid) {
        Stop-Process -Id $uvicornPid -Force -ErrorAction SilentlyContinue
    }

    # Final summary
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  SESSION SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    $resultsFile = "$repoDir\functional-qa\results.tsv"
    if (Test-Path $resultsFile) {
        $results = Get-Content $resultsFile | Select-Object -Skip 1
        $p0 = ($results | Select-String "`tP0`t").Count
        $p1 = ($results | Select-String "`tP1`t").Count
        $p2 = ($results | Select-String "`tP2`t").Count
        $ok = ($results | Select-String "`tOK`t").Count
        Write-Host "  Findings: P0=$p0  P1=$p1  P2=$p2  OK=$ok" -ForegroundColor Yellow
    }

    $ticketCount = (Get-ChildItem "$repoDir\tickets\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Open tickets: $ticketCount" -ForegroundColor White
    Write-Host ""
    Write-Host "  Results:  functional-qa/results.tsv" -ForegroundColor DarkGray
    Write-Host "  Tickets:  tickets/*.md" -ForegroundColor DarkGray
    Write-Host "  Progress: PROGRESS.md" -ForegroundColor DarkGray
    Write-Host ""

    # Run final smoke tests
    if ($healthy) {
        Write-Host "  Running final smoke tests..." -ForegroundColor Cyan
        & python "$repoDir\functional-qa\tests\smoke.py" 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
    }
}
