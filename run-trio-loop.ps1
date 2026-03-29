# Razzle Trio Loop - QA + Ship + CEO running simultaneously
#
# Three agents, three worktrees, three ticket directories:
#   QA Loop  (razzle-qa/)   -> finds bugs      -> writes to tickets/qa/
#   CEO      (razzle-ceo/)  -> designs features -> writes to tickets/ceo/
#   Ship Loop (razzle-ship/) -> reads ALL ticket dirs -> fixes/builds -> deletes ticket files
#
# The Ship Loop NEVER rests. It reads from:
#   tickets/qa/      (functional bugs from QA)
#   tickets/ceo/     (strategic/design tickets from CEO)
#   tickets/manual/  (human-written tickets, backlog)
#
# Usage:
#   cd C:\Users\mcgui\Documents\razzle
#   .\run-trio-loop.ps1
#

$ErrorActionPreference = "Continue"
$repoDir = "C:\Users\mcgui\Documents\razzle"
$qaDir = "C:\Users\mcgui\Documents\razzle-qa"
$shipDir = "C:\Users\mcgui\Documents\razzle-ship"
$ceoDir = "C:\Users\mcgui\Documents\razzle-ceo"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RAZZLE TRIO LOOP" -ForegroundColor Cyan
Write-Host "  QA (eyes) + CEO (tiger) + Ship (hands)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  razzle-qa/   -> finds bugs        -> tickets/qa/" -ForegroundColor Yellow
Write-Host "  razzle-ceo/  -> designs + directs  -> tickets/ceo/" -ForegroundColor DarkYellow
Write-Host "  razzle-ship/ -> builds everything  -> reads ALL ticket dirs" -ForegroundColor Green
Write-Host "  razzle/      -> master (human only)" -ForegroundColor DarkGray
Write-Host ""

# ---------------------------------------------------------------------------
# Step 0: Verify worktrees
# ---------------------------------------------------------------------------

foreach ($dir in @(@{Path=$qaDir;Branch="qa/findings"}, @{Path=$shipDir;Branch="ship/launch-fixes"}, @{Path=$ceoDir;Branch="ceo/strategy"})) {
    if (-not (Test-Path $dir.Path)) {
        Write-Host "[SETUP] Creating worktree: $($dir.Path)..." -ForegroundColor White
        Set-Location $repoDir
        git branch $dir.Branch 2>$null
        git worktree add $dir.Path $dir.Branch
    }
}
Write-Host "[OK] All worktrees ready" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 1: Start backend
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[1/5] Starting backend..." -ForegroundColor White

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
        if ($response.StatusCode -eq 200) { $healthy = $true; break }
    } catch {}
    Write-Host "  Waiting for backend... ($($i * 2)s)" -ForegroundColor DarkGray
}

if ($healthy) { Write-Host "[OK] Backend healthy" -ForegroundColor Green }
else { Write-Host "[WARN] Backend not responding - static analysis only" -ForegroundColor Yellow }

# ---------------------------------------------------------------------------
# Step 2: Baseline tests
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[2/5] Running baseline tests..." -ForegroundColor White

if ($healthy) {
    & python "$qaDir\functional-qa\tests\smoke.py" 2>&1 | Select-Object -Last 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
}

# ---------------------------------------------------------------------------
# Step 3: Start QA Loop
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "[3/5] Starting QA Loop..." -ForegroundColor Yellow

$qaJob = Start-Job -Name "RazzleQA" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\functional-prompt.txt" -Raw
        claude --agent-name "Razzle Functional Loop" --dangerously-skip-permissions -p $prompt
        Start-Sleep -Seconds 5
    }
} -ArgumentList $qaDir

Write-Host "[OK] QA Loop started" -ForegroundColor Yellow
Start-Sleep -Seconds 10

# ---------------------------------------------------------------------------
# Step 4: Start CEO Loop
# ---------------------------------------------------------------------------

Write-Host "[4/5] Starting CEO Loop..." -ForegroundColor DarkYellow

$ceoJob = Start-Job -Name "RazzleCEO" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\ceo-prompt.txt" -Raw
        claude --agent-name "Razzle CEO" --dangerously-skip-permissions -p $prompt
        # CEO reviews every 3 hours - designs, screenshots, writes strategic tickets
        Start-Sleep -Seconds 10800
    }
} -ArgumentList $ceoDir

Write-Host "[OK] CEO Loop started (reviews every 3 hours)" -ForegroundColor DarkYellow
Start-Sleep -Seconds 10

# ---------------------------------------------------------------------------
# Step 5: Start Ship Loop
# ---------------------------------------------------------------------------

Write-Host "[5/5] Starting Ship Loop..." -ForegroundColor Green

$shipJob = Start-Job -Name "RazzleShip" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\ship-prompt.txt" -Raw
        claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $prompt
        Start-Sleep -Seconds 5
    }
} -ArgumentList $shipDir

