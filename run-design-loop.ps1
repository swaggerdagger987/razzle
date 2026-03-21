# Razzle Design Loop
# Designer screenshots a page, writes ONE tiny ticket.
# Shipper fixes it, screenshots the result.
# Repeat forever. 100-300 small fixes until perfect.

$razzleDir = "C:\Users\mcgui\Documents\razzle"
Set-Location $razzleDir

New-Item -ItemType Directory -Path "$razzleDir\designer-tickets" -Force | Out-Null
New-Item -ItemType Directory -Path "$razzleDir\designer-tickets\done" -Force | Out-Null
New-Item -ItemType Directory -Path "$razzleDir\designer-screenshots" -Force | Out-Null

Write-Host ""
Write-Host "  RAZZLE DESIGN LOOP" -ForegroundColor Cyan
Write-Host "  Designer sees. Shipper fixes. One at a time." -ForegroundColor Cyan
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
    Write-Host ""
    Write-Host "  CYCLE $cycle - $(Get-Date -Format 'HH:mm')" -ForegroundColor Cyan
    $doneCount = @(Get-ChildItem "$razzleDir\designer-tickets\done\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Fixes completed so far: $doneCount" -ForegroundColor Gray

    # DESIGNER: look at the site, write one ticket
    Write-Host ""
    Write-Host "  [DESIGNER] Reviewing site..." -ForegroundColor Yellow
    $dp = Get-Content "$razzleDir\designer-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $dp

    $ticketCount = @(Get-ChildItem "$razzleDir\designer-tickets\*.md" -ErrorAction SilentlyContinue).Count
    if ($ticketCount -eq 0) {
        Write-Host "  Designer found nothing to fix. Waiting 10 min." -ForegroundColor Green
        Start-Sleep -Seconds 600
        continue
    }

    $ticketFile = (Get-ChildItem "$razzleDir\designer-tickets\*.md" | Sort-Object Name | Select-Object -First 1).Name
    Write-Host "  Ticket: $ticketFile" -ForegroundColor Green

    # SHIPPER: fix the ticket
    Write-Host ""
    Write-Host "  [SHIPPER] Fixing..." -ForegroundColor Yellow
    $sp = Get-Content "$razzleDir\shipper-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $sp

    # Commit from loop as backup
    git add -A 2>$null
    $commitMsg = "design fix $cycle - $ticketFile"
    git commit -m $commitMsg 2>$null

    $doneCount = @(Get-ChildItem "$razzleDir\designer-tickets\done\*.md" -ErrorAction SilentlyContinue).Count
    Write-Host "  Total fixes: $doneCount" -ForegroundColor Green

    $cycle++
    Start-Sleep -Seconds 5
}
