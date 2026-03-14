Set-Location C:\Users\mcgui\Documents\razzle
while ($true) {
    $prompt = Get-Content .\ship-prompt.txt -Raw
    claude --agent-name "Razzle Ship Loop" --dangerously-skip-permissions -p $prompt
    Start-Sleep -Seconds 2
}
