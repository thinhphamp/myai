---
type: task
---

# Plan: Update Runtime Docs

**Date:** 2026-03-12
**Goal:** Fix incomplete and inconsistent documentation across runtime templates and README.

## Context

- **Affects:** `runtime-templates/gemini/GEMINI.md`, `runtime-templates/codex/AGENTS.md`, `README.md`
- **Depends on:** Plan 1 (restore-verify) — verify command needs to be in docs once restored

## Tasks

- [x] 1. Update `GEMINI.md` agents list — add all 13 agents, remove duplicate `debugger`
- [x] 2. Update `AGENTS.md` agents list — same as above
- [x] 3. Clarify README: `myai validate` (CLI — prints plan phases) vs `/myai:validate` (slash — interview-based) vs `/myai:verify` (slash — post-build goal check)
- [x] 4. Fix README slash commands table description for `/myai:validate` — pre-build/post-build distinction added
- [x] 5. Add `/myai:verify` to `runtime-templates/claude/CLAUDE.md` commands table

## Notes

- Full agent list: brainstormer, codebase-mapper, code-reviewer, debugger, docs-manager, fullstack-developer, git-manager, planner, researcher, roadmapper, tester, ui-ux-designer, verifier
- Gemini/Codex templates get the full list since agents are called by name in those runtimes too
