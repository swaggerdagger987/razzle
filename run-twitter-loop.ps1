# Razzle Twitter Loop - Fully Autonomous (Autoresearch Pattern)
#
# The closed loop:
#   Creator drafts -> Reviewer approves/rejects -> Scheduler posts ->
#   Auto-pull metrics -> Analyst finds patterns -> writes insights ->
#   Creator reads insights next invocation -> adjusts -> better tweets
#
# Zero human stops. The human steers by editing twitter/program.md.
#
# Usage:
#   cd C:\Users\mcgui\Documents\razzle
#   .\run-twitter-loop.ps1
#

$ErrorActionPreference = "Continue"
$repoDir = "C:\Users\mcgui\Documents\razzle"
$twitterDir = "C:\Users\mcgui\Documents\razzle-twitter"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RAZZLE TWITTER LOOP" -ForegroundColor Cyan
Write-Host "  Creator -> Reviewer -> Post -> Metrics -> Analyst -> Loop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# Step 1: Start the scheduler (posts approved tweets on schedule)
# ---------------------------------------------------------------------------

Write-Host "[1/5] Starting tweet scheduler..." -ForegroundColor White

$schedulerJob = Start-Job -Name "RazzleScheduler" -ScriptBlock {
    param($dir)
    Set-Location $dir
    python twitter/scheduler.py
} -ArgumentList $repoDir

Write-Host "[OK] Scheduler running (posts from queue/approved/ every 5 min)" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 2: Start the metrics auto-puller (every 30 min)
# ---------------------------------------------------------------------------

Write-Host "[2/5] Starting metrics auto-puller..." -ForegroundColor White

$metricsJob = Start-Job -Name "RazzleMetrics" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        python twitter/autopull_metrics.py --recent 2>&1
        Start-Sleep -Seconds 1800  # 30 minutes
    }
} -ArgumentList $repoDir

Write-Host "[OK] Metrics puller running (every 30 min)" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 3: Start the Creator loop
# ---------------------------------------------------------------------------

Write-Host "[3/5] Starting Creator loop..." -ForegroundColor Yellow

Start-Sleep -Seconds 5

$creatorJob = Start-Job -Name "RazzleCreator" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\twitter-creator-prompt.txt" -Raw
        claude --agent-name "Razzle Twitter Creator" --dangerously-skip-permissions -p $prompt
        # Wait 2 hours between content generation sessions
        Start-Sleep -Seconds 7200
    }
} -ArgumentList $twitterDir

Write-Host "[OK] Creator loop running (generates drafts every 2 hours)" -ForegroundColor Yellow

# ---------------------------------------------------------------------------
# Step 4: Start the Reviewer loop
# ---------------------------------------------------------------------------

Write-Host "[4/5] Starting Reviewer loop..." -ForegroundColor Magenta

Start-Sleep -Seconds 10

$reviewerJob = Start-Job -Name "RazzleReviewer" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\twitter-reviewer-prompt.txt" -Raw
        claude --agent-name "Razzle Twitter Reviewer" --dangerously-skip-permissions -p $prompt
        # Check for new drafts every 30 min
        Start-Sleep -Seconds 1800
    }
} -ArgumentList $twitterDir

Write-Host "[OK] Reviewer loop running (reviews drafts every 30 min)" -ForegroundColor Magenta

# ---------------------------------------------------------------------------
# Step 5: Start the Analyst loop
# ---------------------------------------------------------------------------

Write-Host "[5/5] Starting Analyst loop..." -ForegroundColor Cyan

Start-Sleep -Seconds 10

$analystJob = Start-Job -Name "RazzleAnalyst" -ScriptBlock {
    param($dir)
    Set-Location $dir
    while ($true) {
        $prompt = Get-Content ".\twitter-analyst-prompt.txt" -Raw
        claude --agent-name "Razzle Twitter Analyst" --dangerously-skip-permissions -p $prompt
        # Analyze every 6 hours (needs enough data to find patterns)
        Start-Sleep -Seconds 21600
    }
} -ArgumentList $twitterDir

