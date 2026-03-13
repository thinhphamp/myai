# Documentation Management

## Brain Layer (docs/)

The `docs/` folder is the project brain — keep it current and accurate.

```
docs/
├── PROJECT.md           # Vision, goals, tech stack, constraints, key decisions
├── SPEC.md              # v1/v2/out-of-scope requirements with acceptance criteria
├── ROADMAP.md           # Phases with success criteria and progress tracking
├── STATE.md             # Active plan pointer + decisions + blockers (≤80 lines, auto-injected)
├── codebase-summary.md  # High-level codebase overview (on-demand)
├── code-standards.md    # Coding conventions and patterns (on-demand)
├── system-architecture.md  # Architecture and service design (on-demand)
├── design-guidelines.md    # UI/UX patterns and styling rules (on-demand)
└── deployment-guide.md     # Deploy, CI/CD, infra instructions (on-demand)
```

### On-Demand Read Rules

`STATE.md` is auto-injected every session. All other docs are read on-demand:

| Doc | Read when... |
|-----|-------------|
| `PROJECT.md` + `SPEC.md` | Before planning or implementing any feature |
| `code-standards.md` | Before implementing, reviewing, or refactoring code |
| `codebase-summary.md` | Before planning, debugging, or onboarding questions |
| `system-architecture.md` | Before architectural decisions or adding new services/modules |
| `design-guidelines.md` | Before building UI components, styling, or design reviews |
| `deployment-guide.md` | Before deploying, writing CI/CD config, or infra changes |

### Generating Deeper Docs

Use these commands to generate or sync the deeper docs/ files:

| Command | When to use |
|---------|-------------|
| `/docs:init` | First time — analyzes codebase and generates all deeper docs |
| `/docs:update [scope]` | After significant code changes — syncs affected docs only |

### Update Triggers

**docs/ROADMAP.md** — update when:
- A phase status changes (mark `[x]` when complete)
- Plans count changes (`Plans: N/M`)
- A new phase is added

**docs/STATE.md** — update when:
- Active plan changes (after `/myai:plan`, `/myai:pause`, plan completion)
- Key decisions are made during implementation
- Blockers are encountered or resolved
- After each session (keep current focus accurate)

**docs/PROJECT.md** — update when:
- Tech stack changes
- Core constraints change
- Significant architectural decisions are logged

**docs/SPEC.md** — update when:
- Requirements are clarified during implementation
- Out-of-scope items are identified
- Traceability table needs updating

### STATE.md Rules

- **Max 80 lines** — it's injected into every session via hook
- Keep only decisions that affect FUTURE work (remove resolved items)
- `Plan:` line must match an actual `plans/` directory or be `none`
- Clear blockers once resolved

## Plans Layer (plans/)

Plans live in `plans/` with date + slug naming:

```
plans/
├── 2026-03-11-feature-name/
│   ├── plan.md          # Task list + must_haves frontmatter
│   ├── PROGRESS.md      # Session state (written by /myai:pause)
│   └── SUMMARY.md       # Completion record (written by /myai:cook)
├── 2026-03-12-verify/
│   └── VERIFICATION.md  # Written by verifier agent
└── codebase/            # Written by codebase-mapper agent
    ├── STACK.md
    ├── ARCHITECTURE.md
    └── CONVENTIONS.md
```

### Plan File Rules

**plan.md:**
- Keep under 80 lines
- List phases/tasks with checkbox status
- Include `must_haves` frontmatter for verifier

**PROGRESS.md:**
- Written by `/myai:pause` at session end
- Read by `/myai:resume` and session-init hook
- Delete or clear after SUMMARY.md is written

**SUMMARY.md:**
- Written by `/myai:cook` on completion
- One-paragraph "What Was Built" section
- Files modified list
- Key decisions made during implementation

## Update Protocol

1. **Before updates**: Read current file content
2. **During updates**: Maintain consistent formatting
3. **After updates**: Verify cross-references (STATE.md Plan: path must exist)
4. **Quality check**: Ensure updates reflect actual implementation, not intentions
