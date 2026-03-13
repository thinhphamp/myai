# Changelog

All notable changes to this project will be documented in this file.

## [0.5.0] - 2026-03-13

### Added
- Cursor runtime support — `myai install --cursor` creates `.cursor/rules/main.mdc` with `alwaysApply: true`
- `--cursor` flag added to `myai init` and `myai install` commands
- `--all` now installs all 5 runtimes (claude, opencode, gemini, codex, cursor)

## [0.4.0] - 2026-03-13

### Changed
- Publish to public npm registry (`registry.npmjs.org`) — enables `npx @thinhpham/myai@latest init`
- Add GitHub Actions release workflow — auto-publishes on `v*.*.*` tag push

## [0.3.1] - 2026-03-13

### Fixed
- ops-manager: confirm production branch with user before collecting changes
- README: clarify `myai init` vs `myai install` — init does not wire runtimes

## [0.3.0] - 2026-03-13

### Added
- `ops-manager` agent — DevOps operations starting with version management (semver bump detection, changelog updates, releases)

## [0.2.1] - 2026-03-13

### Changed
- Remove unused folders from package
- Update .gitignore to exclude node_modules and build artifacts

## [0.2.0] - 2026-03-13

### Added
- `/myai:verify` slash command — goal-backward phase verification after build (spawns `verifier` agent)
- Parallel plan/cook support — phase files trigger concurrent multi-agent execution via `/myai:cook --parallel`
- `brainstormer` agent — debates architectural decisions and trade-offs before implementation

### Fixed
- Runtime templates (GEMINI.md, AGENTS.md) had duplicate `debugger` entry and only 7 of 13 agents listed — updated to full 13-agent roster
- Added `/myai:verify` to CLAUDE.md commands table
- README: clarified pre-build vs post-build distinction for `/myai:validate` and `/myai:verify`

### Changed
- `/myai:plan` now supports phase and parallel plan types in addition to task plans
- `/myai:cook` detects parallel plans via phase file presence and spawns concurrent agents

## [0.1.0] - 2026-03-11

### Added
- Initial release — myai workflow system for Claude Code, OpenCode, Gemini CLI, and Codex
- 13 agents: brainstormer, codebase-mapper, code-reviewer, debugger, docs-manager, fullstack-developer, git-manager, planner, researcher, roadmapper, tester, ui-ux-designer, verifier
- 30 skills across core, frontend, backend, testing, mobile, AI, payments, and utility categories
- 8 slash commands: `/myai:new-project`, `/myai:plan`, `/myai:cook`, `/myai:progress`, `/myai:pause`, `/myai:resume`, `/myai:validate`, `/myai:archive`
- 5 hooks: session-init loads project state; privacy-block protects sensitive files
- `docs/` brain layer: PROJECT.md, SPEC.md, ROADMAP.md, STATE.md
- Multi-runtime install: `myai init`, `myai install --claude/--opencode/--gemini/--codex/--all`
