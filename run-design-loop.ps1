# Razzle Design Loop
# Designer screenshots pages, writes 10 tickets per cycle.
# Shipper fixes all of them.
# Repeat forever. Leave it running overnight.

$razzleDir = "C:\Users\mcgui\Documents\razzle"
Set-Location $razzleDir

New-Item -ItemType Directory -Path "$razzleDir\designer-tickets\open" -Force | Out-Null
New-Item -ItemType Directory -Path "$razzleDir\designer-tickets\done" -Force | Out-Null
New-Item -ItemType Directory -Path "$razzleDir\designer-screenshots" -Force | Out-Null

Write-Host "  RAZZLE DESIGN LOOP" -ForegroundColor Cyan
Write-Host "  10 tickets per cycle. Runs forever." -ForegroundColor Cyan
Write-Host ""

try {
    Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5 | Out-Null
    Write-Host "  Backend: running" -ForegroundColor Green
} catch {
    Write-Host "  Backend not running. Start: python backend/server.py" -ForegroundColor Red
    exit 1
}

$cycle = 1

while ($true) {
    $doneCount = @(Get-ChildItem "$razzleDir\designer-tickets\done\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host ""
    Write-Host "  CYCLE $cycle  $(Get-Date -Format 'HH:mm')  Total fixes: $doneCount" -ForegroundColor Cyan

    # DESIGNER: browse site, write 10 tickets
    Write-Host "  [DESIGNER] Reviewing site, writing 10 tickets..." -ForegroundColor Yellow
    $dp = Get-Content "$razzleDir\designer-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $dp

    $openCount = @(Get-ChildItem "$razzleDir\designer-tickets\open\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Open tickets: $openCount" -ForegroundColor Green

    if ($openCount -eq 0) {
        Write-Host "  No tickets. Site might be perfect. Checking again in 30 min." -ForegroundColor Green
        Start-Sleep -Seconds 1800
        continue
    }

    # SHIPPER: fix all open tickets
    Write-Host "  [SHIPPER] Fixing $openCount tickets..." -ForegroundColor Yellow
    $sp = Get-Content "$razzleDir\shipper-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $sp

    # Backup commit from loop
    git add -A 2>$null
    git commit -m "design loop cycle $cycle" 2>$null

    $doneCount = @(Get-ChildItem "$razzleDir\designer-tickets\done\*.md" -ErrorAction SilentlyContinue).Count
    $remainingOpen = @(Get-ChildItem "$razzleDir\designer-tickets\open\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Cycle $cycle done. Total fixed: $doneCount  Remaining: $remainingOpen" -ForegroundColor Green

    $cycle++
    Start-Sleep -Seconds 5
}
