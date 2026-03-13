---
name: myai:new-project
description: Initialize a new project — creates docs/ brain layer (PROJECT.md, SPEC.md, ROADMAP.md, STATE.md)
argument-hint: "[project description]"
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
  - Task
---

<objective>
Initialize a new project by creating the docs/ brain layer. Gathers project context through conversation, then writes four foundational files.

**Creates:**
- `docs/PROJECT.md` — vision, goals, tech stack, constraints
- `docs/SPEC.md` — v1/v2/out-of-scope requirements with acceptance criteria
- `docs/ROADMAP.md` — phases with success criteria
- `docs/STATE.md` — project memory (active plan pointer + decisions + blockers)

**After this command:** Run `/myai:plan` to start planning a phase.
</objective>

<context>
$ARGUMENTS
</context>

<process>

## Step 1: Check for Existing Setup

```bash
ls docs/ 2>/dev/null
```

If `docs/PROJECT.md` already exists:
- Read it and present a summary
- Ask: "docs/ already exists. Update it or start fresh? [update/fresh]"
- On "update": open each file for review/edit
- On "fresh": proceed with creation

## Step 1b: Detect Existing Codebase

Check if this is an existing project with code:

```bash
ls package.json requirements.txt Cargo.toml go.mod pyproject.toml src/ app/ lib/ 2>/dev/null | head -5
```

If any of these exist, this is an **existing project**. Spawn 4 parallel codebase-mapper agents before gathering context:

```
Spawn 4 agents in parallel using the Task tool:
  1. codebase-mapper — focus: tech    (writes STACK.md, INTEGRATIONS.md)
  2. codebase-mapper — focus: arch    (writes ARCHITECTURE.md, STRUCTURE.md)
  3. codebase-mapper — focus: quality (writes CONVENTIONS.md, TESTING.md)
  4. codebase-mapper — focus: concerns (writes CONCERNS.md)
```

Wait for all 4 to complete, then read the written documents from `plans/codebase/` to pre-fill the context questions in Step 2. Only ask the user for information that couldn't be inferred from the codebase.

If no existing code is found, skip to Step 2 and ask all questions.

## Step 2: Gather Project Context

Ask the user these questions (use AskUserQuestion or conversational flow). Skip questions already answered by codebase analysis:

**Core questions:**
1. What is this project? (one sentence — the core value it delivers)
2. Who is the user and what problem does it solve?
3. What's the tech stack? (language, framework, database, hosting) ← pre-fill from STACK.md if available
4. What are the hard constraints? (timeline, budget, non-negotiables)

**Scope questions:**
5. What MUST work for v1? (list 3-7 requirements)
6. What's nice-to-have for v2? (can defer without blocking launch)
7. What's explicitly out of scope?

**Roadmap questions:**
8. How many phases do you expect? (rough estimate — 3-8 is typical)
9. What's the most critical phase to get right?

If `$ARGUMENTS` contains a description, use it to pre-fill answers and only ask for missing information.

## Step 3: Write docs/PROJECT.md

```bash
mkdir -p docs
```

Write `docs/PROJECT.md` with:

```markdown
# Project: {name}

## What This Is

{one-sentence core value}

## Problem / User

{problem statement and target user}

## Tech Stack

**Frontend:** {framework}
**Backend:** {framework}
**Database:** {database}
**Hosting:** {platform}
**Package manager:** {npm/pnpm/bun/pip/etc}

## Goals

**v1 (must ship):**
- {goal 1}
- {goal 2}

**v2 (nice to have):**
- {goal}

## Hard Constraints

- {constraint 1}
- {constraint 2}

## Key Decisions

<!-- Append decisions here as the project evolves -->
| Date | Decision | Rationale |
|------|----------|-----------|
```

## Step 4: Write docs/SPEC.md

Write `docs/SPEC.md` with:

```markdown
# Spec: {project name}

## v1 Requirements (must ship)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| {CAT}-01 | {requirement} | {observable behavior} |
| {CAT}-02 | {requirement} | {observable behavior} |

## v2 Requirements (next milestone)

| ID | Requirement | Why Deferred |
|----|-------------|--------------|
| {CAT}-01 | {requirement} | {reason} |

## Out of Scope

- {explicitly excluded item} — {why}

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| (filled by /myai:new-project roadmap step) |
```

Group requirements by category (AUTH, CONTENT, API, etc.). Assign IDs like AUTH-01, AUTH-02.

## Step 5: Derive Roadmap

**Option A — Spawn roadmapper agent:**
If the user wants a thorough phase breakdown, spawn the roadmapper agent:

```
Use Task tool to spawn agent: roadmapper
Provide: docs/PROJECT.md content + docs/SPEC.md content
The agent will write docs/ROADMAP.md and return summary.
```

**Option B — Write roadmap inline:**
For simpler projects (< 5 phases), write `docs/ROADMAP.md` directly:

```markdown
# Roadmap: {project name}

## Phases

- [ ] **Phase 1: {Name}** — {one-line description}
- [ ] **Phase 2: {Name}** — {one-line description}
- [ ] **Phase 3: {Name}** — {one-line description}

## Phase Details

### Phase 1: {Name}
**Goal:** {outcome from user perspective, not a task}
**Depends on:** Nothing
**Requirements:** {REQ-IDs}
**Success Criteria:**
  1. {observable behavior}
  2. {observable behavior}
**Plans:** TBD

### Phase 2: {Name}
**Goal:** {outcome}
**Depends on:** Phase 1
**Requirements:** {REQ-IDs}
**Success Criteria:**
  1. {observable behavior}
  2. {observable behavior}
**Plans:** TBD

## Progress

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 1. {Name} | 0/? | Not started | — |
| 2. {Name} | 0/? | Not started | — |
```

## Step 6: Write docs/STATE.md

Write `docs/STATE.md` with:

```markdown
# State: {project name}

**Updated:** {date}

## Active Plan

Plan: none

## Current Focus

Phase: 1 — {Phase 1 name}
Status: Not started

## Accumulated Decisions

<!-- Keep only decisions that affect future work. Max 10 entries. -->

## Blockers

<!-- Current obstacles blocking progress -->

## Next Action

Run `/myai:plan` to create Phase 1 execution plan.
```

## Step 7: Confirm

Present summary to user:

```
✓ docs/ brain layer created:
  - docs/PROJECT.md — project context
  - docs/SPEC.md — {N} v1 requirements
  - docs/ROADMAP.md — {N} phases
  - docs/STATE.md — project memory initialized

## Next Steps

1. Plan Phase 1:
   /myai:plan

2. Check project status anytime:
   /myai:progress
```

</process>

<success_criteria>
- [ ] Existing codebase detected and mapped (if applicable) — 4 agents run in parallel
- [ ] docs/ directory created
- [ ] docs/PROJECT.md written with tech stack and goals (pre-filled from STACK.md where available)
- [ ] docs/SPEC.md written with categorized v1 requirements + IDs
- [ ] docs/ROADMAP.md written with phases, goals, and success criteria
- [ ] docs/STATE.md initialized with active plan = none
- [ ] User knows next steps
</success_criteria>
