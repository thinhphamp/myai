---
name: myai:plan
description: Create an execution plan with project context + skill auto-detection
argument-hint: "[task or phase description]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
Create a detailed execution plan for a task or phase. Reads project context (docs/STATE.md, docs/ROADMAP.md), detects relevant skills, and produces a structured plan in `plans/{date}-{slug}/`.
</objective>

<context>
**Task:** $ARGUMENTS
</context>

<process>

## Step 1: Check Active Plan (Session State)

The session-init hook injects docs/STATE.md context. Check the injected "## Plan Context" or "## Project State" section:

- If `Plan:` shows a path → Active plan exists. Ask: "Active plan found: `{path}`. Continue with this plan? [y/n]"
  - Yes → Read `{path}/plan.md` and resume from where it left off
  - No → Proceed to create new plan
- If `Plan: none` or no state → Proceed to create new plan

If STATE.md was not injected, read it directly:
```bash
cat docs/STATE.md 2>/dev/null || echo "No STATE.md found"
```

## Step 2: Load Project Context

Read project docs to inform the plan:

```bash
cat docs/ROADMAP.md 2>/dev/null
cat docs/SPEC.md 2>/dev/null | head -60
```

Extract:
- Current phase goal and success criteria
- Relevant requirements for this task
- Key decisions already made

## Step 3: Clarify Task (if needed)

If `$ARGUMENTS` is vague or missing, use AskUserQuestion to clarify:
- What is the goal? (outcome, not task)
- What are the constraints?
- What does "done" look like?

For clear tasks, proceed without asking.

## Step 4: Auto-Detect Skills

Analyze the task description and select relevant skills from `.myai/skills/`:

| If task involves... | Activate skills |
|---------------------|-----------------|
| React, Next.js, UI components | `frontend-development`, `react-best-practices` |
| CSS, Tailwind, design system | `ui-styling`, `frontend-design` |
| API, REST, GraphQL | `backend-development` |
| Database, schema, migrations | `databases` |
| Auth, sessions, JWT | `better-auth` |
| Testing, specs, coverage | `web-testing` |
| Stripe, payments | `payment-integration` |
| Docker, CI/CD, deployment | `devops` |
| Flutter, React Native | `mobile-development` |
| AI, LLM, multimodal | `ai-multimodal` |
| MCP server/tool | `mcp-builder` |
| Research, unknowns | `research` |
| Debugging | `debug` |
| Code review | `code-review` |

Activate the `planning` skill always.

Announce detected skills: "Activating skills: planning, {skill1}, {skill2}"

## Step 5: Determine Plan Scope

Choose plan scope based on the task:

**Task plan** (specific feature, fix, or chore — default for most requests):
- Triggered by: "add X", "fix Y", "refactor Z", "implement X", a bug description, or anything scoped to a single concern
- 3-7 tasks, single session
- Phase/ROADMAP context is optional — skip if not relevant
- No `must_haves` frontmatter required unless the task is complex

**Phase plan** (a full roadmap phase with multiple sub-features):
- Triggered by: "plan Phase N", "plan the auth phase", or a task that maps directly to a ROADMAP milestone
- 5-15 tasks, may span sessions
- Always links to ROADMAP phase and `must_haves` required

**Parallel plan** (multiple independent features or a large task that can be split by layer):
- Triggered by: `--parallel` flag, 3+ independent features listed, or any task with clearly separable concerns (frontend/backend/database)
- Generates `plan.md` overview + individual `phase-XX-name.md` files per parallel group
- Each phase file has exclusive file ownership — no file is touched by two phases
- Includes a dependency graph and execution strategy in `plan.md`
- `/myai:cook --parallel` will execute concurrent phases using multiple agents

When in doubt, default to **task plan**. A plan for a specific feature or fix should never require the user to think about phases.

## Step 6: Create Plan Directory

Generate slug and folder name based on scope:

**Task plan:**
```bash
DATE=$(date +%Y-%m-%d)
SLUG="{derived-from-task}"          # kebab-case, max 30 chars
mkdir -p "plans/${DATE}-${SLUG}"    # e.g. plans/2026-03-12-fix-login-redirect
```

**Phase plan:**
```bash
DATE=$(date +%Y-%m-%d)
SLUG="{phase-name-kebab}"           # kebab-case, max 30 chars
mkdir -p "plans/${DATE}-phase-${N}-${SLUG}"  # e.g. plans/2026-03-12-phase-4-payments
```

**Parallel plan:**
```bash
DATE=$(date +%Y-%m-%d)
SLUG="{task-name-kebab}"
mkdir -p "plans/${DATE}-parallel-${SLUG}"  # e.g. plans/2026-03-12-parallel-auth-payments-ui
```

