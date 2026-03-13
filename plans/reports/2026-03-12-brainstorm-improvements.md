# Brainstorm: myai Workflow Improvements

**Date:** 2026-03-12
**Status:** Concluded

---

## Topic 1: Should `/myai:cook` auto-offer `/myai:validate` before executing?

### Problem
Users can forget to validate before building. CCS's `plan/hard.md` offers validation at plan creation time. myai requires manual `/myai:validate`.

### Approaches Evaluated

**Option A: Cook checks for validation before executing**
- Pros: safety guardrail, catches open questions before code changes
- Cons: friction for all cook runs (even simple task plans), validates at wrong time (after plan, not at creation)

**Option B: Plan auto-offers validate at end of `/myai:plan` (like CCS)**
- Pros: natural flow (plan → validate → cook), matches CCS pattern, optional not mandatory
- Cons: `/myai:plan` gets slightly more complex

**Option C: Keep separate — user runs `/myai:validate` manually**
- Pros: no friction, simple, expert users not blocked
- Cons: easy to forget; no guardrail

### Decision

**Chosen: Option B — add post-plan validation offer to `/myai:plan`**

Add at end of `/myai:plan` process (after plan is written):
```
Validate this plan before building? (Recommended for phase and parallel plans)
- Yes → run /myai:validate
- No → show cook command and skip
```
Apply only to phase plans and parallel plans. Skip for task plans (too simple to warrant interview).

**Ruled out:**
- Option A: wrong time in flow, adds friction to every cook
- Option C (current): no guardrail, easy to forget

---

## Topic 2: Should `myai:progress` detect stale plans?

### Problem
Plans with `PROGRESS.md` but no `SUMMARY.md` that are weeks old are invisible debt — they're "in progress" forever. Progress doesn't flag them.

### Approaches Evaluated

**Option A: Stale detection with configurable threshold (e.g., 7 days)**
- Pros: surfaces hidden debt, prevents zombie plans
- Cons: requires checking file modification dates, threshold is arbitrary

**Option B: No stale detection, keep current**
- Pros: simple
- Cons: invisible zombie plans

**Option C: Stale detection on PROGRESS.md age (>7 days without SUMMARY.md)**
- Pros: simple date check, no config needed — 7 days is always "stale" for a dev workflow
- Cons: none significant

### Decision

**Chosen: Option C — stale detection on `PROGRESS.md` age**

In Step 3 of `myai:progress`:
- If `PROGRESS.md` modified >7 days ago and no `SUMMARY.md` → flag as "⚠ Stale (paused {N} days ago)"
- Show in status report under "Blockers" section if any stale plans found

**Ruled out:**
- Option A: configurable threshold adds complexity — 7 days is always stale

---

## Topic 3: Should there be a `/myai:scout` command?

### Problem
CCS has `/scout` for mapping the codebase before planning. myai has a `scout` skill but no dedicated slash command.

### Approaches Evaluated

**Option A: Add `/myai:scout` slash command**
- Pros: explicit codebase mapping, writes `plans/codebase/` for reuse, useful for large codebases
- Cons: adds another command, `/myai:plan` already uses scout skill internally

**Option B: Keep scout as skill only**
- Pros: no new surface area, planning already scouts automatically
- Cons: users can't force a fresh codebase map before planning

### Decision

**Not now. Keep scout as skill only.**

Rationale: `/myai:plan` already uses the scout skill when needed. The missing use case (force-refresh codebase map before planning) is a "nice to have" that affects <5% of sessions. YAGNI.

**Revisit when:** Users report that planning misses context in large codebases that already have stale codebase maps.

---

## Summary of Agreed Improvements

| # | Improvement | Action |
|---|-------------|--------|
| 1 | Post-plan validation offer in `/myai:plan` | Create task plan |
| 2 | Stale plan detection in `/myai:progress` | Create task plan |
| 3 | `/myai:scout` command | Defer — YAGNI |

## Next Steps

Two new task plans should be created:
1. `plans/2026-03-12-post-plan-validate/` — add validation offer at end of `/myai:plan`
2. `plans/2026-03-12-progress-stale-detection/` — add stale plan detection to `/myai:progress`
