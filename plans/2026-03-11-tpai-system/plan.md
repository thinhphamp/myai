# plan.md — myai CLI Tool

**Date:** 2026-03-11
**Status:** Complete

## Overview

`myai` is a personal AI workflow system — structured workflow, persistent project memory, and curated agents that work across Claude Code, OpenCode, Gemini CLI, and Codex.

It unifies the best of two source systems:

- **claude-code-skills** (`~/dev/claude-code-skills`) — skills, agents, hooks, rules, and CLI pattern
- **get-shit-done** (`~/dev/get-shit-done`) — project-level workflow, verifier/roadmapper/codebase-mapper agents, session state patterns

Published to GitHub Packages as `@thinhpham/myai`. Installs a `.myai/` system plus `docs/` brain layer into any target project. Supports Claude Code, OpenCode, Gemini CLI, and Codex.

**Core philosophy:** The complexity lives in the system, not the workflow. Users run slash commands. The system handles context engineering, session state, skill orchestration, and multi-runtime compatibility.

---

## Complete File Structure

```
myai/
├── package.json                         ← ESM, commander, name: @thinhpham/myai
├── .npmrc                               ← GitHub Packages registry
├── README.md
├── PUBLISHING.md
├── commitlint.config.cjs
├── vitest.config.js
│
├── bin/
│   └── myai.js                          ← CLI entry point
│
├── lib/
│   ├── commands/
│   │   ├── init.js                      ← copies .myai/ + docs/ templates to project
│   │   ├── update.js                    ← interactive merge + runtime propagation
│   │   ├── install.js                   ← multi-runtime installer
│   │   ├── validate.js                  ← print plan phases for review
│   │   └── discuss.js                   ← (removed, renamed to validate)
│   └── utils/
│       ├── logger.js                    ← chalk-based
│       ├── file-operations.js           ← copyDirRecursive, deepMergeJson
│       ├── diff-utils.js                ← getFileDiff
│       ├── prompt-helpers.js            ← conflict resolution
│       └── version-checker.js           ← compareVersions
│
├── scripts/
│   ├── postinstall.cjs                  ← auto-copy on npm install
│   ├── prepublish-check.cjs             ← pre-publish validation
│   └── build-hooks.js                   ← bundle hooks with esbuild
│
├── .myai/                               ← the system installed into target projects
│   ├── settings.json                    ← hooks config
│   ├── hooks/
│   │   ├── session-init.cjs             ← loads STATE.md + active PROGRESS.md
│   │   ├── dev-rules-reminder.cjs
│   │   ├── privacy-block.cjs
│   │   ├── post-edit-simplify-reminder.cjs
│   │   ├── usage-context-awareness.cjs
│   │   └── lib/                         ← shared hook utilities
│   ├── agents/                          ← 13 agent .md files
│   ├── commands/                        ← 9 slash commands
│   ├── skills/                          ← 30 curated skills
│   └── rules/                           ← 4 rule files
│
├── docs-templates/                      ← installed by myai:new-project
│   ├── PROJECT.md
│   ├── SPEC.md
│   ├── ROADMAP.md
│   └── STATE.md
│
├── plans-templates/
│   ├── plan.md
│   ├── phase-template.md
│   └── PROGRESS.md
│
├── runtime-templates/
│   ├── claude/CLAUDE.md
│   ├── opencode/opencode.json
│   ├── gemini/GEMINI.md
│   └── codex/AGENTS.md
│
└── tests/
    ├── init.test.js
    ├── update.test.js
    └── install.test.js
```

---

## Phases

### Phase 1: CLI Scaffold
**Goal:** Working `myai` binary with `init`, `update`, `install` commands registered as stubs.
**Status:** [x] Complete

Tasks:
- [x] Create `package.json` (ESM, Commander.js, inquirer, chalk, vitest)
- [x] Create `.npmrc` for GitHub Packages
- [x] Create `bin/myai.js`
- [x] Copy `lib/utils/` from CCS verbatim (logger, file-operations, diff-utils, prompt-helpers, version-checker)
- [x] Create `lib/commands/init.js`, `update.js`, `install.js`
- [x] Create `commitlint.config.cjs`, `vitest.config.js`
- [x] Verify `node bin/myai.js --help` works

---

### Phase 2: Docs Brain Layer
**Goal:** `myai init` installs `.myai/` skeleton and `docs/` brain layer.
**Status:** [x] Complete
**Depends on:** Phase 1

Tasks:
- [x] Create `docs-templates/PROJECT.md`
- [x] Create `docs-templates/SPEC.md`
- [x] Create `docs-templates/ROADMAP.md`
- [x] Create `docs-templates/STATE.md`
- [x] Create `plans-templates/PROGRESS.md`
- [x] Create `plans-templates/plan.md`
- [x] Create `plans-templates/phase-template.md`
- [x] Implement `lib/commands/init.js`

---

### Phase 3: Hook System
**Goal:** 5 hooks compiled and wired into `settings.json`. `session-init` loads STATE.md + PROGRESS.md.
**Status:** [x] Complete
**Depends on:** Phase 1

