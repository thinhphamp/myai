# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Role & Responsibilities

Your role is to analyze user requirements and ensure cohesive delivery of features that meet specifications and architectural standards.

## Workflows

- Primary workflow: `./.myai/rules/primary-workflow.md`
- Development rules: `./.myai/rules/development-rules.md`
- Orchestration protocols: `./.myai/rules/orchestration-protocol.md`
- Documentation management: `./.myai/rules/documentation-management.md`

**IMPORTANT:** Before planning or implementing, read `./docs/PROJECT.md` and `./docs/SPEC.md` for project context.
**IMPORTANT:** Before implementing or reviewing code, read `./docs/code-standards.md` if it exists.
**IMPORTANT:** Before planning, debugging, or when asked about the codebase, read `./docs/codebase-summary.md` if it exists.
**IMPORTANT:** Before architectural decisions or adding new services/modules, read `./docs/system-architecture.md` if it exists.
**IMPORTANT:** Before building UI components, styling, or design reviews, read `./docs/design-guidelines.md` if it exists.
**IMPORTANT:** Before deploying, writing CI/CD config, or making infra changes, read `./docs/deployment-guide.md` if it exists.
**IMPORTANT:** Follow the development rules strictly.
**IMPORTANT:** Sacrifice grammar for concision when writing reports.

## Project Brain (docs/)

```
docs/
├── PROJECT.md           # Vision, goals, tech stack, constraints
├── SPEC.md              # v1/v2/out-of-scope requirements
├── ROADMAP.md           # Phases with success criteria
├── STATE.md             # Active plan + decisions + blockers (auto-injected)
├── codebase-summary.md  # High-level codebase overview (on-demand)
├── code-standards.md    # Coding conventions and patterns (on-demand)
├── system-architecture.md  # Architecture and service design (on-demand)
├── design-guidelines.md    # UI/UX patterns and styling rules (on-demand)
└── deployment-guide.md     # Deploy, CI/CD, infra instructions (on-demand)
```

Read `docs/STATE.md` at session start to understand current project state. All other docs are read on-demand:

| Doc | Read when... |
|-----|-------------|
| `PROJECT.md` + `SPEC.md` | Before planning or implementing any feature |
| `code-standards.md` | Before implementing, reviewing, or refactoring code |
| `codebase-summary.md` | Before planning, debugging, or onboarding questions |
| `system-architecture.md` | Before architectural decisions or adding new services/modules |
| `design-guidelines.md` | Before building UI components, styling, or design reviews |
| `deployment-guide.md` | Before deploying, writing CI/CD config, or infra changes |

**For subagents:** When spawning agents via Task tool, include the relevant docs above in the agent prompt based on the task type. Agents do not inherit session context automatically.

## Plans (plans/)

Execution plans live in `plans/{date}-{slug}/`:
- `plan.md` — task list
- `PROGRESS.md` — session state
- `SUMMARY.md` — completion record

Plans come in two scopes:
- **Task plan** — a specific feature, fix, or chore. Lightweight: goal + tasks only. No phase required.
- **Phase plan** — a full ROADMAP phase. Includes `must_haves` frontmatter and phase linkage.

Default to task plan for any specific request. Only use phase plan when explicitly planning a ROADMAP phase.

## Available Agents (.myai/agents/)

- `brainstormer` — debates architectural decisions and trade-offs before implementation
- `planner` — creates implementation plans
- `researcher` — conducts technical research
- `fullstack-developer` — implements features
- `code-reviewer` — reviews code quality
- `tester` — writes and runs tests
- `debugger` — diagnoses bugs
- `docs-manager` — writes and maintains documentation
- `git-manager` — handles git workflows and commit strategy
- `ui-ux-designer` — designs UI components and flows
- `codebase-mapper` — maps and documents existing codebase structure
- `roadmapper` — defines and updates ROADMAP phases
- `verifier` — goal-backward phase verification after build
- `ops-manager` — manages versioning, changelog, and releases

## Plan Validation & Lifecycle

Before implementing, validate the plan to surface open questions:

```bash
myai validate               # print plan phases for review (CLI)
```

After completing task plans, archive to journal and clean up:

```bash
myai archive               # journal + archive task plans (CLI)
```

## Code Quality

- Keep files under 200 lines — split when larger
- Use kebab-case for file names (long descriptive names are fine)
- No TODO/FIXME/placeholder in delivered code
- Run compile check after every file change
- Never commit .env files or credentials
