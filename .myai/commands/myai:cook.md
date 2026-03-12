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
```

Understand the phase goal to stay aligned during execution.

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

## Step 4: Clarify Focus (if $ARGUMENTS provided)

If `$ARGUMENTS` specifies a task number (e.g., "3") or focus area (e.g., "database"):
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
- Follow existing patterns (check CONVENTIONS.md if available in plans/codebase/)
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
- [ ] Domain skills auto-activated based on plan content
- [ ] All tasks executed with real implementation
- [ ] PROGRESS.md updated after every few tasks
- [ ] must_haves verified on completion
- [ ] SUMMARY.md written
- [ ] docs/STATE.md updated (decisions, plan pointer)
- [ ] User confirmed on completion
</success_criteria>
