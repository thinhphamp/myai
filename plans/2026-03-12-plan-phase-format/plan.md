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

- [ ] 1. Read CCS's `plan/hard.md` and `plan/fast.md` — understand exactly when and how phase files are generated
- [ ] 2. Read CCS's `planning` skill — understand the "Plan Creation & Organization" rules that govern phase file structure
- [ ] 3. Compare: CCS splits phases into `phase-XX-name.md` files; myai puts everything in `plan.md` — what are the trade-offs?
- [ ] 4. Decide: adopt CCS format for phase plans only, or keep single-file format, or offer both
- [ ] 5. If adopting: update `/myai:plan` phase plan template to generate `phase-XX-name.md` files + update `/myai:cook` to read them
- [ ] 6. Update `plans-templates/phase-template.md` to match decision

## Notes

- CCS format: `plan.md` is the overview + phase list; each phase is a separate `phase-XX-slug.md` file
- myai current format: everything in one `plan.md`, phases are `### Phase N` headings
- CCS format scales better for large phase plans (10+ tasks per phase)
- myai single-file format is simpler for task plans
- Likely outcome: keep single-file for task plans, adopt phase files for phase plans
