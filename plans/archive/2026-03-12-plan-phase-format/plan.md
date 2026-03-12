---
type: task
---

# Plan: Evaluate CCS-style Phase File Format for myai:plan

**Date:** 2026-03-12
**Goal:** Decide whether `/myai:plan` should generate separate `phase-XX-name.md` files per phase (like CCS) or keep everything in a single `plan.md`.

## Context

- **Affects:** `.myai/commands/myai:plan.md`, `plans-templates/`
- **Depends on:** nothing

## Tasks

- [x] 1. Read CCS's `plan/hard.md` and `plan/fast.md` — understand exactly when and how phase files are generated
- [x] 2. Read CCS's `planning` skill — understand the "Plan Creation & Organization" rules that govern phase file structure
- [x] 3. Compare: CCS splits phases into `phase-XX-name.md` files; myai puts everything in `plan.md` — what are the trade-offs?
- [x] 4. Decide: **Keep current single-file format for task + phase plans** (see decision below)
- [x] 5. No changes needed — decision is to keep existing design
- [x] 6. No changes to `plans-templates/phase-template.md` needed

## Decision

**Keep current single-file format for task and phase plans. No adoption of CCS phase files.**

**Rationale:**
- myai already uses phase files for **parallel plans** (`type: parallel`) — this is the right scope
- `/myai:cook` step 4 detects phase files to trigger parallel execution; adding phase files to sequential phase plans would confuse this detection
- CCS phase files are heavyweight (12 sections per file: context, overview, requirements, architecture, security, etc.) — overkill for myai's task-focused workflow
- myai's "phase plan" is just a task plan linked to a ROADMAP phase; it doesn't need separate files
- Single-file is simpler to read, edit, and track in git

**Current plan types (no change):**
- Task plan → `plan.md` (single file, sequential)
- Phase plan → `plan.md` (single file, sequential, ROADMAP linkage in frontmatter)
- Parallel plan → `plan.md` overview + `phase-XX-*.md` per concurrent group (already implemented)
