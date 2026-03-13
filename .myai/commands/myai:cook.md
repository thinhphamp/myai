---
name: myai:cook
description: Execute the active plan with skill-aware implementation
argument-hint: "[focus area or task number]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>
Execute the active plan from `plans/{active}/plan.md`. Auto-activates domain skills based on plan content. Implements tasks, updates plan progress, and writes a SUMMARY.md on completion.

Supports `--parallel` flag: when the plan has `type: parallel` or `--parallel` is passed, spawns multiple `fullstack-developer` agents for concurrent phases.
</objective>

<context>
**Focus:** $ARGUMENTS
</context>

<process>

## Step 1: Load Active Plan

Read the active plan path from injected STATE.md context or directly:

```bash
cat docs/STATE.md 2>/dev/null | grep "^Plan:" | head -1
```

If `Plan: none` or no active plan:
```
No active plan found.

Run /myai:plan first to create an execution plan.
```

Read the plan:
```bash
cat {active-plan-path}/plan.md
cat {active-plan-path}/PROGRESS.md 2>/dev/null
```

If PROGRESS.md exists, resume from the last checkpoint (skip completed tasks).

## Step 2: Load Project Context

```bash
cat docs/ROADMAP.md 2>/dev/null | head -80
cat docs/code-standards.md 2>/dev/null        # always — follow conventions when writing code
```

Load additional docs based on what the plan involves:
```bash
# For API, backend, database, service-level tasks:
cat docs/system-architecture.md 2>/dev/null

# For UI, component, styling tasks:
cat docs/design-guidelines.md 2>/dev/null

# For deploy, CI/CD, infra tasks:
cat docs/deployment-guide.md 2>/dev/null
```

Understand the phase goal and existing conventions before writing any code.

## Step 3: Auto-Activate Skills

Analyze plan content and auto-activate domain skills:

| Plan content | Skills activated |
|--------------|-----------------|
| React, Next.js, components, hooks, pages | `frontend-development`, `react-best-practices` |
| CSS, Tailwind, design, layout, responsive | `ui-styling`, `frontend-design` |
| API routes, REST, controllers, middleware | `backend-development` |
| database, schema, migration, ORM, query | `databases` |
| auth, session, JWT, login, register | `better-auth` |
| test, spec, coverage, e2e, unit | `web-testing` |
| Stripe, payment, billing, subscription | `payment-integration` |
| Docker, CI, deploy, Kubernetes, pipeline | `devops` |
| Flutter, React Native, mobile | `mobile-development` |
| AI, LLM, embedding, vision, multimodal | `ai-multimodal` |
| MCP, tool, server, agent SDK | `mcp-builder` |
| refactor, cleanup, optimize | `code-review` |
| debug, fix, error, crash | `debug` |

Announce: "Activating skills: {list}"

Read the relevant skill files from `.myai/skills/{skill-name}/SKILL.md`.

## Step 4: Detect Parallel Mode

Check if parallel execution applies:
- `$ARGUMENTS` contains `--parallel`, OR
- `plan.md` frontmatter has `type: parallel`, OR
- Phase files (`phase-XX-*.md`) exist in the plan directory

```bash
ls {active-plan-path}/phase-*.md 2>/dev/null
```

**If parallel mode detected → skip to Step 4P (Parallel Execution).**
Otherwise continue to Step 4S (Sequential Execution).

---

## Step 4P: Parallel Execution

Read `plan.md` to get the dependency graph and execution strategy.

### Launch concurrent phases

For each group of phases that can run simultaneously, spawn `fullstack-developer` agents in parallel using the Task tool:

```
Task(
  subagent_type="fullstack-developer",
  prompt="Implement phase file: {plan-path}/phase-01-{name}.md
  File ownership: {files listed in phase file — touch ONLY these files}
  Plan context: {plan-path}/plan.md
  Skills: {detected skills}",
  description="Phase 01: {name}"
)
```

**Rules:**
- Launch all independent phases simultaneously (one Task call per phase)
- Wait for all concurrent phases to complete before launching dependent phases
- Each agent works ONLY on files listed in its phase's file ownership section
- No file may be modified by two agents simultaneously

**Example execution order from dependency graph:**
```
Step 1 (parallel): Phase 01, Phase 02, Phase 03 → launch 3 agents at once
Step 2 (sequential): Phase 04 → launch after all Step 1 agents complete
```

### After all phases complete

1. Run `tester` agent on the full codebase
2. Run `code-reviewer` agent for final review
3. If critical issues found: fix and re-test
4. Write SUMMARY.md (see Step 8)
5. Update STATE.md (see Step 9)

→ **Skip to Step 10 (Confirm)**

---

## Step 4S: Clarify Focus (if $ARGUMENTS provided, sequential mode)

If `$ARGUMENTS` (excluding `--parallel`) specifies a task number (e.g., "3") or focus area (e.g., "database"):
- Start from that task / focus on that area
- Skip already-completed tasks

Otherwise execute all uncompleted tasks in order.

## Step 5: Execute Tasks

For each uncompleted task in the plan:

1. **Announce** the task: "## Task {N}: {description}"
2. **Implement** — write real, working code (not stubs)
3. **Self-check** against skill guidelines
4. **Mark complete** — update checkbox in plan.md: `- [x] N. {task}`

