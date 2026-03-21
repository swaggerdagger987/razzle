# Razzle Content Loop
# Full autonomous pipeline: Scrape -> Research -> Screenshot -> Create -> Review -> Schedule
#
# Usage:
#   .\run-content-loop.ps1                # Full pipeline
#   .\run-content-loop.ps1 -SkipScrape    # Skip Reddit scrape (use existing data)
#   .\run-content-loop.ps1 -SkipCreate    # Skip to review + schedule (drafts already exist)
#   .\run-content-loop.ps1 -ScheduleOnly  # Just start scheduler (approved tweets ready)
#
# Pipeline:
#   1. Scrape Reddit (DynastyFF, SleeperApp, fantasyfootball, etc.)
#   2. Run marketing research (pain points, language, agent profiles)
#   3. Take Lab screenshots for tweet images
#   4. Creator agent generates 50-100 drafts with screenshots + real data
#   5. Reviewer agent filters (Brand Guardian + Whimsy + CEO - all 3 must approve)
#   6. Scheduler posts 1 approved tweet every 2 hours

param(
    [switch]$SkipScrape,
    [switch]$SkipCreate,
    [switch]$ScheduleOnly
)

$ErrorActionPreference = "Stop"
$razzleDir = "C:\Users\mcgui\Documents\razzle"

Set-Location $razzleDir

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  RAZZLE CONTENT LOOP" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# --- STEP 0: Verify backend is running ---
Write-Host "[Step 0] Checking backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5
    Write-Host "  Backend running: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Backend not running. Start it first:" -ForegroundColor Red
    Write-Host "  python backend/server.py" -ForegroundColor Yellow
    exit 1
}

