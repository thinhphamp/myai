---
name: docs:update
description: Update docs/ files based on recent codebase changes — runs targeted general-purpose analysis agents then syncs affected docs
argument-hint: "[scope: all | code-standards | system-architecture | design-guidelines | deployment-guide | codebase-summary]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
---

<objective>
Incrementally update docs/ brain layer files based on recent codebase changes. Smarter than docs:init — only re-maps affected areas and only updates affected docs.
</objective>

<process>

## Step 1: Detect Scope

If `$ARGUMENTS` specifies a doc name → update only that file.

Otherwise, detect changed areas from git:
```bash
git diff HEAD~5 --name-only 2>/dev/null || git diff --name-only
```

Map changed paths to general-purpose analysis focus areas:
| Changed paths | Focus areas to re-run |
|--------------|----------------------|
| src/, lib/, app/ (logic files) | quality, arch |
| package.json, requirements.txt, go.mod | tech |
| docker*, k8s/, .github/, deploy/ | tech, concerns |
| components/, styles/, ui/ | quality |
| All / unclear | all 4 |

## Step 2: Run Targeted Codebase Mappers

Spawn only the needed general-purpose analysis agents in parallel. Pass existing `plans/codebase/` files as context so agents update rather than rebuild from scratch.

## Step 3: Delegate to docs-manager

Spawn docs-manager agent with task: `docs:update`

Pass:
- Updated files from `plans/codebase/`
- List of docs to update (derived from changed areas):
  - code-standards.md ← quality changes
  - system-architecture.md ← arch / tech changes
  - deployment-guide.md ← tech / deploy changes
  - codebase-summary.md ← any structural change
  - design-guidelines.md ← UI changes

docs-manager reads existing docs and applies targeted updates — does NOT regenerate from scratch.

## Step 4: Confirm

```
✓ docs/ updated:
  - docs/{file}.md — {what changed}
  ...
```

</process>

<success_criteria>
- [ ] Changed areas detected (git diff or explicit scope)
- [ ] Only necessary general-purpose analysis agents re-run
- [ ] docs-manager updated only affected docs
- [ ] No regressions in unchanged doc sections
</success_criteria>
