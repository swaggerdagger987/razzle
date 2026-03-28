# run-audit-fix.ps1 — Parallel Audit Shipper + Ship Loop
# ======================================================
# Producer/Consumer pattern:
#   Audit Shipper (razzle-triage/) → investigates audit findings → writes tickets → pushes audit/tickets
#   Ship Loop (razzle-ship/) → merges audit/tickets → fixes code → pushes ship/launch-fixes
#
# Usage: cd C:\Users\mcgui\Documents\razzle && .\run-audit-fix.ps1

$ErrorActionPreference = "Continue"
$REPO = "C:\Users\mcgui\Documents\razzle"
$TRIAGE_DIR = "C:\Users\mcgui\Documents\razzle-triage"
$SHIP_DIR = "C:\Users\mcgui\Documents\razzle-ship"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Razzle Audit Fix Pipeline" -ForegroundColor Cyan
Write-Host "  Producer: Audit Shipper (triage)" -ForegroundColor Yellow
Write-Host "  Consumer: Ship Loop (fix)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Ensure branches exist ──────────────────────────────────────

Set-Location $REPO

Write-Host "[1/5] Ensuring branches exist..." -ForegroundColor Cyan

# Create audit/tickets branch if it doesn't exist
$branches = git branch -a 2>$null
if ($branches -notmatch "audit/tickets") {
    Write-Host "  Creating audit/tickets branch..." -ForegroundColor Yellow
    & git checkout -b "audit/tickets" 2>$null
    & git push -u origin "audit/tickets" 2>$null
    & git checkout master 2>$null
} else {
    Write-Host "  audit/tickets branch exists" -ForegroundColor Green
}

# Create ship/launch-fixes branch if it doesn't exist
if ($branches -notmatch "ship/launch-fixes") {
    Write-Host "  Creating ship/launch-fixes branch..." -ForegroundColor Yellow
    & git checkout -b "ship/launch-fixes" 2>$null
    & git push -u origin "ship/launch-fixes" 2>$null
    & git checkout master 2>$null
} else {
    Write-Host "  ship/launch-fixes branch exists" -ForegroundColor Green
}

# Make sure we're back on master
& git checkout master 2>$null

# ─── Step 2: Set up worktrees ───────────────────────────────────────────

Write-Host "[2/5] Setting up worktrees..." -ForegroundColor Cyan

# Triage worktree (Audit Shipper)
if (Test-Path $TRIAGE_DIR) {
    Write-Host "  razzle-triage/ already exists" -ForegroundColor Green
} else {
    Write-Host "  Creating razzle-triage/ worktree on audit/tickets..." -ForegroundColor Yellow
    & git worktree add $TRIAGE_DIR "audit/tickets" 2>$null
}

# Ship worktree (Ship Loop)
if (Test-Path $SHIP_DIR) {
    Write-Host "  razzle-ship/ already exists" -ForegroundColor Green
} else {
    Write-Host "  Creating razzle-ship/ worktree on ship/launch-fixes..." -ForegroundColor Yellow
    & git worktree add $SHIP_DIR "ship/launch-fixes" 2>$null
}

# ─── Step 3: Configure git and sync autoresearch files ───────────────────

Write-Host "[3/6] Configuring git in worktrees..." -ForegroundColor Cyan

Set-Location $TRIAGE_DIR
& git config user.name "swaggerdagger987"
& git config user.email "swaggerdagger987@users.noreply.github.com"
& git pull origin "audit/tickets" 2>$null
& git merge origin/master --no-edit 2>$null
Write-Host "  razzle-triage/ ready (audit/tickets)" -ForegroundColor Green

Set-Location $SHIP_DIR
& git config user.name "swaggerdagger987"
& git config user.email "swaggerdagger987@users.noreply.github.com"
& git pull origin "ship/launch-fixes" 2>$null
& git merge origin/master --no-edit 2>$null
Write-Host "  razzle-ship/ ready (ship/launch-fixes)" -ForegroundColor Green

Set-Location $REPO

# ─── Step 3b: Ensure audit-fix/ directory is in both worktrees ──────────

Write-Host "[3b/6] Syncing autoresearch infrastructure..." -ForegroundColor Cyan

