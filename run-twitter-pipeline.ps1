# Razzle Twitter Pipeline
# Runs: Creator -> Reviewer -> Scheduler
#
# Usage:
#   .\run-twitter-pipeline.ps1              # Run Creator + Reviewer, then start Scheduler
#   .\run-twitter-pipeline.ps1 -SkipCreate  # Skip Creator, just review + schedule
#   .\run-twitter-pipeline.ps1 -ScheduleOnly # Just start the scheduler (drafts already approved)
#
# The Creator generates 50-100 drafts with Lab screenshots.
# The Reviewer (Brand Guardian + Whimsy Injector + CEO) filters them.
# The Scheduler posts ONE approved tweet every 2 hours.

param(
    [switch]$SkipCreate,
    [switch]$ScheduleOnly
)

$ErrorActionPreference = "Stop"
$razzleDir = "C:\Users\mcgui\Documents\razzle"

Set-Location $razzleDir

# Verify backend is running
Write-Host ""
Write-Host "=== Checking backend ===" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5
    Write-Host "Backend is running: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend is not running. Start it first:" -ForegroundColor Red
    Write-Host "  cd $razzleDir && python backend/server.py" -ForegroundColor Yellow
    exit 1
}

if (-not $ScheduleOnly) {
    if (-not $SkipCreate) {
        # Step 1: Creator agent generates bulk drafts with screenshots
        Write-Host ""
        Write-Host "=== Step 1: Creator Agent - Generating drafts with screenshots ===" -ForegroundColor Cyan
        Write-Host "This will take several minutes. The Creator will:" -ForegroundColor Yellow
        Write-Host "  1. Query the Lab API for real player data" -ForegroundColor Yellow
        Write-Host "  2. Take 30+ Lab screenshots via Playwright" -ForegroundColor Yellow
        Write-Host "  3. Generate 50-100 tweet drafts with screenshot attachments" -ForegroundColor Yellow
        Write-Host ""

        $creatorPrompt = Get-Content "$razzleDir\twitter-creator-prompt.txt" -Raw
        claude --agent-name "Razzle Twitter Creator" --dangerously-skip-permissions -p $creatorPrompt

        # Check results
        $draftCount = (Get-ChildItem "$razzleDir\twitter\queue\drafts\*.md" -ErrorAction SilentlyContinue).Count
        Write-Host ""
        Write-Host "Creator finished. Drafts generated: $draftCount" -ForegroundColor Green

        if ($draftCount -eq 0) {
            Write-Host "ERROR: No drafts generated. Check Creator output above." -ForegroundColor Red
            exit 1
        }
    }

    # Step 2: Reviewer agent filters drafts (Brand Guardian + Whimsy Injector + CEO)
    Write-Host ""
    Write-Host "=== Step 2: Reviewer Agent - Quality control ===" -ForegroundColor Cyan
    Write-Host "Three personas review every draft:" -ForegroundColor Yellow
    Write-Host "  1. Brand Guardian (voice rules, banned phrases, screenshot check)" -ForegroundColor Yellow
    Write-Host "  2. Whimsy Injector (personality, scroll-stopping power)" -ForegroundColor Yellow
    Write-Host "  3. CEO Review / Razzle himself (brand, credibility, final call)" -ForegroundColor Yellow
    Write-Host ""

    $reviewerPrompt = Get-Content "$razzleDir\twitter-reviewer-prompt.txt" -Raw
    claude --agent-name "Razzle Twitter Reviewer" --dangerously-skip-permissions -p $reviewerPrompt

    # Check results
    $approvedCount = (Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
    $rejectedCount = (Get-ChildItem "$razzleDir\twitter\queue\rejected\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host ""
    Write-Host "Reviewer finished. Approved: $approvedCount | Rejected: $rejectedCount" -ForegroundColor Green

    if ($approvedCount -eq 0) {
        Write-Host "ERROR: No drafts approved. Check Reviewer output above." -ForegroundColor Red
        Write-Host "Rejected drafts are in twitter/queue/rejected/ with feedback files." -ForegroundColor Yellow
        exit 1
    }
}

# Step 3: Start the Scheduler (posts ONE tweet every 2 hours)
Write-Host ""
Write-Host "=== Step 3: Scheduler - Posting 1 tweet every 2 hours ===" -ForegroundColor Cyan
$approvedCount = (Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
Write-Host "Approved tweets in queue: $approvedCount" -ForegroundColor Green
Write-Host "Every tweet includes a Lab screenshot." -ForegroundColor Green
Write-Host "Posting one every 2 hours. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

python twitter/scheduler.py
