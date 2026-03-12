---
name: myai:progress
description: Project-wide status — shows phases, plans, recent work, and routes to next action
allowed-tools:
  - Read
  - Bash
  - Grep
  - Glob
---

<objective>
Check project progress, summarize recent work and what's ahead, then route to the next action — either executing an existing plan or creating the next one.

Provides full situational awareness before continuing work.
</objective>

<process>

## Step 1: Verify Project Exists

```bash
ls docs/PROJECT.md docs/ROADMAP.md docs/STATE.md 2>/dev/null
```

If docs/ missing:
```
No project found in docs/.

Run /myai:new-project to initialize a new project.
```
Exit.

## Step 2: Load Project Context

Read state and roadmap:

```bash
cat docs/STATE.md
cat docs/ROADMAP.md
```

Extract from STATE.md:
- Active Plan path
- Current Focus (phase, status)
- Accumulated Decisions (last 3-5)
- Blockers

Extract from ROADMAP.md:
- All phases with checklist status `[x]` vs `[ ]`
- Current and next phases
- Plans tracker per phase

## Step 3: Scan Plans Directory

```bash
ls plans/ 2>/dev/null | grep -v templates | grep -v codebase
```

For each plan directory, check:
```bash
ls plans/{plan}/SUMMARY.md 2>/dev/null && echo "complete" || echo "incomplete"
ls plans/{plan}/PROGRESS.md 2>/dev/null && echo "in-progress"
```

Build counts:
- Plans with SUMMARY.md = complete
- Plans with PROGRESS.md but no SUMMARY.md = in-progress
- Plans with neither = not started

## Step 4: Find Recent Work

Find the 3 most recently modified SUMMARY.md files:

```bash
ls -lt plans/*/SUMMARY.md 2>/dev/null | head -3
```

Read the "## What Was Built" section of each (first 5 lines).

## Step 5: Calculate Progress

Count completed vs total phases from ROADMAP.md checklist:
- `[x]` = complete
- `[ ]` = pending

Build a simple progress bar:
- Total phases → 10 blocks
- Completed phases → filled blocks `█`
- Remaining → empty blocks `░`

Example: 3/8 phases → `███░░░░░░░ 37%`

## Step 6: Present Status Report

```
# {Project Name}

**Progress:** {progress bar} {N}/{total} phases

## Recent Work
{recent SUMMARY snippets — one line each}

## Current Position

Phase {N}: {phase name}
Status: {Not started / In progress / Complete}
Active Plan: {plan path or "none"}

## Accumulated Decisions

{last 3-5 decisions from STATE.md}

## Blockers

{blockers from STATE.md, or "None"}

## What's Next

{next action — see routing below}
```

## Step 7: Route to Next Action

Determine the right next step based on project state.

**Count plans vs summaries for current phase:**

```bash
PHASE_DIR=$(ls plans/ | grep "^{current-phase-slug}" 2>/dev/null | head -1)
ls plans/${PHASE_DIR}/*-SUMMARY.md 2>/dev/null | wc -l  # completed
ls plans/*/plan.md 2>/dev/null | wc -l                   # total plans
```

**Routing table:**

| Condition | Route |
|-----------|-------|
| Active plan has PROGRESS.md but no SUMMARY | **Route A**: Resume in-progress plan |
| Active plan exists (from STATE.md), not started | **Route A**: Execute active plan |
| No active plan, current phase not yet planned | **Route B**: Plan current phase |
| Current phase complete, next phase exists | **Route C**: Move to next phase |
| All phases complete | **Route D**: Project complete |

---

**Route A: Plan ready to execute or resume**

```
---

## ▶ Next Up

**{plan name}** — {goal from plan.md}
{Status: Resuming from task N/M} (if PROGRESS.md found)

`/myai:cook`

---
```

---

**Route B: Phase needs planning**

```
---

## ▶ Next Up

**Phase {N}: {Name}** — {Goal from ROADMAP.md}

`/myai:plan` — create execution plan for this phase

---
```

---

**Route C: Phase complete, next phase available**

```
---

## ✓ Phase {N} Complete

## ▶ Next Up

**Phase {N+1}: {Name}** — {Goal from ROADMAP.md}

`/myai:plan` — plan Phase {N+1}

**Also available:**
- `/myai:verify` — verify Phase {N} goal achievement before moving on

---
```

---

**Route D: All phases complete**

```
---

## 🎉 All Phases Complete

**{N}/{N} phases finished!**

## ▶ Next

- `/myai:verify` — run goal-backward verification
- `/myai:new-project` — start planning next milestone

---
```

## Step 8: Edge Cases

- **Blockers present**: Highlight before offering next action
- **PROGRESS.md found without SUMMARY.md**: Flag as "resumable session" — route to `/myai:resume`
- **Multiple in-progress plans**: Show all, ask user which to continue

</process>

<success_criteria>
- [ ] Project existence verified
- [ ] Rich context provided (recent work, decisions, blockers)
- [ ] Progress bar calculated and displayed
- [ ] Current position clearly shown
- [ ] Smart routing: /myai:cook if plan exists, /myai:plan if not
- [ ] Route clearly presented to user
</success_criteria>
