# Razzle GTM Super Agent Loop
# Runs for 16 hours, cycling every 45 minutes
# Each cycle: scrape Reddit -> analyze -> produce GTM report -> iterate
#
# Usage:
#   .\run-gtm-loop.ps1                    # Full 16 hours
#   .\run-gtm-loop.ps1 -Hours 4           # Run for 4 hours
#   .\run-gtm-loop.ps1 -CycleMinutes 30   # 30 min cycles instead of 45

param(
    [int]$Hours = 16,
    [int]$CycleMinutes = 45
)

$ErrorActionPreference = "Continue"
$razzleDir = "C:\Users\mcgui\Documents\razzle"
$totalCycles = [math]::Floor(($Hours * 60) / $CycleMinutes)
$startTime = Get-Date

Set-Location $razzleDir

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  RAZZLE GTM SUPER AGENT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Duration: $Hours hours" -ForegroundColor Green
Write-Host "  Cycle interval: $CycleMinutes minutes" -ForegroundColor Green
Write-Host "  Estimated cycles: $totalCycles" -ForegroundColor Green
Write-Host "  Start: $($startTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Green
Write-Host "  End: $($startTime.AddHours($Hours).ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Green
Write-Host ""
Write-Host "  Each cycle:" -ForegroundColor Gray
Write-Host "    1. Scrape fresh Reddit data" -ForegroundColor Gray
Write-Host "    2. Run marketing research analysis" -ForegroundColor Gray
Write-Host "    3. Read all strategy docs + previous GTM report" -ForegroundColor Gray
Write-Host "    4. Produce improved GTM report (10 sections)" -ForegroundColor Gray
Write-Host "    5. Log what changed" -ForegroundColor Gray
Write-Host ""
Write-Host "  Output: docs/marketing/gtm-report.md" -ForegroundColor Yellow
Write-Host "  Log: docs/marketing/gtm-cycle-log.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Press Ctrl+C to stop early." -ForegroundColor Gray
Write-Host ""

# Verify backend is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5
    Write-Host "  Backend: running" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Backend not running. GTM agent can still analyze but can't test the product." -ForegroundColor Yellow
}

Write-Host ""

$cycle = 1

while ($true) {
    $elapsed = (Get-Date) - $startTime
    if ($elapsed.TotalHours -ge $Hours) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host "  $Hours HOURS COMPLETE" -ForegroundColor Cyan
        Write-Host "  Ran $($cycle - 1) cycles" -ForegroundColor Green
        Write-Host "  Final report: docs/marketing/gtm-report.md" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Cyan
        break
    }

    $remaining = [math]::Round($Hours - $elapsed.TotalHours, 1)

    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  CYCLE $cycle / ~$totalCycles ($remaining hours remaining)" -ForegroundColor Cyan
    Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Gray
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""

    $prompt = Get-Content "$razzleDir\gtm-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $prompt

    Write-Host ""
    Write-Host "  Cycle $cycle complete." -ForegroundColor Green

    $cycle++

    if ($elapsed.TotalHours -lt $Hours) {
        Write-Host "  Next cycle in $CycleMinutes minutes..." -ForegroundColor Gray
        Write-Host ""
        Start-Sleep -Seconds ($CycleMinutes * 60)
    }
}
