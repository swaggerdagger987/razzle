# Razzle GTM Super Agent — Autoresearch Loop
#
# Karpathy pattern: research -> write -> critique -> fill gaps -> critique again -> repeat
# Each cycle the agent goes DEEPER, not wider. The critique phase forces it to
# find its own blind spots and research them specifically.
#
# Usage:
#   .\run-gtm-loop.ps1                    # Full 16 hours
#   .\run-gtm-loop.ps1 -Hours 4           # Run for 4 hours
#   .\run-gtm-loop.ps1 -CycleMinutes 60   # Longer cycles (deeper per cycle)

param(
    [int]$Hours = 16,
    [int]$CycleMinutes = 60
)

$ErrorActionPreference = "Continue"
$razzleDir = "C:\Users\mcgui\Documents\razzle"
$totalCycles = [math]::Floor(($Hours * 60) / $CycleMinutes)
$startTime = Get-Date

Set-Location $razzleDir

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  RAZZLE GTM SUPER AGENT (AUTORESEARCH)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Duration:   $Hours hours" -ForegroundColor Green
Write-Host "  Cycle time: $CycleMinutes min" -ForegroundColor Green
Write-Host "  Cycles:     ~$totalCycles" -ForegroundColor Green
Write-Host "  Start:      $($startTime.ToString('HH:mm'))" -ForegroundColor Green
Write-Host "  End:        $($startTime.AddHours($Hours).ToString('HH:mm'))" -ForegroundColor Green
Write-Host ""
Write-Host "  Each cycle:" -ForegroundColor Gray
Write-Host "    1. GATHER  - scrape Reddit, web search competitors, read docs" -ForegroundColor Gray
Write-Host "    2. WRITE   - produce 10-section GTM report" -ForegroundColor Gray
Write-Host "    3. CRITIQUE - flag gaps, vague claims, missing data" -ForegroundColor Gray
Write-Host "    4. FILL    - research specific gaps, integrate findings" -ForegroundColor Gray
Write-Host "    5. CRITIQUE AGAIN - repeat until flags < 5" -ForegroundColor Gray
Write-Host "    6. MODEL   - update financial projections" -ForegroundColor Gray
Write-Host "    7. LOG     - record what changed, commit" -ForegroundColor Gray
Write-Host ""
Write-Host "  Output:  docs/marketing/gtm-report.md" -ForegroundColor Yellow
Write-Host "  Log:     docs/marketing/gtm-cycle-log.md" -ForegroundColor Yellow
Write-Host ""

$cycle = 1

while ($true) {
    $elapsed = (Get-Date) - $startTime
    if ($elapsed.TotalHours -ge $Hours) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host "  $Hours HOURS COMPLETE - $($cycle - 1) cycles run" -ForegroundColor Cyan
        Write-Host "  Final report: docs/marketing/gtm-report.md" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Cyan
        break
    }

    $remaining = [math]::Round($Hours - $elapsed.TotalHours, 1)

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  CYCLE $cycle / ~$totalCycles ($remaining hrs left)" -ForegroundColor Cyan
    Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""

    # Run the GTM agent with full autoresearch prompt
    $prompt = Get-Content "$razzleDir\gtm-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $prompt

    Write-Host ""
    Write-Host "  Cycle $cycle complete." -ForegroundColor Green

    # Show quick stats
    if (Test-Path "$razzleDir\docs\marketing\gtm-report.md") {
        $lines = (Get-Content "$razzleDir\docs\marketing\gtm-report.md" | Measure-Object -Line).Lines
        Write-Host "  Report: $lines lines" -ForegroundColor Gray
    }
    if (Test-Path "$razzleDir\docs\marketing\gtm-cycle-log.md") {
        $logCycles = (Select-String -Path "$razzleDir\docs\marketing\gtm-cycle-log.md" -Pattern "^## Cycle" | Measure-Object).Count
        Write-Host "  Log: $logCycles cycles recorded" -ForegroundColor Gray
    }

    $cycle++

    # Wait for next cycle
    if ($elapsed.TotalHours -lt $Hours) {
        $nextTime = (Get-Date).AddMinutes($CycleMinutes).ToString("HH:mm")
        Write-Host "  Next cycle at $nextTime" -ForegroundColor Gray
        Start-Sleep -Seconds ($CycleMinutes * 60)
    }
}