Write-Host "[OK] Analyst loop running (analyzes every 6 hours)" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# Monitor
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "Full loop running:" -ForegroundColor White
Write-Host "  Creator:   generates 3-5 tweets -> queue/drafts/     (every 2 hours)" -ForegroundColor Yellow
Write-Host "  Reviewer:  approves/rejects drafts                    (every 30 min)" -ForegroundColor Magenta
Write-Host "  Scheduler: posts approved tweets                      (every 5 min)" -ForegroundColor Green
Write-Host "  Metrics:   pulls engagement data from Twitter API     (every 30 min)" -ForegroundColor White
Write-Host "  Analyst:   finds patterns, writes insights.md         (every 6 hours)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Steer by editing: twitter/program.md" -ForegroundColor DarkGray
Write-Host "  Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

try {
    while ($true) {
        # Relay output
        foreach ($job in @($creatorJob, $reviewerJob, $analystJob, $schedulerJob, $metricsJob)) {
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) {
                $color = switch ($job.Name) {
                    "RazzleCreator"   { "Yellow" }
                    "RazzleReviewer"  { "Magenta" }
                    "RazzleAnalyst"   { "Cyan" }
                    "RazzleScheduler" { "Green" }
                    "RazzleMetrics"   { "White" }
                    default { "Gray" }
                }
                foreach ($line in $output) {
                    Write-Host "[$($job.Name)] $line" -ForegroundColor $color
                }
            }
        }

        # Auto-restart crashed jobs
        foreach ($job in @(
            @{Job=$creatorJob; Name="RazzleCreator"; Script={
                param($dir); Set-Location $dir
                while ($true) { $p = Get-Content ".\twitter-creator-prompt.txt" -Raw; claude --agent-name "Razzle Twitter Creator" --dangerously-skip-permissions -p $p; Start-Sleep -Seconds 7200 }
            }},
            @{Job=$reviewerJob; Name="RazzleReviewer"; Script={
                param($dir); Set-Location $dir
                while ($true) { $p = Get-Content ".\twitter-reviewer-prompt.txt" -Raw; claude --agent-name "Razzle Twitter Reviewer" --dangerously-skip-permissions -p $p; Start-Sleep -Seconds 1800 }
            }},
            @{Job=$analystJob; Name="RazzleAnalyst"; Script={
                param($dir); Set-Location $dir
                while ($true) { $p = Get-Content ".\twitter-analyst-prompt.txt" -Raw; claude --agent-name "Razzle Twitter Analyst" --dangerously-skip-permissions -p $p; Start-Sleep -Seconds 21600 }
            }}
        )) {
            if ($job.Job.State -eq "Failed" -or $job.Job.State -eq "Completed") {
                Write-Host "[$($job.Name)] Restarting..." -ForegroundColor Red
                Remove-Job -Job $job.Job -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 5
                $newJob = Start-Job -Name $job.Name -ScriptBlock $job.Script -ArgumentList $twitterDir
                Set-Variable -Name ($job.Name -replace "Razzle","" -replace "^","$" | ForEach-Object { "${_}Job".ToLower() }) -Value $newJob -ErrorAction SilentlyContinue
            }
        }

        Start-Sleep -Seconds 10
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping Twitter loop..." -ForegroundColor Red
    Get-Job | Where-Object { $_.Name -like "Razzle*" } | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Where-Object { $_.Name -like "Razzle*" } | Remove-Job -ErrorAction SilentlyContinue

    # Summary
    $drafts = (Get-ChildItem "$repoDir\twitter\queue\drafts\*.md" -ErrorAction SilentlyContinue).Count
    $approved = (Get-ChildItem "$repoDir\twitter\queue\approved\*.md" -ErrorAction SilentlyContinue).Count
    $posted = (Get-ChildItem "$repoDir\twitter\queue\posted\*.md" -ErrorAction SilentlyContinue).Count
    $rejected = (Get-ChildItem "$repoDir\twitter\queue\rejected\*.md" -ErrorAction SilentlyContinue).Count

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  SESSION SUMMARY" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Drafts:   $drafts" -ForegroundColor Yellow
    Write-Host "  Approved: $approved" -ForegroundColor Green
    Write-Host "  Posted:   $posted" -ForegroundColor Green
    Write-Host "  Rejected: $rejected" -ForegroundColor Red
    Write-Host ""
}
