# Razzle Content Factory — FULLY AUTONOMOUS
#
# This is the entire firm. It never stops. It runs forever until you kill it.
#
# Every cycle:
#   1. Scrape Reddit for fresh content fuel
#   2. Analyze marketing research
#   3. Take fresh Lab screenshots
#   4. Creator agent generates 50+ drafts with screenshots
#   5. Reviewer agent filters (Brand Guardian + Whimsy + CEO)
#   6. Scheduler posts 1 approved tweet per hour (runs in background, always)
#   7. When queue drops below 20, loop back to step 1
#
# The scheduler runs CONTINUOUSLY in the background.
# The content generation loop runs whenever the queue needs refilling.
#
# Usage:
#   .\run-content-loop.ps1

$ErrorActionPreference = "Continue"
$razzleDir = "C:\Users\mcgui\Documents\razzle"
Set-Location $razzleDir

$LOW_QUEUE = 20  # Regenerate content when approved queue drops below this

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  RAZZLE CONTENT FACTORY" -ForegroundColor Cyan
Write-Host "  Fully autonomous. Runs forever." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- Verify backend ---
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5
    Write-Host "  Backend: running" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Backend not running. Start it: python backend/server.py" -ForegroundColor Red
    exit 1
}

# --- Start scheduler in background (if not already running) ---
function Start-Scheduler {
    $existingPid = $null
    if (Test-Path "$razzleDir\twitter\.scheduler-pid") {
        $existingPid = Get-Content "$razzleDir\twitter\.scheduler-pid" -ErrorAction SilentlyContinue
        $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Scheduler already running (PID: $existingPid)" -ForegroundColor Green
            return
        }
    }
    Write-Host "  Starting scheduler (1 tweet/hour)..." -ForegroundColor Yellow
    $job = Start-Process -FilePath "python" -ArgumentList "-u","twitter/scheduler.py" -WorkingDirectory $razzleDir -WindowStyle Hidden -RedirectStandardOutput "twitter/.scheduler.log" -RedirectStandardError "twitter/.scheduler.err" -PassThru
    $job.Id | Out-File "$razzleDir\twitter\.scheduler-pid" -Force
    Write-Host "  Scheduler started (PID: $($job.Id))" -ForegroundColor Green
}

Start-Scheduler

# --- Main content generation loop ---
$cycle = 1

while ($true) {
    # Check approved queue size
    $approvedCount = (Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
    $postedCount = (Get-ChildItem "$razzleDir\twitter\queue\posted\*.md" -ErrorAction SilentlyContinue).Count

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  STATUS CHECK — $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  Approved queue: $approvedCount tweets" -ForegroundColor $(if ($approvedCount -lt $LOW_QUEUE) { "Red" } else { "Green" })
    Write-Host "  Total posted: $postedCount tweets" -ForegroundColor Gray

    # Make sure scheduler is still alive
    Start-Scheduler

    if ($approvedCount -ge $LOW_QUEUE) {
        Write-Host "  Queue healthy ($approvedCount >= $LOW_QUEUE). Checking again in 30 min." -ForegroundColor Green
        Start-Sleep -Seconds 1800
        continue
    }

    # Queue is low — run the full content generation pipeline
    Write-Host ""
    Write-Host "  Queue below $LOW_QUEUE. Generating new content..." -ForegroundColor Yellow
    Write-Host ""

    # STEP 1: Scrape Reddit
    Write-Host "  [1/5] Scraping Reddit..." -ForegroundColor Yellow
    python scripts/reddit_scraper.py --limit 50 --no-comments 2>&1 | Select-Object -Last 3

    # STEP 2: Marketing research
    Write-Host "  [2/5] Analyzing market data..." -ForegroundColor Yellow
    python scripts/marketing_research.py 2>&1 | Select-Object -Last 3

    # STEP 3: Screenshots
    Write-Host "  [3/5] Taking Lab screenshots..." -ForegroundColor Yellow
    python twitter/screenshot.py --batch 20 2>&1 | Select-Object -Last 3

    # STEP 4: Creator agent
    Write-Host ""
    Write-Host "  [4/5] Creator agent generating drafts..." -ForegroundColor Yellow
    Write-Host "  (This takes 10-15 min)" -ForegroundColor Gray
    $creatorPrompt = Get-Content "$razzleDir\twitter-creator-prompt.txt" -Raw
    claude --agent-name "Razzle Twitter Creator" --dangerously-skip-permissions -p $creatorPrompt

    $draftCount = (Get-ChildItem "$razzleDir\twitter\queue\drafts\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Drafts generated: $draftCount" -ForegroundColor Green

    if ($draftCount -eq 0) {
        Write-Host "  Creator produced nothing. Retrying in 30 min." -ForegroundColor Red
        Start-Sleep -Seconds 1800
        continue
    }

    # STEP 5: Reviewer agent
    Write-Host ""
    Write-Host "  [5/5] Reviewer agent filtering..." -ForegroundColor Yellow
    Write-Host "  (Brand Guardian + Whimsy + CEO — all 3 must approve)" -ForegroundColor Gray
    $reviewerPrompt = Get-Content "$razzleDir\twitter-reviewer-prompt.txt" -Raw
    claude --agent-name "Razzle Twitter Reviewer" --dangerously-skip-permissions -p $reviewerPrompt

    $newApproved = (Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
    $rejectedCount = (Get-ChildItem "$razzleDir\twitter\queue\rejected\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host ""
    Write-Host "  Approved: $newApproved | Rejected: $rejectedCount" -ForegroundColor Green

    # Make sure scheduler is alive after the long agent runs
    Start-Scheduler

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  CYCLE $cycle COMPLETE" -ForegroundColor Cyan
    Write-Host "  Queue refilled: $newApproved approved tweets" -ForegroundColor Green
    Write-Host "  Scheduler posting 1/hour in background" -ForegroundColor Green
    Write-Host "  Next check in 30 min" -ForegroundColor Gray
    Write-Host "============================================" -ForegroundColor Cyan

    $cycle++
    Start-Sleep -Seconds 1800
}