if (-not $ScheduleOnly) {
    if (-not $SkipCreate) {
        if (-not $SkipScrape) {
            # --- STEP 1: Scrape Reddit ---
            Write-Host ""
            Write-Host "[Step 1] Scraping Reddit..." -ForegroundColor Yellow
            Write-Host "  Pulling from 10 fantasy football subreddits" -ForegroundColor Gray
            Write-Host "  Rate limited at ~8 req/min (no OAuth)" -ForegroundColor Gray
            Write-Host "  This takes 15-20 minutes" -ForegroundColor Gray
            Write-Host ""

            python scripts/reddit_scraper.py --limit 100 --no-comments

            $scrapeFiles = Get-ChildItem "$razzleDir\data\reddit\*.json" -ErrorAction SilentlyContinue
            if ($scrapeFiles.Count -eq 0) {
                Write-Host "  ERROR: No scrape data found. Check output above." -ForegroundColor Red
                exit 1
            }
            $totalSize = ($scrapeFiles | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "  Scrape complete: $($scrapeFiles.Count) files, $([math]::Round($totalSize, 1)) MB" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "[Step 1] Skipping Reddit scrape (using existing data)" -ForegroundColor Gray
        }

        # --- STEP 2: Marketing Research ---
        Write-Host ""
        Write-Host "[Step 2] Running marketing research..." -ForegroundColor Yellow
        Write-Host "  Analyzing pain points, language, tool sentiment" -ForegroundColor Gray
        Write-Host "  Mapping findings to 6 agents" -ForegroundColor Gray
        Write-Host ""

        python scripts/marketing_research.py

        if (-not (Test-Path "$razzleDir\docs\marketing\marketing_research.md")) {
            Write-Host "  ERROR: Marketing research failed." -ForegroundColor Red
            exit 1
        }
        Write-Host "  Research complete: docs/marketing/marketing_research.md" -ForegroundColor Green

        # --- STEP 3: Take Lab Screenshots ---
        Write-Host ""
        Write-Host "[Step 3] Taking Lab screenshots..." -ForegroundColor Yellow
        Write-Host "  30 screenshots across screener views and panels" -ForegroundColor Gray
        Write-Host ""

        python twitter/screenshot.py --batch 30

        $shotCount = (Get-ChildItem "$razzleDir\twitter\screenshots\*.png" -ErrorAction SilentlyContinue).Count
        Write-Host "  Screenshots taken: $shotCount" -ForegroundColor Green

        if ($shotCount -eq 0) {
            Write-Host "  ERROR: No screenshots taken. Is the backend serving frontend?" -ForegroundColor Red
            exit 1
        }

        # --- STEP 4: Creator Agent ---
        Write-Host ""
        Write-Host "[Step 4] Running Creator agent..." -ForegroundColor Yellow
        Write-Host "  Generating 50-100 tweet drafts with:" -ForegroundColor Gray
        Write-Host "    - Real player data from Lab API" -ForegroundColor Gray
        Write-Host "    - Lab screenshots attached to every tweet" -ForegroundColor Gray
        Write-Host "    - Marketing research for content direction" -ForegroundColor Gray
        Write-Host "    - Agent-voiced templates (Hawkeye, Bones, etc.)" -ForegroundColor Gray
        Write-Host ""

        $creatorPrompt = Get-Content "$razzleDir\twitter-creator-prompt.txt" -Raw
        claude --agent-name "Razzle Twitter Creator" --dangerously-skip-permissions -p $creatorPrompt

        $draftCount = (Get-ChildItem "$razzleDir\twitter\queue\drafts\*.md" -ErrorAction SilentlyContinue).Count
        Write-Host ""
        Write-Host "  Creator finished: $draftCount drafts generated" -ForegroundColor Green

        if ($draftCount -eq 0) {
            Write-Host "  ERROR: No drafts generated. Check Creator output above." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "[Steps 1-4] Skipped (using existing drafts)" -ForegroundColor Gray
    }

    # --- STEP 5: Reviewer Agent ---
    $draftCount = (Get-ChildItem "$razzleDir\twitter\queue\drafts\*.md" -ErrorAction SilentlyContinue).Count

    if ($draftCount -eq 0) {
        Write-Host ""
        Write-Host "[Step 5] No drafts to review. Checking approved queue..." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "[Step 5] Running Reviewer agent..." -ForegroundColor Yellow
        Write-Host "  $draftCount drafts to review" -ForegroundColor Gray
        Write-Host "  Three personas (ALL must approve):" -ForegroundColor Gray
        Write-Host "    1. Brand Guardian - voice rules, banned phrases, screenshot check" -ForegroundColor Gray
        Write-Host "    2. Whimsy Injector - personality, scroll-stopping power (3+/5)" -ForegroundColor Gray
        Write-Host "    3. CEO Review (Razzle) - brand, credibility, final call" -ForegroundColor Gray
        Write-Host ""

        $reviewerPrompt = Get-Content "$razzleDir\twitter-reviewer-prompt.txt" -Raw
        claude --agent-name "Razzle Twitter Reviewer" --dangerously-skip-permissions -p $reviewerPrompt

        $approvedCount = (Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
        $rejectedCount = (Get-ChildItem "$razzleDir\twitter\queue\rejected\*.md" -ErrorAction SilentlyContinue).Count
        Write-Host ""
        Write-Host "  Review complete: $approvedCount approved, $rejectedCount rejected" -ForegroundColor Green

        if ($approvedCount -eq 0) {
            Write-Host "  ERROR: No drafts approved. Check rejected/ for feedback." -ForegroundColor Red
            Write-Host "  Re-run with -SkipScrape to regenerate drafts." -ForegroundColor Yellow
            exit 1
        }
    }
}

# --- STEP 6: Start Scheduler (background, automatic) ---
$approvedCount = (Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count

if ($approvedCount -eq 0) {
    Write-Host ""
    Write-Host "[Step 6] No approved tweets in queue. Nothing to schedule." -ForegroundColor Red
    Write-Host "  Run the full pipeline first: .\run-content-loop.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  [Step 6] SCHEDULER - STARTING" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Approved tweets in queue: $approvedCount" -ForegroundColor Green
Write-Host "  Every tweet has a Lab screenshot attached" -ForegroundColor Green
Write-Host "  Posting 1 tweet every hour" -ForegroundColor Green
Write-Host ""

# Post the first tweet immediately
Write-Host "  Posting first tweet now..." -ForegroundColor Yellow
python twitter/scheduler.py --once

# Start the scheduler as a background job that survives this script
Write-Host ""
Write-Host "  Starting background scheduler (1 tweet/hour)..." -ForegroundColor Yellow
$schedulerJob = Start-Process -FilePath "python" -ArgumentList "twitter/scheduler.py" -WorkingDirectory $razzleDir -WindowStyle Hidden -PassThru
Write-Host "  Scheduler running in background (PID: $($schedulerJob.Id))" -ForegroundColor Green
Write-Host "  To stop: Stop-Process -Id $($schedulerJob.Id)" -ForegroundColor Gray
Write-Host ""

# Save PID so we can check/kill later
$schedulerJob.Id | Out-File "$razzleDir\twitter\.scheduler-pid" -Force

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  CONTENT LOOP COMPLETE" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Scheduler is running. Tweets will post every hour." -ForegroundColor Green
Write-Host "  $approvedCount tweets in queue = ~$approvedCount hours of content." -ForegroundColor Green
Write-Host ""
Write-Host "  To check status:  Get-Process -Id (Get-Content $razzleDir\twitter\.scheduler-pid)" -ForegroundColor Gray
Write-Host "  To stop:          Stop-Process -Id (Get-Content $razzleDir\twitter\.scheduler-pid)" -ForegroundColor Gray
Write-Host "  To re-run loop:   .\run-content-loop.ps1 -SkipScrape" -ForegroundColor Gray