Write-Host "[OK] Ship Loop started" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Monitor
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Trio loop running. Ship reads from ALL ticket directories." -ForegroundColor Cyan
Write-Host "  QA  -> tickets/qa/     (functional bugs)" -ForegroundColor Yellow
Write-Host "  CEO -> tickets/ceo/    (strategic design)" -ForegroundColor DarkYellow
Write-Host "  You -> tickets/manual/ (backlog features)" -ForegroundColor White
Write-Host "  Ship reads: tickets/qa/ + tickets/ceo/ + tickets/manual/" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

$smokeInterval = 0

try {
    while ($true) {
        foreach ($job in @($qaJob, $ceoJob, $shipJob)) {
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) {
                $color = switch ($job.Name) {
                    "RazzleQA"   { "Yellow" }
                    "RazzleCEO"  { "DarkYellow" }
                    "RazzleShip" { "Green" }
                    default { "Gray" }
                }
                foreach ($line in $output) {
                    Write-Host "[$($job.Name)] $line" -ForegroundColor $color
                }
            }
        }

        # Smoke tests every 10 min
        $smokeInterval++
        if ($smokeInterval -ge 200 -and $healthy) {
            $smokeInterval = 0
            Write-Host ""
            Write-Host "[METRIC] Smoke tests..." -ForegroundColor Cyan
            $smokeResult = & python "$qaDir\functional-qa\tests\smoke.py" 2>&1
            $lastLine = $smokeResult | Select-Object -Last 1
            Write-Host "[METRIC] $lastLine" -ForegroundColor Cyan

            # Count tickets across all dirs
            $qaTickets = (Get-ChildItem "$repoDir\tickets\qa\*.md" -ErrorAction SilentlyContinue).Count
            $ceoTickets = (Get-ChildItem "$repoDir\tickets\ceo\*.md" -ErrorAction SilentlyContinue).Count
            $manualTickets = (Get-ChildItem "$repoDir\tickets\manual\*.md" -ErrorAction SilentlyContinue).Count
            $total = $qaTickets + $ceoTickets + $manualTickets
            Write-Host "[METRIC] Tickets: QA=$qaTickets CEO=$ceoTickets Manual=$manualTickets Total=$total" -ForegroundColor Cyan
            Write-Host ""
        }

        # Auto-restart
        foreach ($info in @(
            @{Job=$qaJob; Name="RazzleQA"; Dir=$qaDir; Prompt="functional-prompt.txt"; Agent="Razzle Functional Loop"; Sleep=5},
            @{Job=$ceoJob; Name="RazzleCEO"; Dir=$ceoDir; Prompt="ceo-prompt.txt"; Agent="Razzle CEO"; Sleep=10800},
            @{Job=$shipJob; Name="RazzleShip"; Dir=$shipDir; Prompt="ship-prompt.txt"; Agent="Razzle Ship Loop"; Sleep=5}
        )) {
            if ($info.Job.State -eq "Failed" -or $info.Job.State -eq "Completed") {
                Write-Host "[$($info.Name)] Restarting..." -ForegroundColor Red
                Remove-Job -Job $info.Job -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 5
                $newJob = Start-Job -Name $info.Name -ScriptBlock {
                    param($dir, $promptFile, $agentName, $sleepSec)
                    Set-Location $dir
                    while ($true) {
                        $p = Get-Content ".\$promptFile" -Raw
                        claude --agent-name $agentName --dangerously-skip-permissions -p $p
                        Start-Sleep -Seconds $sleepSec
                    }
                } -ArgumentList $info.Dir, $info.Prompt, $info.Agent, $info.Sleep

                switch ($info.Name) {
                    "RazzleQA"   { $qaJob = $newJob }
                    "RazzleCEO"  { $ceoJob = $newJob }
                    "RazzleShip" { $shipJob = $newJob }
                }
            }
        }

        Start-Sleep -Seconds 3
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping trio loop..." -ForegroundColor Red
    Get-Job | Where-Object { $_.Name -like "Razzle*" } | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Where-Object { $_.Name -like "Razzle*" } | Remove-Job -ErrorAction SilentlyContinue

    $uvicornPid = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
    if ($uvicornPid) { Stop-Process -Id $uvicornPid -Force -ErrorAction SilentlyContinue }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  SESSION SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    $qaTickets = (Get-ChildItem "$repoDir\tickets\qa\*.md" -ErrorAction SilentlyContinue).Count
    $ceoTickets = (Get-ChildItem "$repoDir\tickets\ceo\*.md" -ErrorAction SilentlyContinue).Count
    $manualTickets = (Get-ChildItem "$repoDir\tickets\manual\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Tickets remaining: QA=$qaTickets CEO=$ceoTickets Manual=$manualTickets" -ForegroundColor White
    Write-Host ""
    Write-Host "  To merge when ready:" -ForegroundColor DarkGray
    Write-Host "    cd $repoDir" -ForegroundColor DarkGray
    Write-Host "    git merge ship/launch-fixes" -ForegroundColor DarkGray
    Write-Host "    git push origin master  # only when reviewed!" -ForegroundColor DarkGray
    Write-Host ""
}
