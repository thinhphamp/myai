---
type: task
---

# Plan: Stale Plan Detection in myai:progress

**Date:** 2026-03-12
**Goal:** Surface zombie plans (PROGRESS.md older than 7 days without SUMMARY.md) in the progress report.

## Context

- **Affects:** `.myai/commands/myai:progress.md`
- **Brainstorm:** `plans/reports/2026-03-12-brainstorm-improvements.md`

## Tasks

- [ ] 1. Read current `/myai:progress.md` Step 3 (Scan Plans Directory)
- [ ] 2. Add stale detection logic in Step 3:
  - For each plan with PROGRESS.md but no SUMMARY.md: check file modification date
  - If PROGRESS.md is older than 7 days → mark as "⚠ Stale"
  - Bash: `find plans/*/PROGRESS.md -mtime +7 2>/dev/null`
- [ ] 3. Add stale plans to the status report output (show under Blockers or separate "Stale Plans" section)
- [ ] 4. Update success criteria

## Notes

- 7 days is the threshold — no config needed
- Stale plans should route to `/myai:resume` or `/myai:archive` depending on user intent
- Show in Step 6 output under: "## Stale Plans (paused >7d)" with plan path + days since last update
