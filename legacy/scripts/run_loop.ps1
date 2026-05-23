# Razzle Ship Loop — PowerShell runner for Claude Code on Windows
# Usage: .\scripts\run_loop.ps1 [-MaxIterations 10]

param(
    [int]$MaxIterations = 10
)

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$PromptFile = Join-Path $RepoRoot "loop-prompt.txt"

if (-not (Test-Path $PromptFile)) {
    Write-Error "Prompt file not found: $PromptFile"
    exit 1
}

# Set git identity
git -C $RepoRoot config user.name "swaggerdagger987"
git -C $RepoRoot config user.email "swaggerdagger987@users.noreply.github.com"

$Prompt = Get-Content $PromptFile -Raw

Write-Host "=== Razzle Ship Loop ===" -ForegroundColor Cyan
Write-Host "Repo:       $RepoRoot"
Write-Host "Iterations: $MaxIterations"
Write-Host "========================" -ForegroundColor Cyan

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host ""
    Write-Host "--- Iteration $i/$MaxIterations ---" -ForegroundColor Yellow
    Write-Host ""

    # Run Claude Code with the loop prompt
    claude -p $Prompt --dangerously-skip-permissions

    # Check if all tasks are done
    $tasks = Get-Content (Join-Path $RepoRoot "LOOP-TASKS.md") -Raw
    if ($tasks -notmatch 'PENDING|FAIL \(attempt') {
        Write-Host ""
        Write-Host "=== All tasks PASS - phase complete ===" -ForegroundColor Green
        break
    }

    Write-Host ""
    Write-Host "--- Iteration $i complete ---" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Loop finished after $i iterations ===" -ForegroundColor Cyan
