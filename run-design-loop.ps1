# Razzle Design Loop: Designer -> PM -> Shipper
# Designer finds problems. PM breaks big ones into small tickets. Shipper fixes them.
# Runs forever. Leave it overnight.

$razzleDir = "C:\Users\mcgui\Documents\razzle"
Set-Location $razzleDir

New-Item -ItemType Directory -Path "$razzleDir\designer-tickets\open" -Force | Out-Null
New-Item -ItemType Directory -Path "$razzleDir\designer-tickets\done" -Force | Out-Null
New-Item -ItemType Directory -Path "$razzleDir\designer-tickets\epics" -Force | Out-Null
New-Item -ItemType Directory -Path "$razzleDir\designer-screenshots" -Force | Out-Null

Write-Host "  RAZZLE DESIGN LOOP" -ForegroundColor Cyan
Write-Host "  Designer -> PM -> Shipper" -ForegroundColor Cyan
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

    # DESIGNER: browse site, find 10 problems
    Write-Host "  [DESIGNER] Reviewing site..." -ForegroundColor Yellow
    $dp = Get-Content "$razzleDir\designer-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $dp

    $openCount = @(Get-ChildItem "$razzleDir\designer-tickets\open\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Designer found: $openCount tickets" -ForegroundColor Green

    if ($openCount -eq 0) {
        Write-Host "  Nothing found. Checking again in 30 min." -ForegroundColor Green
        Start-Sleep -Seconds 1800
        continue
    }

    # PM: decompose big tickets into small ones
    Write-Host "  [PM] Breaking down tickets..." -ForegroundColor Yellow
    $pm = Get-Content "$razzleDir\pm-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $pm

    $openCount = @(Get-ChildItem "$razzleDir\designer-tickets\open\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Ready for shipper: $openCount tickets" -ForegroundColor Green

    # SHIPPER: fix all open tickets
    Write-Host "  [SHIPPER] Fixing $openCount tickets..." -ForegroundColor Yellow
    $sp = Get-Content "$razzleDir\shipper-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $sp

    # Backup commit
    git add -A 2>$null
    git commit -m "design loop cycle $cycle" 2>$null

    $doneCount = @(Get-ChildItem "$razzleDir\designer-tickets\done\*.md" -ErrorAction SilentlyContinue).Count
    $remainingOpen = @(Get-ChildItem "$razzleDir\designer-tickets\open\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Done: $doneCount total  Remaining: $remainingOpen" -ForegroundColor Green

    $cycle++
    Start-Sleep -Seconds 5
}
