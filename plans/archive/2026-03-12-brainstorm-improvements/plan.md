---
type: task
---

# Plan: Brainstorm System Improvements

**Date:** 2026-03-12
**Goal:** Identify and evaluate improvements to the myai workflow system beyond the current fix list.

## Context

- **Affects:** overall system design
- **Depends on:** nothing (can run in parallel with other plans)

## Tasks

- [x] 1. Use `brainstormer` agent to explore: what workflow steps are still clunky or missing?
- [x] 2. Evaluate: should `/myai:cook` auto-offer `/myai:validate` before executing (like CCS's plan:hard does)?
- [x] 3. Evaluate: should `myai:progress` be smarter — detect stale plans, suggest next action more precisely?
- [x] 4. Evaluate: should there be a `/myai:scout` command that maps the codebase before planning?
- [x] 5. Document agreed improvements as new task plans

## Notes

- Use the brainstormer agent (`.myai/agents/brainstormer.md`) to run this session
- Output: `plans/reports/2026-03-12-brainstorm-improvements.md` + new task plans for any agreed changes
- Don't implement during this session — brainstorm only
