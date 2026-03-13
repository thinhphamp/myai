---
type: task
---

# Plan: Post-Plan Validation Offer

**Date:** 2026-03-12
**Goal:** Add an optional validation offer at the end of `/myai:plan` for phase and parallel plans — mirrors CCS's pattern.

## Context

- **Affects:** `.myai/commands/myai:plan.md`
- **Brainstorm:** `plans/reports/2026-03-12-brainstorm-improvements.md`

## Tasks

- [ ] 1. Read current `/myai:plan.md` to find the final output step
- [ ] 2. Add a Step 5 "Post-Plan Offer" after the plan is written:
  - For phase and parallel plans: offer "Validate this plan? (Recommended)" via `AskUserQuestion`
  - Options: "Yes → run /myai:validate" / "Skip → here's your cook command"
  - For task plans: skip validation offer (too simple), just show cook command
- [ ] 3. Update success criteria in `/myai:plan.md`

## Notes

- Validation offer is optional — users who skip are shown the cook command
- Don't auto-run validate — always let user decide
- CCS does this at plan creation time; this matches that pattern
