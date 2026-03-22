# Razzle Content Factory - ONE LOOP. EVERYTHING.
# Scrape, research, screenshot, create, review, post. Repeat forever.

$razzleDir = "C:\Users\mcgui\Documents\razzle"
Set-Location $razzleDir

$LOW_QUEUE = 20
$POST_INTERVAL_SECONDS = 3600
$lastPostTime = [datetime]::MinValue

Write-Host "  RAZZLE CONTENT FACTORY" -ForegroundColor Cyan
Write-Host ""

try {
    Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5 | Out-Null
    Write-Host "  Backend: running" -ForegroundColor Green
} catch {
    Write-Host "  Backend not running. Start: python backend/server.py" -ForegroundColor Red
    exit 1
}

while ($true) {
    $approvedCount = @(Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count

    # POST if an hour has passed and there are approved tweets
    $sinceLastPost = ((Get-Date) - $lastPostTime).TotalSeconds
    if ($sinceLastPost -ge $POST_INTERVAL_SECONDS -and $approvedCount -gt 0) {
        Write-Host ""
        Write-Host "  POSTING $(Get-Date -Format 'HH:mm')" -ForegroundColor Green
        python -u twitter/scheduler.py --once
        $lastPostTime = Get-Date
        $approvedCount = @(Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
        $postedCount = @(Get-ChildItem "$razzleDir\twitter\queue\posted\*.md" -ErrorAction SilentlyContinue).Count
        Write-Host "  Queue: $approvedCount approved, $postedCount posted total" -ForegroundColor Gray
    }

    # REFILL if queue is low
    if ($approvedCount -lt $LOW_QUEUE) {
        Write-Host ""
        Write-Host "  REFILLING $(Get-Date -Format 'HH:mm') - queue at $approvedCount" -ForegroundColor Yellow

        Write-Host "  [1/5] Scraping Reddit..." -ForegroundColor Gray
        python scripts/reddit_scraper.py --limit 50 --no-comments 2>&1 | Select-Object -Last 2

        Write-Host "  [2/5] Marketing research..." -ForegroundColor Gray
        python scripts/marketing_research.py 2>&1 | Select-Object -Last 2

        Write-Host "  [3/5] Screenshots..." -ForegroundColor Gray
        python twitter/screenshot.py --batch 20 2>&1 | Select-Object -Last 2

        Write-Host "  [4/5] Creator agent..." -ForegroundColor Gray
        $p = Get-Content "$razzleDir\twitter-creator-prompt.txt" -Raw
        claude --agent-name "Razzle Twitter Creator" --dangerously-skip-permissions -p $p

        $draftCount = @(Get-ChildItem "$razzleDir\twitter\queue\drafts\*.md" -ErrorAction SilentlyContinue).Count
        if ($draftCount -gt 0) {
            Write-Host "  [5/5] Reviewer agent... $draftCount drafts" -ForegroundColor Gray
            $p = Get-Content "$razzleDir\twitter-reviewer-prompt.txt" -Raw
            claude --agent-name "Razzle Twitter Reviewer" --dangerously-skip-permissions -p $p
        }

        $approvedCount = @(Get-ChildItem "$razzleDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
        Write-Host "  Refill done. Queue: $approvedCount approved" -ForegroundColor Green
    }

    # Check every 5 min
    $nextPostIn = [math]::Max(0, $POST_INTERVAL_SECONDS - ((Get-Date) - $lastPostTime).TotalSeconds)
    $nextPostMin = [math]::Round($nextPostIn / 60)
    Write-Host "  $(Get-Date -Format 'HH:mm') - Queue: $approvedCount  Next post in ${nextPostMin}m" -ForegroundColor Gray
    Start-Sleep -Seconds 300
}
