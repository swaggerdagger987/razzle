# Razzle Loop — Ticket Queue

> Drop phase specs here. The loop checks this file before auto-generating its next phase.
> When a ticket is consumed, it gets deleted from this file.
> Format: each ticket is a full phase spec (same format as LOOP-TASKS.md).
> Multiple tickets = multiple phases, executed in order (first one becomes next phase).

---

## Expand Data to 2015-2025 (NFL + College)
**Exit Criterion**: Both NFL and college data adapters fetch and load seasons 2015 through 2025 into terminal.db. The Lab's year/season filters reflect all available years. All screener queries, panels, and charts work correctly across the full 2015-2025 range. Currently only 2024 data is loaded — this must cover all 11 seasons.

## Remove Prospects Section — Merge into College Filter
**Exit Criterion**: The standalone Prospects panel/section is removed. Prospect data (combine metrics, athletic profiles, radar charts) is accessible as a filter or view mode within the existing College section of The Lab. Users can still see combine stats, radar charts, and athletic grades — but through the college filter, not a separate prospects area.
