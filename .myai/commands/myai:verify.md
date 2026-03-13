---
name: myai:verify
description: Goal-backward phase verification — spawns verifier agent to check goal achievement
argument-hint: "[phase name or number]"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Write
  - Task
---

<objective>
Verify that a phase achieved its GOAL, not just completed its tasks. Spawns the `verifier` agent which performs goal-backward analysis and writes a `plans/{date}-verify/VERIFICATION.md` report.

**Verification mindset:** Task completion ≠ Goal achievement. A component can be "created" (task done) but be a placeholder (goal not achieved).
</objective>

<context>
Phase: $ARGUMENTS
</context>

<process>

## Step 1: Identify Phase to Verify

If `$ARGUMENTS` provides a phase number or name, use that.

Otherwise, read STATE.md to find the current phase:

```bash
cat docs/STATE.md | grep "Phase:"
```

Read the phase goal from ROADMAP.md:

```bash
cat docs/ROADMAP.md | grep -A 15 "### Phase"
```

## Step 2: Check for Previous Verification

```bash
ls plans/*-verify/VERIFICATION.md 2>/dev/null
```

If a VERIFICATION.md exists for this phase:
- Read it and check `status:` in frontmatter
- If `status: gaps_found` → RE-VERIFICATION mode (fixes were applied)
- Present: "Previous verification found gaps. Running re-verification to check fixes..."

## Step 3: Gather Context for Verifier

```bash
cat docs/ROADMAP.md
cat docs/SPEC.md
ls plans/*/SUMMARY.md 2>/dev/null | head -10
ls plans/ | grep -v templates | grep -v verify
```

## Step 4: Spawn Verifier Agent

Use the Task tool with `subagent_type="verifier"`. Provide:

```
<files_to_read>
docs/ROADMAP.md
docs/SPEC.md
plans/{date}-{plan}/SUMMARY.md (all relevant summaries)
</files_to_read>

Phase to verify: {phase name} (Phase {N})
Phase goal: {goal from ROADMAP.md}

Previous verification: {path to previous VERIFICATION.md if exists, or "none"}
```

The verifier agent will:
1. Extract must_haves from ROADMAP.md success criteria
2. Verify observable truths against the codebase
3. Check artifacts exist, are substantive, and are wired
4. Scan for anti-patterns (stubs, placeholders, TODO)
5. Write `plans/{date}-verify/VERIFICATION.md`
6. Return structured gaps in YAML frontmatter

## Step 5: Present Results

After verifier returns, read the VERIFICATION.md:

```bash
cat plans/*-verify/VERIFICATION.md | head -60
```

**If `status: passed`:**
```
✓ Phase {N} Verification: PASSED

Score: {N}/{M} truths verified
All artifacts exist, are substantive, and wired.
No blocker anti-patterns found.

Full report: plans/{date}-verify/VERIFICATION.md

## Next Step

/myai:plan — plan Phase {N+1}
```

**If `status: gaps_found`:**
```
✗ Phase {N} Verification: GAPS FOUND

Score: {N}/{M} truths verified

## Gaps

{gap list from VERIFICATION.md}

## Next Steps

1. /myai:plan — create fix plan for gaps above
2. After fixing: /myai:verify to re-verify
```

**If `status: human_needed`:**
```
? Phase {N} Verification: HUMAN REVIEW NEEDED

Automated checks passed, but these need human testing:

{human verification items}

Please test the items above, then run /myai:verify again.
```

## Step 6: Update STATE.md

Append verification result to Accumulated Decisions:

```
Verification Phase {N}: {passed/gaps_found} — {date}
```

If gaps found, add to Blockers section.

</process>

<success_criteria>
- [ ] Phase to verify identified
- [ ] Previous verification checked (re-verify mode if gaps were found)
- [ ] Context gathered for verifier agent
- [ ] verifier agent spawned with full context
- [ ] VERIFICATION.md written to plans/{date}-verify/
- [ ] Results clearly presented to user
- [ ] Next steps offered based on status
- [ ] docs/STATE.md updated
</success_criteria>
