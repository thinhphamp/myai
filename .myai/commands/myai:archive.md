---
name: myai:archive
description: Write journal entries and archive completed task plans
argument-hint: "[plan-path] (default: all task plans)"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---

<objective>
Review completed task plans, write dev-log journal entries, then archive or delete them. Scoped to task plans only (type: task).
</objective>

<context>
**Plan to archive:** $ARGUMENTS
</context>

<process>

## Step 1: Find Task Plans

1. If `$ARGUMENTS` provided → use that plan path
2. Else scan all plans:
```bash
ls plans/
```

Read each `plan.md` and filter to `type: task` only (check frontmatter). Skip phase plans.

For each task plan, read:
- `plan.md` — tasks and completion status
- `PROGRESS.md` — session notes (if exists)
- `SUMMARY.md` — completion record (if exists)

Report which plans are fully complete (all `- [x]`) vs incomplete.

## Step 2: Journal Entries (Optional)

Use `AskUserQuestion` to ask:
> Write dev-log journal entries for these plans?

If Yes:
- Use Task tool with `subagent_type="journal-writer"` in parallel for each plan
- Journal entries go in `docs/journals/`
- Focus on: what was built, key decisions, what changed and why

If No: skip to Step 3.

## Step 3: Confirm Archive Action

Use `AskUserQuestion` to ask:
> Which plans to archive?
Options:
1. All completed task plans
2. Select specific plans
3. Cancel

Then:
> How to archive?
Options:
1. Move to `plans/archive/`
2. Delete permanently

## Step 4: Archive

Execute based on user choice:

**Move to archive:**
```bash
mkdir -p plans/archive
mv plans/{plan-1} plans/archive/
mv plans/{plan-2} plans/archive/
```

**Delete permanently:**
```bash
rm -rf plans/{plan-1} plans/{plan-2}
```

Update `docs/STATE.md` — if any archived plan was the active plan, set `Plan: none`.

## Step 5: Commit (Optional)

Use `AskUserQuestion`:
> Commit these changes?
Options:
1. Stage and commit
2. Commit and push
3. Skip

## Output

```
Archived: {N} plans
Deleted: {N} plans
Journals: {N} entries written

| Plan | Status | Type | Action |
|------|--------|------|--------|
| {name} | complete | task | archived |
| {name} | complete | task | deleted |
```

List any unresolved questions at the end.

</process>

<important_notes>
- **IMPORTANT:** Only archive task plans (type: task). Skip phase plans.
- **IMPORTANT:** Warn before archiving incomplete plans — confirm explicitly.
- **IMPORTANT:** Sacrifice grammar for concision in outputs.
- **IMPORTANT:** Ensure token efficiency while maintaining quality.
</important_notes>

<success_criteria>
- [ ] Task plans identified and filtered (skip phase plans)
- [ ] Completion status checked per plan
- [ ] User asked about journal entries
- [ ] User confirmed which plans and archive method
- [ ] Plans moved or deleted
- [ ] STATE.md updated if active plan was archived
- [ ] Summary table output
</success_criteria>