# Both worktrees need audit-fix/ for program.md, results.tsv, and prepare.py
# Since they're on different branches, we ensure the directory exists in both
$auditFixFiles = @(
    "audit-fix\triage-program.md",
    "audit-fix\ship-program.md",
    "audit-fix\triage-results.tsv",
    "audit-fix\ship-results.tsv",
    "audit-fix\prepare.py"
)

foreach ($dir in @($TRIAGE_DIR, $SHIP_DIR)) {
    $afDir = Join-Path $dir "audit-fix"
    if (-not (Test-Path $afDir)) {
        New-Item -ItemType Directory -Path $afDir -Force | Out-Null
    }
    foreach ($file in $auditFixFiles) {
        $src = Join-Path $REPO $file
        $dst = Join-Path $dir $file
        if ((Test-Path $src) -and (-not (Test-Path $dst))) {
            Copy-Item $src $dst -Force
            Write-Host "  Copied $file to $(Split-Path $dir -Leaf)/" -ForegroundColor DarkGray
        }
    }
}

# The TSV files are SHARED state. Both agents need to read AND write them.
# We use symlinks so both worktrees point to the same physical files in the main repo.
Write-Host "  Creating symlinks for shared results.tsv files..." -ForegroundColor DarkGray
foreach ($tsv in @("audit-fix\triage-results.tsv", "audit-fix\ship-results.tsv")) {
    $src = Join-Path $REPO $tsv
    foreach ($dir in @($TRIAGE_DIR, $SHIP_DIR)) {
        $dst = Join-Path $dir $tsv
        if (Test-Path $dst) { Remove-Item $dst -Force }
        try {
            New-Item -ItemType SymbolicLink -Path $dst -Target $src -Force -ErrorAction Stop | Out-Null
            Write-Host "    Linked $tsv in $(Split-Path $dir -Leaf)/" -ForegroundColor DarkGray
        } catch {
            # Symlinks may require admin. Fall back to copy.
            Copy-Item $src $dst -Force
            Write-Host "    Copied $tsv to $(Split-Path $dir -Leaf)/ (symlink failed)" -ForegroundColor DarkYellow
        }
    }
}

Write-Host "  Autoresearch infrastructure synced" -ForegroundColor Green

# ─── Step 4: Verify audit reports exist ─────────────────────────────────

Write-Host "[4/6] Checking for audit reports..." -ForegroundColor Cyan

$hasDeepAudit = Test-Path "$TRIAGE_DIR\DEEP-AUDIT-TICKETS.md"
$hasStatAudit = Test-Path "$TRIAGE_DIR\STAT-AUDIT-REPORT.md"

if ($hasDeepAudit) {
    Write-Host "  DEEP-AUDIT-TICKETS.md found" -ForegroundColor Green
} else {
    Write-Host "  WARNING: DEEP-AUDIT-TICKETS.md not found in triage worktree" -ForegroundColor Red
    Write-Host "  The Audit Shipper needs this file. Run the Deep Audit first, or copy it:" -ForegroundColor Red
    Write-Host "    cp $REPO\DEEP-AUDIT-TICKETS.md $TRIAGE_DIR\" -ForegroundColor Yellow
}

if ($hasStatAudit) {
    Write-Host "  STAT-AUDIT-REPORT.md found" -ForegroundColor Green
} else {
    Write-Host "  STAT-AUDIT-REPORT.md not found (optional)" -ForegroundColor Yellow
}

# ─── Step 5: Pipeline health check ──────────────────────────────────────

Write-Host "[5/6] Pipeline health check..." -ForegroundColor Cyan
Set-Location $REPO
python audit-fix/prepare.py status 2>&1

# ─── Step 6: Launch both agents in parallel ─────────────────────────────

Write-Host ""
Write-Host "[6/6] Launching parallel agents..." -ForegroundColor Cyan
Write-Host ""

$trPrompt = @"
You are in C:\Users\mcgui\Documents\razzle-triage (worktree on audit/tickets branch).
Read DEEP-AUDIT-TICKETS.md and STAT-AUDIT-REPORT.md (if it exists).
For every finding: investigate the actual code, find the root cause at file:line level, decompose into atomic tickets in tickets/.
PUSH AFTER EVERY TICKET (or batch of 2-3). The Ship Loop is running in parallel and merges your branch between tasks. S0 tickets push immediately.
Do not fix code. Only write tickets. Do not stop until every finding is decomposed.
"@