Tasks:
- [x] Copy `hooks/lib/*.cjs` verbatim from CCS
- [x] Copy 4 hooks verbatim: `dev-rules-reminder`, `privacy-block`, `post-edit-simplify-reminder`, `usage-context-awareness`
- [x] Write `session-init.cjs`
- [x] Create `.myai/settings.json`
- [x] Create `scripts/build-hooks.js`

**Key decision:** No binary. session-init reads STATE.md + PROGRESS.md directly.

---

### Phase 4: Skills Curation
**Goal:** 30 curated skills in `.myai/skills/`. All direct copies from CCS.
**Status:** [x] Complete
**Depends on:** Phase 1

Tasks:
- [x] Copy core skills: planning, cook, research, sequential-thinking, context-engineering, debug, fix, scout, code-review, mcp-management
- [x] Copy domain skills: frontend-development, web-frameworks, react-best-practices, ui-styling, frontend-design, backend-development, databases, better-auth, devops, web-testing, payment-integration, mobile-development, ai-multimodal, mcp-builder
- [x] Copy utility skills: docs-seeker, git, repomix, plans-kanban, mermaidjs-v11, brainstorm

---

### Phase 5: Agents
**Goal:** 13 agents in `.myai/agents/`.
**Status:** [x] Complete
**Depends on:** Phase 4

Tasks:
- [x] Copy 9 agents from CCS: planner, researcher, fullstack-developer, code-reviewer, tester, debugger, git-manager, docs-manager, ui-ux-designer
- [x] Adapt verifier, roadmapper, codebase-mapper from GSD
- [x] Add brainstormer agent (ported from CCS brainstormer)

---

### Phase 6: Slash Commands
**Goal:** 9 slash commands in `.myai/commands/`.
**Status:** [x] Complete
**Depends on:** Phase 4, Phase 5

Commands:
- [x] `myai:new-project.md`
- [x] `myai:plan.md` — task / phase / parallel scope
- [x] `myai:cook.md` — sequential + parallel multi-agent mode
- [x] `myai:progress.md`
- [x] `myai:pause.md`
- [x] `myai:resume.md`
- [x] `myai:verify.md`
- [x] `myai:validate.md` — interview-based pre-build validation
- [x] `myai:archive.md` — journal + archive task plans
- [x] `myai:kanban.md`

**Key decisions:**
- No binary for state ops — all direct file reads/writes by agents
- `myai:validate` = interview before build; `myai:verify` = goal check after build
- `myai:cook --parallel` spawns concurrent fullstack-developer agents

---

### Phase 7: Rules & Settings
**Goal:** 4 rule files, CLAUDE.md runtime template, finalized settings.json.
**Status:** [x] Complete
**Depends on:** Phase 6

Tasks:
- [x] Adapt 4 rules from CCS: development-rules, primary-workflow, orchestration-protocol, documentation-management
- [x] Create `runtime-templates/claude/CLAUDE.md`
- [x] Finalize `.myai/settings.json`

---

### Phase 8: Multi-Runtime Installer
**Goal:** `myai install` supports all 4 runtimes. `myai update` propagates to runtime dirs.
**Status:** [x] Complete
**Depends on:** Phase 7

Tasks:
- [x] Implement `lib/commands/install.js`
- [x] Claude Code: copy `.myai/` → `.claude/`, merge settings.json, copy CLAUDE.md
- [x] OpenCode: create `.opencode/`, write opencode.json
- [x] Gemini CLI: write GEMINI.md in project root
- [x] Codex: write AGENTS.md in project root
- [x] `--global` flag for user-level installation
- [x] `myai update` propagates commands/agents/skills/rules/hooks to `.claude/` and `.opencode/`

---

### Phase 9: Polish + README + Publish
**Goal:** Publishable to GitHub Packages. Tests pass.
**Status:** [x] Complete
**Depends on:** All phases

Tasks:
- [x] Write `README.md`
- [x] Write `PUBLISHING.md`
- [x] Write `scripts/postinstall.cjs`
- [x] Write `scripts/prepublish-check.cjs`
- [x] Write tests: `init.test.js`, `update.test.js`, `install.test.js`
- [x] Final validation: myai init, myai install --all, myai update

---

## Key Architectural Decisions

1. **No binary for state ops** — all state ops are direct file reads/writes by agents/hooks
2. **`.myai/` is the source** — `install` copies it to `.claude/`, `.opencode/`, etc. per runtime
3. **Skills are Claude Code-native** — other runtimes get agents + instruction files but not full skill system
4. **`docs/STATE.md` = project-level; `plans/{plan}/PROGRESS.md` = session-level**
5. **ESM throughout CLI/lib** — hooks stay `.cjs` (required by Claude Code hook system)
6. **`myai:validate` vs `myai:verify`** — validate = before build (plan interview); verify = after build (goal check)
7. **Parallel cook** — `myai:plan --parallel` + `myai:cook --parallel` spawns concurrent agents per phase file