**Execution principles:**
- Write working code, not placeholders
- Follow existing patterns (from docs/code-standards.md loaded in Step 2)
- Wire components to APIs to databases — don't leave orphaned code
- Handle errors at system boundaries
- After each task: verify it compiles/passes basic checks

**After each task group (every 3-4 tasks):**
Update PROGRESS.md with current state:

```markdown
---
plan: {plan-path}
updated: {timestamp}
---

## Current Task

{N}/{total} — {current task description}

## Done This Session

- Task 1: {description} ✓
- Task 2: {description} ✓

## Remaining

- Task {N}: {description}
- Task {N+1}: {description}

## Next Step

{specific first action on resume}
```

## Step 6: Handle Blockers

If blocked during execution:

1. Document the blocker clearly
2. Check if it's resolvable (missing info → ask user; technical issue → try alternative approach)
3. If unresolvable: update PROGRESS.md with blocker, update docs/STATE.md Blockers section, pause

Don't silently skip blocked tasks.

## Step 7: Completion Check

When all tasks are complete:

1. **Verify against must_haves** (from plan.md frontmatter if present):
   - Check each truth: is it actually achievable now?
   - Check each artifact: does it exist, is it substantive, is it wired?

2. **Anti-pattern scan:**
   ```bash
   grep -rn "TODO\|FIXME\|placeholder\|coming soon" {modified-files}
   grep -rn "return null\|=> {}" {modified-files}
   ```

3. If gaps found: create additional tasks and continue

## Step 7.5: Test + Review (MANDATORY — always run, both sequential and parallel)

After all tasks pass completion check, spawn these agents sequentially:

**1. Tester** — validate implementation correctness and AC coverage:
```
Task(
  subagent_type="tester",
  prompt="Run tests and validate implementation for plan: {active-plan-path}
  Work context: {cwd}
  Reports: {cwd}/plans/reports/
  Focus: verify all tasks in plan.md are correctly implemented and match acceptance criteria.
  If tests fail, report failures clearly — do NOT fix them.",
  description="Test implementation"
)
```

**2. Code Reviewer** — quality and correctness check:
```
Task(
  subagent_type="code-reviewer",
  prompt="Review implementation for plan: {active-plan-path}
  Work context: {cwd}
  Reports: {cwd}/plans/reports/
  Focus: verify code correctness, edge cases, security, and that implementation matches plan goals.
  Report findings clearly.",
  description="Review implementation"
)
```

**If tester reports failures:** fix the issues, re-run tester before proceeding.
**If code-reviewer reports critical issues:** fix them before writing SUMMARY.md.
**Skip only if:** `--no-test` flag is passed OR plan has `skip_qa: true` in frontmatter.

## Step 8: Write SUMMARY.md

Write `{active-plan-path}/SUMMARY.md`:

```markdown
# Summary: {plan name}

**Completed:** {date}
**Phase:** {N} — {phase name}

## What Was Built

{1-3 sentence description of what was actually implemented}

## Tasks Completed

- ✓ {task 1}
- ✓ {task 2}
- ✓ {task 3}

## Key Decisions

- {decision made during implementation + rationale}

## Files Modified

- `{path}` — {what changed}
- `{path}` — {what changed}

## Remaining / Follow-up

{Any known gaps, follow-up tasks, or deferred items}
```

## Step 9: Update State

1. **Clear PROGRESS.md** (or mark as complete)
2. **Update docs/STATE.md:**
   - If more plans in this phase: keep Plan pointer, update Current Focus
   - If phase complete: set `Plan: none`, update Current Focus to next phase
   - Append key decisions to Accumulated Decisions section

3. **Update docs/ROADMAP.md** if a phase milestone was reached:
   - Mark phase checkbox `[x]`
   - Update Plans count

## Step 10: Confirm

```
✓ Plan complete: {plan-path}

## Summary

{what was built - 2-3 sentences}

## Files Changed

{list}

## Next Step

{/myai:verify to validate goal achievement, or /myai:plan for next phase}
```

</process>

<anti_patterns>

## Never Do These

**Stubs:**
```javascript
return <div>Component</div>       // placeholder text
onClick={() => {}}                 // empty handler
return Response.json({ ok: true }) // static, not real data
```

**Orphaned code:**
- Component created but not imported anywhere
- API route created but never called
- Function created but not wired to a handler

**Fake completions:**
- Marking a task done without actually implementing it
- "Implementation pending" in code
- TODO comments left in delivered code

</anti_patterns>

<success_criteria>
- [ ] Active plan loaded (or error shown)
- [ ] Parallel mode detected (type: parallel or --parallel flag or phase files)
- [ ] Domain skills auto-activated based on plan content
- [ ] Sequential: all tasks executed with real implementation
- [ ] Parallel: concurrent agents launched per dependency graph, file ownership respected
- [ ] PROGRESS.md updated after every few tasks (sequential) or per phase (parallel)
- [ ] must_haves verified on completion
- [ ] tester agent spawned and all tests pass (unless --no-test)
- [ ] code-reviewer agent spawned and critical issues resolved
- [ ] SUMMARY.md written
- [ ] docs/STATE.md updated (decisions, plan pointer)
- [ ] User confirmed on completion
</success_criteria>
