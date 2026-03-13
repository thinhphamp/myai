---
type: task
---

# Plan: Gitignore .claude/

**Date:** 2026-03-12
**Goal:** Remove `.claude/` from the source repo — it's a user installation artifact, not source.

## Context

- **Affects:** `.gitignore`, repo cleanliness
- **Depends on:** nothing

## Tasks

- [x] 1. Check if `.gitignore` exists at repo root — create if not
- [x] 2. Add `.claude/` to `.gitignore`
- [x] 3. Confirm `.myai/` is NOT gitignored (it's the source template)
- [x] 4. Verify `.myai/` has everything `.claude/` has — any files in `.claude/` not in `.myai/` need to be moved first

## Notes

- `.myai/` is the source of truth, installed into projects as `.claude/` (for Claude Code) or `.opencode/` (for OpenCode)
- Do NOT delete `.claude/` manually — just gitignore it going forward
