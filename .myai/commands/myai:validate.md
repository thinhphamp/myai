---
name: myai:validate
description: Interview user with critical questions to validate a plan before building
argument-hint: "[plan-path or phase name]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
Interview the user with critical questions to validate assumptions, confirm decisions, and surface potential issues in a plan before coding begins. Documents answers in a Validation Log in plan.md.
</objective>

<context>
**Plan or phase:** $ARGUMENTS
</context>

<process>

## Step 1: Load the Plan

1. If `$ARGUMENTS` provided → use that path or match phase name
2. Else read active plan from STATE.md:
```bash
cat docs/STATE.md 2>/dev/null | grep "^Plan:" | head -1
```
3. If no plan found → ask user to run `/myai:plan` first

Read the plan:
```bash
cat {plan-path}/plan.md
```

## Step 2: Extract Question Topics

Scan plan content for decision points, assumptions, and risks:

| Category | Keywords to detect |
|----------|-------------------|
| **Architecture** | "approach", "pattern", "design", "structure", "database", "API" |
| **Assumptions** | "assume", "expect", "should", "will", "must", "default" |
| **Tradeoffs** | "vs", "alternative", "option", "choice", "either/or" |
| **Risks** | "risk", "might", "could fail", "dependency", "blocker" |
| **Scope** | "out of scope", "nice to have", "future", "MVP" |
| **Open Questions** | Any `## Open Questions` section in the plan |

Always surface items listed under `## Open Questions` — these are pre-flagged by the planner.

## Step 3: Generate Questions

For each detected topic, formulate a concrete question with 2-4 options:

- Mark the recommended option with "(Recommended)"
- Focus on decisions that would meaningfully change implementation
- Don't manufacture questions for obvious or trivial points

**Example:**
```
Category: Architecture
Question: "The plan uses a direct DB call from the route handler. Should this go through a service layer?"
Options:
1. Yes, add a service layer (Recommended) — better separation
2. No, keep it direct — simpler for this scope
```

## Step 4: Interview User

Use `AskUserQuestion` to present questions — max 4 per call, group related questions.

Aim for 3-6 questions total. If the plan is simple with few decisions, fewer is fine.

## Step 5: Document Answers

After collecting answers, append a Validation Log to `plan.md`. If a `## Validation Log` section already exists, **append** a new session block — never overwrite.

```markdown
## Validation Log

### Session {N} — {YYYY-MM-DD}
**Trigger:** {initial validation / re-validation after scope change / etc.}
**Questions asked:** {count}

#### Questions & Answers

1. **[{Category}]** {full question text}
   - Options: {A} | {B} | {C}
   - **Answer:** {user's choice}
   - **Rationale:** {why this matters for implementation}

#### Confirmed Decisions
- {decision}: {choice} — {brief why}

#### Action Items
- [ ] {specific change needed based on answers}
```

If answers require changes to the plan's task list, update them now.

## Step 6: Confirm

```
✓ Validation complete

{N} questions asked. Key decisions confirmed:
- {decision 1}
- {decision 2}

## Next Step

Run /myai:cook to execute this plan.
```

Remind user: run `/clear` before cooking to start with fresh context focused on implementation.

</process>

<important_notes>
- **IMPORTANT:** Only ask about genuine decision points — don't manufacture artificial choices.
- **IMPORTANT:** Always surface items from the plan's Open Questions section.
- **IMPORTANT:** Do NOT start implementing. Validation only.
- **IMPORTANT:** Sacrifice grammar for concision in the log.
</important_notes>

<success_criteria>
- [ ] Plan loaded (active or specified)
- [ ] Decision points, assumptions, risks, and open questions extracted
- [ ] 3-6 critical questions generated and asked via AskUserQuestion
- [ ] Answers documented in Validation Log in plan.md
- [ ] Plan tasks updated if answers require changes
- [ ] Next step (cook) confirmed to user
</success_criteria>
