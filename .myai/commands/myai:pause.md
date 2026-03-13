---
name: myai:pause
description: Save session state to PROGRESS.md — preserves context for seamless resume
allowed-tools:
  - Read
  - Write
  - Bash
---

<objective>
Save complete current session state to `plans/{active}/PROGRESS.md` and update `docs/STATE.md`. Enables seamless resumption with full context across sessions.
</objective>

<process>

## Step 1: Find Active Plan

Read STATE.md to get the active plan path:

```bash
cat docs/STATE.md 2>/dev/null | grep "^Plan:" | head -1
```

If `Plan: none` or STATE.md missing:
```
No active plan found.

Nothing to pause — run /myai:plan to start a plan first.
```

Read the active plan:

```bash
cat {active-plan-path}/plan.md
```

## Step 2: Gather Session State

Collect the complete state for handoff by examining:

1. **Which task are we on?** Read plan.md to find last checked `[x]` task and first unchecked `[ ]` task
2. **What's been done this session?** Scan recent file modifications:
   ```bash
   git diff --stat HEAD 2>/dev/null | head -20
   # or if no git:
   find . -newer docs/STATE.md -name "*.ts" -o -name "*.tsx" -o -name "*.js" 2>/dev/null | grep -v node_modules | head -20
   ```
3. **What's remaining?** Unchecked tasks in plan.md
4. **Any decisions made?** Key choices made during this session
5. **Any blockers?** What stopped or might stop progress

Ask the user to confirm or add to what was gathered:
- "What was the last thing you worked on?"
- "Any blockers or notes for next session?"

## Step 3: Write PROGRESS.md

Write `{active-plan-path}/PROGRESS.md`:

```markdown
---
plan: {active-plan-path}
updated: {ISO timestamp}
task: {N}
total_tasks: {M}
status: {in_progress | blocked}
---

## Current Task

Task {N}/{M}: {task description}

## Done This Session

- Task 1: {description} ✓
- Task 2: {description} ✓
- Task {N-1}: {description} — {partial status if incomplete}

## Remaining

- Task {N}: {what's left on current task}
- Task {N+1}: {description}
- Task {N+2}: {description}

## Decisions Made

- {Decision 1}: {rationale}
- {Decision 2}: {rationale}

## Blockers

{blocker description, or "None"}

## Context

{Key mental state — approach being taken, gotchas discovered, what to think about next}

## Next Action

Start with: {specific first action on resume — file, function, command}
```

Be specific enough for a fresh session to understand immediately.

## Step 4: Update docs/STATE.md

Append session decisions to STATE.md Accumulated Decisions section (keep max 10 entries, remove oldest if over):

```bash
cat docs/STATE.md
```

Update:
1. `Updated:` timestamp
2. `Accumulated Decisions` — append any key decisions from this session
3. `Blockers` — update with current blockers
4. `Next Action` — set to "Resume `/myai:resume` → {plan-path}"

## Step 5: Confirm

```
✓ Session saved: {active-plan-path}/PROGRESS.md

## State Saved

- Plan: {plan-path}
- Task: {N}/{M} — {task description}
- Status: {in_progress | blocked}
- Decisions: {N} appended to docs/STATE.md

## To Resume

Run: /myai:resume

Or start a fresh session — session-init hook will auto-load this context.
```

</process>

<success_criteria>
- [ ] Active plan identified from docs/STATE.md
- [ ] Current task position determined
- [ ] PROGRESS.md written with complete handoff context
- [ ] docs/STATE.md updated with session decisions
- [ ] User knows how to resume
</success_criteria>