$shipPrompt = @"
You are in C:\Users\mcgui\Documents\razzle-ship (worktree on ship/launch-fixes branch).
The Audit Shipper is running in parallel, writing tickets to audit/tickets branch.
At startup and between EVERY task: git fetch origin && git merge origin/audit/tickets --no-edit
Pick the highest-severity ticket from tickets/. Investigate, fix, verify, commit, push. Delete the ticket file after fixing.
If no tickets exist yet, wait 30 seconds then re-fetch. The Shipper is still writing.
Do not stop. Consume every ticket. Push to ship/launch-fixes only.
"@

Write-Host "  Starting Audit Shipper (razzle-triage/)..." -ForegroundColor Yellow
Write-Host "  Starting Ship Loop (razzle-ship/)..." -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop both agents." -ForegroundColor DarkGray
Write-Host ""

# Start Audit Shipper in background
$triageJob = Start-Job -ScriptBlock {
    param($dir, $prompt)
    Set-Location $dir
    while ($true) {
        claude --agent-name "Razzle Audit Shipper" --dangerously-skip-permissions -p $prompt 2>&1
        Start-Sleep -Seconds 5
    }
} -ArgumentList $TRIAGE_DIR, $trPrompt

# Start Ship Loop in background
$shipJob = Start-Job -ScriptBlock {
    param($dir, $prompt)
    Set-Location $dir
    # Give the Shipper a 30-second head start to write the first ticket
    Start-Sleep -Seconds 30
    while ($true) {
        claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $prompt 2>&1
        Start-Sleep -Seconds 5
    }
} -ArgumentList $SHIP_DIR, $shipPrompt

Write-Host "  Audit Shipper job: $($triageJob.Id)" -ForegroundColor Yellow
Write-Host "  Ship Loop job:     $($shipJob.Id)" -ForegroundColor Green
Write-Host ""
Write-Host "  Tailing output (Ctrl+C to stop)..." -ForegroundColor DarkGray
Write-Host ""

# Tail both job outputs
try {
    while ($true) {
        # Receive output from both jobs
        $trOut = Receive-Job -Job $triageJob -ErrorAction SilentlyContinue
        if ($trOut) {
            foreach ($line in $trOut) {
                Write-Host "[TRIAGE] $line" -ForegroundColor Yellow
            }
        }

        $shOut = Receive-Job -Job $shipJob -ErrorAction SilentlyContinue
        if ($shOut) {
            foreach ($line in $shOut) {
                Write-Host "[SHIP]   $line" -ForegroundColor Green
            }
        }

        # Check if jobs are still running
        if ($triageJob.State -eq "Failed") {
            Write-Host "[TRIAGE] JOB FAILED — restarting..." -ForegroundColor Red
            Receive-Job -Job $triageJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[TRIAGE ERROR] $_" -ForegroundColor Red }
        }
        if ($shipJob.State -eq "Failed") {
            Write-Host "[SHIP] JOB FAILED — restarting..." -ForegroundColor Red
            Receive-Job -Job $shipJob -ErrorAction SilentlyContinue | ForEach-Object { Write-Host "[SHIP ERROR] $_" -ForegroundColor Red }
        }

        Start-Sleep -Seconds 3
    }
} finally {
    Write-Host ""
    Write-Host "Stopping agents..." -ForegroundColor Cyan
    Stop-Job -Job $triageJob -ErrorAction SilentlyContinue
    Stop-Job -Job $shipJob -ErrorAction SilentlyContinue
    Remove-Job -Job $triageJob -ErrorAction SilentlyContinue
    Remove-Job -Job $shipJob -ErrorAction SilentlyContinue
    Write-Host "Done. Worktrees preserved at:" -ForegroundColor Green
    Write-Host "  $TRIAGE_DIR (audit/tickets)" -ForegroundColor Yellow
    Write-Host "  $SHIP_DIR (ship/launch-fixes)" -ForegroundColor Green
}
