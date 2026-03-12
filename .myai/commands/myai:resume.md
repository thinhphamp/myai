---
name: myai:resume
description: Restore session context from PROGRESS.md + STATE.md and resume work
allowed-tools:
  - Read
  - Bash
  - Glob
  - AskUserQuestion
---

<objective>
Restore complete project context and resume work seamlessly. Reads `docs/STATE.md` to find the active plan, loads `plans/{active}/PROGRESS.md` for session-level state, and presents full situational awareness with clear next action.
</objective>

<process>

## Step 1: Load Project State

Read STATE.md (also injected by session-init hook):

```bash
cat docs/STATE.md 2>/dev/null
```

If docs/STATE.md missing:
```
No docs/STATE.md found.

Run /myai:new-project to initialize a project.
```
Exit.

Extract:
- `Plan:` line → active plan path (or "none")
- `Current Focus` → phase and status
- `Accumulated Decisions` → recent key decisions
- `Blockers` → current obstacles

## Step 2: Check Active Plan

If `Plan: none`:
```
No active plan.

Project: {project name from STATE.md}
Phase: {current focus}

Options:
1. Create a new plan → /myai:plan
2. Check project status → /myai:progress
```
Exit.

If active plan path found, read it:

```bash
cat {active-plan-path}/plan.md
cat {active-plan-path}/PROGRESS.md 2>/dev/null
cat {active-plan-path}/SUMMARY.md 2>/dev/null
```

## Step 3: Determine Session State

Analyze what was found:

**Case A: PROGRESS.md exists (mid-session checkpoint)**
- Extract: current task, done, remaining, next action
- Flag: "Resuming from checkpoint"

**Case B: plan.md exists, no PROGRESS.md, no SUMMARY.md**
- Plan started but no progress saved
- Flag: "Plan not yet started or progress not saved"

**Case C: SUMMARY.md exists (plan complete)**
- This plan is done
- Clear the active plan from STATE.md
- Route to next action (progress or new plan)

## Step 4: Present Status

```
╔═══════════════════════════════════════════════════════╗
║  SESSION RESUME                                        ║
╠═══════════════════════════════════════════════════════╣
║  Project: {name}                                       ║
║  Phase: {N} — {phase name}                            ║
║  Plan: {plan-slug}                                    ║
║  Task: {N}/{M} — {task description}                   ║
╚═══════════════════════════════════════════════════════╝

{If PROGRESS.md found:}

## Where We Left Off

{current task description}

### Done
{completed tasks list}

### Remaining
{remaining tasks list}

### Blockers
{blockers or "None"}

### Next Action
{specific first action from PROGRESS.md}

{If decisions made:}
### Decisions Made Last Session
{decision list}

{If Blockers in STATE.md:}
⚠ Carried blockers:
{blocker list}
```

## Step 5: Determine Next Action

Based on session state, choose the most logical next action:

**If PROGRESS.md has a specific next action:**
→ Primary: Execute that action directly (`/myai:cook`)

**If plan not yet started:**
→ Primary: Begin execution (`/myai:cook`)

**If blocked:**
→ Primary: Address blockers before continuing
→ Show blocker details and ask how to proceed

**If plan complete (SUMMARY.md exists):**
→ Primary: Check progress for next plan (`/myai:progress`)

## Step 6: Offer Options

```
## What Would You Like To Do?

1. Continue where we left off → /myai:cook
2. See full project status → /myai:progress
3. Switch to a different plan → /myai:plan [task]
4. Verify goal achievement → /myai:verify
```

For "continue" or "go" inputs — skip the menu and route directly to `/myai:cook`.

## Step 7: Update STATE.md Session Note

Update the `Next Action` line in docs/STATE.md to reflect the resume:

```
Next Action: Resumed — continuing {plan-path} at task {N}/{M}
```

</process>

<quick_resume>
If the user says "continue", "go", "let's go", or similar without context:
- Load state silently
- Identify the primary next action
- Execute immediately with just: "Resuming {plan} at task {N}..."
</quick_resume>

<success_criteria>
- [ ] docs/STATE.md loaded
- [ ] Active plan identified
- [ ] PROGRESS.md loaded (if exists)
- [ ] Clear status presented with task position
- [ ] Decisions and blockers surfaced
- [ ] Next action clearly offered
- [ ] docs/STATE.md updated with resume note
</success_criteria>
