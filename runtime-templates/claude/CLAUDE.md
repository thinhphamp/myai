# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Role & Responsibilities

Your role is to analyze user requirements, delegate tasks to appropriate sub-agents, and ensure cohesive delivery of features that meet specifications and architectural standards.

## Workflows

- Primary workflow: `./.myai/rules/primary-workflow.md`
- Development rules: `./.myai/rules/development-rules.md`
- Orchestration protocols: `./.myai/rules/orchestration-protocol.md`
- Documentation management: `./.myai/rules/documentation-management.md`

**IMPORTANT:** Analyze the skills catalog and activate the skills needed for the task.
**IMPORTANT:** Follow the development rules in `./.myai/rules/development-rules.md` strictly.
**IMPORTANT:** Before planning or implementing, read `./docs/PROJECT.md` and `./docs/SPEC.md` for project context.
**IMPORTANT:** Before implementing or reviewing code, read `./docs/code-standards.md` if it exists.
**IMPORTANT:** Before planning, debugging, or when asked about the codebase, read `./docs/codebase-summary.md` if it exists.
**IMPORTANT:** Before architectural decisions or adding new services/modules, read `./docs/system-architecture.md` if it exists.
**IMPORTANT:** Before building UI components, styling, or design reviews, read `./docs/design-guidelines.md` if it exists.
**IMPORTANT:** Before deploying, writing CI/CD config, or making infra changes, read `./docs/deployment-guide.md` if it exists.
**IMPORTANT:** Sacrifice grammar for concision when writing reports.
**IMPORTANT:** In reports, list any unresolved questions at the end.

## myai Commands

| Command | Purpose |
|---------|---------|
| `/myai:new-project` | Initialize docs/ brain layer for a new project |
| `/myai:plan [task]` | Create a plan for a feature, fix, phase, or parallel multi-agent execution |
| `/myai:cook` | Execute active plan — sequential by default, `--parallel` spawns concurrent agents |
| `/myai:progress` | Project-wide status + smart routing to next action |
| `/myai:pause` | Save session state to PROGRESS.md |
| `/myai:resume` | Restore session from PROGRESS.md + STATE.md |
| `/myai:validate [plan]` | Interview-based validation — confirms open questions and decisions before building |
| `/myai:verify [phase]` | Goal-backward verification — spawns verifier agent to check phase goal achievement |
| `/myai:archive [plan]` | Write journal entries and archive completed task plans |
| `/myai:kanban` | Visual plans dashboard |

## Hook Response Protocol

### Privacy Block Hook (`@@PRIVACY_PROMPT@@`)

When a tool call is blocked by the privacy-block hook, the output contains a JSON marker between `@@PRIVACY_PROMPT_START@@` and `@@PRIVACY_PROMPT_END@@`. **You MUST use the `AskUserQuestion` tool** to get proper user approval.

**Required Flow:**

1. Parse the JSON from the hook output
2. Use `AskUserQuestion` with the question data from the JSON
3. Based on user's selection:
   - **"Yes, approve access"** → Use `bash cat "filepath"` to read the file (bash is auto-approved)
   - **"No, skip this file"** → Continue without accessing the file

**Example AskUserQuestion call:**
```json
{
  "questions": [{
    "question": "I need to read \".env\" which may contain sensitive data. Do you approve?",
    "header": "File Access",
    "options": [
      { "label": "Yes, approve access", "description": "Allow reading .env this time" },
      { "label": "No, skip this file", "description": "Continue without accessing this file" }
    ],
    "multiSelect": false
  }]
}
```

**IMPORTANT:** Always ask the user via `AskUserQuestion` first. Never work around the privacy block without explicit user approval.

## Python Scripts (Skills)

When running Python scripts from `.myai/skills/`, use the venv Python interpreter:
- **macOS/Linux:** `.myai/skills/.venv/bin/python3 scripts/xxx.py`
- **Windows:** `.myai\skills\.venv\Scripts\python.exe scripts\xxx.py`

This ensures packages installed by `install.sh` are available.

**IMPORTANT:** When scripts fail, don't stop — try to fix them directly.

## Modularization

- If a code file exceeds 200 lines, consider modularizing it
- Check existing modules before creating new ones
- Use kebab-case naming with long descriptive names (self-documenting for LLM tools)
- Write descriptive code comments
- After modularization, continue with the main task
- When NOT to modularize: Markdown files, plain text, bash scripts, config files, env files

## Documentation

The `docs/` folder is the project brain:

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

Keep `docs/STATE.md` updated after each session. It is auto-injected every session via the session-init hook. All other docs are read on-demand:

| Doc | Read when... |
|-----|-------------|
| `PROJECT.md` + `SPEC.md` | Before planning or implementing any feature |
| `code-standards.md` | Before implementing, reviewing, or refactoring code |
| `codebase-summary.md` | Before planning, debugging, or onboarding questions |
| `system-architecture.md` | Before architectural decisions or adding new services/modules |
| `design-guidelines.md` | Before building UI components, styling, or design reviews |
| `deployment-guide.md` | Before deploying, writing CI/CD config, or infra changes |

**For subagents:** When spawning agents via Task tool, include the relevant docs above in the agent prompt based on the task type. Agents do not inherit session context automatically.