The `phase-N-` and `parallel-` prefixes make plan types immediately identifiable in `ls plans/`.

## Step 7: Write plan.md

**For a task plan** (feature / fix / chore), write `plans/{date}-{slug}/plan.md`:

```markdown
---
type: task
---

# Plan: {Task Name}

**Date:** {date}
**Goal:** {outcome, not task list}

## Context

- **Affects:** {components/files involved}
- **Depends on:** {prior work or "nothing"}

## Tasks

- [ ] 1. {First concrete task}
- [ ] 2. {Second concrete task}
- [ ] 3. {Third concrete task}

## Notes

{Key design decisions, constraints, gotchas. Omit if none.}
```

**For a phase plan**, write `plans/{date}-phase-{N}-{slug}/plan.md` with full frontmatter:

```markdown
---
type: phase
phase: {phase number from ROADMAP}
goal: {phase goal from ROADMAP}
must_haves:
  truths:
    - "{observable behavior 1}"
    - "{observable behavior 2}"
  artifacts:
    - "{file/component that must exist}"
  key_links:
    - from: "{component}"
      to: "{api/db}"
      via: "{method/query}"
---

# Plan: {Phase Name}

**Date:** {date}
**Phase:** {N} — {phase name}
**Goal:** {outcome, not task list}

## Context

- **Relevant requirements:** {REQ-IDs from SPEC.md}
- **Depends on:** {prior work or "nothing"}
- **Affects:** {components/services involved}

## Tasks

- [ ] 1. {First concrete task}
- [ ] 2. {Second concrete task}

## Open Questions

{Any unknowns. Empty if none.}

## Notes

{Key design decisions, constraints, gotchas.}
```

**For a parallel plan**, write `plans/{date}-parallel-{slug}/plan.md` as overview, then one `phase-XX-{name}.md` per parallel group:

`plan.md`:
```markdown
---
type: parallel
---

# Plan: {Task Name}

**Date:** {date}
**Goal:** {outcome}

## Execution Strategy

{Which phases run in parallel, which must be sequential}

**Parallel:** Phases 1, 2, 3 → then Phase 4 (integration)

## Dependency Graph

| Phase | Depends on | Can run with |
|-------|-----------|--------------|
| Phase 1: {name} | nothing | 2, 3 |
| Phase 2: {name} | nothing | 1, 3 |
| Phase 3: {name} | nothing | 1, 2 |
| Phase 4: {name} | 1, 2, 3 | — |

## File Ownership Matrix

| File/Directory | Owned by Phase |
|----------------|---------------|
| `src/components/` | Phase 1 |
| `src/api/` | Phase 2 |
| `src/db/` | Phase 3 |
```

`phase-01-{name}.md` (one per phase):
```markdown
# Phase 01: {Name}

**Parallelization:** Runs concurrently with Phase 02, 03. No dependency on other phases.
**File ownership:** `src/components/**` — no other phase touches these files.

## Goal

{What this phase delivers}

## Tasks

- [ ] 1. {task}
- [ ] 2. {task}

## Success Criteria

- [ ] {observable outcome}
```

## Step 8: Update docs/STATE.md

Update the Active Plan pointer:

```bash
# Read current STATE.md, update Plan: line
```

Change:
```
Plan: none
```
To:
```
Plan: plans/{date}-{slug}
```

Also update "Current Focus" section with the new task.

## Step 9: Confirm

Present the plan to the user:

```
✓ Plan created: plans/{date}-{slug}/plan.md

## Plan: {Task Name}

**Goal:** {goal}
**Tasks:** {N} tasks
**Skills activated:** {list}

## Tasks
{task list}

## Next Step

Run `/myai:cook` to execute this plan.
```

Ask if the user wants to adjust anything before execution.

</process>

<important_notes>
- **IMPORTANT:** Analyze the skills catalog and activate skills needed for this task.
- **IMPORTANT:** Sacrifice grammar for concision in the plan doc.
- **IMPORTANT:** Ensure token efficiency while maintaining quality.
- **IMPORTANT:** List any unresolved questions at the end.
- **IMPORTANT:** Do NOT start implementing. Planning only.
</important_notes>

<success_criteria>
- [ ] Active plan checked (resume or create new)
- [ ] Scope determined: task plan, phase plan, or parallel plan
- [ ] Project context loaded only if relevant to scope
- [ ] Task clarified (if ambiguous)
- [ ] Relevant skills auto-detected and announced
- [ ] plan files written (single plan.md for tasks/phases; plan.md + phase-XX-*.md for parallel)
- [ ] docs/STATE.md updated with active plan path
- [ ] User confirms plan before proceeding
</success_criteria>
