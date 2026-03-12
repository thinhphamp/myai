---
type: task
---

# Plan: Restore /myai:verify

**Date:** 2026-03-12
**Goal:** Restore the `/myai:verify` slash command so the verifier agent is reachable and the post-cook verification loop works.

## Context

- **Affects:** `.myai/commands/`, `.myai/agents/verifier.md`, `myai:cook.md`, `myai:progress.md`, `myai:resume.md`, `primary-workflow.md`
- **Depends on:** nothing

## Tasks

- [x] 1. Create `.myai/commands/myai:verify.md` — spawns verifier agent with current plan + ROADMAP context, outputs VERIFICATION.md, presents pass/gaps/human-needed result
- [x] 2. Audit all references to `/myai:verify` in `myai:cook.md`, `myai:progress.md`, `myai:resume.md`, `primary-workflow.md` — confirm they still make sense or update wording
- [x] 3. Update `runtime-templates/claude/CLAUDE.md` — add `/myai:verify` back to commands table
- [x] 4. Update README.md — add `/myai:verify` to slash commands table and quick start
- [ ] 5. Propagate `.myai/commands/myai:verify.md` to `~/dev/smw`

## Notes

- Keep the command simple: load plan + ROADMAP, spawn verifier agent, show result
- verifier agent already exists and is complete — just needs the entry point
- Scope: phase plans only (verifier checks goal achievement against ROADMAP success criteria)
