# Razzle Sprint Researcher
# One question per invocation. 100 iterations. No waiting between cycles.
# Karpathy autoresearch: each answer generates the next question.

$razzleDir = "C:\Users\mcgui\Documents\razzle"
Set-Location $razzleDir

$maxIterations = 100

Write-Host "  RAZZLE SPRINT RESEARCHER" -ForegroundColor Cyan
Write-Host "  100 iterations. One question at a time. No stops." -ForegroundColor Cyan
Write-Host ""

for ($i = 1; $i -le $maxIterations; $i++) {
    Write-Host "  Q$i / $maxIterations  $(Get-Date -Format 'HH:mm')" -ForegroundColor Yellow

    $p = Get-Content "$razzleDir\sprint-prompt.txt" -Raw
    claude --dangerously-skip-permissions -p $p

    # Backup commit from loop
    git add docs/marketing/sprint/journal.md 2>$null
    git commit -m "sprint Q$i" 2>$null

    if ($i % 10 -eq 0) {
        $lines = 0
        if (Test-Path "$razzleDir\docs\marketing\sprint-journal.md") {
            $lines = (Get-Content "$razzleDir\docs\marketing\sprint-journal.md" | Measure-Object -Line).Lines
        }
        Write-Host "  --- CHECKPOINT $i --- journal: $lines lines" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "  SPRINT COMPLETE. 100 questions answered." -ForegroundColor Green
Write-Host "  Journal: docs/marketing/sprint/journal.md" -ForegroundColor Green
