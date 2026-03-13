# myai

Your personal AI workflow system for developers — structured workflow, persistent project memory, and curated agents that work across Claude Code, OpenCode, Gemini CLI, and Codex.

```
npm install -g @thinhpham/myai
```

## What It Is

Most AI coding tools are powerful but stateless — every session starts from scratch, plans live in chat history, and context gets lost. `myai` fixes that.

It installs a structured workflow system into any project:

- **Persistent memory** — `docs/` brain layer (PROJECT.md, SPEC.md, ROADMAP.md, STATE.md) injected into every session automatically
- **Structured workflow** — brainstorm → plan → validate → build → archive, not just "chat and hope"
- **13 agents** — brainstormer, planner, researcher, fullstack-developer, code-reviewer, tester, debugger, and more
- **30 skills** — domain expertise for React, Next.js, NestJS, databases, auth, payments, mobile, AI, and more
- **8 slash commands** — project lifecycle from first idea to shipping
- **5 hooks** — session-init loads your project state; privacy-block protects sensitive files
- **Multi-runtime** — one install, works with Claude Code, OpenCode, Gemini CLI, and Codex

## Quick Start

```bash
# 1. Install globally
npm install -g @thinhpham/myai

# 2. Initialize a project
cd your-project
myai init --claude     # copies .myai/ system + docs/ templates, wires hooks into .claude/

# 3. Open Claude Code — session-init hook loads your project state automatically

# 4. Use slash commands in Claude Code
/myai:new-project      # guided setup: creates PROJECT.md, SPEC.md, ROADMAP.md, STATE.md
/myai:plan [task]      # create an execution plan with skill auto-detection
/myai:validate         # interview-based validation — confirm open questions before building
/myai:cook             # execute the active plan
/myai:pause            # save session state
/myai:resume           # restore session from last pause
/myai:verify           # verify phase goal achievement after build
/myai:archive          # journal + archive completed task plans
/myai:progress         # check project status + route to next action
/myai:kanban           # visual plans dashboard
```

## Commands

| Command | Description |
|---------|-------------|
| `myai init` | Install `.myai/` system + `docs/` templates into current project |
| `myai install --claude` | Wire hooks into `.claude/` for Claude Code |
| `myai install --opencode` | Install for OpenCode |
| `myai install --gemini` | Create `GEMINI.md` for Gemini CLI |
| `myai install --codex` | Create `AGENTS.md` for Codex |
| `myai install --all` | Install for all runtimes |
| `myai install --global` | Install to user-level config dirs |
| `myai update` | Interactive merge of latest system files |
| `myai validate [phase]` | Print a plan phase to validate it matches requirements (defaults to latest plan) |
| `myai validate [phase] --plan <name>` | Validate a phase from a specific plan folder |

## Slash Commands (in Claude Code)

| Command | Description |
|---------|-------------|
| `/myai:new-project` | Initialize docs/ brain layer for a new project |
| `/myai:plan [task]` | Create a plan for a feature, fix, phase, or parallel multi-agent execution |
| `/myai:cook` | Execute active plan — sequential by default, `--parallel` spawns concurrent agents |
| `/myai:progress` | Project-wide status + smart routing to next action |
| `/myai:pause` | Save session state to `plans/{active}/PROGRESS.md` |
| `/myai:resume` | Restore session from PROGRESS.md + STATE.md |
| `/myai:validate [plan]` | Pre-build: interview-based validation — confirms open questions and decisions |
| `/myai:verify [phase]` | Post-build: goal-backward verification — checks phase goal achievement |
| `/myai:archive [plan]` | Write journal entries and archive completed task plans |
| `/myai:kanban` | Visual plans dashboard |

## Project Structure

After `myai init`:

```
your-project/
├── .myai/              # System files (managed by myai)
│   ├── agents/         # 13 specialized agents
│   ├── commands/       # 9 slash commands
│   ├── hooks/          # 5 session hooks
│   ├── rules/          # 4 rule files
│   ├── skills/         # 30 domain skills
│   └── settings.json   # Hook configuration
│
├── docs/               # Project brain (yours — myai never overwrites)
│   ├── PROJECT.md      # Vision, goals, tech stack, constraints
│   ├── SPEC.md         # v1/v2/out-of-scope requirements
│   ├── ROADMAP.md      # Phases with success criteria
│   └── STATE.md        # Active plan + decisions + blockers
│
└── plans/              # Execution plans (yours)
    └── {date}-{slug}/
        ├── plan.md     # Task list
        ├── PROGRESS.md # Session state (written by /myai:pause)
        └── SUMMARY.md  # Completion record
```

## Skills

Skills activate automatically based on task content:

| Category | Skills |
|----------|--------|
| **Core** | planning, research, sequential-thinking, context-engineering, debug, fix, scout, code-review |
| **Frontend** | frontend-development, react-best-practices, web-frameworks, ui-styling, frontend-design |
| **Backend** | backend-development, databases, better-auth, devops |
| **Testing** | web-testing |
| **Mobile** | mobile-development |
| **AI** | ai-multimodal, mcp-builder |
| **Payments** | payment-integration |
| **Utility** | docs-seeker, git, repomix, plans-kanban, mermaidjs-v11, brainstorm |

## Multi-Session Support

State is split across two levels so multiple concurrent sessions never conflict:

- **`docs/STATE.md`** — project-level: phase focus, key decisions, blockers (≤80 lines, injected every session)
- **`plans/{plan}/PROGRESS.md`** — session-level: current task, done/remaining, next action

Each feature branch gets its own plan. Pause one, start another, resume either — no conflicts.

## Supported Runtimes

| Runtime | Installation | Features |
|---------|-------------|----------|
| **Claude Code** | `myai install --claude` | Full: hooks, agents, skills, slash commands |
| **OpenCode** | `myai install --opencode` | Agents + instructions |
| **Gemini CLI** | `myai install --gemini` | Instructions (GEMINI.md) |
| **Codex** | `myai install --codex` | Instructions (AGENTS.md) |

## Requirements

- Node.js ≥ 18
- Claude Code (for full feature set)

## License

MIT
