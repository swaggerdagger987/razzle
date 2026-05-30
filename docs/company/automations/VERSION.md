# Automation Prompt Version

Current version: `2026-05-31.v2`

This version string should be copied into the top of each prompt body in the
Cursor dashboard automation config.

Changes in v2:

- 24/7 factory loop (tick continues atoms while workday open)
- `current-epic.json` epic queue
- CEO Slack format ([SLACK-FORMATS.md](../SLACK-FORMATS.md)) — T1 10–15 words
- `good evening team` as factory brake
- [FACTORY-VISION.md](../FACTORY-VISION.md) — Stage D lights-out BUILD

Nightly review should include:

- repo prompt version
- dashboard prompt version (as reported by the operator)
- sync status: in-sync / drift
