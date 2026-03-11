# plan.md — tpai CLI Tool

**Date:** 2026-03-11
**Status:** In Progress

## Overview

`tpai` is a meta-prompting, context engineering, and spec-driven development CLI tool that unifies the best of two source systems:

- **claude-code-skills** (`~/dev/claude-code-skills`) — skills, agents, hooks, rules, and CLI pattern
- **get-shit-done** (`~/dev/get-shit-done`) — project-level workflow, verifier/roadmapper/codebase-mapper agents, session state patterns

Published to GitHub Packages as `@thinhpham/tpai`. Installs a `.tpai/` system plus `docs/` brain layer into any target project. Supports Claude Code, OpenCode, Gemini CLI, and Codex.

**Core philosophy:** The complexity lives in the system, not the workflow. Users run 8 slash commands. The system handles context engineering, session state, skill orchestration, and multi-runtime compatibility.

---

## Complete File Structure

```
tpai/
├── package.json                         ← ESM, commander, name: @thinhpham/tpai
├── .npmrc                               ← GitHub Packages registry
├── README.md
├── CHANGELOG.md
├── PUBLISHING.md
├── commitlint.config.cjs
├── vitest.config.js
│
├── bin/
│   └── tpai.js                          ← CLI entry point
│
├── lib/
│   ├── commands/
│   │   ├── init.js                      ← copies .tpai/ + docs/ templates to project
│   │   ├── update.js                    ← interactive merge
│   │   └── install.js                   ← multi-runtime installer
│   └── utils/
│       ├── logger.js                    ← chalk-based (copy from CCS)
│       ├── file-operations.js           ← copyDirRecursive, deepMergeJson (copy from CCS)
│       ├── diff-utils.js                ← getFileDiff (copy from CCS)
│       ├── prompt-helpers.js            ← conflict resolution (copy from CCS)
│       └── version-checker.js           ← compareVersions (copy from CCS)
│
├── scripts/
│   ├── postinstall.cjs                  ← auto-copy on npm install (adapt from CCS)
│   ├── prepublish-check.cjs             ← pre-publish validation
│   └── build-hooks.js                   ← bundle hooks with esbuild (adapt from GSD)
│
├── .tpai/                               ← the system installed into target projects
│   ├── settings.json                    ← hooks config
│   ├── hooks/
│   │   ├── session-init.cjs             ← loads STATE.md + active PROGRESS.md (adapt from CCS)
│   │   ├── dev-rules-reminder.cjs       ← (copy from CCS)
│   │   ├── privacy-block.cjs            ← (copy from CCS)
│   │   ├── post-edit-simplify-reminder.cjs  ← (copy from CCS)
│   │   ├── usage-context-awareness.cjs  ← (copy from CCS)
│   │   └── lib/                         ← shared hook utilities (copy from CCS)
│   ├── agents/                          ← 12 agent .md files
│   ├── commands/                        ← 8 slash commands
│   ├── skills/                          ← 29 curated skills
│   └── rules/                           ← 4 rule files
│
├── docs-templates/                      ← installed by tp:new-project
│   ├── PROJECT.md
│   ├── SPEC.md                          ← NEW: v1/v2/out-of-scope
│   ├── ROADMAP.md
│   └── STATE.md
│
├── plans-templates/
│   ├── plan.md
│   ├── phase-template.md
│   └── PROGRESS.md                      ← NEW: session state per plan
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
**Goal:** Working `tpai` binary with `init`, `update`, `install` commands registered as stubs.
**Status:** [ ] Pending

Tasks:
- [ ] Create `package.json` (ESM, Commander.js, inquirer, chalk, vitest)
- [ ] Create `.npmrc` for GitHub Packages
- [ ] Create `bin/tpai.js` (adapt from CCS `bin/gkim-claude.js`)
- [ ] Copy `lib/utils/` from CCS verbatim (logger, file-operations, diff-utils, prompt-helpers, version-checker)
- [ ] Create `lib/commands/init.js`, `update.js`, `install.js` as stubs
- [ ] Create `commitlint.config.cjs`, `vitest.config.js`
- [ ] Verify `node bin/tpai.js --help` works

**Copy from:** `CCS/bin/gkim-claude.js`, `CCS/lib/utils/*`

---

### Phase 2: Docs Brain Layer
**Goal:** `tpai init` installs `.tpai/` skeleton and `docs/` brain layer.
**Status:** [ ] Pending
**Depends on:** Phase 1

Tasks:
- [ ] Create `docs-templates/PROJECT.md` (adapt from GSD, strip XML wrappers)
- [ ] Create `docs-templates/SPEC.md` (NEW — v1/v2/out-of-scope structure)
- [ ] Create `docs-templates/ROADMAP.md` (adapt from GSD)
- [ ] Create `docs-templates/STATE.md` (adapt from GSD, strip velocity metrics, add Active Plan pointer)
- [ ] Create `plans-templates/PROGRESS.md` (NEW — session state per plan)
- [ ] Create `plans-templates/plan.md` (adapt from CCS feature template)
- [ ] Create `plans-templates/phase-template.md` (adapt from CCS)
- [ ] Implement `lib/commands/init.js` (adapt from CCS, add docs/ install, remove GitHub App auth)

**Copy from:** `CCS/lib/commands/init.js`, `GSD/templates/*`, `CCS/plans/templates/*`

---

### Phase 3: Hook System
**Goal:** 5 hooks compiled and wired into `settings.json`. `session-init` loads STATE.md + PROGRESS.md.
**Status:** [ ] Pending
**Depends on:** Phase 1

Tasks:
- [ ] Copy `hooks/lib/*.cjs` verbatim from CCS
- [ ] Copy 4 hooks verbatim: `dev-rules-reminder`, `privacy-block`, `post-edit-simplify-reminder`, `usage-context-awareness`
- [ ] Write `session-init.cjs` (adapt from CCS — add STATE.md + PROGRESS.md injection, remove cleanupOrphanedShadowedSkills)
- [ ] Create `.tpai/settings.json` (adapt from CCS, update paths `.claude/` → `.tpai/`)
- [ ] Create `scripts/build-hooks.js` (adapt from GSD)

**Key decision:** No `gsd-tools.cjs` binary. session-init reads STATE.md + PROGRESS.md directly.

---

### Phase 4: Skills Curation
**Goal:** 29 curated skills in `.tpai/skills/`. All direct copies from CCS.
**Status:** [ ] Pending
**Depends on:** Phase 1

Tasks:
- [ ] Copy 10 core skills: planning, cook, research, sequential-thinking, context-engineering, debug, fix, scout, code-review, mcp-management
- [ ] Copy 14 domain skills: frontend-development, web-frameworks, react-best-practices, ui-styling, frontend-design, backend-development, databases, better-auth, devops, web-testing, payment-integration, mobile-development, ai-multimodal, mcp-builder
- [ ] Copy 5 utility skills: docs-seeker, git, repomix, plans-kanban, mermaidjs-v11, brainstorm

**Note:** Exclude common/ (CCS-internal). Skills referencing Python scripts: include scripts, user sets up venv manually.

---

### Phase 5: Agents
**Goal:** 12 agents in `.tpai/agents/`. 9 copied from CCS, 3 adapted from GSD.
**Status:** [ ] Pending
**Depends on:** Phase 4

Tasks:
- [ ] Copy 9 agents from CCS: planner, researcher, fullstack-developer, code-reviewer, tester, debugger, git-manager, docs-manager, ui-ux-designer
- [ ] Adapt `gsd-verifier.md` → `verifier.md` (update paths `.planning/` → `plans/`, remove gsd-tools calls)
- [ ] Adapt `gsd-roadmapper.md` → `roadmapper.md` (update spawning context, output to docs/SPEC.md + docs/ROADMAP.md)
- [ ] Adapt `gsd-codebase-mapper.md` → `codebase-mapper.md` (update paths, remove gsd-tools)

---

### Phase 6: Slash Commands (8 Total)
**Goal:** 8 slash commands in `.tpai/commands/`.
**Status:** [ ] Pending
**Depends on:** Phase 4, Phase 5

Commands:
- [ ] `tp-new-project.md` — creates docs/ brain layer (adapt from GSD new-project.md + CCS bootstrap.md)
- [ ] `tp-plan.md` — planning with project context + skill auto-detection (adapt from CCS plan.md)
- [ ] `tp-cook.md` — skill-aware execution with domain auto-activation (NEW — skill detection table)
- [ ] `tp-progress.md` — project-wide status (adapt from GSD progress.md)
- [ ] `tp-pause.md` — saves session to PROGRESS.md + STATE.md (adapt from GSD pause-work.md)
- [ ] `tp-resume.md` — restores from PROGRESS.md + STATE.md (adapt from GSD resume-project.md)
- [ ] `tp-verify.md` — goal-backward verification (adapt from GSD verify-phase.md)
- [ ] `tp-kanban.md` — visual dashboard phases + plans (adapt from CCS kanban.md)

**Key decision:** No gsd-tools binary. All state ops are direct file reads/writes by agents.

---

### Phase 7: Rules & Settings
**Goal:** 4 rule files, CLAUDE.md runtime template, finalized settings.json.
**Status:** [ ] Pending
**Depends on:** Phase 6

Tasks:
- [ ] Adapt 4 rules from CCS: development-rules, primary-workflow, orchestration-protocol, documentation-management
- [ ] Create `runtime-templates/claude/CLAUDE.md` (adapt from CCS CLAUDE.md, add tp: commands, update paths)
- [ ] Finalize `.tpai/settings.json`

---

### Phase 8: Multi-Runtime Installer
**Goal:** `tpai install` supports all 4 runtimes.
**Status:** [ ] Pending
**Depends on:** Phase 7

Tasks:
- [ ] Implement `lib/commands/install.js` (adapt from GSD install.js pattern)
- [ ] Claude Code: copy `.tpai/` → `.claude/`, write settings.json, copy CLAUDE.md
- [ ] OpenCode: create `.opencode/`, write opencode.json with agent registrations
- [ ] Gemini CLI: write GEMINI.md in project root
- [ ] Codex: write AGENTS.md in project root
- [ ] Add `--global` flag for user-level installation
- [ ] Wire install command in `bin/tpai.js`

---

### Phase 9: Polish + README + Publish
**Goal:** Publishable to GitHub Packages. Tests pass.
**Status:** [ ] Pending
**Depends on:** All phases

Tasks:
- [ ] Write `README.md`
- [ ] Write `PUBLISHING.md`
- [ ] Write `scripts/postinstall.cjs` (adapt from CCS)
- [ ] Write `scripts/prepublish-check.cjs` (validate 29 skills, 12 agents, 8 commands)
- [ ] Write tests: `init.test.js`, `update.test.js`, `install.test.js`
- [ ] Add `files` array to `package.json`
- [ ] Final validation: tpai init, tpai install --all, tpai update
- [ ] `npm publish`

---

## What to Copy vs Build New

### Direct Copy (no modification)
| Source | Destination |
|---|---|
| `CCS/.claude/skills/` (29 curated) | `.tpai/skills/` |
| `CCS/.claude/agents/` (9 agents) | `.tpai/agents/` |
| `CCS/.claude/hooks/lib/*.cjs` | `.tpai/hooks/lib/` |
| `CCS/.claude/hooks/dev-rules-reminder.cjs` | `.tpai/hooks/` |
| `CCS/.claude/hooks/privacy-block.cjs` | `.tpai/hooks/` |
| `CCS/.claude/hooks/post-edit-simplify-reminder.cjs` | `.tpai/hooks/` |
| `CCS/.claude/hooks/usage-context-awareness.cjs` | `.tpai/hooks/` |
| `CCS/lib/utils/*` | `lib/utils/` |

### Adapt (copy then modify)
| Source | Destination | Key Changes |
|---|---|---|
| `CCS/bin/gkim-claude.js` | `bin/tpai.js` | Rename binary, remove CCS-specific commands |
| `CCS/.claude/hooks/session-init.cjs` | `.tpai/hooks/session-init.cjs` | Add STATE.md + PROGRESS.md injection |
| `CCS/.claude/settings.json` | `.tpai/settings.json` | Paths `.claude/` → `.tpai/` |
| `CCS/.claude/rules/*.md` | `.tpai/rules/` | Remove CCS-specific refs |
| `CCS/CLAUDE.md` | `runtime-templates/claude/CLAUDE.md` | Add tp: commands, update paths |
| `CCS/lib/commands/init.js` | `lib/commands/init.js` | Remove GitHub App auth, add docs/ install |
| `GSD/agents/gsd-verifier.md` | `.tpai/agents/verifier.md` | Remove gsd- prefix, update paths |
| `GSD/agents/gsd-roadmapper.md` | `.tpai/agents/roadmapper.md` | Update spawning context + output paths |
| `GSD/agents/gsd-codebase-mapper.md` | `.tpai/agents/codebase-mapper.md` | Update paths, remove gsd-tools |
| `GSD/templates/project.md` | `docs-templates/PROJECT.md` | Strip XML wrappers |
| `GSD/templates/roadmap.md` | `docs-templates/ROADMAP.md` | Remove decimal-phase complexity |
| `GSD/templates/state.md` | `docs-templates/STATE.md` | Strip velocity metrics, add Active Plan pointer |
| `GSD/workflows/new-project.md` | `.tpai/commands/tp-new-project.md` | Remove gsd-tools, update paths |
| `GSD/workflows/pause-work.md` | `.tpai/commands/tp-pause.md` | Remove gsd-tools, update paths |
| `GSD/workflows/resume-project.md` | `.tpai/commands/tp-resume.md` | Remove gsd-tools, update paths |
| `GSD/workflows/progress.md` | `.tpai/commands/tp-progress.md` | Remove gsd-tools, update paths |
| `GSD/workflows/verify-phase.md` | `.tpai/commands/tp-verify.md` | Spawn verifier agent |
| `CCS/.claude/commands/kanban.md` | `.tpai/commands/tp-kanban.md` | Update paths |
| `CCS/.claude/commands/plan.md` | `.tpai/commands/tp-plan.md` | Add STATE.md context loading, skill auto-detection |
| `GSD/scripts/build-hooks.js` | `scripts/build-hooks.js` | Update entry/output paths |
| `GSD/bin/install.js` (pattern) | `lib/commands/install.js` | Rewrite ESM, tpai agent names |

### Write New
| File | Why |
|---|---|
| `docs-templates/SPEC.md` | v1/v2/out-of-scope structure unique to tpai |
| `plans-templates/PROGRESS.md` | Session-per-plan state (no GSD equivalent) |
| `.tpai/commands/tp-cook.md` | Skill auto-detection table is unique to tpai |
| `README.md`, `PUBLISHING.md` | tpai-specific |
| `tests/*.test.js` | All new |

---

## Key Architectural Decisions

1. **No `gsd-tools.cjs` binary** — all state ops are direct file reads/writes by agents/hooks
2. **`.tpai/` is the source** — `install` copies it to `.claude/`, `.opencode/`, etc. per runtime
3. **Skills are Claude Code-native** — other runtimes get agents + instruction files but not full skill system
4. **`docs/STATE.md` = project-level; `plans/{plan}/PROGRESS.md` = session-level**
5. **ESM throughout CLI/lib** — hooks stay `.cjs` (required by Claude Code hook system)
